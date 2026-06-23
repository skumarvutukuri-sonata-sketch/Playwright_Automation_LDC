// // import { FormEngine } from './formEngine';

// // export class FormRunner {

// //   constructor(private form: FormEngine) {}

// //   async run(data: any, formName: string, mode: 'happy' | 'error') {

// //     const form = data.forms[formName];
// //     const defaults = data.defaults;

// //     let stepIndex = 0;
// //     const isError = mode === 'error';

// //     // ✅ STEP LOOP
// //     for (const step of form.steps) {

// //       const fields = step.map((f: any) =>
// //         typeof f === 'string'
// //           ? { label: f, type: 'dropdown' }
// //           : { type: f.type || 'text', ...f }
// //       );

// //       await this.form.waitForField(fields[0].label);

// //       const hasDropdown = fields.some(f => f.type === 'dropdown');

// //       // ✅ ERROR FLOW
// //       if (isError) {

// //         await this.form.next();
// //         await this.form.waitForError();

// //         if (hasDropdown) {
// //           await this.form.fillAllDropdownsInStep();
// //         }

// //         for (const f of fields) {
// //           if (f.type !== 'dropdown') {
// //             await this.handleField(f, defaults, false);
// //           }
// //         }

// //         await this.form.next();

// //       } else {
// //         // ✅ HAPPY FLOW

// //         if (hasDropdown) {

// //           let dropdownIndex = 0;

// //           for (const f of fields) {

// //             if (f.type === 'dropdown') {
// //               await this.form.validateAllOptionsByIndex(dropdownIndex);
// //               await this.form.selectFinalDropdownValueByIndex(dropdownIndex);
// //               dropdownIndex++;
// //             }
// //           }
// //         }

// //         for (const f of fields) {
// //           if (f.type !== 'dropdown') {
// //             await this.handleField(f, defaults, false);
// //           }
// //         }

// //         await this.form.next();
// //       }

// //       await this.form.waitForNextStepNumber(stepIndex);
// //       stepIndex++;
// //     }

// //     // ✅ ✅ ✅ FINAL STEP (IMPORTANT FIXED FLOW)
// //     if (form.finalStep) {

// //       const fields = form.finalStep.map((f: any) => ({
// //         type: f.type || 'text',
// //         ...f
// //       }));

// //       await this.form.waitForNextStepNumber(stepIndex - 1);
// //       await this.form.waitForField(fields[0].label);

// //       // ✅ STEP 1: trigger validation FIRST
// //       await this.form.submit();
// //       await this.form.waitForError();

// //       // ✅ ✅ STEP 2: HANDLE DROPDOWN FIRST (STATE ✅)
// //       let dropdownIndex = 0;

// //       for (const f of fields) {

// //         if (f.type === 'dropdown') {

// //           await this.form.validateAllOptionsByIndex(dropdownIndex);
// //           await this.form.selectFinalDropdownValueByIndex(dropdownIndex);

// //           dropdownIndex++;
// //         }
// //       }

// //       // ✅ ✅ STEP 3: HANDLE TEXT FIELDS (Zip, Phone ✅)
// //       for (const f of fields) {

// //         if (f.type !== 'dropdown' && f.type !== 'checkbox') {
// //           await this.handleField(f, defaults, true);
// //         }
// //       }

// //       // ✅ ✅ STEP 4: HANDLE CHECKBOX
// //       // ✅ ✅ STEP 4: HANDLE CHECKBOX FIRST
// //         for (const f of fields) {

// //         if (f.type === 'checkbox') {
// //             await this.form.check(f.label);
// //         }
// //         }

// //         // ✅ ✅ GIVE UI TIME TO REGISTER CHECKBOX ✅
// //         await this.form.waitForTimeout();

// //         // ✅ ✅ FINAL SUBMIT
// //         if (form.submit) {

// //         // ✅ WAIT instead of clicking again
// //         await this.form.waitForTimeout();

