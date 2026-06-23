// import { FrameLocator } from '@playwright/test';

// export class FormEngine {

//   constructor(private frame: FrameLocator) {}

//   getFlexibleLocator(label: string) {
//     const words = label
//       .replace(/\(.*?\)/g, '')
//       .split(' ')
//       .filter(w => w.length > 2);

//     const keyPhrase = words.slice(0, 3).join(' ');
//     return new RegExp(keyPhrase, 'i');
//   }

//   async waitForField(label: string) {
//     await this.frame.getByText(this.getFlexibleLocator(label)).first().waitFor();
//   }

//   async fill(label: string, value: string) {
//     const field = this.frame.getByRole('textbox', {
//       name: this.getFlexibleLocator(label)
//     });

//     if (await field.count()) {
//       await field.fill(value);
//     }
//   }

//   async check(label: string) {
//     await this.frame.getByLabel(this.getFlexibleLocator(label)).check();
//   }

//   async next() {
//     await this.frame.getByRole('button', { name: /next/i }).click();
//   }

//   async submit() {
//     await this.frame.getByRole('button', { name: /submit/i }).click();
//   }

//   async waitForError() {
//     await this.frame.locator('text=Please').first().waitFor();
//   }

//   async waitForTimeout() {
//     await new Promise(r => setTimeout(r, 1000));
//   }

//   async verifySuccess() {
//     await this.frame.getByText(/thank you/i).waitFor();
//   }

//   async waitForNextStepNumber(step: number) {
//     await this.frame.getByText(new RegExp(`Step ${step + 2}`, 'i')).waitFor();
//   }

//   // ✅ Step-based dropdown
//   async validateAllOptionsByIndex(index: number) {

//     const dropdown = this.frame.locator('select:visible').nth(index);

//     const options = await dropdown.locator('option').allTextContents();

//     const valid = options.filter(o => {
//       const v = o.toLowerCase();
//       return v && !v.includes('select') && v !== 'na' && v !== 'n/a';
//     });

//     for (const v of valid) {
//       await dropdown.selectOption({ label: v });
//     }
//   }

//   async selectFinalDropdownValueByIndex(index: number) {

//     const dropdown = this.frame.locator('select:visible').nth(index);

//     const options = await dropdown.locator('option').allTextContents();

//     const valid = options.filter(o => {
//       const v = o.toLowerCase();
//       return v && !v.includes('select') && v !== 'na' && v !== 'n/a';
//     });

//     const random = Math.floor(Math.random() * valid.length);

//     await dropdown.selectOption({ label: valid[random] });
//   }

//   // ✅ Final step dropdown
//   async validateAllOptions(label: string) {

//     const dropdown = this.frame.getByLabel(this.getFlexibleLocator(label));

//     const options = await dropdown.locator('option').allTextContents();

//     const valid = options.filter(o => {
//       const v = o.toLowerCase();
//       return v && !v.includes('select') && v !== 'na' && v !== 'n/a';
//     });

//     for (const v of valid) {
//       await dropdown.selectOption({ label: v });
//     }
//   }

//   async selectFinalDropdownValue(label: string) {

//     const dropdown = this.frame.getByLabel(this.getFlexibleLocator(label));

//     const options = await dropdown.locator('option').allTextContents();

//     const valid = options.filter(o => {
//       const v = o.toLowerCase();
//       return v && !v.includes('select') && v !== 'na' && v !== 'n/a';
//     });

//     const random = Math.floor(Math.random() * valid.length);

//     await dropdown.selectOption({ label: valid[random] });
//   }

//   async fillAllDropdownsInStep() {

//     const dropdowns = this.frame.locator('select:visible');
//     const count = await dropdowns.count();

//     for (let i = 0; i < count; i++) {
//       const dropdown = dropdowns.nth(i);

//       const options = await dropdown.locator('option').allTextContents();

//       const valid = options.filter(o => {
//         const v = o.toLowerCase();
//         return v && !v.includes('select') && v !== 'na' && v !== 'n/a';
//       });

//       if (valid.length > 0) {
//         await dropdown.selectOption({ label: valid[0] });
//       }
//     }
//   }

//   async selectRadio(label: string) {

//     const options = this.frame.getByLabel(new RegExp(label, 'i'));

//     if (await options.count()) {
//         await options.first().click();
//     }
//   }
// }

// import { FrameLocator, Locator } from '@playwright/test';

// export class FormEngine {

//   constructor(private frame: FrameLocator) {}

//   getFlexibleLocator(label: string): RegExp {
//     const words = label
//       .replace(/\(.*?\)/g, '')
//       .split(' ')
//       .filter(word => word.length > 2);

//     return new RegExp(words.slice(0, 3).join(' '), 'i');
//   }

//   async waitForField(label: string) {
//     await this.frame.getByText(this.getFlexibleLocator(label)).first().waitFor();
//   }

//   async fill(label: string, value: string) {
//     const field = this.frame.getByRole('textbox', {
//       name: this.getFlexibleLocator(label),
//     });

//     if (await field.count()) {
//       await field.fill(value);
//     }
//   }

//   async check(label: string) {
//     await this.frame.getByLabel(this.getFlexibleLocator(label)).check();
//   }

//   async selectRadio(label: string) {
//     const radio = this.frame.getByLabel(new RegExp(label, 'i'));

//     if (await radio.count()) {
//       await radio.first().click();
//     }
//   }

//   async next() {
//     await this.frame.getByRole('button', { name: /next/i }).click();
//   }

//   async submit() {
//     await this.frame.getByRole('button', { name: /submit/i }).click();
//   }

//   async waitForError() {
//     await this.frame.locator('text=Please').first().waitFor();
//   }

//   async waitForTimeout(ms = 1000) {
//     await new Promise(resolve => setTimeout(resolve, ms));
//   }

//   async verifySuccess() {
//     await this.frame.getByText(/thank you/i).waitFor();
//   }

//   async waitForNextStepNumber(step: number) {
//     await this.frame.getByText(new RegExp(`Step ${step + 2}`, 'i')).waitFor();
//   }

//   // ===========================================================
//   // Private reusable methods
//   // ===========================================================

//   private async getValidOptions(dropdown: Locator): Promise<string[]> {

//     const options = await dropdown.locator('option').allTextContents();

//     return options.filter(option => {
//       const value = option.trim().toLowerCase();

//       return (
//         value &&
//         !value.includes('select') &&
//         value !== 'na' &&
//         value !== 'n/a'
//       );
//     });
//   }

//   private async selectOption(
//     dropdown: Locator,
//     mode: 'first' | 'random' | 'all'
//   ) {

//     const options = await this.getValidOptions(dropdown);

//     if (!options.length) return;

//     switch (mode) {

//       case 'first':
//         await dropdown.selectOption({ label: options[0] });
//         break;

//       case 'random':
//         await dropdown.selectOption({
//           label: options[Math.floor(Math.random() * options.length)],
//         });
//         break;

//       case 'all':
//         for (const option of options) {
//           await dropdown.selectOption({ label: option });
//         }
//         break;
//     }
//   }

//   // ===========================================================
//   // Dropdown by Label
//   // ===========================================================

//   async validateAllOptions(label: string) {

//     const dropdown = this.frame.getByLabel(this.getFlexibleLocator(label));

//     await this.selectOption(dropdown, 'all');
//   }

//   async selectFinalDropdownValue(label: string) {

//     const dropdown = this.frame.getByLabel(this.getFlexibleLocator(label));

//     await this.selectOption(dropdown, 'random');
//   }

//   // ===========================================================
//   // Dropdown by Index
//   // ===========================================================

//   async validateAllOptionsByIndex(index: number) {

//     const dropdown = this.frame.locator('select:visible').nth(index);

//     await this.selectOption(dropdown, 'all');
//   }

//   async selectFinalDropdownValueByIndex(index: number) {

//     const dropdown = this.frame.locator('select:visible').nth(index);

//     await this.selectOption(dropdown, 'random');
//   }

//   // ===========================================================
//   // Fill all dropdowns in current step
//   // ===========================================================

//   async fillAllDropdownsInStep() {

//     const dropdowns = this.frame.locator('select:visible');

//     const count = await dropdowns.count();

//     for (let i = 0; i < count; i++) {
//       await this.selectOption(dropdowns.nth(i), 'first');
//     }
//   }
// }

// ----------------------------------------------------


// import { FrameLocator, Locator } from '@playwright/test';

// export class FormEngine {

//   constructor(private readonly frame: FrameLocator) {}

//   // ===========================================================
//   // Locator Helpers
//   // ===========================================================

//   getFlexibleLocator(label: string): RegExp {
//     const words = label
//       .replace(/\(.*?\)/g, '')
//       .split(' ')
//       .filter(word => word.length > 2);

//     return new RegExp(words.slice(0, 3).join(' '), 'i');
//   }

//   private textbox(label: string): Locator {
//     return this.frame.getByRole('textbox', {
//       name: this.getFlexibleLocator(label)
//     });
//   }

//   private dropdown(label: string): Locator {
//     return this.frame.getByLabel(this.getFlexibleLocator(label));
//   }

//   private checkbox(label: string): Locator {
//     return this.frame.getByLabel(this.getFlexibleLocator(label));
//   }

//   // ===========================================================
//   // Waits
//   // ===========================================================

//   async waitForField(label: string): Promise<void> {
//     await this.frame
//       .getByText(this.getFlexibleLocator(label))
//       .first()
//       .waitFor();
//   }

//   async waitForError(): Promise<void> {
//     await this.frame
//       .locator('text=/Please/i')
//       .first()
//       .waitFor();
//   }

//   async verifySuccess(): Promise<void> {
//     await this.frame
//       .getByText(/thank you/i)
//       .waitFor();
//   }

//   async waitForNextStep(step: number): Promise<void> {
//     await this.frame
//       .getByText(new RegExp(`Step ${step + 2}`, 'i'))
//       .waitFor();
//   }

//   async waitForTimeout(ms = 1000): Promise<void> {
//     await new Promise(resolve => setTimeout(resolve, ms));
//   }

//   // ===========================================================
//   // Text Fields
//   // ===========================================================

//   async fill(label: string, value: string): Promise<void> {

//     const field = this.textbox(label);

//     if (await field.isVisible()) {
//       await field.fill(value);
//     }
//   }

//   async clear(label: string): Promise<void> {

//     const field = this.textbox(label);

//     if (await field.isVisible()) {
//       await field.clear();
//     }
//   }

