// import { Page, FrameLocator, Locator } from '@playwright/test';
// import { FormEngine, TestMode } from './FormEngine';
// import { Logger } from './Logger';
// import { FormDefinition } from './types';
// import { FieldCaptureBus } from './FieldCaptureBus';
// import { ReportManager } from '../utils/reporting/ReportManager';
// import { AllureHelper } from '../utils/reporting/AllureHelper';
// import { ApiCapture } from '../utils/api/ApiCapture';
// import { PayloadMapper } from '../utils/api/PayloadMapper';
// import { PayloadValidator } from '../utils/api/PayloadValidator'; 
// import { ResponseValidator } from '../utils/api/ResponseValidator';
// import { TestCaseMetrics } from './reporting/ReportTypes';
// export class FormRunner {
//   private engine: FormEngine;

//   constructor(
//     private page: Page,
//     private frame: FrameLocator
//   ) {
//     this.engine = new FormEngine(page, frame);
//   }

//   async run(formName: string, form: FormDefinition, mode: TestMode): Promise<TestCaseMetrics> {
//     Logger.startForm(formName, mode);
//     const formKey = `${formName}-${mode}-${Date.now()}`;
//     ReportManager.startForm(formKey);
//     await AllureHelper.startForm(form.category ?? 'Uncategorized', form.group, formName, mode);

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

//       while (!isSuccess && stepCount <= MAX_STEPS) {
//         Logger.step(stepCount);
//         await AllureHelper.step(`Step ${stepCount}`);
        
//         this.engine.resetStepState();

//         await this.frame.locator('body').first().waitFor();
//         await new Promise(res => setTimeout(res, 1500)); 

//         isSuccess = await this.engine.checkIfSuccessPage(); 
//         if (isSuccess) {
//           Logger.success('Successfully reached Thank You page.');
//           break;
//         }

//         // ==========================================
//         // SMART WAIT: POLL FOR FIELDS 
//         // ==========================================
//         let visibleElements: Locator[] = [];
//         let fieldsFound = false;
        
//         for (let i = 1; i <= 20; i++) {
//           isSuccess = await this.engine.checkIfSuccessPage();
//           if (isSuccess) {
//             Logger.success('Successfully reached Thank You page after a short loading delay.');
//             break; 
//           }

//           const inputs = this.frame.locator('input:not([type="hidden"]):not([type="submit"]):not([type="button"]), select, textarea').filter({ visible: true });
          
//           if (await inputs.count() > 0) {
//             await new Promise(res => setTimeout(res, 1500));
//             visibleElements = await inputs.all();
//             fieldsFound = true;
//             break; 
//           }
          
//           await new Promise(res => setTimeout(res, 1000)); 
//         }

//         if (isSuccess) {
//             break;
//         }

//         if (!fieldsFound) {
//            Logger.action(`Warning: Waited 20s but no input fields found on Step ${stepCount}. Assuming splash page, clicking Next.`);
//            await this.engine.clickNext();
//            await new Promise(res => setTimeout(res, 3000));
//            stepCount++;
//            continue;
//         }

//         // ==========================================
//         // 🚀 TRIGGER EMPTY-FORM VALIDATION ON EVERY STEP (NEGATIVE MODE ONLY)
//         // ==========================================
//         if (mode === 'negative') {
//           Logger.validationStart();
//           Logger.action(`Triggering empty-field validation for Step ${stepCount}...`);
          
//           // 1. Click Next on the empty form
//           await this.engine.clickNext(); 
//           await new Promise(res => setTimeout(res, 1500)); // Wait for red errors to render
          
//           // 2. Explicitly count and verify the error messages appeared
//           // This looks for common CRM error classes (adjust if your CRM uses specific ones)
//           const errorLocators = this.frame.locator('[class*="error"], [class*="Error"], [aria-invalid="true"], [id*="error"]').filter({ visible: true });
//           const errorCount = await errorLocators.count();

//           if (errorCount > 0) {
//             Logger.success(`✅ Successfully verified ${errorCount} empty-field error messages appeared!`);
//           } else {
//             Logger.action(`⚠️ Clicked Next, but detected no obvious error text. Filling fields anyway.`);
//           }
          
//           // 3. Re-grab elements in case the error messages shifted the DOM
//           visibleElements = await this.frame.locator('input:not([type="hidden"]):not([type="submit"]):not([type="button"]), select, textarea').filter({ visible: true }).all();
//         }

//         Logger.action(`Found ${visibleElements.length} stable fields on Step ${stepCount}`);

//         // ✅ EMIT field data to FieldCaptureBus (only on positive mode to avoid duplicate capture)
//         if (mode === 'positive' && visibleElements.length > 0) {
//           const stepFields = await Promise.all(visibleElements.map(async el => ({
//             name: (await el.getAttribute('name')) || (await el.getAttribute('id')) || '',
//             type: (await el.getAttribute('type')) || (await el.evaluate((e: any) => e.tagName.toLowerCase())) || 'text',
//             step: stepCount
//           })));
//           FieldCaptureBus.addStepFields(formName, stepCount, stepFields.filter(f => f.name));
//         }

//         // ==========================================
//         // FILL THE FIELDS
//         // ==========================================
//         for (const element of visibleElements) {
//           await this.engine.processDynamicElement(element, mode);
//         }

//         // ==========================================
//         // SUBMIT THE STEP
//         // ==========================================
//         await this.engine.clickNext();
        
//         await new Promise(res => setTimeout(res, 1500)); 
//         stepCount++;
//       }

//       if (!isSuccess) {
//         throw new Error(`Form failed to reach the success page after ${MAX_STEPS} steps.`);
//       }

//       // ==========================================
//       // THE FINAL API VALIDATION STEP
//       // ==========================================
//       if (capturedRequest && capturedResponse) {
//         const actualPayload = await ApiCapture.getRequestPayload(capturedRequest);
//         const responseBody = await ApiCapture.getResponseBody(capturedResponse);
//         const expectedPayload = PayloadMapper.map(this.engine.getEnteredValues());

//         await AllureHelper.attachJson('Expected Payload', expectedPayload);
//         await AllureHelper.attachJson('API Request', actualPayload);
//         await AllureHelper.attachJson('API Response', responseBody);

//         PayloadValidator.validate(actualPayload, expectedPayload);
//         ResponseValidator.validate(responseBody);

//       } else {
//         throw new Error('❌ API Request to /v2/interest-create was not detected. Test failed.');
//       }

//       const metrics = this.engine.getTestCaseMetrics();
//       await AllureHelper.attachTestCaseMetrics(metrics);
//       await AllureHelper.success();
//       ReportManager.pass(formKey, form.group, formName, mode, metrics);

//       console.log(`[TestCases] form=${formName} mode=${mode} total=${metrics.total} passed=${metrics.passed} failed=${metrics.failed}`);
//       return metrics;

//     } catch (error) {
//       const message = error instanceof Error ? error.message : String(error);
//       let metrics = this.engine.getTestCaseMetrics();
      
//       // When test fails overall, convert passed test cases to failed
//       this.engine.failAllTestCases();
//       metrics = this.engine.getTestCaseMetrics();
      
//       await AllureHelper.attachTestCaseMetrics(metrics);
//       await AllureHelper.failure(message);
//       ReportManager.fail(formKey, form.group, formName, mode, message, metrics);
//       console.log(`[TestCases] form=${formName} mode=${mode} total=${metrics.total} passed=${metrics.passed} failed=${metrics.failed}`);
//       throw error;
      
//     } finally {
//       this.page.removeListener('request', requestListener);
//       this.page.removeListener('response', responseListener);
//       Logger.endForm();
//     }
//   }
// }





// import { Page, FrameLocator, Locator } from '@playwright/test';
// import { FormEngine, TestMode } from './FormEngine';
// import { Logger } from './Logger';
// import { FormDefinition } from './types';
// import { FieldCaptureBus } from './FieldCaptureBus';
// import { ReportManager } from '../utils/reporting/ReportManager';
// import { AllureHelper } from '../utils/reporting/AllureHelper';
// import { ApiCapture } from '../utils/api/ApiCapture';
// import { PayloadMapper } from '../utils/api/PayloadMapper';
// import { PayloadValidator } from '../utils/api/PayloadValidator'; 
// import { ResponseValidator } from '../utils/api/ResponseValidator';
// import { TestCaseMetrics } from './reporting/ReportTypes';

// export class FormRunner {
//   private engine: FormEngine;

//   constructor(
//     private page: Page,
//     private frame: FrameLocator
//   ) {
//     this.engine = new FormEngine(page, frame);
//   }

//   async run(formName: string, form: FormDefinition, mode: TestMode): Promise<TestCaseMetrics> {
//     Logger.startForm(formName, mode);
//     const formKey = `${formName}-${mode}-${Date.now()}`;
//     ReportManager.startForm(formKey);
//     await AllureHelper.startForm(form.category ?? 'Uncategorized', form.group, formName, mode);

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

//       while (!isSuccess && stepCount <= MAX_STEPS) {
//         // 🚀 SAFETY NET: Stop instantly if Playwright killed the browser (e.g. timeout)
//         if (this.page.isClosed()) {
//             throw new Error('❌ Browser page was unexpectedly closed (Likely due to a Test Timeout).');
//         }

//         Logger.step(stepCount);
//         await AllureHelper.step(`Step ${stepCount}`);
        
//         this.engine.resetStepState();

//         await this.frame.locator('body').first().waitFor();
//         await new Promise(res => setTimeout(res, 1500)); 

//         isSuccess = await this.engine.checkIfSuccessPage(); 
//         if (isSuccess) {
//           Logger.success('Successfully reached Thank You page.');
//           break;
//         }

