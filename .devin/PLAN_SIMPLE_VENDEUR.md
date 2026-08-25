# Plan Simplifié - Dashboard Vendeur (Vue Produits 360°)

## 🎯 Objectif Unique

Le vendeur a une vision complète sur tout ce qui concerne ses produits :
- Chiffre d'affaires généré
- État du stock
- Commandes en cours
- Statistiques de performance

---

## 🏗️ Modifications Minimales

### 1. Schema Prisma (seulement l'essentiel)

#### Ajout rôle SELLER
```prisma
enum Role {
  CUSTOMER
  SELLER      // ← NOUVEAU
  STAFF
  ADMIN
}
```

#### Ajout sellerId sur Product
```prisma
model Product {
  // ... tous les champs existants ...
  sellerId    String?   // ← NOUVEAU (null = admin, non-null = vendeur)
  
  seller      User?   @relation("SellerProducts", fields: [sellerId], references: [id])
}

model User {
  // ... tous les champs existants ...
  sellerProducts Product[] @relation("SellerProducts")  // ← NOUVEAU
}
```

**C'est tout.** Pas de statut de publication, pas d'historique, pas de cascade complexe.

---

### 2. Backend - Service Vendeur (un seul fichier)

**Fichier**: `backend/src/modules/sellers/sellers.service.js`

```javascript
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
        _count: { select: { orderItems: true } } // Nombre de fois commandé
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
    topProducts: salesByProduct.slice(0, 5), // Top 5 produits
    allProductsSales: salesByProduct // Tous les produits avec leurs stats
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
```

---

### 3. Backend - Controller Vendeur

**Fichier**: `backend/src/modules/sellers/sellers.controller.js`

```javascript
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
```

---

### 4. Backend - Routes Vendeur

**Fichier**: `backend/src/modules/sellers/sellers.routes.js`

```javascript
const express = require('express');
const router = express.Router();
const sellersController = require('./sellers.controller');
const { authenticate } = require('../../middlewares/auth.middleware');

// Authentification requise
router.use(authenticate);

router.get('/stats', sellersController.getDashboardStats);
router.get('/products', sellersController.getMyProducts);
router.get('/orders', sellersController.getMyOrders);
router.get('/stock', sellersController.getMyStock);

module.exports = router;
```

---

### 5. Backend - Intégration routes principales

**Fichier**: `backend/src/index.js` (ou app.js)

```javascript
const sellerRoutes = require('./modules/sellers/sellers.routes');

app.use('/api/sellers', sellerRoutes);
```

---

### 6. Backend - Middleware vendeur (optionnel)

**Fichier**: `backend/src/middlewares/seller.middleware.js`

```javascript
async function requireSeller(req, res, next) {
  if (req.user.role !== 'SELLER' && req.user.role !== 'ADMIN') {
    return res.status(403).json({ message: 'Accès réservé aux vendeurs.' });
  }
  next();
}

module.exports = { requireSeller };
```

---

### 7. Frontend - Constants

**Fichier**: `frontend/src/utils/constants.js`

```javascript
export const ROLES = {
  CUSTOMER: 'CUSTOMER',
  SELLER: 'SELLER',      // ← NOUVEAU
  STAFF: 'STAFF',
  ADMIN: 'ADMIN',
};
```

---

### 8. Frontend - API Vendeur

**Fichier**: `frontend/src/api/sellers.api.js`

```javascript
import api from './axios';

export const sellersApi = {
  getStats: () => api.get('/api/sellers/stats'),
  getProducts: (params) => api.get('/api/sellers/products', { params }),
  getOrders: (params) => api.get('/api/sellers/orders', { params }),
  getStock: () => api.get('/api/sellers/stock'),
};
```

---

### 9. Frontend - Dashboard Vendeur (vue 360°)

**Fichier**: `frontend/src/pages/seller/SellerDashboard.jsx`