//   // ===========================================================
//   // Checkbox
//   // ===========================================================

//   async check(label: string): Promise<void> {

//     const field = this.checkbox(label);

//     if (await field.isVisible()) {
//       await field.check();
//     }
//   }

//   // ===========================================================
//   // Radio
//   // ===========================================================

//   async selectRadio(label: string): Promise<void> {

//     const radio = this.frame.getByLabel(
//       new RegExp(label, 'i')
//     );

//     if (await radio.count()) {
//       await radio.first().click();
//     }
//   }

//   // ===========================================================
//   // Buttons
//   // ===========================================================

//   async next(): Promise<void> {
//     await this.frame
//       .getByRole('button', { name: /next/i })
//       .click();
//   }

//   async submit(): Promise<void> {
//     await this.frame
//       .getByRole('button', { name: /submit/i })
//       .click();
//   }

//   async clickNextOrSubmit(): Promise<void> {

//     const next = this.frame.getByRole('button', {
//       name: /next/i
//     });

//     if (await next.isVisible()) {
//       await next.click();
//       return;
//     }

//     const submit = this.frame.getByRole('button', {
//       name: /submit/i
//     });

//     if (await submit.isVisible()) {
//       await submit.click();
//     }
//   }

//   // ===========================================================
//   // Dropdown Helpers
//   // ===========================================================

//   private async getValidOptions(dropdown: Locator): Promise<string[]> {

//     const options = await dropdown
//       .locator('option')
//       .allTextContents();

//     return options.filter(option => {

//       const value = option.trim().toLowerCase();

//       return (
//         value &&
//         !value.includes('select') &&
//         value !== 'na' &&
//         value !== 'n/a'
//       );
//     });
//   }

//   private async selectOption(
//     dropdown: Locator,
//     mode: 'first' | 'random' | 'all'
//   ): Promise<void> {

//     const options = await this.getValidOptions(dropdown);

//     if (!options.length) return;

//     switch (mode) {

//       case 'first':
//         await dropdown.selectOption({
//           label: options[0]
//         });
//         break;

//       case 'random':
//         await dropdown.selectOption({
//           label: options[
//             Math.floor(Math.random() * options.length)
//           ]
//         });
//         break;

//       case 'all':
//         for (const option of options) {
//           await dropdown.selectOption({
//             label: option
//           });
//         }
//         break;
//     }
//   }

//   // ===========================================================
//   // Dropdown by Label
//   // ===========================================================

//   async validateDropdown(label: string): Promise<void> {
//     await this.selectOption(
//       this.dropdown(label),
//       'all'
//     );
//   }

//   async selectDropdown(label: string): Promise<void> {
//     await this.selectOption(
//       this.dropdown(label),
//       'random'
//     );
//   }

//   // ===========================================================
//   // Dropdown by Index
//   // ===========================================================

//   async validateDropdownByIndex(index: number): Promise<void> {
//     await this.selectOption(
//       this.frame.locator('select:visible').nth(index),
//       'all'
//     );
//   }

//   async selectDropdownByIndex(index: number): Promise<void> {
//     await this.selectOption(
//       this.frame.locator('select:visible').nth(index),
//       'random'
//     );
//   }

//   async fillAllDropdowns(): Promise<void> {

//     const dropdowns = this.frame.locator('select:visible');

//     const count = await dropdowns.count();

//     for (let i = 0; i < count; i++) {
//       await this.selectOption(
//         dropdowns.nth(i),
//         'first'
//       );
//     }
//   }
// }


// -------------------------------------------------------------------------------------------

// ------------------------------------------------------------------------------------------

// -------------------------------------------------------------------------------------------





// // FormEngine.ts

// import { FrameLocator, Locator, expect } from '@playwright/test';

// export class FormEngine {

//   constructor(private readonly frame: FrameLocator) {}

//   // ==========================================================
//   // Generic Locator
//   // ==========================================================

//   private normalize(label: string): RegExp {

//     const words = label
//       .replace(/\(.*?\)/g, '')
//       .replace(/[:*]/g, '')
//       .trim()
//       .split(/\s+/)
//       .filter(word => word.length > 2);

//     return new RegExp(words.join('.*'), 'i');
//   }

//   // ==========================================================
//   // Waits
//   // ==========================================================

//   async waitForField(label: string) {

//     await this.frame
//       .getByText(this.normalize(label))
//       .first()
//       .waitFor();

//   }

//   async wait(ms = 500) {

//     await new Promise(resolve => setTimeout(resolve, ms));

//   }

//   // ==========================================================
//   // Text Fields
//   // ==========================================================

//   async fill(label: string, value: string) {

//     const textbox = this.frame.getByRole('textbox', {
//       name: this.normalize(label)
//     });

//     if (await textbox.count()) {

//       await textbox.first().fill(value);

//       return;

//     }

//     const input = this.frame.getByLabel(this.normalize(label));

//     if (await input.count()) {

//       await input.first().fill(value);

//     }

//   }

//   // ==========================================================
//   // Checkbox
//   // ==========================================================

//   async check(label: string) {

//     const checkbox = this.frame.getByLabel(this.normalize(label));

//     if (await checkbox.count()) {

//       await checkbox.first().check();

//     }

//   }

//   // ==========================================================
//   // Radio
//   // ==========================================================

//   async selectRadio(label: string) {

//     const radio = this.frame.getByLabel(this.normalize(label));

//     if (await radio.count()) {

//       await radio.first().check();

//     }

//   }

//   // ==========================================================
//   // Buttons
//   // ==========================================================

//   async next() {

//     const buttons = [
//       /next/i,
//       /continue/i,
//       /proceed/i
//     ];

//     for (const button of buttons) {

//       const locator = this.frame.getByRole('button', {
//         name: button
//       });

//       if (await locator.count()) {

//         await locator.click();

//         return;

//       }
//     }
//   }

//   async submit() {

//     await this.frame
//       .getByRole('button', {
//         name: /submit/i
//       })
//       .click();

//   }

//   // ==========================================================
//   // Validation
//   // ==========================================================

//   async waitForError() {

//     await this.frame
//       .locator(
//         '[role="alert"], .error, .field-error, .invalid-feedback'
//       )
//       .first()
//       .waitFor();

//   }

//   async verifySuccess() {

//     await expect(
//       this.frame.getByText(/thank you|success|received/i)
//     ).toBeVisible();

//   }

//   // ==========================================================
//   // Dropdown Helpers
//   // ==========================================================

//   private async validOptions(
//     dropdown: Locator
//   ): Promise<string[]> {

//     const options = await dropdown
//       .locator('option')
//       .allTextContents();

//     return options.filter(option => {

//       const text = option.trim().toLowerCase();

//       return (
//         text &&
//         !text.includes('select') &&
//         text !== 'na' &&
//         text !== 'n/a'
//       );

//     });

//   }

//     // ==========================================================
//   // Dropdown Helpers
//   // ==========================================================

//   private async selectOption(
//     dropdown: Locator,
//     strategy: 'first' | 'random' | 'all' = 'random'
//   ) {

//     const options = await this.validOptions(dropdown);

//     if (!options.length) {
//       return;
//     }

//     switch (strategy) {

//       case 'first':

//         await dropdown.selectOption({
//           label: options[0]
//         });

//         break;

//       case 'random':

//         await dropdown.selectOption({
//           label:
//             options[Math.floor(Math.random() * options.length)]
//         });

//         break;

//       case 'all':

//         for (const option of options) {

//           await dropdown.selectOption({
//             label: option
//           });

//             await this.wait(200);

//         }

//         break;
//     }

//   }

//   // ==========================================================
//   // Dropdown By Label
//   // ==========================================================

//   async selectDropdown(
//     label: string,
//     strategy: 'first' | 'random' | 'all' = 'random'
//   ) {

//     const dropdown = this.frame.getByLabel(
//       this.normalize(label)
//     );

//     if (await dropdown.count()) {

//       await this.selectOption(
//         dropdown.first(),
//         strategy
//       );

//     }

//   }

//   // ==========================================================
//   // Dropdown By Index
//   // ==========================================================

//   async selectDropdownByIndex(
//     index: number,
//     strategy: 'first' | 'random' | 'all' = 'random'
//   ) {

//     const dropdown = this.frame
//       .locator('select:visible')
//       .nth(index);

//     await this.selectOption(
//       dropdown,
//       strategy
//     );

//   }

//   // ==========================================================
//   // Current Step Dropdowns
//   // ==========================================================

//   async fillAllDropdowns() {

//     const dropdowns =
//       this.frame.locator('select:visible');

//     const count = await dropdowns.count();

//     for (let i = 0; i < count; i++) {

//       await this.selectOption(
//         dropdowns.nth(i),
//         'random'
//       );

//     }

//   }

//   // ==========================================================
//   // Utility
//   // ==========================================================

//   async hasNextButton(): Promise<boolean> {

//     return await this.frame
//       .getByRole('button', {
//         name: /next/i
//       })
//       .isVisible()
//       .catch(() => false);

//   }

//   async hasSubmitButton(): Promise<boolean> {

//     return await this.frame
//       .getByRole('button', {
//         name: /submit/i
//       })
//       .isVisible()
//       .catch(() => false);

//   }

//   async clickNextOrSubmit() {

//     if (await this.hasNextButton()) {

//       await this.next();

//       return;

//     }

//     if (await this.hasSubmitButton()) {

//       await this.submit();

//     }

//   }

// }


// import { FrameLocator, Locator, expect } from '@playwright/test';
// import { Logger } from './Logger';
// import { DropdownStrategy } from './types';

// export class FormEngine {

//   constructor(
//     private readonly frame: FrameLocator
//   ) {}

//   // =====================================================
//   // Generic Wait
//   // =====================================================

//   async wait(ms: number): Promise<void> {
//     await new Promise(resolve => setTimeout(resolve, ms));
//   }

//   // =====================================================
//   // Flexible Label
//   // =====================================================

//   private flexibleLabel(label: string): RegExp {

//     const cleaned = label
//       .replace(/\(.*?\)/g, '')
//       .replace(/\*/g, '')
//       .trim();

//     return new RegExp(cleaned, 'i');

//   }

//   // =====================================================
//   // Locate Field
//   // =====================================================

//   private async locateField(label: string): Promise<Locator> {

//     const regex = this.flexibleLabel(label);

//     // Strategy 1
//     let locator = this.frame.getByLabel(regex);

//     if (await locator.count()) {
//       return locator.first();
//     }

