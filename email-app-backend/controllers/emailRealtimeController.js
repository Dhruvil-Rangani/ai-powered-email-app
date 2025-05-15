// === controllers/emailRealtimeController.js ===
const { watchInboxForUser } = require('../services/imapService');

exports.attachRealtime = (socket) => {
  const user = socket.handshake.auth.user;
  const io   = socket.server;
  watchInboxForUser(
    {
      user: user.email,
      password: user.imapPassword,
      host: process.env.IMAP_HOST,
      port: Number(process.env.IMAP_PORT),
      tls: true,
    },
    (newEmail) => io.to(user.id).emit('new_email', newEmail)
  );
};