```jsx
import { useEffect, useState } from 'react';
import { sellersApi } from '../../api/sellers.api';
import { formatPrice } from '../../utils/formatPrice';

export default function SellerDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    loadStats();
  }, []);
  
  const loadStats = async () => {
    try {
      const { data } = await sellersApi.getStats();
      setStats(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  
  if (loading) return <div>Chargement...</div>;
  if (!stats) return <div>Erreur de chargement</div>;
  
  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">Dashboard Vendeur</h1>
      
      {/* Vue d'ensemble produits */}
      <section>
        <h2 className="text-xl font-semibold mb-4">Mes Produits</h2>
        <div className="grid grid-cols-4 gap-4">
          <StatCard title="Total produits" value={stats.overview.totalProducts} icon="📦" />
          <StatCard title="Actifs" value={stats.overview.activeProducts} icon="✅" color="green" />
          <StatCard title="Stock bas" value={stats.overview.lowStockProducts} icon="⚠️" color="yellow" />
          <StatCard title="Rupture" value={stats.overview.outOfStockProducts} icon="❌" color="red" />
        </div>
      </section>
      
      {/* Vue d'ensemble commandes */}
      <section>
        <h2 className="text-xl font-semibold mb-4">Mes Commandes</h2>
        <div className="grid grid-cols-3 gap-4">
          <StatCard title="Total commandes" value={stats.orders.total} icon="🛒" />
          <StatCard title="Livrées" value={stats.orders.delivered} icon="✅" color="green" />
          <StatCard title="En cours" value={stats.orders.pending} icon="⏳" color="yellow" />
        </div>
      </section>
      
      {/* Vue d'ensemble chiffre d'affaires */}
      <section>
        <h2 className="text-xl font-semibold mb-4">Chiffre d'Affaires</h2>
        <div className="grid grid-cols-2 gap-4">
          <StatCard 
            title="CA Total" 
            value={formatPrice(stats.revenue.total)} 
            icon="💰" 
            color="blue" 
          />
          <StatCard 
            title="CA En attente" 
            value={formatPrice(stats.revenue.pending)} 
            icon="⏳" 
            color="yellow" 
          />
        </div>
      </section>
      
      {/* Top produits */}
      <section>
        <h2 className="text-xl font-semibold mb-4">Top Produits</h2>
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium">Produit</th>
                <th className="px-4 py-3 text-right text-sm font-medium">Ventes</th>
                <th className="px-4 py-3 text-right text-sm font-medium">CA</th>
                <th className="px-4 py-3 text-right text-sm font-medium">Stock</th>
              </tr>
            </thead>
            <tbody>
              {stats.topProducts.map((product, idx) => (
                <tr key={product.productId} className="border-t border-gray-100">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <span className="text-lg font-bold text-gray-400">#{idx + 1}</span>
                      <span className="font-medium">{product.productName}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right">{product.sales}</td>
                  <td className="px-4 py-3 text-right font-medium">
                    {formatPrice(product.revenue)}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span className={product.stock <= 5 ? 'text-red-600 font-medium' : ''}>
                      {product.stock}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

function StatCard({ title, value, icon, color = 'gray' }) {
  const colorClasses = {
    gray: 'bg-gray-100 text-gray-700',
    green: 'bg-green-100 text-green-700',
    yellow: 'bg-yellow-100 text-yellow-700',
    red: 'bg-red-100 text-red-700',
    blue: 'bg-blue-100 text-blue-700',
  };
  
  return (
    <div className={`${colorClasses[color]} rounded-xl p-6`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium opacity-80">{title}</p>
          <p className="text-2xl font-bold mt-1">{value}</p>
        </div>
        <span className="text-3xl">{icon}</span>
      </div>
    </div>
  );
}
```

---

### 10. Frontend - Page Stock Vendeur

**Fichier**: `frontend/src/pages/seller/SellerStock.jsx`

