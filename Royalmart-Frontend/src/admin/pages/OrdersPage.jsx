import { useEffect, useState } from 'react';
import DataTable from '../components/DataTable';
import PageHeader from '../components/PageHeader';
import Panel from '../components/Panel';
import StatusBadge from '../components/StatusBadge';
import { useAdminToast } from '../context/AdminToastContext';
import { adminApi } from '../services/adminApi';
import { getApiError } from '../services/http';
import { formatCurrency, formatDate, fullName } from '../utils/formatters';

export default function OrdersPage() {
  const { showToast } = useAdminToast();
  const [orders, setOrders] = useState([]);
  const [status, setStatus] = useState('');

  async function loadOrders() {
    try {
      const response = await adminApi.orders({ status, limit: 20 });
      setOrders(response.data?.data || []);
    } catch (error) {
      showToast(getApiError(error, 'Failed to load orders'), 'error');
    }
  }

  useEffect(() => {
    loadOrders();
  }, [status]);

  async function updateStatus(id, nextStatus) {
    try {
      await adminApi.updateOrderStatus(id, { status: nextStatus });
      showToast('Order status updated successfully', 'success');
      loadOrders();
    } catch (error) {
      showToast(getApiError(error, 'Failed to update order'), 'error');
    }
  }

  return (
    <div className="admin-page">
      <PageHeader
        eyebrow="Fulfillment"
        title="Order management"
        subtitle="Review customer purchases, payment methods, delivery dates, and status changes."
      />

      <Panel
        title="Recent and active orders"
        subtitle="Keep shipping flow healthy and flag issues quickly"
        action={
          <select className="admin-filter-input" value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="">All statuses</option>
            <option value="PENDING">Pending</option>
            <option value="PROCESSING">Processing</option>
            <option value="SHIPPED">Shipped</option>
            <option value="DELIVERED">Delivered</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
        }
      >
        <DataTable
          columns={[
            { key: 'orderNumber', label: 'Order' },
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
              label: 'Total Price',
              render: (value) => formatCurrency(value)
            },
            {
              key: 'deliveryDate',
              label: 'Delivery Date',
              render: (value) => formatDate(value)
            },
            {
              key: 'status',
              label: 'Status',
              render: (value) => <StatusBadge value={value} />
            },
            {
              key: 'actions',
              label: 'Actions',
              render: (_, row) => (
                <div className="admin-row-actions">
                  <button type="button" className="admin-btn admin-btn--sm" onClick={() => updateStatus(row.id, 'PROCESSING')}>
                    Process
                  </button>
                  <button type="button" className="admin-btn admin-btn--sm" onClick={() => updateStatus(row.id, 'SHIPPED')}>
                    Ship
                  </button>
                  <button type="button" className="admin-btn admin-btn--sm danger" onClick={() => updateStatus(row.id, 'CANCELLED')}>
                    Cancel
                  </button>
                </div>
              )
            }
          ]}
          rows={orders}
        />
      </Panel>
    </div>
  );
}
