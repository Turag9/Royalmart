import { useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import ContactForm from '../components/ContactForm';
import Pagination from '../components/Pagination';
import ProductCard from '../components/ProductCard';
import useDocumentTitle from '../hooks/useDocumentTitle';
import { ROUTES } from '../utils/constants';
import { fetchProductList, fetchProductsByCategory, searchProducts } from '../utils/api';
import { CATEGORY_LABELS, PER_PAGE } from '../utils/constants';
import { pluralise } from '../utils/helpers';

const DEFAULT_SECTION = {
  title: 'Trending Now',
  subtitle: 'Discover our curated collection of premium products'
};

function ErrorState({ onRetry }) {
  return (
    <div className="loading-spinner">
      <span
        className="material-symbols-outlined"
        style={{ fontSize: '48px', color: 'var(--royal-danger)' }}
      >
        cloud_off
      </span>
      <p>Failed to load products.</p>
      <button className="retry-btn" onClick={onRetry}>
        RETRY
      </button>
    </div>
  );
}

function LoadingState({ message }) {
  return (
    <div className="loading-spinner" id="loading">
      <div className="spinner" />
      <p>{message}</p>
    </div>
  );
}

export default function HomePage() {
  useDocumentTitle('Royal Mart — Premium Fashion');

  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const headerRef = useRef(null);
  const lastQueryKeyRef = useRef('');
  const [loadingMessage, setLoadingMessage] = useState('Loading products...');
  const [isLoading, setIsLoading] = useState(true);
  const [products, setProducts] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [totalProducts, setTotalProducts] = useState(0);
  const [sectionTitle, setSectionTitle] = useState(DEFAULT_SECTION.title);
  const [sectionSubtitle, setSectionSubtitle] = useState(DEFAULT_SECTION.subtitle);
  const [error, setError] = useState(false);

  const category = searchParams.get('category');
  const search = searchParams.get('search');
  const queryKey = `${category || ''}|${search || ''}`;

  useEffect(() => {
    let active = true;

    async function loadProducts() {
      // When the URL query changes, we always restart from page 1 first.
      if (lastQueryKeyRef.current !== queryKey && currentPage !== 1) {
        lastQueryKeyRef.current = queryKey;
        setCurrentPage(1);
        return;
      }

      lastQueryKeyRef.current = queryKey;
      setError(false);
      setIsLoading(true);
      setProducts([]);

      try {
        if (category) {
          setLoadingMessage('Loading products...');
          const allProducts = await fetchProductsByCategory(category);

          // One nav tab can point to multiple categories, so we merge and sort here.
          allProducts.sort((left, right) => (right.rating || 0) - (left.rating || 0));

          if (!active) return;

          const total = allProducts.length;
          const pages = Math.ceil(total / PER_PAGE);
          const skip = (currentPage - 1) * PER_PAGE;
          const slice = allProducts.slice(skip, skip + PER_PAGE);
          const label = CATEGORY_LABELS[category] || 'Products';

          setSectionTitle(`${label} Collection`);
          setSectionSubtitle(`Showing ${pluralise(total, 'product')} in ${label}`);
          setProducts(slice);
          setTotalProducts(total);
          setTotalPages(pages);
        } else if (search) {
          setLoadingMessage(`Searching for "${search}"...`);
          // Search stays paginated on the API side so we only fetch what this page needs.
          const data = await searchProducts(search, currentPage, PER_PAGE);

          if (!active) return;

          setSectionTitle(`Search: "${search}"`);
          setSectionSubtitle(
            data.total > 0
              ? `Found ${pluralise(data.total, 'product')} for "${search}"`
              : 'No results found'
          );
          setProducts(data.products || []);
          setTotalProducts(data.total || 0);
          setTotalPages(Math.ceil((data.total || 0) / PER_PAGE));
        } else {
          setLoadingMessage('Loading products...');
          const data = await fetchProductList(currentPage, PER_PAGE);

          if (!active) return;

          setSectionTitle(DEFAULT_SECTION.title);
          setSectionSubtitle(DEFAULT_SECTION.subtitle);
          setProducts(data.products || []);
          setTotalProducts(data.total || 0);
          setTotalPages(Math.ceil((data.total || 0) / PER_PAGE));
        }

        // Bring the user back to the top of the results after page/filter changes.
        headerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      } catch {
        if (active) setError(true);
      } finally {
        if (active) setIsLoading(false);
      }
    }

    loadProducts();

    return () => {
      active = false;
    };
  }, [category, currentPage, search]);

  function retry() {
    navigate(0);
  }

  function handlePageChange(page) {
    if (page < 1 || page > totalPages || page === currentPage) return;
    setCurrentPage(page);
  }

  return (
    <>
      <div className="section-header" ref={headerRef}>
        <h2 className="section-title">{sectionTitle}</h2>
        <p className="section-subtitle">{sectionSubtitle}</p>
      </div>

      <div className="items-container" id="products-grid">
        {error ? (
          <ErrorState onRetry={retry} />
        ) : null}

        {!error && isLoading ? <LoadingState message={loadingMessage} /> : null}

        {!error && !isLoading && products.length === 0 ? (
          category ? (
            <div className="loading-spinner">
              <span
                className="material-symbols-outlined"
                style={{ fontSize: '48px', color: 'var(--royal-text-muted)' }}
              >
                inventory_2
              </span>
              <p>No products found in this category.</p>
            </div>
          ) : search ? (
            totalProducts === 0 ? (
              <div className="search-empty-state">
                <span
                  className="material-symbols-outlined"
                  style={{ fontSize: '56px', color: 'var(--royal-text-muted)', opacity: 0.5 }}
                >
                  search_off
                </span>
                <p className="search-empty-title">No products found for "{search}"</p>
                <p className="search-empty-text">
                  Try a different keyword or browse our categories.
                </p>
                <button className="search-reset-btn" onClick={() => navigate(ROUTES.home)}>
                  <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
                    storefront
                  </span>
                  BROWSE ALL PRODUCTS
                </button>
              </div>
            ) : null
          ) : null
        ) : null}

        {!error && products.length > 0
          ? products.map((product) => <ProductCard key={product.id} product={product} />)
          : null}
      </div>

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        totalProducts={totalProducts}
        perPage={PER_PAGE}
        onChange={handlePageChange}
      />

      <ContactForm />
    </>
  );
}