```jsx
import { useEffect, useState } from 'react';
import { sellersApi } from '../../api/sellers.api';

export default function SellerStock() {
  const [stock, setStock] = useState([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    loadStock();
  }, []);
  
  const loadStock = async () => {
    try {
      const { data } = await sellersApi.getStock();
      setStock(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  
  if (loading) return <div>Chargement...</div>;
  
  const statusCounts = {
    OK: stock.filter(p => p.status === 'OK').length,
    LOW_STOCK: stock.filter(p => p.status === 'LOW_STOCK').length,
    OUT_OF_STOCK: stock.filter(p => p.status === 'OUT_OF_STOCK').length,
  };
  
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">État du Stock</h1>
      
      {/* Résumé rapide */}
      <div className="grid grid-cols-3 gap-4">
        <StatCard title="OK" value={statusCounts.OK} icon="✅" color="green" />
        <StatCard title="Stock bas" value={statusCounts.LOW_STOCK} icon="⚠️" color="yellow" />
        <StatCard title="Rupture" value={statusCounts.OUT_OF_STOCK} icon="❌" color="red" />
      </div>
      
      {/* Liste détaillée */}
      <div className="space-y-3">
        {stock.map((product) => (
          <StockCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}

function StockCard({ product }) {
  const statusColors = {
    OK: 'bg-green-100 text-green-700',
    LOW_STOCK: 'bg-yellow-100 text-yellow-700',
    OUT_OF_STOCK: 'bg-red-100 text-red-700',
  };
  
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4 flex gap-4">
      {product.mainImage && (
        <img 
          src={product.mainImage} 
          alt={product.name}
          className="w-20 h-20 object-cover rounded-lg"
        />
      )}
      
      <div className="flex-1">
        <div className="flex items-start justify-between">
          <h3 className="font-semibold">{product.name}</h3>
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColors[product.status]}`}>
            {product.status === 'OK' ? 'OK' : product.status === 'LOW_STOCK' ? 'Stock bas' : 'Rupture'}
          </span>
        </div>
        
        <p className="text-sm text-gray-600 mt-1">
          Stock: <span className="font-medium">{product.stock}</span>
          {product.lowStockAlert > 0 && ` (alerte à ${product.lowStockAlert})`}
        </p>
        
        {product.variants.length > 0 && (
          <div className="mt-2 space-y-1">
            {product.variants.map((variant, idx) => (
              <div key={idx} className="text-xs text-gray-500">
                {variant.size} / {variant.color}: {variant.stock}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ title, value, icon, color = 'gray' }) {
  const colorClasses = {
    gray: 'bg-gray-100 text-gray-700',
    green: 'bg-green-100 text-green-700',
    yellow: 'bg-yellow-100 text-yellow-700',
    red: 'bg-red-100 text-red-700',
  };
  
  return (
    <div className={`${colorClasses[color]} rounded-xl p-6`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium opacity-80">{title}</p>
          <p className="text-2xl font-bold mt-1">{value}</p>
        </div>
        <span className="text-3xl">{icon}</span>
      </div>
    </div>
  );
}
```

---

### 11. Frontend - Page Commandes Vendeur

**Fichier**: `frontend/src/pages/seller/SellerOrders.jsx`

```jsx
import { useEffect, useState } from 'react';
import { sellersApi } from '../../api/sellers.api';
import { ORDER_STATUS_LABELS, ORDER_STATUS_COLORS } from '../../utils/constants';
import { formatPrice } from '../../utils/formatPrice';

export default function SellerOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');
  
  useEffect(() => {
    loadOrders();
  }, [filter]);
  
  const loadOrders = async () => {
    try {
      const params = filter !== 'ALL' ? { status: filter } : {};
      const { data } = await sellersApi.getOrders(params);
      setOrders(data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  
  if (loading) return <div>Chargement...</div>;
  
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Commandes de mes produits</h1>
      
      {/* Filtres */}
      <div className="flex gap-2">
        {['ALL', 'PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'].map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === status
                ? 'bg-black text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {status === 'ALL' ? 'Toutes' : ORDER_STATUS_LABELS[status]}
          </button>
        ))}
      </div>
      
      {/* Liste des commandes */}
      {orders.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          Aucune commande pour le moment
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <OrderCard key={order.id} order={order} />
          ))}
        </div>
      )}
    </div>
  );
}

