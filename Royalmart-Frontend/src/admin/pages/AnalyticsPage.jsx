import { useEffect, useState } from 'react';
import { CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import DataTable from '../components/DataTable';
import PageHeader from '../components/PageHeader';
import Panel from '../components/Panel';
import { useAdminToast } from '../context/AdminToastContext';
import { adminApi } from '../services/adminApi';
import { getApiError } from '../services/http';

export default function AnalyticsPage() {
  const { showToast } = useAdminToast();
  const [revenue, setRevenue] = useState([]);
  const [analytics, setAnalytics] = useState(null);

  useEffect(() => {
    Promise.all([adminApi.revenueReport(), adminApi.analytics()])
      .then(([revenueResponse, analyticsResponse]) => {
        setRevenue(revenueResponse.data?.data || []);
        setAnalytics(analyticsResponse.data?.data || null);
      })
      .catch((error) => {
        showToast(getApiError(error, 'Failed to load analytics'), 'error');
      });
  }, []);

  return (
    <div className="admin-page">
      <PageHeader
        eyebrow="Insights"
        title="Business analytics"
        subtitle="Watch category performance and monitor low-stock items before they hurt sales."
      />

      <div className="admin-grid admin-grid--two">
        <Panel title="Revenue by category" subtitle="Where sales are currently strongest">
          <div className="admin-chart">
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={revenue}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(201,169,110,0.08)" />
                <XAxis dataKey="name" stroke="#c8c3b8" />
                <YAxis stroke="#c8c3b8" />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="revenue" stroke="#c9a96e" strokeWidth={3} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Panel>

        <Panel title="Role and status mix" subtitle="Who is using the system and how orders are flowing">
          <div className="admin-analytics-summary">
            <div>
              <h4>User Roles</h4>
              {(analytics?.usersByRole || []).map((item) => (
                <div key={item.role} className="admin-metric-row">
                  <span>{item.role}</span>
                  <strong>{item._count.role}</strong>
                </div>
              ))}
            </div>
            <div>
              <h4>Order Status</h4>
              {(analytics?.orderStatusCounts || []).map((item) => (
                <div key={item.status} className="admin-metric-row">
                  <span>{item.status}</span>
                  <strong>{item._count.status}</strong>
                </div>
              ))}
            </div>
          </div>
        </Panel>
      </div>

      <Panel title="Low stock alerts" subtitle="Prioritize restock actions">
        <DataTable
          columns={[
            { key: 'title', label: 'Product' },
            { key: 'stock', label: 'Stock Left' }
          ]}
          rows={analytics?.lowStockProducts || []}
        />
      </Panel>
    </div>
  );
}