//     // Strategy 2
//     locator = this.frame.getByPlaceholder(regex);

//     if (await locator.count()) {
//       return locator.first();
//     }

//     // Strategy 3
//     locator = this.frame.getByRole('textbox', {
//       name: regex
//     });

//     if (await locator.count()) {
//       return locator.first();
//     }

//     // Strategy 4
//     locator = this.frame.locator(
//       `input[aria-label*="${label}"]`
//     );

//     if (await locator.count()) {
//       return locator.first();
//     }

//     throw new Error(
//       `Unable to locate field : ${label}`
//     );

//   }

//   // =====================================================
//   // Wait For Field
//   // =====================================================

//   async waitForField(label: string): Promise<void> {

//     Logger.info(`Waiting for "${label}"`);

//     const field = await this.locateField(label);

//     await expect(field).toBeVisible();

//     Logger.success(`${label} displayed`);

//   }

//   // =====================================================
//   // Fill Text
//   // =====================================================

//   async fill(
//     label: string,
//     value: string
//   ): Promise<void> {

//     Logger.field(label, value);

//     const field = await this.locateField(label);

//     await field.fill(value);

//   }

//     // =====================================================
//   // Dropdown Helpers
//   // =====================================================

//   private async getValidOptions(
//     dropdown: Locator
//   ): Promise<string[]> {

//     const options = await dropdown
//       .locator('option')
//       .allTextContents();

//     return options.filter(option => {

//       const value = option.trim().toLowerCase();

//       return (
//         value &&
//         !value.startsWith('select') &&
//         !value.startsWith('choose') &&
//         value !== 'n/a' &&
//         value !== 'na'
//       );

//     });

//   }

//   async selectDropdown(
//     label: string,
//     strategy: DropdownStrategy = 'random'
//   ): Promise<void> {

//     Logger.info(`Selecting dropdown : ${label}`);

//     const dropdown = this.frame.getByLabel(
//       this.flexibleLabel(label)
//     );

//     await dropdown.waitFor();

//     const options = await this.getValidOptions(
//       dropdown
//     );

//     if (!options.length) {
//       throw new Error(
//         `No valid options found for "${label}"`
//       );
//     }

//     let selected: string;

//     switch (strategy) {

//       case 'first':
//         selected = options[0];
//         break;

//       case 'last':
//         selected = options[options.length - 1];
//         break;

//       default:
//         selected =
//           options[
//             Math.floor(Math.random() * options.length)
//           ];

//     }

//     await dropdown.selectOption({
//       label: selected
//     });

//     Logger.success(
//       `${label} = ${selected}`
//     );

//   }

//   // =====================================================
//   // Radio
//   // =====================================================

//   async selectRadio(
//     label: string
//   ): Promise<void> {

//     Logger.info(`Selecting radio : ${label}`);

//     const radio = this.frame.getByLabel(
//       this.flexibleLabel(label)
//     );

//     await radio.first().check();

//     Logger.success(
//       `${label} selected`
//     );

//   }

//   // =====================================================
//   // Checkbox
//   // =====================================================

//   async check(
//     label: string
//   ): Promise<void> {

//     Logger.info(`Checking : ${label}`);

//     const checkbox = this.frame.getByLabel(
//       this.flexibleLabel(label)
//     );

//     await checkbox.check();

//     Logger.success(
//       `${label} checked`
//     );

//   }

//     // =====================================================
//   // Navigation
//   // =====================================================

//   async next(): Promise<void> {

//     Logger.action('Clicking Next');

//     const nextButton = this.frame.getByRole('button', {
//       name: /next|continue/i
//     });

//     await nextButton.first().click();

//   }

//   async submit(): Promise<void> {

//     Logger.action('Clicking Submit');

//     const submitButton = this.frame.getByRole('button', {
//       name: /submit|finish|complete/i
//     });

//     await submitButton.first().click();

//   }

//   // =====================================================
//   // Validation
//   // =====================================================

//   async waitForError(): Promise<void> {

//     Logger.info('Waiting for validation message');

//     await this.frame
//       .locator(
//         'text=/required|please|invalid|enter|select/i'
//       )
//       .first()
//       .waitFor({
//         timeout: 5000
//       });

//     Logger.success('Validation message displayed');

//   }

//   async verifySuccess(): Promise<void> {

//     Logger.info('Waiting for success page');

//     await this.frame
//       .locator(
//         'text=/thank you|congratulations|success/i'
//       )
//       .first()
//       .waitFor({
//         timeout: 10000
//       });

//     Logger.success('Form submitted successfully');

//   }

//   // =====================================================
//   // Utilities
//   // =====================================================

//   async isVisible(label: string): Promise<boolean> {

//     try {

//       const field = await this.locateField(label);

//       return await field.isVisible();

//     } catch {

//       return false;

//     }

//   }

//   async clear(label: string): Promise<void> {

//     const field = await this.locateField(label);

//     await field.clear();

//   }

// }


// import { FrameLocator } from '@playwright/test';
// import { Helpers } from './Helpers';
// import { DefaultData } from './DefaultData';
// import { Logger } from './Logger';

// export type TestMode = 'happy' | 'validation';

// export class FormEngine {

//   private helpers: Helpers;

//   constructor(private frame: FrameLocator) {
//     this.helpers = new Helpers(frame);
//   }

//   /**
//    * Process field based on mode
//    */
//   async processField(label: string, mode: TestMode) {

//     Logger.field(label);

//     const locator = await this.helpers.findField(label);
//     const type = await this.helpers.detectFieldType(locator);

//     if (mode === 'happy') {
//       await this.processHappyField(label, locator, type);
//     } else {
//       await this.processValidationField(label, locator, type);
//     }
//   }

//   /**
//    * =========================
//    * HAPPY FLOW
//    * =========================
//    */
//   private async processHappyField(label: string, locator: any, type: string) {

//     if (type === 'dropdown') {
//       await this.handleDropdownHappy(label, locator);
//       return;
//     }

//     // ✅ ✅ ✅ UPDATED RADIO FIX USING NAME ATTRIBUTE
//     if (type === 'radio') {

//       Logger.action(`Selecting radio for: ${label}`);

//       let radioName = '';
//       const key = label.toLowerCase();

//       if (key.includes('email') && !key.includes('program')) {
//         radioName = 'email_opt_out';
//       } 
//       else if (key.includes('phone')) {
//         radioName = 'do_not_call';
//       } 
//       else if (key.includes('program')) {
//         radioName = 'share_email_opt_out';
//       }

//       if (radioName) {
//         const radios = this.frame.locator(`input[name="${radioName}"]`);

//         if (await radios.count()) {
//           await radios.first().check();   // ✅ selects YES
//           Logger.success(`Radio selected (${radioName})`);
//         } else {
//           Logger.error(`Radio group not found: ${radioName}`);
//         }
//       } else {
//         Logger.error(`No radio mapping for: ${label}`);
//       }

//       return;
//     }

//     if (type === 'checkbox') {
//       await locator.check();
//       Logger.success('Checkbox checked');
//       return;
//     }

//     // text / textarea / email / phone
//     const value = DefaultData.getValue(label);

//     await locator.fill(value);
//     Logger.success(`Entered: ${value}`);
//   }

//   /**
//    * Dropdown happy flow
//    */
//   private async handleDropdownHappy(label: string, locator: any) {

//     Logger.dropdownStart(label);

//     const options = await this.helpers.getDropdownOptions(locator);

//     const validOptions = options.filter(o => o.trim() !== '');

//     for (const option of validOptions) {
//       await this.helpers.selectDropdown(locator, option);
//       Logger.dropdownOption(option);
//     }

//     const random =
//       validOptions[Math.floor(Math.random() * validOptions.length)];

//     await this.helpers.selectDropdown(locator, random);

//     Logger.dropdownSelected(random);
//   }

//   /**
//    * =========================
//    * VALIDATION FLOW
//    * =========================
//    */
//   private async processValidationField(label: string, locator: any, type: string) {

//     const hasError = await this.helpers.isErrorVisible(label);

//     if (!hasError) {
//       Logger.action('No validation error - skipping');
//       return;
//     }

//     Logger.validationError(label);

//     if (type === 'dropdown') {
//       const options = await this.helpers.getDropdownOptions(locator);
//       const valid = options.find(o => o.trim() !== '');
//       if (valid) {
//         await this.helpers.selectDropdown(locator, valid);
//       }
//     }

//     // ✅ ✅ APPLY SAME RADIO FIX HERE ALSO
//     else if (type === 'radio') {

//       let radioName = '';
//       const key = label.toLowerCase();

//       if (key.includes('email') && !key.includes('program')) {
//         radioName = 'email_opt_out';
//       } 
//       else if (key.includes('phone')) {
//         radioName = 'do_not_call';
//       } 
//       else if (key.includes('program')) {
//         radioName = 'share_email_opt_out';
//       }

//       if (radioName) {
//         const radios = this.frame.locator(`input[name="${radioName}"]`);

//         if (await radios.count()) {
//           await radios.first().check();
//         }
//       }
//     }

//     else if (type === 'checkbox') {
//       await locator.check();
//     }

//     else {
//       await this.handleInvalidValues(label, locator);

//       const validValue = DefaultData.getValue(label);
//       await locator.fill(validValue);
//     }

//     await this.helpers.waitForErrorToDisappear(label);

//     Logger.validationResolved(label);
//   }

//   /**
//    * Run invalid values
//    */
//   private async handleInvalidValues(label: string, locator: any) {

//     const key = label.toLowerCase();

//     let invalids: string[] = [];

//     if (key.includes('email')) {
//       invalids = ['test', 'test@', '@gmail.com', 'abc@'];
//     }

//     if (key.includes('phone') || key.includes('mobile')) {
//       invalids = [
//         '1234',
//         '12345678901234567890',
//         '9876543210'
//       ];
//     }

//     for (const value of invalids) {
//       await locator.fill(value);
//       Logger.action(`Testing invalid: ${value}`);
//     }
//   }

//   /**
//    * Click Next
//    */
//   async clickNext() {
//     Logger.action('Clicking primary button');
//     await this.helpers.clickPrimaryButton();
//   }

//   /**
//    * Verify success
//    */
//   async verifySuccess() {
//     await this.helpers.verifyThankYouPage();
//     Logger.success('Form submitted successfully');
//   }

// }










































// import { FrameLocator } from '@playwright/test';
// import { Helpers } from './Helpers';
// import { DefaultData } from './DefaultData';
// import { Logger } from './Logger';

