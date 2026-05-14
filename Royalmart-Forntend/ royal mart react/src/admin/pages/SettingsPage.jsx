import PageHeader from '../components/PageHeader';
import Panel from '../components/Panel';

export default function SettingsPage() {
  return (
    <div className="admin-page">
      <PageHeader
        eyebrow="Configuration"
        title="Admin settings"
        subtitle="A compact handoff space for core environment and deployment notes."
      />

      <Panel title="Environment reminders" subtitle="Key runtime details for local setup">
        <div className="admin-settings-list">
          <div className="admin-metric-row">
            <span>Backend API URL</span>
            <strong>{import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'}</strong>
          </div>
          <div className="admin-metric-row">
            <span>Auth Mode</span>
            <strong>JWT cookie + admin role guard</strong>
          </div>
          <div className="admin-metric-row">
            <span>Seeded Admin</span>
            <strong>admin@royalmart.com</strong>
          </div>
        </div>
      </Panel>
    </div>
  );
}
