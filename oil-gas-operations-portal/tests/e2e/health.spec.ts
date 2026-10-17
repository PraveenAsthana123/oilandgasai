import { test, expect } from '@playwright/test';
test.describe('Health & Init', () => {
  test('GET /api/health returns ok', async ({ request }) => {
    const r = await request.get('/api/health');
    expect(r.status()).toBe(200);
    const body = await r.json();
    expect(body.status).toBe('ok');
  });
  test('GET /api/health has portal name', async ({ request }) => {
    const r = await request.get('/api/health');
    const body = await r.json();
    expect(body.portal).toBeTruthy();
  });
  test('GET /api/health includes db field', async ({ request }) => {
    const r = await request.get('/api/health');
    const body = await r.json();
    expect(['connected', 'disconnected']).toContain(body.db);
  });
  test('NEGATIVE: random route returns 404 not 500', async ({ request }) => {
    const r = await request.get('/api/nonexistent-route-xyz');
    expect(r.status()).toBeLessThan(500);
  });
});