// //         // ✅ directly verify success
// //         await this.form.verifySuccess();
// //         }
// //   }
// //   }

// //   // ✅ FIELD HANDLER
// //   async handleField(field: any, defaults: any, isFinal: boolean) {

// //     const { label, validateRequired, validateInvalid, invalid } = field;

// //     // ✅ REQUIRED
// //     if (validateRequired) {
// //       await this.form.fill(label, defaults[label]);
// //       return;
// //     }

// //     // ✅ INVALID FLOW
// //     if (validateInvalid) {

// //       const values = Array.isArray(invalid) ? invalid : [invalid];

// //       for (const v of values) {

// //         await this.form.fill(label, v);

// //         if (isFinal) {
// //           await this.form.submit();
// //         } else {
// //           await this.form.next();
// //         }

// //         await this.form.waitForError();
// //       }

// //       // ✅ FIX VALUE
// //       await this.form.fill(label, this.getValue(defaults[label]));

// //       // ✅ RE-VALIDATE
// //       if (isFinal) {
// //         await this.form.submit();
// //       } else {
// //         await this.form.next();
// //       }

// //       return;
// //     }

// //     // ✅ NORMAL FILL
// //     await this.form.fill(label, this.getValue(defaults[label]));
// //   }

// //   getValue(val: string) {
// //     return val === 'dynamicEmail'
// //       ? `test${Date.now()}@mail.com`
// //       : val;
// //   }
// // }

// import { FormEngine } from './formEngine';

// export class FormRunner {
//   constructor(private form: FormEngine) {}

//   async run(data: any, formName: string, mode: 'happy' | 'error') {
//     const form = data.forms[formName];
//     const defaults = data.defaults;

//     let stepIndex = 0;
//     const isError = mode === 'error';

//     // Multi-step pages
//     for (const step of form.steps) {
//       const fields = this.normalizeFields(step);

//       await this.form.waitForField(fields[0].label);

//       if (isError) {
//         await this.runErrorStep(fields, defaults);
//       } else {
//         await this.runHappyStep(fields, defaults);
//       }

//       await this.form.waitForNextStepNumber(stepIndex);
//       stepIndex++;
//     }

//     // Final page
//     if (form.finalStep) {
//       const fields = this.normalizeFields(form.finalStep);

//       await this.runFinalStep(fields, defaults, form.submit, stepIndex);
//     }
//   }

//   // ============================================================
//   // Happy Step
//   // ============================================================

//   private async runHappyStep(fields: any[], defaults: any) {
//     await this.handleDropdowns(fields);
//     await this.fillFields(fields, defaults, false);
//     await this.form.next();
//   }

//   // ============================================================
//   // Error Step
//   // ============================================================

//   private async runErrorStep(fields: any[], defaults: any) {
//     await this.form.next();
//     await this.form.waitForError();

//     if (fields.some(f => f.type === 'dropdown')) {
//       await this.form.fillAllDropdownsInStep();
//     }

//     await this.fillFields(fields, defaults, false);

//     await this.form.next();
//   }

//   // ============================================================
//   // Final Step
//   // ============================================================

//   private async runFinalStep(
//     fields: any[],
//     defaults: any,
//     shouldSubmit: boolean,
//     stepIndex: number
//   ) {
//     await this.form.waitForNextStepNumber(stepIndex - 1);
//     await this.form.waitForField(fields[0].label);

//     // Trigger validation
//     await this.form.submit();
//     await this.form.waitForError();

//     // Dropdowns
//     await this.handleDropdowns(fields);

//     // Text fields
//     await this.fillFields(fields, defaults, true);

//     // Checkboxes
//     await this.handleCheckboxes(fields);

//     await this.form.waitForTimeout();

//     if (shouldSubmit) {
//       await this.form.waitForTimeout();
//       await this.form.verifySuccess();
//     }
//   }

