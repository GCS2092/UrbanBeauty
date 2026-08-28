import { Suspense, lazy } from 'react';
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from 'react-router-dom';
const TwoFactorReconfigure = lazy(() => import('./pages/account/TwoFactorReconfigure'));
import {
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query';

import {
  ReactQueryDevtools,
} from '@tanstack/react-query-devtools';

import { Toaster } from 'sonner';

import { AuthProvider } from './context/AuthContext';

import ProtectedRoute from './components/shared/ProtectedRoute';
import ScrollToTop from './components/shared/ScrollToTop';
import MetaPageTracker from './components/analytics/MetaPageTracker';
import AdminRoute from './components/shared/AdminRoute';
import AdminOnlyRoute from './components/shared/AdminOnlyRoute';

import ShopLayout from './components/layout/ShopLayout';
import AdminLayout from './components/layout/AdminLayout';
import SellerLayout from './components/layout/SellerLayout';

import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import TwoFactorSetup from './pages/auth/TwoFactorSetup';
import TwoFactorVerify from './pages/auth/TwoFactorVerify';

// ✅ Pages boutique : chargées immédiatement, ce sont celles vues par tous les visiteurs
import Home from './pages/shop/Home';
import Products from './pages/shop/Products';
import ProductDetail from './pages/shop/ProductDetail';
import About from './pages/shop/About';
import Contact from './pages/shop/Contact';
import CGV from './pages/shop/CGV';
import Returns from './pages/shop/Returns';
import Track from './pages/shop/Track';

import Cart from './pages/cart/Cart';
import Checkout from './pages/cart/Checkout';

// ✅ Code-splitting : ces pages ne sont téléchargées que si l'utilisateur y accède
// (compte connecté ou admin/staff) — elles ne pèsent plus sur le chargement initial
// de la boutique pour un visiteur anonyme.
const AccountLayout    = lazy(() => import('./pages/account/AccountLayout'));
const Orders            = lazy(() => import('./pages/orders/Orders'));
const OrderDetail       = lazy(() => import('./pages/orders/OrderDetail'));
const Profile           = lazy(() => import('./pages/account/Profile'));
const Addresses         = lazy(() => import('./pages/account/Addresses'));
const Wishlist          = lazy(() => import('./pages/account/Wishlist'));
const Notifications     = lazy(() => import('./pages/account/Notifications'));

const Dashboard             = lazy(() => import('./pages/admin/Dashboard'));
const AdminProducts         = lazy(() => import('./pages/admin/AdminProducts'));
const AdminOrders           = lazy(() => import('./pages/admin/AdminOrders'));
const AdminCategories       = lazy(() => import('./pages/admin/AdminCategories'));
const AdminCoupons          = lazy(() => import('./pages/admin/AdminCoupons'));
const AdminUsers            = lazy(() => import('./pages/admin/AdminUsers'));
const AdminPayments         = lazy(() => import('./pages/admin/AdminPayments'));
const AdminSettings         = lazy(() => import('./pages/admin/AdminSettings'));
const AdminAccounting       = lazy(() => import('./pages/admin/AdminAccounting'));
const AdminInvoices         = lazy(() => import('./pages/admin/AdminInvoices'));
const AdminAudit            = lazy(() => import('./pages/admin/AdminAudit'));
const AdminStores           = lazy(() => import('./pages/admin/AdminStores'));
const AdminStockTransfers   = lazy(() => import('./pages/admin/AdminStockTransfers'));
const AdminSuppliers        = lazy(() => import('./pages/admin/AdminSuppliers'));
const AdminSellers          = lazy(() => import('./pages/admin/AdminSellers'));

// Seller pages
const SellerDashboard       = lazy(() => import('./pages/seller/SellerDashboard'));
const SellerProducts        = lazy(() => import('./pages/seller/SellerProducts'));
const SellerOrders         = lazy(() => import('./pages/seller/SellerOrders'));
const SellerStock          = lazy(() => import('./pages/seller/SellerStock'));
const SellerSettings       = lazy(() => import('./pages/seller/SellerSettings'));
const SellerProductForm    = lazy(() => import('./pages/seller/SellerProductForm'));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 1000 * 60 * 5,
    },
  },
});

const isDev = import.meta.env.DEV;

