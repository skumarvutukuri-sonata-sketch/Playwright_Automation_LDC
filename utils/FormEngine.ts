import { Page, FrameLocator } from '@playwright/test';
import { Helpers } from './Helpers';
import { DefaultData } from './DefaultData';
import { Logger } from './Logger';


export type TestMode = 'happy' | 'validation';

export class FormEngine {

  private helpers: Helpers;
  private emailCount = 0;
  // Stores all values entered into the UI
  private enteredValues: Record<string, any> = {};

  constructor(private page: Page, private frame: FrameLocator) {
    this.helpers = new Helpers(page, frame);
  }

  /**
   * MAIN ENTRY
   */
  async processField(label: string, mode: TestMode, jsonType?: string) {

    Logger.field(label);

    const key = label.toLowerCase();

    const type = jsonType;

    // Radio buttons don't need findField()
    if (type === "radio") {

      const radioMappings = [

          {
              key: "Email",
              name: "email_opt_out",
              value: "yes"
          },

          {
              key: "Phone",
              name: "do_not_call",
              value: "yes"
          },

          {
              key: "Program",
              name: "share_email_opt_out",
              value: "yes"
          },

          {
              key: "edX, and its parent company,",
              name: "gdprProspect2uOptIn",
              value: "true"
          },
          {
              key: "Learn more about the educational programmes that the London School of Economics",
              name: "gdpr_prospectpartner_opt_in",
              value: "yes"
          }
      ];

        const normalizedLabel = label.toLowerCase();

        const mapping =
          radioMappings.find(x => normalizedLabel === x.key.toLowerCase()) ||
          radioMappings.find(x => normalizedLabel.includes(x.key.toLowerCase()));

      console.log("Radio Label :", label);
      console.log("Radio Mapping :", mapping);

      if (mapping) {

          const candidateValues = Array.from(new Set([
            mapping.value,
            mapping.value === "yes" ? "true" : "yes",
            mapping.value === "yes" ? "1" : "yes"
          ]));

          let radio: any = null;

          for (const value of candidateValues) {
            const candidate = this.frame.locator(
              `input[name="${mapping.name}"][value="${value}"]`
            ).first();

            try {
              await candidate.waitFor({
                state: "attached",
                timeout: 4000
              });
              radio = candidate;
              break;
            } catch {
              // Try next value variant.
            }
          }

          if (!radio) {
            const fallback = this.frame.locator(
              `input[name="${mapping.name}"]`
            ).first();

            try {
              await fallback.waitFor({
                state: "attached",
                timeout: 4000
              });

              radio = fallback;
            } catch {
              const escapedLabel = label.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

              const byGroupLabel = this.frame
                .getByRole("group", { name: new RegExp(escapedLabel, "i") })
                .getByRole("radio", { name: /^yes$/i })
                .first();

              await byGroupLabel.waitFor({
                state: "visible",
                timeout: 6000
              });

              radio = byGroupLabel;
            }
          }

          await radio.scrollIntoViewIfNeeded();
          await radio.click({
            force: true
          });

          this.saveEnteredValue(label, true);

          Logger.success(`${label} selected`);

          return;
      }

      throw new Error(`No radio mapping found for "${label}"`);
    }

    // ------------------------
    // CHECKBOX
    // ------------------------
    if (type === "checkbox") {

        const checkboxMappings = [

            {
                key: "Please contact me",
                name: "lead_share_opt_in"
            },

        ];

        const mapping = checkboxMappings.find(x =>
            label.toLowerCase().includes(x.key.toLowerCase())
        );

        if (mapping) {

          const checkbox = this.frame.locator(
              `input[name="${mapping.name}"]`
          );

          await checkbox.waitFor({
              state: "attached"
          });

          await checkbox.scrollIntoViewIfNeeded();

          // First attempt
          if (!(await checkbox.isChecked())) {

              await checkbox.click({
                  force: true
              });

              await this.page.waitForTimeout(300);
          }

          // Second attempt if still not checked
          if (!(await checkbox.isChecked())) {

              Logger.action("Checkbox not checked. Retrying...");

              await checkbox.click({
                  force: true
              });

              await this.page.waitForTimeout(300);
          }

          // Final verification
          if (!(await checkbox.isChecked())) {
              throw new Error(`Unable to check checkbox: ${label}`);
          }

          this.saveEnteredValue(label, true);

          Logger.success(`${label} checked`);

          return;
      }

        throw new Error(`No checkbox mapping found for "${label}"`);
    }


    // Only non-radio fields need findField()
    const locator = await this.helpers.findField(label);
  
    const detectedType = await this.helpers.detectFieldType(locator);

    const finalType = type || detectedType;

    // const locator: any = await this.helpers.findField(label);
    // const detectedType: string = await this.helpers.detectFieldType(locator);
    // const type = jsonType || detectedType;

    // ✅ EMAIL TEXTBOX
    if (key.includes('email') && type !== 'radio') {

      this.emailCount++;

      if (this.emailCount === 1) {

        if (mode === 'happy') {
          await this.processHappyField(label, locator, finalType);
        } else {
          await this.processValidationField(label, locator, finalType);
        }

        return;
      }
    }
    
    // ✅ NORMAL FLOW
    if (mode === 'happy') {
      await this.processHappyField(label, locator, finalType);
    } else {
      await this.processValidationField(label, locator, finalType);
    }
  }

