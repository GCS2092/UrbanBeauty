require('dotenv').config();

const express = require('express');
const helmet = require('helmet');
const cors = require('cors');

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
const settingsRoutes = require('./modules/settings/settings.routes'); // ✅ NOUVEAU
const ordersAdminRoutes = require('./modules/orders/orders.admin.routes');
const accountingRoutes = require('./modules/accounting/accounting.routes');
const app = express();

/* =======================
   SECURITY & CORE MIDDLEWARES
======================= */
app.use(helmet());
app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173' }));

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
    docs: 'http://localhost:5000/api/docs',
    health: 'http://localhost:5000/api/health',
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
app.use('/api/settings', settingsRoutes); // ✅ NOUVEAU
app.use('/api/admin/orders', ordersAdminRoutes);
app.use('/api/admin/accounting', accountingRoutes);
/* =======================
   ERROR HANDLER
======================= */
app.use(errorHandler);

module.exports = app;
