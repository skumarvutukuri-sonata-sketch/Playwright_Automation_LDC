// import { Page, expect } from '@playwright/test';
// import { Logger } from './Logger';
// import * as path from 'path';
// import * as dotenv from 'dotenv';

// dotenv.config();

// export class DatadogValidator {
//   /**
//    * Automates the "Sign in with Your Organization" SSO input screen,
//    * sets timeframe to Past 1 Hour, types the test email, and verifies Segment error log.
//    */
//   static async validateSegmentError(page: Page, scriptTestEmail: string) {
//     Logger.action(`🔍 Initiating Datadog log validation for script email: ${scriptTestEmail}`);

//     const authEmail = process.env.EMAIL || process.env.USERID || 'skumarvutukuri-sonata@2u.com';

//     try {
//       // 1. Navigate to Datadog Log Explorer directly
//       Logger.action('🔐 Navigating to Datadog...');
//       await page.goto('https://app.datadoghq.com/logs', { waitUntil: 'domcontentloaded', timeout: 45000 });
//       await page.waitForTimeout(3000);

//       // 2. Handle Login / SSO screens if redirected
//       if (page.url().includes('/account/login') || page.url().includes('/by_email')) {
//         Logger.action('🔄 Datadog login page detected. Processing SSO flow...');

//         // If on main login page, click "Using Single Sign-On?"
//         const ssoLink = page.getByText(/Using Single Sign-On\?/i).first();
//         if (await ssoLink.isVisible({ timeout: 4000 }).catch(() => false)) {
//           await ssoLink.click();
//           await page.waitForTimeout(1000);
//         }

//         // 🚀 THE FIX: Target the "Enter company email" input field shown in your screenshot
//         const companyEmailInput = page.locator('input[placeholder*="company email" i], input[type="email"], input[name="email"]').first();
//         await companyEmailInput.waitFor({ state: 'visible', timeout: 10000 });
//         await companyEmailInput.clear();
//         await companyEmailInput.fill(authEmail);
//         Logger.action(`🔑 Entered company email: ${authEmail}`);

//         // Click the blue "Next" button shown in your screenshot
//         const nextBtn = page.locator('button:has-text("Next"), input[type="submit"], button[type="submit"]').first();
//         await nextBtn.waitFor({ state: 'visible', timeout: 5000 });
//         await nextBtn.click();
//         Logger.action('🚀 Clicked "Next" to trigger OneLogin SAML assertion...');
//       }

//       // 3. Wait for OneLogin to complete authentication and land inside Datadog
//       await page.waitForURL(/app\.datadoghq\.com\/(logs|dashboard|event)/, { timeout: 45000 });
//       Logger.action('✅ Datadog SSO Authentication successful!');

//       // Ensure we are on the Log Explorer page
//       if (!page.url().includes('/logs')) {
//         await page.goto('https://app.datadoghq.com/logs?live=true', { waitUntil: 'domcontentloaded', timeout: 45000 });
//       }

//       await page.waitForLoadState('networkidle').catch(() => {});
//       await page.waitForTimeout(4000);

//       // 4. Select "Past 1 Hour" from Timeframe Dropdown
//       Logger.action('⏰ Setting timeframe dropdown to "Past 1 Hour"...');
//       const timePickerBtn = page.locator('button:has-text("Past"), button:has-text("1h"), [data-test-id="time-picker-button"]').first();
      
//       if (await timePickerBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
//         await timePickerBtn.click();
//         await page.waitForTimeout(800);

//         const oneHourOption = page.getByText(/Past 1 Hour|1 Hour|1h/i).first();
//         if (await oneHourOption.isVisible({ timeout: 3000 }).catch(() => false)) {
//           await oneHourOption.click();
//           Logger.action('✅ Timeframe updated to Past 1 Hour');
//         }
//       }

//       // 5. Enter Search Query in UI Input
//       Logger.action(`⌨️ Entering search query for: ${scriptTestEmail}`);
//       const searchInput = page.locator('input[data-test-id="query-input"], input[aria-label*="Search" i], [class*="query-input"] input, .monaco-editor').first();
//       await searchInput.waitFor({ state: 'visible', timeout: 20000 });
//       await searchInput.click();

//       // Clear previous search bar content
//       await page.keyboard.press('Control+A');
//       await page.keyboard.press('Backspace');

//       // Fill search query natively (prevents '+' from converting to space)
//       const fullQuery = `env:stg @email:"${scriptTestEmail}" status:error`;
//       await searchInput.fill(fullQuery).catch(async () => {
//         await page.keyboard.type(fullQuery, { delay: 20 });
//       });

//       await page.keyboard.press('Enter');
//       Logger.action(`🔍 Executed Query: ${fullQuery}`);
//       await page.waitForTimeout(6000);

//       // 6. Assert Segment Error Log
//       const expectedMessageRegex = /Segment Anonymous ID could not be found/i;
//       const logEntry = page.locator('body').getByText(expectedMessageRegex);

//       let isVisible = false;
//       for (let attempt = 1; attempt <= 4; attempt++) {
//         if (await logEntry.first().isVisible().catch(() => false)) {
//           isVisible = true;
//           break;
//         }

