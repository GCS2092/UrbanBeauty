const prisma = require('../../config/database');
const { parsePagination, buildPaginationResponse } = require('../../utils/pagination.utils');
const {
  buildProductStoreFilter,
  buildAdminCatalogWhere,
  isProductVisibleForStore,
  resolveStoreIdForCatalog,
} = require('../stores/store.service');
async function getProducts(query) {
  const { page, limit, skip } = parsePagination(query);

  const storeId = await resolveStoreIdForCatalog(query.storeId);
  const storeFilter = buildProductStoreFilter(storeId);

  const where = {
    isActive: true,
    ...storeFilter,
    ...(query.featured === 'true' || query.featured === true ? { isFeatured: true } : {}),
    ...(query.category && { category: { slug: query.category } }),
    ...(query.search && {
      OR: [
        { name: { contains: query.search, mode: 'insensitive' } },
        { description: { contains: query.search, mode: 'insensitive' } },
      ],
    }),
  };

  const [total, products] = await Promise.all([
    prisma.product.count({ where }),
    prisma.product.findMany({
      where,
      skip,
      take: limit,
      include: { images: true, variants: true, category: true },
      orderBy: { createdAt: 'desc' },
    }),
  ]);

  return buildPaginationResponse({ data: products, total, page, limit });
}

// ─── Admin : tous les produits ────────────────────────────────────────────────
async function getAllProductsAdmin(query, accessibleStoreIds = null) {
  const { page, limit, skip } = parsePagination(query);

  const where = {
    ...buildAdminCatalogWhere(query.storeId, accessibleStoreIds),
    ...(query.search && {
      OR: [
        { name: { contains: query.search, mode: 'insensitive' } },
        { description: { contains: query.search, mode: 'insensitive' } },
      ],
    }),
  };

  const [total, products] = await Promise.all([
    prisma.product.count({ where }),
    prisma.product.findMany({
      where,
      skip,
      take: limit,
      include: {
        images: true,
        variants: true,
        category: true,
        store: { select: { id: true, name: true, code: true } },
      },
      orderBy: { name: 'asc' },
    }),
  ]);

  return buildPaginationResponse({ data: products, total, page, limit });
}

async function getProductBySlug(slug, query = {}) {
  const product = await prisma.product.findUnique({
    where: { slug },
    include: { images: true, variants: true, category: true },
  });

  if (!product || !product.isActive) return null;

  const storeId = await resolveStoreIdForCatalog(query.storeId);
  if (!isProductVisibleForStore(product.storeId, storeId)) return null;

  return product;
}

async function createProduct(data) {
  const { images = [], variants = [], variantDisplayMode, storeId, ...productData } = data;

  return prisma.product.create({
    data: {
      ...productData,
      storeId: storeId || null,
      variantDisplayMode: variantDisplayMode || 'SIZE_FIRST',
      ...(images.length > 0 && {
        images: {
          create: images.map((img) => ({
            url: img.url,
            publicId: img.publicId || '',
            isMain: img.isMain ?? false,
            position: img.position ?? 0,
            color: img.color || null,
          })),
        },
      }),
      ...(variants.length > 0 && {
        variants: {
          create: variants.map((v) => ({
            size: v.size || '',
            color: v.color || '',
            stock: Number(v.stock) || 0,
          })),
        },
      }),
    },
    include: { images: true, variants: true },
  });
}

async function updateProduct(id, data) {
  const { images = [], variants = [], variantDisplayMode, storeId, ...productData } = data;

  const existing = await prisma.product.findUnique({
    where: { id },
    include: { variants: true },
  });

  const existingVariantIds = existing?.variants.map((v) => v.id) || [];
  const incomingIds = variants.filter((v) => v.id).map((v) => v.id);
  const toDelete = existingVariantIds.filter((vid) => !incomingIds.includes(vid));

  return prisma.$transaction(async (tx) => {
    if (toDelete.length > 0) {
      await tx.productVariant.deleteMany({ where: { id: { in: toDelete } } });
    }

    for (const v of variants) {
      if (v.id) {
        await tx.productVariant.update({
          where: { id: v.id },
          data: { size: v.size || '', color: v.color || '', stock: Number(v.stock) || 0 },
        });
      } else {
        await tx.productVariant.create({
          data: { productId: id, size: v.size || '', color: v.color || '', stock: Number(v.stock) || 0 },
        });
      }
    }

    await tx.productImage.deleteMany({ where: { productId: id } });
    if (images.length > 0) {
      await tx.productImage.createMany({
        data: images.map((img) => ({
          productId: id,
          url: img.url,
          publicId: img.publicId || '',
          isMain: img.isMain ?? false,
          position: img.position ?? 0,
          color: img.color || null,
        })),
      });
    }

    return tx.product.update({
      where: { id },
      data: {
        ...productData,
        // FIX 2 : ne PAS écraser storeId si non envoyé depuis le formulaire
        // storeId: storeId || null  ← ANCIEN CODE : écrasait à null si storeId absent
        // NOUVEAU : on ne touche à storeId QUE s'il est explicitement présent dans data
        ...(storeId !== undefined && { storeId: storeId || null }),
        ...(variantDisplayMode && { variantDisplayMode }),
      },
      include: { images: true, variants: true },
    });
  });
}

async function deleteProduct(id) {
  return prisma.product.delete({ where: { id } });
}

module.exports = {
  getProducts,
  getAllProductsAdmin,
  getProductBySlug,
  createProduct,
  updateProduct,
  deleteProduct,
};