//         // ==========================================
//         // SMART WAIT: POLL FOR FIELDS 
//         // ==========================================
//         let visibleElements: Locator[] = [];
//         let fieldsFound = false;
        
//         for (let i = 1; i <= 20; i++) {
//           // 🚀 SAFETY NET
//           if (this.page.isClosed()) throw new Error('❌ Browser page was unexpectedly closed.');

//           isSuccess = await this.engine.checkIfSuccessPage();
//           if (isSuccess) {
//             Logger.success('Successfully reached Thank You page after a short loading delay.');
//             break; 
//           }

//           const inputs = this.frame.locator('input:not([type="hidden"]):not([type="submit"]):not([type="button"]), select, textarea').filter({ visible: true });
          
//           if (await inputs.count() > 0) {
//             await new Promise(res => setTimeout(res, 1500));
//             visibleElements = await inputs.all();
//             fieldsFound = true;
//             break; 
//           }
          
//           await new Promise(res => setTimeout(res, 1000)); 
//         }

//         if (isSuccess) {
//             break;
//         }

//         if (!fieldsFound) {
//            Logger.action(`Warning: Waited 20s but no input fields found on Step ${stepCount}. Assuming splash page, clicking Next.`);
//            await this.engine.clickNext();
//            await new Promise(res => setTimeout(res, 3000));
//            stepCount++;
//            continue;
//         }

//         // ==========================================
//         // 🚀 TRIGGER EMPTY-FORM VALIDATION ON EVERY STEP (NEGATIVE MODE ONLY)
//         // ==========================================
//         if (mode === 'negative') {
//           Logger.validationStart();
//           Logger.action(`Triggering empty-field validation for Step ${stepCount}...`);
          
//           // 1. Click Next on the empty form
//           await this.engine.clickNext(); 
//           await new Promise(res => setTimeout(res, 1500)); // Wait for red errors to render
          
//           // 2. Explicitly count and verify the error messages appeared
//           const errorLocators = this.frame.locator('[class*="error"], [class*="Error"], [aria-invalid="true"], [id*="error"]').filter({ visible: true });
//           const errorCount = await errorLocators.count();

//           if (errorCount > 0) {
//             Logger.success(`✅ Successfully verified ${errorCount} empty-field error messages appeared!`);
//           } else {
//             Logger.action(`⚠️ Clicked Next, but detected no obvious error text. Filling fields anyway.`);
//           }
          
//           // 3. Re-grab elements in case the error messages shifted the DOM
//           visibleElements = await this.frame.locator('input:not([type="hidden"]):not([type="submit"]):not([type="button"]), select, textarea').filter({ visible: true }).all();
//         }

//         Logger.action(`Found ${visibleElements.length} stable fields on Step ${stepCount}`);

//         // ✅ EMIT field data to FieldCaptureBus (only on positive mode to avoid duplicate capture)
//         if (mode === 'positive' && visibleElements.length > 0) {
//           const stepFields = await Promise.all(visibleElements.map(async el => ({
//             name: (await el.getAttribute('name')) || (await el.getAttribute('id')) || '',
//             type: (await el.getAttribute('type')) || (await el.evaluate((e: any) => e.tagName.toLowerCase())) || 'text',
//             step: stepCount
//           })));
//           FieldCaptureBus.addStepFields(formName, stepCount, stepFields.filter(f => f.name));
//         }

//         // ==========================================
//         // FILL THE FIELDS
//         // ==========================================
//         for (const element of visibleElements) {
//           // 🚀 SAFETY NET
//           if (this.page.isClosed()) throw new Error('❌ Browser page was unexpectedly closed during field evaluation.');
          
//           try {
//             await this.engine.processDynamicElement(element, mode);
//           } catch (e: any) {
//             // 🚀 SMART CHECK: If filling a field times out, check if the Thank You page finally loaded!
//             const isSuccessNow = await this.engine.checkIfSuccessPage();
//             if (isSuccessNow) {
//                 Logger.success('✅ Form submitted successfully while waiting for a field. Late navigation detected!');
//                 isSuccess = true;
//                 break; // Break out of the field-filling loop
//             }

//             if (e.message.includes('Target page, context or browser has been closed')) {
//                 throw new Error('❌ Form navigated away unexpectedly, or test timed out.');
//             }
//             throw e;
//           }
//         }

//         // If the late-navigation check above set isSuccess to true, break the while loop immediately!
//         if (isSuccess) {
//             break;
//         }

//         // ==========================================
//         // SUBMIT THE STEP
//         // ==========================================
//         try {
//           await this.engine.clickNext();
//         } catch (e: any) {
//           if (e.message.includes('Primary button not found')) {
//               // 🚀 SMART CHECK: One final check if the page loaded right as it tried to click Next
//               if (await this.engine.checkIfSuccessPage()) {
//                   Logger.success('✅ Late navigation to Thank You page detected at step submission!');
//                   isSuccess = true;
//                   break;
//               }
//               throw new Error(`❌ Form got stuck on Step ${stepCount}. The Next/Submit button disappeared or became unclickable after entering data.`);
//           }
//           throw e;
//         }
        
//         await new Promise(res => setTimeout(res, 1500)); 
//         stepCount++;
//       }

//       if (!isSuccess) {
//         throw new Error(`Form failed to reach the success page after ${MAX_STEPS} steps.`);
//       }

//       // ==========================================
//       // THE FINAL API VALIDATION STEP
//       // ==========================================
//       if (capturedRequest && capturedResponse) {
//         const actualPayload = await ApiCapture.getRequestPayload(capturedRequest);
//         const responseBody = await ApiCapture.getResponseBody(capturedResponse);
//         const expectedPayload = PayloadMapper.map(this.engine.getEnteredValues());

//         await AllureHelper.attachJson('Expected Payload', expectedPayload);
//         await AllureHelper.attachJson('API Request', actualPayload);
//         await AllureHelper.attachJson('API Response', responseBody);

//         PayloadValidator.validate(actualPayload, expectedPayload);
//         ResponseValidator.validate(responseBody);

//       } else {
//         throw new Error('❌ API Request to /v2/interest-create was not detected. Test failed.');
//       }

//       const metrics = this.engine.getTestCaseMetrics();
//       await AllureHelper.attachTestCaseMetrics(metrics);
//       await AllureHelper.success();
//       ReportManager.pass(formKey, form.group, formName, mode, metrics);

//       console.log(`[TestCases] form=${formName} mode=${mode} total=${metrics.total} passed=${metrics.passed} failed=${metrics.failed}`);
//       return metrics;

//     } catch (error) {
//       // 🚀 SAFETY NET: If the error is a Playwright timeout/closed error, translate it
//       let message = error instanceof Error ? error.message : String(error);
//       if (message.includes('Target page, context or browser has been closed')) {
//           message = '❌ The test timed out, or the page closed unexpectedly during execution. Check test.setTimeout() limits.';
//       }

//       let metrics = this.engine.getTestCaseMetrics();
      
//       // When test fails overall, convert passed test cases to failed
//       this.engine.failAllTestCases();
//       metrics = this.engine.getTestCaseMetrics();
      
//       await AllureHelper.attachTestCaseMetrics(metrics);
//       await AllureHelper.failure(message);
//       ReportManager.fail(formKey, form.group, formName, mode, message, metrics);
//       console.log(`[TestCases] form=${formName} mode=${mode} total=${metrics.total} passed=${metrics.passed} failed=${metrics.failed}`);
      
//       throw new Error(message); // Throw the cleaned up message
      
//     } finally {
//       // 🚀 SAFETY NET: Safe listener removal even if page is closed
//       if (!this.page.isClosed()) {
//         this.page.removeListener('request', requestListener);
//         this.page.removeListener('response', responseListener);
//       }
//       Logger.endForm();
//     }
//   }
// }





// import { Page, FrameLocator, Locator } from '@playwright/test';
// import { FormEngine, TestMode } from './FormEngine';
// import { Logger } from './Logger';
// import { FormDefinition } from './types';
// import { FieldCaptureBus } from './FieldCaptureBus';
// import { ReportManager } from '../utils/reporting/ReportManager';
// import { AllureHelper } from '../utils/reporting/AllureHelper';
// import { ApiCapture } from '../utils/api/ApiCapture';
// import { PayloadMapper } from '../utils/api/PayloadMapper';
// import { PayloadValidator } from '../utils/api/PayloadValidator'; 
// import { ResponseValidator } from '../utils/api/ResponseValidator';
// import { TestCaseMetrics } from './reporting/ReportTypes';

// export class FormRunner {
//   private engine: FormEngine;

//   constructor(
//     private page: Page,
//     private frame: FrameLocator
//   ) {
//     this.engine = new FormEngine(page, frame);
//   }

//   async run(formName: string, form: FormDefinition, mode: TestMode): Promise<TestCaseMetrics> {
//     Logger.startForm(formName, mode);
//     const formKey = `${formName}-${mode}-${Date.now()}`;
//     ReportManager.startForm(formKey);
//     await AllureHelper.startForm(form.category ?? 'Uncategorized', form.group, formName, mode);

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

//       while (!isSuccess && stepCount <= MAX_STEPS) {
//         if (this.page.isClosed()) {
//             throw new Error('❌ Browser page was unexpectedly closed (Likely due to a Test Timeout).');
//         }

//         Logger.step(stepCount);
//         await AllureHelper.step(`Step ${stepCount}`);
        
//         this.engine.resetStepState();

//         await this.frame.locator('body').first().waitFor();
//         await new Promise(res => setTimeout(res, 1500)); 

//         isSuccess = await this.engine.checkIfSuccessPage(); 
//         if (isSuccess) {
//           Logger.success('Successfully reached Thank You page.');
//           break;
//         }

