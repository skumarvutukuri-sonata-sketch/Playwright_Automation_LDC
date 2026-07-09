
// import nodemailer from 'nodemailer';
// import dotenv from 'dotenv';
// import path from 'path';
// import fs from 'fs';
// import { generateFormattedReport } from './generateReport';

// dotenv.config();

// export async function sendEmailWithReport() {
//   const smtpPort = Number(process.env.SMTP_PORT) || 587;
//   const transporter = nodemailer.createTransport({
//     host: process.env.SMTP_HOST,
//     port: smtpPort,
//     secure: smtpPort === 465, // Use SSL for port 465 (Gmail), TLS for 587
//     auth: {
//       user: process.env.SMTP_USERNAME,
//       pass: process.env.SMTP_PASSWORD,
//     },
//   });

//   const playwrightReport = path.resolve('playwright-report', 'index.html');
//   const allureHtml = path.resolve('allure-report', 'index.html');
//   const allureZip = path.resolve('allure-report.zip');

//   const attachments: any[] = [];
//   // Gmail blocks ZIP files for security; include only HTML if available
//   if (fs.existsSync(allureHtml)) {
//     attachments.push({ filename: 'allure-report.html', path: allureHtml, contentType: 'text/html' });
//   } else if (fs.existsSync(playwrightReport)) {
//     attachments.push({ filename: 'Playwright-Report.html', path: playwrightReport, contentType: 'text/html' });
//   }

//   // Generate formatted report for email body
//   const { html: reportHtml } = generateFormattedReport();
  
//   // Add note about accessing full report
//   const emailBodyHtml = reportHtml + `
//     <hr style="border: 1px solid #bdc3c7; margin: 20px 0;">
//     <p style="font-size: 12px; color: #7f8c8d;">
//       <strong>Full Allure Report:</strong> The complete interactive Allure report is available at <code>./allure-report/</code>. 
//       Extract and open <code>index.html</code> in a web browser to view detailed test metrics, graphs, and trends.
//     </p>
//   `;

//   const mailOptions: any = {
//     from: process.env.SMTP_USERNAME || 'automation@example.com',
//     to: process.env.EMAIL_TO,
//     subject: '✅ Automation Test Execution Report',
//     html: emailBodyHtml,
//   };

//   if (attachments.length) mailOptions.attachments = attachments;

//   try {
//     const info = await transporter.sendMail(mailOptions);
//     console.log('✉ Email sent:', info.messageId || info.response || info);
//     return true;
//   } catch (err) {
//     console.error('❌ Failed to send email:', err);
//     return false;
//   }
// }
// // single exported runAutomation is defined below

// export async function sendSuccessEmail() {
//   const smtpPort = Number(process.env.SMTP_PORT) || 587;
//   const transporter = nodemailer.createTransport({
//     host: process.env.SMTP_HOST,
//     port: smtpPort,
//     secure: smtpPort === 465, // Use SSL for port 465 (Gmail), TLS for 587
//     auth: { 
//       user: process.env.SMTP_USERNAME,
//       pass: process.env.SMTP_PASSWORD,
//     },
//   });

//   const mailOptions = {
//     from: '"Automation" <automation@example.com>',
//     to: process.env.EMAIL_TO || 'team@example.com',
//     subject: 'Automation Success',
//     text: 'The automation script completed successfully.',
//     html: '<p>The automation script completed successfully.</p>',
//   };

//   try {
//     const info = await transporter.sendMail(mailOptions);
//     console.log('✉ Success email sent:', info.messageId || info.response || info);
//     return true;
//   } catch (err) {
//     console.error('❌ Failed to send success email:', err);
//     return false;
//   }
// }

// /**
//  * Send an email alert when form field changes are detected.
//  * Called automatically during test execution if any form structure changes are found.
//  */
// export async function sendFormChangeAlertEmail(
//   formId: string,
//   category: string,
//   changes: { fieldName: string; changeType: string; oldValue?: string; newValue?: string }[]
// ): Promise<boolean> {
//   const smtpPort = Number(process.env.SMTP_PORT) || 587;
//   const transporter = nodemailer.createTransport({
//     host: process.env.SMTP_HOST,
//     port: smtpPort,
//     secure: smtpPort === 465,
//     auth: {
//       user: process.env.SMTP_USERNAME,
//       pass: process.env.SMTP_PASSWORD,
//     },
//   });

//   const changeIcon: Record<string, string> = {
//     ADDED: '➕', REMOVED: '➖', MODIFIED: '🔄', MOVED: '🔀'
//   };
//   const changeColor: Record<string, string> = {
//     ADDED: '#16a34a', REMOVED: '#dc2626', MODIFIED: '#d97706', MOVED: '#7c3aed'
//   };

