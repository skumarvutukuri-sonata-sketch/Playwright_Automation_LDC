import { test as setup } from '@playwright/test';
import { LoginPage } from '../../pages/login.page';
import * as dotenv from 'dotenv';
import * as path from 'path';
import * as crypto from 'crypto';

dotenv.config();

const storageStatePath = path.resolve(__dirname, 'storageState.json');

const base32ToBuffer = (value: string): Buffer => {
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
  const normalized = value.toUpperCase().replace(/[^A-Z2-7]/g, '');

  let bits = '';
  for (const ch of normalized) {
    const idx = alphabet.indexOf(ch);
    if (idx === -1) {
      continue;
    }
    bits += idx.toString(2).padStart(5, '0');
  }

  const bytes: number[] = [];
  for (let i = 0; i + 8 <= bits.length; i += 8) {
    bytes.push(parseInt(bits.slice(i, i + 8), 2));
  }

  return Buffer.from(bytes);
};

const generateTotp = (secret: string, digits = 6, period = 30, counterOffset = 0): string => {
  const key = base32ToBuffer(secret);
  if (key.length < 16) {
    throw new Error('MFA_SECRET appears invalid. It should be a base32 secret of at least 16 bytes.');
  }

  const counter = Math.floor(Date.now() / 1000 / period) + counterOffset;
  const buffer = Buffer.alloc(8);
  buffer.writeUInt32BE(Math.floor(counter / 0x100000000), 0);
  buffer.writeUInt32BE(counter & 0xffffffff, 4);

  const digest = crypto.createHmac('sha1', key).update(buffer).digest();
  const offset = digest[digest.length - 1] & 0x0f;
  const binary =
    ((digest[offset] & 0x7f) << 24) |
    ((digest[offset + 1] & 0xff) << 16) |
    ((digest[offset + 2] & 0xff) << 8) |
    (digest[offset + 3] & 0xff);

  const otp = (binary % 10 ** digits).toString().padStart(digits, '0');
  return otp;
};

setup('login and save session', async ({ page }) => {
  setup.setTimeout(240000);
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
  // D. Submit MFA token with small time-window retries for clock drift in CI.
  const continueButton = page.getByRole('button', { name: /continue/i }).first();
  const tokenOffsets = [0, -1, 1];
  let mfaAccepted = false;

  for (const offset of tokenOffsets) {
    const token = generateTotp(secret, 6, 30, offset);
    console.log(`🔐 Generated MFA Token successfully (offset ${offset}).`);
    await mfaInput.fill(token);

    if (await continueButton.isVisible().catch(() => false)) {
      await continueButton.click();
    } else {
      await mfaInput.press('Enter');
    }

    try {
      await page.waitForURL(
        /taxi\.stg\.mktg\.2u\.com|2u\.onelogin\.com\/trust\/saml2\/http-post\/sso/i,
        { timeout: 25000, waitUntil: 'domcontentloaded' }
      );
      mfaAccepted = true;
      break;
    } catch {
      const invalidCode = page.getByText(/invalid|incorrect|expired|try again/i).first();
      if (await invalidCode.isVisible().catch(() => false)) {
        console.log(`⚠️ MFA token rejected for offset ${offset}. Retrying...`);
      }
      await mfaInput.fill('');
      await page.waitForTimeout(1200);
    }
  }

  if (!mfaAccepted) {
    throw new Error('Unable to complete MFA with generated tokens. Verify MFA_SECRET in GitHub secret and OneLogin factor setup.');
  }
  // ==========================================

  // 3. Complete OneLogin SAML handoff and land on Taxi staging
  console.log('⏳ Waiting to land on Taxi Staging dashboard...');
  await page.waitForTimeout(1500);

  const isTaxiUrl = () => /taxi\.stg\.mktg\.2u\.com/i.test(page.url());
  const samlHandoffUrl = /2u\.onelogin\.com\/trust\/saml2\/http-post\/sso/i;

  for (let attempt = 1; attempt <= 3 && !isTaxiUrl(); attempt++) {
    console.log(`⏳ SAML handoff attempt ${attempt}... current URL: ${page.url()}`);

    if (samlHandoffUrl.test(page.url())) {
      const samlForm = page.locator('form[action*="taxi.stg.mktg.2u.com"], form[action*="mktg.2u.com"]').first();
      if (await samlForm.isVisible().catch(() => false)) {
        await samlForm.evaluate((form: HTMLFormElement) => form.submit());
      }
    }

    try {
      await page.waitForURL(/taxi\.stg\.mktg\.2u\.com/i, { timeout: 30000 });
      break;
    } catch {
      try {
        await page.goto(process.env.Taxi_Staging_URL!, { waitUntil: 'commit' });
      } catch {
        // Navigation can be interrupted by ongoing OneLogin redirects.
      }
      await page.waitForTimeout(2000);
    }
  }

  if (!isTaxiUrl()) {
    throw new Error(`Unable to complete OneLogin SAML handoff. Current URL: ${page.url()}`);
  }

  await page.waitForLoadState('domcontentloaded');
  await page.waitForTimeout(3000);

  // 4. Save the authenticated session to file
  await page.context().storageState({ path: storageStatePath });
  console.log('✅ SETUP: Session saved to storageState.json — tests will reuse this login!');
});