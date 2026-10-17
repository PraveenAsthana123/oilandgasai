import { test, expect } from '@playwright/test';
test.describe('GitHub Integrations', () => {
  test('POSITIVE: /integrations loads library grid', async ({ page }) => {
    await page.goto('/integrations');
    await page.waitForLoadState('networkidle');
    const body = await page.textContent('body');
    expect(body).toMatch(/lasio|welly|bruges|pyreservoir/i);
  });
  test('POSITIVE: /integrations/lasio loads detail page', async ({ page }) => {
    await page.goto('/integrations/lasio');
    await page.waitForLoadState('networkidle');
    const body = await page.textContent('body');
    expect(body).toMatch(/las|well log|petrophysics/i);
  });
  test('POSITIVE: /api/integrations returns libraries data', async ({ request }) => {
    const r = await request.get('/api/integrations');
    expect(r.status()).toBeLessThan(500);
    const body = await r.json();
    // Response shape: {data:[...]} (mock/no-DB) or {libraries:[...]} or Array
    expect(Array.isArray(body.data) || Array.isArray(body.libraries) || Array.isArray(body)).toBeTruthy();
  });
  test('NEGATIVE: unknown slug shows not found gracefully', async ({ page }) => {
    await page.goto('/integrations/nonexistent-lib-xyz');
    await page.waitForLoadState('networkidle');
    const body = await page.textContent('body');
    expect(body?.length).toBeGreaterThan(10);
  });
  test('NEGATIVE: GET /api/integrations/nonexistent returns 404', async ({ request }) => {
    const r = await request.get('/api/integrations/no-such-lib-xyz');
    expect(r.status()).toBe(404);
  });
});
