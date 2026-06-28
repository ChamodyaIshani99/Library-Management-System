import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(form.email, form.password);
      toast.success('Welcome back!');
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-left">
        <h1>Smart Library<br />Management</h1>
        <p>A complete solution to manage your library's books, members, and borrowing operations with ease.</p>
        <div className="auth-features">
          {[
            { icon: '📚', text: 'Complete Book Catalog Management' },
            { icon: '👥', text: 'Member Registration & Tracking' },
            { icon: '🔄', text: 'Borrow & Return Workflow' },
            { icon: '📊', text: 'Dashboard Analytics' }
          ].map((f, i) => (
            <div key={i} className="auth-feature">
              <div className="auth-feature-icon">{f.icon}</div>
              <span>{f.text}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="auth-right">
        <div className="auth-card">
          <div className="logo-sm">
            <div className="logo-icon-sm">📖</div>
            <span>LibraryMS</span>
          </div>
          <h2>Welcome Back</h2>
          <p className="auth-subtitle">Sign in to your account to continue</p>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input
                name="email" type="email"
                className="form-control"
                placeholder="admin@library.com"
                value={form.email}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Password</label>
              <input
                name="password" type="password"
                className="form-control"
                placeholder="Enter your password"
                value={form.password}
                onChange={handleChange}
                required
              />
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', marginTop: '8px', padding: '12px' }} disabled={loading}>
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <div className="divider" style={{ margin: '20px 0' }}>or</div>

          <p style={{ textAlign: 'center', fontSize: '13px', color: 'var(--text-muted)' }}>
            Don't have an account? <Link to="/register" className="auth-link">Register</Link>
          </p>

          <div style={{ marginTop: '20px', padding: '12px', background: 'var(--bg)', borderRadius: '8px', fontSize: '12px', color: 'var(--text-muted)' }}>
            <strong>Demo credentials:</strong><br />
            Admin: admin@library.com / password123<br />
            Register a new account to get started.
          </div>
        </div>
      </div>
    </div>
  );
}
