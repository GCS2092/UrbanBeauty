const bcrypt = require('bcryptjs');
const prisma = require('../../config/database');

async function getUserById(id) {
  return prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      phone: true,
      role: true,
    },
  });
}

// ✅ Fonction manquante à ajouter
async function getAllUsers(query = {}) {
  const page = Math.max(1, parseInt(query.page) || 1);
  const limit = Math.min(100, parseInt(query.limit) || 50);
  const skip = (page - 1) * limit;
  const search = query.search || '';

  const where = search
    ? {
        OR: [
          { email: { contains: search, mode: 'insensitive' } },
          { firstName: { contains: search, mode: 'insensitive' } },
          { lastName: { contains: search, mode: 'insensitive' } },
        ],
      }
    : {};

  const [total, users] = await Promise.all([
    prisma.user.count({ where }),
    prisma.user.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        role: true,
        createdAt: true,
        _count: { select: { orders: true } },
      },
    }),
  ]);

  return { data: users, total, page, limit, totalPages: Math.ceil(total / limit) };
}

async function updateUser(id, data) {
  const updateData = { ...data };

  if (data.password) {
    updateData.password = await bcrypt.hash(data.password, 10);
  }

  if (data.email) {
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email },
    });
    if (existingUser && existingUser.id !== id) {
      const error = new Error('Cet email est déjà utilisé.');
      error.status = 400;
      throw error;
    }
  }

  return prisma.user.update({
    where: { id },
    data: updateData,
  });
}

// ✅ Les 3 fonctions exportées
module.exports = { getUserById, getAllUsers, updateUser };
