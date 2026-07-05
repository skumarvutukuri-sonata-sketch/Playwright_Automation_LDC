import { test as setup } from '@playwright/test';
import { LoginPage } from '../../pages/login.page';
import * as dotenv from 'dotenv';
import * as path from 'path';
const { authenticator } = require('otplib');

dotenv.config();

const storageStatePath = path.resolve(__dirname, 'storageState.json');

setup('login and save session', async ({ page }) => {
  setup.setTimeout(180000);
  console.log('=== SETUP: Automating Login and MFA ===');

  const loginPage = new LoginPage(page);
  await page.goto(process.env.Taxi_Staging_URL!);
  
  // 1. Perform standard login (Email, Username, Password)
  await loginPage.valid_login(process.env.EMAIL!, process.env.USERNAME!, process.env.PASSWORD!);

  console.log('⏳ Checking current MFA screen state...');
  
  // ==========================================
  // 2. SMART MFA LOGIC
  // ==========================================
  
  // A. Check if OneLogin defaulted to a Push Notification screen
  const changeFactorBtn = page.getByText(/Change Authentication Factor/i).first();
  
  try {
    if (await changeFactorBtn.waitFor({ state: 'visible', timeout: 5000 }).then(() => true).catch(() => false)) {
        console.log('🔄 Push screen detected. Switching to Authenticator App...');
        await changeFactorBtn.click();
        
        // Brief pause to allow the OneLogin dropdown/modal to animate open
        await page.waitForTimeout(1000); 
        
        // Click the Authenticator App option
        const authenticatorOption = page.getByText(/Authenticator/i).first();
        await authenticatorOption.waitFor({ state: 'visible', timeout: 5000 });
        await authenticatorOption.click();
    }
  } catch (e: any) {
     console.log('⚠️ Error during factor switch (safe to ignore if it proceeds):', e.message);
  }

  console.log('⏳ Waiting for the 6-digit input box...');
  
  // B. STRICT MODE FIX: Added .first() to prevent crashes if OneLogin has hidden mobile inputs!
  const mfaInput = page
    .locator('[data-testid="security-code"], input[name="otp_code"], input[autocomplete="one-time-code"], input[type="tel"]')
    .first();
  await mfaInput.waitFor({ state: 'visible', timeout: 20000 });

  // C. Generate the 6-digit token
  const secret = process.env.MFA_SECRET!;
  if (!secret) {
    throw new Error('MFA_SECRET is missing. Set MFA_SECRET in .env (and ENV_FILE_CONTENT for CI).');
  }
  const token = authenticator.generate(secret);
  console.log(`🔐 Generated MFA Token successfully.`);

  // D. Type the token and press Enter to submit
  await mfaInput.fill(token);
  await mfaInput.press('Enter'); 
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