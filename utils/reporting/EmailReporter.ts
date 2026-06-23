// import nodemailer from 'nodemailer';
// import * as fs from 'fs';
// import * as path from 'path';

// import { MailConfig } from './MailConfig';
// import { EmailTemplate } from './EmailTemplate';
// import { ZipHelper } from './ZipHelper';

// export class EmailReporter {

//   static async send(): Promise<void> {

//     const config = MailConfig.get();

//     const reportDir = path.join(process.cwd(), 'reports');
//     const csvPath = path.join(reportDir, 'result-matrix.csv');

//     // const allureZipPath = await ZipHelper.zipAllureReport();

//     // -----------------------------
//     // Build summary from CSV ONLY
//     // -----------------------------
//     let total = 0;
//     let passed = 0;
//     let failed = 0;

//     if (fs.existsSync(csvPath)) {

//       const rows = fs.readFileSync(csvPath, 'utf-8').split('\n');

//       for (let i = 1; i < rows.length; i++) {

//         const row = rows[i].trim();
//         if (!row) continue;

//         const cols = row.split(',');

//         const status = cols[3];

//         total++;

//         if (status === 'PASSED') passed++;
//         else if (status === 'FAILED') failed++;
//       }
//     }

//     const summary = {
//       total,
//       passed,
//       failed,
//       startedAt: new Date(),
//       finishedAt: new Date()
//     };

//     // -----------------------------
//     // Transporter
//     // -----------------------------
//     const transporter = nodemailer.createTransport({
//       host: config.host,
//       port: config.port,
//       secure: config.secure,
//       auth: {
//         user: config.username,
//         pass: config.password
//       }
//     });

//     // -----------------------------
//     // Attachments
//     // -----------------------------
//     const attachments: any[] = [];

//     if (fs.existsSync(csvPath)) {
//       attachments.push({
//         filename: 'ResultMatrix.csv',
//         path: csvPath
//       });
//     }

//     // if (fs.existsSync(allureZipPath)) {
//     //   attachments.push({
//     //     filename: 'AllureReport.zip',
//     //     path: allureZipPath
//     //   });
//     // }

//     if (fs.existsSync('playwright-report')) {
//       attachments.push({
//         filename: 'PlaywrightReport',
//         path: 'playwright-report'
//       });
//     }

//     // -----------------------------
//     // Send email
//     // -----------------------------
//     await transporter.sendMail({
//       from: config.from,
//       to: config.to.join(','),
//       cc: config.cc?.join(','),
//       bcc: config.bcc?.join(','),

//       subject: `${config.subjectPrefix} Execution Report`,

//       html: EmailTemplate.build(summary),

//       attachments
//     });

//     console.log('\n📧 Email sent successfully\n');
//   }
// }




import nodemailer from 'nodemailer';
import * as fs from 'fs';
import * as path from 'path';

import { MailConfig } from './MailConfig';
import { EmailTemplate } from './EmailTemplate';

export class EmailReporter {

  static async send(): Promise<void> {

    const config = MailConfig.get();

    const reportDir = path.join(process.cwd(), 'reports');

    const csvPath = path.join(reportDir, 'result-matrix.csv');

    const summaryPath = path.join(
      reportDir,
      'execution-summary.json'
    );

    // -----------------------------
    // Build Summary
    // -----------------------------
    let total = 0;
    let passed = 0;
    let failed = 0;

    if (fs.existsSync(csvPath)) {

      const rows = fs.readFileSync(csvPath, 'utf8').split('\n');

      for (let i = 1; i < rows.length; i++) {

        const row = rows[i].trim();

        if (!row) continue;

        total++;

        const cols = row.split(',');

        const status = cols[3];

        if (status === 'PASSED')
          passed++;

        if (status === 'FAILED')
          failed++;
      }

    }

    const startedAt = new Date(
      fs.readFileSync('reports/start-time.txt', 'utf8')
    );

    const finishedAt = new Date(
      fs.readFileSync('reports/end-time.txt', 'utf8')
    );

    const summary = {
      total,
      passed,
      failed,
      startedAt: startedAt.getTime(),
      finishedAt: finishedAt.getTime(),
      totalDuration: finishedAt.getTime() - startedAt.getTime()
    };

    // -----------------------------
    // SMTP
    // -----------------------------
    const transporter = nodemailer.createTransport({

      host: config.host,

      port: config.port,

      secure: config.secure,

      auth: {

        user: config.username,

        pass: config.password

      }

    });

    // -----------------------------
    // Attachments
    // -----------------------------
    const attachments = [];

    if (fs.existsSync(csvPath)) {

      attachments.push({

        filename: 'ResultMatrix.csv',

        path: csvPath

      });

    }

    if (fs.existsSync(summaryPath)) {

      attachments.push({

        filename: 'ExecutionSummary.json',

        path: summaryPath

      });

    }

    // -----------------------------
    // Send Email
    // -----------------------------
    await transporter.sendMail({

      from: config.from,

      to: config.to.join(','),

      cc: config.cc?.join(','),

      bcc: config.bcc?.join(','),

      subject: `${config.subjectPrefix} Automation Execution Report`,

      html: EmailTemplate.build(summary),

      attachments

    });

    console.log('📧 Email Sent Successfully');

  }

}