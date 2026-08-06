type CacheObj = {
    redis_fresh_ttl: number;
    redis_stale_ttl: number;
    header_max_age: number;
    header_s_max_age: number;
    header_swr: number;
};

export const DEFAULT_CACHE: CacheObj = {
    redis_fresh_ttl: 30,
    redis_stale_ttl: 300,
    header_max_age: 10,
    header_s_max_age: 30,
    header_swr: 15,
};

export const cacheConfig = {
    post: {
        list: {
            ...DEFAULT_CACHE,
        },
        single: {
            ...DEFAULT_CACHE,
        },
    },
} satisfies Record<string, Record<string, CacheObj>>;

export function toCacheControlHeader(c: CacheObj): string {
    return `public, max-age=${c.header_max_age}, s-maxage=${c.header_s_max_age}, stale-while-revalidate=${c.header_swr}`;
}