// export type TestMode = 'happy' | 'validation';

// export class FormEngine {

//   private helpers: Helpers;

//   constructor(private frame: FrameLocator) {
//     this.helpers = new Helpers(frame);
//   }

//   /**
//    * Process field based on mode
//    */
//   async processField(label: string, mode: TestMode) {

//     Logger.field(label);

//     const locator = await this.helpers.findField(label);
//     const type = await this.helpers.detectFieldType(locator);

//     if (mode === 'happy') {
//       await this.processHappyField(label, locator, type);
//     } else {
//       await this.processValidationField(label, locator, type);
//     }
//   }

//   /**
//    * =========================
//    * HAPPY FLOW
//    * =========================
//    */
//   private async processHappyField(label: string, locator: any, type: string) {

//     if (type === 'dropdown') {
//       await this.handleDropdownHappy(label, locator);
//       return;
//     }

//     // ✅ YOUR EXISTING RADIO BLOCK (UNCHANGED)
//     if (type === 'radio') {

//       Logger.action(`Selecting radio for: ${label}`);

//       let radioName = '';
//       const key = label.toLowerCase();

//       if (key.includes('email') && !key.includes('program')) {
//         radioName = 'email_opt_out';
//       } 
//       else if (key.includes('phone')) {
//         radioName = 'do_not_call';
//       } 
//       else if (key.includes('program')) {
//         radioName = 'share_email_opt_out';
//       }

//       if (radioName) {
//         const radios = this.frame.locator(`input[name="${radioName}"]`);

//         if (await radios.count()) {
//           await radios.first().check();
//           Logger.success(`Radio selected (${radioName})`);
//         } else {
//           Logger.error(`Radio group not found: ${radioName}`);
//         }
//       }

//       return;
//     }

//     if (type === 'checkbox') {
//       await locator.check();
//       Logger.success('Checkbox checked');
//       return;
//     }

//     // ✅ ✅ ✅ FINAL SAFE FIX (ONLY ADDITION)
//     // Prevent filling on non-input (radio container div)
//     const tagName = await locator.evaluate((el: any) => el.tagName.toLowerCase());

//     if (tagName !== 'input' && tagName !== 'textarea') {

//       Logger.action(`Fallback radio handling for: ${label}`);

//       let radioName = '';
//       const key = label.toLowerCase();

//       if (key.includes('email') && !key.includes('program')) {
//         radioName = 'email_opt_out';
//       } 
//       else if (key.includes('phone')) {
//         radioName = 'do_not_call';
//       } 
//       else if (key.includes('program')) {
//         radioName = 'share_email_opt_out';
//       }

//       if (radioName) {
//         const radios = this.frame.locator(`input[name="${radioName}"]`);

//         if (await radios.count()) {
//           await radios.first().check();
//           Logger.success(`Radio selected (${radioName})`);
//           return;
//         }
//       }
//     }

//     // ✅ NORMAL TEXT FLOW (unchanged)
//     const value = DefaultData.getValue(label);

//     await locator.fill(value);
//     Logger.success(`Entered: ${value}`);
//   }

//   /**
//    * Dropdown happy flow
//    */
//   private async handleDropdownHappy(label: string, locator: any) {

//     Logger.dropdownStart(label);

//     const options = await this.helpers.getDropdownOptions(locator);

//     const validOptions = options.filter(o => o.trim() !== '');

//     for (const option of validOptions) {
//       await this.helpers.selectDropdown(locator, option);
//       Logger.dropdownOption(option);
//     }

//     const random =
//       validOptions[Math.floor(Math.random() * validOptions.length)];

//     await this.helpers.selectDropdown(locator, random);

//     Logger.dropdownSelected(random);
//   }

//   /**
//    * =========================
//    * VALIDATION FLOW
//    * =========================
//    */
//   private async processValidationField(label: string, locator: any, type: string) {

//     const hasError = await this.helpers.isErrorVisible(label);

//     if (!hasError) {
//       Logger.action('No validation error - skipping');
//       return;
//     }

//     Logger.validationError(label);

//     if (type === 'dropdown') {
//       const options = await this.helpers.getDropdownOptions(locator);
//       const valid = options.find(o => o.trim() !== '');
//       if (valid) {
//         await this.helpers.selectDropdown(locator, valid);
//       }
//     }

//     else if (type === 'radio') {

//       let radioName = '';
//       const key = label.toLowerCase();

//       if (key.includes('email') && !key.includes('program')) {
//         radioName = 'email_opt_out';
//       } 
//       else if (key.includes('phone')) {
//         radioName = 'do_not_call';
//       } 
//       else if (key.includes('program')) {
//         radioName = 'share_email_opt_out';
//       }

//       if (radioName) {
//         const radios = this.frame.locator(`input[name="${radioName}"]`);

//         if (await radios.count()) {
//           await radios.first().check();
//         }
//       }
//     }

//     else if (type === 'checkbox') {
//       await locator.check();
//     }

//     else {

//       const tagName = await locator.evaluate(el => el.tagName.toLowerCase());

//       if (tagName !== 'input' && tagName !== 'textarea') {
//         return;
//       }

//       await this.handleInvalidValues(label, locator);

//       const validValue = DefaultData.getValue(label);
//       await locator.fill(validValue);
//     }

//     await this.helpers.waitForErrorToDisappear(label);

//     Logger.validationResolved(label);
//   }

//   /**
//    * Run invalid values
//    */
//   private async handleInvalidValues(label: string, locator: any) {

//     const key = label.toLowerCase();

//     let invalids: string[] = [];

//     if (key.includes('email')) {
//       invalids = ['test', 'test@', '@gmail.com', 'abc@'];
//     }

//     if (key.includes('phone') || key.includes('mobile')) {
//       invalids = [
//         '1234',
//         '12345678901234567890',
//         '9876543210'
//       ];
//     }

//     for (const value of invalids) {
//       await locator.fill(value);
//       Logger.action(`Testing invalid: ${value}`);
//     }
//   }

//   /**
//    * Click Next
//    */
//   async clickNext() {
//     Logger.action('Clicking primary button');
//     await this.helpers.clickPrimaryButton();
//   }

//   /**
//    * Verify success
//    */
//   async verifySuccess() {
//     await this.helpers.verifyThankYouPage();
//     Logger.success('Form submitted successfully');
//   }

// }





































// import { FrameLocator } from '@playwright/test';
// import { Helpers } from './Helpers';
// import { DefaultData } from './DefaultData';
// import { Logger } from './Logger';

// export type TestMode = 'happy' | 'validation';

// export class FormEngine {

//   private helpers: Helpers;

//   constructor(private frame: FrameLocator) {
//     this.helpers = new Helpers(frame);
//   }

//   /**
//    * Process field based on mode
//    */
//   async processField(label: string, mode: TestMode) {

//     Logger.field(label);

//     const locator = await this.helpers.findField(label);
//     const type = await this.helpers.detectFieldType(locator);

//     if (mode === 'happy') {
//       await this.processHappyField(label, locator, type);
//     } else {
//       await this.processValidationField(label, locator, type);
//     }
//   }

//   /**
//    * =========================
//    * HAPPY FLOW
//    * =========================
//    */
//   private async processHappyField(label: string, locator: any, type: string) {

//     if (type === 'dropdown') {
//       await this.handleDropdownHappy(label, locator);
//       return;
//     }

//     if (type === 'radio') {

//       Logger.action(`Selecting radio for: ${label}`);

//       let radioName = '';
//       const key = label.toLowerCase();

//       if (key.includes('email') && !key.includes('program')) {
//         radioName = 'email_opt_out';
//       } 
//       else if (key.includes('phone')) {
//         radioName = 'do_not_call';
//       } 
//       else if (key.includes('program')) {
//         radioName = 'share_email_opt_out';
//       }

//       if (radioName) {
//         const radios = this.frame.locator(`input[name="${radioName}"]`);

//         if (await radios.count()) {
//           await radios.first().check();
//           Logger.success(`Radio selected (${radioName})`);
//         }
//       }

//       return;
//     }

//     if (type === 'checkbox') {
//       await locator.check();
//       Logger.success('Checkbox checked');
//       return;
//     }

//     // ✅ ✅ ✅ ONLY SAFE FIX ADDED HERE (no logic removed)

//     const tagName = await locator.evaluate((el: any) => el.tagName.toLowerCase());
//     const key = label.toLowerCase();

//     // ✅ if locator is NOT input OR duplicate Email radio case
//     if (tagName !== 'input' && tagName !== 'textarea') {

//       Logger.action(`Fallback radio handling for: ${label}`);

//       let radioName = '';

//       if (key === 'email') {
//         radioName = 'email_opt_out';
//       } 
//       else if (key === 'phone') {
//         radioName = 'do_not_call';
//       } 
//       else if (key.includes('program')) {
//         radioName = 'share_email_opt_out';
//       }

//       if (radioName) {
//         const radios = this.frame.locator(`input[name="${radioName}"]`);

//         if (await radios.count()) {
//           await radios.first().check();
//           Logger.success(`Radio selected (${radioName})`);
//           return;
//         }
//       }
//     }

//     // ✅ ORIGINAL TEXT FLOW (UNCHANGED)
//     const value = DefaultData.getValue(label);

//     await locator.fill(value);
//     Logger.success(`Entered: ${value}`);
//   }

//   /**
//    * Dropdown happy flow
//    */
//   private async handleDropdownHappy(label: string, locator: any) {

//     Logger.dropdownStart(label);

//     const options = await this.helpers.getDropdownOptions(locator);

//     const validOptions = options.filter(o => o.trim() !== '');

//     for (const option of validOptions) {
//       await this.helpers.selectDropdown(locator, option);
//       Logger.dropdownOption(option);
//     }

//     const random =
//       validOptions[Math.floor(Math.random() * validOptions.length)];

//     await this.helpers.selectDropdown(locator, random);

//     Logger.dropdownSelected(random);
//   }

//   /**
//    * =========================
//    * VALIDATION FLOW
//    * =========================
//    */
//   private async processValidationField(label: string, locator: any, type: string) {

//     const hasError = await this.helpers.isErrorVisible(label);

//     if (!hasError) {
//       Logger.action('No validation error - skipping');
//       return;
//     }

//     Logger.validationError(label);

//     if (type === 'dropdown') {
//       const options = await this.helpers.getDropdownOptions(locator);
//       const valid = options.find(o => o.trim() !== '');
//       if (valid) {
//         await this.helpers.selectDropdown(locator, valid);
//       }
//     }

