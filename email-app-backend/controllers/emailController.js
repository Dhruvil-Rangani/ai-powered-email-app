const transporter = require('../config/smtp');
const { fetchInboxEmails } = require('../services/imapService');
const { groupByThread } = require('../services/threadService');
const getImapConnection = require('../config/imap');
const { simpleParser } = require('mailparser');
const { addTag, getTags, filterEmailsByTag } = require('../services/tagService');

// Send Email Controller
const sendEmail = async (req, res) => {
  const { to, subject, text, html, attachments } = req.body;
  const fromAddress = req.body.from || `"Dhruvil Rangani" <${process.env.EMAIL_USER}>`;

  console.log('📨 Request received:', { to, subject, text });

  try {
    const info = await transporter.sendMail({
      from: fromAddress,
      to,
      subject,
      text,
      html,
      attachments,
    });

    res.status(200).json({ message: 'Email sent!', id: info.messageId });
  } catch (error) {
    console.error('❌ Send failed:', error);
    res.status(500).json({ error: 'Failed to send email', details: error.message });
  }
};

// Fetch Inbox Emails Controller
const getInboxEmails = async (req, res) => {
  const { from, subject, body, after, before, folder } = req.query;

  try {
    const emails = await fetchInboxEmails({ from, subject, body, after, before, folder });
    const threads = groupByThread(emails);
    res.status(200).json({ threads });
  } catch (error) {
    console.error('📥 Fetch inbox failed:', error);
    res.status(500).json({ error: 'Failed to fetch emails' });
  }
};

// Download Attachment Controller
const downloadAttachment = async (req, res) => {
  const { messageId, filename } = req.params;
  const imap = getImapConnection();

  imap.once('ready', () => {
    imap.openBox('INBOX', true, () => {
      const searchQuery = [['HEADER', 'Message-ID', messageId]];

      imap.search(searchQuery, (err, results) => {
        if (err || !results.length) {
          imap.end();
          return res.status(404).json({ error: 'Email not found' });
        }

        const fetch = imap.fetch(results, { bodies: '', struct: true });

        fetch.on('message', msg => {
          msg.on('body', stream => {
            simpleParser(stream, (err, parsed) => {
              const attachment = parsed.attachments?.find(att => att.filename === filename);
              if (!attachment) {
                imap.end();
                return res.status(404).json({ error: 'Attachment not found' });
              }

              res.set({
                'Content-Type': attachment.contentType,
                'Content-Disposition': `attachment; filename="${attachment.filename}"`,
              });

              res.send(attachment.content);
              imap.end();
            });
          });
        });
      });
    });
  });

  imap.once('error', (err) => {
    console.error('Attachment download error:', err);
    res.status(500).json({ error: 'Failed to download attachment' });
  });

  imap.connect();
};

// Add tag to an email
const tagEmail = async (req, res) => {
  const { messageId, label } = req.body;
  const userId = req.user.id;

  try {
    const tag = await addTag(userId, messageId, label);
    res.status(201).json(tag);
  } catch (err) {
    res.status(500).json({ error: 'Failed to tag email', details: err.message });
  }
};

// Get tags for a specific email
const getEmailTags = async (req, res) => {
  try {
    const tags = await getTags(req.params.userId, req.params.messageId);
    res.json(tags);
  } catch (err) {
    res.status(500).json({ error: 'Failed to get tags', details: err.message });
  }
};

// Get all emails tagged with a specific label
const getEmailsByTag = async (req, res) => {
  try {
    const tags = await filterEmailsByTag(req.params.userId, req.params.label);
    res.json(tags); // You can enhance this to fetch email details too
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch tagged emails', details: err.message });
  }
};

module.exports = { 
  sendEmail, 
  getInboxEmails, 
  downloadAttachment,
  tagEmail,
  getEmailTags,
  getEmailsByTag 
};
