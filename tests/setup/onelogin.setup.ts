import { test as setup } from '@playwright/test';
import { LoginPage } from '../../pages/login.page';
import * as dotenv from 'dotenv';
import * as path from 'path';
const { authenticator } = require('otplib');
dotenv.config();

const storageStatePath = path.resolve(__dirname, 'storageState.json');

setup('login and save session', async ({ page }) => {
  // Reduced timeout since we no longer need to wait for a human
  setup.setTimeout(60000); 
  console.log('=== SETUP: Automating Login and MFA ===');

  const loginPage = new LoginPage(page);
  await page.goto(process.env.Taxi_Staging_URL!);
  
  // 1. Perform standard login (Email, Username, Password)
  await loginPage.valid_login(process.env.EMAIL!, process.env.USERNAME!, process.env.PASSWORD!);

  // ==========================================
  // 2. AUTOMATED MFA LOGIC
  // ==========================================
  console.log('⏳ Waiting for MFA screen...');
  
  // IMPORTANT: You may need to inspect the OneLogin screen and update this selector
  // to perfectly match the 6-digit input box.
  const mfaInput = page.locator('input[name="otp_code"]'); 
  await mfaInput.waitFor({ state: 'visible', timeout: 15000 });

  // Generate the 6-digit token using the secret from your .env file
  const secret = process.env.MFA_SECRET!;
  const token = authenticator.generate(secret);
  console.log(`🔐 Generated MFA Token successfully.`);

  // Type the token into the input box
  await mfaInput.fill(token);

  // IMPORTANT: You may need to inspect the OneLogin screen and update this selector
  // to match the "Continue" or "Log in" button on the MFA screen.
  const mfaSubmitButton = page.locator('button[type="submit"]'); 
  await mfaSubmitButton.click();
  // ==========================================

  // 3. Wait until the browser successfully lands on Taxi staging
  console.log('⏳ Waiting to land on Taxi Staging dashboard...');
  await page.waitForURL('**/taxi.stg.mktg.2u.com/**', { timeout: 30000 });
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(3000);

  // 4. Save the authenticated session to file
  await page.context().storageState({ path: storageStatePath });
  console.log('✅ SETUP: Session saved to storageState.json — tests will reuse this login!');
});