//   // ============================================================
//   // Common Helpers
//   // ============================================================

//   private normalizeFields(fields: any[]) {
//     return fields.map(field =>
//       typeof field === 'string'
//         ? { label: field, type: 'dropdown' }
//         : { type: field.type || 'text', ...field }
//     );
//   }

//   private async handleDropdowns(fields: any[]) {
//     let dropdownIndex = 0;

//     for (const field of fields) {
//       if (field.type !== 'dropdown') continue;

//       await this.form.validateAllOptionsByIndex(dropdownIndex);
//       await this.form.selectFinalDropdownValueByIndex(dropdownIndex);

//       dropdownIndex++;
//     }
//   }

//   private async fillFields(
//     fields: any[],
//     defaults: any,
//     isFinal: boolean
//   ) {
//     for (const field of fields) {
//       if (
//         field.type === 'dropdown' ||
//         field.type === 'checkbox'
//       ) {
//         continue;
//       }

//       await this.handleField(field, defaults, isFinal);
//     }
//   }

//   private async handleCheckboxes(fields: any[]) {
//     for (const field of fields) {
//       if (field.type === 'checkbox') {
//         await this.form.check(field.label);
//       }
//     }
//   }

//   // ============================================================
//   // Field Handler
//   // ============================================================

//   private async handleField(
//     field: any,
//     defaults: any,
//     isFinal: boolean
//   ) {
//     const {
//       label,
//       validateRequired,
//       validateInvalid,
//       invalid,
//     } = field;

//     // Required validation
//     if (validateRequired) {
//       await this.form.fill(label, defaults[label]);
//       return;
//     }

//     // Invalid validation
//     if (validateInvalid) {
//       const values = Array.isArray(invalid)
//         ? invalid
//         : [invalid];

//       for (const value of values) {
//         await this.form.fill(label, value);

//         await this.submitOrNext(isFinal);

//         await this.form.waitForError();
//       }

//       await this.form.fill(
//         label,
//         this.getValue(defaults[label])
//       );

//       await this.submitOrNext(isFinal);

//       return;
//     }

//     // Normal fill
//     await this.form.fill(
//       label,
//       this.getValue(defaults[label])
//     );
//   }

//   // ============================================================
//   // Utility
//   // ============================================================

//   private async submitOrNext(isFinal: boolean) {
//     if (isFinal) {
//       await this.form.submit();
//     } else {
//       await this.form.next();
//     }
//   }

//   private getValue(value: string) {
//     const dynamicValues: Record<string, () => string> = {
//       dynamicEmail: () =>
//         `test${Date.now()}@mail.com`,
//     };

//     return dynamicValues[value]
//       ? dynamicValues[value]()
//       : value;
//   }
// }





// import { FormEngine } from './FormEngine';
// import { Validator } from './Validator';
// import { DataProvider } from './DataProvider';
// import { RunMode } from './Types';

// export class FormRunner {

//     constructor(
//         private readonly engine: FormEngine,
//         private readonly validator: Validator
//     ) {}

//     async run(
//         data: any,
//         formName: string,
//         mode: RunMode
//     ) {

//         const form = data.forms[formName];

//         for (const step of form.steps) {

//             const fields = this.normalize(step);

//             await this.engine.waitForField(fields[0].label);

//             if (mode === "error") {

//                 await this.validator.validateRequired(fields);

//             }

//             await this.validator.fillFields(fields);

//             await this.engine.clickNextOrSubmit();

//         }

//         if (form.finalStep) {

//             const fields = this.normalize(form.finalStep);

//             await this.validator.validateFinal(fields);

//         }

//         await this.engine.verifySuccess();

//     }

//     private normalize(fields: any[]) {

//         return fields.map(field =>
//             typeof field === "string"
//                 ? {
//                     label: field,
//                     type: "dropdown"
//                   }
//                 : {
//                     type: "text",
//                     ...field
//                   }
//         );

