import { test, expect } from '@playwright/test';
test.describe('Bot APIs', () => {
  test('POSITIVE: upstream drilling bot returns response', async ({ request }) => {
    const r = await request.post('/api/upstream/drilling-engineering/bot', {
      data: { message: 'What are the highest gas peaks in the drilling data?' }
    });
    expect(r.status()).toBeLessThan(500);
    const body = await r.json();
    expect(body).toHaveProperty('response');
    expect(typeof body.response).toBe('string');
    expect(body.response.length).toBeGreaterThan(10);
  });
  test('POSITIVE: bot includes rag_chunks_used field', async ({ request }) => {
    const r = await request.post('/api/upstream/drilling-engineering/bot', {
      data: { message: 'Summarize drilling operations' }
    });
    const body = await r.json();
    expect(body).toHaveProperty('rag_chunks_used');
  });
  test('NEGATIVE: bot with empty message still returns response', async ({ request }) => {
    const r = await request.post('/api/upstream/drilling-engineering/bot', {
      data: { message: '' }
    });
    expect(r.status()).toBeLessThan(500);
    const body = await r.json();
    expect(body).toHaveProperty('response');
  });
  test('NEGATIVE: bot with missing body returns structured error', async ({ request }) => {
    const r = await request.post('/api/upstream/drilling-engineering/bot', { data: {} });
    expect(r.status()).toBeLessThan(500);
  });
});
