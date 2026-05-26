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

const ordersController = {
  createOrder,
  getUserOrders,
  getOrderByNumber,
  changeOrderStatus,
  getAllOrders,
};

module.exports = ordersController;
