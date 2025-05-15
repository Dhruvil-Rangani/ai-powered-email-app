// services/imapService.js
const getImapConnection = require('../config/imap');
const { simpleParser }   = require('mailparser');

const fetchInboxEmails = ({
  user,
  password,
  host,
  port,
  tls,
  from,
  subject,
  body,
  after,
  before,
  folder,
  limit = 50,
}) =>
  new Promise((resolve, reject) => {
    // now host/port/tls actually come through
    const imap   = getImapConnection({ user, password, host, port, tls });
    const emails = [];
    const mailFolder = folder || 'INBOX';

    // normalize filters
    const clean = v => typeof v==='string' && v.trim() ? v.trim() : null;
    const fromFilter    = clean(from);
    const subjectFilter = clean(subject);
    const bodyFilter    = clean(body);

    const afterDate  = clean(after)  ? new Date(after)  : null;
    const beforeDate = clean(before) ? new Date(before) : null;
    if (afterDate)  afterDate.setUTCHours(0,0,0,0);
    if (beforeDate) beforeDate.setUTCHours(23,59,59,999);

    imap.once('ready', () => {
      imap.openBox(mailFolder, true, (err, box) => {
        if (err) return reject(err);

        const start = Math.max(1, box.messages.total - limit + 1);
        const seqRange = `${start}:*`;
        const f = imap.seq.fetch(seqRange, { bodies:'', struct:true });

        const parsers = [];
        f.on('message', msg => {
          parsers.push(new Promise((res, rej) => {
            msg.on('body', stream => {
              simpleParser(stream, (err, parsed) => {
                if (err) return rej(err);
                const d = parsed.date && new Date(parsed.date);
                const ok =
                  (!fromFilter    || parsed.from.text.toLowerCase().includes(fromFilter.toLowerCase())) &&
                  (!subjectFilter || (parsed.subject||'').toLowerCase().includes(subjectFilter.toLowerCase())) &&
                  (!bodyFilter    || (parsed.text||'').toLowerCase().includes(bodyFilter.toLowerCase())) &&
                  (!afterDate     || (d && d>=afterDate)) &&
                  (!beforeDate    || (d && d<=beforeDate));
                if (ok) {
                  emails.push({
                    subject: parsed.subject,
                    from:    parsed.from.text,
                    date:    parsed.date,
                    text:    parsed.text,
                    messageId: parsed.messageId,
                    inReplyTo: parsed.inReplyTo,
                    references: parsed.references||[],
                    attachments: (parsed.attachments||[]).map(a=>({
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
            .then(()=>{
              imap.end();
              resolve(emails.sort((a,b)=>new Date(b.date)-new Date(a.date)));
            })
            .catch(reject);
        });
      });
    });

    imap.once('error', reject);
    imap.connect();
  });

module.exports = { fetchInboxEmails };