//         // ==========================================
//         // SMART WAIT: POLL FOR FIELDS 
//         // ==========================================
//         let visibleElements: Locator[] = [];
//         let fieldsFound = false;
        
//         for (let i = 1; i <= 20; i++) {
//           if (this.page.isClosed()) throw new Error('❌ Browser page was unexpectedly closed.');

//           isSuccess = await this.engine.checkIfSuccessPage();
//           if (isSuccess) {
//             Logger.success('Successfully reached Thank You page after a short loading delay.');
//             break; 
//           }

//           const inputs = this.frame.locator('input:not([type="hidden"]):not([type="submit"]):not([type="button"]), select, textarea').filter({ visible: true });
          
//           if (await inputs.count() > 0) {
//             await new Promise(res => setTimeout(res, 1500));
//             visibleElements = await inputs.all();
//             fieldsFound = true;
//             break; 
//           }
          
//           await new Promise(res => setTimeout(res, 1000)); 
//         }

//         if (isSuccess) break;

//         if (!fieldsFound) {
//            Logger.action(`Warning: Waited 20s but no input fields found on Step ${stepCount}. Assuming splash page, clicking Next.`);
//            await this.engine.clickNext();
//            await new Promise(res => setTimeout(res, 3000));
//            stepCount++;
//            continue;
//         }

//         Logger.action(`Found ${visibleElements.length} stable fields on Step ${stepCount}`);

//         // ✅ EMIT field data to FieldCaptureBus (Positive only)
//         if (mode === 'positive' && visibleElements.length > 0) {
//           const stepFields = await Promise.all(visibleElements.map(async el => ({
//             name: (await el.getAttribute('name')) || (await el.getAttribute('id')) || '',
//             type: (await el.getAttribute('type')) || (await el.evaluate((e: any) => e.tagName.toLowerCase())) || 'text',
//             step: stepCount
//           })));
//           FieldCaptureBus.addStepFields(formName, stepCount, stepFields.filter(f => f.name));
//         }

//         // ==========================================
//         // FILL THE FIELDS
//         // ==========================================
//         for (const element of visibleElements) {
//           if (this.page.isClosed()) throw new Error('❌ Browser page was unexpectedly closed during field evaluation.');
          
//           try {
//             await this.engine.processDynamicElement(element, mode);
//           } catch (e: any) {
//             const isSuccessNow = await this.engine.checkIfSuccessPage();
//             if (isSuccessNow) {
//                 Logger.success('✅ Form submitted successfully while waiting for a field. Late navigation detected!');
//                 isSuccess = true;
//                 break; 
//             }

//             if (e.message.includes('Target page, context or browser has been closed')) {
//                 throw new Error('❌ Form navigated away unexpectedly, or test timed out.');
//             }
//             throw e;
//           }
//         }

//         if (isSuccess) break;

//         // ==========================================
//         // SUBMIT THE STEP (WITH STRICT TRANSITION CHECK)
//         // ==========================================
        
//         // 🚀 SMART CHECK 1: Did entering valid data auto-advance the form?
//         let shouldClickNext = true;
//         if (visibleElements.length > 0) {
//             const isStillVisible = await visibleElements[0].isVisible().catch(() => false);
//             if (!isStillVisible) {
//                 shouldClickNext = false;
//                 Logger.action('Form automatically advanced to the next step. Skipping Next button click.');
//             }
//         }

//         // Only click next if the form hasn't moved yet
//         if (shouldClickNext) {
//             try {
//               await this.engine.clickNext();
//             } catch (e: any) {
//               if (e.message.includes('Primary button not found')) {
//                   if (await this.engine.checkIfSuccessPage()) {
//                       Logger.success('✅ Late navigation to Thank You page detected at step submission!');
//                       isSuccess = true;
//                       break;
//                   }
//                   throw new Error(`❌ Form got stuck on Step ${stepCount}. The Next/Submit button disappeared or became unclickable.`);
//               }
//               throw e;
//             }
//         }
        
//         // 🚀 SMART CHECK 2: FREEZE UNTIL THE PAGE CHANGES
//         // This stops Playwright from looping too fast and hitting the "Ghost Step"
//         if (!isSuccess && visibleElements.length > 0) {
//             Logger.action('⏳ Waiting for step transition to complete...');
//             for (let w = 0; w < 10; w++) { // Wait up to 10 seconds
//                 if (await this.engine.checkIfSuccessPage()) {
//                     isSuccess = true;
//                     Logger.success('✅ Successfully detected Thank You page during transition wait.');
//                     break;
//                 }
//                 const stillVisible = await visibleElements[0].isVisible().catch(() => false);
//                 if (!stillVisible) {
//                     break; // Form successfully transitioned to the next step!
//                 }
//                 await new Promise(res => setTimeout(res, 1000));
//             }
//         }

//         stepCount++;
//       }

//       if (!isSuccess) {
//         throw new Error(`Form failed to reach the success page after ${MAX_STEPS} steps.`);
//       }

//       // ==========================================
//       // THE FINAL API VALIDATION STEP
//       // ==========================================
//       if (capturedRequest && capturedResponse) {
//         const actualPayload = await ApiCapture.getRequestPayload(capturedRequest);
//         const responseBody = await ApiCapture.getResponseBody(capturedResponse);
//         const expectedPayload = PayloadMapper.map(this.engine.getEnteredValues());

//         await AllureHelper.attachJson('Expected Payload', expectedPayload);
//         await AllureHelper.attachJson('API Request', actualPayload);
//         await AllureHelper.attachJson('API Response', responseBody);

//         PayloadValidator.validate(actualPayload, expectedPayload);
//         ResponseValidator.validate(responseBody);

//       } else {
//         throw new Error('❌ API Request to /v2/interest-create was not detected. Test failed.');
//       }

//       const metrics = this.engine.getTestCaseMetrics();
//       await AllureHelper.attachTestCaseMetrics(metrics);
//       await AllureHelper.success();
//       ReportManager.pass(formKey, form.group, formName, mode, metrics);

//       console.log(`[TestCases] form=${formName} mode=${mode} total=${metrics.total} passed=${metrics.passed} failed=${metrics.failed}`);
//       return metrics;

//     } catch (error) {
//       let message = error instanceof Error ? error.message : String(error);
//       if (message.includes('Target page, context or browser has been closed')) {
//           message = '❌ The test timed out, or the page closed unexpectedly during execution. Check test.setTimeout() limits.';
//       }

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






// import { Page, FrameLocator, Locator } from '@playwright/test';
// import { FormEngine, TestMode } from './FormEngine';
// import { Logger } from './Logger';
// import { FormDefinition } from './types';
// import { FieldCaptureBus } from './FieldCaptureBus';
// import { ReportManager } from '../utils/reporting/ReportManager';
// import { AllureHelper } from '../utils/reporting/AllureHelper';
// import { ApiCapture } from '../utils/api/ApiCapture';
// import { PayloadMapper } from '../utils/api/PayloadMapper';
// import { PayloadValidator } from '../utils/api/PayloadValidator'; 
// import { ResponseValidator } from '../utils/api/ResponseValidator';
// import { TestCaseMetrics } from './reporting/ReportTypes';

// export class FormRunner {
//   private engine: FormEngine;

//   constructor(
//     private page: Page,
//     private frame: FrameLocator
//   ) {
//     this.engine = new FormEngine(page, frame);
//   }

//   async run(formName: string, form: FormDefinition, mode: TestMode): Promise<TestCaseMetrics> {
//     Logger.startForm(formName, mode);
//     const formKey = `${formName}-${mode}-${Date.now()}`;
//     ReportManager.startForm(formKey);
//     await AllureHelper.startForm(form.category ?? 'Uncategorized', form.group, formName, mode);

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

//       while (!isSuccess && stepCount <= MAX_STEPS) {
//         if (this.page.isClosed()) {
//             throw new Error('❌ Browser page was unexpectedly closed (Likely due to a Test Timeout).');
//         }

//         Logger.step(stepCount);
//         await AllureHelper.step(`Step ${stepCount}`);
        
//         this.engine.resetStepState();

//         await this.frame.locator('body').first().waitFor();
//         await new Promise(res => setTimeout(res, 1500)); 

//         isSuccess = await this.engine.checkIfSuccessPage(); 
//         if (isSuccess) {
//           Logger.success('Successfully reached Thank You page.');
//           break;
//         }

//         // ==========================================
//         // SMART WAIT: POLL FOR FIELDS 
//         // ==========================================
//         let visibleElements: Locator[] = [];
//         let fieldsFound = false;
        
//         for (let i = 1; i <= 20; i++) {
//           if (this.page.isClosed()) throw new Error('❌ Browser page was unexpectedly closed.');

//           isSuccess = await this.engine.checkIfSuccessPage();
//           if (isSuccess) {
//             Logger.success('Successfully reached Thank You page after a short loading delay.');
//             break; 
//           }

//           const inputs = this.frame.locator('input:not([type="hidden"]):not([type="submit"]):not([type="button"]), select, textarea').filter({ visible: true });
          
//           if (await inputs.count() > 0) {
//             await new Promise(res => setTimeout(res, 1500));
//             visibleElements = await inputs.all();
//             fieldsFound = true;
//             break; 
//           }
          
//           await new Promise(res => setTimeout(res, 1000)); 
//         }

//         if (isSuccess) break;

//         if (!fieldsFound) {
//            Logger.action(`Warning: Waited 20s but no input fields found on Step ${stepCount}. Assuming splash page, clicking Next.`);
//            await this.engine.clickNext();
//            await new Promise(res => setTimeout(res, 3000));
//            stepCount++;
//            continue;
//         }