//     else if (type === 'radio') {

//       let radioName = '';
//       const key = label.toLowerCase();

//       if (key.includes('email') && !key.includes('program')) {
//         radioName = 'email_opt_out';
//       } 
//       else if (key.includes('phone')) {
//         radioName = 'do_not_call';
//       } 
//       else if (key.includes('program')) {
//         radioName = 'share_email_opt_out';
//       }

//       if (radioName) {
//         const radios = this.frame.locator(`input[name="${radioName}"]`);

//         if (await radios.count()) {
//           await radios.first().check();
//         }
//       }
//     }

//     else if (type === 'checkbox') {
//       await locator.check();
//     }

//     else {

//       const tagName = await locator.evaluate((el: any) => el.tagName.toLowerCase());

//       if (tagName !== 'input' && tagName !== 'textarea') {
//         return;
//       }

//       await this.handleInvalidValues(label, locator);

//       const validValue = DefaultData.getValue(label);
//       await locator.fill(validValue);
//     }

//     await this.helpers.waitForErrorToDisappear(label);

//     Logger.validationResolved(label);
//   }

//   /**
//    * Run invalid values
//    */
//   private async handleInvalidValues(label: string, locator: any) {

//     const key = label.toLowerCase();

//     let invalids: string[] = [];

//     if (key.includes('email')) {
//       invalids = ['test', 'test@', '@gmail.com', 'abc@'];
//     }

//     if (key.includes('phone') || key.includes('mobile')) {
//       invalids = [
//         '1234',
//         '12345678901234567890',
//         '9876543210'
//       ];
//     }

//     for (const value of invalids) {
//       await locator.fill(value);
//       Logger.action(`Testing invalid: ${value}`);
//     }
//   }

//   async clickNext() {
//     Logger.action('Clicking primary button');
//     await this.helpers.clickPrimaryButton();
//   }

//   async verifySuccess() {
//     await this.helpers.verifyThankYouPage();
//     Logger.success('Form submitted successfully');
//   }
// }















// import { FrameLocator } from '@playwright/test';
// import { Helpers } from './Helpers';
// import { DefaultData } from './DefaultData';
// import { Logger } from './Logger';

// export type TestMode = 'happy' | 'validation';

// export class FormEngine {

//   private helpers: Helpers;

//   // ✅ NEW: track duplicate Email fields
//   private emailCount = 0;

//   constructor(private frame: FrameLocator) {
//     this.helpers = new Helpers(frame);
//   }

//   /**
//    * Process field based on mode
//    */
//   async processField(label: string, mode: TestMode) {

//     Logger.field(label);

//     const key = label.toLowerCase();

//     // ✅ ✅ FIX FOR DUPLICATE EMAIL (textbox + radio)
//     if (key === 'email') {

//       this.emailCount++;

//       // ✅ First Email = textbox
//       if (this.emailCount === 1) {

//         const locator = await this.helpers.findField(label);
//         const type = await this.helpers.detectFieldType(locator);

//         if (mode === 'happy') {
//           await this.processHappyField(label, locator, type);
//         } else {
//           await this.processValidationField(label, locator, type);
//         }

//         return;
//       }

//       // ✅ Second Email = radio
//       const radios = this.frame.locator(`input[name="email_opt_out"]`);

//       if (await radios.count()) {
//         await radios.first().check();
//         Logger.success('Email radio selected');
//       }

//       return;
//     }

//     // ✅ PHONE RADIO
//     if (key === 'phone') {

//       const radios = this.frame.locator(`input[name="do_not_call"]`);

//       if (await radios.count()) {
//         await radios.first().check();
//         Logger.success('Phone radio selected');
//       }

//       return;
//     }

//     // ✅ PROGRAM RADIO
//     if (key.includes('program')) {

//       const radios = this.frame.locator(`input[name="share_email_opt_out"]`);

//       if (await radios.count()) {
//         await radios.first().check();
//         Logger.success('Program radio selected');
//       }

//       return;
//     }

//     // ✅ NORMAL FLOW (unchanged)
//     const locator = await this.helpers.findField(label);
//     const type = await this.helpers.detectFieldType(locator);

//     if (mode === 'happy') {
//       await this.processHappyField(label, locator, type);
//     } else {
//       await this.processValidationField(label, locator, type);
//     }
//   }

//   /**
//    * =========================
//    * HAPPY FLOW
//    * =========================
//    */
//   private async processHappyField(label: string, locator: any, type: string) {

//     if (type === 'dropdown') {
//       await this.handleDropdownHappy(label, locator);
//       return;
//     }

//     if (type === 'radio') {
//       return; // ✅ already handled in processField
//     }

//     if (type === 'checkbox') {
//       await locator.check();
//       Logger.success('Checkbox checked');
//       return;
//     }

//     const value = DefaultData.getValue(label);
//     await locator.fill(value);
//     Logger.success(`Entered: ${value}`);
//   }

//   /**
//    * Dropdown happy flow
//    */
//   private async handleDropdownHappy(label: string, locator: any) {

//     Logger.dropdownStart(label);

//     const options = await this.helpers.getDropdownOptions(locator);
//     const validOptions = options.filter(o => o.trim() !== '');

//     for (const option of validOptions) {
//       await this.helpers.selectDropdown(locator, option);
//       Logger.dropdownOption(option);
//     }

//     const random =
//       validOptions[Math.floor(Math.random() * validOptions.length)];

//     await this.helpers.selectDropdown(locator, random);
//     Logger.dropdownSelected(random);
//   }

//   /**
//    * =========================
//    * VALIDATION FLOW
//    * =========================
//    */
//   private async processValidationField(label: string, locator: any, type: string) {

//     const hasError = await this.helpers.isErrorVisible(label);

//     if (!hasError) {
//       Logger.action('No validation error - skipping');
//       return;
//     }

//     Logger.validationError(label);

//     if (type === 'dropdown') {
//       const options = await this.helpers.getDropdownOptions(locator);
//       const valid = options.find(o => o.trim() !== '');
//       if (valid) {
//         await this.helpers.selectDropdown(locator, valid);
//       }
//     }

//     else if (type === 'checkbox') {
//       await locator.check();
//     }

//     else {
//       await this.handleInvalidValues(label, locator);

//       const value = DefaultData.getValue(label);
//       await locator.fill(value);
//     }

//     await this.helpers.waitForErrorToDisappear(label);
//     Logger.validationResolved(label);
//   }

//   /**
//    * Run invalid values
//    */
//   private async handleInvalidValues(label: string, locator: any) {

//     const key = label.toLowerCase();
//     let invalids: string[] = [];

//     if (key.includes('email')) {
//       invalids = ['test', 'test@', '@gmail.com', 'abc@'];
//     }

//     if (key.includes('phone') || key.includes('mobile')) {
//       invalids = [
//         '1234',
//         '12345678901234567890',
//         '9876543210'
//       ];
//     }

//     for (const value of invalids) {
//       await locator.fill(value);
//       Logger.action(`Testing invalid: ${value}`);
//     }
//   }

//   async clickNext() {
//     Logger.action('Clicking primary button');
//     await this.helpers.clickPrimaryButton();
//   }

//   async verifySuccess() {
//     await this.helpers.verifyThankYouPage();
//     Logger.success('Form submitted successfully');
//   }
// }





// import { FrameLocator } from '@playwright/test';
// import { Helpers } from './Helpers';
// import { DefaultData } from './DefaultData';
// import { Logger } from './Logger';

// export type TestMode = 'happy' | 'validation';

// export class FormEngine {

//   private helpers: Helpers;

//   // ✅ fix duplicate Email issue
//   private emailCount = 0;

//   constructor(private frame: FrameLocator) {
//     this.helpers = new Helpers(frame);
//   }

//   /**
//    * MAIN ENTRY
//    */
//   async processField(label: string, mode: TestMode) {

//     Logger.field(label);

//     const key = label.toLowerCase();

//     // ✅ SPECIAL EMAIL HANDLING (textbox + radio)
//     if (key === 'email') {

//       this.emailCount++;

//       // ✅ FIRST → textbox
//       if (this.emailCount === 1) {

//         const locator = await this.helpers.findField(label);
//         const type = await this.helpers.detectFieldType(locator);

//         if (mode === 'happy') {
//           await this.processHappyField(label, locator, type);
//         } else {
//           await this.processValidationField(label, locator, type);
//         }

//         return;
//       }

//       // ✅ SECOND → radio
//       const radios = this.frame.locator(`input[name="email_opt_out"]`);
//       if (await radios.count()) {
//         await radios.first().check();
//         Logger.success('Email radio selected');
//       }

//       return;
//     }

//     // ✅ PHONE RADIO
//     if (key === 'phone') {
//       const radios = this.frame.locator(`input[name="do_not_call"]`);
//       if (await radios.count()) {
//         await radios.first().check();
//         Logger.success('Phone radio selected');
//       }
//       return;
//     }

//     // ✅ PROGRAM RADIO
//     if (key.includes('program')) {
//       const radios = this.frame.locator(`input[name="share_email_opt_out"]`);
//       if (await radios.count()) {
//         await radios.first().check();
//         Logger.success('Program radio selected');
//       }
//       return;
//     }

//     // ✅ NORMAL FIELDS
//     const locator = await this.helpers.findField(label);
//     const type = await this.helpers.detectFieldType(locator);

//     if (mode === 'happy') {
//       await this.processHappyField(label, locator, type);
//     } else {
//       await this.processValidationField(label, locator, type);
//     }
//   }

//   /**
//    * =========================
//    * ✅ HAPPY FLOW
//    * =========================
//    */
//   private async processHappyField(label: string, locator: any, type: string) {

//     if (type === 'dropdown') {
//       await this.handleDropdownHappy(label, locator);
//       return;
//     }

//     if (type === 'checkbox') {
//       await locator.check();
//       Logger.success('Checkbox checked');
//       return;
//     }

//     const value = DefaultData.getValue(label);
//     await locator.fill(value);
//     Logger.success(`Entered: ${value}`);
//   }

//   /**
//    * =========================
//    * ✅ DROPDOWN HANDLING
//    * =========================
//    */
//   private async handleDropdownHappy(label: string, locator: any) {

//     Logger.dropdownStart(label);

//     const options = await this.helpers.getDropdownOptions(locator);
//     const validOptions = options.filter(o => o.trim() !== '');

//     for (const option of validOptions) {
//       await this.helpers.selectDropdown(locator, option);
//       Logger.dropdownOption(option);
//     }

