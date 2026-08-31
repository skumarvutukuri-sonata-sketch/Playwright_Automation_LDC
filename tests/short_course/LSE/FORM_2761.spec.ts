import { test } from '@playwright/test';
import { FormLoader } from '../../../utils/FormLoader';
import { FormRunner } from '../../../utils/FormRunner';

const formsData = FormLoader.load('short_course/LSE');

const FORM_NAME = 'FORM_2761';

/**
 * ==================================================
 * Happy Path
 * ==================================================
 */
test.describe('Happy Path', () => {
  for (const [formName, form] of Object.entries(formsData.forms)) {
    if (FORM_NAME && FORM_NAME !== formName) {
      continue;
    }

    test(`${formName} - Happy`, async ({ page }) => {
      await page.goto(form.url, {
        waitUntil: 'domcontentloaded'
      });

      const frame = page.frameLocator('iframe');

      await page.waitForTimeout(1500);

      const runner = new FormRunner(page, frame);

      await runner.run(formName, form, 'happy');
    });
  }
});

/**
 * ==================================================
 * Validation
 * ==================================================
 */
test.describe('Validation', () => {
  for (const [formName, form] of Object.entries(formsData.forms)) {
    if (FORM_NAME && FORM_NAME !== formName) {
      continue;
    }

    test(`${formName} - Validation`, async ({ page }) => {
      await page.goto(form.url, {
        waitUntil: 'domcontentloaded'
      });

      const frame = page.frameLocator('iframe');

      await page.waitForTimeout(1500);

      const runner = new FormRunner(page, frame);

      await runner.run(formName, form, 'validation');
    });
  }
});
