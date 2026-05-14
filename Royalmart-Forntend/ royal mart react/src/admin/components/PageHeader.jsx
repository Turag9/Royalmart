export default function PageHeader({ eyebrow, title, subtitle, action }) {
  return (
    <div className="admin-page-header">
      <div>
        {eyebrow ? <span className="admin-eyebrow">{eyebrow}</span> : null}
        <h1>{title}</h1>
        {subtitle ? <p>{subtitle}</p> : null}
      </div>
      {action ? <div>{action}</div> : null}
    </div>
  );
}