//     const random =
//       validOptions[Math.floor(Math.random() * validOptions.length)];

//     await this.helpers.selectDropdown(locator, random);
//     Logger.dropdownSelected(random);
//   }

//   /**
//    * =========================
//    * ✅ VALIDATION FLOW
//    * =========================
//    */
//   private async processValidationField(label: string, locator: any, type: string) {

//     const key = label.toLowerCase();

//     const hasError = await this.helpers.isErrorVisible(label);

//     if (!hasError) {
//       Logger.action('No validation error - skipping');
//       return;
//     }

//     Logger.validationError(label);

//     // ✅ DROPDOWN
//     if (type === 'dropdown') {
//       const options = await this.helpers.getDropdownOptions(locator);
//       const valid = options.find(o => o.trim() !== '');
//       if (valid) {
//         await this.helpers.selectDropdown(locator, valid);
//       }
//     }

//     // ✅ EMAIL TEXTBOX VALIDATION
//     else if (key.includes('email') && this.emailCount === 1) {

//       const invalids = ['test', 'test@', '@gmail.com'];

//       for (const val of invalids) {
//         await locator.fill(val);
//         Logger.action(`Invalid email: ${val}`);

//         await this.helpers.clickPrimaryButton();
//         await this.helpers.waitForTimeout(500);
//       }

//       const valid = DefaultData.getValue(label);
//       await locator.fill(valid);
//       Logger.success(`Valid email entered`);
//     }

//     // ✅ PHONE TEXT VALIDATION
//     else if (key.includes('phone')) {

//       const invalids = ['123', '999999999999', 'abcd'];

//       for (const val of invalids) {
//         await locator.fill(val);
//         Logger.action(`Invalid phone: ${val}`);

//         await this.helpers.clickPrimaryButton();
//         await this.helpers.waitForTimeout(500);
//       }

//       const valid = DefaultData.getValue(label);
//       await locator.fill(valid);
//       Logger.success(`Valid phone entered`);
//     }

//     // ✅ NORMAL TEXT
//     else {
//       const value = DefaultData.getValue(label);
//       await locator.fill(value);
//     }

//     await this.helpers.waitForErrorToDisappear(label);
//     Logger.validationResolved(label);
//   }

//   /**
//    * =========================
//    * UTILITIES
//    * =========================
//    */
//   async clickNext() {
//     Logger.action('Clicking primary button');
//     await this.helpers.clickPrimaryButton();
//   }

//   async verifySuccess() {
//     await this.helpers.verifyThankYouPage();
//     Logger.success('Form submitted successfully');
//   }

// }









// import { FrameLocator } from '@playwright/test';
// import { Helpers } from './Helpers';
// import { DefaultData } from './DefaultData';
// import { Logger } from './Logger';

// export type TestMode = 'happy' | 'validation';

// export class FormEngine {

//   private helpers: Helpers;
//   private emailCount = 0;

//   constructor(private frame: FrameLocator) {
//     this.helpers = new Helpers(frame);
//   }

//   /**
//    * Process field based on mode
//    */
//   async processField(label: string, mode: TestMode) {

//     Logger.field(label);

//     const key = label.toLowerCase();

//     // ✅ Handle duplicate Email (textbox + radio)
//     if (key === 'email') {

//       this.emailCount++;

//       // ✅ First → textbox
//       if (this.emailCount === 1) {

//         const locator = await this.helpers.findField(label);
//         const type = await this.helpers.detectFieldType(locator);

//         if (mode === 'happy') {
//           await this.processHappyField(label, locator, type);
//         } else {
//           await this.processValidationField(label, locator, type);
//         }

//         return;
//       }

//       // ✅ Second → radio
//       const radios = this.frame.locator(`input[name="email_opt_out"]`);
//       if (await radios.count()) {
//         await radios.first().check();
//         Logger.success('Email radio selected');
//       }
//       return;
//     }

//     // ✅ Phone radio
//     if (key === 'phone') {
//       const radios = this.frame.locator(`input[name="do_not_call"]`);
//       if (await radios.count()) {
//         await radios.first().check();
//         Logger.success('Phone radio selected');
//       }
//       return;
//     }

//     // ✅ Program radio
//     if (key.includes('program')) {
//       const radios = this.frame.locator(`input[name="share_email_opt_out"]`);
//       if (await radios.count()) {
//         await radios.first().check();
//         Logger.success('Program radio selected');
//       }
//       return;
//     }

//     // ✅ Normal fields
//     const locator = await this.helpers.findField(label);
//     const type = await this.helpers.detectFieldType(locator);

//     if (mode === 'happy') {
//       await this.processHappyField(label, locator, type);
//     } else {
//       await this.processValidationField(label, locator, type);
//     }
//   }

//   /**
//    * =========================
//    * ✅ HAPPY FLOW (UNCHANGED)
//    * =========================
//    */
//   private async processHappyField(label: string, locator: any, type: string) {

//     if (type === 'dropdown') {
//       await this.handleDropdownHappy(label, locator);
//       return;
//     }

//     if (type === 'checkbox') {
//       await locator.check();
//       Logger.success('Checkbox checked');
//       return;
//     }

//     const value = DefaultData.getValue(label);
//     await locator.fill(value);
//     Logger.success(`Entered: ${value}`);
//   }

//   /**
//    * Dropdown handling
//    */
//   private async handleDropdownHappy(label: string, locator: any) {

//     Logger.dropdownStart(label);

//     const options = await this.helpers.getDropdownOptions(locator);
//     const validOptions = options.filter(o => o.trim() !== '');

//     for (const option of validOptions) {
//       await this.helpers.selectDropdown(locator, option);
//       Logger.dropdownOption(option);
//     }

//     const random =
//       validOptions[Math.floor(Math.random() * validOptions.length)];

//     await this.helpers.selectDropdown(locator, random);
//     Logger.dropdownSelected(random);
//   }

//   /**
//    * =========================
//    * ✅ VALIDATION FLOW (FIXED ONLY HERE)
//    * =========================
//    */
//   private async processValidationField(label: string, locator: any, type: string) {

//     const key = label.toLowerCase();

//     // ✅ FIX: wait for validation UI to appear
//     await this.helpers.waitForTimeout(800);

//     Logger.validationError(label);

//     // ✅ Dropdown fix
//     if (type === 'dropdown') {
//       const options = await this.helpers.getDropdownOptions(locator);
//       const valid = options.find(o => o.trim() !== '');
//       if (valid) {
//         await this.helpers.selectDropdown(locator, valid);
//         Logger.action(`Selected dropdown`);
//       }
//     }

//     // ✅ Email textbox validation
//     else if (key.includes('email') && this.emailCount === 1) {

//       const invalids = ['test', 'test@', '@gmail.com'];

//       for (const val of invalids) {
//         await locator.fill(val);
//         Logger.action(`Invalid email: ${val}`);

//         await this.helpers.clickPrimaryButton();  // ✅ trigger validation
//         await this.helpers.waitForTimeout(500);
//       }

//       const valid = DefaultData.getValue(label);
//       await locator.fill(valid);

//       Logger.success('Valid email entered');
//     }

//     // ✅ Phone textbox validation
//     else if (key.includes('phone')) {

//       const invalids = ['123', '999999999999', 'abcd'];

//       for (const val of invalids) {
//         await locator.fill(val);
//         Logger.action(`Invalid phone: ${val}`);

//         await this.helpers.clickPrimaryButton();
//         await this.helpers.waitForTimeout(500);
//       }

//       const valid = DefaultData.getValue(label);
//       await locator.fill(valid);

//       Logger.success('Valid phone entered');
//     }

//     // ✅ Checkbox
//     else if (type === 'checkbox') {
//       await locator.check();
//     }

//     // ✅ Normal text
//     else {
//       const value = DefaultData.getValue(label);
//       await locator.fill(value);
//     }

//     // ✅ Wait for error to disappear (IMPORTANT)
//     await this.helpers.waitForErrorToDisappear(label);

//     Logger.validationResolved(label);
//   }

//   /**
//    * Utilities
//    */
//   async clickNext() {
//     Logger.action('Clicking primary button');
//     await this.helpers.clickPrimaryButton();
//   }

//   async verifySuccess() {
//     await this.helpers.verifyThankYouPage();
//     Logger.success('Form submitted successfully');
//   }
// }






















// import { FrameLocator } from '@playwright/test';
// import { Helpers } from './Helpers';
// import { DefaultData } from './DefaultData';
// import { Logger } from './Logger';

// export type TestMode = 'happy' | 'validation';

// export class FormEngine {

//   private helpers: Helpers;
//   private emailCount = 0;

//   constructor(private frame: FrameLocator) {
//     this.helpers = new Helpers(frame);
//   }

//   /**
//    * Process field based on mode
//    */
//   async processField(label: string, mode: TestMode) {

//     Logger.field(label);

//     const key = label.toLowerCase();

//     if (key === 'email') {

//       this.emailCount++;

//       if (this.emailCount === 1) {

//         const locator = await this.helpers.findField(label);
//         const type = await this.helpers.detectFieldType(locator);

//         if (mode === 'happy') {
//           await this.processHappyField(label, locator, type);
//         } else {
//           await this.processValidationField(label, locator, type);
//         }

//         return;
//       }

//       const radios = this.frame.locator(`input[name="email_opt_out"]`);
//       if (await radios.count()) {
//         await radios.first().scrollIntoViewIfNeeded();
//         await radios.first().click();
//         Logger.success('Email radio selected');
//       }

//       return;
//     }

//     if (key === 'phone') {
//       const radios = this.frame.locator(`input[name="do_not_call"]`);
//       if (await radios.count()) {
//         await radios.first().scrollIntoViewIfNeeded();
//         await radios.first().click();
//         Logger.success('Phone radio selected');
//       }
//       return;
//     }

//     if (key.includes('program')) {
//       const radios = this.frame.locator(`input[name="share_email_opt_out"]`);
//       if (await radios.count()) {
//         await radios.first().scrollIntoViewIfNeeded();
//         await radios.first().click();
//         Logger.success('Program radio selected');
//       }
//       return;
//     }

//     const locator = await this.helpers.findField(label);
//     const type = await this.helpers.detectFieldType(locator);

//     if (mode === 'happy') {
//       await this.processHappyField(label, locator, type);
//     } else {
//       await this.processValidationField(label, locator, type);
//     }
//   }

//   /**
//    * HAPPY FLOW
//    */
//   private async processHappyField(label: string, locator: any, type: string) {

