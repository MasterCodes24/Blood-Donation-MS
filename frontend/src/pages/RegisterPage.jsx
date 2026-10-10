import { useState } from 'react';
import API from '../api/axios';

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

export default function RegisterPage() {
  const [form, setForm] = useState({
    full_name: '', phone: '', email: '', blood_group: '', city_or_area: '',
  });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null); // { success, message, donorId }

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);
    try {
      const res = await API.post('/donors/register', form);
      setResult({ success: true, message: res.data.message, donorId: res.data.donor.donor_id });
      setForm({ full_name: '', phone: '', email: '', blood_group: '', city_or_area: '' });
    } catch (err) {
      setResult({ success: false, message: err.response?.data?.message || 'Registration failed' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <div className="page-header">
        <h1>🩸 Donor Registration</h1>
        <p>Register your details to become a blood donor at our centre.</p>
      </div>

      <div style={{ maxWidth: 560, margin: '0 auto' }}>
        <div className="card">
          <div className="card-header">
            <span className="card-title">Personal Information</span>
          </div>
          <div className="card-body">
            {result && (
              <div className={`alert ${result.success ? 'alert-success' : 'alert-error'}`}>
                {result.success ? '✅' : '❌'} {result.message}
                {result.donorId && (
                  <div className="mt-2" style={{ fontSize: '0.8rem' }}>
                    Your Donor ID: <strong>#{result.donorId}</strong> — save this for appointments!
                  </div>
                )}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Full Name *</label>
                <input
                  className="form-input"
                  name="full_name"
                  value={form.full_name}
                  onChange={handleChange}
                  placeholder="e.g. Aisha Patel"
                  required
                />
              </div>

              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">Phone Number *</label>
                  <input
                    className="form-input"
                    name="phone"
                    value={form.phone}
                    onChange={handleChange}
                    placeholder="+91 9876543210"
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Blood Group *</label>
                  <select
                    className="form-select"
                    name="blood_group"
                    value={form.blood_group}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select blood group</option>
                    {BLOOD_GROUPS.map((g) => (
                      <option key={g} value={g}>{g}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Email Address *</label>
                <input
                  className="form-input"
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="aisha@example.com"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">City / Area *</label>
                <input
                  className="form-input"
                  name="city_or_area"
                  value={form.city_or_area}
                  onChange={handleChange}
                  placeholder="e.g. Andheri, Mumbai"
                  required
                />
              </div>

              <button type="submit" className="btn btn-primary w-full btn-lg" disabled={loading}>
                {loading ? 'Registering...' : '🩸 Register as Donor'}
              </button>
            </form>

            <p className="text-center text-sm text-muted mt-4">
              Already registered?{' '}
              <a href="/status" style={{ color: 'var(--red-primary)' }}>Check your status</a>
            </p>
          </div>
        </div>

        {/* Disclaimer */}
        <div className="alert alert-info mt-4">
          ℹ️ Registration is for administrative coordination only. Medical eligibility screening is conducted by qualified centre staff.
        </div>
      </div>
    </div>
  );
}
