const express = require('express');
const usersController = require('./users.controller');
const authenticate = require('../../middlewares/auth.middleware');

const router = express.Router();

/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: Mon profil complet
 *     tags: [Utilisateurs]
 *     responses:
 *       200:
 *         description: Données utilisateur
 */
router.get('/', authenticate, usersController.getCurrentUser);

/**
 * @swagger
 * /api/users:
 *   put:
 *     summary: Modifier mon profil
 *     tags: [Utilisateurs]
 *     requestBody:
 *       content:
 *         application/json:
 *           example:
 *             firstName: Fatou
 *             lastName: Sow
 *             phone: "+221780000002"
 *     responses:
 *       200:
 *         description: Profil mis à jour
 */
router.put('/', authenticate, usersController.updateCurrentUser);

module.exports = router;