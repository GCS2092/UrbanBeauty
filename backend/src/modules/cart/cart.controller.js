const cartService = require('./cart.service');

async function getCart(req, res, next) {
  try {
    const cart = await cartService.getCart(req.query);
    res.json(cart);
  } catch (error) {
    next(error);
  }
}

async function addItem(req, res, next) {
  try {
    const item = await cartService.addItem(req.body);
    res.status(201).json(item);
  } catch (error) {
    next(error);
  }
}

async function updateItem(req, res, next) {
  try {
    const item = await cartService.updateItem(req.params.itemId, req.body);
    res.json(item);
  } catch (error) {
    next(error);
  }
}

async function removeItem(req, res, next) {
  try {
    await cartService.removeItem(req.params.itemId);
    res.status(204).end();
  } catch (error) {
    next(error);
  }
}

async function clearCart(req, res, next) {
  try {
    await cartService.clearCart(req.query);
    res.status(204).end();
  } catch (error) {
    next(error);
  }
}

const cartController = {
  getCart,
  addItem,
  updateItem,
  removeItem,
  clearCart,
};

module.exports = cartController;
