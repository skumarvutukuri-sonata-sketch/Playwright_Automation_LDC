import { test as setup } from '@playwright/test';
import { LoginPage } from '../../pages/login.page';
import * as dotenv from 'dotenv';
import * as path from 'path';
import * as crypto from 'crypto';

dotenv.config();

const storageStatePath = path.resolve(__dirname, 'storageState.json');

// ==========================================
// CUSTOM TOTP GENERATOR (No otplib required!)
// ==========================================
const base32ToBuffer = (value: string): Buffer => {
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
  const normalized = value.toUpperCase().replace(/[^A-Z2-7]/g, '');

  let bits = '';
  for (const ch of normalized) {
    const idx = alphabet.indexOf(ch);
    if (idx === -1) continue;
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
  if (key.length < 16) throw new Error('MFA_SECRET appears invalid.');

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

  return (binary % 10 ** digits).toString().padStart(digits, '0');
};

// ==========================================
// PLAYWRIGHT SETUP
// ==========================================
setup('login and save session', async ({ page }) => {
  setup.setTimeout(120000);
  console.log('=== SETUP: Automating Login and MFA ===');

  const loginPage = new LoginPage(page);
  await page.goto(process.env.Taxi_Staging_URL!);
  
  // 1. Perform standard login
  await loginPage.valid_login(process.env.EMAIL!, process.env.USERNAME!, process.env.PASSWORD!);

  console.log('⏳ Checking current MFA screen state...');
  
  // 2. Check if OneLogin defaulted to a Push Notification screen
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
     console.log('➡️ Proceeding directly to input...');
  }

  console.log('⏳ Waiting for the 6-digit input box...');
  
  // 3. Find input and type the Custom TOTP
  const mfaInputSelector = '[data-testid="security-code"], input[name="otp_code"], input[autocomplete="one-time-code"]';
  const mfaInput = page.locator(mfaInputSelector).first();
  await mfaInput.waitFor({ state: 'visible', timeout: 15000 });

  const secret = process.env.MFA_SECRET!;
  if (!secret) throw new Error('MFA_SECRET is missing. Set it in GitHub Secrets / .env');

  const token = generateTotp(secret);
  console.log(`🔐 Generated MFA Token successfully.`);
  await mfaInput.fill(token);
  await mfaInput.press('Enter'); 

  // ==========================================
  // 4. Handle SAML Redirects safely
  // ==========================================
  console.log('⏳ Waiting to land on Taxi Staging dashboard...');
  
  try {
      // Wait to see if we naturally hit the Taxi Staging URL
      await page.waitForURL(/taxi\.stg\.mktg\.2u\.com/i, { timeout: 25000 });
  } catch {
      // If we time out, we might be stuck on the OneLogin SAML handoff page that requires a button click
      console.log('⚠️ Still not on Taxi URL. Checking if stuck on SAML handoff page...');
      
      const samlForm = page.locator('form[action*="taxi.stg.mktg.2u.com"], form[action*="mktg.2u.com"]').first();
      if (await samlForm.isVisible().catch(() => false)) {
         console.log('🔄 Found hidden SAML form, submitting manually...');
         await samlForm.evaluate((form: HTMLFormElement) => form.submit());
         await page.waitForURL(/taxi\.stg\.mktg\.2u\.com/i, { timeout: 20000 });
      } else {
         throw new Error(`Failed to reach Taxi URL. Stuck on: ${page.url()}`);
      }
  }

  await page.waitForLoadState('domcontentloaded');
  await page.waitForTimeout(3000);

  // 5. Save the authenticated session to file
  await page.context().storageState({ path: storageStatePath });
  console.log('✅ SETUP: Session saved to storageState.json — tests will reuse this login!');
});