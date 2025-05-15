const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const http    = require('http');
const { Server } = require('socket.io');
const emailRoutes = require('./routes/emails');
const aiRoutes = require('./routes/ai');
const authRoutes = require('./routes/auth');
const { authenticate } = require('./middleware/auth');
const { attachRealtime } = require('./controllers/emailRealtimeController');
const { verifyAccess } = require('./utility/jwt'); // <-- added import
const { PrismaClient } = require('@prisma/client'); // for DB lookup
const prisma = new PrismaClient();

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: process.env.FRONTEND_ORIGIN || '*' }
});

io.on('connection', async (socket) => {
  try {
    const token = socket.handshake.auth.token;
    const payload = verifyAccess(token);
    // fetch IMAP password from DB
    const userRec = await prisma.user.findUnique({ where: { id: payload.id } });
    if (!userRec) throw new Error('User not found');
    socket.join(payload.id);
    socket.handshake.auth.user = {
      id: payload.id,
      email: payload.email,
      imapPassword: userRec.imapPassword // loaded from DB
    };
    attachRealtime(socket);
  } catch (err) {
    console.error('Socket auth failed', err);
    socket.disconnect();
  }
});

app.use('/api/auth', authRoutes);
app.use('/api/emails', authenticate, emailRoutes);
app.use('/api/ai', authenticate, aiRoutes);

app.get('/test', (req, res) => res.send('✅ Backend is live!'));

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));