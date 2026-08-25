const express = require('express');
const router = express.Router();
const sellersController = require('./sellers.controller');
const { authenticate } = require('../../middlewares/auth.middleware');
const { requireSeller } = require('../../middlewares/seller.middleware');

// Authentification + rôle vendeur requis
router.use(authenticate, requireSeller);

router.get('/stats', sellersController.getDashboardStats);
router.get('/products', sellersController.getMyProducts);
router.get('/orders', sellersController.getMyOrders);
router.get('/stock', sellersController.getMyStock);

module.exports = router;
