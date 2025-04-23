// services/imapService.js
const getImapConnection = require('../config/imap');
const { simpleParser } = require('mailparser');
require('dotenv').config();

const fetchInboxEmails = (filters = {}) => {
    return new Promise((resolve, reject) => {
      const imap = getImapConnection();
      const emails = [];
  
      imap.once('ready', () => {
        imap.openBox('INBOX', true, (err, box) => {
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
  
                  // Apply filters
                  const matchesFrom = filters.from ? parsed.from.text.toLowerCase().includes(filters.from.toLowerCase()) : true;
                  const matchesSubject = filters.subject ? parsed.subject?.toLowerCase().includes(filters.subject.toLowerCase()) : true;
  
                  if (matchesFrom && matchesSubject) {
                    emails.push({
                      subject: parsed.subject,
                      from: parsed.from.text,
                      date: parsed.date,
                      text: parsed.text,
                      messageId: parsed.messageId,
                      inReplyTo: parsed.inReplyTo,
                      references: parsed.references || [],
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
