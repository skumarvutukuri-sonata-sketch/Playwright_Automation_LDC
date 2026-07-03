import { test as setup } from '@playwright/test';
import { LoginPage } from '../../pages/login.page';
import * as dotenv from 'dotenv';
dotenv.config();
import * as path from 'path';

const storageStatePath = path.resolve(__dirname, 'storageState.json');

setup('login and save session', async ({ page }) => {
  setup.setTimeout(180000);
  console.log('=== SETUP: Please accept the MFA push notification on your phone ===');

  const loginPage = new LoginPage(page);
  await page.goto(process.env.Taxi_Staging_URL!);
  await loginPage.valid_login(process.env.EMAIL!, process.env.USERNAME!, process.env.PASSWORD!);

  // Wait until MFA is accepted and browser lands on Taxi staging.
  await page.waitForURL('**/taxi.stg.mktg.2u.com/**', { timeout: 120000 });
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(3000);

  // Save the authenticated session to file — all tests will reuse this
  await page.context().storageState({ path: storageStatePath });
  console.log('=== SETUP: Session saved to storageState.json — tests will reuse this login ===');
});
