import { ReportManager } from './utils/reporting/ReportManager';
import { EnvironmentHelper } from './utils/reporting/EnvironmentHelper';
import { AllureReportGenerator } from './utils/reporting/AllureReportGenerator';
import { EmailReporter } from './utils/reporting/EmailReporter';
import * as fs from 'fs';


async function globalTeardown(): Promise<void> {

  console.log('\n========================================');
  console.log('Generating Automation Reports...');
  console.log('========================================\n');

  // Generate environment.properties
  try {
    EnvironmentHelper.generate();
    console.log('✓ Environment generated');
  } catch (error) {
    console.error('Environment generation failed:', error);
  }

  // Generate CSV
  try {
    ReportManager.finish();
    console.log('✓ Result Matrix generated');
  } catch (error) {
    console.error('Result Matrix generation failed:', error);
  }

  // Generate Allure HTML Report
  try {
    await AllureReportGenerator.generate();
    console.log('✓ Allure Report generated');
  } catch (error) {
    console.error('Allure Report generation failed:', error);
  }

  // Send Email
  try {
    fs.writeFileSync(
    'reports/end-time.txt',
      new Date().toISOString()
    );
    await EmailReporter.send();
    console.log('✓ Email sent');
  } catch (error) {
    console.error('Email sending failed:', error);
  }

  console.log('\n========================================');
  console.log('Automation Execution Completed');
  console.log('========================================\n');
}

export default globalTeardown;