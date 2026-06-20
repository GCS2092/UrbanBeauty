const prisma = require('../../config/database');
const { sendEmail } = require('../../config/email');
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
const {
  resolveStoreForOrder,
  computeStoreDiscount,
} = require('../stores/store.service');
const { getSettings } = require('../settings/settings.service');
const { notifyOrderConfirmed, notifyOrderStatus, notifyPaymentReceived } = require('../../services/notification.service');
const { buildInvoicePdf } = require('../invoices/invoice-pdf.service'); // âœ… adapte le chemin si besoin

// âœ… Fonction utilitaire â€” envoie en arriÃ¨re-plan sans bloquer
function sendEmailAsync(mailOptions) {
  sendEmail(mailOptions)
    .then(() => console.log('âœ… Email envoyÃ© Ã  :', mailOptions.to))
    .catch((err) => console.error('âŒ ERREUR EMAIL :', err.message));
}

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

  const store = await resolveStoreForOrder(payload.storeId);
  const orderNumber = generateOrderNumber();
  const userId = user?.id || null;
  // âœ… email optionnel â€” on stocke null plutÃ´t que '' si l'invitÃ© ne le renseigne pas
  const guestEmail = user?.email || payload.guestEmail || null;
  const guestName = payload.guestName || payload.shippingAddress?.fullName || 'Client';
  const shippingCost = Number(payload.shippingCost || 0);
  const subtotal = payload.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const storeDiscount = computeStoreDiscount(subtotal, store.discountRate);

  let discount = 0;
  let couponId = null;

  if (payload.couponId) {
    const coupon = await prisma.coupon.findUnique({ where: { id: payload.couponId } });
    if (!coupon || !coupon.isActive) {
      const error = new Error('Code promo invalide ou expirÃ©.');
      error.status = 400;
      throw error;
    }
    discount = coupon.type === 'PERCENTAGE'
      ? Math.floor(subtotal * coupon.value / 100)
      : coupon.value;
    couponId = coupon.id;
  }

  const total = subtotal + shippingCost - discount - storeDiscount;
  const isDraft = payload.status === 'DRAFT';
  const initialStatus = isDraft ? 'DRAFT' : 'PENDING';

  const settings = await getSettings();
  const expiryHours = Number(settings.reservation_expiry_hours || 24);
  const reservationExpiresAt = new Date(Date.now() + expiryHours * 60 * 60 * 1000);

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
        storeId: store.id,
        userId,
        guestEmail,
        guestPhone: payload.guestPhone,
        guestName,
        status: initialStatus,
        paymentMethod: payload.paymentMethod,
        subtotal,
        shippingCost,
        discount,
        storeDiscount,
        couponId,
        total,
        shippingAddress: payload.shippingAddress,
        destination: payload.destination || null,
        notes: payload.notes,
        reservationExpiresAt,
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
            status: initialStatus,
            message: isDraft
              ? 'Commande WhatsApp en attente de confirmation.'
              : 'Commande enregistrÃ©e et en attente de confirmation.',
            location: payload.shippingAddress?.city || null,
          },
        },
        statusHistory: {
          create: {
            toStatus: initialStatus,
            message: isDraft ? 'Commande WhatsApp crÃ©Ã©e (brouillon)' : 'Commande crÃ©Ã©e',
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
      include: { items: true, tracking: true, payments: true, store: true },
    });

    await logAudit({
      tx,
      userId,
      storeId: store.id,
      action: 'ORDER_CREATE',
      module: 'orders',
      entityId: created.id,
      entityType: 'Order',
      newValue: { orderNumber, total, storeId: store.id },
      ip,
    });

    return created;
  });

  // âœ… Email client â€” en arriÃ¨re-plan, ne bloque pas la rÃ©ponse
  if (guestEmail) {
    const emailData = buildOrderConfirmationEmail({
      orderNumber,
      guestName,
      total,
      clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',
    });
    sendEmailAsync({
      to: guestEmail,
      from: process.env.SMTP_USER,
      subject: emailData.subject,
      html: emailData.html,
    });
  }

  // âœ… Email admin â€” en arriÃ¨re-plan, ne bloque pas la rÃ©ponse
  if (process.env.ADMIN_EMAIL) {
    const emailData = buildOrderConfirmationEmail({
      orderNumber,
      guestName,
      total,
      clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',
    });
    sendEmailAsync({
      to: process.env.ADMIN_EMAIL,
      from: process.env.SMTP_USER,
      subject: `[Admin] Nouvelle commande ${orderNumber}`,
      html: emailData.html,
    });
  }

  return order;
}

async function getUserOrders(userId) {
  return prisma.order.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    include: {
      items: true,
      tracking: { orderBy: { createdAt: 'asc' } },
      invoice: true,
    },
  });
}

async function getOrderByNumber(orderNumber) {
  return prisma.order.findUnique({
    where: { orderNumber },
    include: {
      items: true,
      tracking: { orderBy: { createdAt: 'asc' } },
      invoice: true,
      statusHistory: { orderBy: { createdAt: 'desc' } },
      user: { select: { id: true, firstName: true, lastName: true, phone: true, email: true } }, // âœ… ajoutÃ©
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
    const emailData = buildOrderStatusEmail({
      orderNumber: order.orderNumber,
      customerName,
      status: order.status,
      clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',
    });

    // âœ… GÃ©nÃ©ration PDF avant sendEmailAsync (await obligatoire)
    let attachments = [];
    if (order.invoice) {
      try {
        const pdfBuffer = await buildInvoicePdf(order.invoice);
        attachments = [{
          filename: `facture-${order.invoice.invoiceNumber}.pdf`,
          content: pdfBuffer.toString('base64'),
        }];
      } catch (err) {
        // On ne bloque pas l'email si le PDF Ã©choue
        console.error('âŒ Erreur gÃ©nÃ©ration PDF facture :', err.message);
      }
    }

    sendEmailAsync({
      to: customerEmail,
      from: process.env.SMTP_USER,
      subject: emailData.subject,
      html: emailData.html,
      attachments,
    });
  }

  return order;
}

function buildOrdersWhere(query, storeIds = null) {
  const where = {};

  if (query.status) where.status = query.status;
  if (query.paymentStatus) where.paymentStatus = query.paymentStatus;
  if (query.paymentMethod) where.paymentMethod = query.paymentMethod;
  if (query.destination) where.destination = query.destination;
  
  if (query.storeId) {
    if (storeIds?.length && !storeIds.includes(query.storeId)) {
      const error = new Error('AccÃ¨s refusÃ© Ã  cette boutique.');
      error.status = 403;
      throw error;
    }
    where.storeId = query.storeId;
  } else if (storeIds?.length) {
    where.storeId = { in: storeIds };
  }

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

async function getAllOrders(query, storeIds = null) {
  const { page, limit, skip } = parsePagination(query);
  const where = buildOrdersWhere(query, storeIds);

  const [total, orders] = await Promise.all([
    prisma.order.count({ where }),
    prisma.order.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        items: true,
        tracking: { orderBy: { createdAt: 'asc' } },
        user: true,
        invoice: true,
        store: { select: { id: true, code: true, name: true } },
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


