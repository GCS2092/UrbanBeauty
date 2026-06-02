const { verifyToken } = require('../utils/jwt.utils');

function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Token manquant ou invalide' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const payload = verifyToken(token);
    req.user = payload;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Token invalide' });
  }
}

function isAdmin(req, res, next) {
  authenticate(req, res, () => {
    if (req.user?.role !== 'ADMIN') {
      return res.status(403).json({ message: 'Accès réservé aux admins' });
    }
    next();
  });
}

module.exports = { authenticate, isAdmin };
