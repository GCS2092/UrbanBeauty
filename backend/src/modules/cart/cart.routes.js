const express = require('express');
const cartController = require('./cart.controller');
const { apiLimiter } = require('../../middlewares/rateLimit.middleware');

const router = express.Router();

/**
 * @swagger
 * /api/cart:
 *   get:
 *     summary: Voir le panier
 *     tags: [Panier]
 *     security: []
 *     parameters:
 *       - in: query
 *         name: anonymousId
 *         schema: { type: string }
 *         description: ID anonyme pour les visiteurs
 *     responses:
 *       200:
 *         description: Contenu du panier
 */
router.get('/', apiLimiter, cartController.getCart);

/**
 * @swagger
 * /api/cart/items:
 *   post:
 *     summary: Ajouter un article au panier
 *     tags: [Panier]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           example:
 *             productId: "clxxxxxx"
 *             variantId: "clxxxxxx"
 *             quantity: 1
 *             anonymousId: "anon-123"
 *     responses:
 *       200:
 *         description: Article ajouté
 */
router.post('/items', apiLimiter, cartController.addItem);

/**
 * @swagger
 * /api/cart/items/{itemId}:
 *   put:
 *     summary: Modifier la quantité d'un article
 *     tags: [Panier]
 *     security: []
 *     parameters:
 *       - in: path
 *         name: itemId
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       content:
 *         application/json:
 *           example:
 *             quantity: 3
 *     responses:
 *       200:
 *         description: Article modifié
 */
router.put('/items/:itemId', apiLimiter, cartController.updateItem);

/**
 * @swagger
 * /api/cart/items/{itemId}:
 *   delete:
 *     summary: Supprimer un article du panier
 *     tags: [Panier]
 *     security: []
 *     parameters:
 *       - in: path
 *         name: itemId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       204:
 *         description: Article supprimé
 */
router.delete('/items/:itemId', apiLimiter, cartController.removeItem);

/**
 * @swagger
 * /api/cart:
 *   delete:
 *     summary: Vider le panier
 *     tags: [Panier]
 *     security: []
 *     responses:
 *       200:
 *         description: Panier vidé
 */
router.delete('/', apiLimiter, cartController.clearCart);

module.exports = router;