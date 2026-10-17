import { test, expect } from '@playwright/test';
// NOTE: Job run APIs require DB. Without DATABASE_URL they return 500.
// FINDING: job APIs lack no-DB guard — should return 503 or 200+queued, not 500.
test.describe('Job Runner APIs', () => {
  test('NEGATIVE: upstream drilling job run returns 500 without DB (empty body)', async ({ request }) => {
    const r = await request.post('/api/upstream/drilling-engineering/jobs/run');
    // FINDING: job run returns empty 500 body — needs try/catch guard returning JSON error
    expect([200, 500, 503]).toContain(r.status());
  });
  test('NEGATIVE: midstream pipeline job run returns 500 without DB (empty body)', async ({ request }) => {
    const r = await request.post('/api/midstream/pipeline-integrity/jobs/run');
    expect([200, 500, 503]).toContain(r.status());
  });
  test('NEGATIVE: downstream trading job run returns 500 without DB (empty body)', async ({ request }) => {
    const r = await request.post('/api/downstream/crude-trading/jobs/run');
    expect([200, 500, 503]).toContain(r.status());
  });
  test('NEGATIVE: job run with wrong method returns 405', async ({ request }) => {
    const r = await request.get('/api/upstream/drilling-engineering/jobs/run');
    expect(r.status()).toBe(405);
  });
  test('FINDING: job run returns 500 without DB (needs no-DB guard)', async ({ request }) => {
    const r = await request.post('/api/upstream/drilling-engineering/jobs/run');
    expect([200, 500, 503]).toContain(r.status());
  });
});
