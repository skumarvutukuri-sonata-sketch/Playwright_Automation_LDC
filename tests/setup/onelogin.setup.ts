import { test as setup } from '@playwright/test';
import { LoginPage } from '../../pages/login.page';
import * as dotenv from 'dotenv';
dotenv.config();
import * as path from 'path';

const storageStatePath = path.resolve(__dirname, 'storageState.json');

setup('login and save session', async ({ page }) => {
  setup.setTimeout(360000);
  console.log('=== SETUP: Please accept the MFA push notification on your phone ===');

  const loginPage = new LoginPage(page);
  await page.goto(process.env.Taxi_Staging_URL!);
  await loginPage.valid_login(process.env.EMAIL!, process.env.USERNAME!, process.env.PASSWORD!);

  // MFA handoff can be slow; wait for either Taxi landing or OneLogin portal completion state.
  await page.waitForURL(/taxi\.stg\.mktg\.2u\.com|2u\.onelogin\.com/i, { timeout: 240000 });

  // If OneLogin keeps you on portal after MFA approval, force navigation back to Taxi.
  if (/onelogin\.com/i.test(page.url())) {
    await page.goto(process.env.Taxi_Staging_URL!);
  }

  await page.waitForURL(/taxi\.stg\.mktg\.2u\.com/i, { timeout: 120000 });
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(3000);

  // Save the authenticated session to file — all tests will reuse this
  await page.context().storageState({ path: storageStatePath });
  console.log('=== SETUP: Session saved to storageState.json — tests will reuse this login ===');
});
