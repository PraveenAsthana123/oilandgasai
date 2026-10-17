import { test, expect } from '@playwright/test';
test.describe('Main Dashboard', () => {
  test('POSITIVE: dashboard loads with title', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/Oil|Gas|Portal|Operations/i);
  });
  test('POSITIVE: dashboard has nav sidebar', async ({ page }) => {
    await page.goto('/');
    const nav = page.locator('nav, aside, [role="navigation"]');
    await expect(nav.first()).toBeVisible({ timeout: 10000 });
  });
  test('POSITIVE: no JavaScript console errors on load', async ({ page }) => {
    const errors: string[] = [];
    page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    expect(errors.filter(e => !e.includes('favicon'))).toHaveLength(0);
  });
  test('NEGATIVE: 404 page shows not found', async ({ page }) => {
    await page.goto('/this-page-does-not-exist-xyz');
    const body = await page.textContent('body');
    expect(body).toMatch(/not found|404|error/i);
  });
});
