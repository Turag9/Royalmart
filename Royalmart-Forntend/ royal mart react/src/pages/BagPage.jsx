import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useDocumentTitle from '../hooks/useDocumentTitle';
import { useStore } from '../store/StoreContext';
import { ROUTES } from '../utils/constants';
import { resolveCatalogProduct } from '../utils/api';
import { formatPrice, pluralise } from '../utils/helpers';

const CONVENIENCE_FEE = 99;

export default function BagPage() {
  useDocumentTitle('Royal Mart — Your Bag');

  const navigate = useNavigate();
  const { cart, removeFromCart, setToast } = useStore();
  const [bagItems, setBagItems] = useState([]);

  useEffect(() => {
    let active = true;

    async function loadBag() {
      // Fetch all products in parallel — way faster than the old sequential loop.
      const resolved = (await Promise.all(cart.map(resolveCatalogProduct))).filter(Boolean);
      if (active) setBagItems(resolved);
    }

    loadBag();
    return () => {
      active = false;
    };
  }, [cart]);

  const totalMRP = bagItems.reduce((sum, item) => sum + item.original_price, 0);
  const totalDiscount = bagItems.reduce(
    (sum, item) => sum + (item.original_price - item.current_price),
    0
  );
  const grandTotal = totalMRP - totalDiscount + CONVENIENCE_FEE;

  function handlePlaceOrder() {
    if (!cart.length) {
      setToast('Your bag is empty');
      return;
    }

    navigate(ROUTES.checkout);
  }

  return (
    <div className="bag-page">
      <div className="bag-items-container">
        {!bagItems.length ? (
          <div className="bag-empty">
            <span className="material-symbols-outlined bag-empty-icon">shopping_bag</span>
            <p className="bag-empty-title">Your bag is empty</p>
            <p className="bag-empty-text">Browse our collection and add items you love.</p>
            <Link className="bag-empty-link" to={ROUTES.home}>
              CONTINUE SHOPPING
            </Link>
          </div>
        ) : (
          bagItems.map((item, index) => {
            const hasDiscount = item.discount_percentage > 0;

            return (
              <div className="bag-item-container" key={`${item.id}-${index}`}>
                <div className="item-left-part">
                  <img className="bag-item-img" src={item.image} alt={item.item_name} />
                </div>
                <div className="item-right-part">
                  <div className="company">{item.company}</div>
                  <div className="item-name">{item.item_name}</div>
                  <div className="price-container">
                    <span className="current-price">{formatPrice(item.current_price)}</span>
                    <span className="original-price">{formatPrice(item.original_price)}</span>
                    {hasDiscount ? (
                      <span className="discount-percentage">
                        ({item.discount_percentage}% OFF)
                      </span>
                    ) : null}
                  </div>
                  <div className="return-period">
                    <span className="return-period-days">{item.return_period} days</span> return
                    available
                  </div>
                  <div className="delivery-details">
                    Delivery by <span className="delivery-details-days">{item.delivery_date}</span>
                  </div>
                </div>
                <div className="remove-from-cart" onClick={() => removeFromCart(item.id)}>
                  ✕
                </div>
              </div>
            );
          })
        )}
      </div>

      <div className="bag-summary">
        {bagItems.length ? (
          <>
            <div className="bag-details-container">
              <div className="price-header">Price Details ({pluralise(bagItems.length, 'Item')})</div>
              <div className="price-item">
                <span className="price-item-tag">Total MRP</span>
                <span className="price-item-value">{formatPrice(totalMRP)}</span>
              </div>
              <div className="price-item">
                <span className="price-item-tag">Discount on MRP</span>
                <span className="price-item-value priceDetail-base-discount">
                  -{formatPrice(totalDiscount)}
                </span>
              </div>
              <div className="price-item">
                <span className="price-item-tag">Convenience Fee</span>
                <span className="price-item-value">{formatPrice(CONVENIENCE_FEE)}</span>
              </div>
              <hr className="summary-divider" />
              <div className="price-footer">
                <span className="price-item-tag">Total Amount</span>
                <span className="price-item-value">{formatPrice(grandTotal)}</span>
              </div>
            </div>
            <button className="btn-place-order" onClick={handlePlaceOrder}>
              Place Order
            </button>
          </>
        ) : null}
      </div>
    </div>
  );
}
