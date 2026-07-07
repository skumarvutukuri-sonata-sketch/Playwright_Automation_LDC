import { Page, FrameLocator, Locator } from '@playwright/test';

export class Helpers {

  constructor(private page: Page, private frame: FrameLocator) {}

  /**
   * Retry wrapper
   */
  async retry<T>(fn: () => Promise<T>, retries = 3): Promise<T> {
    let lastError: any;

    for (let i = 0; i < retries; i++) {
      try {
        return await fn();
      } catch (err) {
        lastError = err;
      }
    }

    throw lastError;
  }

  /**
   * Find field using multiple strategies (iframe-safe)
   */
  async findField(label: string): Promise<Locator> {

    const key = label.trim();

    // ✅ 0. Wait for label text (VERY IMPORTANT for dynamic forms)
    // ✅ 0. Wait for label/container without matching option text
    await this.frame.locator('label', { hasText: key }).first().waitFor({
        state: 'visible',
        timeout: 5000
    });


    // ✅ 1. getByLabel (best case)
    const byLabel = this.frame.getByLabel(key, { exact: false });
    if (await byLabel.count()) {
      await byLabel.first().waitFor({ state: 'visible' });
      return byLabel.first();
    }

    // ✅ 2. label → for → id mapping
    const labelEl = this.frame.locator('label', { hasText: key });

    if (await labelEl.count()) {

      const forAttr = await labelEl.first().getAttribute('for');

      if (forAttr) {
        const field = this.frame.locator(`#${forAttr}`);

        if (await field.count()) {
          await field.first().waitFor({ state: 'visible' });
          return field.first();
        }
      }
    }

    // ✅ 3. Placeholder
    const byPlaceholder = this.frame.getByPlaceholder(key);
    if (await byPlaceholder.count()) {
      await byPlaceholder.first().waitFor({ state: 'visible' });
      return byPlaceholder.first();
    }

    // ✅ 4. Name attribute
    const byName = this.frame.locator(`[name*="${key}" i]`);
    if (await byName.count()) {
      await byName.first().waitFor({ state: 'visible' });
      return byName.first();
    }

    // ✅ 5. Aria label
    const byAria = this.frame.locator(`[aria-label*="${key}" i]`);
    if (await byAria.count()) {
      await byAria.first().waitFor({ state: 'visible' });
      return byAria.first();
    }

    // ✅ 6. Fallback: nearby field
    const nearby = this.frame
      .locator(`text=${key}`)
      .first()
      .locator('xpath=..')
      .locator('input, select, textarea');

    if (await nearby.count()) {
      await nearby.first().waitFor({ state: 'visible' });
      return nearby.first();
    }

    throw new Error(`Field not found: ${label}`);
  }

  /**
   * Detect field type
   */
  async detectFieldType(locator: Locator): Promise<string> {

    const tagName = await locator.evaluate(el => el.tagName.toLowerCase());

    if (tagName === 'textarea') return 'textarea';
    if (tagName === 'select') return 'dropdown';

    const type = await locator.getAttribute('type');

    if (type === 'radio') return 'radio';
    if (type === 'checkbox') return 'checkbox';
    if (type === 'email') return 'email';
    if (type === 'tel') return 'phone';

    return 'text';
  }

  /**
   * Dropdown options
   */
  async getDropdownOptions(locator: Locator): Promise<string[]> {
    const options = await locator.locator('option').allTextContents();

    return options.filter(o => o.trim() !== '' && !o.toLowerCase().includes('select'));
  }

  /**
   * Select dropdown
   */
  async selectDropdown(locator: Locator, value: string) {
    await locator.selectOption({ label: value });
  }

  /**
   * Click primary button (Next / Continue / Submit)
   */
  async clickPrimaryButton(): Promise<void> {

    const texts = ['next', 'continue', 'submit', 'finish', 'save','Request more info'];

    for (const text of texts) {
      const btn = this.frame.getByRole('button', { name: new RegExp(text, 'i') });

      if (await btn.count()) {
        await btn.first().click();
        return;
      }
    }

    // fallback
    const fallback = this.frame.locator('button[type="submit"]');
    if (await fallback.count()) {
      await fallback.first().click();
      return;
    }

    throw new Error('Primary button not found');
  }

  /**
   * Check error visibility
   */
  async isErrorVisible(label: string): Promise<boolean> {
    const error = this.frame.locator(`text=${label}`).locator('..').locator('.error');
    return await error.isVisible().catch(() => false);
  }

  /**
   * Wait for error to disappear
   */
  async waitForErrorToDisappear(label: string): Promise<void> {
    const error = this.frame.locator(`text=${label}`).locator('..').locator('.error');
    await error.waitFor({ state: 'hidden', timeout: 5000 }).catch(() => {});
  }

  async isThankYouPageVisible(): Promise<boolean> {
    // 🚀 CRITICAL: First verify we're NOT on a loading state or initial form page
    // Check if there are still visible form fields (input, select, textarea)
    const formFields = this.frame.locator('input:not([type="hidden"]):not([type="submit"]):not([type="button"]), select, textarea').filter({ visible: true });
    const fieldCount = await formFields.count();
    
    // If form fields are still visible, we're NOT at thank you page yet
    if (fieldCount > 0) {
      return false;
    }

    // Only check for thank you patterns if NO form fields are visible
    const patterns = [
      /thank\s+you/i,           // "Thank You", "Thank you", etc
      /thank\s+you\s+message/i, // "Thank You Message"
      /your\s+.*\s+was\s+submitted/i,  // "Your form was submitted"
      /submission\s+received/i, // "Submission Received"
      /application\s+received/i // "Application Received"
    ];

    for (const pattern of patterns) {
      try {
        const matches = await this.frame.getByText(pattern).count();
        if (matches > 0) {
          return true;
        }
      } catch (e) {
        // Continue to next pattern if this one fails
      }
    }

    return false;
  }

  /**
   * Verify success page
   */
  async verifyThankYouPage(): Promise<void> {

  const patterns = [
    /thank you/i,
    /success/i,
    /submitted/i,
    /received/i
  ];

  // ✅ Wait for page content to change
  await this.frame.locator('body').waitFor();

    // ✅ CRITICAL: wait for ANY success text (up to 10 seconds)
    for (const pattern of patterns) {

        try {
        await this.frame.getByText(pattern).first().waitFor({
            state: 'visible',
            timeout: 10000   // ✅ increased timeout
        });

        // ✅ success found
        return;

        } catch (e) {
        // try next pattern
        }
    }

    throw new Error('Thank You page not detected');
    }



  async waitForTimeout(ms: number) {
    return new Promise(res => setTimeout(res, ms));
    }

  
  /**
 * Wait for backend API and return request payload
 */
  async captureInterestCreatePayload(): Promise<any> {

    const request = await this.page.waitForRequest(req =>
        req.url().includes('/v2/interest-create') &&
        req.method() === 'POST'
    );

    return request.postDataJSON();
  }




}