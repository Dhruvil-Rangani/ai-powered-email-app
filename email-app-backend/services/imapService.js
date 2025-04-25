// services/imapService.js
const getImapConnection = require('../config/imap');
const { simpleParser } = require('mailparser');
require('dotenv').config();

const fetchInboxEmails = (filters = {}) => {
  return new Promise((resolve, reject) => {
    const imap = getImapConnection();
    const emails = [];
    const folder = filters.folder || 'INBOX';

    imap.once('ready', () => {
      imap.openBox(folder, true, (err, box) => {
        if (err) return reject(err);

        const fetch = imap.seq.fetch(`${Math.max(1, box.messages.total - 50)}:*`, {
          bodies: '',
          struct: true
        });

        const parsePromises = [];

        fetch.on('message', (msg) => {
          const parserPromise = new Promise((res, rej) => {
            msg.on('body', stream => {
              simpleParser(stream, (err, parsed) => {
                if (err) return rej(err);

                const emailDate = parsed.date ? new Date(parsed.date) : null;
                const clean = (value) => (value && value.trim() !== "") ? value.trim() : null;

                const fromFilter = clean(filters.from);
                const subjectFilter = clean(filters.subject);
                const bodyFilter = clean(filters.body);
                const afterFilter = clean(filters.after);
                const beforeFilter = clean(filters.before);

                const matchesFrom = fromFilter ? parsed.from.text.toLowerCase().includes(fromFilter.toLowerCase()) : true;
                const matchesSubject = subjectFilter ? parsed.subject?.toLowerCase().includes(subjectFilter.toLowerCase()) : true;
                const matchesBody = bodyFilter ? parsed.text?.toLowerCase().includes(bodyFilter.toLowerCase()) : true;

                const dateOnly = emailDate?.toISOString().split('T')[0]; // e.g., '2025-04-23'
                const afterDate = afterFilter ? new Date(afterFilter) : null;
                if (afterDate) afterDate.setUTCHours(0, 0, 0, 0); // Start of day (UTC)

                const beforeDate = beforeFilter ? new Date(beforeFilter) : null;
                if (beforeDate) beforeDate.setUTCHours(23, 59, 59, 999); // End of day (UTC)

                const matchesAfter = afterDate ? emailDate && emailDate >= afterDate : true;
                const matchesBefore = beforeDate ? emailDate && emailDate <= beforeDate : true;


                if (matchesFrom && matchesSubject && matchesBody && matchesAfter && matchesBefore) {
                  const attachments = parsed.attachments?.map(att => ({
                    filename: att.filename,
                    contentType: att.contentType,
                    size: att.size,
                    contentId: att.cid,
                    contentDisposition: att.contentDisposition
                  })) || [];

                  emails.push({
                    subject: parsed.subject,
                    from: parsed.from.text,
                    date: parsed.date,
                    text: parsed.text,
                    messageId: parsed.messageId,
                    inReplyTo: parsed.inReplyTo,
                    references: parsed.references || [],
                    attachments,
                  });
                }

                res();
              });
            });
          });

          parsePromises.push(parserPromise);
        });

        fetch.once('end', () => {
          Promise.all(parsePromises)
            .then(() => {
              imap.end();
              resolve(emails.sort((a, b) => new Date(b.date) - new Date(a.date)));
            })
            .catch(reject);
        });
      });
    });

    imap.once('error', reject);
    imap.connect();
  });
};

module.exports = { fetchInboxEmails };
