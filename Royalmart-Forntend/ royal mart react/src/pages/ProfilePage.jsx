import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import ConfirmModal from '../components/ConfirmModal';
import useDocumentTitle from '../hooks/useDocumentTitle';
import { useStore } from '../store/StoreContext';
import { ROUTES } from '../utils/constants';
import { formatMonthYear, formatPrice, formatShortDate } from '../utils/helpers';

const PROFILE_STATS = [
  { icon: 'shopping_bag', key: 'cart', label: 'Items in Bag' },
  { icon: 'favorite', key: 'wishlist', label: 'Wishlist Items' },
  { icon: 'local_shipping', key: 'orders', label: 'Orders' }
];

export default function ProfilePage() {
  useDocumentTitle('Royal Mart — My Profile');

  const navigate = useNavigate();
  const { user, cart, wishlist, orders, cancelOrder, removeOrder, refreshOrders, logout } = useStore();
  const [pendingCancelId, setPendingCancelId] = useState(null);
  const statValues = {
    cart: cart.length,
    wishlist: wishlist.length,
    orders: orders.length
  };

  useEffect(() => {
    refreshOrders();
  }, []);

  useEffect(() => {
    function handleEscape(event) {
      if (event.key === 'Escape') {
        // Escape is a quick, familiar way to close the cancel dialog.
        setPendingCancelId(null);
      }
    }

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, []);

  if (!user) return null;

  return (
    <div className="profile-page">
      <div className="profile-card">
        <div className="profile-avatar" id="profile-avatar">
          {user.name.charAt(0).toUpperCase()}
        </div>
        <h2 className="profile-name" id="profile-name">
          {user.name}
        </h2>
        <p className="profile-email" id="profile-email">
          {user.email}
        </p>
        <p className="profile-member-since" id="profile-since">
          Member since{' '}
          {formatMonthYear(user.joinedAt)}
        </p>
      </div>

      <div className="profile-stats">
        {/* These cards all look the same, so we drive them from a small config list. */}
        {PROFILE_STATS.map((stat) => (
          <div className="stat-card" key={stat.key}>
            <span className="material-symbols-outlined stat-icon">{stat.icon}</span>
            <div className="stat-value" id={`stat-${stat.key}`}>
              {statValues[stat.key]}
            </div>
            <div className="stat-label">{stat.label}</div>
          </div>
        ))}
      </div>

      <div className="profile-section">
        <h3 className="profile-section-title">
          <span className="material-symbols-outlined">receipt_long</span>
          Order History
        </h3>
        <div className="order-list" id="order-list">
          {!orders.length ? (
            <div className="order-empty">
              <span className="material-symbols-outlined order-empty-icon">inventory_2</span>
              <p className="order-empty-title">No orders yet</p>
              <p className="order-empty-text">
                Your order history will appear here after your first purchase.
              </p>
              <Link className="order-empty-link" to={ROUTES.home}>
                START SHOPPING
              </Link>
            </div>
          ) : (
            orders.map((order) => (
              <div className="order-card" id={`order-${order.id}`} key={order.id}>
                <div className="order-header">
                  <span className="order-id">Order #{order.id}</span>
                  <span
                    className={`order-status order-status--${(order.status || 'PENDING').toLowerCase()}`}
                  >
                    {order.status || 'PENDING'}
                  </span>
                  <span className="order-date">{formatShortDate(order.date)}</span>
                </div>
                <div className="order-items">
                  {order.items.map((item, index) => (
                    <div className="order-item-row" key={`${order.id}-${index}`}>
                      <span>{item.name}</span>
                      <span>{formatPrice(item.price)}</span>
                    </div>
                  ))}
                </div>
                <div className="order-footer">
                  <div className="order-total">
                    <span>Total</span>
                    <span>{formatPrice(order.total)}</span>
                  </div>
                  {order.status !== 'CANCELLED' && order.status !== 'DELIVERED' && order.status !== 'SHIPPED' && (
                    <button className="btn-cancel-order" onClick={() => setPendingCancelId(order.id)}>
                      <span className="material-symbols-outlined">cancel</span>
                      Cancel Order
                    </button>
                  )}
                  {(order.status === 'CANCELLED' || order.status === 'DELIVERED') && (
                    <button className="btn-cancel-order" onClick={() => removeOrder(order.id)}>
                      <span className="material-symbols-outlined">delete</span>
                      Remove
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="profile-actions">
        <button
          className="profile-logout-btn"
          onClick={() => {
            logout();
            navigate(ROUTES.login);
          }}
        >
          <span className="material-symbols-outlined">logout</span>
          LOGOUT
        </button>
      </div>

      {pendingCancelId ? (
        <ConfirmModal
          orderId={pendingCancelId}
          onClose={() => setPendingCancelId(null)}
          onConfirm={() => {
            // Close right away so the UI feels instant after cancelling.
            cancelOrder(pendingCancelId);
            setPendingCancelId(null);
          }}
        />
      ) : null}
    </div>
  );
}
