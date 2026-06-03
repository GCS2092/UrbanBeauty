const prisma = require('../../config/database');
const { nextInvoiceNumber } = require('../../utils/invoice.utils');
const { logAudit } = require('../../services/audit.service');
const {
  fulfillStockSale,
  releaseReservation,
  restoreStockFromSale,
} = require('../products/stock.service');

const TERMINAL_STATUSES = ['DELIVERED', 'CANCELLED'];

async function recordStatusHistory(tx, {
  orderId,
  fromStatus,
  toStatus,
  message,
  reason,
  changedBy,
}) {
  return tx.orderStatusHistory.create({
    data: {
      orderId,
      fromStatus: fromStatus ?? null,
      toStatus,
      message,
      reason,
      changedBy,
    },
  });
}

async function createInvoiceForOrder(tx, order) {
  const existing = await tx.invoice.findUnique({ where: { orderId: order.id } });
  if (existing) return existing;

  const invoiceNumber = await nextInvoiceNumber(tx);
  return tx.invoice.create({
    data: {
      invoiceNumber,
      orderId: order.id,
      subtotal: order.subtotal,
      shippingCost: order.shippingCost,
      discount: order.discount,
      tax: 0,
      total: order.total,
      status: 'GENERATED',
    },
  });
}

async function fulfillOrderPayment(orderId, { paymentStatus, note }, adminUser, ip) {
  return prisma.$transaction(async (tx) => {
    const order = await tx.order.findUnique({
      where: { id: orderId },
      include: { items: true, user: true, invoice: true },
    });

    if (!order) {
      const error = new Error('Commande introuvable.');
      error.status = 404;
      throw error;
    }

    const wasPaid = order.paymentStatus === 'PAID';
    const willBePaid = paymentStatus === 'PAID';
    const willBeRejected = paymentStatus === 'REJECTED';
    const willBePending = paymentStatus === 'PENDING';

    if (wasPaid && willBePaid) {
      const error = new Error('Cette commande est déjà payée.');
      error.status = 400;
      throw error;
    }

    if (willBePaid && !wasPaid) {
      await fulfillStockSale(tx, order.items, order.id, adminUser?.id);
      await createInvoiceForOrder(tx, order);
    }

    if (wasPaid && (willBeRejected || willBePending)) {
      await restoreStockFromSale(tx, order.items, order.id, adminUser?.id);
      if (order.invoice) {
        await tx.invoice.update({
          where: { id: order.invoice.id },
          data: { status: 'CANCELLED' },
        });
      }
    }

    if (!wasPaid && willBeRejected) {
      await releaseReservation(tx, order.items);
    }

    const newOrderStatus = willBePaid
      ? 'CONFIRMED'
      : willBeRejected
        ? 'CANCELLED'
        : order.status === 'CANCELLED'
          ? 'PENDING'
          : order.status;

    const updated = await tx.order.update({
      where: { id: orderId },
      data: {
        paymentStatus,
        status: newOrderStatus,
      },
      include: {
        user: { select: { id: true, firstName: true, lastName: true, email: true } },
        payments: true,
        items: true,
        invoice: true,
        statusHistory: { orderBy: { createdAt: 'desc' }, take: 5 },
      },
    });

    await tx.orderTracking.create({
      data: {
        orderId: order.id,
        status: updated.status,
        message:
          paymentStatus === 'PAID'
            ? 'Paiement validé — commande confirmée.'
            : paymentStatus === 'REJECTED'
              ? `Paiement rejeté. ${note || ''}`.trim()
              : `Paiement remis en attente. ${note || ''}`.trim(),
      },
    });

    await recordStatusHistory(tx, {
      orderId: order.id,
      fromStatus: order.status,
      toStatus: updated.status,
      message: `Paiement : ${order.paymentStatus} → ${paymentStatus}`,
      reason: note || null,
      changedBy: adminUser?.id,
    });

    const payment = await tx.payment.findFirst({ where: { orderId } });
    if (payment) {
      await tx.payment.update({
        where: { id: payment.id },
        data: {
          status: paymentStatus,
          paidAt: paymentStatus === 'PAID' ? new Date() : null,
        },
      });
    } else {
      await tx.payment.create({
        data: {
          orderId: order.id,
          method: order.paymentMethod,
          status: paymentStatus,
          amount: order.total,
          paidAt: paymentStatus === 'PAID' ? new Date() : null,
        },
      });
    }

    await logAudit({
      tx,
      userId: adminUser?.id,
      action: 'PAYMENT_STATUS_UPDATE',
      module: 'orders',
      entityId: order.id,
      entityType: 'Order',
      oldValue: { paymentStatus: order.paymentStatus, status: order.status },
      newValue: { paymentStatus, status: updated.status },
      ip,
    });

    return updated;
  });
}

function assertStatusChangeAllowed(currentStatus, newStatus) {
  if (currentStatus === newStatus) return;

  if (TERMINAL_STATUSES.includes(currentStatus)) {
    const error = new Error(
      `Impossible de modifier une commande au statut « ${currentStatus} ».`,
    );
    error.status = 400;
    throw error;
  }

  const editable = ['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED'];
  if (!editable.includes(currentStatus) && newStatus !== 'CANCELLED') {
    const error = new Error('Cette commande ne peut plus être modifiée.');
    error.status = 400;
    throw error;
  }
}

async function changeOrderStatusAtomic(orderId, payload, adminUser, ip) {
  return prisma.$transaction(async (tx) => {
    const order = await tx.order.findUnique({
      where: { id: orderId },
      include: { items: true, user: true, invoice: true },
    });

    if (!order) {
      const error = new Error('Commande introuvable.');
      error.status = 404;
      throw error;
    }

    assertStatusChangeAllowed(order.status, payload.status);

    if (payload.status === 'CANCELLED') {
      if (order.paymentStatus === 'PAID') {
        await restoreStockFromSale(tx, order.items, order.id, adminUser?.id);
        if (order.invoice) {
          await tx.invoice.update({
            where: { id: order.invoice.id },
            data: { status: 'CANCELLED' },
          });
        }
      } else {
        await releaseReservation(tx, order.items);
      }
    }

    const updated = await tx.order.update({
      where: { id: orderId },
      data: { status: payload.status },
      include: {
        tracking: true,
        user: true,
        items: true,
        invoice: true,
        statusHistory: { orderBy: { createdAt: 'desc' }, take: 10 },
      },
    });

    await tx.orderTracking.create({
      data: {
        orderId: order.id,
        status: updated.status,
        message: payload.message || `Statut changé en ${updated.status}`,
        location: payload.location || null,
      },
    });

    await recordStatusHistory(tx, {
      orderId: order.id,
      fromStatus: order.status,
      toStatus: updated.status,
      message: payload.message,
      reason: payload.reason,
      changedBy: adminUser?.id,
    });

    await logAudit({
      tx,
      userId: adminUser?.id,
      action: 'ORDER_STATUS_UPDATE',
      module: 'orders',
      entityId: order.id,
      entityType: 'Order',
      oldValue: { status: order.status },
      newValue: { status: updated.status },
      ip,
    });

    return updated;
  });
}

module.exports = {
  fulfillOrderPayment,
  changeOrderStatusAtomic,
  recordStatusHistory,
  createInvoiceForOrder,
};
