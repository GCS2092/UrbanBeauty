const prisma = require('../../config/database');
const { decrementStock, incrementStock } = require('../products/stock.service');
const ordersService = require('./orders.service');

async function createOrder(req, res, next) {
  try {
    const order = await ordersService.createOrder(req.body, req.user);
    res.status(201).json(order);
  } catch (error) {
    next(error);
  }
}

async function getUserOrders(req, res, next) {
  try {
    const orders = await ordersService.getUserOrders(req.user.id);
    res.json(orders);
  } catch (error) {
    next(error);
  }
}

async function getOrderByNumber(req, res, next) {
  try {
    const order = await ordersService.getOrderByNumber(req.params.orderNumber);
    if (!order) {
      return res.status(404).json({ message: 'Commande introuvable' });
    }
    res.json(order);
  } catch (error) {
    next(error);
  }
}

async function changeOrderStatus(req, res, next) {
  try {
    const order = await ordersService.changeOrderStatus(req.params.id, req.body);
    res.json(order);
  } catch (error) {
    next(error);
  }
}

async function getAllOrders(req, res, next) {
  try {
    const orders = await ordersService.getAllOrders(req.query);
    res.json(orders);
  } catch (error) {
    next(error);
  }
}

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

    const existingOrder = await prisma.order.findUnique({
      where: { id },
      include: { items: true, user: true },
    });

    if (!existingOrder) {
      return res.status(404).json({ message: 'Commande introuvable.' });
    }

    const wasPaid = existingOrder.paymentStatus === 'PAID';
    const willBePaid = paymentStatus === 'PAID';
    const willBeRejected = paymentStatus === 'REJECTED';

    if (!wasPaid && willBePaid) {
      await decrementStock(existingOrder.items);
    } else if (wasPaid && willBeRejected) {
      await incrementStock(existingOrder.items);
    }

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

// ✅ Un seul export fusionné
module.exports = {
  createOrder,
  getUserOrders,
  getOrderByNumber,
  changeOrderStatus,
  getAllOrders,
  getOrdersAdmin,
  updatePaymentStatus,
};