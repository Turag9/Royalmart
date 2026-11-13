import { useEffect, useState } from 'react';
import DataTable from '../components/DataTable';
import PageHeader from '../components/PageHeader';
import Panel from '../components/Panel';
import { useAdminToast } from '../context/AdminToastContext';
import { adminApi } from '../services/adminApi';
import { getApiError } from '../services/http';

export default function CategoriesPage() {
  const { showToast } = useAdminToast();
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState({ name: '', description: '', image: '' });
  const [editingId, setEditingId] = useState('');

  async function loadCategories() {
    try {
      const response = await adminApi.categories();
      setCategories(response.data?.data || []);
    } catch (error) {
      showToast(getApiError(error, 'Failed to load categories'), 'error');
    }
  }

  useEffect(() => {
    loadCategories();
  }, []);

  async function handleSubmit(event) {
    event.preventDefault();
    try {
      if (editingId) {
        await adminApi.updateCategory(editingId, form);
        showToast('Category updated successfully', 'success');
      } else {
        await adminApi.createCategory(form);
        showToast('Category created successfully', 'success');
      }
      setForm({ name: '', description: '', image: '' });
      setEditingId('');
      loadCategories();
    } catch (error) {
      showToast(getApiError(error, 'Failed to save category'), 'error');
    }
  }

  async function handleDelete(id) {
    try {
      await adminApi.deleteCategory(id);
      showToast('Category deleted successfully', 'success');
      loadCategories();
    } catch (error) {
      showToast(getApiError(error, 'Failed to delete category'), 'error');
    }
  }

  return (
    <div className="admin-page">
      <PageHeader
        eyebrow="Structure"
        title="Category management"
        subtitle="Keep the catalog organized for both storefront browsing and admin reporting."
      />

      <div className="admin-grid admin-grid--two">
        <Panel title={editingId ? 'Edit Category' : 'New Category'} subtitle="Create catalog groups">
          <form className="admin-form" onSubmit={handleSubmit}>
            <label>
              <span>Name</span>
              <input value={form.name} onChange={(e) => setForm((c) => ({ ...c, name: e.target.value }))} required />
            </label>
            <label>
              <span>Description</span>
              <textarea value={form.description} onChange={(e) => setForm((c) => ({ ...c, description: e.target.value }))} />
            </label>
            <label>
              <span>Image URL</span>
              <input value={form.image} onChange={(e) => setForm((c) => ({ ...c, image: e.target.value }))} />
            </label>
            <div className="admin-form__actions">
              <button type="submit" className="admin-btn admin-btn--primary">
                {editingId ? 'Update Category' : 'Create Category'}
              </button>
              <button
                type="button"
                className="admin-btn"
                onClick={() => {
                  setEditingId('');
                  setForm({ name: '', description: '', image: '' });
                }}
              >
                Reset
              </button>
            </div>
          </form>
        </Panel>

        <Panel title="Category List" subtitle="Monitor product distribution by collection">
          <DataTable
            columns={[
              { key: 'name', label: 'Name' },
              { key: 'slug', label: 'Slug' },
              { key: 'description', label: 'Description' },
              {
                key: '_count',
                label: 'Products',
                render: (value) => value?.products || 0
              },
              {
                key: 'actions',
                label: 'Actions',
                render: (_, row) => (
                  <div className="admin-row-actions">
                    <button
                      type="button"
                      className="admin-btn admin-btn--sm"
                      onClick={() => {
                        setEditingId(row.id);
                        setForm({
                          name: row.name,
                          description: row.description || '',
                          image: row.image || ''
                        });
                      }}
                    >
                      Edit
                    </button>
                    <button type="button" className="admin-btn admin-btn--sm danger" onClick={() => handleDelete(row.id)}>
                      Delete
                    </button>
                  </div>
                )
              }
            ]}
            rows={categories}
          />
        </Panel>
      </div>
    </div>
  );
}
