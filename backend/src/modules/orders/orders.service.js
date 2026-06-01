const prisma = require('../../config/database');
const transporter = require('../../config/email');
const { buildOrderConfirmationEmail, buildOrderStatusEmail } = require('../../utils/email.utils');
const { generateOrderNumber } = require('../../utils/order.utils');
const { parsePagination, buildPaginationResponse } = require('../../utils/pagination.utils');
const { incrementStock } = require('../products/stock.service');

async function createOrder(payload, user) {
  if (!Array.isArray(payload.items) || payload.items.length === 0) {
    const error = new Error('La commande doit contenir au moins un produit.');
    error.status = 400;
    throw error;
  }

  for (const item of payload.items) {
    const product = await prisma.product.findUnique({ where: { id: item.productId } });
    if (!product) {
      const error = new Error(`Produit introuvable : ${item.productId}`);
      error.status = 404;
      throw error;
    }
    if (product.stock < item.quantity) {
      const error = new Error(`Stock insuffisant pour : ${product.name}`);
      error.status = 400;
      throw error;
    }
  }

  const orderNumber = generateOrderNumber();
  const userId = user?.id || null;
  const guestEmail = user?.email || payload.guestEmail;
  const guestName = payload.guestName || payload.shippingAddress?.fullName || 'Client';
  const shippingCost = Number(payload.shippingCost || 0);
  const subtotal = payload.items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  // ✅ Appliquer le coupon
  let discount = 0;
  let couponId = null;

  if (payload.couponId) {
    const coupon = await prisma.coupon.findUnique({ where: { id: payload.couponId } });
    if (coupon && coupon.isActive) {
      discount = coupon.type === 'PERCENTAGE'
        ? Math.floor(subtotal * coupon.value / 100)
        : coupon.value;
      couponId = coupon.id;

      // ✅ Incrémenter le nombre d'utilisations
      await prisma.coupon.update({
        where: { id: coupon.id },
        data: { usedCount: { increment: 1 } },
      });
    }
  }

  const total = subtotal + shippingCost - discount;

  const order = await prisma.order.create({
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
    },
    include: { items: true, tracking: true },
  });

  // ✅ Email désactivé temporairement — SMTP non configuré
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
    include: { items: true, tracking: true },
  });
}

async function getOrderByNumber(orderNumber) {
  return prisma.order.findUnique({
    where: { orderNumber },
    include: { items: true, tracking: true },
  });
}

async function changeOrderStatus(orderId, payload) {
  const existingOrder = await prisma.order.findUnique({
    where: { id: orderId },
    include: { items: true, user: true },
  });

  if (payload.status === 'CANCELLED' && existingOrder.paymentStatus === 'PAID') {
    await incrementStock(existingOrder.items);
  }

  const order = await prisma.order.update({
    where: { id: orderId },
    data: { status: payload.status },
    include: { tracking: true, user: true },
  });

  await prisma.orderTracking.create({
    data: {
      orderId: order.id,
      status: order.status,
      message: payload.message || `Statut changé en ${order.status}`,
      location: payload.location,
    },
  });

  // ✅ Email désactivé temporairement — SMTP non configuré
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

async function getAllOrders(query) {
  const { page, limit, skip } = parsePagination(query);
  const [total, orders] = await Promise.all([
    prisma.order.count(),
    prisma.order.findMany({
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: { items: true, tracking: true, user: true },
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
};