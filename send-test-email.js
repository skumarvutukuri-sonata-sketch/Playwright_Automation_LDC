// send-test-email.js
const nodemailer = require('nodemailer');
require('dotenv').config();

(async () => {
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: false,
    auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
  });

  try {
    console.log('Verifying SMTP connection...');
    await transporter.verify();
    console.log('SMTP verified. Sending test message...');
    const info = await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: process.env.EMAIL_TO,
      subject: 'SMTP test',
      text: 'SMTP test message',
    });
    console.log('Sent:', info.messageId || info.response);
  } catch (e) {
    console.error('SMTP error:', e);
    process.exitCode = 1;
  }
})();