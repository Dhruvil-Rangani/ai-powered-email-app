// services/imapService.js
const getImapConnection = require('../config/imap');
const { simpleParser } = require('mailparser');
require('dotenv').config();

const fetchInboxEmails = (filters = {}) =>
  new Promise((resolve, reject) => {
    const imap   = getImapConnection();
    const emails = [];
    const folder = filters.folder || 'INBOX';

    /* ---------- normalise filters once ---------- */
    const clean = (v) => (typeof v === 'string' && v.trim() ? v.trim() : null);

    const fromFilter    = clean(filters.from);
    const subjectFilter = clean(filters.subject);
    const bodyFilter    = clean(filters.body);

    const afterDate = clean(filters.after)  ? new Date(filters.after)  : null;
    const beforeDate = clean(filters.before) ? new Date(filters.before) : null;

    if (afterDate)  afterDate.setUTCHours(0, 0, 0, 0);          // 00:00:00
    if (beforeDate) beforeDate.setUTCHours(23, 59, 59, 999);    // 23:59:59

    imap.once('ready', () => {
      imap.openBox(folder, true, (err, box) => {
        if (err) return reject(err);

        const fetch = imap.seq.fetch(
          `${Math.max(1, box.messages.total - 50)}:*`,
          { bodies: '', struct: true }
        );

        const parsePromises = [];

        fetch.on('message', (msg) => {
          const p = new Promise((res, rej) => {
            msg.on('body', (stream) =>
              simpleParser(stream, (err, parsed) => {
                if (err) return rej(err);

                const emailDate = parsed.date ? new Date(parsed.date) : null;

                /* ---------- match tests ---------- */
                const matches =
                  (!fromFilter    || parsed.from.text.toLowerCase().includes(fromFilter.toLowerCase())) &&
                  (!subjectFilter || (parsed.subject || '').toLowerCase().includes(subjectFilter.toLowerCase())) &&
                  (!bodyFilter    || (parsed.text || '').toLowerCase().includes(bodyFilter.toLowerCase())) &&
                  (!afterDate     || (emailDate && emailDate >= afterDate)) &&
                  (!beforeDate    || (emailDate && emailDate <= beforeDate));

                // /* optional debug */
                // if (process.env.DEBUG_DATES && (afterDate || beforeDate)) {
                //   console.log(
                //     `[FILTER] ${parsed.subject?.slice(0, 30) || '(no subj)'} | ${emailDate?.toISOString()}`
                //     + ` | after ok=${!afterDate || emailDate >= afterDate}`
                //     + ` | before ok=${!beforeDate || emailDate <= beforeDate}`
                //   );
                // }

                if (matches) {
                  emails.push({
                    subject     : parsed.subject,
                    from        : parsed.from.text,
                    date        : parsed.date,
                    text        : parsed.text,
                    messageId   : parsed.messageId,
                    inReplyTo   : parsed.inReplyTo,
                    references  : parsed.references || [],
                    attachments : (parsed.attachments || []).map((a) => ({
                      filename           : a.filename,
                      contentType        : a.contentType,
                      size               : a.size,
                      contentId          : a.cid,
                      contentDisposition : a.contentDisposition,
                    })),
                  });
                }
                res();
              })
            );
          });
          parsePromises.push(p);
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

module.exports = { fetchInboxEmails };
