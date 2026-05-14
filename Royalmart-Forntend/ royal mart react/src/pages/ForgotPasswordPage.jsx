import { useState } from 'react';
import { Link } from 'react-router-dom';
import useDocumentTitle from '../hooks/useDocumentTitle';
import { ROUTES } from '../utils/constants';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

export default function ForgotPasswordPage() {
  useDocumentTitle('Royal Mart — Forgot Password');

  const [step, setStep] = useState('email'); // email | reset | done
  const [email, setEmail] = useState('');
  const [token, setToken] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleRequestToken(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json.message || 'Failed to send reset request');
        return;
      }
      setToken(json.data.resetToken);
      setStep('reset');
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  async function handleResetPassword(e) {
    e.preventDefault();
    setError('');
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password })
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json.message || 'Failed to reset password');
        return;
      }
      setStep('done');
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-icon">
          <span className="material-symbols-outlined">
            {step === 'done' ? 'check_circle' : 'lock_reset'}
          </span>
        </div>

        {step === 'email' && (
          <>
            <h2 className="auth-title">Forgot Password</h2>
            <p className="auth-subtitle">Enter your email to reset your password</p>
            <form onSubmit={handleRequestToken}>
              <div className="form-group">
                <label className="form-label" htmlFor="forgot-email">Email Address</label>
                <input
                  className="form-input"
                  type="email"
                  id="forgot-email"
                  placeholder="you@example.com"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              {error && <p className="auth-error">{error}</p>}
              <button className="auth-btn" type="submit" disabled={loading}>
                {loading ? 'Please wait...' : 'RESET PASSWORD'}
              </button>
            </form>
          </>
        )}

        {step === 'reset' && (
          <>
            <h2 className="auth-title">Set New Password</h2>
            <p className="auth-subtitle">Enter your new password below</p>
            <form onSubmit={handleResetPassword}>
              <div className="form-group">
                <label className="form-label" htmlFor="new-password">New Password</label>
                <input
                  className="form-input"
                  type="password"
                  id="new-password"
                  placeholder="Min 6 characters"
                  required
                  minLength="6"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="confirm-password">Confirm Password</label>
                <input
                  className="form-input"
                  type="password"
                  id="confirm-password"
                  placeholder="Re-enter password"
                  required
                  minLength="6"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>
              {error && <p className="auth-error">{error}</p>}
              <button className="auth-btn" type="submit" disabled={loading}>
                {loading ? 'Please wait...' : 'UPDATE PASSWORD'}
              </button>
            </form>
          </>
        )}

        {step === 'done' && (
          <>
            <h2 className="auth-title">Password Reset!</h2>
            <p className="auth-subtitle">Your password has been updated successfully</p>
            <Link className="auth-btn" to={ROUTES.login} style={{ display: 'block', textAlign: 'center', textDecoration: 'none' }}>
              BACK TO LOGIN
            </Link>
          </>
        )}

        {step !== 'done' && (
          <p className="auth-switch">
            Remember your password? <Link to={ROUTES.login}>Sign in</Link>
          </p>
        )}
      </div>
    </div>
  );
}
