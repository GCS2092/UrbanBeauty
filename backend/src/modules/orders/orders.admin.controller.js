const prisma = require('../../config/database');
const { fulfillOrderPayment } = require('./order-fulfillment.service');
const { buildOrdersWhere } = require('./orders.service');
const { parsePagination, buildPaginationResponse } = require('../../utils/pagination.utils');

async function getOrdersAdmin(req, res, next) {
  try {
    const { page, limit, skip } = parsePagination(req.query);
    const where = buildOrdersWhere(req.query);

    const [total, orders] = await Promise.all([
      prisma.order.count({ where }),
      prisma.order.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: { id: true, firstName: true, lastName: true, email: true, phone: true },
          },
          items: true,
          payments: true,
          invoice: true,
          statusHistory: { orderBy: { createdAt: 'desc' }, take: 3 },
        },
      }),
    ]);

    res.json(buildPaginationResponse({ data: orders, total, page, limit }));
  } catch (err) {
    next(err);
  }
}

async function updatePaymentStatus(req, res, next) {
  try {
    const { id } = req.params;
    const { paymentStatus, note } = req.body;

    if (!['PAID', 'REJECTED', 'PENDING', 'PARTIAL'].includes(paymentStatus)) {
      return res.status(400).json({ message: 'Statut de paiement invalide.' });
    }

    const order = await fulfillOrderPayment(
      id,
      { paymentStatus, note },
      req.user,
      req.ip,
    );

    if (order.user) {
      const message =
        paymentStatus === 'PAID'
          ? `Votre paiement pour la commande ${order.orderNumber} a été validé.`
          : paymentStatus === 'REJECTED'
            ? `Votre paiement pour la commande ${order.orderNumber} a été rejeté. ${note || ''}`
            : `Votre paiement pour la commande ${order.orderNumber} est en attente.`;

      await prisma.notification.create({
        data: {
          userId: order.user.id,
          type: paymentStatus === 'PAID' ? 'ORDER_CONFIRMED' : 'ORDER_CANCELLED',
          title:
            paymentStatus === 'PAID'
              ? 'Paiement validé'
              : paymentStatus === 'REJECTED'
                ? 'Paiement rejeté'
                : 'Paiement en attente',
          message,
          link: `/orders/${order.orderNumber}`,
        },
      });
    }

    res.json(order);
  } catch (err) {
    next(err);
  }
}

// ── Confirmer un brouillon WhatsApp → PENDING ─────────────────
async function confirmDraftOrder(req, res, next) {
  try {
    const { id } = req.params;

    const existing = await prisma.order.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ message: 'Commande introuvable' });
    }
    if (existing.status !== 'DRAFT') {
      return res.status(400).json({ message: 'La commande n\'est pas un brouillon' });
    }

    const order = await prisma.order.update({
      where: { id },
      data: {
        status: 'PENDING',
        statusHistory: {
          create: {
            fromStatus: 'DRAFT',
            toStatus: 'PENDING',
            message: 'Commande WhatsApp confirmée par l\'admin',
            changedBy: req.user?.id,
          },
        },
      },
      include: { user: true, items: true },
    });

    // Notifier le client s'il a un compte
    if (order.user) {
      await prisma.notification.create({
        data: {
          userId: order.user.id,
          type: 'ORDER_CONFIRMED',
          title: 'Commande confirmée',
          message: `Votre commande WhatsApp ${order.orderNumber} a été confirmée.`,
          link: `/orders/${order.orderNumber}`,
        },
      });
    }

    res.json(order);
  } catch (err) {
    next(err);
  }
}

module.exports = { getOrdersAdmin, updatePaymentStatus, confirmDraftOrder };