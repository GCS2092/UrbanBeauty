const express = require('express');
const { body } = require('express-validator');
const productsController = require('./products.controller');
const authenticate = require('../../middlewares/auth.middleware');
const requireAdmin = require('../../middlewares/admin.middleware');
const { apiLimiter } = require('../../middlewares/rateLimit.middleware');
const { checkValidation } = require('../../middlewares/validation.middleware');

const router = express.Router();

/**
 * @swagger
 * /api/products:
 *   get:
 *     summary: Liste des produits
 *     tags: [Produits]
 *     security: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer }
 *       - in: query
 *         name: limit
 *         schema: { type: integer }
 *       - in: query
 *         name: category
 *         schema: { type: string }
 *         description: Slug de la catégorie
 *       - in: query
 *         name: search
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Liste paginée
 */
router.get('/', apiLimiter, productsController.getProducts);

/**
 * @swagger
 * /api/products/{slug}:
 *   get:
 *     summary: Détail d'un produit par slug
 *     tags: [Produits]
 *     security: []
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema: { type: string }
 *         example: robe-wax-elegante
 *     responses:
 *       200:
 *         description: Produit trouvé
 *       404:
 *         description: Produit introuvable
 */
router.get('/:slug', apiLimiter, productsController.getProductBySlug);

/**
 * @swagger
 * /api/products:
 *   post:
 *     summary: Créer un produit (Admin)
 *     tags: [Produits]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           example:
 *             name: Robe Wax
 *             slug: robe-wax
 *             description: Belle robe en wax
 *             price: 25000
 *             stock: 10
 *             categoryId: "clxxxxxx"
 *     responses:
 *       201:
 *         description: Produit créé
 */
router.post('/', authenticate, requireAdmin,
  body('name').notEmpty(),
  body('slug').notEmpty(),
  body('description').optional().notEmpty(),
  body('price').isInt({ min: 0 }),
  body('stock').isInt({ min: 0 }),
  body('categoryId').notEmpty(),
  checkValidation,
  productsController.createProduct
);

/**
 * @swagger
 * /api/products/{id}:
 *   put:
 *     summary: Modifier un produit (Admin)
 *     tags: [Produits]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       content:
 *         application/json:
 *           example:
 *             price: 30000
 *             stock: 15
 *     responses:
 *       200:
 *         description: Produit modifié
 */
router.put('/:id', authenticate, requireAdmin,
  body('name').optional().notEmpty(),
  body('price').optional().isInt({ min: 0 }),
  body('stock').optional().isInt({ min: 0 }),
  checkValidation,
  productsController.updateProduct
);

/**
 * @swagger
 * /api/products/{id}:
 *   delete:
 *     summary: Supprimer un produit (Admin)
 *     tags: [Produits]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       204:
 *         description: Supprimé
 */
router.delete('/:id', authenticate, requireAdmin, productsController.deleteProduct);

module.exports = router;