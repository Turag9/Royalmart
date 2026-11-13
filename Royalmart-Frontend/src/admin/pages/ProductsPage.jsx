import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import DataTable from '../components/DataTable';
import LoadingBlock from '../components/LoadingBlock';
import PageHeader from '../components/PageHeader';
import Panel from '../components/Panel';
import StatusBadge from '../components/StatusBadge';
import { useAdminToast } from '../context/AdminToastContext';
import { adminApi } from '../services/adminApi';
import { getApiError } from '../services/http';
import { formatCurrency } from '../utils/formatters';

const initialForm = {
  title: '',
  description: '',
  price: 0,
  stock: 0,
  categoryId: '',
  brand: '',
  thumbnail: '',
  images: [],
  tags: []
};

export default function ProductsPage() {
  const { showToast } = useAdminToast();
  const [searchParams] = useSearchParams();
  const [filters, setFilters] = useState({ page: 1, limit: 8, search: searchParams.get('search') || '', categoryId: '' });
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [meta, setMeta] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [editingId, setEditingId] = useState('');
  const [form, setForm] = useState(initialForm);

  async function loadData() {
    setLoading(true);
    try {
      const [productResponse, categoryResponse] = await Promise.all([
        adminApi.products(filters),
        adminApi.categories()
      ]);
      setProducts(productResponse.data?.data || []);
      setMeta(productResponse.data?.meta || {});
      setCategories(categoryResponse.data?.data || []);
    } catch (error) {
      showToast(getApiError(error, 'Failed to load products'), 'error');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, [filters.page, filters.search, filters.categoryId]);

  function resetForm() {
    setForm(initialForm);
    setEditingId('');
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setSubmitting(true);

    try {
      const payload = {
        ...form,
        price: Number(form.price),
        stock: Number(form.stock),
        images: typeof form.images === 'string' ? form.images.split(',').map((item) => item.trim()).filter(Boolean) : form.images,
        tags: typeof form.tags === 'string' ? form.tags.split(',').map((item) => item.trim()).filter(Boolean) : form.tags
      };

      if (editingId) {
        await adminApi.updateProduct(editingId, payload);
        showToast('Product updated successfully', 'success');
      } else {
        await adminApi.createProduct(payload);
        showToast('Product created successfully', 'success');
      }

      resetForm();
      loadData();
    } catch (error) {
      showToast(getApiError(error, 'Failed to save product'), 'error');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id) {
    try {
      await adminApi.deleteProduct(id);
      showToast('Product deleted successfully', 'success');
      loadData();
    } catch (error) {
      showToast(getApiError(error, 'Failed to delete product'), 'error');
    }
  }

  function startEdit(product) {
    setEditingId(product.id);
    setForm({
      title: product.title,
      description: product.description,
      price: Number(product.price),
      stock: product.stock,
      categoryId: product.categoryId,
      brand: product.brand || '',
      thumbnail: product.thumbnail || '',
      images: Array.isArray(product.images) ? product.images.join(', ') : '',
      tags: Array.isArray(product.tags) ? product.tags.join(', ') : ''
    });
  }

  return (
    <div className="admin-page">
      <PageHeader
        eyebrow="Catalog"
        title="Product management"
        subtitle="Search, filter, add, and maintain the Royal Mart catalog from one place."
      />

      <div className="admin-grid admin-grid--two">
        <Panel title={editingId ? 'Edit Product' : 'Add Product'} subtitle="Create or update catalog entries">
          <form className="admin-form admin-form--grid" onSubmit={handleSubmit}>
            <label>
              <span>Title</span>
              <input value={form.title} onChange={(e) => setForm((c) => ({ ...c, title: e.target.value }))} required />
            </label>
            <label>
              <span>Brand</span>
              <input value={form.brand} onChange={(e) => setForm((c) => ({ ...c, brand: e.target.value }))} />
            </label>
            <label className="admin-form__full">
              <span>Description</span>
              <textarea value={form.description} onChange={(e) => setForm((c) => ({ ...c, description: e.target.value }))} required />
            </label>
            <label>
              <span>Price</span>
              <input type="number" value={form.price} onChange={(e) => setForm((c) => ({ ...c, price: e.target.value }))} required />
            </label>
            <label>
              <span>Stock</span>
              <input type="number" value={form.stock} onChange={(e) => setForm((c) => ({ ...c, stock: e.target.value }))} required />
            </label>
            <label>
              <span>Category</span>
              <select value={form.categoryId} onChange={(e) => setForm((c) => ({ ...c, categoryId: e.target.value }))} required>
                <option value="">Select category</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </label>
            <label>
              <span>Thumbnail URL</span>
              <input value={form.thumbnail} onChange={(e) => setForm((c) => ({ ...c, thumbnail: e.target.value }))} />
            </label>
            <label className="admin-form__full">
              <span>Images</span>
              <input value={form.images} onChange={(e) => setForm((c) => ({ ...c, images: e.target.value }))} placeholder="Comma-separated URLs" />
            </label>
            <label className="admin-form__full">
              <span>Tags</span>
              <input value={form.tags} onChange={(e) => setForm((c) => ({ ...c, tags: e.target.value }))} placeholder="Comma-separated tags" />
            </label>
            <div className="admin-form__actions admin-form__full">
              <button type="submit" className="admin-btn admin-btn--primary" disabled={submitting}>
                {submitting ? 'Saving...' : editingId ? 'Update Product' : 'Create Product'}
              </button>
              <button type="button" className="admin-btn" onClick={resetForm}>
                Reset
              </button>
            </div>
          </form>
        </Panel>

        <Panel title="Inventory Insights" subtitle="Quick visibility into stock, category, and pricing">
          <div className="admin-toolbar">
            <input
              className="admin-filter-input"
              placeholder="Search by title or brand"
              value={filters.search}
              onChange={(event) => setFilters((current) => ({ ...current, search: event.target.value, page: 1 }))}
            />
            <select
              className="admin-filter-input"
              value={filters.categoryId}
              onChange={(event) => setFilters((current) => ({ ...current, categoryId: event.target.value, page: 1 }))}
            >
              <option value="">All categories</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          {loading ? (
            <LoadingBlock label="Loading product inventory..." />
          ) : (
            <>
              <DataTable
                columns={[
                  { key: 'title', label: 'Product' },
                  {
                    key: 'category',
                    label: 'Category',
                    render: (value) => value?.name || 'N/A'
                  },
                  {
                    key: 'price',
                    label: 'Price',
                    render: (value) => formatCurrency(value)
                  },
                  { key: 'stock', label: 'Stock' },
                  {
                    key: 'availabilityStatus',
                    label: 'Status',
                    render: (value, row) => <StatusBadge value={value || (row.stock > 0 ? 'In Stock' : 'Out of Stock')} />
                  },
                  {
                    key: 'actions',
                    label: 'Actions',
                    render: (_, row) => (
                      <div className="admin-row-actions">
                        <button type="button" className="admin-btn admin-btn--sm" onClick={() => startEdit(row)}>
                          Edit
                        </button>
                        <button type="button" className="admin-btn admin-btn--sm danger" onClick={() => handleDelete(row.id)}>
                          Delete
                        </button>
                      </div>
                    )
                  }
                ]}
                rows={products}
              />
              <div className="admin-pagination">
                <button type="button" className="admin-btn" disabled={meta.page <= 1} onClick={() => setFilters((c) => ({ ...c, page: c.page - 1 }))}>
                  Previous
                </button>
                <span>
                  Page {meta.page || 1} of {meta.totalPages || 1}
                </span>
                <button type="button" className="admin-btn" disabled={(meta.page || 1) >= (meta.totalPages || 1)} onClick={() => setFilters((c) => ({ ...c, page: c.page + 1 }))}>
                  Next
                </button>
              </div>
            </>
          )}
        </Panel>
      </div>
    </div>
  );
}
