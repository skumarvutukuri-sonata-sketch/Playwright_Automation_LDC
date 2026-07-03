
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { generateFormattedReport } from './generateReport';

dotenv.config();

function hasRequiredEmailConfig() {
  const requiredEnvVars = ['SMTP_HOST', 'EMAIL_USER', 'EMAIL_PASS', 'EMAIL_TO'];
  return requiredEnvVars.every((name) => {
    const value = process.env[name];
    return typeof value === 'string' && value.trim().length > 0;
  });
}

function shouldSkipEmail() {
  if (process.env.CI || process.env.GITHUB_ACTIONS) {
    console.warn('⚠ Skipping email delivery in CI.');
    return true;
  }

  if (!hasRequiredEmailConfig()) {
    console.warn('⚠ Skipping email delivery because SMTP settings are incomplete.');
    return true;
  }

  return false;
}

export async function sendEmailWithReport() {
  if (shouldSkipEmail()) {
    return false;
  }

  const smtpPort = Number(process.env.SMTP_PORT) || 587;
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: smtpPort,
    secure: smtpPort === 465, // Use SSL for port 465 (Gmail), TLS for 587
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
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
    from: process.env.EMAIL_USER || 'automation@example.com',
    to: process.env.EMAIL_TO,
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
  if (shouldSkipEmail()) {
    return false;
  }

  const smtpPort = Number(process.env.SMTP_PORT) || 587;
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: smtpPort,
    secure: smtpPort === 465, // Use SSL for port 465 (Gmail), TLS for 587
    auth: { 
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
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

export async function runAutomation() {
  // ... your automation steps ...
  const success = true; // set based on actual result

  if (success) {
    await sendSuccessEmail();
  }
}