function OrderCard({ order }) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4">
      <div className="flex items-center justify-between mb-4">
        <div>
          <span className="font-semibold">#{order.orderNumber}</span>
          <span className="text-sm text-gray-500 ml-2">
            {new Date(order.createdAt).toLocaleDateString('fr-FR')}
          </span>
        </div>
        <span className={`px-3 py-1 rounded-full text-xs font-medium ${ORDER_STATUS_COLORS[order.status]}`}>
          {ORDER_STATUS_LABELS[order.status]}
        </span>
      </div>
      
      {/* Info client */}
      <div className="mb-3 p-3 bg-gray-50 rounded-lg">
        <p className="text-sm font-medium">{order.user?.firstName} {order.user?.lastName}</p>
        <p className="text-xs text-gray-500">{order.user?.email}</p>
        <p className="text-xs text-gray-500">{order.user?.phone}</p>
      </div>
      
      {/* Produits du vendeur dans cette commande */}
      <div className="space-y-2">
        {order.items.map((item) => (
          <div key={item.id} className="flex justify-between text-sm p-2 bg-gray-50 rounded">
            <div>
              <span className="font-medium">{item.productName}</span>
              {item.variantLabel && <span className="text-gray-500 ml-2">({item.variantLabel})</span>}
              <span className="text-gray-500 ml-2">x{item.quantity}</span>
            </div>
            <span className="font-medium">
              {formatPrice(item.subtotal)}
            </span>
          </div>
        ))}
      </div>
      
      <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between">
        <span className="font-semibold">Total commande</span>
        <span className="font-bold">
          {formatPrice(order.total)}
        </span>
      </div>
    </div>
  );
}
```

---

### 12. Frontend - Page Produits Vendeur

**Fichier**: `frontend/src/pages/seller/SellerProducts.jsx`

```jsx
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { sellersApi } from '../../api/sellers.api';
import { productsApi } from '../../api/products.api';

