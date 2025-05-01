const Imap = require('node-imap');
require('dotenv').config();

const getImapConnection = ({ user, password, host, port, tls }) => new Imap({ user, password, host, port, tls });

module.exports = getImapConnection;
