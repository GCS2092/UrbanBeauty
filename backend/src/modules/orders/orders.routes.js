const express = require('express');
const ordersController = require('./orders.controller');
const { authenticate } = require('../../middlewares/auth.middleware');
const requireAdmin = require('../../middlewares/admin.middleware');
const { apiLimiter } = require('../../middlewares/rateLimit.middleware');

const router = express.Router();

/**
 * @swagger
 * /api/orders:
 *   post:
 *     summary: Créer une commande
 *     tags: [Commandes]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           example:
 *             paymentMethod: MOBILE_MONEY
 *             shippingCost: 2000
 *             guestEmail: client@test.com
 *             guestName: Aminata Diallo
 *             guestPhone: "+221770000001"
 *             shippingAddress:
 *               fullName: Aminata Diallo
 *               phone: "+221770000001"
 *               street: Rue 10 Almadies
 *               city: Dakar
 *               country: Sénégal
 *             items:
 *               - productId: "clxxxxxx"
 *                 productName: Robe Wax
 *                 price: 25000
 *                 quantity: 1
 *     responses:
 *       201:
 *         description: Commande créée
 */
router.post('/', apiLimiter, ordersController.createOrder);

/**
 * @swagger
 * /api/orders/admin/all:
 *   get:
 *     summary: Toutes les commandes (Admin)
 *     tags: [Commandes]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer }
 *       - in: query
 *         name: limit
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Liste paginée
 */
router.get('/admin/all', authenticate, requireAdmin, ordersController.getAllOrders);

/**
 * @swagger
 * /api/orders:
 *   get:
 *     summary: Mes commandes (client connecté)
 *     tags: [Commandes]
 *     responses:
 *       200:
 *         description: Liste des commandes
 */
router.get('/', authenticate, ordersController.getUserOrders);

/**
 * @swagger
 * /api/orders/{orderNumber}:
 *   get:
 *     summary: Détail d'une commande par numéro
 *     tags: [Commandes]
 *     security: []
 *     parameters:
 *       - in: path
 *         name: orderNumber
 *         required: true
 *         schema: { type: string }
 *         example: UB-2024-001
 *     responses:
 *       200:
 *         description: Commande trouvée
 */
router.get('/:orderNumber', apiLimiter, ordersController.getOrderByNumber);

/**
 * @swagger
 * /api/orders/{id}/status:
 *   put:
 *     summary: Changer le statut d'une commande (Admin)
 *     tags: [Commandes]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       content:
 *         application/json:
 *           example:
 *             status: CONFIRMED
 *             message: Commande confirmée par l'admin
 *             location: Dakar
 *     responses:
 *       200:
 *         description: Statut mis à jour
 */
router.put('/:id/status', authenticate, requireAdmin, ordersController.changeOrderStatus);

module.exports = router;