//     if (type === 'dropdown') {
//       await this.handleDropdownHappy(label, locator);
//       return;
//     }

//     if (type === 'checkbox') {
//       await locator.check();
//       Logger.success('Checkbox checked');
//       return;
//     }

//     const value = DefaultData.getValue(label);
//     await locator.fill(value);
//     Logger.success(`Entered: ${value}`);
//   }

//   private async handleDropdownHappy(label: string, locator: any) {

//     Logger.dropdownStart(label);

//     const options = await this.helpers.getDropdownOptions(locator);
//     const validOptions = options.filter(o => o.trim() !== '');

//     for (const option of validOptions) {
//       await this.helpers.selectDropdown(locator, option);
//       Logger.dropdownOption(option);
//     }

//     const random =
//       validOptions[Math.floor(Math.random() * validOptions.length)];

//     await this.helpers.selectDropdown(locator, random);
//     Logger.dropdownSelected(random);
//   }

//   /**
//    * VALIDATION FLOW
//    */
//   private async processValidationField(label: string, locator: any, type: string) {

//     const key = label.toLowerCase();

//     await new Promise(res => setTimeout(res, 800));

//     Logger.validationError(label);

//     // ✅ DROPDOWN
//     if (type === 'dropdown') {
//       const options = await this.helpers.getDropdownOptions(locator);
//       const valid = options.find(o => o.trim() !== '');
//       if (valid) {
//         await this.helpers.selectDropdown(locator, valid);
//       }
//     }

//     // ✅ ✅ ✅ ADDED RADIO BLOCK (ONLY CHANGE)
//     else if (key === 'email' && this.emailCount > 1) {

//       const radios = this.frame.locator(`input[name="email_opt_out"]`);
//       if (await radios.count()) {
//         await radios.first().scrollIntoViewIfNeeded();
//         await radios.first().click();
//         Logger.success('Email radio selected (validation)');
//       }
//     }

//     else if (key === 'phone') {

//       const radios = this.frame.locator(`input[name="do_not_call"]`);
//       if (await radios.count()) {
//         await radios.first().scrollIntoViewIfNeeded();
//         await radios.first().click();
//         Logger.success('Phone radio selected (validation)');
//       }
//     }

//     else if (key.includes('program')) {

//       const radios = this.frame.locator(`input[name="share_email_opt_out"]`);
//       if (await radios.count()) {
//         await radios.first().scrollIntoViewIfNeeded();
//         await radios.first().click();
//         Logger.success('Program radio selected (validation)');
//       }
//     }
//     // ✅ ✅ ✅ END OF ADDED BLOCK

//     else if (key.includes('email') && this.emailCount === 1) {

//       const invalids = ['test', 'test@', '@gmail.com'];

//       for (const val of invalids) {
//         await locator.fill(val);
//         Logger.action(`Invalid email: ${val}`);

//         await this.helpers.clickPrimaryButton();
//         await new Promise(res => setTimeout(res, 500));
//       }

//       const valid = DefaultData.getValue(label);
//       await locator.fill(valid);
//     }

//     else if (key.includes('phone')) {

//       const invalids = ['123', '999999999999', 'abcd'];

//       for (const val of invalids) {
//         await locator.fill(val);
//         Logger.action(`Invalid phone: ${val}`);

//         await this.helpers.clickPrimaryButton();
//         await new Promise(res => setTimeout(res, 500));
//       }

//       const valid = DefaultData.getValue(label);
//       await locator.fill(valid);
//     }

//     else if (type === 'checkbox') {
//       await locator.check();
//     }

//     else {
//       const value = DefaultData.getValue(label);
//       await locator.fill(value);
//     }

//     await this.helpers.waitForErrorToDisappear(label);

//     Logger.validationResolved(label);
//   }

//   async clickNext() {
//     Logger.action('Clicking primary button');
//     await this.helpers.clickPrimaryButton();
//   }

//   async verifySuccess() {
//     await this.helpers.verifyThankYouPage();
//     Logger.success('Form submitted successfully');
//   }
// }








// import { FrameLocator } from '@playwright/test';
// import { Helpers } from './Helpers';
// import { DefaultData } from './DefaultData';
// import { Logger } from './Logger';

// export type TestMode = 'happy' | 'validation';

// export class FormEngine {

//   private helpers: Helpers;
//   private emailCount = 0;

//   constructor(private frame: FrameLocator) {
//     this.helpers = new Helpers(frame);
//   }

//   /**
//    * Process field based on mode
//    */
//   async processField(label: string, mode: TestMode) {

//     Logger.field(label);

//     const key = label.toLowerCase();

//     // ✅ EMAIL (textbox + radio)
//     if (key === 'email') {

//       this.emailCount++;

//       // ✅ First Email = textbox
//       if (this.emailCount === 1) {

//         const locator = await this.helpers.findField(label);
//         const type = await this.helpers.detectFieldType(locator);

//         if (mode === 'happy') {
//           await this.processHappyField(label, locator, type);
//         } else {
//           await this.processValidationField(label, locator, type);
//         }

//         return;
//       }

//       // ✅ Second Email = radio
//       const radios = this.frame.locator(`input[name="email_opt_out"]`);
//       if (await radios.count()) {
//         await radios.first().click();   // ✅ FIXED
//         Logger.success('Email radio selected');
//       }
//       return;
//     }

//     // ✅ PHONE RADIO
//     if (key === 'phone') {
//       const radios = this.frame.locator(`input[name="do_not_call"]`);
//       if (await radios.count()) {
//         await radios.first().click();   // ✅ FIXED
//         Logger.success('Phone radio selected');
//       }
//       return;
//     }

//     // ✅ PROGRAM RADIO
//     if (key.includes('program')) {
//       const radios = this.frame.locator(`input[name="share_email_opt_out"]`);
//       if (await radios.count()) {
//         await radios.first().click();   // ✅ FIXED
//         Logger.success('Program radio selected');
//       }
//       return;
//     }

//     // ✅ NORMAL FLOW
//     const locator = await this.helpers.findField(label);
//     const type = await this.helpers.detectFieldType(locator);

//     if (mode === 'happy') {
//       await this.processHappyField(label, locator, type);
//     } else {
//       await this.processValidationField(label, locator, type);
//     }
//   }

//   /**
//    * =========================
//    * ✅ HAPPY FLOW
//    * =========================
//    */
//   private async processHappyField(label: string, locator: any, type: string) {

//     if (type === 'dropdown') {
//       await this.handleDropdownHappy(label, locator);
//       return;
//     }

//     if (type === 'checkbox') {
//       await locator.check();
//       Logger.success('Checkbox checked');
//       return;
//     }

//     const value = DefaultData.getValue(label);
//     await locator.fill(value);
//     Logger.success(`Entered: ${value}`);
//   }

//   /**
//    * Dropdown handling
//    */
//   private async handleDropdownHappy(label: string, locator: any) {

//     Logger.dropdownStart(label);

//     const options = await this.helpers.getDropdownOptions(locator);
//     const validOptions = options.filter(o => o.trim() !== '');

//     for (const option of validOptions) {
//       await this.helpers.selectDropdown(locator, option);
//       Logger.dropdownOption(option);
//     }

//     const random =
//       validOptions[Math.floor(Math.random() * validOptions.length)];

//     await this.helpers.selectDropdown(locator, random);
//     Logger.dropdownSelected(random);
//   }

//   /**
//    * =========================
//    * ✅ VALIDATION FLOW (FIXED)
//    * =========================
//    */
//   private async processValidationField(label: string, locator: any, type: string) {

//     const key = label.toLowerCase();

//     // ✅ WAIT for validation UI
//     await new Promise(res => setTimeout(res, 800));

//     Logger.validationError(label);

//     // ✅ DROPDOWN
//     if (type === 'dropdown') {
//       const options = await this.helpers.getDropdownOptions(locator);
//       const valid = options.find(o => o.trim() !== '');
//       if (valid) {
//         await this.helpers.selectDropdown(locator, valid);
//       }
//     }

//     // ✅ ✅ RADIO (VALIDATION FIX)
//     else if (key === 'email' && this.emailCount > 1) {
//       const radios = this.frame.locator(`input[name="email_opt_out"]`);
//       if (await radios.count()) {
//         await radios.first().click();
//         Logger.success('Email radio selected (validation)');
//       }
//     }

//     else if (key === 'phone') {
//       const radios = this.frame.locator(`input[name="do_not_call"]`);
//       if (await radios.count()) {
//         await radios.first().click();
//         Logger.success('Phone radio selected (validation)');
//       }
//     }

//     else if (key.includes('program')) {
//       const radios = this.frame.locator(`input[name="share_email_opt_out"]`);
//       if (await radios.count()) {
//         await radios.first().click();
//         Logger.success('Program radio selected (validation)');
//       }
//     }

//     // ✅ EMAIL TEXTBOX VALIDATION
//     else if (key.includes('email') && this.emailCount === 1) {

//       const invalids = ['test', 'test@', '@gmail.com'];

//       for (const val of invalids) {
//         await locator.fill(val);
//         Logger.action(`Invalid email: ${val}`);

//         await this.helpers.clickPrimaryButton();
//         await new Promise(res => setTimeout(res, 500));
//       }

//       const valid = DefaultData.getValue(label);
//       await locator.fill(valid);
//       Logger.success('Valid email entered');
//     }

//     // ✅ PHONE TEXT VALIDATION
//     else if (key.includes('phone')) {

//       const invalids = ['123', '999999999999', 'abcd'];

//       for (const val of invalids) {
//         await locator.fill(val);
//         Logger.action(`Invalid phone: ${val}`);

//         await this.helpers.clickPrimaryButton();
//         await new Promise(res => setTimeout(res, 500));
//       }

//       const valid = DefaultData.getValue(label);
//       await locator.fill(valid);
//       Logger.success('Valid phone entered');
//     }

//     // ✅ CHECKBOX
//     else if (type === 'checkbox') {
//       await locator.check();
//     }

//     // ✅ NORMAL TEXT
//     else {
//       const value = DefaultData.getValue(label);
//       await locator.fill(value);
//     }

//     // ✅ WAIT for error to disappear
//     await this.helpers.waitForErrorToDisappear(label);

//     Logger.validationResolved(label);
//   }

//   /**
//    * utilities
//    */
//   async clickNext() {
//     Logger.action('Clicking primary button');
//     await this.helpers.clickPrimaryButton();
//   }

