export default function StatusBadge({ value }) {
  const normalized = String(value || '').toLowerCase();
  return <span className={`admin-status admin-status--${normalized}`}>{value}</span>;
}
