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
  return prisma.product.create({
    data,
  });
}

async function updateProduct(id, data) {
  return prisma.product.update({
    where: { id },
    data,
  });
}

async function deleteProduct(id) {
  return prisma.product.delete({ where: { id } });
}

module.exports = {
  getProducts,
  getProductBySlug,
  createProduct,
  updateProduct,
  deleteProduct,
};
