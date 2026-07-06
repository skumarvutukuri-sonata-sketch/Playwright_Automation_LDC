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
    let totalTestCases = 0;
    let passedTestCases = 0;
    let failedTestCases = 0;
    let formsTested = 0;
    let records: any[] = [];
    const uniqueForms = new Set<string>();

    if (fs.existsSync(csvPath)) {
      const fileContent = fs.readFileSync(csvPath, 'utf8');
      const parsed = Papa.parse(fileContent, { header: true, skipEmptyLines: true });
      records = parsed.data;

      for (const row of records) {
        // Track unique forms tested (both positive and negative paths)
        if ((row.Positive_Status && row.Positive_Status !== '—') || (row.Negative_Status && row.Negative_Status !== '—')) {
          uniqueForms.add(row.Form);
        }

        // Evaluate unified Positive Path statuses
        if (row.Positive_Status && row.Positive_Status !== '—') {
          total++;
          if (String(row.Positive_Status).toUpperCase() === 'PASSED') passed++;
          if (String(row.Positive_Status).toUpperCase() === 'FAILED') failed++;
        }
        // Evaluate unified Negative Path statuses
        if (row.Negative_Status && row.Negative_Status !== '—') {
          total++;
          if (String(row.Negative_Status).toUpperCase() === 'PASSED') passed++;
          if (String(row.Negative_Status).toUpperCase() === 'FAILED') failed++;
        }

        const positiveTcTotal = Number(row.Positive_TC_Total || 0);
        const positiveTcPassed = Number(row.Positive_TC_Passed || 0);
        const positiveTcFailed = Number(row.Positive_TC_Failed || 0);

        const negativeTcTotal = Number(row.Negative_TC_Total || 0);
        const negativeTcPassed = Number(row.Negative_TC_Passed || 0);
        const negativeTcFailed = Number(row.Negative_TC_Failed || 0);

        totalTestCases += (Number.isFinite(positiveTcTotal) ? positiveTcTotal : 0) + (Number.isFinite(negativeTcTotal) ? negativeTcTotal : 0);
        passedTestCases += (Number.isFinite(positiveTcPassed) ? positiveTcPassed : 0) + (Number.isFinite(negativeTcPassed) ? negativeTcPassed : 0);
        failedTestCases += (Number.isFinite(positiveTcFailed) ? positiveTcFailed : 0) + (Number.isFinite(negativeTcFailed) ? negativeTcFailed : 0);
      }

      formsTested = uniqueForms.size;
    }

    const startedAt = new Date(fs.readFileSync('reports/start-time.txt', 'utf8'));
    const finishedAt = new Date(fs.readFileSync('reports/end-time.txt', 'utf8'));

    const summary = {
      total,
      passed,
      failed,
      totalTestCases,
      passedTestCases,
      failedTestCases,
      formsTested,
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