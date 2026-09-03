import { Page, FrameLocator, Locator } from '@playwright/test';
import { Helpers } from './Helpers';
import { DefaultData } from './DefaultData';
import { Logger } from './Logger';
import { TestCaseMetrics } from './reporting/ReportTypes';

export type TestMode = 'positive' | 'negative';

const GLOBAL_OVERRIDES: Record<TestMode, Record<string, any>> = {
  positive: {
    'email_opt_out': 'yes',
    'do_not_call': 'yes',
    'gdpr_prospectpartner_opt_in': 'true',
    'gdprProspect2uOptIn': true,
    'b2b_interest': 'true'
  },
  negative: {
    'email_opt_out': 'no',
    'do_not_call': 'no',
    'gdpr_prospectpartner_opt_in': 'false',
    'gdprProspect2uOptIn': false,
    'b2b_interest': 'false'
  }
};

export class FormEngine {
  private helpers: Helpers;
  private enteredValues: Record<string, any> = {};
  private processedRadioGroups = new Set<string>();
  private validatedFields = new Set<string>();
  private testCaseMetrics: TestCaseMetrics = { total: 0, passed: 0, failed: 0 };
  private currentGroupId: string = 'UNKNOWN';

  constructor(private page: Page, private frame: FrameLocator) {
    this.helpers = new Helpers(page, frame);
  }

  setGroupId(groupId: string) {
    this.currentGroupId = groupId;
  }

  async checkIfSuccessPage(): Promise<boolean> {
    return await this.helpers.isThankYouPageVisible();
  }

  resetStepState() {
    this.processedRadioGroups.clear();
  }

  async processDynamicElement(locator: Locator, mode: TestMode) {
    const type = await this.helpers.detectFieldType(locator);
    const label = await this.getLabelFromElement(locator);
    const key = label.toLowerCase();

    Logger.field(`${label} (${type})`);

    // ========================
    // RADIO BUTTON LOGIC
    // ========================
    if (type === 'radio') {
      const nameAttr = await locator.getAttribute('name') || `radio_group_${key}`;
      const valueAttr = await locator.getAttribute('value');
      const optionText = String(valueAttr || label).toLowerCase(); 

      if (this.processedRadioGroups.has(nameAttr)) return;

      const activeOverrides = GLOBAL_OVERRIDES[mode];
      let isMatch = false;

      if (activeOverrides && activeOverrides[nameAttr] !== undefined && activeOverrides[nameAttr] !== null && activeOverrides[nameAttr] !== 'none') {
        const targetValue = String(activeOverrides[nameAttr]).toLowerCase();
        if (optionText.includes(targetValue) || targetValue.includes(optionText)) {
          isMatch = true;
        }
      } else {
        const positiveKeywords = ['yes', 'true', 'agree', 'opt in', 'accept', '1'];
        if (positiveKeywords.some(keyword => optionText.includes(keyword))) {
          isMatch = true;
        }
      }

      if (isMatch) {
        try { await locator.scrollIntoViewIfNeeded({ timeout: 2000 }); } catch (e) {}
        
        await this.forceClickCheckboxOrRadio(locator, true);
        this.processedRadioGroups.add(nameAttr); 
        this.saveEnteredValue(nameAttr, optionText);
        this.recordTestCase(true);
        Logger.success(`Radio [${nameAttr}] selected: ${optionText}`);
      }
      return; 
    }

    // ========================
    // CHECKBOX LOGIC
    // ========================
    if (type === 'checkbox') {
      const nameAttr = await locator.getAttribute('name') || label;
      const valueAttr = await locator.getAttribute('value');
      const optionText = valueAttr || 'true';

      const activeOverrides = GLOBAL_OVERRIDES[mode];
      let shouldBeChecked = true; 
      
      if (activeOverrides && activeOverrides[nameAttr] !== undefined && activeOverrides[nameAttr] !== null && activeOverrides[nameAttr] !== 'none') {
        const overrideStr = String(activeOverrides[nameAttr]).toLowerCase();
        if (overrideStr === 'false' || overrideStr === 'no') {
           shouldBeChecked = false;
        }
      }

      try { await locator.scrollIntoViewIfNeeded({ timeout: 2000 }); } catch (e) {}
      
      const isCurrentlyChecked = await locator.isChecked();
      if ((shouldBeChecked && !isCurrentlyChecked) || (!shouldBeChecked && isCurrentlyChecked)) {
         await this.forceClickCheckboxOrRadio(locator, shouldBeChecked);
      }
      
      this.saveEnteredValue(nameAttr, shouldBeChecked ? optionText : 'false');
      this.recordTestCase(true);
      Logger.success(`Checkbox [${nameAttr}] set to: ${shouldBeChecked}`);
      return;
    }

    // ========================
    // TEXT & DROPDOWN LOGIC
    // ========================
    try {
      if (mode === 'positive') {
        await this.processPositiveField(label, locator, type);
      } else {
        await this.processNegativeField(label, locator, type);
      }
    } catch (error) {
      this.recordTestCase(false);
      throw error;
    }
  }

