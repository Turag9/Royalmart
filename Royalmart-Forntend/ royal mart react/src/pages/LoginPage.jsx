import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useDocumentTitle from '../hooks/useDocumentTitle';
import { useStore } from '../store/StoreContext';
import { ROUTES } from '../utils/constants';

const EMPTY_LOGIN_FORM = { email: '', password: '' };
const EMPTY_SIGNUP_FORM = { name: '', email: '', password: '' };

function AuthCard({ id, hidden, icon, title, subtitle, children, switchText, switchLinkText, onSwitch }) {
  return (
    <div className={`auth-card${hidden ? ' hidden' : ''}`} id={id}>
      <div className="auth-icon">
        <span className="material-symbols-outlined">{icon}</span>
      </div>
      <h2 className="auth-title">{title}</h2>
      <p className="auth-subtitle">{subtitle}</p>
      {children}
      <p className="auth-switch">
        {switchText}{' '}
        <a
          href="#"
          onClick={(event) => {
            event.preventDefault();
            onSwitch();
          }}
        >
          {switchLinkText}
        </a>
      </p>
    </div>
  );
}

export default function LoginPage() {
  useDocumentTitle('Royal Mart — Login');

  const navigate = useNavigate();
  const { login, signup } = useStore();
  const [mode, setMode] = useState('login');
  const [loginForm, setLoginForm] = useState(EMPTY_LOGIN_FORM);
  const [signupForm, setSignupForm] = useState(EMPTY_SIGNUP_FORM);
  const [loginError, setLoginError] = useState('');
  const [signupError, setSignupError] = useState('');

  async function handleLogin(event) {
    event.preventDefault();
    const result = await login(loginForm.email, loginForm.password);

    if (!result.ok) {
      setLoginError(result.error);
      return;
    }

    navigate(ROUTES.profile);
  }

  async function handleSignup(event) {
    event.preventDefault();
    const result = await signup(signupForm.name, signupForm.email, signupForm.password);

    if (!result.ok) {
      setSignupError(result.error);
      return;
    }

    navigate(ROUTES.profile);
  }

  function showLogin() {
    // Clear old errors when switching views so the other form starts clean.
    setMode('login');
    setLoginError('');
    setSignupError('');
  }

  function showSignup() {
    setMode('signup');
    setLoginError('');
    setSignupError('');
  }

  return (
    <div className="auth-page">
      <AuthCard
        id="login-card"
        hidden={mode !== 'login'}
        icon="lock_open"
        title="Welcome Back"
        subtitle="Sign in to your Royal Mart account"
        switchText="Don't have an account?"
        switchLinkText="Create one"
        onSwitch={showSignup}
      >
        <form id="login-form" onSubmit={handleLogin}>
          <div className="form-group">
            <label className="form-label" htmlFor="login-email">
              Email Address
            </label>
            <input
              className="form-input"
              type="email"
              id="login-email"
              placeholder="you@example.com"
              required
              value={loginForm.email}
              onChange={(event) => setLoginForm({ ...loginForm, email: event.target.value })}
            />
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="login-password">
              Password
            </label>
            <input
              className="form-input"
              type="password"
              id="login-password"
              placeholder="Enter your password"
              required
              minLength="8"
              value={loginForm.password}
              onChange={(event) => setLoginForm({ ...loginForm, password: event.target.value })}
            />
          </div>
          <p className="auth-error" id="login-error">
            {loginError}
          </p>
          <p style={{ textAlign: 'right', margin: '-0.5rem 0 1rem' }}>
            <Link to={ROUTES.forgotPassword} style={{ color: '#c9a96e', fontSize: '0.85rem' }}>
              Forgot Password?
            </Link>
          </p>
          <button className="auth-btn" type="submit">
            SIGN IN
          </button>
        </form>
      </AuthCard>

      <AuthCard
        id="signup-card"
        hidden={mode !== 'signup'}
        icon="person_add"
        title="Create Account"
        subtitle="Join Royal Mart for a premium shopping experience"
        switchText="Already have an account?"
        switchLinkText="Sign in"
        onSwitch={showLogin}
      >
        <form id="signup-form" onSubmit={handleSignup}>
          <div className="form-group">
            <label className="form-label" htmlFor="signup-name">
              Full Name
            </label>
            <input
              className="form-input"
              type="text"
              id="signup-name"
              placeholder="John Doe"
              required
              minLength="2"
              value={signupForm.name}
              onChange={(event) => setSignupForm({ ...signupForm, name: event.target.value })}
            />
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="signup-email">
              Email Address
            </label>
            <input
              className="form-input"
              type="email"
              id="signup-email"
              placeholder="you@example.com"
              required
              value={signupForm.email}
              onChange={(event) => setSignupForm({ ...signupForm, email: event.target.value })}
            />
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="signup-password">
              Password
            </label>
            <input
              className="form-input"
              type="password"
              id="signup-password"
              placeholder="Min 8 chars, include a letter and a number"
              required
              minLength="8"
              pattern="(?=.*[A-Za-z])(?=.*\d).{8,}"
              title="At least 8 characters, including one letter and one number"
              value={signupForm.password}
              onChange={(event) => setSignupForm({ ...signupForm, password: event.target.value })}
            />
            <small className="form-hint" style={{ color: '#888', fontSize: '0.78rem' }}>
              Use 8+ characters with at least one letter and one number.
            </small>
          </div>
          <p className="auth-error" id="signup-error">
            {signupError}
          </p>
          <button className="auth-btn" type="submit">
            CREATE ACCOUNT
          </button>
        </form>
      </AuthCard>
    </div>
  );
}