//     }

// }


// ----------------------------------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------------------------------

// import { FrameLocator } from '@playwright/test';
// import { FormEngine, TestMode } from './FormEngine';
// import { Logger } from './Logger';
// import { FormDefinition } from './types';
// import { ReportManager } from '../utils/reporting/ReportManager';

// export class FormRunner {

//   private engine: FormEngine;

//   constructor(private frame: FrameLocator) {
//     this.engine = new FormEngine(frame);
//   }

//   /**
//    * Main runner
//    */
//   async run(formName: string, form: FormDefinition, mode: TestMode) {

//     Logger.startForm(formName, mode);
//     const formKey = `${formName}-${mode}-${Date.now()}`;
//     ReportManager.startForm(formKey);

//     const steps = form.steps;

//     for (let i = 0; i < steps.length; i++) {

//       const step = steps[i];
//       Logger.step(i + 1);

//       // ✅ VERY IMPORTANT: wait for step to load inside iframe
//     //   await this.frame.locator('body').first().waitFor();
//     //   await this.frame.locator('select, input, textarea').first().waitFor();
//     //   await this.frame.locator('select, input, textarea').first().waitFor({ state: 'visible' });
//     await this.frame.locator('body').first().waitFor();

//     // ✅ FIX → only wait for visible elements
//     await this.frame
//     .locator('select:visible, input:visible, textarea:visible')
//     .first()
//     .waitFor({ state: 'visible' });

//       // ✅ Small delay to stabilize dynamic UI (your site needs this)
//       await new Promise(res => setTimeout(res, 1200));

//       // ✅ VALIDATION MODE
//       if (mode === 'validation') {

//         Logger.validationStart();

//         // trigger validation
//         await this.engine.clickNext();

//         for (const field of step.fields) {
//           await this.engine.processField(field.label, mode);
//         }

//         await this.engine.clickNext();

//       } else {
//         // ✅ HAPPY MODE

//         for (const field of step.fields) {
//           await this.engine.processField(field.label, mode);
//         }

//         await this.engine.clickNext();
//       }

//       // ✅ FINAL STEP
//       if (i === steps.length - 1) {
//         await this.engine.verifySuccess();
//         ReportManager.pass(formKey,form.group,formName,mode);
//       }
//     }

//     Logger.endForm();
//   }
// }







// import { FrameLocator } from '@playwright/test';
// import { FormEngine, TestMode } from './FormEngine';
// import { Logger } from './Logger';
// import { FormDefinition } from './types';

// export class FormRunner {

//   private engine: FormEngine;

//   constructor(private frame: FrameLocator) {
//     this.engine = new FormEngine(frame);
//   }

//   /**
//    * Main runner
//    */
//   async run(formName: string, form: FormDefinition, mode: TestMode) {

//     Logger.startForm(formName, mode);

//     const steps = form.steps;

//     for (let i = 0; i < steps.length; i++) {

//       const step = steps[i];
//       Logger.step(i + 1);

//       // ✅ wait for step load
//       await this.frame.locator('body').first().waitFor();

//       await this.frame
//         .locator('select:visible, input:visible, textarea:visible')
//         .first()
//         .waitFor({ state: 'visible' });

//       await new Promise(res => setTimeout(res, 1200));

//       // ✅ ============================
//       // ✅ VALIDATION MODE
//       // ✅ ============================
//       if (mode === 'validation') {

//         Logger.validationStart();

//         // ✅ FINAL STEP (ONLY CHANGE ✅)
//         if (i === steps.length - 1) {

//           // ✅ 1. TRIGGER validation FIRST (EMPTY FORM)
//           await this.engine.clickNext();

//           // ✅ 2. NOW fill fields AFTER errors
//           for (const field of step.fields) {
//             await this.engine.processField(field.label, mode);
//           }

//           // ✅ 3. FINAL submit
//           await this.engine.clickNext();

