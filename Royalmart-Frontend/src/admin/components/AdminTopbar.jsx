import { useState } from 'react';
import { FiBell, FiLogOut, FiSearch } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import { useAdminAuth } from '../context/AdminAuthContext';
import { useAdminToast } from '../context/AdminToastContext';

const SEARCH_ROUTES = [
  { keywords: ['product', 'products', 'item'], path: '/admin/products' },
  { keywords: ['user', 'users', 'customer', 'customers'], path: '/admin/customers' },
  { keywords: ['order', 'orders'], path: '/admin/orders' },
  { keywords: ['category', 'categories'], path: '/admin/categories' },
  { keywords: ['shop', 'shops', 'store'], path: '/admin/shops' },
  { keywords: ['analytics', 'report', 'stats'], path: '/admin/analytics' },
  { keywords: ['setting', 'settings', 'config'], path: '/admin/settings' },
  { keywords: ['location', 'locations'], path: '/admin/locations' },
  { keywords: ['area', 'areas'], path: '/admin/areas' },
  { keywords: ['dashboard', 'home'], path: '/admin' }
];

export default function AdminTopbar() {
  const { admin, logout } = useAdminAuth();
  const { showToast } = useAdminToast();
  const navigate = useNavigate();
  const [searchValue, setSearchValue] = useState('');

  async function handleLogout() {
    await logout();
    showToast('Logged out successfully', 'success');
  }

  function handleSearch(event) {
    if (event.key !== 'Enter' || !searchValue.trim()) return;
    const query = searchValue.trim().toLowerCase();
    const match = SEARCH_ROUTES.find((route) =>
      route.keywords.some((kw) => query.includes(kw))
    );

    if (match) {
      navigate(`${match.path}?search=${encodeURIComponent(searchValue.trim())}`);
    } else {
      navigate(`/admin/products?search=${encodeURIComponent(searchValue.trim())}`);
    }
    setSearchValue('');
  }

  return (
    <header className="admin-topbar">
      <div className="admin-search">
        <FiSearch />
        <input
          type="text"
          placeholder="Search products, users, orders"
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          onKeyDown={handleSearch}
        />
      </div>

      <div className="admin-topbar__actions">
        <button type="button" className="admin-icon-btn">
          <FiBell />
        </button>

        <div className="admin-user-chip">
          <strong>{admin?.displayName || admin?.name || 'Admin'}</strong>
          <span>{admin?.email}</span>
        </div>

        <button type="button" className="admin-icon-btn" onClick={handleLogout}>
          <FiLogOut />
        </button>
      </div>
    </header>
  );
}
