import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdminAuth } from '../context/AdminAuthContext';
import { useAdminToast } from '../context/AdminToastContext';

export default function AdminLoginPage() {
  const navigate = useNavigate();
  const { login } = useAdminAuth();
  const { showToast } = useAdminToast();
  const [form, setForm] = useState({
    email: 'admin@royalmart.com',
    password: 'Admin@12345'
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      await login(form);
      showToast('Welcome back to Royal Mart admin', 'success');
      navigate('/admin', { replace: true });
    } catch (err) {
      setError(err.message);
      showToast(err.message, 'error');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="admin-auth-shell">
      <div className="admin-auth-card">
        <span className="admin-eyebrow">Royal Mart Admin</span>
        <h1>Sign in to manage your store</h1>
        <p>Use the seeded admin account or your promoted admin credentials.</p>

        <form className="admin-form" onSubmit={handleSubmit}>
          <label>
            <span>Email</span>
            <input
              type="email"
              value={form.email}
              onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
              required
            />
          </label>

          <label>
            <span>Password</span>
            <input
              type="password"
              value={form.password}
              onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))}
              required
            />
          </label>

          {error ? <div className="admin-error">{error}</div> : null}

          <button type="submit" className="admin-btn admin-btn--primary" disabled={submitting}>
            {submitting ? 'Signing in...' : 'Login to Dashboard'}
          </button>
        </form>
      </div>
    </div>
  );
}
