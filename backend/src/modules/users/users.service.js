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

module.exports = {
  getUserById,
  updateUser,
};
