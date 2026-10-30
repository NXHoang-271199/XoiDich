import 'dotenv/config';
import { defineConfig } from 'vitest/config';

// E2E tests use the same DB server as the app but a separate database and Redis DB,
// never the dev data: TEST_DB_DATABASE (must end in _test) and TEST_REDIS_DB.
export const testDbDatabase = process.env.TEST_DB_DATABASE ?? 'xoidich_test';
export const testRedisDb = process.env.TEST_REDIS_DB ?? '1';

export default defineConfig({
  resolve: { tsconfigPaths: true },
  test: {
    globals: true,
    root: './',
    include: ['test/**/*.e2e-spec.ts'],
    globalSetup: './test/global-setup.ts',
    env: {
      NODE_ENV: 'test',
      LOG_LEVEL: 'silent',
      LOG_DIR: '',
      DB_DATABASE: testDbDatabase,
      REDIS_DB: testRedisDb,
    },
    fileParallelism: false,
  },
});
