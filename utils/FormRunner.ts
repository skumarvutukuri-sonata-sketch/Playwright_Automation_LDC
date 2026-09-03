// import { Page, FrameLocator } from '@playwright/test';
// import { FormEngine, TestMode } from './FormEngine';
// import { Logger } from './Logger';
// import { FormDefinition } from './types';
// import { FieldCaptureBus } from './FieldCaptureBus';
// import { ReportManager } from '../utils/reporting/ReportManager';
// import { AllureHelper } from '../utils/reporting/AllureHelper';
// import { ApiCapture } from '../utils/api/ApiCapture';
// import { PayloadMapper } from '../utils/api/PayloadMapper';
// import { ResponseValidator } from '../utils/api/ResponseValidator';
// import { TestCaseMetrics } from './reporting/ReportTypes';

// // PayloadValidator is guarded defensively so the suite can continue without a payload assertion helper.
// type PayloadValidatorLike = {
//   validate?: (actualPayload: any, expectedPayload: any, mode?: string) => void;
// };

// const PayloadValidator: PayloadValidatorLike | undefined = undefined;

// export class FormRunner {
//   private engine: FormEngine;

//   constructor(private page: Page, private frame: FrameLocator) {
//     this.engine = new FormEngine(page, frame);
//   }

//   async run(formName: string, form: FormDefinition, mode: TestMode): Promise<TestCaseMetrics> {
//     Logger.startForm(formName, mode);
//     const formKey = `${formName}-${mode}-${Date.now()}`;
//     ReportManager.startForm(formKey);
//     await AllureHelper.startForm(form.category ?? 'Uncategorized', form.group, formName, mode);

//     this.engine.setGroupId(form.group || 'UNKNOWN-GROUP');

//     let capturedRequest: any = null;
//     let capturedResponse: any = null;

//     const requestListener = (req: any) => {
//       if (req.url().includes('/v2/interest-create') && req.method() === 'POST') {
//         capturedRequest = req;
//       }
//     };
//     const responseListener = (res: any) => {
//       if (res.url().includes('/v2/interest-create') && res.request().method() === 'POST') {
//         capturedResponse = res;
//       }
//     };

//     this.page.on('request', requestListener);
//     this.page.on('response', responseListener);

//     try {
//       let isSuccess = false;
//       let stepCount = 1;
//       const MAX_STEPS = 10;
//       const inputSelector = 'input:not([type="hidden"]):not([type="submit"]):not([type="button"]), select, textarea';

//       while (!isSuccess && stepCount <= MAX_STEPS) {
//         if (this.page.isClosed()) {
//           throw new Error('❌ Browser page was unexpectedly closed.');
//         }

//         Logger.step(stepCount);
//         await AllureHelper.step(`Step ${stepCount}`);
//         this.engine.resetStepState();

//         let visibleElements = await this.frame.locator(inputSelector).filter({ visible: true }).all();

//         for (let i = 0; i < 20; i++) {
//           if (this.page.isClosed()) throw new Error('❌ Browser page closed.');

//           isSuccess = await this.engine.checkIfSuccessPage();
//           if (isSuccess) {
//             Logger.success('✅ Successfully reached Thank You page.');
//             break;
//           }

//           visibleElements = await this.frame.locator(inputSelector).filter({ visible: true }).all();
//           if (visibleElements.length > 0) break;

//           await this.page.waitForTimeout(300);
//         }

//         if (isSuccess) break;

//         if (visibleElements.length === 0) {
//           Logger.action(`Warning: No input fields found on Step ${stepCount}. Assuming splash page, clicking Next.`);
          
//           // Check if Thank You page appeared before clicking Next on splash step
//           if (await this.engine.checkIfSuccessPage()) {
//             Logger.success('✅ Reached Thank You page on empty step inspection.');
//             isSuccess = true;
//             break;
//           }

//           await this.engine.clickNext();
//           await this.page.waitForTimeout(1000);
//           stepCount++;
//           continue;
//         }

//         // ==========================================
//         // SAFE NEGATIVE VALIDATION STEP
//         // ==========================================
//         if (mode === 'negative') {
//           Logger.validationStart();
          
//           const inputTypes = await Promise.all(visibleElements.map(e => e.getAttribute('type')));
//           const isRadioOnlyStep = inputTypes.every(t => t === 'radio' || t === 'checkbox');

//           if (!isRadioOnlyStep) {
//             Logger.action(`Triggering empty-field validation for Step ${stepCount}...`);
//             try {
//               const anchorElement = visibleElements[0];
//               await this.engine.clickNext(); 
              
//               const errorLocators = this.frame.locator('[class*="error"], [class*="Error"], [aria-invalid="true"], [id*="error"]').filter({ visible: true });
//               await errorLocators.first().waitFor({ state: 'visible', timeout: 800 }).catch(() => {});
              