//         Logger.action(`Found ${visibleElements.length} stable fields on Step ${stepCount}`);

//         // ✅ EMIT field data to FieldCaptureBus (Positive only)
//         if (mode === 'positive' && visibleElements.length > 0) {
//           const stepFields = await Promise.all(visibleElements.map(async el => ({
//             name: (await el.getAttribute('name')) || (await el.getAttribute('id')) || '',
//             type: (await el.getAttribute('type')) || (await el.evaluate((e: any) => e.tagName.toLowerCase())) || 'text',
//             step: stepCount
//           })));
//           FieldCaptureBus.addStepFields(formName, stepCount, stepFields.filter(f => f.name));
//         }

//         // ==========================================
//         // FILL THE FIELDS
//         // ==========================================
//         for (const element of visibleElements) {
//           if (this.page.isClosed()) throw new Error('❌ Browser page was unexpectedly closed during field evaluation.');
          
//           try {
//             await this.engine.processDynamicElement(element, mode);
//           } catch (e: any) {
//             const isSuccessNow = await this.engine.checkIfSuccessPage();
//             if (isSuccessNow) {
//                 Logger.success('✅ Form submitted successfully while waiting for a field. Late navigation detected!');
//                 isSuccess = true;
//                 break; 
//             }

//             if (e.message.includes('Target page, context or browser has been closed')) {
//                 throw new Error('❌ Form navigated away unexpectedly, or test timed out.');
//             }
//             throw e;
//           }
//         }

//         if (isSuccess) break;

//         // ==========================================
//         // SUBMIT THE STEP (WITH STRICT TRANSITION CHECK)
//         // ==========================================
        
//         let shouldClickNext = true;
//         if (visibleElements.length > 0) {
//             const isStillVisible = await visibleElements[0].isVisible().catch(() => false);
//             if (!isStillVisible) {
//                 shouldClickNext = false;
//                 Logger.action('Form automatically advanced to the next step. Skipping Next button click.');
//             }
//         }

//         if (shouldClickNext) {
//             try {
//               await this.engine.clickNext();
//             } catch (e: any) {
//               // 🚀 THE ULTIMATE FIX: Catch ANY error (Timeout, Disabled, Detached, Not Found)
//               if (await this.engine.checkIfSuccessPage()) {
//                   Logger.success('✅ Late navigation to Thank You page detected at step submission!');
//                   isSuccess = true;
//                   break;
//               }
//               // If we are definitely NOT on the success page, it's a real crash.
//               throw new Error(`❌ Form got stuck on Step ${stepCount}. The Next/Submit button disappeared or became unclickable. Original Error: ${e.message}`);
//             }
//         }
        
//         // 🚀 SMART CHECK 2: FREEZE UNTIL THE PAGE CHANGES
//         if (!isSuccess && visibleElements.length > 0) {
//             Logger.action('⏳ Waiting for step transition to complete...');
//             for (let w = 0; w < 10; w++) { // Wait up to 10 seconds
//                 if (await this.engine.checkIfSuccessPage()) {
//                     isSuccess = true;
//                     Logger.success('✅ Successfully detected Thank You page during transition wait.');
//                     break;
//                 }
//                 const stillVisible = await visibleElements[0].isVisible().catch(() => false);
//                 if (!stillVisible) {
//                     break; // Form successfully transitioned to the next step!
//                 }
//                 await new Promise(res => setTimeout(res, 1000));
//             }
//         }

//         stepCount++;
//       }

//       if (!isSuccess) {
//         throw new Error(`Form failed to reach the success page after ${MAX_STEPS} steps.`);
//       }

//       // ==========================================
//       // THE FINAL API VALIDATION STEP
//       // ==========================================
//       if (capturedRequest && capturedResponse) {
//         const actualPayload = await ApiCapture.getRequestPayload(capturedRequest);
//         const responseBody = await ApiCapture.getResponseBody(capturedResponse);
//         const expectedPayload = PayloadMapper.map(this.engine.getEnteredValues());

//         await AllureHelper.attachJson('Expected Payload', expectedPayload);
//         await AllureHelper.attachJson('API Request', actualPayload);
//         await AllureHelper.attachJson('API Response', responseBody);

//         PayloadValidator.validate(actualPayload, expectedPayload);
//         ResponseValidator.validate(responseBody);

//       } else {
//         throw new Error('❌ API Request to /v2/interest-create was not detected. Test failed.');
//       }

//       const metrics = this.engine.getTestCaseMetrics();
//       await AllureHelper.attachTestCaseMetrics(metrics);
//       await AllureHelper.success();
//       ReportManager.pass(formKey, form.group, formName, mode, metrics);

//       console.log(`[TestCases] form=${formName} mode=${mode} total=${metrics.total} passed=${metrics.passed} failed=${metrics.failed}`);
//       return metrics;

//     } catch (error) {
//       let message = error instanceof Error ? error.message : String(error);
//       if (message.includes('Target page, context or browser has been closed')) {
//           message = '❌ The test timed out, or the page closed unexpectedly during execution. Check test.setTimeout() limits.';
//       }

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


// import { Page, FrameLocator, Locator } from '@playwright/test';
// import { FormEngine, TestMode } from './FormEngine';
// import { Logger } from './Logger';
// import { FormDefinition } from './types';
// import { FieldCaptureBus } from './FieldCaptureBus';
// import { ReportManager } from '../utils/reporting/ReportManager';
// import { AllureHelper } from '../utils/reporting/AllureHelper';
// import { ApiCapture } from '../utils/api/ApiCapture';
// import { PayloadMapper } from '../utils/api/PayloadMapper';
// import { PayloadValidator } from '../utils/api/PayloadValidator'; 
// import { ResponseValidator } from '../utils/api/ResponseValidator';
// import { TestCaseMetrics } from './reporting/ReportTypes';

// export class FormRunner {
//   private engine: FormEngine;

//   constructor(
//     private page: Page,
//     private frame: FrameLocator
//   ) {
//     this.engine = new FormEngine(page, frame);
//   }

//   async run(formName: string, form: FormDefinition, mode: TestMode): Promise<TestCaseMetrics> {
//     Logger.startForm(formName, mode);
//     const formKey = `${formName}-${mode}-${Date.now()}`;
//     ReportManager.startForm(formKey);
//     await AllureHelper.startForm(form.category ?? 'Uncategorized', form.group, formName, mode);

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

//       while (!isSuccess && stepCount <= MAX_STEPS) {
//         if (this.page.isClosed()) {
//             throw new Error('❌ Browser page was unexpectedly closed (Likely due to a Test Timeout).');
//         }

//         Logger.step(stepCount);
//         await AllureHelper.step(`Step ${stepCount}`);
        
//         this.engine.resetStepState();

//         await this.frame.locator('body').first().waitFor();
//         await new Promise(res => setTimeout(res, 1500)); 

//         isSuccess = await this.engine.checkIfSuccessPage(); 
//         if (isSuccess) {
//           Logger.success('Successfully reached Thank You page.');
//           break;
//         }

//         // ==========================================
//         // SMART WAIT: POLL FOR FIELDS 
//         // ==========================================
//         let visibleElements: Locator[] = [];
//         let fieldsFound = false;
        
//         for (let i = 1; i <= 20; i++) {
//           if (this.page.isClosed()) throw new Error('❌ Browser page was unexpectedly closed.');

//           isSuccess = await this.engine.checkIfSuccessPage();
//           if (isSuccess) {
//             Logger.success('Successfully reached Thank You page after a short loading delay.');
//             break; 
//           }

//           const inputs = this.frame.locator('input:not([type="hidden"]):not([type="submit"]):not([type="button"]), select, textarea').filter({ visible: true });
          
//           if (await inputs.count() > 0) {
//             await new Promise(res => setTimeout(res, 1500));
//             visibleElements = await inputs.all();
//             fieldsFound = true;
//             break; 
//           }
          
//           await new Promise(res => setTimeout(res, 1000)); 
//         }

//         if (isSuccess) break;

//         if (!fieldsFound) {
//            Logger.action(`Warning: Waited 20s but no input fields found on Step ${stepCount}. Assuming splash page, clicking Next.`);
//            await this.engine.clickNext();
//            await new Promise(res => setTimeout(res, 3000));
//            stepCount++;
//            continue;
//         }

//         // ==========================================
//         // 🚀 TRIGGER EMPTY-FORM VALIDATION (RESTORED!)
//         // ==========================================
//         if (mode === 'negative') {
//           Logger.validationStart();
//           Logger.action(`Triggering empty-field validation for Step ${stepCount}...`);
          
//           try {
//               // 1. Click Next on the empty form to force required field errors
//               await this.engine.clickNext(); 
//               await new Promise(res => setTimeout(res, 1500)); 
              
//               // 2. Count the errors
//               const errorLocators = this.frame.locator('[class*="error"], [class*="Error"], [aria-invalid="true"], [id*="error"]').filter({ visible: true });
//               const errorCount = await errorLocators.count();

//               if (errorCount > 0) {
//                 Logger.success(`✅ Successfully verified ${errorCount} empty-field error messages appeared!`);
//               } else {
//                 Logger.action(`⚠️ Clicked Next, but detected no obvious error text. Filling fields anyway.`);
//               }
              
//               // 3. Re-grab elements in case the DOM shifted
//               visibleElements = await this.frame.locator('input:not([type="hidden"]):not([type="submit"]):not([type="button"]), select, textarea').filter({ visible: true }).all();
//           } catch (e: any) {
//               Logger.action(`⚠️ Could not trigger empty validation on this step: ${e.message}`);
//           }
//         }

//         Logger.action(`Found ${visibleElements.length} stable fields on Step ${stepCount}`);

