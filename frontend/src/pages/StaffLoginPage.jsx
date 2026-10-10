import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function StaffLoginPage() {
  const { login, loading } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const res = await login(form.email, form.password);
    if (res.success) {
      navigate('/dashboard');
    } else {
      setError(res.message);
    }
  };

  return (
    <div style={{ minHeight: 'calc(100vh - 64px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div style={{ width: '100%', maxWidth: 420 }}>

        {/* Logo */}
        <div className="text-center mb-6">
          <div style={{
            width: 64, height: 64,
            background: 'linear-gradient(135deg, var(--red-primary), var(--crimson))',
            borderRadius: 18,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '2rem',
            margin: '0 auto 16px',
            boxShadow: 'var(--shadow-red)',
          }}>
            🩸
          </div>
          <h1 style={{ fontFamily: 'Outfit,sans-serif', fontSize: '1.6rem', fontWeight: 700, marginBottom: 6 }}>
            Staff Sign In
          </h1>
          <p className="text-muted text-sm">Access the BloodConnect management dashboard</p>
        </div>

        <div className="card">
          <div className="card-body">
            {error && (
              <div className="alert alert-error">❌ {error}</div>
            )}
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Email Address</label>
                <input
                  className="form-input"
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="staff@bloodcentre.org"
                  required
                  autoFocus
                />
              </div>
              <div className="form-group">
                <label className="form-label">Password</label>
                <input
                  className="form-input"
                  type="password"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  placeholder="••••••••"
                  required
                />
              </div>
              <button type="submit" className="btn btn-primary w-full btn-lg" disabled={loading}>
                {loading ? 'Signing in...' : '🔐 Sign In'}
              </button>
            </form>
          </div>
        </div>

        <p className="text-center text-sm text-muted mt-4">
          Staff accounts are created by an administrator.
        </p>
      </div>
    </div>
  );
}
