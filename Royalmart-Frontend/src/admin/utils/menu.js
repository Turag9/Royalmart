import {
  FiBarChart2,
  FiBox,
  FiGrid,
  FiMap,
  FiMapPin,
  FiPackage,
  FiSettings,
  FiShoppingBag,
  FiUsers
} from 'react-icons/fi';

export const adminMenu = [
  { label: 'Dashboard', path: '/admin', icon: FiBarChart2 },
  { label: 'Shops', path: '/admin/shops', icon: FiShoppingBag },
  { label: 'Products', path: '/admin/products', icon: FiPackage },
  { label: 'Categories', path: '/admin/categories', icon: FiGrid },
  { label: 'Locations', path: '/admin/locations', icon: FiMapPin },
  { label: 'Areas', path: '/admin/areas', icon: FiMap },
  { label: 'Customers', path: '/admin/customers', icon: FiUsers },
  { label: 'Orders', path: '/admin/orders', icon: FiBox },
  { label: 'Analytics', path: '/admin/analytics', icon: FiBarChart2 },
  { label: 'Settings', path: '/admin/settings', icon: FiSettings }
];
