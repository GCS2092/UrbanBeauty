const prisma = require('../../config/database');
const { decrementStock, incrementStock } = require('../products/stock.service');

async function getOrdersAdmin(req, res, next) {
  try {
    const { paymentMethod, paymentStatus, page = 1, limit = 20 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const where = {};
    if (paymentMethod) where.paymentMethod = paymentMethod;
    if (paymentStatus) where.paymentStatus = paymentStatus;

    const [total, orders] = await Promise.all([
      prisma.order.count({ where }),
      prisma.order.findMany({
        where,
        skip,
        take: parseInt(limit),
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: { id: true, firstName: true, lastName: true, email: true, phone: true }
          },
          items: true,
          payments: true,
        },
      }),
    ]);

    res.json({
      data: orders,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / parseInt(limit)),
    });
  } catch (err) {
    next(err);
  }
}

async function updatePaymentStatus(req, res, next) {
  try {
    const { id } = req.params;
    const { paymentStatus, note } = req.body;

    if (!['PAID', 'REJECTED', 'PENDING'].includes(paymentStatus)) {
      return res.status(400).json({ message: 'Statut invalide.' });
    }

    // Récupère la commande avec ses items pour gérer le stock
    const existingOrder = await prisma.order.findUnique({
      where: { id },
      include: { items: true, user: true },
    });

    if (!existingOrder) {
      return res.status(404).json({ message: 'Commande introuvable.' });
    }

    // ✅ Gestion du stock selon la transition
    const wasPaid = existingOrder.paymentStatus === 'PAID';
    const willBePaid = paymentStatus === 'PAID';
    const willBeRejected = paymentStatus === 'REJECTED';

    if (!wasPaid && willBePaid) {
      // Paiement validé → décrémente le stock
      await decrementStock(existingOrder.items);
    } else if (wasPaid && willBeRejected) {
      // Paiement annulé après validation → réincrémente
      await incrementStock(existingOrder.items);
    }

    // Met à jour la commande
    const order = await prisma.order.update({
      where: { id },
      data: {
        paymentStatus,
        status: paymentStatus === 'PAID' ? 'CONFIRMED'
              : paymentStatus === 'REJECTED' ? 'CANCELLED'
              : 'PENDING',
        payments: {
          updateMany: {
            where: { orderId: id },
            data: {
              status: paymentStatus,
              paidAt: paymentStatus === 'PAID' ? new Date() : null,
            },
          },
        },
      },
      include: {
        user: { select: { id: true, firstName: true, lastName: true, email: true } },
        payments: true,
        items: true,
      },
    });

    // Notification au client
    const message = paymentStatus === 'PAID'
      ? `Votre paiement pour la commande ${order.orderNumber} a été validé ✅`
      : `Votre paiement pour la commande ${order.orderNumber} a été rejeté ❌. ${note || ''}`;

    await prisma.notification.create({
      data: {
        userId: existingOrder.user.id,
        type: paymentStatus === 'PAID' ? 'ORDER_CONFIRMED' : 'ORDER_CANCELLED',
        title: paymentStatus === 'PAID' ? 'Paiement validé !' : 'Paiement rejeté',
        message,
        link: `/orders/${order.orderNumber}`,
      },
    });

    res.json(order);
  } catch (err) {
    next(err);
  }
}

module.exports = { getOrdersAdmin, updatePaymentStatus };