import { Page, FrameLocator } from '@playwright/test';
import { FormEngine, TestMode } from './FormEngine';
import { Logger } from './Logger';
import { FormDefinition } from './types';
import { ReportManager } from '../utils/reporting/ReportManager';
import { AllureHelper } from '../utils/reporting/AllureHelper';
import { ApiCapture } from '../utils/api/ApiCapture';
import { PayloadMapper } from '../utils/api/PayloadMapper';
import { PayloadValidator } from '../utils/api/PayloadValidator';
import { ResponseValidator } from '../utils/api/ResponseValidator';

export class FormRunner {

  private engine: FormEngine;

  constructor(
    private page: Page,
    private frame: FrameLocator
  ) {
    this.engine = new FormEngine(page, frame);
  }

  /**
   * Main runner
   */
  async run(
    formName: string,
    form: FormDefinition,
    mode: TestMode
  ) {

    Logger.startForm(formName, mode);

    const formKey = `${formName}-${mode}-${Date.now()}`;

    ReportManager.startForm(formKey);

    await AllureHelper.startForm(
      form.group,
      formName,
      mode
    );

    try {

      const steps = form.steps;

      for (let i = 0; i < steps.length; i++) {

        const step = steps[i];

        Logger.step(i + 1);

        await AllureHelper.step(`Step ${i + 1}`);

        // Wait for step to load
        await this.frame.locator('body').first().waitFor();

        await this.frame
          .locator('select:visible, input:visible, textarea:visible')
          .first()
          .waitFor({ state: 'visible' });

        // Stabilize dynamic UI
        await new Promise(res => setTimeout(res, 1200));

        // ==========================================================
        // 🚀 THE FIX: Start listening BEFORE we click Next
        // ==========================================================
        let apiCaptureInstance: any;
        if (i === steps.length - 1) {
            apiCaptureInstance = await ApiCapture.capture(
                this.page,
                '/v2/interest-create'
            );
        }

        // ==========================
        // Validation Mode
        // ==========================
        if (mode === 'validation') {

          Logger.validationStart();

          // Trigger validation
          await this.engine.clickNext();

          for (const field of step.fields) {

            await AllureHelper.field(field.label);

            await this.engine.processField(
              field.label,
              mode,
              field.type
            );
          }

          await this.engine.clickNext(); // This click submits the form on the last step

        } else {

          // ==========================
          // Happy Mode
          // ==========================
          for (const field of step.fields) {

            await AllureHelper.field(field.label);

            await this.engine.processField(
              field.label,
              mode,
              field.type
            );
          }

          await this.engine.clickNext(); // This click submits the form on the last step
        }

        // ==========================
        // Final Step
        // ==========================
        if (i === steps.length - 1) {

          // Verify successful submission
          await this.engine.verifySuccess();

          // Get captured request & response using the instance we started earlier
          const request = await apiCaptureInstance.requestPromise;
          const response = await apiCaptureInstance.responsePromise;

          // Request payload
          const payload = await ApiCapture.getRequestPayload(request);
          const responseBody = await ApiCapture.getResponseBody(response);

          const expectedPayload = PayloadMapper.map(
              this.engine.getEnteredValues()
          );

          // PayloadValidator.validate(
          //     payload,
          //     expectedPayload
          // );

          await AllureHelper.attachJson(
              'Expected Payload',
              expectedPayload
          );

          await AllureHelper.attachJson(
              'API Request',
              payload
          );

          await AllureHelper.attachJson(
              'API Response',
              responseBody
          );

          console.log('\n============== API REQUEST ==============');
          console.log(JSON.stringify(payload, null, 2));

          console.log('\n============== API RESPONSE ==============');
          console.log(JSON.stringify(responseBody, null, 2));

          console.log('=========================================\n');

          await AllureHelper.success();

          ReportManager.pass(
            formKey,
            form.group,
            formName,
            mode
          );
        }
      }

      Logger.endForm();

    } catch (error) {

      const message =
        error instanceof Error
          ? error.message
          : String(error);

      await AllureHelper.failure(message);

      ReportManager.fail(
        formKey,
        form.group,
        formName,
        mode,
        message
      );

      throw error;
    }
  }
}