import { http } from './http';

export const adminApi = {
  login(payload) {
    return http.post('/auth/login', payload);
  },
  logout() {
    return http.post('/auth/logout');
  },
  profile() {
    return http.get('/auth/profile');
  },
  stats() {
    return http.get('/dashboard/stats');
  },
  recentOrders() {
    return http.get('/dashboard/recent-orders');
  },
  salesReport() {
    return http.get('/dashboard/sales-report');
  },
  revenueReport() {
    return http.get('/dashboard/revenue-report');
  },
  analytics() {
    return http.get('/dashboard/analytics');
  },
  products(params) {
    return http.get('/products', { params });
  },
  createProduct(payload) {
    return http.post('/products', payload);
  },
  updateProduct(id, payload) {
    return http.patch(`/products/${id}`, payload);
  },
  deleteProduct(id) {
    return http.delete(`/products/${id}`);
  },
  categories() {
    return http.get('/categories');
  },
  createCategory(payload) {
    return http.post('/categories', payload);
  },
  updateCategory(id, payload) {
    return http.patch(`/categories/${id}`, payload);
  },
  deleteCategory(id) {
    return http.delete(`/categories/${id}`);
  },
  users(params) {
    return http.get('/users', { params });
  },
  updateUserRole(id, payload) {
    return http.patch(`/users/role/${id}`, payload);
  },
  toggleBlockUser(id, payload) {
    return http.patch(`/users/block/${id}`, payload);
  },
  deleteUser(id) {
    return http.delete(`/users/${id}`);
  },
  orders(params) {
    return http.get('/orders', { params });
  },
  updateOrderStatus(id, payload) {
    return http.patch(`/orders/status/${id}`, payload);
  },
  updateOrder(id, payload) {
    return http.patch(`/orders/${id}`, payload);
  },
  createOrder(payload) {
    return http.post('/orders', payload);
  }
};