  private async processPositiveField(label: string, locator: Locator, type: string) {
    await locator.scrollIntoViewIfNeeded();
    await this.page.waitForTimeout(200);
    
    if (type === 'dropdown') {
      const options = await this.helpers.getDropdownOptions(locator);
      const validOptions = options.filter(o => o.trim() !== '');
      
      if (validOptions.length > 0) {
        const random = validOptions[Math.floor(Math.random() * validOptions.length)];
        await this.helpers.selectDropdown(locator, random);
        this.saveEnteredValue(label, random);
        this.recordTestCase(true);
        Logger.success(`Selected [${label}]: ${random}`);
      }
      return;
    }

    const value = DefaultData.getValue(label, 'positive', this.currentGroupId);
    await locator.fill(value);
    this.saveEnteredValue(label, value);
    this.recordTestCase(true);
    Logger.success(`Filled [${label}]: ${value}`);
  }

  /**
   * Processes Negative Mode inputs.
   */
  private async processNegativeField(label: string, locator: Locator, type: string) {
    const key = label.toLowerCase();
    
    try {
      if (await this.checkIfSuccessPage()) return;
    } catch (e) {}
    
    try { await locator.scrollIntoViewIfNeeded({ timeout: 2000 }); } catch (e) {}
    await new Promise(res => setTimeout(res, 200)); 

    const alreadyValidated = this.validatedFields.has(key);

    // 1. DROPDOWNS
    if (type === 'dropdown') {
      const options = await this.helpers.getDropdownOptions(locator);
      const valid = options.filter(o => o.trim() !== '' && !o.includes('Select'));
      if (valid.length > 0) {
        const selectedOption = valid[Math.floor(Math.random() * valid.length)];
        await this.helpers.selectDropdown(locator, selectedOption);
        this.saveEnteredValue(label, selectedOption);
        this.recordTestCase(true);
        Logger.success(`Selected dropdown option [${label}]: ${selectedOption}`);
      }
      return;
    }

    // 2. EMAIL FIELDS
    else if (key.includes('email') && !alreadyValidated) {
      this.validatedFields.add(key);
      const invalids = ['test', 'test@', '@gmail.com'];
      
      for (const val of invalids) {
        try {
          if (await this.checkIfSuccessPage()) break;
          await locator.fill(val, { force: true });
          Logger.action(`Invalid email check: ${val}`);
          await this.clickNext();
          
          const errorLocator = this.frame.locator('[class*="error"], [class*="Error"], [aria-invalid="true"]').first();
          await errorLocator.waitFor({ state: 'visible', timeout: 800 }).catch(() => {});
          this.recordTestCase(true);
        } catch (e) {}
      }
      
      try {
        const valid = DefaultData.getValue(label, 'negative', this.currentGroupId);
        await locator.fill(valid, { force: true });
        this.saveEnteredValue(label, valid);
        this.recordTestCase(true);
        Logger.success(`Valid email entered [${label}]: ${valid}`);
      } catch (e) {
        this.recordTestCase(false);
      }
    }

    // 3. PHONE / CONTACT NUMBER (OPTIONAL OR MANDATORY)
    else if ((key.includes('phone') || key.includes('contact') || key.includes('mobile')) && !alreadyValidated) {
      this.validatedFields.add(key); 
      const isOptional = key.includes('optional');
      const invalids = ['123', 'abcd'];
      
      for (const val of invalids) {
        try {
          if (await this.checkIfSuccessPage()) break;
          await locator.fill(val, { force: true });
          Logger.action(`Invalid phone check: ${val}`);
          
          // 🚀 FIX: Skip clickNext if the phone field is optional to prevent premature form submission!
          if (!isOptional) {
            await this.clickNext();
            const errorLocator = this.frame.locator('[class*="error"], [class*="Error"], [aria-invalid="true"]').first();
            await errorLocator.waitFor({ state: 'visible', timeout: 800 }).catch(() => {});
          }
          
          this.recordTestCase(true);
        } catch (e) {}
      }
      
      try {
        const valid = DefaultData.getValue(label, 'negative', this.currentGroupId);
        await locator.fill(valid, { force: true });
        this.saveEnteredValue(label, valid);
        this.recordTestCase(true);
        Logger.success(`Valid phone entered [${label}]: ${valid}`);
      } catch (e) {
        this.recordTestCase(false);
      }
    }

    // 4. ALL OTHER TEXT INPUTS
    else {
      try {
        const value = DefaultData.getValue(label, 'negative', this.currentGroupId);
        await locator.fill(value, { force: true });
        this.saveEnteredValue(label, value);
        this.recordTestCase(true);
        Logger.success(`Filled field [${label}]: ${value}`);
      } catch (e) {
        this.recordTestCase(false);
      }
    }

    try {
      await this.helpers.waitForErrorToDisappear(label);
    } catch (e) {}
  }

