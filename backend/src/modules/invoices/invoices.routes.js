const express = require('express');
const { isAdmin } = require('../../middlewares/auth.middleware');
const invoicesController = require('./invoices.controller');

const router = express.Router();

router.get('/export/excel', isAdmin, invoicesController.exportInvoicesExcel);
router.get('/', isAdmin, invoicesController.listInvoices);
router.get('/order/:orderId', isAdmin, invoicesController.getInvoiceByOrder);
router.get('/:id/pdf', isAdmin, invoicesController.downloadInvoicePdf);
router.get('/:id', isAdmin, invoicesController.getInvoiceById);

module.exports = router;
