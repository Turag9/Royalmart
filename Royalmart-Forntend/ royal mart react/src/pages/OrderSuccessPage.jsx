import { Link } from 'react-router-dom';
import useDocumentTitle from '../hooks/useDocumentTitle';
import { useStore } from '../store/StoreContext';
import { PAYMENT_METHOD_LABELS, ROUTES } from '../utils/constants';
import { formatLongDate, formatPrice, pluralise } from '../utils/helpers';

export default function OrderSuccessPage() {
  useDocumentTitle('Royal Mart — Order Confirmed');

  const { lastOrder } = useStore();

  const infoRows = lastOrder
    ? [
        { icon: 'tag', label: 'Order ID', value: lastOrder.id },
        {
          icon: 'calendar_today',
          label: 'Date',
          value: formatLongDate(lastOrder.date)
        },
        {
          icon: 'inventory_2',
          label: 'Items',
          value: pluralise(lastOrder.itemCount, 'item')
        },
        {
          icon: 'payments',
          label: 'Payment',
          value: PAYMENT_METHOD_LABELS[lastOrder.paymentMethod] || lastOrder.paymentMethod
        },
        {
          icon: 'receipt',
          label: 'Total Paid',
          value: formatPrice(lastOrder.total)
        }
      ]
    : [];

  return (
    <div className="success-page">
      <div className="checkout-steps">
        <div className="step completed">
          <span className="material-symbols-outlined step-icon">shopping_bag</span>
          <span className="step-label">Bag</span>
        </div>
        <div className="step-line completed" />
        <div className="step completed">
          <span className="material-symbols-outlined step-icon">payments</span>
          <span className="step-label">Payment</span>
        </div>
        <div className="step-line completed" />
        <div className="step active completed">
          <span className="material-symbols-outlined step-icon">check_circle</span>
          <span className="step-label">Confirmation</span>
        </div>
      </div>

      <div className="success-card">
        <div className="success-checkmark">
          <svg className="checkmark-svg" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 52 52">
            <circle className="checkmark-circle" cx="26" cy="26" r="25" fill="none" />
            <path className="checkmark-check" fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8" />
          </svg>
        </div>
        <h2 className="success-title">Order Placed Successfully!</h2>
        <p className="success-subtitle">Thank you for shopping with Royal Mart</p>

        <div className="success-details" id="success-details">
          {!lastOrder ? <p className="success-no-order">No recent order found.</p> : null}
          {lastOrder
            ? infoRows.map((row, index) => (
                <div
                  className={`success-info-row${index === infoRows.length - 1 ? ' total' : ''}`}
                  key={row.label}
                >
                  <span className="material-symbols-outlined">{row.icon}</span>
                  <div>
                    <span className="info-label">{row.label}</span>
                    <span className="info-value">{row.value}</span>
                  </div>
                </div>
              ))
            : null}
        </div>

        <div className="success-actions">
          <Link to={ROUTES.home} className="btn-continue-shopping">
            <span className="material-symbols-outlined">storefront</span>
            CONTINUE SHOPPING
          </Link>
          <Link to={ROUTES.profile} className="btn-view-orders">
            <span className="material-symbols-outlined">receipt_long</span>
            VIEW MY ORDERS
          </Link>
        </div>
      </div>
    </div>
  );
}
