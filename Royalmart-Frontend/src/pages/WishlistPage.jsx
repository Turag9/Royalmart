import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import useDocumentTitle from '../hooks/useDocumentTitle';
import { useStore } from '../store/StoreContext';
import { ROUTES } from '../utils/constants';
import { resolveCatalogProduct } from '../utils/api';
import { formatPrice, pluralise } from '../utils/helpers';

export default function WishlistPage() {
  useDocumentTitle('Royal Mart — Your Wishlist');

  const { wishlist, cart, removeFromWishlist, moveWishlistItemToCart } = useStore();
  const [products, setProducts] = useState(null);

  useEffect(() => {
    let active = true;

    async function loadWishlist() {
      if (!wishlist.length) {
        setProducts([]);
        return;
      }

      // Parallel fetch — much faster than the previous sequential loop.
      const resolved = (await Promise.all(wishlist.map(resolveCatalogProduct))).filter(Boolean);

      if (active) setProducts(resolved);
    }

    loadWishlist();

    return () => {
      active = false;
    };
  }, [wishlist]);

  return (
    <div className="wishlist-page">
      <div className="wishlist-header">
        <h2 className="wishlist-title">My Wishlist</h2>
        <p className="wishlist-subtitle" id="wishlist-count-text">
          {wishlist.length ? pluralise(wishlist.length, 'item') : ''}
        </p>
      </div>
      <div className="wishlist-grid" id="wishlist-grid">
        {products === null ? (
          <div className="loading-spinner">
            <div className="spinner" />
            <p>Loading wishlist...</p>
          </div>
        ) : null}

        {products && products.length === 0 ? (
          <div className="wishlist-empty">
            <span className="material-symbols-outlined wishlist-empty-icon">favorite</span>
            <p className="wishlist-empty-title">Your wishlist is empty</p>
            <p className="wishlist-empty-text">
              Save the items you love by tapping the heart icon.
            </p>
            <Link className="wishlist-empty-link" to={ROUTES.home}>
              EXPLORE PRODUCTS
            </Link>
          </div>
        ) : null}

        {products &&
          products.map((product) => {
            const hasDiscount = product.discount_percentage > 0;
            const inCart = cart.includes(String(product.id));

            return (
              <div className="wishlist-card" id={`wishlist-item-${product.id}`} key={product.id}>
                <div className="wishlist-card-image">
                  <img src={product.image} alt={product.item_name} loading="lazy" />
                  <button
                    className="wishlist-remove-btn"
                    onClick={() => removeFromWishlist(product.id)}
                    title="Remove from wishlist"
                  >
                    <span className="material-symbols-outlined">close</span>
                  </button>
                  {product.rating > 0 ? (
                    <div className="item-rating">
                      <span className="rating-star">★</span>
                      <span className="rating-value">{product.rating.toFixed(1)}</span>
                      <span className="rating-divider">|</span>
                      <span className="rating-count">{product.reviews}</span>
                    </div>
                  ) : null}
                </div>
                <div className="wishlist-card-details">
                  <div className="company-name">{product.company}</div>
                  <div className="item-name">{product.item_name}</div>
                  <div className="item-price">
                    <span className="price">{formatPrice(product.current_price)}</span>
                    {hasDiscount ? (
                      <span className="orginal-price">{formatPrice(product.original_price)}</span>
                    ) : null}
                    {hasDiscount ? (
                      <span className="offer">({product.discount_percentage}% OFF)</span>
                    ) : null}
                  </div>
                </div>
                <button
                  className={`wishlist-add-bag ${inCart ? 'added' : ''}`}
                  onClick={() => moveWishlistItemToCart(product.id)}
                >
                  <span className="material-symbols-outlined wishlist-bag-icon">
                    {inCart ? 'check' : 'shopping_bag'}
                  </span>
                  {inCart ? 'ADDED TO BAG' : 'MOVE TO BAG'}
                </button>
              </div>
            );
          })}
      </div>
    </div>
  );
}
