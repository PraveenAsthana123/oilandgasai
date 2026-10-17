import { test, expect } from '@playwright/test';
test.describe('Upstream Process Pages', () => {
  test('POSITIVE: /upstream/drilling/process-flow loads 10-tab page', async ({ page }) => {
    await page.goto('/upstream/drilling/process-flow');
    await page.waitForLoadState('networkidle');
    const body = await page.textContent('body');
    expect(body).toMatch(/lifecycle|NPT|casing|well control/i);
  });
  test('POSITIVE: /upstream/processes loads master flow', async ({ page }) => {
    await page.goto('/upstream/processes');
    await page.waitForLoadState('networkidle');
    const body = await page.textContent('body');
    expect(body?.length).toBeGreaterThan(200);
  });
  test('POSITIVE: /upstream/drilling/process SVG renders', async ({ page }) => {
    await page.goto('/upstream/drilling/process');
    await page.waitForLoadState('networkidle');
    const svgs = await page.locator('svg').count();
    expect(svgs).toBeGreaterThan(0);
  });
  test('NEGATIVE: tab click does not crash page', async ({ page }) => {
    await page.goto('/upstream/drilling/process-flow');
    await page.waitForLoadState('networkidle');
    const tabs = page.locator('button').filter({ hasText: /NPT|cost|wellbore/i });
    if (await tabs.count() > 0) {
      await tabs.first().click();
      await page.waitForTimeout(500);
      const errors = await page.locator('[data-error], .error').count();
      expect(errors).toBe(0);
    }
  });
});
