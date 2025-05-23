// services/imapService.js
const getImapConnection = require('../config/imap');
const { simpleParser } = require('mailparser');
const { getImapPassword } = require('./userService');

async function watchInboxForUser({ user, userId, host, port, tls }, emitNew) {
  // Get decrypted IMAP password
  const password = await getImapPassword(userId);
  const imap = getImapConnection({ user, password, host, port, tls });

  imap.once('ready', () => {
    imap.openBox('INBOX', true, (err, box) => {
      if (err) throw err;

      imap.on('mail', () => {
        if (!box.messages.total) return; // 🛑 Skip fetch if inbox is empty
        const seq = `${box.messages.total}:*`;
        const f = imap.seq.fetch(seq, { bodies: '', struct: true });

        f.on('message', msg => {
          msg.on('body', stream => {
            simpleParser(stream, (err, parsed) => {
              if (err) return;

              const emailObj = {
                subject: parsed.subject || '',
                from: parsed.from?.text || '',
                to: parsed.to?.text || '',
                cc: parsed.cc?.text || '',
                date: parsed.date || null,
                text: parsed.text || '',
                html: parsed.html || '',
                messageId: parsed.messageId || '',
                inReplyTo: parsed.inReplyTo || '',
                references: parsed.references || [],
                attachments: (parsed.attachments || []).map(a => ({
                  filename: a.filename,
                  contentType: a.contentType,
                  size: a.size,
                  contentId: a.cid,
                  contentDisposition: a.contentDisposition
                }))
              };

              emitNew(emailObj);
            });
          });
        });
      });
    });
  });

  imap.connect();
}

const fetchInboxEmails = async ({
  user, userId, host, port, tls,
  from, subject, body, after, before, folder, limit = 50
}) => {
  // Get decrypted IMAP password
  const password = await getImapPassword(userId);
  
  return new Promise((resolve, reject) => {
    const imap = getImapConnection({ user, password, host, port, tls });
    const emails = [];
    const mailFolder = folder || 'INBOX';

    const clean = v => typeof v === 'string' && v.trim() ? v.trim() : null;
    const fromFilter = clean(from);
    const subjectFilter = clean(subject);
    const bodyFilter = clean(body);
    const afterDate = clean(after) ? new Date(after) : null;
    const beforeDate = clean(before) ? new Date(before) : null;
    if (afterDate) afterDate.setUTCHours(0, 0, 0, 0);
    if (beforeDate) beforeDate.setUTCHours(23, 59, 59, 999);

    imap.once('ready', () => {
      imap.openBox(mailFolder, true, (err, box) => {
        if (err) return reject(err);

        if (!box.messages.total) {
          imap.end();
          return resolve([]);
        }

        const start = Math.max(1, box.messages.total - limit + 1);
        const seqRange = `${start}:*`;
        const f = imap.seq.fetch(seqRange, { bodies: '', struct: true });
        const parsers = [];

        f.on('message', msg => {
          parsers.push(new Promise((res, rej) => {
            msg.on('body', stream => {
              simpleParser(stream, (err, parsed) => {
                if (err) return rej(err);

                const fromText    = parsed.from?.text || '';
                const subjectText = parsed.subject || '';
                const bodyText    = parsed.text || '';
                const dateObj     = parsed.date ? new Date(parsed.date) : null;

                const ok =
                  (!fromFilter || fromText.toLowerCase().includes(fromFilter.toLowerCase())) &&
                  (!subjectFilter || subjectText.toLowerCase().includes(subjectFilter.toLowerCase())) &&
                  (!bodyFilter || bodyText.toLowerCase().includes(bodyFilter.toLowerCase())) &&
                  (!afterDate || (dateObj && dateObj >= afterDate)) &&
                  (!beforeDate || (dateObj && dateObj <= beforeDate));

                if (ok) {
                  emails.push({
                    subject: subjectText,
                    from: fromText,
                    to: parsed.to?.text || '',
                    cc: parsed.cc?.text || '',
                    date: parsed.date || null,
                    text: bodyText,
                    html: parsed.html || '',
                    messageId: parsed.messageId || '',
                    inReplyTo: parsed.inReplyTo || '',
                    references: parsed.references || [],
                    attachments: (parsed.attachments || []).map(a => ({
                      filename: a.filename,
                      contentType: a.contentType,
                      size: a.size,
                      contentId: a.cid,
                      contentDisposition: a.contentDisposition
                    }))
                  });
                }

                res();
              });
            });
          }));
        });

        f.once('end', () => {
          Promise.all(parsers)
            .then(() => {
              imap.end();
              resolve(emails.sort((a, b) => new Date(b.date) - new Date(a.date)));
            })
            .catch(err => {
              imap.end();
              reject(err);
            });
        });
      });
    });

    imap.once('error', err => {
      reject(err);
    });

    imap.connect();
  });
};

module.exports = {
  fetchInboxEmails,
  watchInboxForUser
};
