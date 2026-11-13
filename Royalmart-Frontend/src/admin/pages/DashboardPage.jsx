import { FiDollarSign, FiPackage, FiRefreshCcw, FiShoppingCart, FiUsers, FiXCircle } from 'react-icons/fi';
import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import DataTable from '../components/DataTable';
import LoadingBlock from '../components/LoadingBlock';
import PageHeader from '../components/PageHeader';
import Panel from '../components/Panel';
import StatCard from '../components/StatCard';
import StatusBadge from '../components/StatusBadge';
import { useAdminFetch } from '../hooks/useAdminFetch';
import { adminApi } from '../services/adminApi';
import { formatCurrency, formatDate, fullName } from '../utils/formatters';

const PIE_COLORS = ['#c9a96e', '#4caf7d', '#e8a44a', '#d05f5f', '#6da3ff'];

export default function DashboardPage() {
  const stats = useAdminFetch(() => adminApi.stats(), []);
  const recentOrders = useAdminFetch(() => adminApi.recentOrders(), []);
  const salesReport = useAdminFetch(() => adminApi.salesReport(), []);
  const analytics = useAdminFetch(() => adminApi.analytics(), []);

  if (stats.loading) {
    return <LoadingBlock label="Loading dashboard overview..." />;
  }

  const statData = stats.data || {};
  const recentRows = recentOrders.data || [];
  const salesRows = salesReport.data || [];
  const orderStatusCounts = (analytics.data?.orderStatusCounts || []).map((item) => ({
    status: item.status,
    total: item._count.status
  }));

  return (
    <div className="admin-page">
      <PageHeader
        eyebrow="Overview"
        title="Store analytics dashboard"
        subtitle="Track revenue, customer activity, and recent orders from one clean admin workspace."
      />

      <div className="admin-stat-grid">
        <StatCard title="Pending Orders" value={statData.pendingOrders || 0} icon={FiShoppingCart} />
        <StatCard title="Cancel Orders" value={statData.cancelOrders || 0} icon={FiXCircle} accent="danger" />
        <StatCard title="Processing Orders" value={statData.processingOrders || 0} icon={FiRefreshCcw} accent="green" />
        <StatCard title="Today Income" value={statData.todayIncome || 0} icon={FiDollarSign} accent="amber" currency />
        <StatCard title="Total Products" value={statData.totalProducts || 0} icon={FiPackage} />
        <StatCard title="Total Users" value={statData.totalUsers || 0} icon={FiUsers} accent="blue" />
      </div>

      <div className="admin-grid admin-grid--two">
        <Panel title="Sales Report" subtitle="Monthly revenue generated from active orders">
          <div className="admin-chart">
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={salesRows}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(201,169,110,0.08)" />
                <XAxis dataKey="month" stroke="#c8c3b8" />
                <YAxis stroke="#c8c3b8" />
                <Tooltip />
                <Bar dataKey="total" fill="#c9a96e" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Panel>

        <Panel title="Revenue Split" subtitle="Current order volume by status">
          <div className="admin-chart">
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie data={orderStatusCounts} dataKey="total" nameKey="status" outerRadius={90}>
                  {orderStatusCounts.map((entry, index) => (
                    <Cell key={entry.status} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Panel>
      </div>

      <Panel title="Recent Orders" subtitle="Latest transactions and delivery progress">
        {recentOrders.loading ? (
          <LoadingBlock label="Loading orders..." />
        ) : (
          <DataTable
            columns={[
              { key: 'orderNumber', label: 'Order ID' },
              {
                key: 'user',
                label: 'Customer',
                render: (_, row) => fullName(row.user)
              },
              {
                key: 'paymentMethod',
                label: 'Payment'
              },
              {
                key: 'totalAmount',
                label: 'Total',
                render: (value) => formatCurrency(value)
              },
              {
                key: 'deliveryDate',
                label: 'Delivery',
                render: (value) => formatDate(value)
              },
              {
                key: 'status',
                label: 'Status',
                render: (value) => <StatusBadge value={value} />
              }
            ]}
            rows={recentRows}
          />
        )}
      </Panel>
    </div>
  );
}
