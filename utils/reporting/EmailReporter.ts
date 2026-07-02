import nodemailer from 'nodemailer';
import * as fs from 'fs';
import * as path from 'path';
import Papa from 'papaparse';

import { MailConfig } from './MailConfig';
import { EmailTemplate } from './EmailTemplate';

export class EmailReporter {

  static async send(): Promise<void> {
    const config = MailConfig.get();
    const reportDir = path.join(process.cwd(), 'reports');
    const csvPath = path.join(reportDir, 'result-matrix.csv');
    const summaryPath = path.join(reportDir, 'execution-summary.json');

    let total = 0;
    let passed = 0;
    let failed = 0;
    let records: any[] = [];

    if (fs.existsSync(csvPath)) {
      const fileContent = fs.readFileSync(csvPath, 'utf8');
      const parsed = Papa.parse(fileContent, { header: true, skipEmptyLines: true });
      records = parsed.data;

      for (const row of records) {
        // Evaluate unified Happy Path statuses
        if (row.Happy_Status && row.Happy_Status !== '—') {
          total++;
          if (String(row.Happy_Status).toUpperCase() === 'PASSED') passed++;
          if (String(row.Happy_Status).toUpperCase() === 'FAILED') failed++;
        }
        // Evaluate unified Validation Path statuses
        if (row.Val_Status && row.Val_Status !== '—') {
          total++;
          if (String(row.Val_Status).toUpperCase() === 'PASSED') passed++;
          if (String(row.Val_Status).toUpperCase() === 'FAILED') failed++;
        }
      }
    }

    const startedAt = new Date(fs.readFileSync('reports/start-time.txt', 'utf8'));
    const finishedAt = new Date(fs.readFileSync('reports/end-time.txt', 'utf8'));

    const summary = {
      total,
      passed,
      failed,
      startedAt: startedAt.getTime(),
      finishedAt: finishedAt.getTime(),
      totalDuration: finishedAt.getTime() - startedAt.getTime()
    };

    const transporter = nodemailer.createTransport({
      host: config.host,
      port: config.port,
      secure: config.secure,
      auth: { user: config.username, pass: config.password }
    });

    const attachments = [];
    if (fs.existsSync(csvPath)) {
      attachments.push({ filename: 'ResultMatrix.csv', path: csvPath });
    }
    if (fs.existsSync(summaryPath)) {
      attachments.push({ filename: 'ExecutionSummary.json', path: summaryPath });
    }

    await transporter.sendMail({
      from: config.from,
      to: config.to.join(','),
      cc: config.cc?.join(','),
      bcc: config.bcc?.join(','),
      subject: `${config.subjectPrefix} Automation Execution Report`,
      html: EmailTemplate.build(summary, records),
      attachments
    });

    console.log('📧 Email Sent Successfully');
  }
}