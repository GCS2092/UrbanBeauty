const prisma = require('../../config/database');

// Vérifie si le stock est suffisant pour tous les items
async function checkStock(items) {
  const errors = [];

  for (const item of items) {
    const product = await prisma.product.findUnique({
      where: { id: item.productId },
      include: { variants: true },
    });

    if (!product) {
      errors.push(`Produit introuvable : ${item.productId}`);
      continue;
    }

    // Si l'item a une variante
    if (item.variantId) {
      const variant = product.variants.find(v => v.id === item.variantId);
      if (!variant) {
        errors.push(`Variante introuvable pour ${product.name}`);
        continue;
      }
      if (variant.stock < item.quantity) {
        errors.push(`Stock insuffisant pour ${product.name} (${variant.size}/${variant.color}) — disponible : ${variant.stock}`);
      }
    } else {
      // Stock global du produit
      if (product.stock < item.quantity) {
        errors.push(`Stock insuffisant pour ${product.name} — disponible : ${product.stock}`);
      }
    }
  }

  return errors;
}

// Décrémente le stock après confirmation
async function decrementStock(items) {
  for (const item of items) {
    if (item.variantId) {
      await prisma.productVariant.update({
        where: { id: item.variantId },
        data: { stock: { decrement: item.quantity } },
      });
    }

    // Toujours décrémenter le stock global aussi
    await prisma.product.update({
      where: { id: item.productId },
      data: { stock: { decrement: item.quantity } },
    });
  }
}

// Réincrémente le stock si commande annulée/rejetée
async function incrementStock(items) {
  for (const item of items) {
    if (item.variantId) {
      await prisma.productVariant.update({
        where: { id: item.variantId },
        data: { stock: { increment: item.quantity } },
      });
    }

    await prisma.product.update({
      where: { id: item.productId },
      data: { stock: { increment: item.quantity } },
    });
  }
}

module.exports = { checkStock, decrementStock, incrementStock };