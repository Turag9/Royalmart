import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { useStore } from '../store/StoreContext';
import { CATEGORY_LINKS, ROUTES } from '../utils/constants';
import Logo from './Logo';

function isHomePath(pathname) {
  return pathname === ROUTES.home || pathname === ROUTES.legacyHome;
}

function getBadgeVisibilityStyle(count) {
  return { visibility: count > 0 ? 'visible' : 'hidden' };
}

export default function Header() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { cart, wishlist, user } = useStore();
  const [searchInput, setSearchInput] = useState(searchParams.get('search') || '');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const activeCategory = isHomePath(location.pathname) ? searchParams.get('category') : null;
  const profileHref = user ? ROUTES.profile : ROUTES.login;

  useEffect(() => {
    setSearchInput(searchParams.get('search') || '');
  }, [searchParams]);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location]);

  function handleLogoClick(event) {
    if (!isHomePath(location.pathname)) return;
    event.preventDefault();
    navigate(ROUTES.home);
    setSearchInput('');
  }

  function handleCategoryClick(event, category) {
    if (!isHomePath(location.pathname)) return;

    event.preventDefault();

    if (activeCategory === category) {
      navigate(ROUTES.home);
      setSearchInput('');
      return;
    }

    setSearchInput('');
    navigate(`/?category=${encodeURIComponent(category)}`);
  }

  function triggerSearch() {
    const trimmed = searchInput.trim();
    if (!trimmed) return;

    navigate(`/?search=${encodeURIComponent(trimmed)}`);
  }

  return (
    <>
      <header>
        <Logo onClick={handleLogoClick} />

        <nav className="nav_bar">
          {CATEGORY_LINKS.map((link) => {
            const href = `/?category=${encodeURIComponent(link.category)}`;
            const active = activeCategory === link.category;

            return (
              <Link
                key={link.category}
                to={href}
                data-category={link.category}
                className={active ? 'active' : ''}
                onClick={(event) => handleCategoryClick(event, link.category)}
              >
                {link.label}
                {link.badge ? <sup>{link.badge}</sup> : null}
              </Link>
            );
          })}
        </nav>

        <div className="search_bar">
          <span
            className="material-symbols-outlined search_icon"
            onClick={triggerSearch}
            role="button"
            tabIndex={0}
            onKeyDown={(event) => {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                triggerSearch();
              }
            }}
          >
            search
          </span>
          <input
            className="search_input"
            placeholder="Search for products, brands and more"
            value={searchInput}
            onChange={(event) => setSearchInput(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                event.preventDefault();
                triggerSearch();
              }
            }}
          />
        </div>

        <div className="action_bar">
          <Link className="action_container" to={profileHref} id="profile-btn">
            <span className="material-symbols-outlined action_icon">person</span>
            <span className="action_name">Profile</span>
          </Link>
          <Link className="action_container" to={ROUTES.wishlist}>
            <span className="material-symbols-outlined action_icon">favorite</span>
            <span className="action_name">Wishlist</span>
            <span
              className="badge wishlist-count"
              style={getBadgeVisibilityStyle(wishlist.length)}
            >
              {wishlist.length}
            </span>
          </Link>
          <Link className="action_container" to={ROUTES.bag}>
            <span className="material-symbols-outlined action_icon">shopping_bag</span>
            <span className="action_name">Bag</span>
            <span className="badge bag-count" style={getBadgeVisibilityStyle(cart.length)}>
              {cart.length}
            </span>
          </Link>
        </div>

        <button
          className="hamburger-btn"
          onClick={() => setMobileMenuOpen(true)}
          aria-label="Open menu"
        >
          <span className="material-symbols-outlined">menu</span>
        </button>
      </header>

      {/* Mobile Side Drawer */}
      <div
        className={`mobile-overlay ${mobileMenuOpen ? 'open' : ''}`}
        onClick={() => setMobileMenuOpen(false)}
      />
      <aside className={`mobile-drawer ${mobileMenuOpen ? 'open' : ''}`}>
        <button
          className="mobile-drawer-close"
          onClick={() => setMobileMenuOpen(false)}
          aria-label="Close menu"
        >
          <span className="material-symbols-outlined">close</span>
        </button>

        <div className="mobile-drawer-actions">
          <Link className="mobile-drawer-link" to={profileHref}>
            <span className="material-symbols-outlined">person</span>
            Profile
          </Link>
          <Link className="mobile-drawer-link" to={ROUTES.wishlist}>
            <span className="material-symbols-outlined">favorite</span>
            Wishlist
            {wishlist.length > 0 && <span className="mobile-badge">{wishlist.length}</span>}
          </Link>
          <Link className="mobile-drawer-link" to={ROUTES.bag}>
            <span className="material-symbols-outlined">shopping_bag</span>
            Bag
            {cart.length > 0 && <span className="mobile-badge">{cart.length}</span>}
          </Link>
        </div>

        <div className="mobile-drawer-divider" />

        <nav className="mobile-drawer-nav">
          {CATEGORY_LINKS.map((link) => {
            const href = `/?category=${encodeURIComponent(link.category)}`;
            const active = activeCategory === link.category;

            return (
              <Link
                key={link.category}
                to={href}
                className={active ? 'active' : ''}
                onClick={(event) => handleCategoryClick(event, link.category)}
              >
                {link.label}
                {link.badge ? <sup>{link.badge}</sup> : null}
              </Link>
            );
          })}
        </nav>
      </aside>
    </>
  );
}
