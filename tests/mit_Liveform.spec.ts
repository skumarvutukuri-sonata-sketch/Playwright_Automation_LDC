import { test, expect } from '@playwright/test';

const targetUrl = 'https://mit-online.getsmarter.com/presentations/info/mit-blockchain-technologies-online-short-course/';

test('MIT info page - validate Register button and stop', async ({ page }) => {
  test.setTimeout(120_000);

  await page.goto(targetUrl, { waitUntil: 'domcontentloaded' });
  await page.waitForLoadState('networkidle', { timeout: 20_000 }).catch(() => undefined);

  const registerButton = page.locator('button, a, [role="button"]').filter({ hasText: /register/i }).first();
  await expect(registerButton).toBeVisible({ timeout: 20_000 });

  console.log('Register button is visible and validated. Stopping script execution.');

  await page.close();
  test.skip();
});