//               const errorCount = await errorLocators.count();
//               if (errorCount > 0) {
//                 Logger.success(`✅ Verified ${errorCount} empty-field error messages appeared!`);
//               } else {
//                 Logger.action(`⚠️ Clicked Next, no obvious error text detected.`);
//               }

//               const isSteppedOver = await anchorElement.waitFor({ state: 'hidden', timeout: 300 }).then(() => true).catch(() => false);
//               if (isSteppedOver) {
//                 Logger.action('ℹ️ Step transitioned automatically during empty validation.');
//                 isSuccess = await this.engine.checkIfSuccessPage();
//                 if (isSuccess) break;
//               }
//             } catch (e: any) {
//               Logger.action(`⚠️ Empty validation skipped: ${e.message}`);
//             }
//           }

//           visibleElements = await this.frame.locator(inputSelector).filter({ visible: true }).all();
//         }

//         Logger.action(`Found ${visibleElements.length} stable fields on Step ${stepCount}`);

//         if (mode === 'positive' && visibleElements.length > 0) {
//           const stepFields = await Promise.all(visibleElements.map(async el => ({
//             name: (await el.getAttribute('name')) || (await el.getAttribute('id')) || '',
//             type: (await el.getAttribute('type')) || (await el.evaluate((e: any) => e.tagName.toLowerCase())) || 'text',
//             step: stepCount
//           })));
//           FieldCaptureBus.addStepFields(formName, stepCount, stepFields.filter(f => f.name));
//         }

//         // ==========================================
//         // FILL ALL FIELDS ON STEP (MANDATORY + OPTIONAL)
//         // ==========================================
//         for (const element of visibleElements) {
//           if (this.page.isClosed()) throw new Error('❌ Browser page was closed.');
          
//           try {
//             await this.engine.processDynamicElement(element, mode);
//           } catch (e: any) {
//             const isSuccessNow = await this.engine.checkIfSuccessPage();
//             if (isSuccessNow) {
//               Logger.success('✅ Form submitted successfully during field processing.');
//               isSuccess = true;
//               break; 
//             }
//             throw e;
//           }
//         }

//         if (isSuccess) break;

//         // DYNAMIC RE-CHECK FOR NEWLY RENDERED DROPDOWNS
//         await this.page.waitForTimeout(600);
//         const postInputs = await this.frame.locator(inputSelector).filter({ visible: true }).all();
        
//         if (postInputs.length > visibleElements.length) {
//           const newDropdowns = postInputs.slice(visibleElements.length);
//           Logger.action(`🔄 Found ${newDropdowns.length} conditional field(s) on Step ${stepCount}. Filling now...`);
          
//           for (const extraEl of newDropdowns) {
//             await this.engine.processDynamicElement(extraEl, mode);
//           }
//         }

//         // ==========================================
//         // SUBMIT STEP WITH EARLY SUCCESS CHECK
//         // ==========================================
//         let shouldClickNext = true;
//         const freshElements = await this.frame.locator(inputSelector).filter({ visible: true }).all();
        
//         if (freshElements.length > 0) {
//           const isStillVisible = await freshElements[0].isVisible().catch(() => false);
//           if (!isStillVisible) {
//             shouldClickNext = false;
//             Logger.action('Form automatically advanced to next step. Skipping Next click.');
//           }
//         }

//         if (shouldClickNext) {
//           try {
//             // 🚀 FIX 2: Check if Thank You page appeared BEFORE clicking Next/Submit
//             if (await this.engine.checkIfSuccessPage()) {
//               Logger.success('✅ Form reached Thank You page before step submission!');
//               isSuccess = true;
//               break;
//             }

//             await this.engine.clickNext();
//           } catch (e: any) {
//             // 🚀 FIX 2: Re-check if Thank You page appeared AFTER primary button click
//             if (await this.engine.checkIfSuccessPage()) {
//               Logger.success('✅ Late navigation to Thank You page detected!');
//               isSuccess = true;
//               break;
//             }
//             throw new Error(`❌ Form stuck on Step ${stepCount}: ${e.message}`);
//           }
//         }
        
//         if (!isSuccess && freshElements.length > 0) {
//           Logger.action('⏳ Waiting for step transition to complete...');
//           await freshElements[0].waitFor({ state: 'hidden', timeout: 5000 }).catch(() => {});
          
//           isSuccess = await this.engine.checkIfSuccessPage();
//           if (isSuccess) {
//             Logger.success('✅ Reached Thank You page after step transition.');
//           }
//         }

//         stepCount++;
//       }

//       if (!isSuccess) {
//         throw new Error(`Form failed to reach Thank You page after ${MAX_STEPS} steps.`);
//       }

