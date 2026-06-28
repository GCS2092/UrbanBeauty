// backend/src/modules/auth/auth.routes.js
// Remplace ENTIÈREMENT le fichier existant

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

// ─────────────────────────────────────────────────────────────────────────────
// INSCRIPTION EN 3 ÉTAPES (avec OTP)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * @swagger
 * /api/auth/register/request-otp:
 *   post:
 *     summary: "Étape 1 — Demander un code OTP pour créer un compte"
 *     tags: [Auth]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           example:
 *             email: client@test.com
 *     responses:
 *       200:
 *         description: Code OTP envoyé par email
 *       400:
 *         description: Email déjà utilisé
 */
router.post(
  '/register/request-otp',
  authLimiter,
  body('email').isEmail().withMessage('Email invalide'),
  checkValidation,
  authController.requestOtp
);

/**
 * @swagger
 * /api/auth/register/verify-otp:
 *   post:
 *     summary: "Étape 2 — Vérifier le code OTP reçu par email"
 *     tags: [Auth]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           example:
 *             email: client@test.com
 *             code: "483920"
 *     responses:
 *       200:
 *         description: Retourne un setupToken temporaire (30 min)
 *       400:
 *         description: Code invalide ou expiré
 */
router.post(
  '/register/verify-otp',
  authLimiter,
  body('email').isEmail().withMessage('Email invalide'),
  body('code').isLength({ min: 6, max: 6 }).withMessage('Code à 6 chiffres requis'),
  checkValidation,
  authController.verifyOtp
);

/**
 * @swagger
 * /api/auth/register/complete:
 *   post:
 *     summary: "Étape 3 — Finaliser la création du compte (définir le mot de passe)"
 *     tags: [Auth]
 *     security: []
 *     description: |
 *       Requiert le setupToken retourné par /verify-otp dans le header :
 *       Authorization: Bearer <setupToken>
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           example:
 *             firstName: Aminata
 *             lastName: Diallo
 *             phone: "+221770000001"
 *             password: monMotDePasse123
 *     responses:
 *       201:
 *         description: Compte créé avec succès
 *       401:
 *         description: setupToken manquant ou invalide
 */
router.post(
  '/register/complete',
  authLimiter,
  body('firstName').notEmpty().withMessage('Prénom requis'),
  body('lastName').notEmpty().withMessage('Nom requis'),
  body('password').isLength({ min: 6 }).withMessage('Mot de passe minimum 6 caractères'),
  checkValidation,
  authController.completeRegistration
);

// ─────────────────────────────────────────────────────────────────────────────
// ROUTES EXISTANTES (inchangées)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Créer un compte (sans OTP — route conservée)
 *     tags: [Auth]
 *     security: []
 */
router.post(
  '/register',
  authLimiter,
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
 */
router.post(
  '/login',
  authLimiter,
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
 */
router.post('/logout', authenticate, authController.logout);

/**
 * @swagger
 * /api/auth/me:
 *   get:
 *     summary: Profil de l'utilisateur connecté
 *     tags: [Auth]
 */
router.get('/me', authenticate, authController.me);

/**
 * @swagger
 * /api/auth/switch-store:
 *   post:
 *     summary: Changer de boutique active
 *     tags: [Auth]
 */
router.post('/switch-store', authenticate, async (req, res, next) => {
  try {
    const { storeId } = req.body;
    if (!storeId) {
      return res.status(400).json({ message: 'storeId requis' });
    }

    if (req.user.role !== 'ADMIN') {
      const allowed = await getAccessibleStoreIds(req.user);
      if (!allowed.includes(storeId)) {
        return res.status(403).json({ message: 'Accès refusé à cette boutique' });
      }
    }

    const store = await prisma.store.findUnique({ where: { id: storeId } });
    if (!store || !store.isActive) {
      return res.status(404).json({ message: 'Boutique introuvable ou inactive' });
    }

    const token = signToken({
      id: req.user.id,
      email: req.user.email,
      role: req.user.role,
      activeStoreId: storeId,
    });

    res.json({ token, store });
  } catch (err) {
    next(err);
  }
});

module.exports = router;