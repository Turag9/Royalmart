import { Suspense, lazy } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import AppLayout from './components/AppLayout';
import ProtectedRoute from './components/ProtectedRoute';
import PublicOnlyRoute from './components/PublicOnlyRoute';
import HomePage from './pages/HomePage';
import { LEGACY_ROUTES, ROUTES } from './utils/constants';
import { AdminAuthProvider } from './admin/context/AdminAuthContext';
import { AdminToastProvider } from './admin/context/AdminToastContext';
import AdminProtectedRoute from './admin/components/AdminProtectedRoute';
import AdminPublicRoute from './admin/components/AdminPublicRoute';

// ── Code-split heavy/secondary pages ─────────────────────────────────────
// Storefront primary path (Home + Login) stays in the initial chunk so the
// landing experience is fast. Everything else is lazy.
const WishlistPage = lazy(() => import('./pages/WishlistPage'));
const BagPage = lazy(() => import('./pages/BagPage'));
const CheckoutPage = lazy(() => import('./pages/CheckoutPage'));
const LoginPage = lazy(() => import('./pages/LoginPage'));
const ForgotPasswordPage = lazy(() => import('./pages/ForgotPasswordPage'));
const ProfilePage = lazy(() => import('./pages/ProfilePage'));
const OrderSuccessPage = lazy(() => import('./pages/OrderSuccessPage'));

const AdminLayout = lazy(() => import('./admin/layouts/AdminLayout'));
const AdminLoginPage = lazy(() => import('./admin/pages/AdminLoginPage'));
const DashboardPage = lazy(() => import('./admin/pages/DashboardPage'));
const ProductsPage = lazy(() => import('./admin/pages/ProductsPage'));
const CategoriesPage = lazy(() => import('./admin/pages/CategoriesPage'));
const CustomersPage = lazy(() => import('./admin/pages/CustomersPage'));
const OrdersPage = lazy(() => import('./admin/pages/OrdersPage'));
const AnalyticsPage = lazy(() => import('./admin/pages/AnalyticsPage'));
const SettingsPage = lazy(() => import('./admin/pages/SettingsPage'));
const PlaceholderPage = lazy(() => import('./admin/pages/PlaceholderPage'));

function PageFallback() {
  return (
    <div className="loading-spinner">
      <div className="spinner" />
      <p>Loading...</p>
    </div>
  );
}

function LegacyRedirects() {
  return (
    <>
      {Object.entries(LEGACY_ROUTES).map(([from, to]) => (
        <Route key={from} path={from} element={<Navigate to={to} replace />} />
      ))}
    </>
  );
}

export default function App() {
  return (
    <AdminAuthProvider>
      <AdminToastProvider>
        <Suspense fallback={<PageFallback />}>
          <Routes>
            <Route
              path="/admin/login"
              element={
                <AdminPublicRoute>
                  <AdminLoginPage />
                </AdminPublicRoute>
              }
            />
            <Route
              path="/admin"
              element={
                <AdminProtectedRoute>
                  <AdminLayout />
                </AdminProtectedRoute>
              }
            >
              <Route index element={<DashboardPage />} />
              <Route path="shops" element={<PlaceholderPage title="Shops" />} />
              <Route path="products" element={<ProductsPage />} />
              <Route path="categories" element={<CategoriesPage />} />
              <Route path="locations" element={<PlaceholderPage title="Locations" />} />
              <Route path="areas" element={<PlaceholderPage title="Areas" />} />
              <Route path="customers" element={<CustomersPage />} />
              <Route path="orders" element={<OrdersPage />} />
              <Route path="analytics" element={<AnalyticsPage />} />
              <Route path="settings" element={<SettingsPage />} />
            </Route>

            <Route element={<AppLayout />}>
              <Route path={ROUTES.home} element={<HomePage />} />
              <Route path={ROUTES.legacyHome} element={<Navigate to={ROUTES.home} replace />} />

              {/* Legacy /pages/*.html paths -> clean URLs */}
              {Object.entries(LEGACY_ROUTES).map(([from, to]) => (
                <Route key={from} path={from} element={<Navigate to={to} replace />} />
              ))}

              <Route
                path={ROUTES.wishlist}
                element={
                  <ProtectedRoute>
                    <WishlistPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path={ROUTES.bag}
                element={
                  <ProtectedRoute>
                    <BagPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path={ROUTES.checkout}
                element={
                  <ProtectedRoute>
                    <CheckoutPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path={ROUTES.login}
                element={
                  <PublicOnlyRoute>
                    <LoginPage />
                  </PublicOnlyRoute>
                }
              />
              <Route path={ROUTES.forgotPassword} element={<ForgotPasswordPage />} />
              <Route
                path={ROUTES.profile}
                element={
                  <ProtectedRoute>
                    <ProfilePage />
                  </ProtectedRoute>
                }
              />
              <Route
                path={ROUTES.orderSuccess}
                element={
                  <ProtectedRoute>
                    <OrderSuccessPage />
                  </ProtectedRoute>
                }
              />
            </Route>
            <Route path="*" element={<Navigate to={ROUTES.home} replace />} />
          </Routes>
        </Suspense>
      </AdminToastProvider>
    </AdminAuthProvider>
  );
}
