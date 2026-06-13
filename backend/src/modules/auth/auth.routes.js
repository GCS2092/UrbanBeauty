const express = require('express');
const { body } = require('express-validator');
const { authController } = require('./auth.controller');
const { checkValidation } = require('../../middlewares/validation.middleware');
const { authLimiter } = require('../../middlewares/rateLimit.middleware');
const { authenticate } = require('../../middlewares/auth.middleware');
const prisma = require('../../config/database');
const { getAccessibleStoreIds } = require('../stores/store.service');
const { signToken } = require('../../utils/jwt.utils');

const router = express.Router();

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Créer un compte
 *     tags: [Auth]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           example:
 *             email: client@test.com
 *             password: password123
 *             firstName: Aminata
 *             lastName: Diallo
 *             phone: "+221770000001"
 *     responses:
 *       201:
 *         description: Compte créé
 *       400:
 *         description: Email déjà utilisé
 */
router.post('/register', authLimiter,
  body('email').isEmail(),
  body('password').isLength({ min: 6 }),
  body('firstName').notEmpty(),
  body('lastName').notEmpty(),
  checkValidation,
  authController.register
);

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Se connecter
 *     tags: [Auth]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           example:
 *             email: client@test.com
 *             password: password123
 *     responses:
 *       200:
 *         description: Retourne token + user
 *       401:
 *         description: Identifiants incorrects
 */
router.post('/login', authLimiter,
  body('email').isEmail(),
  body('password').notEmpty(),
  checkValidation,
  authController.login
);

/**
 * @swagger
 * /api/auth/logout:
 *   post:
 *     summary: Se déconnecter
 *     tags: [Auth]
 *     responses:
 *       200:
 *         description: Déconnexion réussie
 */
router.post('/logout', authenticate, authController.logout);

/**
 * @swagger
 * /api/auth/me:
 *   get:
 *     summary: Profil de l'utilisateur connecté
 *     tags: [Auth]
 *     responses:
 *       200:
 *         description: Données utilisateur
 */
router.get('/me', authenticate, authController.me);

/**
 * @swagger
 * /api/auth/switch-store:
 *   post:
 *     summary: Changer de boutique active
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           example:
 *             storeId: "clxxxxxxxxxxxxx"
 *     responses:
 *       200:
 *         description: Nouveau token JWT avec la boutique active + infos boutique
 *       403:
 *         description: Accès refusé à cette boutique
 *       404:
 *         description: Boutique introuvable ou inactive
 */
router.post('/switch-store', authenticate, async (req, res, next) => {
  try {
    const { storeId } = req.body;
    if (!storeId) {
      return res.status(400).json({ message: 'storeId requis' });
    }

    // Vérifie que l'utilisateur a accès à cette boutique
    if (req.user.role !== 'ADMIN') {
      const allowed = await getAccessibleStoreIds(req.user);
      if (!allowed.includes(storeId)) {
        return res.status(403).json({ message: 'Accès refusé à cette boutique' });
      }
    }

    // Récupère la boutique
    const store = await prisma.store.findUnique({ where: { id: storeId } });
    if (!store || !store.isActive) {
      return res.status(404).json({ message: 'Boutique introuvable ou inactive' });
    }

    // Nouveau token avec activeStoreId injecté
    const token = signToken({
      id:            req.user.id,
      email:         req.user.email,
      role:          req.user.role,
      activeStoreId: storeId,
    });

    res.json({ token, store });
  } catch (err) {
    next(err);
  }
});

module.exports = router;