//         // ✅ EMIT field data to FieldCaptureBus (Positive only)
//         if (mode === 'positive' && visibleElements.length > 0) {
//           const stepFields = await Promise.all(visibleElements.map(async el => ({
//             name: (await el.getAttribute('name')) || (await el.getAttribute('id')) || '',
//             type: (await el.getAttribute('type')) || (await el.evaluate((e: any) => e.tagName.toLowerCase())) || 'text',
//             step: stepCount
//           })));
//           FieldCaptureBus.addStepFields(formName, stepCount, stepFields.filter(f => f.name));
//         }

//         // ==========================================
//         // FILL THE FIELDS
//         // ==========================================
//         for (const element of visibleElements) {
//           if (this.page.isClosed()) throw new Error('❌ Browser page was unexpectedly closed during field evaluation.');
          
//           try {
//             await this.engine.processDynamicElement(element, mode);
//           } catch (e: any) {
//             const isSuccessNow = await this.engine.checkIfSuccessPage();
//             if (isSuccessNow) {
//                 Logger.success('✅ Form submitted successfully while waiting for a field. Late navigation detected!');
//                 isSuccess = true;
//                 break; 
//             }

//             if (e.message.includes('Target page, context or browser has been closed')) {
//                 throw new Error('❌ Form navigated away unexpectedly, or test timed out.');
//             }
//             throw e;
//           }
//         }

//         if (isSuccess) break;

//         // ==========================================
//         // SUBMIT THE STEP (WITH STRICT TRANSITION CHECK)
//         // ==========================================
//         let shouldClickNext = true;
//         if (visibleElements.length > 0) {
//             const isStillVisible = await visibleElements[0].isVisible().catch(() => false);
//             if (!isStillVisible) {
//                 shouldClickNext = false;
//                 Logger.action('Form automatically advanced to the next step. Skipping Next button click.');
//             }
//         }

//         if (shouldClickNext) {
//             try {
//               await this.engine.clickNext();
//             } catch (e: any) {
//               if (await this.engine.checkIfSuccessPage()) {
//                   Logger.success('✅ Late navigation to Thank You page detected at step submission!');
//                   isSuccess = true;
//                   break;
//               }
//               throw new Error(`❌ Form got stuck on Step ${stepCount}. The Next/Submit button disappeared or became unclickable. Original Error: ${e.message}`);
//             }
//         }
        
//         // 🚀 SMART CHECK 2: FREEZE UNTIL THE PAGE CHANGES
//         if (!isSuccess && visibleElements.length > 0) {
//             Logger.action('⏳ Waiting for step transition to complete...');
//             for (let w = 0; w < 10; w++) { // Wait up to 10 seconds
//                 if (await this.engine.checkIfSuccessPage()) {
//                     isSuccess = true;
//                     Logger.success('✅ Successfully detected Thank You page during transition wait.');
//                     break;
//                 }
//                 const stillVisible = await visibleElements[0].isVisible().catch(() => false);
//                 if (!stillVisible) {
//                     break; // Form successfully transitioned to the next step!
//                 }
//                 await new Promise(res => setTimeout(res, 1000));
//             }
//         }

//         stepCount++;
//       }

//       if (!isSuccess) {
//         throw new Error(`Form failed to reach the success page after ${MAX_STEPS} steps.`);
//       }

//       // ==========================================
//       // THE FINAL API VALIDATION STEP
//       // ==========================================
//       if (capturedRequest && capturedResponse) {
//         const actualPayload = await ApiCapture.getRequestPayload(capturedRequest);
//         const responseBody = await ApiCapture.getResponseBody(capturedResponse);
//         const expectedPayload = PayloadMapper.map(this.engine.getEnteredValues());

//         await AllureHelper.attachJson('Expected Payload', expectedPayload);
//         await AllureHelper.attachJson('API Request', actualPayload);
//         await AllureHelper.attachJson('API Response', responseBody);

//         PayloadValidator.validate(actualPayload, expectedPayload);
//         ResponseValidator.validate(responseBody);

//       } else {
//         throw new Error('❌ API Request to /v2/interest-create was not detected. Test failed.');
//       }

//       const metrics = this.engine.getTestCaseMetrics();
//       await AllureHelper.attachTestCaseMetrics(metrics);
//       await AllureHelper.success();
//       ReportManager.pass(formKey, form.group, formName, mode, metrics);

//       console.log(`[TestCases] form=${formName} mode=${mode} total=${metrics.total} passed=${metrics.passed} failed=${metrics.failed}`);
//       return metrics;

//     } catch (error) {
//       let message = error instanceof Error ? error.message : String(error);
//       if (message.includes('Target page, context or browser has been closed')) {
//           message = '❌ The test timed out, or the page closed unexpectedly during execution. Check test.setTimeout() limits.';
//       }

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



// import { Page, FrameLocator, Locator } from '@playwright/test';
// import { FormEngine, TestMode } from './FormEngine';
// import { Logger } from './Logger';
// import { FormDefinition } from './types';
// import { FieldCaptureBus } from './FieldCaptureBus';
// import { ReportManager } from '../utils/reporting/ReportManager';
// import { AllureHelper } from '../utils/reporting/AllureHelper';
// import { ApiCapture } from '../utils/api/ApiCapture';
// import { PayloadMapper } from '../utils/api/PayloadMapper';
// import { PayloadValidator } from '../utils/api/PayloadValidator'; 
// import { ResponseValidator } from '../utils/api/ResponseValidator';
// import { TestCaseMetrics } from './reporting/ReportTypes';

// export class FormRunner {
//   private engine: FormEngine;

//   constructor(
//     private page: Page,
//     private frame: FrameLocator
//   ) {
//     this.engine = new FormEngine(page, frame);
//   }

//   async run(formName: string, form: FormDefinition, mode: TestMode): Promise<TestCaseMetrics> {
//     Logger.startForm(formName, mode);
//     const formKey = `${formName}-${mode}-${Date.now()}`;
//     ReportManager.startForm(formKey);
//     await AllureHelper.startForm(form.category ?? 'Uncategorized', form.group, formName, mode);

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

//       while (!isSuccess && stepCount <= MAX_STEPS) {
//         if (this.page.isClosed()) {
//             throw new Error('❌ Browser page was unexpectedly closed (Likely due to a Test Timeout).');
//         }

//         Logger.step(stepCount);
//         await AllureHelper.step(`Step ${stepCount}`);
        
//         this.engine.resetStepState();
//         await this.frame.locator('body').first().waitFor();

//         // 🚀 SPEEDUP: Fast initial check
//         isSuccess = await this.engine.checkIfSuccessPage(); 
//         if (isSuccess) {
//           Logger.success('Successfully reached Thank You page.');
//           break;
//         }

//         // ==========================================
//         // FAST POLL FOR FIELDS 
//         // ==========================================
//         let visibleElements: Locator[] = [];
//         let fieldsFound = false;
        
//         // 🚀 SPEEDUP: Poll every 500ms instead of 1000ms
//         for (let i = 0; i < 20; i++) {
//           if (this.page.isClosed()) throw new Error('❌ Browser page was unexpectedly closed.');

//           isSuccess = await this.engine.checkIfSuccessPage();
//           if (isSuccess) {
//             Logger.success('Successfully reached Thank You page after a short loading delay.');
//             break; 
//           }

//           const inputs = this.frame.locator('input:not([type="hidden"]):not([type="submit"]):not([type="button"]), select, textarea').filter({ visible: true });
          
//           if (await inputs.count() > 0) {
//             await new Promise(res => setTimeout(res, 300)); // Tiny debounce
//             visibleElements = await inputs.all();
//             fieldsFound = true;
//             break; 
//           }
          
//           await new Promise(res => setTimeout(res, 500)); 
//         }

//         if (isSuccess) break;

//         if (!fieldsFound) {
//            Logger.action(`Warning: Waited 10s but no input fields found on Step ${stepCount}. Assuming splash page, clicking Next.`);
//            await this.engine.clickNext();
//            await new Promise(res => setTimeout(res, 1000));
//            stepCount++;
//            continue;
//         }

//         // ==========================================
//         // 🚀 TRIGGER EMPTY-FORM VALIDATION 
//         // ==========================================
//         if (mode === 'negative') {
//           Logger.validationStart();
//           Logger.action(`Triggering empty-field validation for Step ${stepCount}...`);
          
//           try {
//               await this.engine.clickNext(); 
//               // 🚀 SPEEDUP: Wait 800ms instead of 1500ms for errors to show
//               await new Promise(res => setTimeout(res, 800)); 
              
//               const errorLocators = this.frame.locator('[class*="error"], [class*="Error"], [aria-invalid="true"], [id*="error"]').filter({ visible: true });
//               const errorCount = await errorLocators.count();

//               if (errorCount > 0) {
//                 Logger.success(`✅ Successfully verified ${errorCount} empty-field error messages appeared!`);
//               } else {
//                 Logger.action(`⚠️ Clicked Next, but detected no obvious error text. Filling fields anyway.`);
//               }
              
//               visibleElements = await this.frame.locator('input:not([type="hidden"]):not([type="submit"]):not([type="button"]), select, textarea').filter({ visible: true }).all();
//           } catch (e: any) {
//               Logger.action(`⚠️ Could not trigger empty validation on this step: ${e.message}`);
//           }
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
//         // FILL THE FIELDS
//         // ==========================================
//         for (const element of visibleElements) {
//           if (this.page.isClosed()) throw new Error('❌ Browser page was unexpectedly closed during field evaluation.');
          
