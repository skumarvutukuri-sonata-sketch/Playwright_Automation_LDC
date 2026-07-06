import { Page, FrameLocator, Locator } from '@playwright/test';
import { FormEngine, TestMode } from './FormEngine';
import { Logger } from './Logger';
import { FormDefinition } from './types';
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
        Logger.step(stepCount);
        await AllureHelper.step(`Step ${stepCount}`);
        
        this.engine.resetStepState();

        await this.frame.locator('body').first().waitFor();
        await new Promise(res => setTimeout(res, 1500)); 

        isSuccess = await this.engine.checkIfSuccessPage(); 
        if (isSuccess) {
          Logger.success('Successfully reached Thank You page.');
          break;
        }

        // ==========================================
        // SMART WAIT: POLL FOR FIELDS 
        // ==========================================
        let visibleElements: Locator[] = [];
        let fieldsFound = false;
        
        for (let i = 1; i <= 20; i++) {
          isSuccess = await this.engine.checkIfSuccessPage();
          if (isSuccess) {
            Logger.success('Successfully reached Thank You page after a short loading delay.');
            break; 
          }

          const inputs = this.frame.locator('input:not([type="hidden"]):not([type="submit"]):not([type="button"]), select, textarea').filter({ visible: true });
          
          if (await inputs.count() > 0) {
            await new Promise(res => setTimeout(res, 1500));
            visibleElements = await inputs.all();
            fieldsFound = true;
            break; 
          }
          
          await new Promise(res => setTimeout(res, 1000)); 
        }

        if (isSuccess) {
            break;
        }

        if (!fieldsFound) {
           Logger.action(`Warning: Waited 20s but no input fields found on Step ${stepCount}. Assuming splash page, clicking Next.`);
           await this.engine.clickNext();
           await new Promise(res => setTimeout(res, 3000));
           stepCount++;
           continue;
        }

        // ==========================================
        // 🚀 TRIGGER EMPTY-FORM VALIDATION ON EVERY STEP (NEGATIVE MODE ONLY)
        // ==========================================
        if (mode === 'negative') {
          Logger.validationStart();
          Logger.action(`Triggering empty-field validation for Step ${stepCount}...`);
          
          // 1. Click Next on the empty form
          await this.engine.clickNext(); 
          await new Promise(res => setTimeout(res, 1500)); // Wait for red errors to render
          
          // 2. Explicitly count and verify the error messages appeared
          // This looks for common CRM error classes (adjust if your CRM uses specific ones)
          const errorLocators = this.frame.locator('[class*="error"], [class*="Error"], [aria-invalid="true"], [id*="error"]').filter({ visible: true });
          const errorCount = await errorLocators.count();

          if (errorCount > 0) {
            Logger.success(`✅ Successfully verified ${errorCount} empty-field error messages appeared!`);
          } else {
            Logger.action(`⚠️ Clicked Next, but detected no obvious error text. Filling fields anyway.`);
          }
          
          // 3. Re-grab elements in case the error messages shifted the DOM
          visibleElements = await this.frame.locator('input:not([type="hidden"]):not([type="submit"]):not([type="button"]), select, textarea').filter({ visible: true }).all();
        }

        Logger.action(`Found ${visibleElements.length} stable fields on Step ${stepCount}`);

        // ==========================================
        // FILL THE FIELDS
        // ==========================================
        for (const element of visibleElements) {
          await this.engine.processDynamicElement(element, mode);
        }

        // ==========================================
        // SUBMIT THE STEP
        // ==========================================
        await this.engine.clickNext();
        
        await new Promise(res => setTimeout(res, 1500)); 
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
      const message = error instanceof Error ? error.message : String(error);
      const metrics = this.engine.getTestCaseMetrics();
      await AllureHelper.attachTestCaseMetrics(metrics);
      await AllureHelper.failure(message);
      ReportManager.fail(formKey, form.group, formName, mode, message, metrics);
      console.log(`[TestCases] form=${formName} mode=${mode} total=${metrics.total} passed=${metrics.passed} failed=${metrics.failed}`);
      throw error;
      
    } finally {
      this.page.removeListener('request', requestListener);
      this.page.removeListener('response', responseListener);
      Logger.endForm();
    }
  }
}