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
    include: {
      images: true,
      variants: true,
    },
  };

  const [total, products] = await Promise.all([
    prisma.product.count({ where: filters.where }),
    prisma.product.findMany(filters),
  ]);

  return buildPaginationResponse({ data: products, total, page, limit });
}

// ← NOUVEAU : tous les produits sans filtre isActive (admin uniquement)
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
    include: {
      images: true,
      variants: true,
      category: true,
    },
  });
}

async function createProduct(data) {
  const { images, ...productData } = data;

  return prisma.product.create({
    data: {
      ...productData,
      ...(images && images.length > 0 && {
        images: {
          create: images.map((img) => ({
            url: img.url,
            publicId: img.publicId || '',
            isMain: img.isMain ?? false,
            position: img.position ?? 0,
          })),
        },
      }),
    },
    include: { images: true, variants: true },
  });
}

async function updateProduct(id, data) {
  const { images, ...productData } = data;

  return prisma.product.update({
    where: { id },
    data: {
      ...productData,
      ...(images && images.length > 0 && {
        images: {
          deleteMany: {},
          create: images.map((img) => ({
            url: img.url,
            publicId: img.publicId || '',
            isMain: img.isMain ?? false,
            position: img.position ?? 0,
          })),
        },
      }),
    },
    include: { images: true, variants: true },
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