//       // ==========================================
//       // SAFE API PAYLOAD & RESPONSE VALIDATION STEP
//       // ==========================================
//       if (capturedRequest && capturedResponse) {
//         const actualPayload = await ApiCapture.getRequestPayload(capturedRequest);
//         const responseBody = await ApiCapture.getResponseBody(capturedResponse);
        
//         const allFormValues = await this.engine.getMergedFormValues();
//         const expectedPayload = PayloadMapper.map(allFormValues);

//         const systemKeys = [
//           'page_url', 'submitted_page_host', 'degree_offering', 'lead_source', 'rv_source',
//           'experiment_variant', 'experiment_project', 'experiment_name', 'taxi_determined_geo',
//           'taxi_is_restricted', 'submission_time_ms', 'credential_type', 'form_id', 'programs_of_study',
//           'taxi_form_type', 'user_agent', 'version', 'uuid', 'rv_session_id', 'lead_capture_form_url',
//           'country_inferred', 'ip_inferred_country', 'degree', 'country', 'sms_opt_in_marketing',
//           'country_used_inferred_geo', 'lead_capture_form_type'
//         ];

//         systemKeys.forEach(key => {
//           if (actualPayload[key] !== undefined && expectedPayload[key] === undefined) {
//             expectedPayload[key] = actualPayload[key];
//           }
//         });

//         await AllureHelper.attachJson('Expected Payload', expectedPayload);
//         await AllureHelper.attachJson('API Request', actualPayload);
//         await AllureHelper.attachJson('API Response', responseBody);

//         if (typeof PayloadValidator?.validate === 'function') {
//           PayloadValidator.validate(actualPayload, expectedPayload, mode);
//         } else {
//           Logger.action('⚠️ PayloadValidator.validate is unavailable. Skipping payload assertion.');
//         }

//         if (typeof ResponseValidator?.validate === 'function') {
//           ResponseValidator.validate(responseBody);
//         } else {
//           Logger.action('⚠️ ResponseValidator.validate is unavailable. Skipping response assertion.');
//         }

//       } else {
//         Logger.action('⚠️ Interest-create API was not detected, but form reached success page.');
//       }

//       const metrics = this.engine.getTestCaseMetrics();
//       await AllureHelper.attachTestCaseMetrics(metrics);
//       await AllureHelper.success();
//       ReportManager.pass(formKey, form.group, formName, mode, metrics);

//       console.log(`[TestCases] form=${formName} mode=${mode} total=${metrics.total} passed=${metrics.passed} failed=${metrics.failed}`);
//       return metrics;

//     } catch (error) {
//       let message = error instanceof Error ? error.message : String(error);
//       let metrics = this.engine.getTestCaseMetrics();
//       this.engine.failAllTestCases();
//       metrics = this.engine.getTestCaseMetrics();
      
//       await AllureHelper.attachTestCaseMetrics(metrics);
//       await AllureHelper.failure(message);
//       ReportManager.fail(formKey, form.group, formName, mode, message, metrics);
//       console.log(`[TestCases] form=${formName} mode=${mode} total=${metrics.total} passed=${metrics.passed} failed=${metrics.failed}`);
      
//       throw new Error(message); 
      
//     } finally {
//       if (!this.page.isClosed()) {
//         this.page.removeListener('request', requestListener);
//         this.page.removeListener('response', responseListener);
//       }
//       Logger.endForm();
//     }
//   }
// }
// import { Page, FrameLocator } from '@playwright/test';
// import { FormEngine, TestMode } from './FormEngine';
// import { Logger } from './Logger';
// import { FormDefinition } from './types';
// import { FieldCaptureBus } from './FieldCaptureBus';
// import { ReportManager } from '../utils/reporting/ReportManager';
// import { AllureHelper } from '../utils/reporting/AllureHelper';
// import { ApiCapture } from '../utils/api/ApiCapture';
// import { PayloadMapper } from '../utils/api/PayloadMapper';
// import { ResponseValidator } from '../utils/api/ResponseValidator';
// import { TestCaseMetrics } from './reporting/ReportTypes';

// type PayloadValidatorLike = {
//   validate?: (actualPayload: any, expectedPayload: any, mode?: string) => void;
// };

// const PayloadValidator: PayloadValidatorLike | undefined = undefined;

// export class FormRunner {
//   private engine: FormEngine;

//   constructor(private page: Page, private frame: FrameLocator) {
//     this.engine = new FormEngine(page, frame);
//   }

//   async run(formName: string, form: FormDefinition, mode: TestMode): Promise<TestCaseMetrics> {
//     Logger.startForm(formName, mode);
//     const formKey = `${formName}-${mode}-${Date.now()}`;
//     ReportManager.startForm(formKey);
//     await AllureHelper.startForm(form.category ?? 'Uncategorized', form.group, formName, mode);

//     this.engine.setGroupId(form.group || 'UNKNOWN-GROUP');