//           try {
//             await this.engine.processDynamicElement(element, mode);
//           } catch (e: any) {
//             const isSuccessNow = await this.engine.checkIfSuccessPage();
//             if (isSuccessNow) {
//                 Logger.success('✅ Form submitted successfully while waiting for a field. Late navigation detected!');
//                 isSuccess = true;
//                 break; 
//             }

//             if (e.message.includes('Target page, context or browser has been closed')) {
//                 throw new Error('❌ Form navigated away unexpectedly, or test timed out.');
//             }
//             throw e;
//           }
//         }

//         if (isSuccess) break;

//         // ==========================================
//         // SUBMIT THE STEP 
//         // ==========================================
//         let shouldClickNext = true;
//         if (visibleElements.length > 0) {
//             const isStillVisible = await visibleElements[0].isVisible().catch(() => false);
//             if (!isStillVisible) {
//                 shouldClickNext = false;
//                 Logger.action('Form automatically advanced to the next step. Skipping Next button click.');
//             }
//         }

//         if (shouldClickNext) {
//             try {
//               await this.engine.clickNext();
//             } catch (e: any) {
//               if (await this.engine.checkIfSuccessPage()) {
//                   Logger.success('✅ Late navigation to Thank You page detected at step submission!');
//                   isSuccess = true;
//                   break;
//               }
//               throw new Error(`❌ Form got stuck on Step ${stepCount}. The Next/Submit button disappeared or became unclickable. Original Error: ${e.message}`);
//             }
//         }
        
//         // 🚀 SMART CHECK 2: THE FIXED TRANSITION FREEZE
//         if (!isSuccess && visibleElements.length > 0) {
//             Logger.action('⏳ Waiting for step transition to complete...');
//             const firstEl = visibleElements[0];
            
//             for (let w = 0; w < 20; w++) { // Polling every 500ms
//                 if (await this.engine.checkIfSuccessPage()) {
//                     isSuccess = true;
//                     Logger.success('✅ Successfully detected Thank You page during transition wait.');
//                     break;
//                 }
                
//                 const stillVisible = await firstEl.isVisible().catch(() => false);
//                 if (!stillVisible) {
//                     // 🚀 THE FIX: The fields just disappeared. Give the CRM 1 second to route to the Thank You page!
//                     await new Promise(res => setTimeout(res, 1000));
//                     if (await this.engine.checkIfSuccessPage()) {
//                          isSuccess = true;
//                          Logger.success('✅ Successfully detected Thank You page after step unloaded.');
//                     }
//                     break; 
//                 }
//                 await new Promise(res => setTimeout(res, 500));
//             }
//         }

//         stepCount++;
//       }

//       if (!isSuccess) {
//         throw new Error(`Form failed to reach the success page after ${MAX_STEPS} steps.`);
//       }

//       // ==========================================
//       // THE FINAL API VALIDATION STEP
//       // ==========================================
//       if (capturedRequest && capturedResponse) {
//         const actualPayload = await ApiCapture.getRequestPayload(capturedRequest);
//         const responseBody = await ApiCapture.getResponseBody(capturedResponse);
//         const expectedPayload = PayloadMapper.map(this.engine.getEnteredValues());

//         await AllureHelper.attachJson('Expected Payload', expectedPayload);
//         await AllureHelper.attachJson('API Request', actualPayload);
//         await AllureHelper.attachJson('API Response', responseBody);

//         PayloadValidator.validate(actualPayload, expectedPayload);
//         ResponseValidator.validate(responseBody);

//       } else {
//         throw new Error('❌ API Request to /v2/interest-create was not detected. Test failed.');
//       }

//       const metrics = this.engine.getTestCaseMetrics();
//       await AllureHelper.attachTestCaseMetrics(metrics);
//       await AllureHelper.success();
//       ReportManager.pass(formKey, form.group, formName, mode, metrics);

//       console.log(`[TestCases] form=${formName} mode=${mode} total=${metrics.total} passed=${metrics.passed} failed=${metrics.failed}`);
//       return metrics;

//     } catch (error) {
//       let message = error instanceof Error ? error.message : String(error);
//       if (message.includes('Target page, context or browser has been closed')) {
//           message = '❌ The test timed out, or the page closed unexpectedly during execution. Check test.setTimeout() limits.';
//       }

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

// import { Page, FrameLocator, Locator } from '@playwright/test';
// import { FormEngine, TestMode } from './FormEngine';
// import { Logger } from './Logger';
// import { FormDefinition } from './types';
// import { FieldCaptureBus } from './FieldCaptureBus';
// import { ReportManager } from '../utils/reporting/ReportManager';
// import { AllureHelper } from '../utils/reporting/AllureHelper';
// import { ApiCapture } from '../utils/api/ApiCapture';
// import { PayloadMapper } from '../utils/api/PayloadMapper';
// import { PayloadValidator } from '../utils/api/PayloadValidator'; 
// import { ResponseValidator } from '../utils/api/ResponseValidator';
// import { TestCaseMetrics } from './reporting/ReportTypes';

// export class FormRunner {
//   private engine: FormEngine;

//   constructor(
//     private page: Page,
//     private frame: FrameLocator
//   ) {
//     this.engine = new FormEngine(page, frame);
//   }

//   async run(formName: string, form: FormDefinition, mode: TestMode): Promise<TestCaseMetrics> {
//     Logger.startForm(formName, mode);
//     const formKey = `${formName}-${mode}-${Date.now()}`;
//     ReportManager.startForm(formKey);
//     await AllureHelper.startForm(form.category ?? 'Uncategorized', form.group, formName, mode);

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

//       while (!isSuccess && stepCount <= MAX_STEPS) {
//         if (this.page.isClosed()) {
//             throw new Error('❌ Browser page was unexpectedly closed (Likely due to a Test Timeout).');
//         }

//         Logger.step(stepCount);
//         await AllureHelper.step(`Step ${stepCount}`);
        
//         this.engine.resetStepState();

//         // 🚀 SPEEDUP: Fast initial check
//         isSuccess = await this.engine.checkIfSuccessPage(); 
//         if (isSuccess) {
//           Logger.success('Successfully reached Thank You page.');
//           break;
//         }

//         // ==========================================
//         // SMART WAIT: NATIVE LOCATOR POLLING
//         // ==========================================
//         const inputs = this.frame.locator('input:not([type="hidden"]):not([type="submit"]):not([type="button"]), select, textarea').filter({ visible: true });
        
//         // 🚀 SPEEDUP: Native wait. Moves instantly when fields appear, gives up after 3 seconds if splash page.
//         try {
//             await inputs.first().waitFor({ state: 'visible', timeout: 3000 });
//         } catch (e) {
//             // Might be a splash page or Thank You page loading
//         }

//         isSuccess = await this.engine.checkIfSuccessPage();
//         if (isSuccess) break;

//         let visibleElements: Locator[] = [];
//         if (await inputs.count() > 0) {
//             visibleElements = await inputs.all();
//         } else {
//            Logger.action(`Warning: No input fields found on Step ${stepCount}. Assuming splash page, clicking Next.`);
//            await this.engine.clickNext();
//            await this.page.waitForTimeout(1000);
//            stepCount++;
//            continue;
//         }

//         // ==========================================
//         // 🚀 TRIGGER EMPTY-FORM VALIDATION (NATIVE SPEED)
//         // ==========================================
//         if (mode === 'negative') {
//           Logger.validationStart();
//           Logger.action(`Triggering empty-field validation for Step ${stepCount}...`);
          
//           try {
//               await this.engine.clickNext(); 
              
//               // 🚀 SPEEDUP: Wait for the first error to appear. Moves INSTANTLY when it shows!
//               const errorLocators = this.frame.locator('[class*="error"], [class*="Error"], [aria-invalid="true"], [id*="error"]').filter({ visible: true });
//               await errorLocators.first().waitFor({ state: 'visible', timeout: 1500 }).catch(() => {});
              
//               const errorCount = await errorLocators.count();
//               if (errorCount > 0) {
//                 Logger.success(`✅ Successfully verified ${errorCount} empty-field error messages appeared!`);
//               } else {
//                 Logger.action(`⚠️ Clicked Next, but detected no obvious error text. Filling fields anyway.`);
//               }
              
//               visibleElements = await this.frame.locator('input:not([type="hidden"]):not([type="submit"]):not([type="button"]), select, textarea').filter({ visible: true }).all();
//           } catch (e: any) {
//               Logger.action(`⚠️ Could not trigger empty validation on this step: ${e.message}`);
//           }
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
//         // FILL THE FIELDS
//         // ==========================================
//         for (const element of visibleElements) {
//           if (this.page.isClosed()) throw new Error('❌ Browser page was unexpectedly closed during field evaluation.');
          
//           try {
//             await this.engine.processDynamicElement(element, mode);
//           } catch (e: any) {
//             const isSuccessNow = await this.engine.checkIfSuccessPage();
//             if (isSuccessNow) {
//                 Logger.success('✅ Form submitted successfully while waiting for a field. Late navigation detected!');
//                 isSuccess = true;
//                 break; 
//             }
//             if (e.message.includes('Target page, context or browser has been closed')) {
//                 throw new Error('❌ Form navigated away unexpectedly, or test timed out.');
//             }
//             throw e;
//           }
//         }

//         if (isSuccess) break;

//         // ==========================================
//         // SUBMIT THE STEP 
//         // ==========================================
//         let shouldClickNext = true;
//         if (visibleElements.length > 0) {
//             const isStillVisible = await visibleElements[0].isVisible().catch(() => false);
//             if (!isStillVisible) {
//                 shouldClickNext = false;
//                 Logger.action('Form automatically advanced to the next step. Skipping Next button click.');
//             }
//         }

