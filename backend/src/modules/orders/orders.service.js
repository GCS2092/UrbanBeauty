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
const { notifyOrderConfirmed, notifyOrderStatus, notifyAdmins } = require('../../services/notification.service');
const { buildInvoicePdf } = require('../invoices/invoice-pdf.service');
const { isValidPhone } = require('../../utils/phone.utils');

// ─── Destinations locales (paiement à la livraison autorisé) ─────────────────
const LOCAL_DESTINATIONS = ['SENEGAL'];

// ─── Validation cohérence paiement / destination ──────────────────────────────
function validatePaymentDestination(paymentMethod, destination) {
  const isLocal = !destination || LOCAL_DESTINATIONS.includes(destination);
  if (!isLocal && paymentMethod === 'CASH_ON_DELIVERY') {
    const error = new Error(
      'Le paiement à la livraison n\'est pas disponible pour les commandes internationales. ' +
      'Veuillez choisir Mobile Money.'
    );
    error.status = 400;
    throw error;
  }
}

// ─── Utilitaire email async ────────────────────────────────────────────────────
function sendEmailAsync(mailOptions) {
  const { from, ...brevoOptions } = mailOptions;
  sendEmail(brevoOptions)
    .then(() => console.log('✅ Email envoyé à :', brevoOptions.to))
    .catch((err) => console.error('❌ ERREUR EMAIL :', err.message, err.response?.data || ''));
}

async function createOrder(payload, user, ip = null) {
  if (!Array.isArray(payload.items) || payload.items.length === 0) {
    const error = new Error('La commande doit contenir au moins un produit.');
    error.status = 400;
    throw error;
  }

  validatePaymentDestination(payload.paymentMethod, payload.destination);

  const phone = user?.phone || payload.guestPhone;
  if (!isValidPhone(phone)) {
    const error = new Error('Numéro de téléphone invalide ou manquant.');
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
  const guestEmail = user?.email || payload.guestEmail || null;
  const guestName = payload.guestName || payload.shippingAddress?.fullName || 'Cliente';
  const shippingCost = Number(payload.shippingCost || 0);
  const subtotal = payload.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const storeDiscount = computeStoreDiscount(subtotal, store.discountRate);

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
              : 'Commande enregistrée et en attente de confirmation.',
            location: payload.shippingAddress?.city || null,
          },
        },
        statusHistory: {
          create: {
            toStatus: initialStatus,
            message: isDraft ? 'Commande WhatsApp créée (brouillon)' : 'Commande créée',
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
      newValue: { orderNumber, total, storeId: store.id, destination: payload.destination },
      ip,
    });

    return created;
  });

  // ── Emails async (commandes non-draft uniquement) ──────────────────────────
  if (!isDraft && guestEmail) {
    const emailData = buildOrderConfirmationEmail({
      orderNumber,
      guestName,
      total,
      subtotal,
      shippingCost,
      discount,
      storeDiscount,
      items: payload.items,
      paymentMethod: payload.paymentMethod,
      shippingAddress: payload.shippingAddress,
      clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',
      isGuest: !userId,
      storeName: store.name,
      storeCode: store.code,
    });
    sendEmailAsync({ to: guestEmail, subject: emailData.subject, html: emailData.html });
  }

  if (!isDraft && process.env.ADMIN_EMAIL) {
    const emailData = buildOrderConfirmationEmail({
      orderNumber,
      guestName,
      total,
      clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',
      storeName: store.name,
      storeCode: store.code,
    });
    sendEmailAsync({
      to: process.env.ADMIN_EMAIL,
      subject: `[Admin] Nouvelle commande ${orderNumber} — ${store.name}`,
      html: emailData.html,
    });
  }

  // ── Push OneSignal client (uniquement si utilisateur connecté et non-draft) ──
  if (!isDraft && userId) {
    const orderWithUserId = { ...order, userId, orderNumber };
    notifyOrderConfirmed(orderWithUserId).catch((err) =>
      console.error('❌ Erreur notif OneSignal createOrder:', err.message)
    );
  }

  // ── Push OneSignal admins/staff pour toute nouvelle commande non-draft ──────
  if (!isDraft) {
    notifyAdmins({
      type:    'NEW_ORDER',
      title:   `🛍️ Nouvelle commande — ${store.name}`,
      message: `Commande ${orderNumber} reçue — à traiter.`,
      link:    '/admin/orders',
    }).catch(err => console.error('❌ Erreur notif admin nouvelle commande:', err.message));
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
      user: { select: { id: true, firstName: true, lastName: true, phone: true, email: true } },
      store: { select: { id: true, code: true, name: true } },
    },
  });
}

async function changeOrderStatus(orderId, payload, adminUser, ip) {
  const order = await changeOrderStatusAtomic(orderId, payload, adminUser, ip);

  const customerEmail = order.user?.email || order.guestEmail;
  const customerName = order.user
    ? `${order.user.firstName} ${order.user.lastName}`
    : order.guestName;

  // ── Email statut ───────────────────────────────────────────────────────────
  if (customerEmail) {
    const emailData = buildOrderStatusEmail({
      orderNumber: order.orderNumber,
      customerName,
      status: order.status,
      clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',
      isGuest: !order.userId,
      storeName: order.store?.name || 'SonShop',
      storeCode: order.store?.code || 'SONSHOP',
    });

    let attachments = [];
    if (order.invoice && order.status === 'CONFIRMED') {
      try {
        const pdfBuffer = await buildInvoicePdf(order.invoice);
        attachments = [{
          filename: `facture-${order.invoice.invoiceNumber}.pdf`,
          content: pdfBuffer.toString('base64'),
        }];
      } catch (err) {
        console.error('❌ Erreur génération PDF facture :', err.message);
      }
    }

    sendEmailAsync({
      to: customerEmail,
      subject: emailData.subject,
      html: emailData.html,
      attachments,
    });
  }

  // ── Push OneSignal statut client ───────────────────────────────────────────
  if (order.userId) {
    notifyOrderStatus(order, order.status).catch((err) =>
      console.error('❌ Erreur notif OneSignal changeStatus:', err.message)
    );
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
      const error = new Error('Accès refusé à cette boutique.');
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