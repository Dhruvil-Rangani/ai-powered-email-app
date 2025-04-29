const bcrypt = require('bcrypt');
const { PrismaClient } = require('@prisma/client');
const { signAccess, expiresAt } = require('../utility/jwt');
const { randomUUID } = require('crypto');
const prisma = new PrismaClient();

/* -------- helpers -------- */
const hash = (pw) => bcrypt.hash(pw, 12);
const verify = (pw, hash) => bcrypt.compare(pw, hash);

/* -------- register -------- */
exports.register = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'email & password required' });

  try {
    const user = await prisma.user.create({
      data: { email, passwordHash: await hash(password) }
    });
    res.status(201).json({ id: user.id, email: user.email });
  } catch (err) {
    res.status(400).json({ error: 'email already exists' });
  }
};

/* -------- login -------- */
exports.login = async (req, res) => {
  const { email, password } = req.body;
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !(await verify(password, user.passwordHash)))
    return res.status(401).json({ error: 'invalid credentials' });

  const accessToken  = signAccess({ id: user.id, email: user.email });
  const refreshToken = randomUUID();

  await prisma.refreshToken.create({
    data: { token: refreshToken, userId: user.id, expires: expiresAt() }
  });

  res.json({ accessToken, refreshToken });
};

/* -------- refresh -------- */
exports.refresh = async (req, res) => {
  const { refreshToken } = req.body;
  const dbTok = await prisma.refreshToken.findUnique({ where: { token: refreshToken } });
  if (!dbTok || dbTok.expires < new Date()) return res.sendStatus(401);

  const user = await prisma.user.findUnique({ where: { id: dbTok.userId } });
  const newAccess = signAccess({ id: user.id, email: user.email });
  res.json({ accessToken: newAccess });
};

/* -------- logout (delete refresh) -------- */
exports.logout = async (req, res) => {
  const { refreshToken } = req.body;
  await prisma.refreshToken.deleteMany({ where: { token: refreshToken } });
  res.sendStatus(204);
};