//         Logger.action(`⏳ Log indexing pending... Re-checking stream (Attempt ${attempt}/4)`);
//         await page.keyboard.press('Enter');
//         await page.waitForTimeout(5000);
//       }

//       if (!isVisible) {
//         throw new Error(`Log message matching "Segment Anonymous ID could not be found" was not found for email: ${scriptTestEmail}`);
//       }

//       const count = await logEntry.count();
//       Logger.success(`✅ Datadog Validation Passed! Found ${count} matching log(s) for ${scriptTestEmail}`);

//     } catch (error: any) {
//       const screenshotPath = path.resolve(process.cwd(), `test-results/datadog-error-${Date.now()}.png`);
//       await page.screenshot({ path: screenshotPath, fullPage: true }).catch(() => {});
      
//       Logger.error(`❌ Datadog Validation Failed for script email: ${scriptTestEmail}`);
//       Logger.error(`📸 Debug screenshot saved to: ${screenshotPath}`);
//       throw error;
//     }
//   }
// }
import { Page, expect } from '@playwright/test';
import { Logger } from './Logger';
import * as path from 'path';

export class DatadogValidator {
  /**
   * Accesses Datadog Log Explorer directly using the active session,
   * sets the timeframe to Past 1 Hour, types the script input email, and verifies Segment error log.
   */
  static async validateSegmentError(page: Page, scriptTestEmail: string) {
    Logger.action(`🔍 Initiating Datadog log validation for script email: ${scriptTestEmail}`);

    try {
      // ==========================================
      // 1. NAVIGATE DIRECTLY TO LOG EXPLORER
      // ==========================================
      Logger.action('📊 Accessing Datadog Log Explorer page...');
      await page.goto('https://app.datadoghq.com/logs', { waitUntil: 'domcontentloaded', timeout: 60000 });
      await page.waitForLoadState('networkidle').catch(() => {});
      await page.waitForTimeout(4000);

      // ==========================================
      // 2. SELECT "PAST 1 HOUR" FROM TIMEFRAME DROPDOWN
      // ==========================================
      Logger.action('⏰ Setting timeframe dropdown to "Past 1 Hour"...');
      
      const timePickerBtn = page.locator('button:has-text("Past"), button:has-text("1h"), [data-test-id="time-picker-button"]').first();
      if (await timePickerBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
        await timePickerBtn.click();
        await page.waitForTimeout(800);

        const oneHourOption = page.getByText(/Past 1 Hour|1 Hour|1h/i).first();
        if (await oneHourOption.isVisible({ timeout: 3000 }).catch(() => false)) {
          await oneHourOption.click();
          Logger.action('✅ Timeframe set to Past 1 Hour');
        }
      }

      // ==========================================
      // 3. ENTER SEARCH QUERY NATIVELY
      // ==========================================
      Logger.action(`⌨️ Entering search query for: ${scriptTestEmail}`);

      const searchInput = page.locator('input[data-test-id="query-input"], input[aria-label*="Search" i], [class*="query-input"] input, .monaco-editor').first();
      await searchInput.waitFor({ state: 'visible', timeout: 20000 });
      await searchInput.click();

      // Clear search input completely
      await page.keyboard.press('Control+A');
      await page.keyboard.press('Backspace');

      // Native typing preserves '+' and '@' characters cleanly
      const fullQuery = `env:stg @email:"${scriptTestEmail}" status:error`;
      await searchInput.fill(fullQuery).catch(async () => {
        await page.keyboard.type(fullQuery, { delay: 20 });
      });

      await page.keyboard.press('Enter');
      Logger.action(`🔍 Executed Query: ${fullQuery}`);
      await page.waitForTimeout(6000);

      // ==========================================
      // 4. RETRY ASSERTION LOOP FOR LOG INDEXING
      // ==========================================
      const expectedMessageRegex = /Segment Anonymous ID could not be found/i;
      const logEntry = page.locator('body').getByText(expectedMessageRegex);

      let isVisible = false;
      for (let attempt = 1; attempt <= 4; attempt++) {
        if (await logEntry.first().isVisible().catch(() => false)) {
          isVisible = true;
          break;
        }

        Logger.action(`⏳ Log indexing pending... Re-checking stream (Attempt ${attempt}/4)`);
        await page.keyboard.press('Enter');
        await page.waitForTimeout(5000);
      }

      if (!isVisible) {
        throw new Error(`Log message matching "Segment Anonymous ID could not be found" was not found for email: ${scriptTestEmail}`);
      }

      const count = await logEntry.count();
      Logger.success(`✅ Datadog Validation Passed! Found ${count} matching log(s) for ${scriptTestEmail}`);

    } catch (error: any) {
      const screenshotPath = path.resolve(process.cwd(), `test-results/datadog-error-${Date.now()}.png`);
      await page.screenshot({ path: screenshotPath, fullPage: true }).catch(() => {});
      
      Logger.error(`❌ Datadog Validation Failed for script email: ${scriptTestEmail}`);
      Logger.error(`📸 Debug screenshot saved to: ${screenshotPath}`);
      throw error;
    }
  }
}