// === controllers/emailRealtimeController.js ===
const { watchInboxForUser } = require('../services/imapService');
const { getImapPassword } = require('../services/userService');

exports.attachRealtime = async (socket) => {
  const user = socket.handshake.auth.user;
  const io = socket.server;

  try {
    // Get decrypted IMAP password
    const password = await getImapPassword(user.id);
    
    watchInboxForUser(
      {
        user: user.email,
        userId: user.id,  // Pass userId instead of password
        host: process.env.IMAP_HOST,
        port: Number(process.env.IMAP_PORT),
        tls: true,
      },
      (newEmail) => io.to(user.id).emit('new_email', newEmail)
    );
  } catch (error) {
    console.error('Failed to get IMAP password for realtime updates:', error);
    socket.disconnect();
  }
};