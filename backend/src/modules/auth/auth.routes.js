const express = require('express');
const { body } = require('express-validator');
const { authController } = require('./auth.controller');
const { checkValidation } = require('../../middlewares/validation.middleware');
const { authLimiter } = require('../../middlewares/rateLimit.middleware');
const { authenticate } = require('../../middlewares/auth.middleware');

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

module.exports = router;
