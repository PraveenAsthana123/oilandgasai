import { test, expect } from '@playwright/test';

const ADMIN_CREDS = { email: 'admin@oilandgas.com', password: 'admin123' };

const DEPTS = [
  { slug: 'drilling-engineering', stream: 'upstream' },
  { slug: 'reservoir-engineering', stream: 'upstream' },
  { slug: 'pipeline-integrity', stream: 'midstream' },
  { slug: 'gas-compression', stream: 'midstream' },
  { slug: 'crude-trading', stream: 'downstream' },
  { slug: 'environmental-compliance', stream: 'downstream' },
];

test.describe('Department Pages (UI)', () => {
  test.beforeEach(async ({ page }) => {
    // Login via UI — go to login page and authenticate
    await page.goto('/login');
    await page.waitForLoadState('networkidle');
    const emailInput = page.locator('input[type="email"], input[name="email"]').first();
    const passwordInput = page.locator('input[type="password"]').first();
    await emailInput.fill(ADMIN_CREDS.email);
    await passwordInput.fill(ADMIN_CREDS.password);
    await page.locator('button[type="submit"], button:has-text("Login"), button:has-text("Sign in")').first().click();
    await page.waitForURL(url => !url.toString().includes('/login'), { timeout: 10000 }).catch(() => {});
  });

  for (const dept of DEPTS) {
    test(`POSITIVE: ${dept.stream}/${dept.slug}/dashboard loads`, async ({ page }) => {
      await page.goto(`/${dept.stream}/${dept.slug}/dashboard`);
      await page.waitForLoadState('networkidle');
      const body = await page.textContent('body');
      expect(body?.length).toBeGreaterThan(100);
      expect(body).not.toMatch(/internal server error/i);
    });

    test(`POSITIVE: ${dept.stream}/${dept.slug}/bot loads chat UI`, async ({ page }) => {
      await page.goto(`/${dept.stream}/${dept.slug}/bot`);
      await page.waitForLoadState('networkidle');
      const hasInput = await page.locator('input, textarea').count();
      expect(hasInput).toBeGreaterThan(0);
    });

    test(`POSITIVE: ${dept.stream}/${dept.slug}/rag loads`, async ({ page }) => {
      await page.goto(`/${dept.stream}/${dept.slug}/rag`);
      await page.waitForLoadState('networkidle');
      const body = await page.textContent('body');
      expect(body?.length).toBeGreaterThan(50);
    });
  }
});

test.describe('Departments Overview API', () => {
  test.beforeEach(async ({ request }) => {
    await request.post('/api/auth/login', { data: ADMIN_CREDS });
  });

  test('POSITIVE: departments overview has departments array', async ({ request }) => {
    const r = await request.get('/api/departments/overview');
    expect(r.status()).toBe(200);
    const body = await r.json();
    expect(body).toHaveProperty('departments');
    expect(Array.isArray(body.departments)).toBeTruthy();
  });

  test('POSITIVE: overview covers all 3 streams', async ({ request }) => {
    const r = await request.get('/api/departments/overview');
    const body = await r.json();
    const streams = body.departments.map((d: { stream: string }) => d.stream.toLowerCase());
    expect(streams.some((s: string) => s.includes('upstream'))).toBeTruthy();
    expect(streams.some((s: string) => s.includes('midstream'))).toBeTruthy();
    expect(streams.some((s: string) => s.includes('downstream'))).toBeTruthy();
  });

  test('NEGATIVE: unauthenticated request to departments API returns 401', async ({ request }) => {
    // Make a fresh request without the session cookie
    const r = await request.get('/api/departments/overview', {
      headers: { Cookie: 'og_session=invalid_value' },
    });
    expect([401, 403]).toContain(r.status());
  });
});