//           await this.engine.verifySuccess();
//         }

//         // ✅ NORMAL STEPS (UNCHANGED ✅)
//         else {

//           // trigger validation
//           await this.engine.clickNext();

//           // fill fields
//           for (const field of step.fields) {
//             await this.engine.processField(field.label, mode);
//           }

//           // next step
//           await this.engine.clickNext();
//         }

//       }

//       // ✅ ============================
//       // ✅ HAPPY MODE (UNCHANGED ✅)
//       // ✅ ============================
//       else {

//         for (const field of step.fields) {
//           await this.engine.processField(field.label, mode);
//         }

//         await this.engine.clickNext();

//         if (i === steps.length - 1) {
//           await this.engine.verifySuccess();
//         }
//       }
//     }

//     Logger.endForm();
//   }
// }























// -------------------------------------------------------------------------------------------
// ------------------------------------------------------------------------------------------



// import { FrameLocator } from '@playwright/test';
// import { FormEngine, TestMode } from './FormEngine';
// import { Logger } from './Logger';
// import { FormDefinition } from './types';
// import { ReportManager } from '../utils/reporting/ReportManager';

// export class FormRunner {

//   private engine: FormEngine;

//   constructor(private frame: FrameLocator) {
//     this.engine = new FormEngine(frame);
//   }

//   /**
//    * Main runner
//    */
//   async run(formName: string, form: FormDefinition, mode: TestMode) {

//     Logger.startForm(formName, mode);

//     const formKey = `${formName}-${mode}-${Date.now()}`;

//     ReportManager.startForm(formKey);

//     try {

//       const steps = form.steps;

//       for (let i = 0; i < steps.length; i++) {

//         const step = steps[i];

//         Logger.step(i + 1);

//         // ✅ Wait for step to load inside iframe
//         await this.frame.locator('body').first().waitFor();

//         await this.frame
//           .locator('select:visible, input:visible, textarea:visible')
//           .first()
//           .waitFor({ state: 'visible' });

//         // ✅ Small delay to stabilize dynamic UI
//         await new Promise(res => setTimeout(res, 1200));

//         // ✅ VALIDATION MODE
//         if (mode === 'validation') {

//           Logger.validationStart();

//           // Trigger validation
//           await this.engine.clickNext();

//           for (const field of step.fields) {
//             await this.engine.processField(field.label, mode);
//           }

//           await this.engine.clickNext();

//         } else {

//           // ✅ HAPPY MODE
//           for (const field of step.fields) {
//             await this.engine.processField(field.label, mode);
//           }

//           await this.engine.clickNext();
//         }

//         // ✅ FINAL STEP
//         if (i === steps.length - 1) {

//           await this.engine.verifySuccess();

//           ReportManager.pass(
//             formKey,
//             form.group,
//             formName,
//             mode
//           );
//         }
//       }

//     } catch (error) {

//       ReportManager.fail(
//         formKey,
//         form.group,
//         formName,
//         mode,
//         error instanceof Error ? error.message : String(error)
//       );

//       throw error;

//     } finally {

//       Logger.endForm();

//     }
//   }
// }




// -----------------------------------------------------------------------------------------------------------
// ------------------------------------------------------------------------------------------------------------




import { FrameLocator } from '@playwright/test';
import { FormEngine, TestMode } from './FormEngine';
import { Logger } from './Logger';
import { FormDefinition } from './types';
import { ReportManager } from '../utils/reporting/ReportManager';
import { AllureHelper } from '../utils/reporting/AllureHelper';

export class FormRunner {

  private engine: FormEngine;

  constructor(private frame: FrameLocator) {
    this.engine = new FormEngine(frame);
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

          await this.engine.clickNext();

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

          await this.engine.clickNext();
        }

        // ==========================
        // Final Step
        // ==========================
        if (i === steps.length - 1) {

          await this.engine.verifySuccess();

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