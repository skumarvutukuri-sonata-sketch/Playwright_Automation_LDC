
import { execSync } from 'child_process';
import { sendEmailWithReport } from './utils/sendEmail';
import fs from 'fs';


async function globalTeardown() {
  console.log("✅ Teardown started");

  const results = JSON.parse(
    require('fs').readFileSync('test-results.json', 'utf-8')
  );

  const stats = results?.stats ?? {};
  console.log("📊 Results:", stats);

  const failedCount = Number(stats.failed ?? stats.unexpected ?? 0);
  if (failedCount === 0) {
    console.log("✅ Tests passed. Generating Allure report...");
    try {
      execSync('npx allure generate ./allure-results --clean -o ./allure-report', { stdio: 'inherit' });
      console.log('✅ Allure report generated successfully');
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : String(err);
      console.error('❌ Failed to generate Allure report:', errMsg);
      return;
    }

    console.log("✅ Sending email...");
    try {
      const sent = await sendEmailWithReport();
      if (sent) console.log('✅ Report email sent');
      else console.warn('⚠ Report email not sent (check SMTP/config)');
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : String(err);
      console.error('❌ Error while sending report email:', errMsg);
    }
  } else {
    console.log(`❌ Email skipped because ${failedCount} test(s) failed.`);
    console.log('   Re-run after fixing failures to trigger the email alert.');
  }
}




export default globalTeardown;
