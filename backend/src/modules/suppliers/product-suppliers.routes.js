// backend/src/modules/suppliers/product-suppliers.routes.js

const express = require('express');
const { isAdmin } = require('../../middlewares/auth.middleware');
const {
  listProductsWithSuppliers,
  setProductSuppliers,
  bulkUpdateProductSuppliers,
} = require('./product-suppliers.service');

const router = express.Router();

const BULK_MODES = ['add', 'remove', 'replace'];

function normalizeIds(value) {
  if (!Array.isArray(value)) return null;
  const ids = value.filter((id) => typeof id === 'string' && id.trim().length > 0);
  return ids.length === value.length ? ids : null;
}

// GET /api/admin/product-suppliers
router.get('/', isAdmin, async (req, res) => {
  try {
    const { search, categoryId, supplierId, storeId, unassigned } = req.query;
    const products = await listProductsWithSuppliers({
      search: search?.trim() || undefined,
      categoryId: categoryId || undefined,
      supplierId: supplierId || undefined,
      storeId: storeId || undefined,
      unassigned: unassigned === 'true',
    });
    res.json(products);
  } catch (error) {
    console.error('[product-suppliers GET]', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// PUT /api/admin/product-suppliers/:productId
router.put('/:productId', isAdmin, async (req, res) => {
  try {
    const supplierIds = normalizeIds(req.body?.supplierIds);
    if (!supplierIds) {
      return res.status(400).json({ error: 'supplierIds doit être un tableau d’identifiants' });
    }
    const suppliers = await setProductSuppliers(req.params.productId, supplierIds);
    res.json({ productId: req.params.productId, suppliers });
  } catch (error) {
    if (error.status) return res.status(error.status).json({ error: error.message });
    console.error('[product-suppliers PUT]', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// POST /api/admin/product-suppliers/bulk
router.post('/bulk', isAdmin, async (req, res) => {
  try {
    const productIds = normalizeIds(req.body?.productIds);
    const supplierIds = normalizeIds(req.body?.supplierIds);
    const mode = req.body?.mode || 'add';

    if (!productIds || productIds.length === 0) {
      return res.status(400).json({ error: 'Aucun produit sélectionné' });
    }
    if (!supplierIds) {
      return res.status(400).json({ error: 'supplierIds doit être un tableau d’identifiants' });
    }
    if (!BULK_MODES.includes(mode)) {
      return res.status(400).json({ error: 'Mode invalide' });
    }
    if (mode !== 'replace' && supplierIds.length === 0) {
      return res.status(400).json({ error: 'Aucun fournisseur sélectionné' });
    }

    const result = await bulkUpdateProductSuppliers({ productIds, supplierIds, mode });
    res.json(result);
  } catch (error) {
    if (error.status) return res.status(error.status).json({ error: error.message });
    console.error('[product-suppliers BULK]', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

module.exports = router;
