
// import { execSync } from 'child_process';
// import { zipAllureReport } from './utils/zipReport';
// import { sendEmailWithReport  } from './utils/sendEmail';
// import { DashboardGenerator } from './utils/DashboardGenerator';

// async function runFlow() {
//   try {
//     console.log("▶ Running Playwright tests...");
//     let testsPassed = true;

//     try {
//       execSync('npx playwright test', { stdio: 'inherit' });
//     } catch (testErr: unknown) {
//       testsPassed = false;
//       const errMsg = testErr instanceof Error ? testErr.message : String(testErr);
//       console.log(`⚠ Tests failed or exited with errors: ${errMsg}`);
//     }

//     // 🚀 GENERATE DASHBOARD DATA REGARDLESS OF TEST RESULT
//     console.log("📊 Generating Dashboard data from test results...");
//     try {
//       DashboardGenerator.generate();
//       console.log('✅ Dashboard data generated successfully');
//     } catch (dashErr: unknown) {
//       const errMsg = dashErr instanceof Error ? dashErr.message : String(dashErr);
//       console.error('❌ Failed to generate dashboard:', errMsg);
//     }

//     if (!testsPassed) {
//       console.log('⚠️ Tests did not pass, but dashboard has been updated. Generating reports anyway...');
//     }

//     console.log("📊 Generating Allure report...");
//     try {
//       execSync('npx allure generate ./allure-results --clean -o ./allure-report', { stdio: 'inherit' });
//     } catch (zipErr: unknown) {
//       const errMsg = zipErr instanceof Error ? zipErr.message : String(zipErr);
//       console.error('❌ Failed to generate Allure report:', errMsg);
//       return;
//     }

//     console.log("📦 Zipping report...");
//     try {
//       await zipAllureReport();
//     } catch (zipErr: unknown) {
//       const errMsg = zipErr instanceof Error ? zipErr.message : String(zipErr);
//       console.error('❌ Failed to zip report:', errMsg);
//     }

//     console.log("✉ Sending email with dashboard data...");
//     try {
//       const sent = await sendEmailWithReport();
//       if (sent) console.log('✅ Email sent successfully with dashboard data');
//       else console.warn('⚠ Email was not sent (check SMTP config)');
//     } catch (emailErr: unknown) {
//       const errMsg = emailErr instanceof Error ? emailErr.message : String(emailErr);
//       console.error('❌ sendEmailWithReport threw an error:', errMsg);
//     }

//     console.log("✅ Post-execution completed");
//   } catch (error) {
//     console.error("❌ Error:", error);
//   }
// }

// runFlow();


import { execSync } from 'child_process';
import { zipAllureReport } from './utils/zipReport';
import { sendEmailWithReport, sendConsolidatedFormChangeEmail } from './utils/sendEmail'; // 🚀 Added new import here
import { DashboardGenerator } from './utils/DashboardGenerator';

async function runFlow() {
  try {
    console.log("▶ Running Playwright tests...");
    let testsPassed = true;

    try {
      execSync('npx playwright test', { stdio: 'inherit' });
    } catch (testErr: unknown) {
      testsPassed = false;
      const errMsg = testErr instanceof Error ? testErr.message : String(testErr);
      console.log(`⚠ Tests failed or exited with errors: ${errMsg}`);
    }

    // 🚀 GENERATE DASHBOARD DATA REGARDLESS OF TEST RESULT
    console.log("📊 Generating Dashboard data from test results...");
    try {
      DashboardGenerator.generate();
      console.log('✅ Dashboard data generated successfully');
    } catch (dashErr: unknown) {
      const errMsg = dashErr instanceof Error ? dashErr.message : String(dashErr);
      console.error('❌ Failed to generate dashboard:', errMsg);
    }

    if (!testsPassed) {
      console.log('⚠️ Tests did not pass, but dashboard has been updated. Generating reports anyway...');
    }

    console.log("📊 Generating Allure report...");
    try {
      execSync('npx allure generate ./allure-results --clean -o ./allure-report', { stdio: 'inherit' });
    } catch (zipErr: unknown) {
      const errMsg = zipErr instanceof Error ? zipErr.message : String(zipErr);
      console.error('❌ Failed to generate Allure report:', errMsg);
      return;
    }

    console.log("📦 Zipping report...");
    try {
      await zipAllureReport();
    } catch (zipErr: unknown) {
      const errMsg = zipErr instanceof Error ? zipErr.message : String(zipErr);
      console.error('❌ Failed to zip report:', errMsg);
    }

    console.log("✉ Sending emails...");
    try {
      // 1. Send the main execution report
      const sent = await sendEmailWithReport();
      if (sent) console.log('✅ Main report email sent successfully');
      else console.warn('⚠ Main report email was not sent (check SMTP config)');

      // 2. 🚀 TRIGGER THE CONSOLIDATED FORM ALERTS
      console.log("🔍 Checking for structural form changes...");
      const changesSent = await sendConsolidatedFormChangeEmail();
      if (changesSent) {
          console.log('✅ Consolidated form change alert email sent successfully');
      } else {
          console.log('ℹ️ No form changes detected during this run (or email failed).');
      }

    } catch (emailErr: unknown) {
      const errMsg = emailErr instanceof Error ? emailErr.message : String(emailErr);
      console.error('❌ Email sender threw an error:', errMsg);
    }

    console.log("✅ Post-execution completed");
  } catch (error) {
    console.error("❌ Error:", error);
  }
}

runFlow();