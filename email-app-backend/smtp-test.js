const nodemailer = require('nodemailer');
require('dotenv').config();

async function testSMTP() {
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: 587,
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
    tls: { rejectUnauthorized: false }
  });

  try {
    const info = await transporter.sendMail({
      from: `"Test" <${process.env.EMAIL_USER}>`,
      to: 'dhruvilrangani007@gmail.com',
      subject: 'SMTP Test',
      text: 'If you received this, SMTP is working!'
    });

    console.log('✅ Mail sent:', info.messageId);
  } catch (err) {
    console.error('❌ SMTP Error:', err);
  }
}

testSMTP();
