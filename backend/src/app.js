require('dotenv').config();

const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const reportRoutes = require('./modules/reports/report.routes');

const apiLimiter = require('./middlewares/rateLimit.middleware').apiLimiter;
const requestLogger = require('./middlewares/logger.middleware');
const errorHandler = require('./middlewares/error.middleware');

const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./config/swagger');

const authRoutes = require('./modules/auth/auth.routes');
const usersRoutes = require('./modules/users/users.routes');
const productsRoutes = require('./modules/products/products.routes');
const categoriesRoutes = require('./modules/categories/categories.routes');
const cartRoutes = require('./modules/cart/cart.routes');
const ordersRoutes = require('./modules/orders/orders.routes');
const addressesRoutes = require('./modules/addresses/addresses.routes');
const uploadRoutes = require('./modules/upload/upload.routes');
const wishlistRoutes = require('./modules/wishlist/wishlist.routes');
const reviewsRoutes = require('./modules/reviews/reviews.routes');
const couponsRoutes = require('./modules/coupons/coupons.routes');
const notificationsRoutes = require('./modules/notifications/notifications.routes');
const settingsRoutes = require('./modules/settings/settings.routes');
const ordersAdminRoutes = require('./modules/orders/orders.admin.routes');
const accountingRoutes = require('./modules/accounting/accounting.routes');
const auditRoutes = require('./modules/audit/audit.routes');
const invoicesRoutes = require('./modules/invoices/invoices.routes');
const storesRoutes = require('./modules/stores/stores.routes');
const stockTransfersRoutes = require('./modules/stock-transfers/stock-transfers.routes');
const creditNotesRoutes = require('./modules/credit-notes/credit-notes.routes');

const app = express();

/* =======================
   TRUST PROXY (Render / reverse proxy)
======================= */
app.set('trust proxy', 1); // ✅ LIGNE AJOUTÉE

/* =======================
   SECURITY & CORE MIDDLEWARES
======================= */
app.use(helmet());
app.use(cors({
  origin: process.env.CLIENT_URL || '*',
  credentials: true
}));

/* =======================
   BODY PARSERS
======================= */
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: false }));

/* =======================
   CUSTOM MIDDLEWARES
======================= */
app.use(requestLogger);
app.use(apiLimiter);

/* =======================
   DOCS
======================= */
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

/* =======================
   PUBLIC ROUTES
======================= */
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.get('/', (req, res) => {
  res.json({
    message: '🌸 Bienvenue sur l\'API UrbanBeauty',
    version: '1.0.0',
    docs: '/api/docs',      // ✅ plus de localhost hardcodé
    health: '/api/health',  // ✅ plus de localhost hardcodé
  });
});

/* =======================
   API ROUTES
======================= */
app.use('/api/auth', authRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/products', productsRoutes);
app.use('/api/categories', categoriesRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', ordersRoutes);
app.use('/api/addresses', addressesRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/wishlist', wishlistRoutes);
app.use('/api/reviews', reviewsRoutes);
app.use('/api/coupons', couponsRoutes);
app.use('/api/notifications', notificationsRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/admin/orders', ordersAdminRoutes);
app.use('/api/admin/accounting', accountingRoutes);
app.use('/api/admin/audit', auditRoutes);
app.use('/api/admin/invoices', invoicesRoutes);
app.use('/api/admin/stores', storesRoutes);
app.use('/api/admin/stock-transfers', stockTransfersRoutes);
app.use('/api/admin/credit-notes', creditNotesRoutes);
app.use('/api/admin/reports', reportRoutes);
/* =======================
   ERROR HANDLER
======================= */
app.use(errorHandler);

module.exports = app;