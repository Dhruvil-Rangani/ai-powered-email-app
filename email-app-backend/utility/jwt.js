const jwt = require('jsonwebtoken');
const ms  = require('ms');                         // tiny helper

exports.signAccess = (payload) =>
  jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES || '15m' });

exports.verifyAccess = (token) =>
  jwt.verify(token, process.env.JWT_SECRET);

exports.expiresAt = () => {
  const ttl = parseInt(process.env.REFRESH_EXPIRES_DAYS || '30', 10);
  return new Date(Date.now() + ttl * 24 * 60 * 60 * 1000);
};
