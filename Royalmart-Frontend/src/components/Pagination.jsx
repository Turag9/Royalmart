import { buildPageNumbers } from '../utils/helpers';

export default function Pagination({ currentPage, totalPages, totalProducts, perPage, onChange }) {
  if (totalPages <= 1) return <div className="pagination" id="pagination" />;

  const pages = buildPageNumbers(currentPage, totalPages);
  const startItem = (currentPage - 1) * perPage + 1;
  const endItem = Math.min(currentPage * perPage, totalProducts);

  return (
    <div className="pagination" id="pagination">
      <button
        className="page-btn page-nav"
        onClick={() => onChange(currentPage - 1)}
        disabled={currentPage === 1}
      >
        <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
          chevron_left
        </span>
      </button>
      {pages.map((page, index) =>
        page === '...' ? (
          <span key={`${page}-${index}`} className="page-ellipsis">
            …
          </span>
        ) : (
          <button
            key={page}
            className={`page-btn${page === currentPage ? ' active' : ''}`}
            onClick={() => onChange(page)}
          >
            {page}
          </button>
        )
      )}
      <button
        className="page-btn page-nav"
        onClick={() => onChange(currentPage + 1)}
        disabled={currentPage === totalPages}
      >
        <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
          chevron_right
        </span>
      </button>
      <div className="page-info">
        Showing {startItem}–{endItem} of {totalProducts} products
      </div>
    </div>
  );
}