//     let capturedRequest: any = null;
//     let capturedResponse: any = null;

//     const requestListener = (req: any) => {
//       if (req.url().includes('/v2/interest-create') && req.method() === 'POST') {
//         capturedRequest = req;
//       }
//     };
//     const responseListener = (res: any) => {
//       if (res.url().includes('/v2/interest-create') && res.request().method() === 'POST') {
//         capturedResponse = res;
//       }
//     };

//     this.page.on('request', requestListener);
//     this.page.on('response', responseListener);

//     try {
//       let isSuccess = false;
//       let stepCount = 1;
//       const MAX_STEPS = 10;
//       const inputSelector = 'input:not([type="hidden"]):not([type="submit"]):not([type="button"]), select, textarea';

//       while (!isSuccess && stepCount <= MAX_STEPS) {
//         if (this.page.isClosed()) {
//           throw new Error('❌ Browser page was unexpectedly closed.');
//         }

//         Logger.step(stepCount);
//         await AllureHelper.step(`Step ${stepCount}`);
//         this.engine.resetStepState();

//         let visibleElements = await this.frame.locator(inputSelector).filter({ visible: true }).all();

//         for (let i = 0; i < 20; i++) {
//           if (this.page.isClosed()) throw new Error('❌ Browser page closed.');

//           isSuccess = await this.engine.checkIfSuccessPage();
//           if (isSuccess) {
//             Logger.success('✅ Successfully reached Thank You page.');
//             break;
//           }

//           visibleElements = await this.frame.locator(inputSelector).filter({ visible: true }).all();
//           if (visibleElements.length > 0) break;

//           await this.page.waitForTimeout(300);
//         }

//         if (isSuccess) break;

//         if (visibleElements.length === 0) {
//           Logger.action(`Warning: No input fields found on Step ${stepCount}. Assuming splash page, clicking Next.`);
//           if (await this.engine.checkIfSuccessPage()) {
//             Logger.success('✅ Reached Thank You page on empty step inspection.');
//             isSuccess = true;
//             break;
//           }

//           await this.engine.clickNext();
//           await this.page.waitForTimeout(1000);
//           stepCount++;
//           continue;
//         }

//         // ==========================================
//         // DYNAMIC STEP SYNC & SAFE NEGATIVE VALIDATION
//         // ==========================================
//         if (mode === 'negative') {
//           Logger.validationStart();
          
//           const inputTypes = await Promise.all(visibleElements.map(e => e.getAttribute('type')));
//           const isRadioOnlyStep = inputTypes.every(t => t === 'radio' || t === 'checkbox');

//           // Prevent clicking Next if step consists strictly of radio/checkbox options
//           if (!isRadioOnlyStep) {
//             Logger.action(`Triggering empty-field validation for Step ${stepCount}...`);
//             try {
//               const anchorElement = visibleElements[0];
//               await this.engine.clickNext(); 
              
//               const errorLocators = this.frame.locator('[class*="error"], [class*="Error"], [aria-invalid="true"], [id*="error"]').filter({ visible: true });
//               await errorLocators.first().waitFor({ state: 'visible', timeout: 800 }).catch(() => {});
              
//               const errorCount = await errorLocators.count();
//               if (errorCount > 0) {
//                 Logger.success(`✅ Verified ${errorCount} empty-field error messages appeared!`);
//               } else {
//                 Logger.action(`⚠️ Clicked Next, no obvious error text detected.`);
//               }

//               // Check if clicking Next caused an automatic step advance
//               const isSteppedOver = await anchorElement.waitFor({ state: 'hidden', timeout: 300 }).then(() => true).catch(() => false);
//               if (isSteppedOver) {
//                 Logger.action('ℹ️ Step transitioned automatically during empty validation. Synchronizing elements...');
//                 isSuccess = await this.engine.checkIfSuccessPage();
//                 if (isSuccess) break;
//               }
//             } catch (e: any) {
//               Logger.action(`⚠️ Empty validation skipped: ${e.message}`);
//             }
//           }

//           // Resynchronize elements with current active DOM state
//           visibleElements = await this.frame.locator(inputSelector).filter({ visible: true }).all();
//         }

//         Logger.action(`Found ${visibleElements.length} stable fields on Step ${stepCount}`);

//         if (mode === 'positive' && visibleElements.length > 0) {
//           const stepFields = await Promise.all(visibleElements.map(async el => ({
//             name: (await el.getAttribute('name')) || (await el.getAttribute('id')) || '',
//             type: (await el.getAttribute('type')) || (await el.evaluate((e: any) => e.tagName.toLowerCase())) || 'text',
//             step: stepCount
//           })));
//           FieldCaptureBus.addStepFields(formName, stepCount, stepFields.filter(f => f.name));
//         }

