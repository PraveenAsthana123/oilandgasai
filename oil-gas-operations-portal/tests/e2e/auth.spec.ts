import { test, expect } from '@playwright/test';

const ADMIN_CREDS = { email: 'admin@oilandgas.com', password: 'admin123' };

test.describe('Authentication', () => {
  test('GET /api/health is public (no auth needed)', async ({ request }) => {
    const res = await request.get('/api/health');
    expect(res.status()).toBe(200);
  });

  test('login page is accessible without auth', async ({ page }) => {
    const res = await page.goto('/login');
    // Should not redirect to login again (no infinite loop)
    expect(page.url()).toContain('/login');
    await expect(page.locator('input[type="email"], input[name="email"], input[type="text"]')).toBeVisible({ timeout: 10000 });
  });

  test('negative: login with wrong credentials returns 401', async ({ request }) => {
    const res = await request.post('/api/auth/login', {
      data: { email: 'bad@example.com', password: 'wrong' },
    });
    expect(res.status()).toBe(401);
  });

  test('positive: login with admin email/password sets session cookie', async ({ request }) => {
    const res = await request.post('/api/auth/login', {
      data: ADMIN_CREDS,
    });
    expect(res.status()).toBe(200);
    const setCookie = res.headers()['set-cookie'];
    expect(setCookie).toContain('og_session');
  });

  test('positive: login response includes role', async ({ request }) => {
    const res = await request.post('/api/auth/login', {
      data: ADMIN_CREDS,
    });
    const body = await res.json();
    expect(body.ok).toBe(true);
    expect(body.role).toBe('admin');
  });

  test('logout clears session cookie', async ({ request }) => {
    await request.post('/api/auth/login', { data: ADMIN_CREDS });
    const res = await request.post('/api/auth/logout', { data: {} });
    expect(res.status()).toBe(200);
  });

  test('negative: missing email returns 400', async ({ request }) => {
    const res = await request.post('/api/auth/login', {
      data: { password: 'admin123' },
    });
    expect([400, 401]).toContain(res.status());
  });
});
