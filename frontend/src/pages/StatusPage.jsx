import { useState } from 'react';
import API from '../api/axios';

const StatusBadge = ({ status }) => (
  <span className={`badge badge-${status}`}>{status}</span>
);

export default function StatusPage() {
  const [donorId, setDonorId] = useState('');
  const [contact, setContact] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [data, setData] = useState(null); // { donor, appointments, donations }

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!donorId.trim() || !contact.trim()) return;
    setLoading(true);
    setError('');
    setData(null);
    try {
      const res = await API.post('/donors/status', { donor_id: donorId, contact });
      setData(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed - invalid ID or contact');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    setData(null);
    setDonorId('');
    setContact('');
  };

  return (
    <div className="container">
      <div className="page-header">
        <h1>🔍 Donor Portal</h1>
        <p>Log in with your Donor ID and Email (or Phone) to view your history confidentially.</p>
      </div>

      {/* Login Form (hidden if logged in) */}
      {!data && (
        <div style={{ maxWidth: 480, margin: '0 auto 40px' }}>
          <div className="card">
            <div className="card-body">
              <form onSubmit={handleSearch} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div className="form-group mb-0">
                  <label className="form-label">Donor ID</label>
                  <input
                    className="form-input"
                    type="number"
                    value={donorId}
                    onChange={(e) => setDonorId(e.target.value)}
                    placeholder="e.g. 3"
                    required
                  />
                </div>
                <div className="form-group mb-0">
                  <label className="form-label">Email or Phone</label>
                  <input
                    className="form-input"
                    type="text"
                    value={contact}
                    onChange={(e) => setContact(e.target.value)}
                    placeholder="Email or Phone Number used during registration"
                    required
                  />
                </div>
                <button type="submit" className="btn btn-primary w-full mt-2" disabled={loading}>
                  {loading ? 'Authenticating...' : '🔐 View My Status'}
                </button>
              </form>
              {error && <div className="alert alert-error mt-4">❌ {error}</div>}
            </div>
          </div>
        </div>
      )}

      {/* Authenticated State */}
      {data && (
        <div style={{ maxWidth: 760, margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
            <button className="btn btn-outline btn-sm" onClick={handleLogout}>
              🚪 Log Out
            </button>
          </div>
          {/* Donor Profile */}
          <div className="card mb-4">
            <div className="card-header">
              <span className="card-title">👤 Donor Profile</span>
              <span className="blood-badge">{data.donor.blood_group}</span>
            </div>
            <div className="card-body">
              <div className="grid-2" style={{ gap: 16 }}>
                <div>
                  <div className="text-sm text-muted">Full Name</div>
                  <div className="font-bold mt-1">{data.donor.full_name}</div>
                </div>
                <div>
                  <div className="text-sm text-muted">Donor ID</div>
                  <div className="font-bold mt-1">#{data.donor.donor_id}</div>
                </div>
                <div>
                  <div className="text-sm text-muted">Phone</div>
                  <div className="mt-1">{data.donor.phone}</div>
                </div>
                <div>
                  <div className="text-sm text-muted">Email</div>
                  <div className="mt-1">{data.donor.email}</div>
                </div>
                <div>
                  <div className="text-sm text-muted">Area</div>
                  <div className="mt-1">{data.donor.city_or_area}</div>
                </div>
                <div>
                  <div className="text-sm text-muted">Total Donations</div>
                  <div className="mt-1 text-red font-bold">{data.donations.length} donation(s)</div>
                </div>
              </div>
            </div>
          </div>

          {/* Appointments */}
          <div className="card mb-4">
            <div className="card-header">
              <span className="card-title">📅 Appointments</span>
              <span className="text-sm text-muted">{data.appointments.length} total</span>
            </div>
            <div className="table-wrapper">
              {data.appointments.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-icon">📋</div>
                  <p>No appointments yet. <a href="/appointment" style={{ color: 'var(--red-primary)' }}>Book one now.</a></p>
                </div>
              ) : (
                <table>
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Date</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.appointments.map((apt) => (
                      <tr key={apt.appointment_id}>
                        <td><strong>#{apt.appointment_id}</strong></td>
                        <td>{new Date(apt.appointment_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</td>
                        <td><StatusBadge status={apt.status} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>

          {/* Donations */}
          <div className="card">
            <div className="card-header">
              <span className="card-title">🩸 Donation History</span>
              <span className="text-sm text-muted">{data.donations.length} total</span>
            </div>
            <div className="table-wrapper">
              {data.donations.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-icon">🩸</div>
                  <p>No donations recorded yet.</p>
                </div>
              ) : (
                <table>
                  <thead>
                    <tr>
                      <th>Donation ID</th>
                      <th>Date</th>
                      <th>Linked Appointment</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.donations.map((d) => (
                      <tr key={d.donation_id}>
                        <td><strong>#{d.donation_id}</strong></td>
                        <td>{new Date(d.donation_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</td>
                        <td>{d.appointment_id ? `#${d.appointment_id}` : <span className="text-muted">—</span>}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
