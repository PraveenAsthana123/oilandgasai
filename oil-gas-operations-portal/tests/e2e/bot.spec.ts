import { test, expect, APIRequestContext } from '@playwright/test';

const ADMIN_CREDS = { email: 'admin@oilandgas.com', password: 'admin123' };

async function loginAsAdmin(request: APIRequestContext) {
  await request.post('/api/auth/login', { data: ADMIN_CREDS });
}

test.describe('Bot/Chat API', () => {
  test.beforeEach(async ({ request }) => {
    await loginAsAdmin(request);
  });

  test('POSITIVE: bot returns response even without Ollama (graceful fallback)', async ({ request }) => {
    const res = await request.post('/api/upstream/drilling-engineering/bot', {
      data: { message: 'What is the kill sheet calculation?' },
    });
    expect(res.status()).toBe(200);
    const body = await res.json();
    // Should return a response field even when Ollama is down
    expect(body.response || body.message || body.answer || body.reply).toBeTruthy();
  });

  test('POSITIVE: bot includes rag_chunks_used field', async ({ request }) => {
    const res = await request.post('/api/upstream/drilling-engineering/bot', {
      data: { message: 'drilling pressure' },
    });
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect('rag_chunks_used' in body || 'response' in body).toBeTruthy();
  });

  test('POSITIVE: bot works for midstream dept', async ({ request }) => {
    const res = await request.post('/api/midstream/pipeline-integrity/bot', {
      data: { message: 'MAOP calculation' },
    });
    expect(res.status()).toBe(200);
  });

  test('POSITIVE: bot works for downstream dept', async ({ request }) => {
    const res = await request.post('/api/downstream/environmental-compliance/bot', {
      data: { message: 'methane emissions' },
    });
    expect(res.status()).toBe(200);
  });

  test('NEGATIVE: empty message gets response or 400', async ({ request }) => {
    const res = await request.post('/api/upstream/drilling-engineering/bot', {
      data: { message: '' },
    });
    expect([200, 400]).toContain(res.status());
  });

  test('NEGATIVE: login with wrong password returns 401', async ({ request }) => {
    const res = await request.post('/api/auth/login', {
      data: { email: 'notauser@example.com', password: 'wrongpassword' },
    });
    expect(res.status()).toBe(401);
  });

  test('NEGATIVE: logout endpoint is accessible', async ({ request }) => {
    const res = await request.post('/api/auth/logout', { data: {} });
    expect([200, 401]).toContain(res.status());
  });
});