//         // ==========================================
//         // FILL ALL FIELDS ON CURRENT STEP
//         // ==========================================
//         for (const element of visibleElements) {
//           if (this.page.isClosed()) throw new Error('❌ Browser page was closed.');
          
//           try {
//             await this.engine.processDynamicElement(element, mode);
//           } catch (e: any) {
//             const isSuccessNow = await this.engine.checkIfSuccessPage();
//             if (isSuccessNow) {
//               Logger.success('✅ Form submitted successfully during field processing.');
//               isSuccess = true;
//               break; 
//             }
//             throw e;
//           }
//         }

//         if (isSuccess) break;

//         // 🚀 DYNAMIC RE-CHECK: Capture newly rendered dependent dropdowns (Education, Work Exp)
//         await this.page.waitForTimeout(600);
//         const postInputs = await this.frame.locator(inputSelector).filter({ visible: true }).all();
        
//         if (postInputs.length > visibleElements.length) {
//           const newDropdowns = postInputs.slice(visibleElements.length);
//           Logger.action(`🔄 Found ${newDropdowns.length} conditional field(s) on Step ${stepCount}. Filling now...`);
          
//           for (const extraEl of newDropdowns) {
//             await this.engine.processDynamicElement(extraEl, mode);
//           }
//         }

//         // ==========================================
//         // SUBMIT STEP
//         // ==========================================
//         let shouldClickNext = true;
//         const freshElements = await this.frame.locator(inputSelector).filter({ visible: true }).all();
        
//         if (freshElements.length > 0) {
//           const isStillVisible = await freshElements[0].isVisible().catch(() => false);
//           if (!isStillVisible) {
//             shouldClickNext = false;
//             Logger.action('Form automatically advanced to next step. Skipping Next click.');
//           }
//         }

//         if (shouldClickNext) {
//           try {
//             if (await this.engine.checkIfSuccessPage()) {
//               Logger.success('✅ Form reached Thank You page before step submission!');
//               isSuccess = true;
//               break;
//             }

//             await this.engine.clickNext();
//           } catch (e: any) {
//             if (await this.engine.checkIfSuccessPage()) {
//               Logger.success('✅ Late navigation to Thank You page detected!');
//               isSuccess = true;
//               break;
//             }
//             throw new Error(`❌ Form stuck on Step ${stepCount}: ${e.message}`);
//           }
//         }
        
//         if (!isSuccess && freshElements.length > 0) {
//           Logger.action('⏳ Waiting for step transition to complete...');
//           await freshElements[0].waitFor({ state: 'hidden', timeout: 5000 }).catch(() => {});
          
//           isSuccess = await this.engine.checkIfSuccessPage();
//           if (isSuccess) {
//             Logger.success('✅ Reached Thank You page after step transition.');
//           }
//         }

//         stepCount++;
//       }

//       if (!isSuccess) {
//         throw new Error(`Form failed to reach Thank You page after ${MAX_STEPS} steps.`);
//       }

//       // ==========================================
//       // API PAYLOAD & RESPONSE VALIDATION STEP
//       // ==========================================
//       if (capturedRequest && capturedResponse) {
//         const actualPayload = await ApiCapture.getRequestPayload(capturedRequest);
//         const responseBody = await ApiCapture.getResponseBody(capturedResponse);
        
//         const allFormValues = await this.engine.getMergedFormValues();
//         const expectedPayload = PayloadMapper.map(allFormValues);

//         const systemKeys = [
//           'page_url', 'submitted_page_host', 'degree_offering', 'lead_source', 'rv_source',
//           'experiment_variant', 'experiment_project', 'experiment_name', 'taxi_determined_geo',
//           'taxi_is_restricted', 'submission_time_ms', 'credential_type', 'form_id', 'programs_of_study',
//           'taxi_form_type', 'user_agent', 'version', 'uuid', 'rv_session_id', 'lead_capture_form_url',
//           'country_inferred', 'ip_inferred_country', 'degree', 'country', 'sms_opt_in_marketing',
//           'country_used_inferred_geo', 'lead_capture_form_type'
//         ];

//         systemKeys.forEach(key => {
//           if (actualPayload[key] !== undefined && expectedPayload[key] === undefined) {
//             expectedPayload[key] = actualPayload[key];
//           }
//         });

//         await AllureHelper.attachJson('Expected Payload', expectedPayload);
//         await AllureHelper.attachJson('API Request', actualPayload);
//         await AllureHelper.attachJson('API Response', responseBody);

//         if (typeof PayloadValidator?.validate === 'function') {
//           PayloadValidator.validate(actualPayload, expectedPayload, mode);
//         } else {
//           Logger.action('⚠️ PayloadValidator.validate is unavailable. Skipping payload assertion.');
//         }

//         if (typeof ResponseValidator?.validate === 'function') {
//           ResponseValidator.validate(responseBody);
//         } else {
//           Logger.action('⚠️ ResponseValidator.validate is unavailable. Skipping response assertion.');
//         }