//   const changesRows = changes.map(c => `
//     <tr>
//       <td style="padding:8px 12px;border-bottom:1px solid #f1f5f9;">${changeIcon[c.changeType] ?? ''} ${c.changeType}</td>
//       <td style="padding:8px 12px;border-bottom:1px solid #f1f5f9;font-weight:600;color:${changeColor[c.changeType] ?? '#374151'};">${c.fieldName}</td>
//       <td style="padding:8px 12px;border-bottom:1px solid #f1f5f9;color:#6b7280;">${c.oldValue ?? '-'}</td>
//       <td style="padding:8px 12px;border-bottom:1px solid #f1f5f9;color:#6b7280;">${c.newValue ?? '-'}</td>
//     </tr>`).join('');

//   const html = `
//     <div style="font-family:sans-serif;max-width:640px;margin:auto;">
//       <div style="background:#7f1d1d;color:white;padding:20px 24px;border-radius:8px 8px 0 0;">
//         <h2 style="margin:0;font-size:20px;">🚨 Form Structure Change Alert</h2>
//         <p style="margin:6px 0 0;font-size:13px;opacity:0.85;">Detected during automated test run</p>
//       </div>
//       <div style="background:#fff8f8;border:1px solid #fecaca;border-top:none;padding:20px 24px;border-radius:0 0 8px 8px;">
//         <p style="margin:0 0 16px;font-size:15px;">
//           Form <strong>${formId}</strong> (category: <strong>${category}</strong>) has <strong>${changes.length}</strong> field change(s) compared to the saved baseline.
//         </p>
//         <table style="width:100%;border-collapse:collapse;font-size:13px;background:white;border-radius:6px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,.1);">
//           <thead>
//             <tr style="background:#1e293b;color:white;">
//               <th style="padding:10px 12px;text-align:left;">Change</th>
//               <th style="padding:10px 12px;text-align:left;">Field Name</th>
//               <th style="padding:10px 12px;text-align:left;">Old Value</th>
//               <th style="padding:10px 12px;text-align:left;">New Value</th>
//             </tr>
//           </thead>
//           <tbody>${changesRows}</tbody>
//         </table>
//         <p style="margin:16px 0 0;font-size:12px;color:#9ca3af;">
//           If this change was intentional, delete <code>utils/form-snapshots/${category.replace(/\s+/g,'_')}_baseline.json</code> entry for form ${formId} and re-run the test to update the baseline.<br>
//           If accidental, please restore the form to its original structure.
//         </p>
//       </div>
//     </div>`;

//   try {
//     await transporter.sendMail({
//       from: process.env.SMTP_USERNAME || 'automation@example.com',
//       to: process.env.EMAIL_TO,
//       subject: `🚨 Form Change Alert: Form ${formId} (${category}) — ${changes.length} change(s) detected`,
//       html,
//     });
//     console.log(`  📧 Form change alert email sent for ${formId}`);
//     return true;
//   } catch (err) {
//     console.error(`  ❌ Failed to send form change alert email:`, err);
//     return false;
//   }
// }

// export async function runAutomation() {
//   // ... your automation steps ...
//   const success = true; // set based on actual result

//   if (success) {
//     await sendSuccessEmail();
//   }
// }



import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { generateFormattedReport } from './generateReport';

dotenv.config();

export async function sendEmailWithReport() {
  const smtpPort = Number(process.env.SMTP_PORT) || 587;
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: smtpPort,
    secure: smtpPort === 465, // Use SSL for port 465 (Gmail), TLS for 587
    auth: {
      user: process.env.SMTP_USERNAME,
      pass: process.env.SMTP_PASSWORD,
    },
  });

  const playwrightReport = path.resolve('playwright-report', 'index.html');
  const allureHtml = path.resolve('allure-report', 'index.html');
  const allureZip = path.resolve('allure-report.zip');

  const attachments: any[] = [];
  // Gmail blocks ZIP files for security; include only HTML if available
  if (fs.existsSync(allureHtml)) {
    attachments.push({ filename: 'allure-report.html', path: allureHtml, contentType: 'text/html' });
  } else if (fs.existsSync(playwrightReport)) {
    attachments.push({ filename: 'Playwright-Report.html', path: playwrightReport, contentType: 'text/html' });
  }

  // Generate formatted report for email body
  const { html: reportHtml } = generateFormattedReport();
  
  // Add note about accessing full report
  const emailBodyHtml = reportHtml + `
    <hr style="border: 1px solid #bdc3c7; margin: 20px 0;">
    <p style="font-size: 12px; color: #7f8c8d;">
      <strong>Full Allure Report:</strong> The complete interactive Allure report is available at <code>./allure-report/</code>. 
      Extract and open <code>index.html</code> in a web browser to view detailed test metrics, graphs, and trends.
    </p>
  `;

  const mailOptions: any = {
    from: process.env.SMTP_USERNAME || 'automation@example.com',
    to: process.env.EMAIL_TO || 'automation-alerts@example.com', // 🚀 Added Fallback
    subject: '✅ Automation Test Execution Report',
    html: emailBodyHtml,
  };

  if (attachments.length) mailOptions.attachments = attachments;

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('✉ Email sent:', info.messageId || info.response || info);
    return true;
  } catch (err) {
    console.error('❌ Failed to send email:', err);
    return false;
  }
}
// single exported runAutomation is defined below