  private async getLabelFromElement(locator: Locator): Promise<string> {
    try {
      const ariaLabel = await locator.getAttribute('aria-label');
      if (ariaLabel) return ariaLabel.trim();

      const id = await locator.getAttribute('id');
      if (id) {
        const labelEl = this.frame.locator(`label[for="${id}"]`);
        if (await labelEl.count() > 0) {
          const text = await labelEl.first().innerText();
          return text.replace(/\*/g, '').trim();
        }
      }

      const placeholder = await locator.getAttribute('placeholder');
      if (placeholder) return placeholder.trim();

      const name = await locator.getAttribute('name');
      if (name) return name.replace(/_/g, ' ').trim();
      
    } catch (e) {}
    return 'Unknown Field';
  }

  private saveEnteredValue(label: string, value: any): void {
    this.enteredValues[label] = value;
  }
  
  getEnteredValues(): Record<string, any> {
    return this.enteredValues;
  }

  async getMergedFormValues(): Promise<Record<string, any>> {
    try {
      const hiddenFields = await this.frame.locator('input[type="hidden"]').evaluateAll((inputs) => {
        const data: Record<string, string> = {};
        inputs.forEach(input => {
          const el = input as HTMLInputElement;
          if (el.name && el.value) {
            data[el.name] = el.value;
          }
        });
        return data;
      });
      
      return { ...hiddenFields, ...this.enteredValues };
    } catch (error) {
      return this.enteredValues;
    }
  }

  getTestCaseMetrics(): TestCaseMetrics {
    return { ...this.testCaseMetrics };
  }

  failAllTestCases(): void {
    if (this.testCaseMetrics.passed > 0) {
      this.testCaseMetrics.failed += this.testCaseMetrics.passed;
      this.testCaseMetrics.passed = 0;
    }
  }

  async clickNext() {
    await this.helpers.clickPrimaryButton();
  }

  private async forceClickCheckboxOrRadio(locator: Locator, targetState: boolean) {
    const maxRetries = 3;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        if (targetState) {
          await locator.check({ force: true, timeout: 2000 });
        } else {
          await locator.uncheck({ force: true, timeout: 2000 });
        }
      } catch (error) {
        await locator.evaluate((node: HTMLInputElement, state) => {
          node.click();
          if (node.checked !== state) node.checked = state;
        }, targetState);
      }

      await locator.dispatchEvent('change').catch(() => {});
      await locator.dispatchEvent('input').catch(() => {});

      await this.page.waitForTimeout(300);
      const currentState = await locator.isChecked().catch(() => targetState);
      
      if (currentState === targetState) {
        await this.page.waitForTimeout(500);
        return; 
      }
      
      await this.page.waitForTimeout(500);
    }
  }

  private recordTestCase(passed: boolean): void {
    this.testCaseMetrics.total += 1;
    if (passed) {
      this.testCaseMetrics.passed += 1;
      return;
    }
    this.testCaseMetrics.failed += 1;
  }
}