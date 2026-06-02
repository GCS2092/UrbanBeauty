const rateLimit = require('express-rate-limit');

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: 'Trop de requêtes, réessayez plus tard.',
});

const apiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 120,
  message: "Trop de requêtes sur l'API, réessayez dans une minute.",
});

module.exports = { authLimiter, apiLimiter };
