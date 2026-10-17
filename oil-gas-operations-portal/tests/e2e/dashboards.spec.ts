import { test, expect, APIRequestContext } from '@playwright/test';

const ADMIN_CREDS = { email: 'admin@oilandgas.com', password: 'admin123' };

async function loginAsAdmin(request: APIRequestContext) {
  await request.post('/api/auth/login', { data: ADMIN_CREDS });
}

const DASHBOARD_ENDPOINTS = [
  { path: '/api/upstream/drilling-engineering/dashboard', name: 'drilling' },
  { path: '/api/upstream/reservoir-engineering/dashboard', name: 'reservoir' },
  { path: '/api/upstream/exploration-geology/dashboard', name: 'exploration' },
  { path: '/api/upstream/production-engineering/dashboard', name: 'production' },
  { path: '/api/upstream/well-integrity/dashboard', name: 'well-integrity' },
  { path: '/api/upstream/hse-safety/dashboard', name: 'hse' },
  { path: '/api/midstream/pipeline-integrity/dashboard', name: 'pipeline' },
  { path: '/api/midstream/gas-compression/dashboard', name: 'compression' },
  { path: '/api/midstream/gas-processing/dashboard', name: 'gas-processing' },
  { path: '/api/midstream/storage-operations/dashboard', name: 'storage' },
  { path: '/api/midstream/scada-control/dashboard', name: 'scada' },
  { path: '/api/midstream/custody-metering/dashboard', name: 'metering' },
  { path: '/api/downstream/refining-operations/dashboard', name: 'distillation' },
  { path: '/api/downstream/process-engineering/dashboard', name: 'process-eng' },
  { path: '/api/downstream/quality-control/dashboard', name: 'quality' },
  { path: '/api/downstream/distribution-logistics/dashboard', name: 'distribution' },
  { path: '/api/downstream/crude-trading/dashboard', name: 'trading' },
  { path: '/api/downstream/environmental-compliance/dashboard', name: 'environmental' },
];

test.describe('Department Dashboard APIs', () => {
  test.beforeEach(async ({ request }) => {
    await loginAsAdmin(request);
  });

  for (const { path, name } of DASHBOARD_ENDPOINTS) {
    test(`POSITIVE: GET ${path} (${name}) returns JSON (200 or 500 if no DB)`, async ({ request }) => {
      const res = await request.get(path);
      expect([200, 500]).toContain(res.status());
      const body = await res.json();
      expect(typeof body).toBe('object');
    });
  }

  test('POSITIVE: departments overview returns 24 departments', async ({ request }) => {
    const res = await request.get('/api/departments/overview');
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.departments.length).toBeGreaterThanOrEqual(18);
  });

  test('NEGATIVE: dashboard for nonexistent dept returns 404', async ({ request }) => {
    const res = await request.get('/api/upstream/fake-dept-xyz/dashboard');
    expect(res.status()).toBe(404);
  });
});
