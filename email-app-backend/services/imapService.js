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

                const matchesFrom = filters.from ? parsed.from.text.toLowerCase().includes(filters.from.toLowerCase()) : true;
                const matchesSubject = filters.subject ? parsed.subject?.toLowerCase().includes(filters.subject.toLowerCase()) : true;

                if (matchesFrom && matchesSubject) {
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
