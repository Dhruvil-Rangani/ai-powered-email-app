const Imap = require('node-imap');
require('dotenv').config();

const getImapConnection = () => new Imap({
  user: process.env.EMAIL_USER.split('@')[0],
  password: process.env.EMAIL_PASS,
  host: process.env.IMAP_HOST,
  port: parseInt(process.env.IMAP_PORT),
  tls: true,
});

module.exports = getImapConnection;
