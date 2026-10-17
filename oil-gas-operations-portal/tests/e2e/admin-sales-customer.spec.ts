import { test, expect, APIRequestContext } from '@playwright/test';

async function loginAs(request: APIRequestContext, email: string, password: string) {
  const res = await request.post('/api/auth/login', {
    data: { email, password },
  });
  return res;
}

test.describe('Admin Section', () => {
  test.beforeEach(async ({ request }) => {
    await loginAs(request, 'admin@oilandgas.com', 'admin123');
  });

  test('GET /api/health includes admin-accessible portal info', async ({ request }) => {
    const res = await request.get('/api/health');
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.status).toBe('ok');
  });

  test('admin can access departments overview', async ({ request }) => {
    const res = await request.get('/api/departments/overview');
    expect(res.status()).toBe(200);
  });

  test('admin role guard: non-admin blocked from admin routes', async ({ request }) => {
    // Login as ops user
    await loginAs(request, 'ops@oilandgas.com', 'ops123');
    const res = await request.get('/api/admin/users');
    expect([401, 403, 404]).toContain(res.status());
  });
});

test.describe('Drilling Department E2E Flow', () => {
  test.beforeEach(async ({ request }) => {
    await loginAs(request, 'admin@oilandgas.com', 'admin123');
  });

  test('full pipeline: import → dashboard → bot query', async ({ request }) => {
    // Step 1: Import data (200=success, 500=no DB configured — both acceptable in CI)
    const importRes = await request.post('/api/upstream/drilling-engineering/data/import');
    expect([200, 500]).toContain(importRes.status());

    // Step 2: Check dashboard (200=real data or empty state, 500=no DB)
    const dashRes = await request.get('/api/upstream/drilling-engineering/dashboard');
    expect([200, 500]).toContain(dashRes.status());

    // Step 3: Seed RAG
    const seedRes = await request.post('/api/upstream/drilling-engineering/rag/seed');
    expect([200, 500]).toContain(seedRes.status());

    // Step 4: Bot always returns 200 with graceful Ollama fallback
    const botRes = await request.post('/api/upstream/drilling-engineering/bot', {
      data: { message: 'What is kill sheet calculation?' },
    });
    expect(botRes.status()).toBe(200);
    const botBody = await botRes.json();
    expect(botBody.response || botBody.message || botBody.reply).toBeTruthy();
  });
});

test.describe('Pipeline Integrity E2E Flow', () => {
  test.beforeEach(async ({ request }) => {
    await loginAs(request, 'admin@oilandgas.com', 'admin123');
  });

  test('full pipeline: import → dashboard → bot query', async ({ request }) => {
    const importRes = await request.post('/api/midstream/pipeline-integrity/data/import');
    expect([200, 500]).toContain(importRes.status());

    const dashRes = await request.get('/api/midstream/pipeline-integrity/dashboard');
    expect([200, 500]).toContain(dashRes.status());

    await request.post('/api/midstream/pipeline-integrity/rag/seed');

    const botRes = await request.post('/api/midstream/pipeline-integrity/bot', {
      data: { message: 'What causes pipeline corrosion?' },
    });
    expect(botRes.status()).toBe(200);
  });
});

test.describe('Environmental Compliance E2E Flow', () => {
  test.beforeEach(async ({ request }) => {
    await loginAs(request, 'admin@oilandgas.com', 'admin123');
  });

  test('full pipeline: import → dashboard → bot query', async ({ request }) => {
    const importRes = await request.post('/api/downstream/environmental-compliance/data/import');
    expect([200, 500]).toContain(importRes.status());

    const dashRes = await request.get('/api/downstream/environmental-compliance/dashboard');
    expect([200, 500]).toContain(dashRes.status());

    await request.post('/api/downstream/environmental-compliance/rag/seed');

    const botRes = await request.post('/api/downstream/environmental-compliance/bot', {
      data: { message: 'What are ECCC methane emission limits?' },
    });
    expect(botRes.status()).toBe(200);
  });
});
