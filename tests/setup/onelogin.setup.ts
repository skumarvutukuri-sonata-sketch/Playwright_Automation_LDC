import { test as setup } from '@playwright/test';
import { LoginPage } from '../../pages/login.page';
import * as dotenv from 'dotenv';
import * as path from 'path';
import * as OTPAuth from 'otpauth'; 

dotenv.config();

const storageStatePath = path.resolve(__dirname, 'storageState.json');

setup('login and save session', async ({ page }) => {
  setup.setTimeout(90000); // Increased timeout to give SSO plenty of time
  console.log('=== SETUP: Automating Login and MFA ===');

  const loginPage = new LoginPage(page);
  await page.goto(process.env.Taxi_Staging_URL!);
  
  // 1. Perform standard login
  await loginPage.valid_login(process.env.EMAIL!, process.env.USERNAME!, process.env.PASSWORD!);

  console.log('⏳ Checking current MFA screen state...');
  
  // ==========================================
  // 2. SMART MFA LOGIC
  // ==========================================
  const changeFactorBtn = page.getByText(/Change Authentication Factor/i).first();
  
  try {
    if (await changeFactorBtn.waitFor({ state: 'visible', timeout: 5000 }).then(() => true).catch(() => false)) {
        console.log('🔄 Push screen detected. Switching to Authenticator App...');
        await changeFactorBtn.click();
        await page.waitForTimeout(1000); 
        
        const authenticatorOption = page.getByText(/Authenticator/i).first();
        await authenticatorOption.waitFor({ state: 'visible', timeout: 5000 });
        await authenticatorOption.click();
    }
  } catch (e: any) {
     console.log('➡️ Proceeding directly to code input...');
  }

  console.log('⏳ Waiting for the 6-digit input box...');
  const mfaInput = page.getByTestId('security-code').first(); 
  await mfaInput.waitFor({ state: 'visible', timeout: 15000 });

  // Generate Token
  const secret = process.env.MFA_SECRET!;
  const totp = new OTPAuth.TOTP({
      issuer: "OneLogin",
      label: "Playwright",
      algorithm: "SHA1",
      digits: 6,
      period: 30,
      secret: OTPAuth.Secret.fromBase32(secret)
  });
  const token = totp.generate();
  console.log(`🔐 Generated MFA Token successfully: ${token}`);

  // ==========================================
  // D. TYPE AND HARD CLICK (CI/CD FIX)
  // ==========================================
  await mfaInput.focus();
  await mfaInput.clear();
  await mfaInput.pressSequentially(token, { delay: 100 }); // Type like a human
  await page.waitForTimeout(500); // Let React register the input
  
  // Find the giant pink Continue button explicitly by its text and physical button role
  console.log('🖱️ Clicking the Continue button...');
  const continueBtn = page.getByRole('button', { name: 'Continue' }).first();
  
  // Wait for it to be clickable just in case React is still processing the text
  await continueBtn.waitFor({ state: 'visible', timeout: 5000 });
  await continueBtn.click({ force: true }); 
  // ==========================================

  // // 3. STRICT VALIDATION: Wait for the actual Taxi URL
  // // We use a regex match here so it catches any variation of the staging URL
  // console.log('⏳ Waiting for OneLogin SSO redirect to finish and land on Taxi...');
  // await page.waitForURL(/taxi\.stg\.mktg\.2u\.com/, { timeout: 45000 });
  
  // // Let the dashboard settle before ripping the cookies
  // await page.waitForLoadState('networkidle');
  // await page.waitForTimeout(3000);

  // // 4. Save the authenticated session to file
  // await page.context().storageState({ path: storageStatePath });
  // console.log('✅ SETUP: Session saved to storageState.json — tests will reuse this login!');

  // 3. STRICT VALIDATION: Wait for the actual Taxi URL
  console.log('⏳ Waiting for OneLogin SSO redirect to finish and land on Taxi...');
  await page.waitForURL(/taxi\.stg\.mktg\.2u\.com/, { timeout: 45000 });

  // 🚀 NEW: Authenticate Datadog session into storageState.json
  console.log('🔐 Establishing Datadog session via OneLogin SSO...');
  await page.goto('https://app.datadoghq.com/logs', { waitUntil: 'domcontentloaded', timeout: 45000 }).catch(() => {});
  
  // If Datadog requires a initial SAML trigger from OneLogin tiles:
  await page.waitForTimeout(3000);

  // 4. Save the authenticated session (contains BOTH Taxi and Datadog cookies)
  await page.context().storageState({ path: storageStatePath });
  console.log('✅ SETUP: Session saved to storageState.json with Datadog cookies included!');
});