export default function SellerProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    loadProducts();
  }, []);
  
  const loadProducts = async () => {
    try {
      const { data } = await sellersApi.getProducts();
      setProducts(data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  
  const handleDelete = async (id) => {
    if (!confirm('Supprimer ce produit ?')) return;
    
    try {
      await productsApi.delete(id);
      loadProducts();
    } catch (err) {
      alert('Erreur de suppression');
    }
  };
  
  if (loading) return <div>Chargement...</div>;
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Mes produits</h1>
        <Link
          to="/admin/products/new" // Réutiliser formulaire admin existant
          className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800"
        >
          + Nouveau produit
        </Link>
      </div>
      
      {products.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          Aucun produit. Commencez par en ajouter un !
        </div>
      ) : (
        <div className="grid gap-4">
          {products.map((product) => (
            <ProductCard 
              key={product.id} 
              product={product} 
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function ProductCard({ product, onDelete }) {
  const mainImage = product.images.find(img => img.isMain) || product.images[0];
  
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4 flex gap-4">
      <img
        src={mainImage?.url}
        alt={product.name}
        className="w-24 h-24 object-cover rounded-lg"
      />
      
      <div className="flex-1">
        <h3 className="font-semibold">{product.name}</h3>
        <p className="text-sm text-gray-500">{product.category?.name}</p>
        
        <div className="mt-2 flex items-center gap-4 text-sm">
          <span className="font-medium">
            {new Intl.NumberFormat('fr-FR').format(product.price)} FCFA
          </span>
          <span className="text-gray-500">Stock: {product.stock}</span>
          <span className="text-gray-500">
            Commandé: {product._count.orderItems} fois
          </span>
        </div>
      </div>
      
      <div className="flex flex-col gap-2">
        <Link
          to={`/admin/products/${product.id}/edit`} // Réutiliser formulaire admin
          className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg hover:bg-gray-50"
        >
          Modifier
        </Link>
        
        <button
          onClick={() => onDelete(product.id)}
          className="px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 rounded-lg"
        >
          Supprimer
        </button>
      </div>
    </div>
  );
}
```

---

### 13. Frontend - Layout Vendeur

**Fichier**: `frontend/src/components/layout/SellerLayout.jsx`

```jsx
import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function SellerLayout() {
  const { user, logout } = useAuth();
  const location = useLocation();
  
  const menuItems = [
    { path: '/seller', label: 'Dashboard', icon: '📊' },
    { path: '/seller/products', label: 'Mes produits', icon: '📦' },
    { path: '/seller/orders', label: 'Commandes', icon: '🛒' },
    { path: '/seller/stock', label: 'Stock', icon: '📋' },
  ];
  
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 h-full w-64 bg-white border-r border-gray-200 p-4">
        <div className="mb-8">
          <h1 className="text-xl font-bold">UrbanBeauty</h1>
          <p className="text-sm text-gray-500">Espace Vendeur</p>
        </div>
        
        <nav className="space-y-2">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                location.pathname === item.path
                  ? 'bg-black text-white'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>
        
        <div className="absolute bottom-4 left-4 right-4">
          <div className="border-t border-gray-200 pt-4">
            <p className="text-sm font-medium">{user?.firstName} {user?.lastName}</p>
            <p className="text-xs text-gray-500">{user?.email}</p>
            <button
              onClick={logout}
              className="mt-2 w-full text-left text-sm text-red-600 hover:text-red-700"
            >
              Déconnexion
            </button>
          </div>
        </div>
      </aside>
      
      {/* Main content */}
      <main className="ml-64 p-8">
        <Outlet />
      </main>
    </div>
  );
}
```

---

### 14. Frontend - Routes

**Fichier**: `frontend/src/App.jsx`

```jsx
import SellerLayout from './components/layout/SellerLayout';
import SellerDashboard from './pages/seller/SellerDashboard';
import SellerProducts from './pages/seller/SellerProducts';
import SellerOrders from './pages/seller/SellerOrders';
import SellerStock from './pages/seller/SellerStock';

// Dans le système de routes
<Route path="/seller" element={<ProtectedRoute requiredRole="SELLER"><SellerLayout /></ProtectedRoute>}>
  <Route index element={<SellerDashboard />} />
  <Route path="products" element={<SellerProducts />} />
  <Route path="orders" element={<SellerOrders />} />
  <Route path="stock" element={<SellerStock />} />
</Route>
```

---

### 15. Frontend - Auth Context Modification

**Fichier**: `frontend/src/context/AuthContext.jsx`

```jsx
// Dans la fonction login
navigate(
  data.user.role === 'SELLER' ? '/seller' :
  data.user.role === 'ADMIN' || data.user.role === 'STAFF' ? '/admin' :
  '/'
);

// Dans la fonction loginWithGoogle
navigate(
  data.user.role === 'SELLER' ? '/seller' :
  data.user.role === 'ADMIN' || data.user.role === 'STAFF' ? '/admin' :
  '/'
);
```

---

### 16. Backend - Modification Auth Service

**Fichier**: `backend/src/modules/auth/auth.service.js`

```javascript
// Dans buildAuthResponse
return {
  // ... autres champs
  redirectPath: user.role === 'SELLER' ? '/seller' 
                : user.role === 'ADMIN' || user.role === 'STAFF' ? '/admin' 
                : '/'
};
```

---

## 🚀 Plan d'implémentation (1 semaine)

### Jour 1-2 : Backend
1. ✅ Schema Prisma (ajout SELLER + sellerId)
2. ✅ Migration Prisma
3. ✅ Service vendeur (stats, products, orders, stock)
4. ✅ Controller vendeur
5. ✅ Routes vendeur
6. ✅ Intégration dans index.js

### Jour 3-4 : Frontend
1. ✅ Constants (ROLES)
2. ✅ API sellers
3. ✅ Layout vendeur
4. ✅ Dashboard (vue 360°)
5. ✅ Page produits
6. ✅ Page commandes
7. ✅ Page stock

### Jour 5 : Intégration & Tests
1. ✅ Routes App.jsx
2. ✅ Auth context modification
3. ✅ Tests création produit vendeur
4. ✅ Tests affichage stats
5. ✅ Tests commandes filtrées

---

## 📝 Résumé

**Ce qu'on implémente** :
- ✅ Rôle SELLER + dashboard dédié
- ✅ Vue 360° sur les produits (CA, stock, commandes)
- ✅ Statistiques complètes par produit
- ✅ État du stock en temps réel
- ✅ Commandes filtrées par vendeur
- ✅ Réutilisation massive du code existant

**Ce qu'on oublie** (pour l'instant) :
- ❌ Message interne
- ❌ Statut compte vendeur
- ❌ Historique modifications
- ❌ Système financier complexe
- ❌ Workflow approbation
- ❌ Candidature vendeur
- ❌ Page boutique publique

**Résultat** : Un vendeur peut voir tout ce qui concerne ses produits en 1 semaine de développement.