// ✅ Fallback simple pendant le chargement d'une page différée
function PageLoader() {
  return (
    <div className="min-h-[50vh] flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-stone-200 border-t-stone-800 rounded-full animate-spin" />
    </div>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <ScrollToTop />
        <MetaPageTracker />

        <Toaster
          position="top-right"
          richColors
        />

        <AuthProvider>
          <Suspense fallback={<PageLoader />}>
            <Routes>

              {/* Auth */}
              <Route
                path="/login"
                element={<Login />}
              />

              <Route
                path="/register"
                element={<Register />}
              />

              <Route
                path="/2fa/setup"
                element={<TwoFactorSetup />}
              />

              <Route
                path="/2fa/verify"
                element={<TwoFactorVerify />}
              />

              {/* Shop */}
              <Route element={<ShopLayout />}>

                <Route
                  path="/"
                  element={<Home />}
                />

                <Route
                  path="/products"
                  element={<Products />}
                />

                <Route
                  path="/products/:slug"
                  element={<ProductDetail />}
                />

                <Route
                  path="/about"
                  element={<About />}
                />

                <Route
                  path="/contact"
                  element={<Contact />}
                />

                <Route
                  path="/cgv"
                  element={<CGV />}
                />

                <Route
                  path="/returns"
                  element={<Returns />}
                />

                <Route
                  path="/suivi"
                  element={<Track />}
                />

                <Route
                  path="/suivi/:orderNumber"
                  element={<Track />}
                />

                <Route
                  path="/cart"
                  element={<Cart />}
                />

                <Route
                  path="/checkout"
                  element={<Checkout />}
                />

                {/* Pages protégées avec sidebar compte */}
                <Route element={<ProtectedRoute />}>
                  <Route element={<AccountLayout />}>
                    <Route
                      path="/account/2fa"
                      element={<TwoFactorReconfigure />}
                    />
                    <Route
                      path="/account/profile"
                      element={<Profile />}
                    />

                    <Route
                      path="/account/addresses"
                      element={<Addresses />}
                    />

                    <Route
                      path="/account/wishlist"
                      element={<Wishlist />}
                    />

                    <Route
                      path="/account/notifications"
                      element={<Notifications />}
                    />

                    <Route
                      path="/orders"
                      element={<Orders />}
                    />

                    {/* IMPORTANT :
                        C'est cette route qui reçoit :
                        /orders/CMD-xxxx?payment=return
                    */}
                    <Route
                      path="/orders/:orderNumber"
                      element={<OrderDetail />}
                    />

                  </Route>
                </Route>

              </Route>

              {/* Seller */}
              <Route element={<ProtectedRoute requiredRole="SELLER" />}>
                <Route element={<SellerLayout />}>

                  <Route
                    path="/seller"
                    element={<SellerDashboard />}
                  />

                  <Route
                    path="/seller/products"
                    element={<SellerProducts />}
                  />

                  <Route
                    path="/seller/products/new"
                    element={<SellerProductForm />}
                  />

                  <Route
                    path="/seller/products/:id/edit"
                    element={<SellerProductForm />}
                  />

                  <Route
                    path="/seller/orders"
                    element={<SellerOrders />}
                  />

                  <Route
                    path="/seller/stock"
                    element={<SellerStock />}
                  />

                  <Route
                    path="/seller/settings"
                    element={<SellerSettings />}
                  />

                </Route>
              </Route>

              {/* Admin + Staff */}
              <Route element={<AdminRoute />}>
                <Route element={<AdminLayout />}>

                  <Route
                    path="/admin"
                    element={<Dashboard />}
                  />

                  <Route
                    path="/admin/products"
                    element={<AdminProducts />}
                  />

                  <Route
                    path="/admin/orders"
                    element={<AdminOrders />}
                  />

                  <Route
                    path="/admin/payments"
                    element={<AdminPayments />}
                  />

                  <Route
                    path="/admin/accounting"
                    element={<AdminAccounting />}
                  />

                  <Route
                    path="/admin/invoices"
                    element={<AdminInvoices />}
                  />

                  <Route
                    path="/admin/stock-transfers"
                    element={<AdminStockTransfers />}
                  />

                  <Route
                    path="/admin/audit"
                    element={<AdminAudit />}
                  />

                  <Route
                    path="/admin/categories"
                    element={<AdminCategories />}
                  />

                  <Route
                    path="/admin/suppliers"
                    element={<AdminSuppliers />}
                  />

                  <Route element={<AdminOnlyRoute />}>

                    <Route
                      path="/admin/stores"
                      element={<AdminStores />}
                    />

                    <Route
                      path="/admin/sellers"
                      element={<AdminSellers />}
                    />

                    <Route
                      path="/admin/coupons"
                      element={<AdminCoupons />}
                    />

                    <Route
                      path="/admin/users"
                      element={<AdminUsers />}
                    />

                    <Route
                      path="/admin/settings"
                      element={<AdminSettings />}
                    />

                  </Route>

                </Route>
              </Route>

              {/* Fallback */}
              <Route
                path="*"
                element={
                  <Navigate
                    to="/"
                    replace
                  />
                }
              />

            </Routes>
          </Suspense>
        </AuthProvider>
      </BrowserRouter>

      {isDev && (
        <ReactQueryDevtools
          initialIsOpen={false}
        />
      )}
    </QueryClientProvider>
  );
}