export async function sendSuccessEmail() {
  const smtpPort = Number(process.env.SMTP_PORT) || 587;
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: smtpPort,
    secure: smtpPort === 465, // Use SSL for port 465 (Gmail), TLS for 587
    auth: { 
      user: process.env.SMTP_USERNAME,
      pass: process.env.SMTP_PASSWORD,
    },
  });

  const mailOptions = {
    from: '"Automation" <automation@example.com>',
    to: process.env.EMAIL_TO || 'team@example.com',
    subject: 'Automation Success',
    text: 'The automation script completed successfully.',
    html: '<p>The automation script completed successfully.</p>',
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('✉ Success email sent:', info.messageId || info.response || info);
    return true;
  } catch (err) {
    console.error('❌ Failed to send success email:', err);
    return false;
  }
}

/**
 * Send an email alert when form field changes are detected.
 * Called automatically during test execution if any form structure changes are found.
 */
export async function sendFormChangeAlertEmail(
  formId: string,
  category: string,
  changes: { fieldName: string; changeType: string; oldValue?: string; newValue?: string }[]
): Promise<boolean> {
  const smtpPort = Number(process.env.SMTP_PORT) || 587;
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: smtpPort,
    secure: smtpPort === 465,
    auth: {
      user: process.env.SMTP_USERNAME,
      pass: process.env.SMTP_PASSWORD,
    },
  });

  const changeIcon: Record<string, string> = {
    ADDED: '➕', REMOVED: '➖', MODIFIED: '🔄', MOVED: '🔀'
  };
  const changeColor: Record<string, string> = {
    ADDED: '#16a34a', REMOVED: '#dc2626', MODIFIED: '#d97706', MOVED: '#7c3aed'
  };

  const changesRows = changes.map(c => `
    <tr>
      <td style="padding:8px 12px;border-bottom:1px solid #f1f5f9;">${changeIcon[c.changeType] ?? ''} ${c.changeType}</td>
      <td style="padding:8px 12px;border-bottom:1px solid #f1f5f9;font-weight:600;color:${changeColor[c.changeType] ?? '#374151'};">${c.fieldName}</td>
      <td style="padding:8px 12px;border-bottom:1px solid #f1f5f9;color:#6b7280;">${c.oldValue ?? '-'}</td>
      <td style="padding:8px 12px;border-bottom:1px solid #f1f5f9;color:#6b7280;">${c.newValue ?? '-'}</td>
    </tr>`).join('');

  const html = `
    <div style="font-family:sans-serif;max-width:640px;margin:auto;">
      <div style="background:#7f1d1d;color:white;padding:20px 24px;border-radius:8px 8px 0 0;">
        <h2 style="margin:0;font-size:20px;">🚨 Form Structure Change Alert</h2>
        <p style="margin:6px 0 0;font-size:13px;opacity:0.85;">Detected during automated test run</p>
      </div>
      <div style="background:#fff8f8;border:1px solid #fecaca;border-top:none;padding:20px 24px;border-radius:0 0 8px 8px;">
        <p style="margin:0 0 16px;font-size:15px;">
          Form <strong>${formId}</strong> (category: <strong>${category}</strong>) has <strong>${changes.length}</strong> field change(s) compared to the saved baseline.
        </p>
        <table style="width:100%;border-collapse:collapse;font-size:13px;background:white;border-radius:6px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,.1);">
          <thead>
            <tr style="background:#1e293b;color:white;">
              <th style="padding:10px 12px;text-align:left;">Change</th>
              <th style="padding:10px 12px;text-align:left;">Field Name</th>
              <th style="padding:10px 12px;text-align:left;">Old Value</th>
              <th style="padding:10px 12px;text-align:left;">New Value</th>
            </tr>
          </thead>
          <tbody>${changesRows}</tbody>
        </table>
        <p style="margin:16px 0 0;font-size:12px;color:#9ca3af;">
          If this change was intentional, run your test with <code>UPDATE_BASELINES=true</code> to update the baseline.<br>
          If accidental, please notify the team to restore the form to its original structure.
        </p>
      </div>
    </div>`;

  try {
    await transporter.sendMail({
      from: process.env.SMTP_USERNAME || 'automation@example.com',
      to: process.env.EMAIL_TO || 'automation-alerts@example.com', // 🚀 Added Fallback
      subject: `🚨 Form Change Alert: Form ${formId} (${category}) — ${changes.length} change(s) detected`,
      html,
    });
    console.log(`  📧 Form change alert email sent for ${formId}`);
    return true;
  } catch (err) {
    console.error(`  ❌ Failed to send form change alert email:`, err);
    return false;
  }
}

export async function runAutomation() {
  // ... your automation steps ...
  const success = true; // set based on actual result

  if (success) {
    await sendSuccessEmail();
  }
}