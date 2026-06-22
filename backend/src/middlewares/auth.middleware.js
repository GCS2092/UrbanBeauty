const { verifyToken } = require('../utils/jwt.utils');
const { getAccessibleStoreIds } = require('../modules/stores/store.service');

async function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Token manquant ou invalide' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const payload = verifyToken(token);
    req.user = payload;
    req.storeIds = await getAccessibleStoreIds(payload);
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Token invalide' });
  }
}

// ✅ Middleware optionnel : récupère le user si connecté, sinon continue en invité
async function authenticateOptional(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    req.user = null; // invité
    return next();
  }

  const token = authHeader.split(' ')[1];

  try {
    const payload = verifyToken(token);
    req.user = payload;
    req.storeIds = await getAccessibleStoreIds(payload);
  } catch {
    req.user = null; // token invalide → traité comme invité
  }

  next();
}

function isAdmin(req, res, next) {
  authenticate(req, res, () => {
    if (req.user?.role !== 'ADMIN') {
      return res.status(403).json({ message: 'Accès réservé aux admins' });
    }
    next();
  });
}

function requireAdmin(req, res, next) {
  authenticate(req, res, () => {
    if (req.user?.role !== 'ADMIN') {
      return res.status(403).json({ message: 'Accès réservé aux admins' });
    }
    next();
  });
}

module.exports = { authenticate, authenticateOptional, isAdmin, requireAdmin };