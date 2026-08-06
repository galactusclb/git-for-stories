import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { readReplicas } from '@prisma/extension-read-replicas';
import { Pool } from 'pg';

import { getRDSAuthToken, TOKEN_TTL } from '@/lib/aws/rds';
import { traceAsync } from '@/lib/aws/xray';
import { PrismaClient } from '@/prisma/client';

const DB_USER = process.env.DB_USER!;
const DB_NAME = process.env.DB_NAME!;
const DB_PORT = parseInt(process.env.DB_PORT ?? '5432');
const RDS_PROXY_ENDPOINT = process.env.RDS_PROXY_ENDPOINT!;

const mainAdapter = new PrismaPg(resolveDBConnection(RDS_PROXY_ENDPOINT));

const mainClient = new PrismaClient({ adapter: mainAdapter });

const replicaAdapter = new PrismaPg(resolveDBConnection(RDS_PROXY_ENDPOINT));

const readClient = new PrismaClient({ adapter: replicaAdapter });

const prisma = mainClient
    .$extends(
        readReplicas({
            replicas: [readClient],
        })
    )
    .$extends({
        query: {
            $allModels: {
                async $allOperations({ model, operation, args, query }) {
                    return await traceAsync(`db:${model}.${operation}`, () => query(args));
                },
            },
        },
    });

function createPool(host: string, password: string | (() => string | Promise<string>)) {
    const pool = new Pool({
        host,
        user: DB_USER,
        database: DB_NAME,
        port: DB_PORT,
        ssl: { rejectUnauthorized: true },
        password,

        // for connection recyceling
        maxLifetimeSeconds: TOKEN_TTL, //Keep as 1min less than or more not to exceed the IAM token TTL (15min)
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 10000,
    });

    pool.on('error', (err) => console.error('[pg] idle client error', err.message));

    return pool;
}

export function resolveDBConnection(host?: string): string | Pool {
    if (process.env.DATABASE_URL) return process.env.DATABASE_URL!;

    if (process.env.DB_PASSWORD) return createPool(host!, process.env.DB_PASSWORD);

    return createPool(host!, getRDSAuthToken);
}

export type PrismaTransactionClient = Omit<
    typeof prisma,
    | '$connect'
    | '$disconnect'
    | '$on'
    | '$transaction'
    | '$use'
    | '$extends'
    | '$primary'
    | '$replica'
>;

export default prisma;
