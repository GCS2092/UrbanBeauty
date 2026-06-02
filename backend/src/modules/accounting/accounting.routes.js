// backend/src/modules/accounting/accounting.routes.js

const express = require('express');
const prisma = require('../../config/database');
const { isAdmin } = require('../../middlewares/auth.middleware');

const router = express.Router();

// GET /api/admin/accounting/dashboard
router.get('/dashboard', isAdmin, async (req, res) => {
  try {
    const {
      period = 'month',
      year = new Date().getFullYear(),
      month = new Date().getMonth() + 1,
    } = req.query;

    let startDate, endDate;
    if (period === 'month') {
      startDate = new Date(year, month - 1, 1);
      endDate   = new Date(year, month, 0, 23, 59, 59);
    } else if (period === 'year') {
      startDate = new Date(year, 0, 1);
      endDate   = new Date(year, 11, 31, 23, 59, 59);
    } else {
      startDate = new Date('2000-01-01');
      endDate   = new Date();
    }

    const [revenueResult, cogsResult, expensesResult, expensesByCategory, products] = await Promise.all([
      prisma.order.aggregate({
        where: { paymentStatus: 'PAID', createdAt: { gte: startDate, lte: endDate } },
        _sum: { total: true },
        _count: { id: true },
      }),
      prisma.stockMovement.aggregate({
        where: { type: 'OUT_SALE', createdAt: { gte: startDate, lte: endDate } },
        _sum: { totalCost: true },
      }),
      prisma.expense.aggregate({
        where: { date: { gte: startDate, lte: endDate } },
        _sum: { amount: true },
      }),
      prisma.expense.groupBy({
        by: ['category'],
        where: { date: { gte: startDate, lte: endDate } },
        _sum: { amount: true },
      }),
      prisma.product.findMany({
        where: { isActive: true },
        select: { id: true, stock: true, purchasePrice: true, price: true, name: true, lowStockAlert: true },
      }),
    ]);

    const stockValue       = products.reduce((acc, p) => acc + (p.purchasePrice || 0) * p.stock, 0);
    const stockRetailValue = products.reduce((acc, p) => acc + p.price * p.stock, 0);

    const lowStockProducts = products
      .filter((p) => p.stock <= p.lowStockAlert)
      .sort((a, b) => a.stock - b.stock)
      .slice(0, 10);

    // Évolution CA 6 derniers mois
    const last6Months = [];
    for (let i = 5; i >= 0; i--) {
      const d      = new Date();
      d.setMonth(d.getMonth() - i);
      const mStart = new Date(d.getFullYear(), d.getMonth(), 1);
      const mEnd   = new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59);
      const r      = await prisma.order.aggregate({
        where: { paymentStatus: 'PAID', createdAt: { gte: mStart, lte: mEnd } },
        _sum: { total: true },
      });
      last6Months.push({
        month:   mStart.toLocaleDateString('fr-FR', { month: 'short', year: '2-digit' }),
        revenue: r._sum.total || 0,
      });
    }

    const revenue     = revenueResult._sum.total || 0;
    const cogs        = cogsResult._sum.totalCost || 0;
    const expenses    = expensesResult._sum.amount || 0;
    const grossProfit = revenue - cogs;
    const netProfit   = grossProfit - expenses;
    const grossMargin = revenue > 0 ? ((grossProfit / revenue) * 100).toFixed(1) : 0;

    res.json({
      period: { startDate, endDate },
      revenue,
      cogs,
      expenses,
      grossProfit,
      netProfit,
      grossMargin,
      orderCount:    revenueResult._count.id,
      avgOrderValue: revenueResult._count.id > 0 ? Math.round(revenue / revenueResult._count.id) : 0,
      stockValue,
      stockRetailValue,
      stockMargin: stockRetailValue > 0
        ? (((stockRetailValue - stockValue) / stockRetailValue) * 100).toFixed(1)
        : 0,
      lowStockProducts,
      expensesByCategory,
      revenueChart: last6Months,
    });
  } catch (error) {
    console.error('[accounting/dashboard]', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// GET /api/admin/accounting/stock-movements
router.get('/stock-movements', isAdmin, async (req, res) => {
  try {
    const { page = 1, limit = 20, productId, type } = req.query;
    const skip  = (Number(page) - 1) * Number(limit);
    const where = {};
    if (productId) where.productId = productId;
    if (type)      where.type      = type;

    const [movements, total] = await Promise.all([
      prisma.stockMovement.findMany({
        where,
        include: {
          product:  { select: { name: true, slug: true } },
          supplier: { select: { name: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: Number(limit),
      }),
      prisma.stockMovement.count({ where }),
    ]);

    res.json({ movements, total, page: Number(page), pages: Math.ceil(total / Number(limit)) });
  } catch (error) {
    console.error('[accounting/stock-movements GET]', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// POST /api/admin/accounting/stock-movements
router.post('/stock-movements', isAdmin, async (req, res) => {
  try {
    const { productId, variantId, type, quantity, unitCost, reason, supplierId, reference, orderId } = req.body;

    if (!productId || !type || !quantity) {
      return res.status(400).json({ error: 'productId, type et quantity sont requis' });
    }

    const totalCost = unitCost ? Number(unitCost) * Number(quantity) : null;

    const movement = await prisma.stockMovement.create({
      data: {
        productId,
        variantId:  variantId  || null,
        type,
        quantity:   Number(quantity),
        unitCost:   unitCost   ? Number(unitCost)  : null,
        totalCost,
        reason:     reason     || null,
        supplierId: supplierId || null,
        reference:  reference  || null,
        orderId:    orderId    || null,
        createdBy:  req.user.id,
      },
    });

    const isIncoming  = ['IN', 'RETURN_IN', 'ADJUSTMENT'].includes(type);
    const stockDelta  = isIncoming ? Number(quantity) : -Number(quantity);

    if (variantId) {
      await prisma.productVariant.update({
        where: { id: variantId },
        data:  { stock: { increment: stockDelta } },
      });
    } else {
      await prisma.product.update({
        where: { id: productId },
        data:  { stock: { increment: stockDelta } },
      });
    }

    // Met à jour le prix d'achat sur entrée stock avec coût
    if (type === 'IN' && unitCost) {
      await prisma.product.update({
        where: { id: productId },
        data:  { purchasePrice: Number(unitCost) },
      });
    }

    res.json(movement);
  } catch (error) {
    console.error('[accounting/stock-movements POST]', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// GET /api/admin/accounting/expenses
router.get('/expenses', isAdmin, async (req, res) => {
  try {
    const { page = 1, limit = 20, category, startDate, endDate } = req.query;
    const skip  = (Number(page) - 1) * Number(limit);
    const where = {};
    if (category) where.category = category;
    if (startDate || endDate) {
      where.date = {};
      if (startDate) where.date.gte = new Date(startDate);
      if (endDate)   where.date.lte = new Date(endDate);
    }

    const [expenses, total] = await Promise.all([
      prisma.expense.findMany({
        where,
        include: { supplier: { select: { name: true } } },
        orderBy: { date: 'desc' },
        skip,
        take: Number(limit),
      }),
      prisma.expense.count({ where }),
    ]);

    res.json({ expenses, total, page: Number(page), pages: Math.ceil(total / Number(limit)) });
  } catch (error) {
    console.error('[accounting/expenses GET]', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// POST /api/admin/accounting/expenses
router.post('/expenses', isAdmin, async (req, res) => {
  try {
    const { category, label, amount, date, supplierId, reference, notes } = req.body;
    if (!category || !label || !amount || !date) {
      return res.status(400).json({ error: 'category, label, amount et date sont requis' });
    }
    const expense = await prisma.expense.create({
      data: {
        category,
        label,
        amount:     Number(amount),
        date:       new Date(date),
        supplierId: supplierId || null,
        reference:  reference  || null,
        notes:      notes      || null,
        createdBy:  req.user.id,
      },
    });
    res.json(expense);
  } catch (error) {
    console.error('[accounting/expenses POST]', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// PUT /api/admin/accounting/expenses/:id
router.put('/expenses/:id', isAdmin, async (req, res) => {
  try {
    const expense = await prisma.expense.update({
      where: { id: req.params.id },
      data:  req.body,
    });
    res.json(expense);
  } catch (error) {
    console.error('[accounting/expenses PUT]', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// DELETE /api/admin/accounting/expenses/:id
router.delete('/expenses/:id', isAdmin, async (req, res) => {
  try {
    await prisma.expense.delete({ where: { id: req.params.id } });
    res.json({ success: true });
  } catch (error) {
    console.error('[accounting/expenses DELETE]', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// GET /api/admin/accounting/suppliers
router.get('/suppliers', isAdmin, async (req, res) => {
  try {
    const suppliers = await prisma.supplier.findMany({
      where:   { isActive: true },
      orderBy: { name: 'asc' },
    });
    res.json(suppliers);
  } catch (error) {
    console.error('[accounting/suppliers GET]', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// POST /api/admin/accounting/suppliers
router.post('/suppliers', isAdmin, async (req, res) => {
  try {
    const { name, email, phone, address } = req.body;
    if (!name) return res.status(400).json({ error: 'Le nom est requis' });
    const supplier = await prisma.supplier.create({ data: { name, email, phone, address } });
    res.json(supplier);
  } catch (error) {
    console.error('[accounting/suppliers POST]', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// GET /api/admin/accounting/product-margins
router.get('/product-margins', isAdmin, async (req, res) => {
  try {
    const products = await prisma.product.findMany({
      where: { isActive: true },
      include: {
        category:   { select: { name: true } },
        orderItems: {
          where:  { order: { paymentStatus: 'PAID' } },
          select: { quantity: true, price: true, subtotal: true },
        },
      },
      orderBy: { name: 'asc' },
    });

    const result = products.map((p) => {
      const totalSold    = p.orderItems.reduce((acc, i) => acc + i.quantity, 0);
      const totalRevenue = p.orderItems.reduce((acc, i) => acc + i.subtotal, 0);
      const totalCost    = p.purchasePrice ? p.purchasePrice * totalSold : 0;
      const grossProfit  = totalRevenue - totalCost;
      const margin       = totalRevenue > 0 ? ((grossProfit / totalRevenue) * 100).toFixed(1) : null;

      return {
        id:            p.id,
        name:          p.name,
        category:      p.category.name,
        price:         p.price,
        purchasePrice: p.purchasePrice,
        stock:         p.stock,
        stockValue:    (p.purchasePrice || 0) * p.stock,
        totalSold,
        totalRevenue,
        totalCost,
        grossProfit,
        margin: margin ? Number(margin) : null,
      };
    });

    res.json(result);
  } catch (error) {
    console.error('[accounting/product-margins]', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// ============================================================
// AJOUTS À COLLER À LA FIN DE :
// backend/src/modules/accounting/accounting.routes.js
// (juste avant la ligne `module.exports = router;`)
// ============================================================

// PUT /api/admin/accounting/suppliers/:id
router.put('/suppliers/:id', isAdmin, async (req, res) => {
  try {
    const { name, email, phone, address } = req.body;
    const supplier = await prisma.supplier.update({
      where: { id: req.params.id },
      data: {
        ...(name    !== undefined && { name }),
        ...(email   !== undefined && { email }),
        ...(phone   !== undefined && { phone }),
        ...(address !== undefined && { address }),
      },
    });
    res.json(supplier);
  } catch (error) {
    if (error.code === 'P2025') return res.status(404).json({ error: 'Fournisseur introuvable' });
    console.error('[accounting/suppliers PUT]', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// PATCH /api/admin/accounting/suppliers/:id/toggle
// Active ou désactive un fournisseur
router.patch('/suppliers/:id/toggle', isAdmin, async (req, res) => {
  try {
    const existing = await prisma.supplier.findUnique({ where: { id: req.params.id } });
    if (!existing) return res.status(404).json({ error: 'Fournisseur introuvable' });

    const supplier = await prisma.supplier.update({
      where: { id: req.params.id },
      data:  { isActive: !existing.isActive },
    });
    res.json(supplier);
  } catch (error) {
    console.error('[accounting/suppliers PATCH toggle]', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// GET /api/admin/accounting/suppliers/all
// Retourne TOUS les fournisseurs (actifs + inactifs) pour la page de gestion
router.get('/suppliers/all', isAdmin, async (req, res) => {
  try {
    const suppliers = await prisma.supplier.findMany({
      orderBy: { name: 'asc' },
      include: {
        _count: {
          select: { stockEntries: true, expenses: true },
        },
      },
    });
    res.json(suppliers);
  } catch (error) {
    console.error('[accounting/suppliers/all GET]', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});
module.exports = router;