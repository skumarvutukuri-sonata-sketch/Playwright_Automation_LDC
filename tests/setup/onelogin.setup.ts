import { test as setup } from '@playwright/test';
import { LoginPage } from '../../pages/login.page';
import * as dotenv from 'dotenv';
import * as path from 'path';
import * as OTPAuth from 'otpauth'; // 🚀 Bulletproof standard import

dotenv.config();

const storageStatePath = path.resolve(__dirname, 'storageState.json');

setup('login and save session', async ({ page }) => {
  setup.setTimeout(60000); 
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
     console.log('➡️ Proceeding directly to code input...');
  }

  console.log('⏳ Waiting for the 6-digit input box...');
  
  // B. Target the exact React data-testid from the OneLogin HTML
  const mfaInput = page.getByTestId('security-code').first(); 
  await mfaInput.waitFor({ state: 'visible', timeout: 15000 });

  // C. Generate the 6-digit token using OTPAuth
  const secret = process.env.MFA_SECRET!;
  const totp = new OTPAuth.TOTP({
      issuer: "OneLogin",
      label: "Playwright",
      algorithm: "SHA1",
      digits: 6,
      period: 30,
      secret: OTPAuth.Secret.fromBase32(secret) // Natively handles the text string!
  });
  
  const token = totp.generate();
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