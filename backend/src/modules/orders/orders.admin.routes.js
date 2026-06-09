const express = require('express');
const router = express.Router();
const { authenticate } = require('../../middlewares/auth.middleware');
const requireAdmin = require('../../middlewares/admin.middleware');
const { getOrdersAdmin, updatePaymentStatus, confirmDraftOrder } = require('./orders.admin.controller');

router.use(authenticate, requireAdmin); // toutes les routes admin protégées

router.get('/', getOrdersAdmin);
router.patch('/:id/payment', updatePaymentStatus);
router.patch('/:id/confirm-draft', confirmDraftOrder);
module.exports = router;
