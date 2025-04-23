const transporter = require('../config/smtp');
const { fetchInboxEmails } = require('../services/imapService'); // the new fetch function
const { groupByThread } = require('../services/threadService');
// Send Email Controller
const sendEmail = async (req, res) => {
  const { to, subject, text } = req.body;

  console.log('📨 Request received:', { to, subject, text });

  try {
    const info = await transporter.sendMail({
      from: `"Dhruvil Rangani" <${process.env.SMTP_USER}>`,
      to,
      subject,
      text,
    });

    res.status(200).json({ message: 'Email sent!', id: info.messageId });
  } catch (error) {
    console.error('❌ Send failed:', error);
    res.status(500).json({ error: 'Failed to send email', details: error.message });
  }
};

// Fetch Inbox Emails Controller
const getInboxEmails = async (req, res) => {
    const { from, subject } = req.query;
  try {
    const emails = await fetchInboxEmails({ from, subject});
    const threads = groupByThread(emails);
    res.status(200).json({ threads });
  } catch (error) {
    console.error('📥 Fetch inbox failed:', error);
    res.status(500).json({ error: 'Failed to fetch emails' });
  }
};

module.exports = { sendEmail, getInboxEmails };
