import { Page, FrameLocator, Locator } from '@playwright/test';

export class Helpers {

  constructor(private page: Page, private frame: FrameLocator) {}

  /**
   * Retry wrapper for execution stability
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

    // 0. Wait briefly for label text without crashing if missing
    await this.frame.locator('label', { hasText: key }).first().waitFor({
        state: 'visible',
        timeout: 2000
    }).catch(() => {});

    // 1. getByLabel (best case)
    const byLabel = this.frame.getByLabel(key, { exact: false });
    if (await byLabel.count()) {
      await byLabel.first().waitFor({ state: 'visible', timeout: 1000 }).catch(() => {});
      return byLabel.first();
    }

    // 2. label → for → id mapping
    const labelEl = this.frame.locator('label', { hasText: key });
    if (await labelEl.count()) {
      const forAttr = await labelEl.first().getAttribute('for');
      if (forAttr) {
        const field = this.frame.locator(`#${forAttr}`);
        if (await field.count()) {
          await field.first().waitFor({ state: 'visible', timeout: 1000 }).catch(() => {});
          return field.first();
        }
      }
    }

    // 3. Placeholder
    const byPlaceholder = this.frame.getByPlaceholder(key);
    if (await byPlaceholder.count()) {
      return byPlaceholder.first();
    }

    // 4. Name attribute
    const byName = this.frame.locator(`[name*="${key}" i]`);
    if (await byName.count()) {
      return byName.first();
    }

    // 5. Aria label
    const byAria = this.frame.locator(`[aria-label*="${key}" i]`);
    if (await byAria.count()) {
      return byAria.first();
    }

    // 6. Fallback: nearby field
    const nearby = this.frame
      .locator(`text=${key}`)
      .first()
      .locator('xpath=..')
      .locator('input, select, textarea');

    if (await nearby.count()) {
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
   * Dropdown options filtering out empty/placeholder choices
   */
  async getDropdownOptions(locator: Locator): Promise<string[]> {
    const options = await locator.locator('option').allTextContents();
    return options.filter(o => o.trim() !== '' && !o.toLowerCase().includes('select'));
  }

  /**
   * Select dropdown option
   */
  async selectDropdown(locator: Locator, value: string) {
    await locator.selectOption({ label: value }).catch(async () => {
      await locator.selectOption({ value: value });
    });
  }

  /**
   * Safely clicks a button locator across viewports and overlay layers
   */
  private async clickLocatorSafely(locator: Locator): Promise<void> {
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        await locator.waitFor({ state: 'visible', timeout: 5000 });
        await locator.scrollIntoViewIfNeeded({ timeout: 2000 }).catch(() => {});

        const isDisabled = await locator.isDisabled().catch(() => false);
        if (isDisabled) {
          await locator.evaluate((element: HTMLElement) => {
            element.removeAttribute('disabled');
            (element as HTMLButtonElement).disabled = false;
          });
          await this.page.waitForTimeout(200);
        }

        await locator.click({ timeout: 5000, force: true });
        return;
      } catch (error) {
        await this.page.waitForTimeout(300);
        try {
          await locator.evaluate((element: HTMLElement) => {
            element.scrollIntoView({ block: 'center', inline: 'center' });
            element.removeAttribute('disabled');
            (element as HTMLButtonElement).disabled = false;
            element.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, cancelable: true, view: window }));
            element.dispatchEvent(new MouseEvent('mouseup', { bubbles: true, cancelable: true, view: window }));
            element.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, view: window }));
          });
          return;
        } catch {
          // Retry next attempt
        }
      }
    }

    // Final fallback dispatch
    await locator.evaluate((element: HTMLElement) => {
      element.scrollIntoView({ block: 'center', inline: 'center' });
      element.removeAttribute('disabled');
      (element as HTMLButtonElement).disabled = false;
      element.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, view: window }));
    });
  }

  /**
   * Click primary button (Next / Continue / Submit / Step transition)
   */
  async clickPrimaryButton(): Promise<void> {
    const selectors = [
      'button:visible',
      'input[type="submit"]:visible',
      'input[type="button"]:visible',
      '[role="button"]:visible',
      'a.btn:visible',
      '[data-testid*="next" i]:visible',
      '[data-testid*="submit" i]:visible',
      '[id*="next" i]:visible',
      '[class*="next" i]:visible',
      '[id*="continue" i]:visible',
      '[class*="continue" i]:visible',
      '[id*="submit" i]:visible',
      '[class*="submit" i]:visible'
    ];

    const primaryPattern =
      /next|continue|submit|finish|save|request|get|complete|proceed|step/i;

    const candidates = this.frame.locator(selectors.join(', '));
    const count = await candidates.count();

    // 1. Target buttons whose label/text matches primary patterns
    for (let index = 0; index < count; index++) {
      const candidate = candidates.nth(index);

      if (!(await candidate.isVisible().catch(() => false))) {
        continue;
      }

      const label = await candidate.evaluate((element) => {
        const htmlElement = element as HTMLElement;
        return [
          htmlElement.innerText,
          element.getAttribute('value'),
          element.getAttribute('aria-label'),
          element.getAttribute('title'),
          element.getAttribute('name'),
          element.getAttribute('id')
        ]
          .filter(Boolean)
          .join(' ');
      });

      if (primaryPattern.test(label)) {
        await this.clickLocatorSafely(candidate);
        return;
      }
    }

    // 2. Fallback: Click first visible submit button or form control
    const defaultSubmit = this.frame.locator('button[type="submit"], input[type="submit"]').first();
    if (await defaultSubmit.isVisible().catch(() => false)) {
      await this.clickLocatorSafely(defaultSubmit);
      return;
    }

    for (let index = 0; index < count; index++) {
      const candidate = candidates.nth(index);
      if (await candidate.isVisible().catch(() => false)) {
        await this.clickLocatorSafely(candidate);
        return;
      }
    }

    throw new Error('Primary button not found');
  }

  /**
   * Check error visibility
   */
  async isErrorVisible(label: string): Promise<boolean> {
    const error = this.frame.locator(`text=${label}`).locator('..').locator('.error, [aria-invalid="true"]');
    return await error.isVisible().catch(() => false);
  }

  /**
   * Wait for error to disappear quickly
   */
  async waitForErrorToDisappear(label: string): Promise<void> {
    const error = this.frame.locator(`text=${label}`).locator('..').locator('.error, [aria-invalid="true"]');
    await error.waitFor({ state: 'hidden', timeout: 500 }).catch(() => {});
  }

  /**
   * Verify if current page state is the Thank You / Success page
   */
  async isThankYouPageVisible(): Promise<boolean> {
    const formFields = this.frame.locator(
      'input:not([type="hidden"]):not([type="submit"]):not([type="button"]), select, textarea'
    ).filter({ visible: true });

    if (await formFields.count() > 0) {
      return false;
    }

    const successText = this.frame.getByText(
      /thank\s+you|submitted|submission\s+received|application\s+received|success/i
    );

    return await successText.first().isVisible().catch(() => false);
  }

  /**
   * Verify success page with timeout
   */
  async verifyThankYouPage(): Promise<void> {
    const pattern = /thank you|success|submitted|received/i;

    await this.frame.locator('body').waitFor();

    try {
      await this.frame.getByText(pattern).first().waitFor({
        state: 'visible',
        timeout: 5000
      });
      return;
    } catch (e) {
      throw new Error('Thank You page not detected');
    }
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