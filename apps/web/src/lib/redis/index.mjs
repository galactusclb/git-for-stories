import { createClient } from "redis";

const REDIS_URL = process.env.REDIS_URL;
const PREFIX = process.env.CACHE_PREFIX ?? 'sc:nextcache:';

const REVALIDATED_TAGS = `${PREFIX}revalidatedAt`;

const client = createClient({ url: REDIS_URL });
client.connect().catch(console.error);

const localTagTimestamps = new Map();
const pendingSets = new Map();

function isTagStale(tag, entryTimestamp) {
    const invalidateAt = localTagTimestamps.get(tag);
    return invalidateAt !== undefined && invalidateAt > entryTimestamp;
}

async function drainStream(stream) {
    const reader = stream.getReader();
    const chunks = [];
    try {
        while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            chunks.push(value);
        }
    } finally {
        reader.releaseLock();
    }
    return Buffer.concat(chunks.map((c) => Buffer.from(c)));
}

function bufferToStream(buffer) {
    return new ReadableStream({
        start(controller) {
            controller.enqueue(new Uint8Array(buffer));
            controller.close();
        },
    });
}

const cache = {
  async get(cacheKey, softTags) {
    // Wait for any in-flight set for this key.
    const pendingPromise = pendingSets.get(cacheKey);
    if (pendingPromise) await pendingPromise;

    let raw;
    try {
      raw = await client.get(PREFIX + cacheKey);
    } catch (err) {
      console.error('[cache-handler] redis get failed:', err);
      return undefined;
    }
    if (!raw) return undefined;

    const data = JSON.parse(raw);

    // Check if expired
    const now = Date.now()
    if (now > data.timestamp + data.revalidate * 1000) {
      return undefined;
    }

    // Tag-level invalidation: any tag revalidated since this entry was written?
    const allTags = [...(data.tags ?? []), ...(softTags ?? [])];
    for (const tag of allTags) {
      if (isTagStale(tag, data.timestamp)) return undefined;
    }

    return {
        ...data,
        value: bufferToStream(Buffer.from(data.value, 'base64')),
    };
  },

  async set(cacheKey, pendingEntry) {
    let resolvePending;
    const pendingPromise = new Promise((resolve) => { resolvePending = resolve; });
    pendingSets.set(cacheKey, pendingPromise);

    try {
      // pendingEntry is a Promise<CacheEntry>; 
      const entry = await pendingEntry;
      const buffer = await drainStream(entry.value);

      const payload = JSON.stringify({
        ...entry,
        value: buffer.toString('base64')
      });

      // entry.expire is a duration in SECONDS; Redis EX option also takes seconds.
      if (Number.isFinite(entry.expire) && entry.expire > 0) {
        await client.set(PREFIX + cacheKey, payload, { EX: Math.ceil(entry.expire) });
      } else {
        await client.set(PREFIX + cacheKey, payload);
      }
    } catch (err) {
      console.error('[cache-handler] set failed:', err);
    } finally {
      resolvePending();
      pendingSets.delete(cacheKey);
    }
  },

  async refreshTags() {
    // Pull all tag invalidation timestamps into local memory for the upcoming request.
    try {
      const all = await client.hGetAll(REVALIDATED_TAGS);
      localTagTimestamps.clear();
      for (const [tag, ts] of Object.entries(all)) {
        localTagTimestamps.set(tag, Number(ts));
      }
    } catch (err) {
      console.error('[cache-handler] refreshTags failed:', err);
    }
  },

  async getExpiration(tags) {
    let max = 0;
    for (const tag of tags) {
      const ts = localTagTimestamps.get(tag);
      if (ts && ts > max) max = ts;
    }
    return max;
  },

  async updateTags(tags, _durations) {
    if (!tags.length) return;
    const now = Date.now();
    const fields = Object.fromEntries(tags.map((t) => [t, String(now)]));
    try {
      await client.hSet(REVALIDATED_TAGS, fields);
    } catch (err) {
      console.error('[cache-handler] updateTags failed:', err);
    }
    // Update local map immediately so this instance sees the invalidation before refreshTags().
    for (const tag of tags) {
      localTagTimestamps.set(tag, now);
    }
  },
};

export default cache;