  /**
   * ✅ HAPPY FLOW (Iteration + Random ✅)
   */
  private async processHappyField(label: string, locator: any, type: string) {

    // ✅ DROPDOWN → iterate + random
    if (type === 'dropdown') {

      const options = await this.helpers.getDropdownOptions(locator);
      const validOptions = options.filter(o => o.trim() !== '');

      for (const option of validOptions) {
        await this.helpers.selectDropdown(locator, option);
        this.saveEnteredValue(label, option);
        
        Logger.action(`Dropdown option: ${option}`);
      }

      const random =
        validOptions[Math.floor(Math.random() * validOptions.length)];

      await this.helpers.selectDropdown(locator, random);

      this.saveEnteredValue(label, random);

      Logger.success(`Final selected: ${random}`);

      return;
    }

    // ✅ CHECKBOX
    if (type === 'checkbox') {
      await locator.check();
      this.saveEnteredValue(label, true);
      return;
    }

    // ✅ TEXT
    const value = DefaultData.getValue(label);
    await locator.fill(value);
    this.saveEnteredValue(label, value);
  }

  /**
   * ✅ VALIDATION FLOW (fix errors one by one)
   */
  private async processValidationField(label: string, locator: any, type: string) {

    const key = label.toLowerCase();

    await new Promise(res => setTimeout(res, 800));

    // ✅ DROPDOWN → RANDOM ONE ONLY
    if (type === 'dropdown') {

      const options = await this.helpers.getDropdownOptions(locator);
      const valid = options.filter(o => o.trim() !== '');

      if (valid.length) {
        const random =
          valid[Math.floor(Math.random() * valid.length)];

        await this.helpers.selectDropdown(locator, random);
        this.saveEnteredValue(label, random);
        Logger.success(`Validation dropdown selected: ${random}`);
      }

      return;
    }

    // ✅ EMAIL VALIDATION
    else if (key.includes('email') && type !== 'radio') {

      const invalids = ['test', 'test@', '@gmail.com'];

      for (const val of invalids) {
        await locator.fill(val);
        Logger.action(`Invalid email: ${val}`);
        await this.helpers.clickPrimaryButton();
        await new Promise(res => setTimeout(res, 500));
      }

      const valid = DefaultData.getValue(label);
      await locator.fill(valid);
      this.saveEnteredValue(label, valid);

      Logger.success('Valid email entered');
    }

    // ✅ PHONE VALIDATION
    else if((key.includes('phone') || key.includes('contact') || key.includes('mobile')) &&type !== 'radio') {

      const invalids = ['123', '999999999999', 'abcd'];

      for (const val of invalids) {
        await locator.fill(val);
        Logger.action(`Invalid phone: ${val}`);
        await this.helpers.clickPrimaryButton();
        await new Promise(res => setTimeout(res, 500));
      }

      const valid = DefaultData.getValue(label);
      await locator.fill(valid);
      this.saveEnteredValue(label, valid);

      Logger.success('Valid phone entered');
    }

    // ✅ CHECKBOX
    else if (type === 'checkbox') {
      await locator.check();
      this.saveEnteredValue(label, true);
    }

    // ✅ NORMAL TEXT
    else {
      const value = DefaultData.getValue(label);
      await locator.fill(value);
      this.saveEnteredValue(label, value);
    }

    await this.helpers.waitForErrorToDisappear(label);
    Logger.validationResolved(label);
  }
  /**
 * Save entered field value
 */
  private saveEnteredValue(label: string, value: any): void {
    this.enteredValues[label] = value;
  }

  /**
   * Return all entered values
   */
  getEnteredValues(): Record<string, any> {
    return this.enteredValues;
  }

  async clickNext() {
    await this.helpers.clickPrimaryButton();
  }

  async verifySuccess() {
    await this.helpers.verifyThankYouPage();
    Logger.success('Form submitted successfully');
  }

}