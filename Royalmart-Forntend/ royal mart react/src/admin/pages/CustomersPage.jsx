import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import DataTable from '../components/DataTable';
import PageHeader from '../components/PageHeader';
import Panel from '../components/Panel';
import StatusBadge from '../components/StatusBadge';
import { useAdminToast } from '../context/AdminToastContext';
import { adminApi } from '../services/adminApi';
import { getApiError } from '../services/http';
import { formatDate, fullName } from '../utils/formatters';

export default function CustomersPage() {
  const { showToast } = useAdminToast();
  const [searchParams] = useSearchParams();
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState(searchParams.get('search') || '');

  async function loadUsers() {
    try {
      const response = await adminApi.users({ search, limit: 20 });
      setUsers(response.data?.data || []);
    } catch (error) {
      showToast(getApiError(error, 'Failed to load users'), 'error');
    }
  }

  useEffect(() => {
    loadUsers();
  }, [search]);

  async function changeRole(id, role) {
    try {
      await adminApi.updateUserRole(id, { role });
      showToast('User role updated successfully', 'success');
      loadUsers();
    } catch (error) {
      showToast(getApiError(error, 'Failed to update role'), 'error');
    }
  }

  async function toggleBlock(id, isBlocked) {
    try {
      await adminApi.toggleBlockUser(id, { isBlocked: !isBlocked });
      showToast(!isBlocked ? 'User blocked successfully' : 'User unblocked successfully', 'success');
      loadUsers();
    } catch (error) {
      showToast(getApiError(error, 'Failed to update user'), 'error');
    }
  }

  return (
    <div className="admin-page">
      <PageHeader
        eyebrow="Customers"
        title="User management"
        subtitle="Control roles, moderate accounts, and review customer activity."
      />

      <Panel
        title="Customer Directory"
        subtitle="All users imported from JSON plus newly registered accounts"
        action={
          <input
            className="admin-filter-input"
            placeholder="Search customer"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        }
      >
        <DataTable
          columns={[
            {
              key: 'firstName',
              label: 'Customer',
              render: (_, row) => fullName(row)
            },
            { key: 'email', label: 'Email' },
            { key: 'phone', label: 'Phone' },
            {
              key: 'role',
              label: 'Role',
              render: (value) => <StatusBadge value={value} />
            },
            {
              key: 'status',
              label: 'Status',
              render: (value) => <StatusBadge value={value} />
            },
            {
              key: 'createdAt',
              label: 'Joined',
              render: (value) => formatDate(value)
            },
            {
              key: 'actions',
              label: 'Actions',
              render: (_, row) => (
                <div className="admin-row-actions">
                  <button
                    type="button"
                    className="admin-btn admin-btn--sm"
                    onClick={() => changeRole(row.id, row.role === 'ADMIN' ? 'USER' : 'ADMIN')}
                  >
                    {row.role === 'ADMIN' ? 'Make User' : 'Make Admin'}
                  </button>
                  <button
                    type="button"
                    className="admin-btn admin-btn--sm danger"
                    onClick={() => toggleBlock(row.id, row.isBlocked)}
                  >
                    {row.isBlocked ? 'Unblock' : 'Block'}
                  </button>
                </div>
              )
            }
          ]}
          rows={users}
        />
      </Panel>
    </div>
  );
}
