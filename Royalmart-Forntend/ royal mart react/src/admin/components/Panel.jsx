export default function Panel({ title, subtitle, children, action }) {
  return (
    <section className="admin-panel">
      <div className="admin-panel__header">
        <div>
          <h3>{title}</h3>
          {subtitle ? <p>{subtitle}</p> : null}
        </div>
        {action ? <div>{action}</div> : null}
      </div>
      {children}
    </section>
  );
}
