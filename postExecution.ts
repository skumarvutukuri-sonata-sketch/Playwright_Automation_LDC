
import { execSync } from 'child_process';
import { zipAllureReport } from './utils/zipReport';
import { sendEmailWithReport  } from './utils/sendEmail';

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

    if (!testsPassed) {
      console.log('❌ Skipping Allure report generation and email because tests did not pass.');
      return;
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

    console.log("✉ Sending email...");
    try {
      const sent = await sendEmailWithReport();
      if (sent) console.log('✅ Email sent successfully');
      else console.warn('⚠ Email was not sent (check SMTP config or test status)');
    } catch (emailErr: unknown) {
      const errMsg = emailErr instanceof Error ? emailErr.message : String(emailErr);
      console.error('❌ sendEmailWithReport threw an error:', errMsg);
    }

    console.log("✅ Post-execution completed");
  } catch (error) {
    console.error("❌ Error:", error);
  }
}

runFlow();