//         if (shouldClickNext) {
//             try {
//               await this.engine.clickNext();
//             } catch (e: any) {
//               if (await this.engine.checkIfSuccessPage()) {
//                   Logger.success('✅ Late navigation to Thank You page detected at step submission!');
//                   isSuccess = true;
//                   break;
//               }
//               throw new Error(`❌ Form got stuck on Step ${stepCount}. The Next/Submit button disappeared or became unclickable. Original Error: ${e.message}`);
//             }
//         }
        
//         // ==========================================
//         // 🚀 SMART CHECK 2: FAST TRANSITION FREEZE
//         // ==========================================
//         if (!isSuccess && visibleElements.length > 0) {
//             Logger.action('⏳ Waiting for step transition to complete...');
            
//             // 🚀 SPEEDUP: Native wait! Playwright freezes until the old field physically disappears.
//             // As soon as it hides, it instantly moves to the next loop!
//             await visibleElements[0].waitFor({ state: 'hidden', timeout: 5000 }).catch(() => {});
            
//             // Double check if that transition was actually the Thank You page
//             if (await this.engine.checkIfSuccessPage()) {
//                 isSuccess = true;
//                 Logger.success('✅ Successfully detected Thank You page after step unloaded.');
//             }
//         }

//         stepCount++;
//       }

//       if (!isSuccess) {
//         throw new Error(`Form failed to reach the success page after ${MAX_STEPS} steps.`);
//       }

//       // ==========================================
//       // THE FINAL API VALIDATION STEP
//       // ==========================================
//       if (capturedRequest && capturedResponse) {
//         const actualPayload = await ApiCapture.getRequestPayload(capturedRequest);
//         const responseBody = await ApiCapture.getResponseBody(capturedResponse);
//         const expectedPayload = PayloadMapper.map(this.engine.getEnteredValues());

//         await AllureHelper.attachJson('Expected Payload', expectedPayload);
//         await AllureHelper.attachJson('API Request', actualPayload);
//         await AllureHelper.attachJson('API Response', responseBody);

//         PayloadValidator.validate(actualPayload, expectedPayload);
//         ResponseValidator.validate(responseBody);

//       } else {
//         throw new Error('❌ API Request to /v2/interest-create was not detected. Test failed.');
//       }

//       const metrics = this.engine.getTestCaseMetrics();
//       await AllureHelper.attachTestCaseMetrics(metrics);
//       await AllureHelper.success();
//       ReportManager.pass(formKey, form.group, formName, mode, metrics);

//       console.log(`[TestCases] form=${formName} mode=${mode} total=${metrics.total} passed=${metrics.passed} failed=${metrics.failed}`);
//       return metrics;

//     } catch (error) {
//       let message = error instanceof Error ? error.message : String(error);
//       if (message.includes('Target page, context or browser has been closed')) {
//           message = '❌ The test timed out, or the page closed unexpectedly during execution. Check test.setTimeout() limits.';
//       }

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



// import { Page, FrameLocator, Locator } from '@playwright/test';
// import { FormEngine, TestMode } from './FormEngine';
// import { Logger } from './Logger';
// import { FormDefinition } from './types';
// import { FieldCaptureBus } from './FieldCaptureBus';
// import { ReportManager } from '../utils/reporting/ReportManager';
// import { AllureHelper } from '../utils/reporting/AllureHelper';
// import { ApiCapture } from '../utils/api/ApiCapture';
// import { PayloadMapper } from '../utils/api/PayloadMapper';
// import { PayloadValidator } from '../utils/api/PayloadValidator'; 
// import { ResponseValidator } from '../utils/api/ResponseValidator';
// import { TestCaseMetrics } from './reporting/ReportTypes';

// export class FormRunner {
//   private engine: FormEngine;

//   constructor(
//     private page: Page,
//     private frame: FrameLocator
//   ) {
//     this.engine = new FormEngine(page, frame);
//   }

//   async run(formName: string, form: FormDefinition, mode: TestMode): Promise<TestCaseMetrics> {
//     Logger.startForm(formName, mode);
//     const formKey = `${formName}-${mode}-${Date.now()}`;
//     ReportManager.startForm(formKey);
//     await AllureHelper.startForm(form.category ?? 'Uncategorized', form.group, formName, mode);

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

//       while (!isSuccess && stepCount <= MAX_STEPS) {
//         if (this.page.isClosed()) {
//             throw new Error('❌ Browser page was unexpectedly closed (Likely due to a Test Timeout).');
//         }

//         Logger.step(stepCount);
//         await AllureHelper.step(`Step ${stepCount}`);
        
//         this.engine.resetStepState();
//         await this.frame.locator('body').first().waitFor();

//         // ==========================================
//         // 🚀 SMART WAIT: PARALLEL POLLER (Lightning Fast)
//         // Checks for Thank You page OR Input Fields every 250ms
//         // ==========================================
//         let visibleElements: Locator[] = [];
//         let fieldsFound = false;

//         for (let i = 0; i < 40; i++) { // Max 10 seconds (40 * 250ms)
//           if (this.page.isClosed()) throw new Error('❌ Browser page was unexpectedly closed.');

//           // 1. Did we hit the Thank You page?
//           isSuccess = await this.engine.checkIfSuccessPage();
//           if (isSuccess) {
//             Logger.success('✅ Successfully reached Thank You page.');
//             break;
//           }

//           // 2. Did new fields appear for the next step?
//           const inputs = this.frame.locator('input:not([type="hidden"]):not([type="submit"]):not([type="button"]), select, textarea').filter({ visible: true });
//           if (await inputs.count() > 0) {
//             visibleElements = await inputs.all();
//             fieldsFound = true;
//             break;
//           }

//           // Wait a tiny 250ms fraction before checking again
//           await new Promise(res => setTimeout(res, 250));
//         }

//         if (isSuccess) break;

//         if (!fieldsFound) {
//            Logger.action(`Warning: Waited 10s but no input fields found on Step ${stepCount}. Assuming splash page, clicking Next.`);
//            await this.engine.clickNext();
//            await new Promise(res => setTimeout(res, 1000));
//            stepCount++;
//            continue;
//         }

//         // ==========================================
//         // 🚀 TRIGGER EMPTY-FORM VALIDATION 
//         // ==========================================
//         if (mode === 'negative') {
//           Logger.validationStart();
//           Logger.action(`Triggering empty-field validation for Step ${stepCount}...`);
          
//           try {
//               await this.engine.clickNext(); 
//               await new Promise(res => setTimeout(res, 800)); 
              
//               const errorLocators = this.frame.locator('[class*="error"], [class*="Error"], [aria-invalid="true"], [id*="error"]').filter({ visible: true });
//               const errorCount = await errorLocators.count();

//               if (errorCount > 0) {
//                 Logger.success(`✅ Successfully verified ${errorCount} empty-field error messages appeared!`);
//               } else {
//                 Logger.action(`⚠️ Clicked Next, but detected no obvious error text. Filling fields anyway.`);
//               }
              
//               visibleElements = await this.frame.locator('input:not([type="hidden"]):not([type="submit"]):not([type="button"]), select, textarea').filter({ visible: true }).all();
//           } catch (e: any) {
//               Logger.action(`⚠️ Could not trigger empty validation on this step: ${e.message}`);
//           }
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
//         // FILL THE FIELDS
//         // ==========================================
//         for (const element of visibleElements) {
//           if (this.page.isClosed()) throw new Error('❌ Browser page was unexpectedly closed during field evaluation.');
          
//           try {
//             await this.engine.processDynamicElement(element, mode);
//           } catch (e: any) {
//             const isSuccessNow = await this.engine.checkIfSuccessPage();
//             if (isSuccessNow) {
//                 Logger.success('✅ Form submitted successfully while waiting for a field. Late navigation detected!');
//                 isSuccess = true;
//                 break; 
//             }

//             if (e.message.includes('Target page, context or browser has been closed')) {
//                 throw new Error('❌ Form navigated away unexpectedly, or test timed out.');
//             }
//             throw e;
//           }
//         }

//         if (isSuccess) break;

//         // ==========================================
//         // SUBMIT THE STEP 
//         // ==========================================
//         let shouldClickNext = true;
//         if (visibleElements.length > 0) {
//             const isStillVisible = await visibleElements[0].isVisible().catch(() => false);
//             if (!isStillVisible) {
//                 shouldClickNext = false;
//                 Logger.action('Form automatically advanced to the next step. Skipping Next button click.');
//             }
//         }

//         if (shouldClickNext) {
//             try {
//               await this.engine.clickNext();
//             } catch (e: any) {
//               if (await this.engine.checkIfSuccessPage()) {
//                   Logger.success('✅ Late navigation to Thank You page detected at step submission!');
//                   isSuccess = true;
//                   break;
//               }
//               throw new Error(`❌ Form got stuck on Step ${stepCount}. The Next/Submit button disappeared or became unclickable. Original Error: ${e.message}`);
//             }
//         }
        
//         // ==========================================
//         // 🚀 SMART CHECK 2: FAST TRANSITION FREEZE
//         // ==========================================
//         if (!isSuccess && visibleElements.length > 0) {
//             Logger.action('⏳ Waiting for step transition to complete...');
//             const oldField = visibleElements[0];
            
//             // Checks every 250ms for the old field to disappear OR the Thank You page to appear
//             for (let w = 0; w < 20; w++) { // Max 5 seconds
//                 if (await this.engine.checkIfSuccessPage()) {
//                     isSuccess = true;
//                     Logger.success('✅ Successfully detected Thank You page during transition wait.');
//                     break;
//                 }
                
//                 const stillVisible = await oldField.isVisible().catch(() => false);
//                 if (!stillVisible) {
//                     break; // The field disappeared! Exit the freeze instantly.
//                 }
//                 await new Promise(res => setTimeout(res, 250));
//             }
//         }

