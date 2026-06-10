const prisma = require('../../config/database');

function availableQty(stock, reservedStock) {
  return Math.max(0, stock - (reservedStock || 0));
}

async function loadItemStock(item) {
  if (item.variantId) {
    const variant = await prisma.productVariant.findUnique({
      where: { id: item.variantId },
      include: { product: { select: { id: true, name: true } } },
    });
    if (!variant) return null;
    return {
      productId: variant.productId,
      productName: variant.product.name,
      variantId: variant.id,
      stock: variant.stock,
      reservedStock: variant.reservedStock,
      purchasePrice: variant.product?.purchasePrice,
    };
  }

  const product = await prisma.product.findUnique({ where: { id: item.productId } });
  if (!product) return null;
  return {
    productId: product.id,
    productName: product.name,
    variantId: null,
    stock: product.stock,
    reservedStock: product.reservedStock,
    purchasePrice: product.purchasePrice,
  };
}

async function checkStock(items) {
  const errors = [];

  for (const item of items) {
    const row = await loadItemStock(item);
    if (!row) {
      errors.push(`Produit introuvable : ${item.productId}`);
      continue;
    }
    const available = availableQty(row.stock, row.reservedStock);
    if (available < item.quantity) {
      errors.push(
        `Stock insuffisant pour ${row.productName} — disponible : ${available}`,
      );
    }
  }

  return errors;
}

async function reserveStockItems(tx, items) {
  for (const item of items) {
    if (item.variantId) {
      const variant = await tx.productVariant.findUnique({ where: { id: item.variantId } });
      const available = availableQty(variant.stock, variant.reservedStock);
      if (available < item.quantity) {
        const error = new Error(`Stock insuffisant pour la variante sélectionnée.`);
        error.status = 400;
        throw error;
      }
      await tx.productVariant.update({
        where: { id: item.variantId },
        data: { reservedStock: { increment: item.quantity } },
      });
    } else {
      const product = await tx.product.findUnique({ where: { id: item.productId } });
      const available = availableQty(product.stock, product.reservedStock);
      if (available < item.quantity) {
        const error = new Error(`Stock insuffisant pour : ${product.name}`);
        error.status = 400;
        throw error;
      }
      await tx.product.update({
        where: { id: item.productId },
        data: { reservedStock: { increment: item.quantity } },
      });
    }
  }
}

async function releaseReservation(tx, items) {
  for (const item of items) {
    if (item.variantId) {
      await tx.productVariant.update({
        where: { id: item.variantId },
        data: { reservedStock: { decrement: item.quantity } },
      });
    } else {
      await tx.product.update({
        where: { id: item.productId },
        data: { reservedStock: { decrement: item.quantity } },
      });
    }
  }
}

async function fulfillStockSale(tx, items, orderId, createdBy = null, storeId = null) {
  for (const item of items) {
    const product = await tx.product.findUnique({
      where: { id: item.productId },
      select: { purchasePrice: true, name: true },
    });
    const unitCost = product?.purchasePrice ?? null;
    const totalCost = unitCost != null ? unitCost * item.quantity : null;

    if (item.variantId) {
      const variant = await tx.productVariant.findUnique({ where: { id: item.variantId } });
      const reservedRelease = Math.min(item.quantity, variant?.reservedStock || 0);
      await tx.productVariant.update({
        where: { id: item.variantId },
        data: {
          stock: { decrement: item.quantity },
          ...(reservedRelease > 0 && { reservedStock: { decrement: reservedRelease } }),
        },
      });
    } else {
      const productRow = await tx.product.findUnique({ where: { id: item.productId } });
      const reservedRelease = Math.min(item.quantity, productRow?.reservedStock || 0);
      await tx.product.update({
        where: { id: item.productId },
        data: {
          stock: { decrement: item.quantity },
          ...(reservedRelease > 0 && { reservedStock: { decrement: reservedRelease } }),
        },
      });
    }

    await tx.stockMovement.create({
      data: {
        productId: item.productId,
        variantId: item.variantId || null,
        type: 'OUT_SALE',
        quantity: item.quantity,
        unitCost,
        totalCost,
        reason: `Vente commande`,
        orderId,
        reference: orderId,
        storeId,
        createdBy,
      },
    });
  }
}

async function restoreStockFromSale(tx, items, orderId, createdBy = null) {
  for (const item of items) {
    if (item.variantId) {
      await tx.productVariant.update({
        where: { id: item.variantId },
        data: { stock: { increment: item.quantity } },
      });
    } else {
      await tx.product.update({
        where: { id: item.productId },
        data: { stock: { increment: item.quantity } },
      });
    }

    await tx.stockMovement.create({
      data: {
        productId: item.productId,
        variantId: item.variantId || null,
        type: 'RETURN_IN',
        quantity: item.quantity,
        reason: `Annulation / retour commande`,
        orderId,
        reference: orderId,
        createdBy,
      },
    });
  }
}

/** @deprecated Utiliser fulfillStockSale dans une transaction */
async function decrementStock(items) {
  for (const item of items) {
    if (item.variantId) {
      await prisma.productVariant.update({
        where: { id: item.variantId },
        data: { stock: { decrement: item.quantity } },
      });
    } else {
      await prisma.product.update({
        where: { id: item.productId },
        data: { stock: { decrement: item.quantity } },
      });
    }
  }
}

/** @deprecated Utiliser restoreStockFromSale dans une transaction */
async function incrementStock(items) {
  for (const item of items) {
    if (item.variantId) {
      await prisma.productVariant.update({
        where: { id: item.variantId },
        data: { stock: { increment: item.quantity } },
      });
    } else {
      await prisma.product.update({
        where: { id: item.productId },
        data: { stock: { increment: item.quantity } },
      });
    }
  }
}

module.exports = {
  availableQty,
  checkStock,
  reserveStockItems,
  releaseReservation,
  fulfillStockSale,
  restoreStockFromSale,
  decrementStock,
  incrementStock,
};
