const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const http    = require('http');
const { Server } = require('socket.io');
const emailRoutes = require('./routes/email');
const aiRoutes = require('./routes/ai');
const authRoutes = require('./routes/auth');
const { authenticate } = require('./middleware/auth');
const { attachRealtime } = require('./controllers/emailRealtimeController');
const { verifyAccess } = require('./utility/jwt'); // <-- added import
const { PrismaClient } = require('@prisma/client'); // for DB lookup
const prisma = new PrismaClient();
const { getImapPassword } = require('./services/userService');

dotenv.config();
const app = express();

// Middleware
// Parse comma-separated origins from env
const allowedOrigins = process.env.FRONTEND_ORIGIN
  ? process.env.FRONTEND_ORIGIN.split(',').map(origin => origin.trim())
  : [];

const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps, curl, etc.)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) !== -1) {
      return callback(null, true);
    } else {
      return callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    credentials: true,
  }
});

io.on('connection', async (socket) => {
  try {
    const token = socket.handshake.auth.token;
    const payload = verifyAccess(token);
    
    // fetch user from DB
    const userRec = await prisma.user.findUnique({ where: { id: payload.id } });
    if (!userRec) throw new Error('User not found');
    
    socket.join(payload.id);
    socket.handshake.auth.user = {
      id: payload.id,
      email: payload.email
    };
    
    attachRealtime(socket);
  } catch (err) {
    console.error('Socket auth failed', err);
    socket.disconnect();
  }
});

app.use('/api/auth', authRoutes);
app.use('/api/email', emailRoutes);
app.use('/api/ai', aiRoutes);

app.get('/test', (req, res) => res.send('✅ Backend is live!'));

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));