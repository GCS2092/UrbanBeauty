const prisma = require('../../config/database');
const { parsePagination, buildPaginationResponse } = require('../../utils/pagination.utils');

// ─── Tous les produits du vendeur ─────────────────────────────────────
async function getSellerProducts(userId, query = {}) {
  const { page, limit, skip } = parsePagination(query);
  
  const where = {
    sellerId: userId,
    ...(query.search && {
      OR: [
        { name: { contains: query.search } },
        { description: { contains: query.search } }
      ]
    })
  };
  
  const [total, products] = await Promise.all([
    prisma.product.count({ where }),
    prisma.product.findMany({
      where,
      skip,
      take: limit,
      include: { 
        images: true, 
        variants: true, 
        category: true,
        _count: { select: { orderItems: true } }
      },
      orderBy: { createdAt: 'desc' }
    })
  ]);
  
  return buildPaginationResponse({ data: products, total, page, limit });
}

// ─── Statistiques complètes sur les produits du vendeur ───────────────
async function getSellerStats(userId) {
  // Récupérer tous les produits du vendeur
  const products = await prisma.product.findMany({
    where: { sellerId: userId },
    select: { 
      id: true, 
      name: true,
      price: true, 
      stock: true, 
      isActive: true,
      lowStockAlert: true
    }
  });
  
  const productIds = products.map(p => p.id);
  
  // Récupérer tous les orderItems de ces produits
  const orderItems = await prisma.orderItem.findMany({
    where: { productId: { in: productIds } },
    include: {
      order: {
        select: { 
          status: true, 
          total: true, 
          createdAt: true 
        }
      }
    }
  });
  
  // Calculs
  const totalProducts = products.length;
  const activeProducts = products.filter(p => p.isActive).length;
  const lowStockProducts = products.filter(p => p.stock <= p.lowStockAlert).length;
  const outOfStockProducts = products.filter(p => p.stock === 0).length;
  
  const totalOrders = orderItems.length;
  const deliveredOrders = orderItems.filter(oi => oi.order.status === 'DELIVERED').length;
  const pendingOrders = orderItems.filter(oi => 
    ['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED'].includes(oi.order.status)
  ).length;
  
  const totalRevenue = orderItems
    .filter(oi => oi.order.status === 'DELIVERED')
    .reduce((sum, oi) => sum + oi.subtotal, 0);
  
  const pendingRevenue = orderItems
    .filter(oi => ['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED'].includes(oi.order.status))
    .reduce((sum, oi) => sum + oi.subtotal, 0);
  
  // Ventes par produit
  const salesByProduct = await Promise.all(
    products.map(async (product) => {
      const productOrderItems = orderItems.filter(oi => oi.productId === product.id);
      const productRevenue = productOrderItems
        .filter(oi => oi.order.status === 'DELIVERED')
        .reduce((sum, oi) => sum + oi.subtotal, 0);
      const productSales = productOrderItems
        .filter(oi => oi.order.status === 'DELIVERED')
        .reduce((sum, oi) => sum + oi.quantity, 0);
      
      return {
        productId: product.id,
        productName: product.name,
        revenue: productRevenue,
        sales: productSales,
        stock: product.stock,
        price: product.price
      };
    })
  );
  
  // Trier par CA décroissant
  salesByProduct.sort((a, b) => b.revenue - a.revenue);
  
  return {
    overview: {
      totalProducts,
      activeProducts,
      lowStockProducts,
      outOfStockProducts
    },
    orders: {
      total: totalOrders,
      delivered: deliveredOrders,
      pending: pendingOrders
    },
    revenue: {
      total: totalRevenue,
      pending: pendingRevenue
    },
    topProducts: salesByProduct.slice(0, 5),
    allProductsSales: salesByProduct
  };
}

// ─── Commandes contenant les produits du vendeur ─────────────────────
async function getSellerOrders(userId, query = {}) {
  const sellerProducts = await prisma.product.findMany({
    where: { sellerId: userId },
    select: { id: true }
  });
  
  const productIds = sellerProducts.map(p => p.id);
  
  const orderItems = await prisma.orderItem.findMany({
    where: { productId: { in: productIds } },
    select: { orderId: true }
  });
  
  const orderIds = [...new Set(orderItems.map(oi => oi.orderId))];
  
  const { page, limit, skip } = parsePagination(query);
  
  const where = {
    id: { in: orderIds },
    ...(query.status && { status: query.status })
  };
  
  const [total, orders] = await Promise.all([
    prisma.order.count({ where }),
    prisma.order.findMany({
      where,
      skip,
      take: limit,
      include: {
        items: { 
          where: { productId: { in: productIds } },
          include: { product: { select: { name: true, sellerId: true } } }
        },
        user: { select: { firstName: true, lastName: true, email: true, phone: true } },
        tracking: { orderBy: { createdAt: 'asc' } }
      },
      orderBy: { createdAt: 'desc' }
    })
  ]);
  
  return buildPaginationResponse({ data: orders, total, page, limit });
}

// ─── État du stock par produit ─────────────────────────────────────────
async function getSellerStock(userId) {
  const products = await prisma.product.findMany({
    where: { sellerId: userId },
    include: {
      variants: true,
      images: { where: { isMain: true }, take: 1 }
    }
  });
  
  return products.map(product => ({
    id: product.id,
    name: product.name,
    stock: product.stock,
    lowStockAlert: product.lowStockAlert,
    status: product.stock === 0 ? 'OUT_OF_STOCK' 
           : product.stock <= product.lowStockAlert ? 'LOW_STOCK' 
           : 'OK',
    variants: product.variants.map(v => ({
      size: v.size,
      color: v.color,
      stock: v.stock
    })),
    mainImage: product.images[0]?.url || null
  }));
}

module.exports = {
  getSellerProducts,
  getSellerStats,
  getSellerOrders,
  getSellerStock
};
