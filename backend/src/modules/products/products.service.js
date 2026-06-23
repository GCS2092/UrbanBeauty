const prisma = require('../../config/database');
const { parsePagination, buildPaginationResponse } = require('../../utils/pagination.utils');

async function getProducts(query) {
  const { page, limit, skip } = parsePagination(query);
  const filters = {
    where: {
      isActive: true,
      ...(query.category && { category: { slug: query.category } }),
      ...(query.search && {
        OR: [
          { name: { contains: query.search, mode: 'insensitive' } },
          { description: { contains: query.search, mode: 'insensitive' } },
        ],
      }),
    },
    skip,
    take: limit,
    include: { images: true, variants: true },
  };

  const [total, products] = await Promise.all([
    prisma.product.count({ where: filters.where }),
    prisma.product.findMany(filters),
  ]);

  return buildPaginationResponse({ data: products, total, page, limit });
}

async function getAllProductsAdmin(query) {
  const { page, limit, skip } = parsePagination(query);
  const where = {
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
      orderBy: { name: 'asc' },
    }),
  ]);

  return buildPaginationResponse({ data: products, total, page, limit });
}

async function getProductBySlug(slug) {
  return prisma.product.findUnique({
    where: { slug },
    include: { images: true, variants: true, category: true },
  });
}

async function createProduct(data) {
  const { images = [], variants = [], variantDisplayMode, ...productData } = data;

  return prisma.product.create({
    data: {
      ...productData,
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
  const { images = [], variants = [], variantDisplayMode, ...productData } = data;

  // Récupérer les variantes existantes pour gérer les mises à jour
  const existing = await prisma.product.findUnique({
    where: { id },
    include: { variants: true },
  });

  const existingVariantIds = existing?.variants.map((v) => v.id) || [];
  const incomingIds = variants.filter((v) => v.id).map((v) => v.id);
  const toDelete = existingVariantIds.filter((vid) => !incomingIds.includes(vid));

  return prisma.$transaction(async (tx) => {
    // Supprimer variantes retirées
    if (toDelete.length > 0) {
      await tx.productVariant.deleteMany({ where: { id: { in: toDelete } } });
    }

    // Upsert chaque variante
    for (const v of variants) {
      if (v.id) {
        await tx.productVariant.update({
          where: { id: v.id },
          data: {
            size: v.size || '',
            color: v.color || '',
            stock: Number(v.stock) || 0,
          },
        });
      } else {
        await tx.productVariant.create({
          data: {
            productId: id,
            size: v.size || '',
            color: v.color || '',
            stock: Number(v.stock) || 0,
          },
        });
      }
    }

    // Remplacer les images
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