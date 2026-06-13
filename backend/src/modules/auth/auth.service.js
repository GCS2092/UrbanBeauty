const bcrypt = require('bcryptjs');
const prisma = require('../../config/database');
const { signToken } = require('../../utils/jwt.utils');
const { getAccessibleStoreIds } = require('../stores/store.service');

async function register({ email, password, firstName, lastName, phone }) {
  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    const error = new Error('Cet email est deja utilise.');
    error.status = 400;
    throw error;
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      firstName,
      lastName,
      phone,
    },
  });

  return {
    id: user.id,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    role: user.role,
  };
}

async function login({ email, password }) {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    const error = new Error('Email ou mot de passe incorrect.');
    error.status = 401;
    throw error;
  }

  const isValid = await bcrypt.compare(password, user.password);
  if (!isValid) {
    const error = new Error('Email ou mot de passe incorrect.');
    error.status = 401;
    throw error;
  }

  // Rattacher les commandes invité au compte
  await prisma.order.updateMany({
    where: { guestEmail: email, userId: null },
    data: { userId: user.id },
  });

  const storeIds = await getAccessibleStoreIds(user);

  const activeStoreId = user.role === 'ADMIN' ? null : (storeIds[0] || null);

  const token = signToken({
    id: user.id,
    email: user.email,
    role: user.role,
    activeStoreId,
  });

  let stores = [];
  if (storeIds.length) {
    stores = await prisma.store.findMany({
      where: { id: { in: storeIds } },
      orderBy: [{ isMain: 'desc' }, { name: 'asc' }],
    });
  }

  return {
    token,
    user: {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
    },
    stores,
  };
}

module.exports = {
  register,
  login,
};