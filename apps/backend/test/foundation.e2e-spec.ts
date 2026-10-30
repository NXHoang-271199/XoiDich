import type { NestExpressApplication } from '@nestjs/platform-express';
import request from 'supertest';
import { createTestApp } from './create-test-app.js';

describe('Foundation (e2e)', () => {
  let app: NestExpressApplication;

  beforeAll(async () => {
    app = await createTestApp();
  });

  afterAll(async () => {
    await app.close();
  });

  it('GET /api/health reports the database is reachable', async () => {
    await request(app.getHttpServer()).get('/api/health').expect(200, { status: 'ok' });
  });

  it('returns unknown routes in the standard error shape', async () => {
    const res = await request(app.getHttpServer()).get('/api/v1/does-not-exist').expect(404);
    expect(res.body).toEqual({
      error: { statusCode: 404, code: 'NOT_FOUND', message: 'Cannot GET /api/v1/does-not-exist' },
    });
  });

  it('sends security headers', async () => {
    const res = await request(app.getHttpServer()).get('/api/health');
    expect(res.headers['x-content-type-options']).toBe('nosniff');
    expect(res.headers['x-powered-by']).toBeUndefined();
  });

  it('allows the frontend origin with credentials', async () => {
    const res = await request(app.getHttpServer())
      .get('/api/health')
      .set('Origin', process.env.FRONTEND_URL ?? '');
    expect(res.headers['access-control-allow-origin']).toBe(process.env.FRONTEND_URL);
    expect(res.headers['access-control-allow-credentials']).toBe('true');
  });
});
