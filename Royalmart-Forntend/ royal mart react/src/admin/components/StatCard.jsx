import { formatCurrency } from '../utils/formatters';

export default function StatCard({ title, value, icon, accent = 'gold', currency = false }) {
  const Icon = icon;

  return (
    <div className={`admin-stat-card admin-stat-card--${accent}`}>
      <div>
        <p>{title}</p>
        <h3>{currency ? formatCurrency(value) : value}</h3>
      </div>
      <div className="admin-stat-card__icon">
        <Icon />
      </div>
    </div>
  );
}
