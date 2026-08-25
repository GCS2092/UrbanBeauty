const sellersService = require('./sellers.service');

async function getDashboardStats(req, res, next) {
  try {
    const stats = await sellersService.getSellerStats(req.user.id);
    res.json(stats);
  } catch (err) {
    next(err);
  }
}

async function getMyProducts(req, res, next) {
  try {
    const result = await sellersService.getSellerProducts(req.user.id, req.query);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

async function getMyOrders(req, res, next) {
  try {
    const result = await sellersService.getSellerOrders(req.user.id, req.query);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

async function getMyStock(req, res, next) {
  try {
    const stock = await sellersService.getSellerStock(req.user.id);
    res.json(stock);
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getDashboardStats,
  getMyProducts,
  getMyOrders,
  getMyStock
};
