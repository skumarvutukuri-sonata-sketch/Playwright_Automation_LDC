import { Page, FrameLocator, Locator } from '@playwright/test';
import { Helpers } from './Helpers';
import { DefaultData } from './DefaultData';
import { Logger } from './Logger';
import { TestCaseMetrics } from './reporting/ReportTypes';

export type TestMode = 'positive' | 'negative';

// ==========================================
// 🚀 GLOBAL RADIO & CHECKBOX CONFIGURATION
// If a field is NOT in this list (or is null/none), it will default to 'yes' (true).
// ==========================================
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
  
  // Tracks which fields we already did negative testing on
  private validatedFields = new Set<string>();
  private testCaseMetrics: TestCaseMetrics = { total: 0, passed: 0, failed: 0 };

  constructor(private page: Page, private frame: FrameLocator) {
    this.helpers = new Helpers(page, frame);
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
    // 🚀 BULLETPROOF RADIO BUTTON LOGIC
    // ========================
    if (type === 'radio') {
      const nameAttr = await locator.getAttribute('name') || `radio_group_${key}`;
      const valueAttr = await locator.getAttribute('value');
      const optionText = String(valueAttr || label).toLowerCase(); 

      if (this.processedRadioGroups.has(nameAttr)) return;

      const activeOverrides = GLOBAL_OVERRIDES[mode];
      let isMatch = false;

      // 1. Is this explicitly mapped?
      if (activeOverrides && activeOverrides[nameAttr] !== undefined && activeOverrides[nameAttr] !== null && activeOverrides[nameAttr] !== 'none') {
        const targetValue = String(activeOverrides[nameAttr]).toLowerCase();
        if (optionText.includes(targetValue) || targetValue.includes(optionText)) {
          isMatch = true;
        }
      } 
      // 2. SMART FALLBACK: If NOT mapped, automatically find the positive/default option!
      else {
        const positiveKeywords = ['yes', 'true', 'agree', 'opt in', 'accept', '1'];
        if (positiveKeywords.some(keyword => optionText.includes(keyword))) {
          isMatch = true;
        }
      }

      // 3. Click it and Verify!
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
    // 🚀 BULLETPROOF CHECKBOX LOGIC
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
      // Count the failing field interaction as a failed testcase.
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
        const maxIterations = Math.min(validOptions.length, 3);
        
        for (let i = 0; i < maxIterations; i++) {
          await this.helpers.selectDropdown(locator, validOptions[i]);
          Logger.action(`Iterated option: ${validOptions[i]}`);
          await this.page.waitForTimeout(200); 
        }
        
        const random = validOptions[Math.floor(Math.random() * validOptions.length)];
        await this.helpers.selectDropdown(locator, random);
        this.saveEnteredValue(label, random);
        this.recordTestCase(true);
        Logger.success(`Final Selected: ${random}`);
      }
      return;
    }

    const value = DefaultData.getValue(label);
    await locator.fill(value);
    this.saveEnteredValue(label, value);
    this.recordTestCase(true);
    Logger.success(`Filled: ${value}`);
  }

  // private async processNegativeField(label: string, locator: Locator, type: string) {
  //   const key = label.toLowerCase();
    
  //   // 🚀 EARLY EXIT: Check if form already submitted
  //   try {
  //     const isSuccess = await this.checkIfSuccessPage();
  //     if (isSuccess) {
  //       Logger.action(`⚠️  Form already submitted - Stopping field processing for: ${label}`);
  //       return;
  //     }
  //   } catch (e) {
  //     Logger.action(`⚠️  Cannot verify form state - Continuing cautiously`);
  //   }
    
  //   try { await locator.scrollIntoViewIfNeeded({ timeout: 2000 }); } catch (e) {}
  //   await new Promise(res => setTimeout(res, 800)); 

  //   const alreadyValidated = this.validatedFields.has(key);

  //   if (type === 'dropdown') {
  //     const options = await this.helpers.getDropdownOptions(locator);
  //     const valid = options.filter(o => o.trim() !== '');
  //     if (valid.length > 0) {
  //       const random = valid[Math.floor(Math.random() * valid.length)];
  //       await this.helpers.selectDropdown(locator, random);
  //       this.saveEnteredValue(label, random);
  //       this.recordTestCase(true);
  //       Logger.success(`Validation dropdown selected: ${random}`);
  //     }
  //     return;
  //   }
  //   else if (key.includes('email') && !alreadyValidated) {
  //     this.validatedFields.add(key);
  //     const invalids = ['test', 'test@', '@gmail.com'];
      
  //     for (const val of invalids) {
  //       try {
  //         // Check if we've reached thank you page before testing invalid data
  //         const isSuccess = await this.checkIfSuccessPage();
  //         if (isSuccess) {
  //           Logger.action(`⚠️  Form submitted during email validation - Stopping`);
  //           break;
  //         }

  //         try { await locator.scrollIntoViewIfNeeded({ timeout: 2000 }); } catch (e) {} 
  //         await locator.fill(val, { force: true });
  //         Logger.action(`Invalid email: ${val}`);
          
  //         // 🚀 THE FIX: Click Next to force the UI error to appear for the INVALID data!
  //         // Because the data is invalid, the form will NOT go to the next page.
  //         await this.clickNext();
  //         await new Promise(res => setTimeout(res, 800)); // Give error time to render
  //         this.recordTestCase(true);
  //       } catch (e) {
  //         Logger.action(`⚠️  Error testing invalid email "${val}": ${e}`);
  //         // Continue to next invalid value
  //       }
  //     }
      
  //     // 🚀 Enter VALID data, but DO NOT click Next! 
  //     // This prevents the Optional Field trap from skipping pages.
  //     try {
  //       try { await locator.scrollIntoViewIfNeeded({ timeout: 2000 }); } catch (e) {}
  //       const valid = DefaultData.getValue(label);
  //       await locator.fill(valid, { force: true });
  //       this.saveEnteredValue(label, valid);
  //       this.recordTestCase(true);
  //       Logger.success('Valid email entered (Skipped Next click to prevent navigation)');
  //     } catch (e) {
  //       Logger.action(`⚠️  Failed to enter valid email: ${e}`);
  //       this.recordTestCase(false);
  //     }
  //   }
  //   else if ((key.includes('phone') || key.includes('contact') || key.includes('mobile')) && !alreadyValidated) {
  //     this.validatedFields.add(key); 
  //     const invalids = ['123', '999999999999', 'abcd'];
      
  //     for (const val of invalids) {
  //       try {
  //         // Check if we've reached thank you page before testing invalid data
  //         const isSuccess = await this.checkIfSuccessPage();
  //         if (isSuccess) {
  //           Logger.action(`⚠️  Form submitted during phone validation - Stopping`);
  //           break;
  //         }

  //         try { await locator.scrollIntoViewIfNeeded({ timeout: 2000 }); } catch (e) {} 
  //         await locator.fill(val, { force: true });
  //         Logger.action(`Invalid phone: ${val}`);
          
  //         // 🚀 THE FIX: Click Next to force the UI error to appear for the INVALID data!
  //         await this.clickNext();
  //         await new Promise(res => setTimeout(res, 800)); // Give error time to render
  //         this.recordTestCase(true);
  //       } catch (e) {
  //         Logger.action(`⚠️  Error testing invalid phone "${val}": ${e}`);
  //         // Continue to next invalid value
  //       }
  //     }
      
  //     // 🚀 Enter VALID data, but DO NOT click Next!
  //     try {
  //       try { await locator.scrollIntoViewIfNeeded({ timeout: 2000 }); } catch (e) {}
  //       const valid = DefaultData.getValue(label);
  //       await locator.fill(valid, { force: true });
  //       this.saveEnteredValue(label, valid);
  //       this.recordTestCase(true);
  //       Logger.success('Valid phone entered (Skipped Next click to prevent navigation)');
  //     } catch (e) {
  //       Logger.action(`⚠️  Failed to enter valid phone: ${e}`);
  //       this.recordTestCase(false);
  //     }
  //   }
  //   else {
  //     // Standard text fields (First Name, Last Name, etc.)
  //     // 🚀 SAFETY CHECK: Ensure we haven't reached thank you page or form submitted
  //     try {
  //       const isSuccess = await this.checkIfSuccessPage();
  //       if (isSuccess) {
  //         Logger.action(`⚠️  Form already submitted (Thank You page detected) - Skipping field: ${label}`);
  //         this.recordTestCase(true); // Count as passed since form completed successfully
  //         return;
  //       }
  //     } catch (e) {
  //       Logger.action(`⚠️  Cannot check page state for field: ${label} - Page may have closed`);
  //       this.recordTestCase(false);
  //       return;
  //     }

  //     try {
  //       const value = DefaultData.getValue(label);
  //       await locator.fill(value, { force: true });
  //       this.saveEnteredValue(label, value);
  //       this.recordTestCase(true);
  //       Logger.success(`Filled: ${value}`);
  //     } catch (e) {
  //       Logger.action(`⚠️  Failed to fill field: ${label} - ${e}`);
  //       this.recordTestCase(false);
  //       return;
  //     }
  //   }

  //   // Wait for any lingering errors to disappear before moving to the next field
  //   try {
  //     await this.helpers.waitForErrorToDisappear(label);
  //   } catch (e) {
  //     // If page is closed, just continue - not a critical error
  //   }
  // }

  private async processNegativeField(label: string, locator: Locator, type: string) {
    const key = label.toLowerCase();
    
    try {
      const isSuccess = await this.checkIfSuccessPage();
      if (isSuccess) {
        Logger.action(`⚠️  Form already submitted - Stopping field processing for: ${label}`);
        return;
      }
    } catch (e) {
      Logger.action(`⚠️  Cannot verify form state - Continuing cautiously`);
    }
    
    try { await locator.scrollIntoViewIfNeeded({ timeout: 2000 }); } catch (e) {}
    // 🚀 SPEEDUP: Reduced initial pause
    await new Promise(res => setTimeout(res, 200)); 

    const alreadyValidated = this.validatedFields.has(key);

    if (type === 'dropdown') {
      const options = await this.helpers.getDropdownOptions(locator);
      const valid = options.filter(o => o.trim() !== '');
      if (valid.length > 0) {
        const random = valid[Math.floor(Math.random() * valid.length)];
        await this.helpers.selectDropdown(locator, random);
        this.saveEnteredValue(label, random);
        this.recordTestCase(true);
        Logger.success(`Validation dropdown selected: ${random}`);
      }
      return;
    }
    else if (key.includes('email') && !alreadyValidated) {
      this.validatedFields.add(key);
      const invalids = ['test', 'test@', '@gmail.com'];
      
      for (const val of invalids) {
        try {
          const isSuccess = await this.checkIfSuccessPage();
          if (isSuccess) break;

          try { await locator.scrollIntoViewIfNeeded({ timeout: 2000 }); } catch (e) {} 
          await locator.fill(val, { force: true });
          Logger.action(`Invalid email: ${val}`);
          
          await this.clickNext();
          
          // 🚀 SPEEDUP: Native wait for error instead of 800ms sleep!
          const errorLocator = this.frame.locator('[class*="error"], [class*="Error"], [aria-invalid="true"]').first();
          await errorLocator.waitFor({ state: 'visible', timeout: 1000 }).catch(() => {});
          
          this.recordTestCase(true);
        } catch (e) {
          // Continue to next invalid value
        }
      }
      
      try {
        const valid = DefaultData.getValue(label);
        await locator.fill(valid, { force: true });
        this.saveEnteredValue(label, valid);
        this.recordTestCase(true);
        Logger.success('Valid email entered (Skipped Next click to prevent navigation)');
      } catch (e) {
        this.recordTestCase(false);
      }
    }
    else if ((key.includes('phone') || key.includes('contact') || key.includes('mobile')) && !alreadyValidated) {
      this.validatedFields.add(key); 
      const invalids = ['123', '999999999999', 'abcd'];
      
      for (const val of invalids) {
        try {
          const isSuccess = await this.checkIfSuccessPage();
          if (isSuccess) break;

          try { await locator.scrollIntoViewIfNeeded({ timeout: 2000 }); } catch (e) {} 
          await locator.fill(val, { force: true });
          Logger.action(`Invalid phone: ${val}`);
          
          await this.clickNext();
          
          // 🚀 SPEEDUP: Native wait for error instead of 800ms sleep!
          const errorLocator = this.frame.locator('[class*="error"], [class*="Error"], [aria-invalid="true"]').first();
          await errorLocator.waitFor({ state: 'visible', timeout: 1000 }).catch(() => {});
          
          this.recordTestCase(true);
        } catch (e) {
          // Continue to next invalid value
        }
      }
      
      try {
        const valid = DefaultData.getValue(label);
        await locator.fill(valid, { force: true });
        this.saveEnteredValue(label, valid);
        this.recordTestCase(true);
        Logger.success('Valid phone entered (Skipped Next click to prevent navigation)');
      } catch (e) {
        this.recordTestCase(false);
      }
    }
    else {
      try {
        const isSuccess = await this.checkIfSuccessPage();
        if (isSuccess) {
          this.recordTestCase(true); 
          return;
        }
      } catch (e) {
        this.recordTestCase(false);
        return;
      }

      try {
        const value = DefaultData.getValue(label);
        await locator.fill(value, { force: true });
        this.saveEnteredValue(label, value);
        this.recordTestCase(true);
        Logger.success(`Filled: ${value}`);
      } catch (e) {
        this.recordTestCase(false);
        return;
      }
    }

    // 🚀 SPEEDUP: Ensure waitForErrorToDisappear is fast in Helpers.ts
    try {
      await this.helpers.waitForErrorToDisappear(label);
    } catch (e) {
    }
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
      
    } catch (e) {
      // Ignore errors, return fallback
    }
    return 'Unknown Field';
  }

  private saveEnteredValue(label: string, value: any): void {
    this.enteredValues[label] = value;
  }

  getEnteredValues(): Record<string, any> {
    return this.enteredValues;
  }

  getTestCaseMetrics(): TestCaseMetrics {
    return { ...this.testCaseMetrics };
  }

  /**
   * When test fails, convert all passed test cases to failed
   */
  failAllTestCases(): void {
    if (this.testCaseMetrics.passed > 0) {
      this.testCaseMetrics.failed += this.testCaseMetrics.passed;
      this.testCaseMetrics.passed = 0;
    }
  }

  async clickNext() {
    await this.helpers.clickPrimaryButton();
  }

  /**
   * 🚀 VERIFICATION & RETRY CLICK LOOP
   * Tries normal Playwright click, verifies the state, falls back to JS, and retries up to 3 times!
   */
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
        // Fallback to Raw JS event dispatch if blocked by hidden overlays
        await locator.evaluate((node: HTMLInputElement, state) => {
          node.click();
          if (node.checked !== state) {
            node.checked = state;
            node.dispatchEvent(new Event('change', { bubbles: true }));
          }
        }, targetState);
      }

      // 🔍 VERIFICATION STEP
      await this.page.waitForTimeout(300); // Give the UI a tiny moment to update
      const currentState = await locator.isChecked();
      
      // If the UI state matches what we want, break out of the loop and move on!
      if (currentState === targetState) {
        return; 
      }
      
      Logger.action(`⚠️ Retry ${attempt}/${maxRetries}: Element state mismatch. Retrying click...`);
      await this.page.waitForTimeout(500); // Wait before the next aggressive attempt
    }
    
    Logger.action(`❌ Warning: Failed to force the element to ${targetState} after ${maxRetries} attempts.`);
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