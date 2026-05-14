import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useDocumentTitle from '../hooks/useDocumentTitle';
import { useStore } from '../store/StoreContext';
import { resolveCheckoutProduct } from '../utils/api';
import {
  CHECKOUT_CONVENIENCE_FEE,
  PAYMENT_OPTIONS,
  ROUTES
} from '../utils/constants';
import { formatPrice } from '../utils/helpers';

export default function CheckoutPage() {
  useDocumentTitle('Royal Mart — Checkout');

  const navigate = useNavigate();
  const { cart, user, placeOrder } = useStore();
  const [checkoutItems, setCheckoutItems] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [cardDetails, setCardDetails] = useState({
    number: '',
    expiry: '',
    cvv: ''
  });

  useEffect(() => {
    let active = true;

    async function loadCheckoutItems() {
      if (!cart.length) {
        setCheckoutItems([]);
        return;
      }

      const results = await Promise.all(cart.map((id) => resolveCheckoutProduct(id)));
      // If one item fails to load, we still show the rest instead of breaking checkout.
      if (active) setCheckoutItems(results.filter(Boolean));
    }

    loadCheckoutItems();

    return () => {
      active = false;
    };
  }, [cart]);

  const totalMRP = (checkoutItems || []).reduce((sum, item) => sum + item.originalPrice, 0);
  const discount = (checkoutItems || []).reduce((sum, item) => sum + (item.originalPrice - item.price), 0);
  const subtotal = (checkoutItems || []).reduce((sum, item) => sum + item.price, 0);
  const total = subtotal + CHECKOUT_CONVENIENCE_FEE;

  async function handleConfirmOrder() {
    if (!checkoutItems?.length) {
      window.alert('Your bag is empty!');
      return;
    }

    if (paymentMethod === 'card') {
      // Light validation is enough here, we just want to stop obviously incomplete submissions.
      if (!cardDetails.number.trim() || !cardDetails.expiry.trim() || !cardDetails.cvv.trim()) {
        window.alert('Please fill in all card details.');
        return;
      }
    }

    const PAYMENT_MAP = { cod: 'COD', card: 'CARD', upi: 'BKASH' };

    const order = {
      id: `RM${Date.now().toString(36).toUpperCase()}`,
      date: new Date().toISOString(),
      status: 'PENDING',
      items: checkoutItems.map((item) => ({ name: item.name, price: item.price })),
      total,
      paymentMethod,
      itemCount: checkoutItems.length,
      userId: user?.id,
      paymentMethodCode: PAYMENT_MAP[paymentMethod] || 'COD'
    };

    await placeOrder(order);
    navigate(ROUTES.orderSuccess);
  }

  return (
    <div className="checkout-page">
      <div className="checkout-steps">
        <div className="step completed">
          <span className="material-symbols-outlined step-icon">shopping_bag</span>
          <span className="step-label">Bag</span>
        </div>
        <div className="step-line" />
        <div className="step active">
          <span className="material-symbols-outlined step-icon">payments</span>
          <span className="step-label">Payment</span>
        </div>
        <div className="step-line" />
        <div className="step">
          <span className="material-symbols-outlined step-icon">check_circle</span>
          <span className="step-label">Confirmation</span>
        </div>
      </div>

      <div className="checkout-layout">
        <div className="checkout-summary">
          <h3 className="checkout-section-title">
            <span className="material-symbols-outlined">receipt_long</span>
            Order Summary
          </h3>
          <div className="checkout-items" id="checkout-items">
            {checkoutItems === null ? (
              <div className="loading-spinner">
                <div className="spinner" />
                <p>Loading order...</p>
              </div>
            ) : null}

            {checkoutItems && checkoutItems.length === 0 ? (
              <div className="checkout-empty">
                <span className="material-symbols-outlined">remove_shopping_cart</span>
                <p>Your bag is empty</p>
                <Link to={ROUTES.bag} className="btn-back-bag">
                  Go to Bag
                </Link>
              </div>
            ) : null}

            {checkoutItems &&
              checkoutItems.map((item) => (
                <div className="checkout-item" key={`${item.id}-${item.name}`}>
                  <img className="checkout-item-img" src={item.image} alt={item.name} />
                  <div className="checkout-item-info">
                    <p className="checkout-item-brand">{item.brand}</p>
                    <p className="checkout-item-name">{item.name}</p>
                    <div className="checkout-item-prices">
                      <span className="checkout-item-price">{formatPrice(item.price)}</span>
                      <span className="checkout-item-orig">{formatPrice(item.originalPrice)}</span>
                      <span className="checkout-item-off">{item.discount}% OFF</span>
                    </div>
                  </div>
                </div>
              ))}
          </div>

          <div className="checkout-totals" id="checkout-totals">
            {checkoutItems && checkoutItems.length > 0 ? (
              <>
                <div className="totals-row">
                  <span>Total MRP</span>
                  <span>{formatPrice(totalMRP)}</span>
                </div>
                <div className="totals-row discount">
                  <span>Discount on MRP</span>
                  <span>-{formatPrice(discount)}</span>
                </div>
                <div className="totals-row">
                  <span>Convenience Fee</span>
                  <span>{formatPrice(CHECKOUT_CONVENIENCE_FEE)}</span>
                </div>
                <div className="totals-row total">
                  <span>Total Amount</span>
                  <span>{formatPrice(total)}</span>
                </div>
              </>
            ) : null}
          </div>
        </div>

        <div className="checkout-payment">
          <h3 className="checkout-section-title">
            <span className="material-symbols-outlined">credit_card</span>
            Payment Method
          </h3>

          <div className="payment-options">
            {PAYMENT_OPTIONS.map((option) => (
              <label
                key={option.value}
                className={`payment-option${paymentMethod === option.value ? ' selected' : ''}`}
                id={option.id}
              >
                <input
                  type="radio"
                  name="payment"
                  value={option.value}
                  checked={paymentMethod === option.value}
                  onChange={() => setPaymentMethod(option.value)}
                />
                <span className="material-symbols-outlined payment-icon">{option.icon}</span>
                <div className="payment-info">
                  <span className="payment-name">{option.name}</span>
                  <span className="payment-desc">{option.desc}</span>
                </div>
                <span className="payment-check">
                  <span className="material-symbols-outlined">check_circle</span>
                </span>
              </label>
            ))}
          </div>

          <div className={`card-fields${paymentMethod === 'card' ? '' : ' hidden'}`} id="card-fields">
            <div className="form-group">
              <label className="form-label">Card Number</label>
              <input
                className="form-input"
                type="text"
                id="card-number"
                placeholder="1234  5678  9012  3456"
                maxLength="19"
                value={cardDetails.number}
                onChange={(event) =>
                  setCardDetails((current) => ({ ...current, number: event.target.value }))
                }
              />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Expiry</label>
                <input
                  className="form-input"
                  type="text"
                  id="card-expiry"
                  placeholder="MM / YY"
                  maxLength="7"
                  value={cardDetails.expiry}
                  onChange={(event) =>
                    setCardDetails((current) => ({ ...current, expiry: event.target.value }))
                  }
                />
              </div>
              <div className="form-group">
                <label className="form-label">CVV</label>
                <input
                  className="form-input"
                  type="password"
                  id="card-cvv"
                  placeholder="•••"
                  maxLength="4"
                  value={cardDetails.cvv}
                  onChange={(event) =>
                    setCardDetails((current) => ({ ...current, cvv: event.target.value }))
                  }
                />
              </div>
            </div>
          </div>

          <button
            className="btn-confirm-order"
            id="btn-confirm"
            onClick={handleConfirmOrder}
            disabled={checkoutItems ? checkoutItems.length === 0 : false}
          >
            <span className="material-symbols-outlined">lock</span>
            CONFIRM ORDER
          </button>

          <p className="checkout-secure">
            <span className="material-symbols-outlined">verified_user</span>
            Your payment is 100% secure
          </p>
        </div>
      </div>
    </div>
  );
}
