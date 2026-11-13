import { Link } from 'react-router-dom';
import { ROUTES } from '../utils/constants';

export default function Logo({ onClick }) {
  return (
    <div className="logo_container">
      <Link to={ROUTES.home} className="logo_link" onClick={onClick}>
        <div className="logo_icon">
          <svg className="crown_svg" viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
            <rect width="64" height="64" rx="8" fill="#0a0a0a" />
            <path
              d="M12 42 L18 22 L26 32 L32 16 L38 32 L46 22 L52 42 Z"
              fill="none"
              stroke="#c9a96e"
              strokeWidth="2.5"
              strokeLinejoin="round"
            />
            <rect x="12" y="42" width="40" height="4" rx="1.5" fill="#c9a96e" />
            <circle cx="18" cy="20" r="2.5" fill="#e0c591" />
            <circle cx="32" cy="14" r="2.5" fill="#e0c591" />
            <circle cx="46" cy="20" r="2.5" fill="#e0c591" />
          </svg>
        </div>
        <div className="logo_text">
          <span className="brand_name">Royal Mart</span>
          <span className="brand_tagline">Premium Fashion</span>
        </div>
      </Link>
    </div>
  );
}