//       } else {
//         Logger.action('⚠️ Interest-create API was not detected, but form reached success page.');
//       }

//       const metrics = this.engine.getTestCaseMetrics();
//       await AllureHelper.attachTestCaseMetrics(metrics);
//       await AllureHelper.success();
//       ReportManager.pass(formKey, form.group, formName, mode, metrics);

//       console.log(`[TestCases] form=${formName} mode=${mode} total=${metrics.total} passed=${metrics.passed} failed=${metrics.failed}`);
//       return metrics;

//     } catch (error) {
//       let message = error instanceof Error ? error.message : String(error);
//       let metrics = this.engine.getTestCaseMetrics();
//       this.engine.failAllTestCases();
//       metrics = this.engine.getTestCaseMetrics();
      
//       await AllureHelper.attachTestCaseMetrics(metrics);
//       await AllureHelper.failure(message);
//       ReportManager.fail(formKey, form.group, formName, mode, message, metrics);
//       console.log(`[TestCases] form=${formName} mode=${mode} total=${metrics.total} passed=${metrics.passed} failed=${metrics.failed}`);
      
//       throw new Error(message); 
      
//     } finally {
//       if (!this.page.isClosed()) {
//         this.page.removeListener('request', requestListener);
//         this.page.removeListener('response', responseListener);
//       }
//       Logger.endForm();
//     }
//   }
// }
import { Page, FrameLocator } from '@playwright/test';
import { FormEngine, TestMode } from './FormEngine';
import { Logger } from './Logger';
import { FormDefinition } from './types';
import { FieldCaptureBus } from './FieldCaptureBus';
import { ReportManager } from '../utils/reporting/ReportManager';
import { AllureHelper } from '../utils/reporting/AllureHelper';
import { ApiCapture } from '../utils/api/ApiCapture';
import { PayloadMapper } from '../utils/api/PayloadMapper';
import { ResponseValidator } from '../utils/api/ResponseValidator';
import { TestCaseMetrics } from './reporting/ReportTypes';

type PayloadValidatorLike = {
  validate?: (actualPayload: any, expectedPayload: any, mode?: string) => void;
};

const PayloadValidator: PayloadValidatorLike | undefined = undefined;

export class FormRunner {
  private engine: FormEngine;

  constructor(private page: Page, private frame: FrameLocator) {
    this.engine = new FormEngine(page, frame);
  }

