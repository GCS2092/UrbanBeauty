const prisma = require('../config/database');

async function requireSeller(req, res, next) {
  if (req.user.role !== 'SELLER') {
    return res.status(403).json({ message: 'Accès réservé aux vendeurs.' });
  }
  next();
}

async function assertSellerProductAccess(req, res, next) {
  const productId = req.params.id || req.body.productId;
  
  if (req.user.role === 'ADMIN') return next();
  
  const product = await prisma.product.findUnique({
    where: { id: productId },
    select: { sellerId: true }
  });
  
  if (!product || product.sellerId !== req.user.id) {
    return res.status(403).json({ message: 'Accès refusé à ce produit.' });
  }
  
  next();
}

module.exports = { requireSeller, assertSellerProductAccess };
