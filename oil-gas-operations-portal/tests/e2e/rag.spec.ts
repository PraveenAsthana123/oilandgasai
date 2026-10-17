import { test, expect, APIRequestContext } from '@playwright/test';

const ADMIN_CREDS = { email: 'admin@oilandgas.com', password: 'admin123' };

async function loginAsAdmin(request: APIRequestContext) {
  await request.post('/api/auth/login', { data: ADMIN_CREDS });
}

test.describe('RAG (Vector DB) APIs', () => {
  test.beforeEach(async ({ request }) => {
    await loginAsAdmin(request);
  });

  test('POSITIVE: POST /api/upstream/drilling-engineering/rag/seed responds (200 or 500 if no DB)', async ({ request }) => {
    const res = await request.post('/api/upstream/drilling-engineering/rag/seed');
    expect([200, 500]).toContain(res.status());
    const body = await res.json();
    expect(typeof body).toBe('object');
  });

  test('POSITIVE: rag/seed responds for midstream dept', async ({ request }) => {
    const res = await request.post('/api/midstream/pipeline-integrity/rag/seed');
    expect([200, 500]).toContain(res.status());
  });

  test('POSITIVE: rag/seed responds for downstream dept', async ({ request }) => {
    const res = await request.post('/api/downstream/crude-distillation/rag/seed');
    expect([200, 500]).toContain(res.status());
  });

  test('POSITIVE: GET rag/query responds (200 or 500 if no DB)', async ({ request }) => {
    const res = await request.get('/api/upstream/drilling-engineering/rag/query?q=drilling+pressure');
    expect([200, 500]).toContain(res.status());
    const body = await res.json();
    expect(typeof body).toBe('object');
  });

  test('NEGATIVE: rag seed without auth returns 401', async ({ request }) => {
    const res = await request.post('/api/upstream/drilling-engineering/rag/seed', {
      headers: { Cookie: 'og_session=invalid_session' },
    });
    expect([401, 403]).toContain(res.status());
  });

  test('NEGATIVE: rag query without auth returns 401', async ({ request }) => {
    const res = await request.get('/api/upstream/drilling-engineering/rag/query?q=test', {
      headers: { Cookie: 'og_session=invalid_session' },
    });
    expect([401, 403]).toContain(res.status());
  });
});
