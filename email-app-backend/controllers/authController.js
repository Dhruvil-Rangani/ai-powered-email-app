// controllers/authController.js
const bcrypt        = require('bcryptjs');
const { signAccess, expiresAt } = require('../utility/jwt');
const { randomUUID }            = require('crypto');
const { createUser }            = require('../services/userService');
const { PrismaClient }          = require('@prisma/client');
const prisma                    = new PrismaClient();

// — REGISTER —––––––––––––––––––––––––––––––––––––––––––––––––
exports.register = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'email & password required' });
  }
  if (!email.endsWith(`@${process.env.VIRTUAL_DOMAIN}`)) {
    return res.status(400).json({ error: 'Invalid email domain' });
  }

  try {
    const user = await createUser(email, password);
    
    // Generate tokens after successful registration
    const accessToken = signAccess({ id: user.id, email: user.email });
    const refreshToken = randomUUID();
    
    // Store refresh token in database
    await prisma.refreshToken.create({
      data: { token: refreshToken, userId: user.id, expires: expiresAt() }
    });

    // Return user data with tokens
    return res.status(201).json({ 
      id: user.id, 
      email: user.email,
      accessToken,
      refreshToken
    });
  } catch (err) {
    if (err.code === 'P2002') {
      return res.status(409).json({ error: 'Email already in use' });
    }
    console.error('Registration error', err);
    return res.status(500).json({ error: 'Registration failed' });
  }
};

// — LOGIN —––––––––––––––––––––––––––––––––––––––––––––––––––
exports.login = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'email & password required' });
  }

  const user = await prisma.user.findUnique({ where: { email } });
  const ok   = user && await bcrypt.compare(password, user.passwordHash);
  if (!ok) {
    return res.status(401).json({ error: 'invalid credentials' });
  }

  const accessToken  = signAccess({ id: user.id, email: user.email });
  const refreshToken = randomUUID();
  await prisma.refreshToken.create({
    data: { token: refreshToken, userId: user.id, expires: expiresAt() }
  });

  return res.json({ accessToken, refreshToken });
};

// — REFRESH —
exports.refresh = async (req, res) => {
  const { refreshToken } = req.body;
  const dbTok = await prisma.refreshToken.findUnique({ where: { token: refreshToken } });
  if (!dbTok || dbTok.expires < new Date()) return res.sendStatus(401);

  const user = await prisma.user.findUnique({ where: { id: dbTok.userId } });
  const newAccess = signAccess({ id: user.id, email: user.email });
  res.json({ accessToken: newAccess });
};

// — LOGOUT —
exports.logout = async (req, res) => {
  const { refreshToken } = req.body;
  await prisma.refreshToken.deleteMany({ where: { token: refreshToken } });
  res.sendStatus(204);
};
