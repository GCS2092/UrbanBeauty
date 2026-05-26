const prisma = require('../../config/database');

async function getCategories() {
  return prisma.category.findMany({ orderBy: { name: 'asc' } });
}

async function createCategory(data) {
  return prisma.category.create({ data });
}

async function updateCategory(id, data) {
  return prisma.category.update({ where: { id }, data });
}

async function deleteCategory(id) {
  return prisma.category.delete({ where: { id } });
}

module.exports = {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
};
