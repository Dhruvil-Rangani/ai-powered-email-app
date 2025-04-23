const nodemailer = require('nodemailer');
require('dotenv').config();

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,          // in-v3.mailjet.com
  port: Number(process.env.SMTP_PORT),  // 587
  secure: false,                        // Required for STARTTLS on port 587
  auth: {
    user: process.env.SMTP_USER,        // your Mailjet API Key
    pass: process.env.SMTP_PASS         // your Mailjet Secret Key
  },
  tls: {
    rejectUnauthorized: false           // 🔥 prevents cert errors if any
  }
});

module.exports = transporter;