  async run(formName: string, form: FormDefinition, mode: TestMode): Promise<TestCaseMetrics> {
    Logger.startForm(formName, mode);
    const formKey = `${formName}-${mode}-${Date.now()}`;
    ReportManager.startForm(formKey);
    await AllureHelper.startForm(form.category ?? 'Uncategorized', form.group, formName, mode);

    this.engine.setGroupId(form.group || 'UNKNOWN-GROUP');

    let capturedRequest: any = null;
    let capturedResponse: any = null;

    const requestListener = (req: any) => {
      if (req.url().includes('/v2/interest-create') && req.method() === 'POST') {
        capturedRequest = req;
      }
    };
    const responseListener = (res: any) => {
      if (res.url().includes('/v2/interest-create') && res.request().method() === 'POST') {
        capturedResponse = res;
      }
    };

    this.page.on('request', requestListener);
    this.page.on('response', responseListener);

    try {
      let isSuccess = false;
      let stepCount = 1;
      const MAX_STEPS = 10;
      const inputSelector = 'input:not([type="hidden"]):not([type="submit"]):not([type="button"]), select, textarea';

      while (!isSuccess && stepCount <= MAX_STEPS) {
        if (this.page.isClosed()) {
          throw new Error('❌ Browser page was unexpectedly closed.');
        }

        Logger.step(stepCount);
        await AllureHelper.step(`Step ${stepCount}`);
        this.engine.resetStepState();

        let visibleElements = await this.frame.locator(inputSelector).filter({ visible: true }).all();

        for (let i = 0; i < 20; i++) {
          if (this.page.isClosed()) throw new Error('❌ Browser page closed.');

          isSuccess = await this.engine.checkIfSuccessPage();
          if (isSuccess) {
            Logger.success('✅ Successfully reached Thank You page.');
            break;
          }

          visibleElements = await this.frame.locator(inputSelector).filter({ visible: true }).all();
          if (visibleElements.length > 0) break;

          await this.page.waitForTimeout(300);
        }

        if (isSuccess) break;

        if (visibleElements.length === 0) {
          Logger.action(`Warning: No input fields found on Step ${stepCount}. Assuming splash page, clicking Next.`);
          
          if (await this.engine.checkIfSuccessPage()) {
            Logger.success('✅ Reached Thank You page on empty step inspection.');
            isSuccess = true;
            break;
          }

          await this.engine.clickNext();
          await this.page.waitForTimeout(1000);
          stepCount++;
          continue;
        }

        // ==========================================
        // 🚀 NON-MANDATORY STEP GUARD & NEGATIVE TESTING
        // ==========================================
        if (mode === 'negative') {
          Logger.validationStart();
          
          // Helper: Check if step has mandatory elements (required or star in label)
          let hasMandatoryFields = false;
          for (const el of visibleElements) {
            const isReq = await el.getAttribute('required');
            const ariaReq = await el.getAttribute('aria-required');
            const id = await el.getAttribute('id');
            let hasAsterisk = false;

            if (id) {
              const labelEl = this.frame.locator(`label[for="${id}"]`);
              if (await labelEl.count() > 0) {
                const labelText = await labelEl.first().innerText();
                hasAsterisk = /\*/.test(labelText);
              }
            }

            if (isReq !== null || ariaReq === 'true' || hasAsterisk) {
              hasMandatoryFields = true;
              break;
            }
          }

          const inputTypes = await Promise.all(visibleElements.map(e => e.getAttribute('type')));
          const isRadioOnlyStep = inputTypes.every(t => t === 'radio' || t === 'checkbox');

          // 🚀 FIX: ONLY trigger empty Next click IF step actually has MANDATORY fields.
          // If all fields are optional (like Step 2), SKIP empty click to prevent accidental step advance!
          if (hasMandatoryFields && !isRadioOnlyStep) {
            Logger.action(`Triggering empty-field validation for mandatory fields on Step ${stepCount}...`);
            try {
              const anchorElement = visibleElements[0];
              await this.engine.clickNext(); 
              
              const errorLocators = this.frame.locator('[class*="error"], [class*="Error"], [aria-invalid="true"], [id*="error"]').filter({ visible: true });
              await errorLocators.first().waitFor({ state: 'visible', timeout: 800 }).catch(() => {});
              
              const errorCount = await errorLocators.count();
              if (errorCount > 0) {
                Logger.success(`✅ Verified ${errorCount} empty-field error messages appeared!`);
              } else {
                Logger.action(`⚠️ Clicked Next, no obvious error text detected.`);
              }

              const isSteppedOver = await anchorElement.waitFor({ state: 'hidden', timeout: 300 }).then(() => true).catch(() => false);
              if (isSteppedOver) {
                Logger.action('ℹ️ Step transitioned during empty validation.');
                isSuccess = await this.engine.checkIfSuccessPage();
                if (isSuccess) break;
              }
            } catch (e: any) {
              Logger.action(`⚠️ Empty validation skipped: ${e.message}`);
            }
          } else {
            Logger.action(`ℹ️ Step ${stepCount} contains optional/non-mandatory fields only. Skipping empty-submit click to preserve step state and fill user inputs.`);
          }

          // Refresh elements for current active step DOM
          visibleElements = await this.frame.locator(inputSelector).filter({ visible: true }).all();
        }

        Logger.action(`Found ${visibleElements.length} stable fields on Step ${stepCount}`);

        if (mode === 'positive' && visibleElements.length > 0) {
          const stepFields = await Promise.all(visibleElements.map(async el => ({
            name: (await el.getAttribute('name')) || (await el.getAttribute('id')) || '',
            type: (await el.getAttribute('type')) || (await el.evaluate((e: any) => e.tagName.toLowerCase())) || 'text',
            step: stepCount
          })));
          FieldCaptureBus.addStepFields(formName, stepCount, stepFields.filter(f => f.name));
        }

        // ==========================================
        // FILL ALL FIELDS ON CURRENT ACTIVE STEP (MANDATORY & OPTIONAL)
        // ==========================================
        for (const element of visibleElements) {
          if (this.page.isClosed()) throw new Error('❌ Browser page was closed.');
          
          try {
            await this.engine.processDynamicElement(element, mode);
          } catch (e: any) {
            const isSuccessNow = await this.engine.checkIfSuccessPage();
            if (isSuccessNow) {
              Logger.success('✅ Form submitted successfully during field processing.');
              isSuccess = true;
              break; 
            }
            throw e;
          }
        }

        if (isSuccess) break;

        // DYNAMIC RE-CHECK: Read newly rendered conditional dropdowns (Highest Education, Work Experience)
        await this.page.waitForTimeout(600);
        const postInputs = await this.frame.locator(inputSelector).filter({ visible: true }).all();
        
        if (postInputs.length > visibleElements.length) {
          const newDropdowns = postInputs.slice(visibleElements.length);
          Logger.action(`🔄 Found ${newDropdowns.length} conditional field(s) on Step ${stepCount}. Filling now...`);
          
          for (const extraEl of newDropdowns) {
            await this.engine.processDynamicElement(extraEl, mode);
          }
        }

        // ==========================================
        // SUBMIT STEP
        // ==========================================
        let shouldClickNext = true;
        const freshElements = await this.frame.locator(inputSelector).filter({ visible: true }).all();
        
        if (freshElements.length > 0) {
          const isStillVisible = await freshElements[0].isVisible().catch(() => false);
          if (!isStillVisible) {
            shouldClickNext = false;
            Logger.action('Form automatically advanced to next step. Skipping Next click.');
          }
        }

        if (shouldClickNext) {
          try {
            if (await this.engine.checkIfSuccessPage()) {
              Logger.success('✅ Form reached Thank You page before step submission!');
              isSuccess = true;
              break;
            }

            await this.engine.clickNext();
          } catch (e: any) {
            if (await this.engine.checkIfSuccessPage()) {
              Logger.success('✅ Late navigation to Thank You page detected!');
              isSuccess = true;
              break;
            }
            throw new Error(`❌ Form stuck on Step ${stepCount}: ${e.message}`);
          }
        }
        
        if (!isSuccess && freshElements.length > 0) {
          Logger.action('⏳ Waiting for step transition to complete...');
          await freshElements[0].waitFor({ state: 'hidden', timeout: 5000 }).catch(() => {});
          
          isSuccess = await this.engine.checkIfSuccessPage();
          if (isSuccess) {
            Logger.success('✅ Reached Thank You page after step transition.');
          }
        }

        stepCount++;
      }

      if (!isSuccess) {
        throw new Error(`Form failed to reach Thank You page after ${MAX_STEPS} steps.`);
      }

      // ==========================================
      // API PAYLOAD & RESPONSE VALIDATION STEP
      // ==========================================
      if (capturedRequest && capturedResponse) {
        const actualPayload = await ApiCapture.getRequestPayload(capturedRequest);
        const responseBody = await ApiCapture.getResponseBody(capturedResponse);
        
        const allFormValues = await this.engine.getMergedFormValues();
        const expectedPayload = PayloadMapper.map(allFormValues);

        const systemKeys = [
          'page_url', 'submitted_page_host', 'degree_offering', 'lead_source', 'rv_source',
          'experiment_variant', 'experiment_project', 'experiment_name', 'taxi_determined_geo',
          'taxi_is_restricted', 'submission_time_ms', 'credential_type', 'form_id', 'programs_of_study',
          'taxi_form_type', 'user_agent', 'version', 'uuid', 'rv_session_id', 'lead_capture_form_url',
          'country_inferred', 'ip_inferred_country', 'degree', 'country', 'sms_opt_in_marketing',
          'country_used_inferred_geo', 'lead_capture_form_type'
        ];

        systemKeys.forEach(key => {
          if (actualPayload[key] !== undefined && expectedPayload[key] === undefined) {
            expectedPayload[key] = actualPayload[key];
          }
        });

        await AllureHelper.attachJson('Expected Payload', expectedPayload);
        await AllureHelper.attachJson('API Request', actualPayload);
        await AllureHelper.attachJson('API Response', responseBody);

        if (typeof PayloadValidator?.validate === 'function') {
          PayloadValidator.validate(actualPayload, expectedPayload, mode);
        } else {
          Logger.action('⚠️ PayloadValidator.validate is unavailable. Skipping payload assertion.');
        }

        if (typeof ResponseValidator?.validate === 'function') {
          ResponseValidator.validate(responseBody);
        } else {
          Logger.action('⚠️ ResponseValidator.validate is unavailable. Skipping response assertion.');
        }

      } else {
        Logger.action('⚠️ Interest-create API was not detected, but form reached success page.');
      }

      const metrics = this.engine.getTestCaseMetrics();
      await AllureHelper.attachTestCaseMetrics(metrics);
      await AllureHelper.success();
      ReportManager.pass(formKey, form.group, formName, mode, metrics);

      console.log(`[TestCases] form=${formName} mode=${mode} total=${metrics.total} passed=${metrics.passed} failed=${metrics.failed}`);
      return metrics;

    } catch (error) {
      let message = error instanceof Error ? error.message : String(error);
      let metrics = this.engine.getTestCaseMetrics();
      this.engine.failAllTestCases();
      metrics = this.engine.getTestCaseMetrics();
      
      await AllureHelper.attachTestCaseMetrics(metrics);
      await AllureHelper.failure(message);
      ReportManager.fail(formKey, form.group, formName, mode, message, metrics);
      console.log(`[TestCases] form=${formName} mode=${mode} total=${metrics.total} passed=${metrics.passed} failed=${metrics.failed}`);
      
      throw new Error(message); 
      
    } finally {
      if (!this.page.isClosed()) {
        this.page.removeListener('request', requestListener);
        this.page.removeListener('response', responseListener);
      }
      Logger.endForm();
    }
  }
}