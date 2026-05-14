import { Navigate, Route, Routes } from 'react-router-dom';
import AdminLayout from './admin/layouts/AdminLayout';
import AdminProtectedRoute from './admin/components/AdminProtectedRoute';
import AdminPublicRoute from './admin/components/AdminPublicRoute';
import AdminLoginPage from './admin/pages/AdminLoginPage';
import AnalyticsPage from './admin/pages/AnalyticsPage';
import CategoriesPage from './admin/pages/CategoriesPage';
import CustomersPage from './admin/pages/CustomersPage';
import DashboardPage from './admin/pages/DashboardPage';
import OrdersPage from './admin/pages/OrdersPage';
import PlaceholderPage from './admin/pages/PlaceholderPage';
import ProductsPage from './admin/pages/ProductsPage';
import SettingsPage from './admin/pages/SettingsPage';
import { AdminAuthProvider } from './admin/context/AdminAuthContext';
import { AdminToastProvider } from './admin/context/AdminToastContext';
import AppLayout from './components/AppLayout';
import ProtectedRoute from './components/ProtectedRoute';
import PublicOnlyRoute from './components/PublicOnlyRoute';
import HomePage from './pages/HomePage';
import WishlistPage from './pages/WishlistPage';
import BagPage from './pages/BagPage';
import CheckoutPage from './pages/CheckoutPage';
import LoginPage from './pages/LoginPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ProfilePage from './pages/ProfilePage';
import OrderSuccessPage from './pages/OrderSuccessPage';
import { ROUTES } from './utils/constants';

export default function App() {
  return (
    <AdminAuthProvider>
      <AdminToastProvider>
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
            <Route path={ROUTES.wishlist} element={<WishlistPage />} />
            <Route path={ROUTES.bag} element={<BagPage />} />
            <Route path={ROUTES.checkout} element={<CheckoutPage />} />
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
            <Route path={ROUTES.orderSuccess} element={<OrderSuccessPage />} />
          </Route>
          <Route path="*" element={<Navigate to={ROUTES.home} replace />} />
        </Routes>
      </AdminToastProvider>
    </AdminAuthProvider>
  );
}
