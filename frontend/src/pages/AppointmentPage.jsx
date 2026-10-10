import { useState } from 'react';
import API from '../api/axios';

export default function AppointmentPage() {
  const [form, setForm] = useState({ donor_id: '', appointment_date: '' });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  // Min date: today
  const today = new Date().toISOString().split('T')[0];

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);
    try {
      const res = await API.post('/appointments', form);
      setResult({ success: true, message: res.data.message, data: res.data.appointment });
      setForm({ donor_id: '', appointment_date: '' });
    } catch (err) {
      setResult({ success: false, message: err.response?.data?.message || 'Failed to submit appointment' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <div className="page-header">
        <h1>📅 Request an Appointment</h1>
        <p>Enter your Donor ID and preferred date to schedule your donation visit.</p>
      </div>

      <div style={{ maxWidth: 520, margin: '0 auto' }}>
        <div className="card">
          <div className="card-header">
            <span className="card-title">Appointment Request Form</span>
          </div>
          <div className="card-body">
            {result && (
              <div className={`alert ${result.success ? 'alert-success' : 'alert-error'}`}>
                {result.success ? '✅' : '❌'} {result.message}
                {result.data && (
                  <div className="mt-2 text-sm">
                    Appointment ID: <strong>#{result.data.appointment_id}</strong> · Status: <strong>{result.data.status}</strong>
                  </div>
                )}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Donor ID *</label>
                <input
                  className="form-input"
                  name="donor_id"
                  type="number"
                  value={form.donor_id}
                  onChange={handleChange}
                  placeholder="e.g. 3 (given at registration)"
                  required
                />
                <div className="text-sm text-muted mt-1">
                  Don't have your ID?{' '}
                  <a href="/status" style={{ color: 'var(--red-primary)' }}>Look up your record</a>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Preferred Date *</label>
                <input
                  className="form-input"
                  type="date"
                  name="appointment_date"
                  value={form.appointment_date}
                  onChange={handleChange}
                  min={today}
                  required
                />
              </div>

              <button type="submit" className="btn btn-primary w-full btn-lg" disabled={loading}>
                {loading ? 'Submitting...' : '📅 Request Appointment'}
              </button>
            </form>
          </div>
        </div>

        <div className="card mt-4">
          <div className="card-body">
            <h3 style={{ fontSize: '0.95rem', fontWeight: 600, marginBottom: 12 }}>📌 What happens next?</h3>
            <ol style={{ paddingLeft: 20, color: 'var(--text-muted)', fontSize: '0.88rem', lineHeight: 2 }}>
              <li>Your request is saved with status <strong style={{ color: 'var(--text-primary)' }}>requested</strong>.</li>
              <li>A staff member reviews and confirms or rejects it.</li>
              <li>Check your status at any time using the <a href="/status" style={{ color: 'var(--red-primary)' }}>Status page</a>.</li>
              <li>On the day, visit the centre. Staff records your donation.</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
}
