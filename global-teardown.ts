// import { ReportManager } from './utils/reporting/ReportManager';
// import { EnvironmentHelper } from './utils/reporting/EnvironmentHelper';
// import { AllureReportGenerator } from './utils/reporting/AllureReportGenerator';
// import { EmailReporter } from './utils/reporting/EmailReporter';
// import { sendEmailWithReport, sendConsolidatedFormChangeEmail } from './utils/sendEmail'; // or whatever the path is
// import * as fs from 'fs';


// async function globalTeardown(): Promise<void> {

//   console.log('\n========================================');
//   console.log('Generating Automation Reports...');
//   console.log('========================================\n');

//   // Generate environment.properties
//   try {
//     EnvironmentHelper.generate();
//     console.log('✓ Environment generated');
//   } catch (error) {
//     console.error('Environment generation failed:', error);
//   }

//   // Generate CSV
//   try {
//     ReportManager.finish();
//     console.log('✓ Result Matrix generated');
//   } catch (error) {
//     console.error('Result Matrix generation failed:', error);
//   }

//   // Generate Allure HTML Report
//   try {
//     await AllureReportGenerator.generate();
//     console.log('✓ Allure Report generated');
//   } catch (error) {
//     console.error('Allure Report generation failed:', error);
//   }

//   // Send Email
//   try {
//     fs.writeFileSync(
//     'reports/end-time.txt',
//       new Date().toISOString()
//     );
//     await EmailReporter.send();
//     console.log('✓ Email sent');
//   } catch (error) {
//     console.error('Email sending failed:', error);
//   }

//   console.log('\n========================================');
//   console.log('Automation Execution Completed');
//   console.log('========================================\n');
// }

// export default globalTeardown;


import { ReportManager } from './utils/reporting/ReportManager';
import { EnvironmentHelper } from './utils/reporting/EnvironmentHelper';
import { AllureReportGenerator } from './utils/reporting/AllureReportGenerator';
import { EmailReporter } from './utils/reporting/EmailReporter';
import { sendConsolidatedFormChangeEmail } from './utils/sendEmail'; // 🚀 Added our new function here
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

  // Send Emails
  try {
    fs.writeFileSync(
      'reports/end-time.txt',
      new Date().toISOString()
    );
    
    // 1. Send the main execution report
    await EmailReporter.send();
    console.log('✓ Email sent');

    // 2. 🚀 THE FIX: Send the consolidated form changes!
    console.log('🔍 Checking for structural form changes...');
    const changesSent = await sendConsolidatedFormChangeEmail();
    if (changesSent) {
        console.log('✅ Consolidated form change alert email sent successfully');
    } else {
        console.log('ℹ️ No form changes detected during this run (or email failed).');
    }

  } catch (error) {
    console.error('Email sending failed:', error);
  }

  console.log('\n========================================');
  console.log('Automation Execution Completed');
  console.log('========================================\n');
}

export default globalTeardown;