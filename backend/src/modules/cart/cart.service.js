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

  await Promise.all(
    guestCart.items.map(async (item) => {
      const existingItem = await prisma.cartItem.findFirst({
        where: {
          cartId: userCart.id,
          productId: item.productId,
          variantId: item.variantId,
        },
      });

      if (existingItem) {
        return prisma.cartItem.update({
          where: { id: existingItem.id },
          data: { quantity: existingItem.quantity + item.quantity },
        });
      }
      return prisma.cartItem.create({
        data: {
          cartId: userCart.id,
          productId: item.productId,
          variantId: item.variantId,
          quantity: item.quantity,
        },
      });
    })
  );

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
    const userExists = await prisma.user.findUnique({ where: { id: userId } });
    if (!userExists) {
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
          product: {
            select: {
              id: true,
              name: true,
              slug: true,
              price: true,
              comparePrice: true,
              stock: true,
              reservedStock: true,
              images: { where: { isMain: true }, take: 1 },
            },
          },
          variant: true,
        },
      },
    },
  });
}

// ✅ Stock réellement disponible = stock - reservedStock (les réservations en cours ne sont pas vendables)
async function getAvailableStock(productId, variantId) {
  if (variantId) {
    const variant = await prisma.productVariant.findUnique({
      where: { id: variantId },
      select: { stock: true, reservedStock: true },
    });
    if (!variant) {
      const error = new Error('Variante introuvable.');
      error.status = 404;
      throw error;
    }
    return variant.stock - variant.reservedStock;
  }

  const product = await prisma.product.findUnique({
    where: { id: productId },
    select: { stock: true, reservedStock: true },
  });
  if (!product) {
    const error = new Error('Produit introuvable.');
    error.status = 404;
    throw error;
  }
  return product.stock - product.reservedStock;
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

  // ✅ Vérifie le stock disponible avant d'ajouter (quantité existante + nouvelle demande)
  const requestedQuantity = (existingItem?.quantity || 0) + (data.quantity || 1);
  const available = await getAvailableStock(data.productId, data.variantId);
  if (requestedQuantity > available) {
    const error = new Error(`Stock insuffisant. ${available} disponible(s).`);
    error.status = 400;
    throw error;
  }

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
  const item = await prisma.cartItem.findUnique({ where: { id: itemId } });
  if (!item) {
    const error = new Error('Article introuvable.');
    error.status = 404;
    throw error;
  }

  // ✅ Vérifie le stock disponible avant de mettre à jour la quantité
  const available = await getAvailableStock(item.productId, item.variantId);
  if (data.quantity > available) {
    const error = new Error(`Stock insuffisant. ${available} disponible(s).`);
    error.status = 400;
    throw error;
  }

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
  getAvailableStock,
};