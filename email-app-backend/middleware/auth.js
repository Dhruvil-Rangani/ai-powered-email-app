const { verifyAccess } = require('../utility/jwt');

module.exports = (req, res, next) => {
  const hdr = req.headers.authorization || '';
  const token = hdr.startsWith('Bearer ') ? hdr.slice(7) : null;
  if (!token) return res.sendStatus(401);

  try {
    req.user = verifyAccess(token);      // { id, email, iat, exp }
    next();
  } catch {
    res.sendStatus(401);
  }
};
