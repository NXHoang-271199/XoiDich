import { execSync } from 'node:child_process';
import { Redis } from 'ioredis';
import pg from 'pg';
import { testDbDatabase, testRedisDb } from '../vitest.config.e2e.js';

/**
 * Brings the test database up to the latest migration, empties every table and the test Redis DB.
 * Refuses to run against a database not named `*_test` or the app's own Redis DB.
 */
export default async function setup(): Promise<void> {
  const e = process.env;
  if (!testDbDatabase.endsWith('_test')) {
    throw new Error(`Refusing to wipe "${testDbDatabase}": e2e tests only run on a database named *_test`);
  }
  if (testRedisDb === (e.REDIS_DB ?? '0')) {
    throw new Error('Refusing to flush Redis: TEST_REDIS_DB must differ from REDIS_DB');
  }

  execSync('pnpm exec prisma migrate deploy', {
    stdio: 'inherit',
    env: { ...e, DB_DATABASE: testDbDatabase },
  });

  const client = new pg.Client({
    host: e.DB_HOST,
    port: Number(e.DB_PORT ?? 5432),
    user: e.DB_USERNAME,
    password: e.DB_PASSWORD,
    database: testDbDatabase,
  });
  await client.connect();
  try {
    const { rows } = await client.query<{ tablename: string }>(
      "SELECT tablename FROM pg_tables WHERE schemaname = 'public' AND tablename <> '_prisma_migrations'",
    );
    if (rows.length > 0) {
      const tables = rows.map((r) => `"${r.tablename}"`).join(', ');
      await client.query(`TRUNCATE ${tables} RESTART IDENTITY CASCADE`);
    }
  } finally {
    await client.end();
  }

  const redis = new Redis({
    host: e.REDIS_HOST,
    port: Number(e.REDIS_PORT ?? 6379),
    password: e.REDIS_PASSWORD || undefined,
    db: Number(testRedisDb),
  });
  await redis.flushdb();
  await redis.quit();
}