//   async verifySuccess() {
//     await this.helpers.verifyThankYouPage();
//     Logger.success('Form submitted successfully');
//   }
// }






// import { FrameLocator } from '@playwright/test';
// import { Helpers } from './Helpers';
// import { DefaultData } from './DefaultData';
// import { Logger } from './Logger';

// export type TestMode = 'happy' | 'validation';

// export class FormEngine {

//   private helpers: Helpers;
//   private emailCount = 0;

//   constructor(private frame: FrameLocator) {
//     this.helpers = new Helpers(frame);
//   }

//   /**
//    * MAIN ENTRY
//    */
//   async processField(label: string, mode: TestMode) {

//     Logger.field(label);

//     const key = label.toLowerCase();

//     // ✅ Handle duplicate Email (textbox + radio)
//     if (key === 'email') {

//       this.emailCount++;

//       if (this.emailCount === 1) {

//         const locator = await this.helpers.findField(label);
//         const type = await this.helpers.detectFieldType(locator);

//         if (mode === 'happy') {
//           await this.processHappyField(label, locator, type);
//         } else {
//           await this.processValidationField(label, locator, type);
//         }

//         return;
//       }

//       // ✅ Email radio
//       const radio = this.frame.locator(`input[name="email_opt_out"][value="yes"]`);
//       if (await radio.count()) {
//         await radio.click();
//         await radio.click();
//         Logger.success('Email radio selected');
//       }

//       return;
//     }



//     // ✅ Phone radio
//     if (key === 'phone') {

//       const radio = this.frame.locator(`input[name="do_not_call"][value="yes"]`);
//       if (await radio.count()) {
//         await radio.click();
//         await radio.click();
//         Logger.success('Phone radio selected');
//       }

//       return;
//     }

//     // ✅ Program radio
//     if (key.includes('email me')) {

//       const radio = this.frame.locator(`input[name="share_email_opt_out"][value="yes"]`);
//       if (await radio.count()) {
//         await radio.click();
//         await radio.click();
//         Logger.success('Program radio selected');
//       }

//       return;
//     }

//     // ✅ Normal fields
//     const locator = await this.helpers.findField(label);
//     const type = await this.helpers.detectFieldType(locator);

//     if (mode === 'happy') {
//       await this.processHappyField(label, locator, type);
//     } else {
//       await this.processValidationField(label, locator, type);
//     }
//   }

//   /**
//    * =========================
//    * ✅ HAPPY FLOW
//    * =========================
//    */
//   private async processHappyField(label: string, locator: any, type: string) {

//     if (type === 'dropdown') {
//       await this.handleDropdownHappy(label, locator);
//       return;
//     }

//     if (type === 'checkbox') {
//       await locator.check();
//       Logger.success('Checkbox checked');
//       return;
//     }

//     const value = DefaultData.getValue(label);
//     await locator.fill(value);
//     Logger.success(`Entered: ${value}`);
//   }

//   /**
//    * ✅ DROPDOWN HANDLING
//    */
//   private async handleDropdownHappy(label: string, locator: any) {

//     Logger.dropdownStart(label);

//     const options = await this.helpers.getDropdownOptions(locator);
//     const validOptions = options.filter(o => o.trim() !== '');

//     for (const option of validOptions) {
//       await this.helpers.selectDropdown(locator, option);
//       Logger.dropdownOption(option);
//     }

//     const random =
//       validOptions[Math.floor(Math.random() * validOptions.length)];

//     await this.helpers.selectDropdown(locator, random);
//     Logger.dropdownSelected(random);
//   }

//   /**
//    * =========================
//    * ✅ VALIDATION FLOW (FINAL)
//    * =========================
//    */
//   private async processValidationField(label: string, locator: any, type: string) {

//     const key = label.toLowerCase();

//     // ✅ wait for validation UI
//     await new Promise(res => setTimeout(res, 800));

//     Logger.validationError(label);

//     // ✅ DROPDOWN
//     if (type === 'dropdown') {

//       const options = await this.helpers.getDropdownOptions(locator);
//       const valid = options.find(o => o.trim() !== '');

//       if (valid) {
//         await this.helpers.selectDropdown(locator, valid);
//         Logger.success('Dropdown selected');
//       }
//     }

//     // ✅ ✅ RADIO (FIXED)
//     else if (type === 'radio') {

//       let radioName = '';

//       if (key === 'email') {
//         radioName = 'email_opt_out';
//       }
//       else if (key === 'phone') {
//         radioName = 'do_not_call';
//       }
//       else if (key.includes('program')) {
//         radioName = 'share_email_opt_out';
//       }

//       const radio = this.frame.locator(`input[name="${radioName}"][value="yes"]`);

//       if (await radio.count()) {
//         await radio.click();
//         Logger.success(`Radio selected (${radioName})`);
//       }
//     }

//     // ✅ EMAIL TEXTBOX VALIDATION
//     else if (key.includes('email')) {

//       const invalids = ['test', 'test@', '@gmail.com'];

//       for (const val of invalids) {

//         await locator.fill(val);
//         Logger.action(`Invalid email: ${val}`);

//         await this.helpers.clickPrimaryButton();
//         await new Promise(res => setTimeout(res, 500));
//       }

//       const valid = DefaultData.getValue(label);
//       await locator.fill(valid);

//       Logger.success('Valid email entered');
//     }

//     // ✅ PHONE TEXT VALIDATION
//     else if (key.includes('phone')) {

//       const invalids = ['123', '999999999999', 'abcd'];

//       for (const val of invalids) {

//         await locator.fill(val);
//         Logger.action(`Invalid phone: ${val}`);

//         await this.helpers.clickPrimaryButton();
//         await new Promise(res => setTimeout(res, 500));
//       }

//       const valid = DefaultData.getValue(label);
//       await locator.fill(valid);

//       Logger.success('Valid phone entered');
//     }

//     // ✅ CHECKBOX
//     else if (type === 'checkbox') {
//       await locator.check();
//       Logger.success('Checkbox checked');
//     }

//     // ✅ NORMAL TEXT
//     else {

//       const value = DefaultData.getValue(label);
//       await locator.fill(value);
//       Logger.success(`Entered: ${value}`);
//     }

//     // ✅ wait until error disappears
//     await this.helpers.waitForErrorToDisappear(label);

//     Logger.validationResolved(label);
//   }

//   /**
//    * UTILITIES
//    */
//   async clickNext() {
//     Logger.action('Clicking primary button');
//     await this.helpers.clickPrimaryButton();
//   }

//   async verifySuccess() {
//     await this.helpers.verifyThankYouPage();
//     Logger.success('Form submitted successfully');
//   }
// }



























import { FrameLocator } from '@playwright/test';
import { Helpers } from './Helpers';
import { DefaultData } from './DefaultData';
import { Logger } from './Logger';

export type TestMode = 'happy' | 'validation';

export class FormEngine {

  private helpers: Helpers;
  private emailCount = 0;

  constructor(private frame: FrameLocator) {
    this.helpers = new Helpers(frame);
  }

  /**
   * MAIN ENTRY
   */
  async processField(label: string, mode: TestMode, jsonType?: string) {

    Logger.field(label);

    const key = label.toLowerCase();

    const locator: any = await this.helpers.findField(label);
    const detectedType: string = await this.helpers.detectFieldType(locator);
    const type = jsonType || detectedType;

    // ✅ EMAIL TEXTBOX
    if (key.includes('email') && type !== 'radio') {

      this.emailCount++;

      if (this.emailCount === 1) {

        if (mode === 'happy') {
          await this.processHappyField(label, locator, type);
        } else {
          await this.processValidationField(label, locator, type);
        }

        return;
      }
    }
    

    // ✅ EMAIL RADIO
    if (key.includes('email') && type === 'radio') {

      const radio = this.frame.locator(`input[name="email_opt_out"][value="yes"]`);

      if (await radio.count()) {
        await radio.click();
        Logger.success('Email radio selected');
      }

      return;
    }

    // ✅ PHONE RADIO
    if (key.includes('phone') && type === 'radio') {

      const radio = this.frame.locator(`input[name="do_not_call"][value="yes"]`);

      if (await radio.count()) {
        await radio.click();
        Logger.success('Phone radio selected');
      }

      return;
    }

    // ✅ PROGRAM RADIO
    if (key.includes('program') && type === 'radio') {

      const radio = this.frame.locator(`input[name="share_email_opt_out"][value="yes"]`);

      if (await radio.count()) {
        await radio.click();
        Logger.success('Program radio selected');
      }

      return;
    }

    if (key.includes('edX, and its parent company,') && type === 'radio') {

      const radio = this.frame.locator(`input[name="gdprProspect2uOptIn"][value="yes"]`);

      if (await radio.count()) {
        await radio.click();
        Logger.success('Program radio selected');
      }

      return;
    }

    // ✅ NORMAL FLOW
    if (mode === 'happy') {
      await this.processHappyField(label, locator, type);
    } else {
      await this.processValidationField(label, locator, type);
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
        Logger.action(`Dropdown option: ${option}`);
      }

      const random =
        validOptions[Math.floor(Math.random() * validOptions.length)];

      await this.helpers.selectDropdown(locator, random);

      Logger.success(`Final selected: ${random}`);

      return;
    }

    // ✅ CHECKBOX
    if (type === 'checkbox') {
      await locator.check();
      return;
    }

    // ✅ TEXT
    const value = DefaultData.getValue(label);
    await locator.fill(value);
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

      Logger.success('Valid email entered');
    }

    // ✅ PHONE VALIDATION
    else if (key.includes('phone') && type !== 'radio') {

      const invalids = ['123', '999999999999', 'abcd'];

      for (const val of invalids) {
        await locator.fill(val);
        Logger.action(`Invalid phone: ${val}`);
        await this.helpers.clickPrimaryButton();
        await new Promise(res => setTimeout(res, 500));
      }

      const valid = DefaultData.getValue(label);
      await locator.fill(valid);

      Logger.success('Valid phone entered');
    }

    // ✅ CHECKBOX
    else if (type === 'checkbox') {
      await locator.check();
    }

    // ✅ NORMAL TEXT
    else {
      const value = DefaultData.getValue(label);
      await locator.fill(value);
    }

    await this.helpers.waitForErrorToDisappear(label);
    Logger.validationResolved(label);
  }

  async clickNext() {
    await this.helpers.clickPrimaryButton();
  }

  async verifySuccess() {
    await this.helpers.verifyThankYouPage();
    Logger.success('Form submitted successfully');
  }
}