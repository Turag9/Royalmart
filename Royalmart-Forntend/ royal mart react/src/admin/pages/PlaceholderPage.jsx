import PageHeader from '../components/PageHeader';
import Panel from '../components/Panel';

export default function PlaceholderPage({ title }) {
  return (
    <div className="admin-page">
      <PageHeader
        eyebrow="Workspace"
        title={`${title} module`}
        subtitle={`The ${title.toLowerCase()} navigation slot is ready to extend without changing the admin shell.`}
      />

      <Panel title={`${title} coming next`} subtitle="Reserved page in the current dashboard structure">
        <p className="admin-muted-copy">
          This screen is intentionally scaffolded so the sidebar matches the requested admin IA while the
          current delivery keeps products, categories, customers, orders, analytics, auth, and dashboard
          reporting fully functional.
        </p>
      </Panel>
    </div>
  );
}
