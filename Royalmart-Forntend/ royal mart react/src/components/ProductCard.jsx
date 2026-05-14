import { useState } from 'react';
import { useStore } from '../store/StoreContext';
import { calcSalePrice, formatPrice, formatRatingCount } from '../utils/helpers';

export default function ProductCard({ product }) {
  const { addToCart, toggleWishlist, wishlist } = useStore();
  const [added, setAdded] = useState(false);
  const originalPrice = product.price;
  const discountPct = Math.round(product.discountPercentage);
  const salePrice = calcSalePrice(originalPrice, discountPct);
  const hasDiscount = discountPct > 0;
  const isWishlisted = wishlist.includes(String(product.id));
  const reviewCount = product.reviews ? product.reviews.length : 0;

  function handleAddToCart() {
    addToCart(product.id);

    // The button briefly changes text to match the original storefront behavior.
    setAdded(true);
    window.setTimeout(() => setAdded(false), 1200);
  }

  return (
    <div className="item-container">
      <div className="item-image-wrapper">
        <img className="item-image" src={product.thumbnail} alt={product.title} loading="lazy" />
        <button
          className={`wishlist-btn${isWishlisted ? ' wishlisted' : ''}`}
          onClick={() => toggleWishlist(product.id)}
          aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
        >
          <span className="material-symbols-outlined wishlist-icon">favorite</span>
        </button>
        {product.rating > 0 ? (
          <div className="item-rating">
            <span className="rating-star">★</span>
            <span className="rating-value">{product.rating.toFixed(1)}</span>
            <span className="rating-divider">|</span>
            <span className="rating-count">{formatRatingCount(reviewCount)}</span>
          </div>
        ) : null}
      </div>
      <div className="item-details">
        <div className="company-name">{product.brand || product.category}</div>
        <div className="item-name">{product.title}</div>
        <div className="item-price">
          <span className="price">{formatPrice(salePrice)}</span>
          {hasDiscount ? <span className="orginal-price">{formatPrice(originalPrice)}</span> : null}
          {hasDiscount ? <span className="offer">({discountPct}% OFF)</span> : null}
        </div>
      </div>
      <button
        className={`add-bag${added ? ' added' : ''}`}
        data-item-id={product.id}
        onClick={handleAddToCart}
      >
        {added ? '✓ ADDED' : 'ADD TO CART'}
      </button>
    </div>
  );
}
