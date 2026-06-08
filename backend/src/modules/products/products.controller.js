const productsService = require('./products.service');

async function getProducts(req, res, next) {
  try {
    const result = await productsService.getProducts(req.query);
    res.json(result);
  } catch (error) {
    next(error);
  }
}

// ← NOUVEAU : tous les produits pour l'admin (actifs + inactifs)
async function getAllProductsAdmin(req, res, next) {
  try {
    const result = await productsService.getAllProductsAdmin(req.query);
    res.json(result);
  } catch (error) {
    next(error);
  }
}

async function getProductBySlug(req, res, next) {
  try {
    const product = await productsService.getProductBySlug(req.params.slug);
    if (!product) {
      return res.status(404).json({ message: 'Produit introuvable' });
    }
    res.json(product);
  } catch (error) {
    next(error);
  }
}

async function createProduct(req, res, next) {
  try {
    const product = await productsService.createProduct(req.body);
    res.status(201).json(product);
  } catch (error) {
    next(error);
  }
}

async function updateProduct(req, res, next) {
  try {
    const product = await productsService.updateProduct(req.params.id, req.body);
    res.json(product);
  } catch (error) {
    next(error);
  }
}

async function deleteProduct(req, res, next) {
  try {
    await productsService.deleteProduct(req.params.id);
    res.status(204).end();
  } catch (error) {
    next(error);
  }
}

const productsController = {
  getProducts,
  getAllProductsAdmin,
  getProductBySlug,
  createProduct,
  updateProduct,
  deleteProduct,
};

module.exports = productsController;