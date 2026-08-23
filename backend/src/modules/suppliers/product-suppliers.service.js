// backend/src/modules/suppliers/product-suppliers.service.js
// Associations produit <-> fournisseur. Donnée strictement interne (admin + mails admin).

const prisma = require('../../config/database');

const SUPPLIER_SELECT = {
  id: true,
  name: true,
  phone: true,
  email: true,
  isActive: true,
};

/** Produits (avec catégorie et fournisseurs liés) pour la page admin de liaison. */
async function listProductsWithSuppliers({ search, categoryId, supplierId, storeId, unassigned }) {
  const where = {};

  if (search) {
    where.OR = [
      { name: { contains: search } },
      { slug: { contains: search } },
    ];
  }
  if (categoryId) where.categoryId = categoryId;
  if (storeId) where.storeId = storeId;
  if (supplierId) where.suppliers = { some: { supplierId } };
  if (unassigned) where.suppliers = { none: {} };

  const products = await prisma.product.findMany({
    where,
    select: {
      id: true,
      name: true,
      slug: true,
      isActive: true,
      stock: true,
      storeId: true,
      category: { select: { id: true, name: true } },
      suppliers: {
        select: { supplierId: true, supplier: { select: SUPPLIER_SELECT } },
      },
    },
    orderBy: [{ category: { name: 'asc' } }, { name: 'asc' }],
  });

  return products.map(({ suppliers, ...product }) => ({
    ...product,
    suppliers: suppliers.map((link) => link.supplier),
  }));
}

/** Remplace l'intégralité des fournisseurs d'un produit (liste vide = aucun fournisseur). */
async function setProductSuppliers(productId, supplierIds) {
  const product = await prisma.product.findUnique({ where: { id: productId }, select: { id: true } });
  if (!product) {
    const error = new Error('Produit introuvable');
    error.status = 404;
    throw error;
  }

  const uniqueIds = [...new Set(supplierIds)];
  if (uniqueIds.length > 0) {
    const found = await prisma.supplier.findMany({
      where: { id: { in: uniqueIds } },
      select: { id: true },
    });
    if (found.length !== uniqueIds.length) {
      const error = new Error('Un ou plusieurs fournisseurs sont introuvables');
      error.status = 400;
      throw error;
    }
  }

  await prisma.$transaction([
    prisma.productSupplier.deleteMany({ where: { productId } }),
    ...(uniqueIds.length
      ? [prisma.productSupplier.createMany({
        data: uniqueIds.map((supplierId) => ({ productId, supplierId })),
      })]
      : []),
  ]);

  const links = await prisma.productSupplier.findMany({
    where: { productId },
    select: { supplier: { select: SUPPLIER_SELECT } },
  });
  return links.map((link) => link.supplier);
}

/** Applique une action de masse sur plusieurs produits (add / remove / replace). */
async function bulkUpdateProductSuppliers({ productIds, supplierIds, mode = 'add' }) {
  const uniqueProductIds = [...new Set(productIds)];
  const uniqueSupplierIds = [...new Set(supplierIds)];

  if (mode !== 'remove' && uniqueSupplierIds.length > 0) {
    const found = await prisma.supplier.findMany({
      where: { id: { in: uniqueSupplierIds } },
      select: { id: true },
    });
    if (found.length !== uniqueSupplierIds.length) {
      const error = new Error('Un ou plusieurs fournisseurs sont introuvables');
      error.status = 400;
      throw error;
    }
  }

  const operations = [];

  if (mode === 'replace') {
    operations.push(prisma.productSupplier.deleteMany({ where: { productId: { in: uniqueProductIds } } }));
  }
  if (mode === 'remove') {
    operations.push(prisma.productSupplier.deleteMany({
      where: { productId: { in: uniqueProductIds }, supplierId: { in: uniqueSupplierIds } },
    }));
  }
  if (mode !== 'remove' && uniqueSupplierIds.length > 0) {
    const data = [];
    uniqueProductIds.forEach((productId) => {
      uniqueSupplierIds.forEach((supplierId) => data.push({ productId, supplierId }));
    });
    operations.push(prisma.productSupplier.createMany({ data, skipDuplicates: true }));
  }

  await prisma.$transaction(operations);
  return { products: uniqueProductIds.length, suppliers: uniqueSupplierIds.length, mode };
}

/**
 * Regroupe les lignes d'une commande par fournisseur.
 * Les articles sans fournisseur configuré sont retournés dans `unassignedItems`.
 */
async function buildOrderSupplierSummary(items = []) {
  const productIds = [...new Set(items.map((item) => item.productId).filter(Boolean))];
  if (productIds.length === 0) return { suppliers: [], unassignedItems: [] };

  const links = await prisma.productSupplier.findMany({
    where: { productId: { in: productIds } },
    select: { productId: true, supplier: { select: SUPPLIER_SELECT } },
  });

  const byProduct = new Map();
  links.forEach(({ productId, supplier }) => {
    if (!byProduct.has(productId)) byProduct.set(productId, []);
    byProduct.get(productId).push(supplier);
  });

  const suppliers = new Map();
  const unassignedItems = [];

  items.forEach((item) => {
    const productSuppliers = byProduct.get(item.productId) || [];
    const itemInfo = {
      productId: item.productId,
      productName: item.productName,
      variantLabel: item.variantLabel || null,
      quantity: item.quantity,
    };

    if (productSuppliers.length === 0) {
      unassignedItems.push(itemInfo);
      return;
    }

    productSuppliers.forEach((supplier) => {
      if (!suppliers.has(supplier.id)) {
        suppliers.set(supplier.id, { ...supplier, items: [] });
      }
      suppliers.get(supplier.id).items.push(itemInfo);
    });
  });

  return {
    suppliers: [...suppliers.values()].sort((a, b) => a.name.localeCompare(b.name)),
    unassignedItems,
  };
}

module.exports = {
  listProductsWithSuppliers,
  setProductSuppliers,
  bulkUpdateProductSuppliers,
  buildOrderSupplierSummary,
};
