const prisma = require('../../config/database');
const transporter = require('../../config/email');
const { buildOrderConfirmationEmail, buildOrderStatusEmail } = require('../../utils/email.utils');
const { generateOrderNumber } = require('../../utils/order.utils');
const {
  parsePagination,
  buildPaginationResponse,
  applyDateRangeFilter,
} = require('../../utils/pagination.utils');
const { checkStock, reserveStockItems } = require('../products/stock.service');
const { logAudit } = require('../../services/audit.service');
const { changeOrderStatusAtomic } = require('./order-fulfillment.service');

async function createOrder(payload, user, ip = null) {
  if (!Array.isArray(payload.items) || payload.items.length === 0) {
    const error = new Error('La commande doit contenir au moins un produit.');
    error.status = 400;
    throw error;
  }

  const stockErrors = await checkStock(payload.items);
  if (stockErrors.length > 0) {
    const error = new Error(stockErrors[0]);
    error.status = 400;
    throw error;
  }

  const orderNumber = generateOrderNumber();
  const userId = user?.id || null;
  const guestEmail = user?.email || payload.guestEmail;
  const guestName = payload.guestName || payload.shippingAddress?.fullName || 'Client';
  const shippingCost = Number(payload.shippingCost || 0);
  const subtotal = payload.items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  let discount = 0;
  let couponId = null;

  if (payload.couponId) {
    const coupon = await prisma.coupon.findUnique({ where: { id: payload.couponId } });
    if (!coupon || !coupon.isActive) {
      const error = new Error('Code promo invalide ou expiré.');
      error.status = 400;
      throw error;
    }
    discount = coupon.type === 'PERCENTAGE'
      ? Math.floor(subtotal * coupon.value / 100)
      : coupon.value;
    couponId = coupon.id;
  }

  const total = subtotal + shippingCost - discount;

  const order = await prisma.$transaction(async (tx) => {
    await reserveStockItems(tx, payload.items);

    if (couponId) {
      await tx.coupon.update({
        where: { id: couponId },
        data: { usedCount: { increment: 1 } },
      });
    }

    const created = await tx.order.create({
      data: {
        orderNumber,
        userId,
        guestEmail,
        guestPhone: payload.guestPhone,
        guestName,
        paymentMethod: payload.paymentMethod,
        subtotal,
        shippingCost,
        discount,
        couponId,
        total,
        shippingAddress: payload.shippingAddress,
        notes: payload.notes,
        items: {
          create: payload.items.map((item) => ({
            productId: item.productId,
            variantId: item.variantId,
            productName: item.productName,
            variantLabel: item.variantLabel,
            price: item.price,
            quantity: item.quantity,
            subtotal: item.price * item.quantity,
          })),
        },
        tracking: {
          create: {
            status: 'PENDING',
            message: 'Commande enregistrée et en attente de confirmation.',
            location: payload.shippingAddress?.city || null,
          },
        },
        statusHistory: {
          create: {
            toStatus: 'PENDING',
            message: 'Commande créée',
            changedBy: userId,
          },
        },
        payments: {
          create: {
            method: payload.paymentMethod,
            status: 'PENDING',
            amount: total,
          },
        },
      },
      include: { items: true, tracking: true, payments: true },
    });

    await logAudit({
      tx,
      userId,
      action: 'ORDER_CREATE',
      module: 'orders',
      entityId: created.id,
      entityType: 'Order',
      newValue: { orderNumber, total },
      ip,
    });

    return created;
  });

  if (guestEmail) {
    try {
      const emailData = buildOrderConfirmationEmail({
        orderNumber,
        guestName,
        total,
        clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',
      });
      await transporter.sendMail({
        to: guestEmail,
        from: process.env.SMTP_USER,
        subject: emailData.subject,
        html: emailData.html,
      });
    } catch (emailErr) {
      console.warn('Email non envoyé (SMTP non configuré) :', emailErr.message);
    }
  }

  return order;
}

async function getUserOrders(userId) {
  return prisma.order.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    include: { items: true, tracking: true, invoice: true },
  });
}

async function getOrderByNumber(orderNumber) {
  return prisma.order.findUnique({
    where: { orderNumber },
    include: {
      items: true,
      tracking: true,
      invoice: true,
      statusHistory: { orderBy: { createdAt: 'desc' } },
    },
  });
}

async function changeOrderStatus(orderId, payload, adminUser, ip) {
  const order = await changeOrderStatusAtomic(orderId, payload, adminUser, ip);

  const customerEmail = order.user?.email || order.guestEmail;
  const customerName = order.user
    ? `${order.user.firstName} ${order.user.lastName}`
    : order.guestName;

  if (customerEmail) {
    try {
      const emailData = buildOrderStatusEmail({
        orderNumber: order.orderNumber,
        customerName,
        status: order.status,
        clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',
      });
      await transporter.sendMail({
        to: customerEmail,
        from: process.env.SMTP_USER,
        subject: emailData.subject,
        html: emailData.html,
      });
    } catch (emailErr) {
      console.warn('Email non envoyé (SMTP non configuré) :', emailErr.message);
    }
  }

  return order;
}

function buildOrdersWhere(query) {
  const where = {};

  if (query.status) where.status = query.status;
  if (query.paymentStatus) where.paymentStatus = query.paymentStatus;
  if (query.paymentMethod) where.paymentMethod = query.paymentMethod;

  applyDateRangeFilter(where, 'createdAt', query);

  if (query.search) {
    const s = String(query.search).trim();
    where.OR = [
      { orderNumber: { contains: s, mode: 'insensitive' } },
      { guestName: { contains: s, mode: 'insensitive' } },
      { guestEmail: { contains: s, mode: 'insensitive' } },
      { guestPhone: { contains: s, mode: 'insensitive' } },
      { user: { email: { contains: s, mode: 'insensitive' } } },
      { user: { firstName: { contains: s, mode: 'insensitive' } } },
      { user: { lastName: { contains: s, mode: 'insensitive' } } },
    ];
  }

  return where;
}

async function getAllOrders(query) {
  const { page, limit, skip } = parsePagination(query);
  const where = buildOrdersWhere(query);

  const [total, orders] = await Promise.all([
    prisma.order.count({ where }),
    prisma.order.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        items: true,
        tracking: true,
        user: true,
        invoice: true,
        statusHistory: { orderBy: { createdAt: 'desc' }, take: 3 },
      },
    }),
  ]);
  return buildPaginationResponse({ data: orders, total, page, limit });
}

module.exports = {
  createOrder,
  getUserOrders,
  getOrderByNumber,
  changeOrderStatus,
  getAllOrders,
  buildOrdersWhere,
};
