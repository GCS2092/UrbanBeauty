const prisma = require('../../config/database');

async function mergeGuestCart(userId, anonymousId) {
  const guestCart = await prisma.cart.findUnique({ where: { anonymousId }, include: { items: true } });
  if (!guestCart) {
    return null;
  }

  let userCart = await prisma.cart.findFirst({ where: { userId } });
  if (!userCart) {
    userCart = await prisma.cart.create({ data: { userId } });
  }

  for (const item of guestCart.items) {
    const existingItem = await prisma.cartItem.findFirst({
      where: {
        cartId: userCart.id,
        productId: item.productId,
        variantId: item.variantId,
      },
    });

    if (existingItem) {
      await prisma.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: existingItem.quantity + item.quantity },
      });
    } else {
      await prisma.cartItem.create({
        data: {
          cartId: userCart.id,
          productId: item.productId,
          variantId: item.variantId,
          quantity: item.quantity,
        },
      });
    }
  }

  await prisma.cartItem.deleteMany({ where: { cartId: guestCart.id } });
  await prisma.cart.delete({ where: { id: guestCart.id } });
  return userCart;
}

async function findOrCreateCart({ userId, anonymousId }) {
  if (userId && anonymousId) {
    const mergedCart = await mergeGuestCart(userId, anonymousId);
    if (mergedCart) return mergedCart;
  }

  if (userId) {
    // ✅ Vérifie que le user existe avant de créer le cart
    const userExists = await prisma.user.findUnique({ where: { id: userId } });
    if (!userExists) {
      // User fantôme en localStorage → fallback anonyme
      if (anonymousId) {
        let cart = await prisma.cart.findUnique({ where: { anonymousId } });
        if (!cart) cart = await prisma.cart.create({ data: { anonymousId } });
        return cart;
      }
      return prisma.cart.create({ data: {} });
    }

    let cart = await prisma.cart.findFirst({ where: { userId } });
    if (!cart) cart = await prisma.cart.create({ data: { userId } });
    return cart;
  }

  if (anonymousId) {
    let cart = await prisma.cart.findUnique({ where: { anonymousId } });
    if (!cart) cart = await prisma.cart.create({ data: { anonymousId } });
    return cart;
  }

  return prisma.cart.create({ data: {} });
}

async function getCart(query) {
  const cart = await findOrCreateCart(query);
  return prisma.cart.findUnique({
    where: { id: cart.id },
    include: {
  items: {
    include: {
      product: { include: { images: true } },
      variant: true,
    },
  },
},
  });
}

async function addItem(data) {
  const cart = await findOrCreateCart(data);
  const existingItem = await prisma.cartItem.findFirst({
    where: {
      cartId: cart.id,
      productId: data.productId,
      variantId: data.variantId,
    },
  });

  if (existingItem) {
    return prisma.cartItem.update({
      where: { id: existingItem.id },
      data: { quantity: existingItem.quantity + (data.quantity || 1) },
    });
  }

  return prisma.cartItem.create({
    data: {
      cartId: cart.id,
      productId: data.productId,
      variantId: data.variantId,
      quantity: data.quantity || 1,
    },
  });
}

async function updateItem(itemId, data) {
  return prisma.cartItem.update({
    where: { id: itemId },
    data: { quantity: data.quantity },
  });
}

async function removeItem(itemId) {
  return prisma.cartItem.delete({ where: { id: itemId } });
}

async function clearCart(query) {
  const cart = await findOrCreateCart(query);
  await prisma.cartItem.deleteMany({ where: { cartId: cart.id } });
}

module.exports = {
  getCart,
  addItem,
  updateItem,
  removeItem,
  clearCart,
};