//         stepCount++;
//       }

//       if (!isSuccess) {
//         throw new Error(`Form failed to reach the success page after ${MAX_STEPS} steps.`);
//       }

//       // ==========================================
//       // THE FINAL API VALIDATION STEP
//       // ==========================================
//       if (capturedRequest && capturedResponse) {
//         const actualPayload = await ApiCapture.getRequestPayload(capturedRequest);
//         const responseBody = await ApiCapture.getResponseBody(capturedResponse);
//         const expectedPayload = PayloadMapper.map(this.engine.getEnteredValues());

//         await AllureHelper.attachJson('Expected Payload', expectedPayload);
//         await AllureHelper.attachJson('API Request', actualPayload);
//         await AllureHelper.attachJson('API Response', responseBody);

//         PayloadValidator.validate(actualPayload, expectedPayload);
//         ResponseValidator.validate(responseBody);

//       } else {
//         throw new Error('❌ API Request to /v2/interest-create was not detected. Test failed.');
//       }

//       const metrics = this.engine.getTestCaseMetrics();
//       await AllureHelper.attachTestCaseMetrics(metrics);
//       await AllureHelper.success();
//       ReportManager.pass(formKey, form.group, formName, mode, metrics);

//       console.log(`[TestCases] form=${formName} mode=${mode} total=${metrics.total} passed=${metrics.passed} failed=${metrics.failed}`);
//       return metrics;

//     } catch (error) {
//       let message = error instanceof Error ? error.message : String(error);
//       if (message.includes('Target page, context or browser has been closed')) {
//           message = '❌ The test timed out, or the page closed unexpectedly during execution. Check test.setTimeout() limits.';
//       }

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

import { Page, FrameLocator, Locator } from '@playwright/test';
import { FormEngine, TestMode } from './FormEngine';
import { Logger } from './Logger';
import { FormDefinition } from './types';
import { FieldCaptureBus } from './FieldCaptureBus';
import { ReportManager } from '../utils/reporting/ReportManager';
import { AllureHelper } from '../utils/reporting/AllureHelper';
import { ApiCapture } from '../utils/api/ApiCapture';
import { PayloadMapper } from '../utils/api/PayloadMapper';
import { PayloadValidator } from '../utils/api/PayloadValidator'; 
import { ResponseValidator } from '../utils/api/ResponseValidator';
import { TestCaseMetrics } from './reporting/ReportTypes';

export class FormRunner {
  private engine: FormEngine;

  constructor(
    private page: Page,
    private frame: FrameLocator
  ) {
    this.engine = new FormEngine(page, frame);
  }

  async run(formName: string, form: FormDefinition, mode: TestMode): Promise<TestCaseMetrics> {
    Logger.startForm(formName, mode);
    const formKey = `${formName}-${mode}-${Date.now()}`;
    ReportManager.startForm(formKey);
    await AllureHelper.startForm(form.category ?? 'Uncategorized', form.group, formName, mode);

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

      while (!isSuccess && stepCount <= MAX_STEPS) {
        if (this.page.isClosed()) {
            throw new Error('❌ Browser page was unexpectedly closed (Likely due to a Test Timeout).');
        }

        Logger.step(stepCount);
        await AllureHelper.step(`Step ${stepCount}`);
        
        this.engine.resetStepState();

        // ==========================================
        // 🚀 SPEEDUP 1: THE "SMART RACE"
        // Check for Thank You Page OR Input Fields simultaneously!
        // ==========================================
        const inputs = this.frame.locator('input:not([type="hidden"]):not([type="submit"]):not([type="button"]), select, textarea').filter({ visible: true });
        let fieldsFound = false;

        for (let i = 0; i < 30; i++) { // Max wait ~9 seconds (30 * 300ms)
            if (this.page.isClosed()) throw new Error('❌ Browser page was unexpectedly closed.');

            // Check 1: Did the Thank You page load?
            isSuccess = await this.engine.checkIfSuccessPage();
            if (isSuccess) {
                Logger.success('✅ Successfully reached Thank You page.');
                break;
            }

            // Check 2: Did the new input fields load?
            if (await inputs.count() > 0) {
                fieldsFound = true;
                break;
            }

            // Wait a tiny fraction of a second before checking again
            await this.page.waitForTimeout(300);
        }

        if (isSuccess) break;

        let visibleElements = await inputs.all();

        if (!fieldsFound || visibleElements.length === 0) {
           Logger.action(`Warning: No input fields found on Step ${stepCount}. Assuming splash page, clicking Next.`);
           await this.engine.clickNext();
           await this.page.waitForTimeout(1000); // 1-second fallback for pure splash screens
           stepCount++;
           continue;
        }

        // ==========================================
        // 🚀 SPEEDUP 2: NATIVE WAIT FOR EMPTY VALIDATION ERRORS
        // ==========================================
        if (mode === 'negative') {
          Logger.validationStart();
          Logger.action(`Triggering empty-field validation for Step ${stepCount}...`);
          
          try {
              await this.engine.clickNext(); 
              
              const errorLocators = this.frame.locator('[class*="error"], [class*="Error"], [aria-invalid="true"], [id*="error"]').filter({ visible: true });
              
              // Waits natively for the first error to appear. Moves instantly when it does!
              await errorLocators.first().waitFor({ state: 'visible', timeout: 800 }).catch(() => {});
              
              const errorCount = await errorLocators.count();
              if (errorCount > 0) {
                Logger.success(`✅ Successfully verified ${errorCount} empty-field error messages appeared!`);
              } else {
                Logger.action(`⚠️ Clicked Next, but detected no obvious error text. Filling fields anyway.`);
              }
              
              // Refresh elements in case DOM shifted
              visibleElements = await inputs.all();
          } catch (e: any) {
              Logger.action(`⚠️ Could not trigger empty validation on this step: ${e.message}`);
          }
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
        // FILL THE FIELDS
        // ==========================================
        for (const element of visibleElements) {
          if (this.page.isClosed()) throw new Error('❌ Browser page was unexpectedly closed during field evaluation.');
          
          try {
            await this.engine.processDynamicElement(element, mode);
          } catch (e: any) {
            const isSuccessNow = await this.engine.checkIfSuccessPage();
            if (isSuccessNow) {
                Logger.success('✅ Form submitted successfully while waiting for a field. Late navigation detected!');
                isSuccess = true;
                break; 
            }

            if (e.message.includes('Target page, context or browser has been closed')) {
                throw new Error('❌ Form navigated away unexpectedly, or test timed out.');
            }
            throw e;
          }
        }

        if (isSuccess) break;

        // ==========================================
        // SUBMIT THE STEP 
        // ==========================================
        let shouldClickNext = true;
        if (visibleElements.length > 0) {
            const isStillVisible = await visibleElements[0].isVisible().catch(() => false);
            if (!isStillVisible) {
                shouldClickNext = false;
                Logger.action('Form automatically advanced to the next step. Skipping Next button click.');
            }
        }

        if (shouldClickNext) {
            try {
              await this.engine.clickNext();
            } catch (e: any) {
              if (await this.engine.checkIfSuccessPage()) {
                  Logger.success('✅ Late navigation to Thank You page detected at step submission!');
                  isSuccess = true;
                  break;
              }
              throw new Error(`❌ Form got stuck on Step ${stepCount}. The Next/Submit button disappeared or became unclickable. Original Error: ${e.message}`);
            }
        }
        
        // ==========================================
        // 🚀 SPEEDUP 3: NATIVE TRANSITION FREEZE
        // ==========================================
        if (!isSuccess && visibleElements.length > 0) {
            Logger.action('⏳ Waiting for step transition to complete...');
            
            // Natively freezes until the field disappears from screen. Moves the millisecond it hides!
            await visibleElements[0].waitFor({ state: 'hidden', timeout: 5000 }).catch(() => {});
            
            // Instantly double check if that transition was actually the Thank You page
            isSuccess = await this.engine.checkIfSuccessPage();
            if (isSuccess) {
                Logger.success('✅ Successfully detected Thank You page after step unloaded.');
            }
        }

        stepCount++;
      }

      if (!isSuccess) {
        throw new Error(`Form failed to reach the success page after ${MAX_STEPS} steps.`);
      }

      // ==========================================
      // THE FINAL API VALIDATION STEP
      // ==========================================
      if (capturedRequest && capturedResponse) {
        const actualPayload = await ApiCapture.getRequestPayload(capturedRequest);
        const responseBody = await ApiCapture.getResponseBody(capturedResponse);
        const expectedPayload = PayloadMapper.map(this.engine.getEnteredValues());

        await AllureHelper.attachJson('Expected Payload', expectedPayload);
        await AllureHelper.attachJson('API Request', actualPayload);
        await AllureHelper.attachJson('API Response', responseBody);

        PayloadValidator.validate(actualPayload, expectedPayload);
        ResponseValidator.validate(responseBody);

      } else {
        throw new Error('❌ API Request to /v2/interest-create was not detected. Test failed.');
      }

      const metrics = this.engine.getTestCaseMetrics();
      await AllureHelper.attachTestCaseMetrics(metrics);
      await AllureHelper.success();
      ReportManager.pass(formKey, form.group, formName, mode, metrics);

      console.log(`[TestCases] form=${formName} mode=${mode} total=${metrics.total} passed=${metrics.passed} failed=${metrics.failed}`);
      return metrics;

    } catch (error) {
      let message = error instanceof Error ? error.message : String(error);
      if (message.includes('Target page, context or browser has been closed')) {
          message = '❌ The test timed out, or the page closed unexpectedly during execution. Check test.setTimeout() limits.';
      }

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