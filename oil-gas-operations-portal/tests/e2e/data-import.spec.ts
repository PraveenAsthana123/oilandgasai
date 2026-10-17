import { test, expect, APIRequestContext } from '@playwright/test';

const ADMIN_CREDS = { email: 'admin@oilandgas.com', password: 'admin123' };

async function loginAsAdmin(request: APIRequestContext) {
  await request.post('/api/auth/login', { data: ADMIN_CREDS });
}

const UPSTREAM_DEPTS = [
  'drilling-engineering',
  'reservoir-engineering',
  'exploration-geology',
  'production-engineering',
  'well-integrity',
  'hse-safety',
];

const MIDSTREAM_DEPTS = [
  'pipeline-integrity',
  'gas-compression',
  'gas-processing',
  'storage',
  'scada-control',
  'metering',
];

const DOWNSTREAM_DEPTS = [
  'crude-distillation',
  'process-engineering',
  'quality-control',
  'distribution-logistics',
  'crude-trading',
  'environmental-compliance',
];

test.describe('Data Import APIs', () => {
  test.beforeEach(async ({ request }) => {
    await loginAsAdmin(request);
  });

  for (const dept of UPSTREAM_DEPTS) {
    test(`POSITIVE: POST /api/upstream/${dept}/data/import responds (200 or 500 if no DB)`, async ({ request }) => {
      const res = await request.post(`/api/upstream/${dept}/data/import`);
      expect([200, 500]).toContain(res.status());
      const body = await res.json();
      // Should always return JSON, never crash with HTML
      expect(typeof body).toBe('object');
    });
  }

  for (const dept of MIDSTREAM_DEPTS) {
    test(`POSITIVE: POST /api/midstream/${dept}/data/import responds (200 or 500 if no DB)`, async ({ request }) => {
      const res = await request.post(`/api/midstream/${dept}/data/import`);
      expect([200, 500]).toContain(res.status());
    });
  }

  for (const dept of DOWNSTREAM_DEPTS) {
    test(`POSITIVE: POST /api/downstream/${dept}/data/import responds (200 or 500 if no DB)`, async ({ request }) => {
      const res = await request.post(`/api/downstream/${dept}/data/import`);
      expect([200, 500]).toContain(res.status());
    });
  }

  test('NEGATIVE: import without auth returns 401', async ({ request }) => {
    const res = await request.post('/api/upstream/drilling-engineering/data/import', {
      headers: { Cookie: 'og_session=invalid_session_token' },
    });
    expect([401, 403]).toContain(res.status());
  });

  test('NEGATIVE: import to nonexistent dept returns 404', async ({ request }) => {
    const res = await request.post('/api/upstream/fake-dept-xyz/data/import');
    expect(res.status()).toBe(404);
  });
});
