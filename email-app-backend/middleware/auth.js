// middleware/auth.js
const { verifyAccess } = require('../utility/jwt');
const { PrismaClient }  = require('@prisma/client');
const prisma            = new PrismaClient();

async function authenticate(req, res, next) {
  const hdr = req.headers.authorization || '';
  if (!hdr.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing Authorization header' });
  }

  const token = hdr.slice(7);
  let payload;
  try {
    payload = verifyAccess(token);
  } catch {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }

  const user = await prisma.user.findUnique({ where: { id: payload.id } });
  if (!user) {
    return res.status(401).json({ error: 'User not found' });
  }

  req.user = { id: user.id, email: user.email };
  next();
}

module.exports = { authenticate };
