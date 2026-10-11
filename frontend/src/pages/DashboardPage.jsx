import { useState, useEffect, useCallback } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API from '../api/axios';

// ── Sub-pages ──
function Overview({ stats }) {
  if (!stats) return <div className="spinner" />;

  const cards = [
    { label: 'Total Donors', value: stats.totalDonors, icon: '👥', color: 'red' },
    { label: 'Total Donations', value: stats.totalDonations, icon: '🩸', color: 'green' },
    { label: 'Total Appointments', value: stats.totalAppointments, icon: '📅', color: 'blue' },
    { label: 'Pending Requests', value: stats.pendingAppointments, icon: '⏳', color: 'yellow' },
  ];

  return (
    <div>
      <div className="grid-4 mb-6">
        {cards.map((c) => (
          <div className={`stat-card ${c.color}`} key={c.label}>
            <div className={`stat-icon ${c.color}`}>{c.icon}</div>
            <div className="stat-value">{c.value}</div>
            <div className="stat-label">{c.label}</div>
          </div>
        ))}
      </div>

      <div className="card">
        <div className="card-header">
          <span className="card-title">🩸 Donors by Blood Group</span>
        </div>
        <div className="card-body">
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
            {stats.bloodGroupStats.map((b) => (
              <div key={b.blood_group} style={{
                background: 'var(--bg-surface)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-sm)',
                padding: '12px 20px',
                textAlign: 'center',
                minWidth: 80,
              }}>
                <div className="blood-badge" style={{ display: 'block', marginBottom: 6 }}>{b.blood_group}</div>
                <div style={{ fontSize: '1.4rem', fontWeight: 800, fontFamily: 'Outfit,sans-serif' }}>{b.count}</div>
                <div className="text-sm text-muted">donors</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function DonorsList() {
  const [donors, setDonors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [bloodFilter, setBloodFilter] = useState('');
  const [selected, setSelected] = useState(null);

  const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (search) params.search = search;
      if (bloodFilter) params.blood_group = bloodFilter;
      const res = await API.get('/donors', { params });
      setDonors(res.data.donors);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [search, bloodFilter]);

  useEffect(() => { fetch(); }, [fetch]);

  const viewDonor = async (id) => {
    try {
      const res = await API.get(`/donors/${id}`);
      setSelected(res.data);
    } catch (e) { console.error(e); }
  };

  return (
    <div>
      {/* Filters */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
        <input
          className="form-input"
          style={{ flex: 1, minWidth: 200 }}
          placeholder="🔍 Search by name, email, phone..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select
          className="form-select"
          style={{ width: 160 }}
          value={bloodFilter}
          onChange={(e) => setBloodFilter(e.target.value)}
        >
          <option value="">All Blood Groups</option>
          {BLOOD_GROUPS.map((g) => <option key={g} value={g}>{g}</option>)}
        </select>
        <button className="btn btn-outline" onClick={fetch}>Refresh</button>
      </div>

      {loading ? <div className="spinner" /> : (
        <div className="card">
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>ID</th><th>Name</th><th>Blood Group</th><th>Phone</th><th>Email</th><th>Area</th><th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {donors.length === 0 ? (
                  <tr><td colSpan={7} style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>No donors found</td></tr>
                ) : donors.map((d) => (
                  <tr key={d.donor_id}>
                    <td><strong>#{d.donor_id}</strong></td>
                    <td><strong>{d.full_name}</strong></td>
                    <td><span className="blood-badge">{d.blood_group}</span></td>
                    <td>{d.phone}</td>
                    <td>{d.email}</td>
                    <td>{d.city_or_area}</td>
                    <td>
                      <button className="btn btn-outline btn-sm" onClick={() => viewDonor(d.donor_id)}>
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal */}
      {selected && (
        <div className="modal-overlay" onClick={() => setSelected(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <div className="modal-title">👤 {selected.donor.full_name}</div>
                <span className="blood-badge">{selected.donor.blood_group}</span>
              </div>
              <button className="modal-close" onClick={() => setSelected(null)}>✕</button>
            </div>

            <div className="grid-2 mb-4" style={{ fontSize: '0.88rem' }}>
              <div><span className="text-muted">Phone</span><br /><strong>{selected.donor.phone}</strong></div>
              <div><span className="text-muted">Email</span><br /><strong>{selected.donor.email}</strong></div>
              <div><span className="text-muted">Area</span><br /><strong>{selected.donor.city_or_area}</strong></div>
              <div><span className="text-muted">Donor ID</span><br /><strong>#{selected.donor.donor_id}</strong></div>
            </div>

            <div style={{ marginBottom: 16 }}>
              <div className="text-sm text-muted mb-2">Appointments ({selected.appointments.length})</div>
              {selected.appointments.slice(0, 3).map((a) => (
                <div key={a.appointment_id} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid var(--border)', fontSize: '0.85rem' }}>
                  <span>#{a.appointment_id} · {new Date(a.appointment_date).toLocaleDateString()}</span>
                  <span className={`badge badge-${a.status}`}>{a.status}</span>
                </div>
              ))}
            </div>

            <div>
              <div className="text-sm text-muted mb-2">Donations ({selected.donations.length})</div>
              {selected.donations.slice(0, 3).map((d) => (
                <div key={d.donation_id} style={{ padding: '6px 0', borderBottom: '1px solid var(--border)', fontSize: '0.85rem' }}>
                  🩸 #{d.donation_id} · {new Date(d.donation_date).toLocaleDateString()}
                </div>
              ))}
              {selected.donations.length === 0 && <div className="text-muted text-sm">No donations yet</div>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function AppointmentsList() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [updating, setUpdating] = useState(null);

  const fetchAppointments = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (statusFilter) params.status = statusFilter;
      const res = await API.get('/appointments', { params });
      setAppointments(res.data.appointments);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, [statusFilter]);

  useEffect(() => { fetchAppointments(); }, [fetchAppointments]);

  const updateStatus = async (id, status) => {
    setUpdating(id);
    try {
      await API.patch(`/appointments/${id}/status`, { status });
      setAppointments((prev) =>
        prev.map((a) => a.appointment_id === id ? { ...a, status } : a)
      );
    } catch (e) { alert(e.response?.data?.message || 'Update failed'); }
    finally { setUpdating(null); }
  };

  const completeDonation = async (id) => {
    if (!window.confirm('Mark this appointment as Completed and record donation for today?')) return;
    setUpdating(id);
    try {
      // First try dedicated complete endpoint
      const res = await API.post(`/appointments/${id}/complete`, {});
      alert(res.data.message || 'Donation completed successfully!');
      setAppointments((prev) =>
        prev.map((a) => a.appointment_id === id ? { ...a, status: 'completed' } : a)
      );
    } catch (e) {
      // Fallback to PATCH /status with 'completed'
      try {
        const patchRes = await API.patch(`/appointments/${id}/status`, { status: 'completed' });
        alert('Appointment marked as completed and donation recorded!');
        setAppointments((prev) =>
          prev.map((a) => a.appointment_id === id ? { ...a, status: 'completed' } : a)
        );
      } catch (err2) {
        alert(e.response?.data?.message || err2.response?.data?.message || 'Failed to complete donation');
      }
    } finally {
      setUpdating(null);
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
        <select
          className="form-select"
          style={{ width: 200 }}
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="">All Statuses</option>
          <option value="requested">Requested</option>
          <option value="confirmed">Confirmed</option>
          <option value="completed">Completed</option>
          <option value="rejected">Rejected</option>
          <option value="cancelled">Cancelled</option>
        </select>
        <button className="btn btn-outline" onClick={fetchAppointments}>Refresh</button>
      </div>

      {loading ? <div className="spinner" /> : (
        <div className="card">
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>ID</th><th>Donor</th><th>Blood Group</th><th>Date</th><th>Status</th><th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {appointments.length === 0 ? (
                  <tr><td colSpan={6} style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>No appointments found</td></tr>
                ) : appointments.map((a) => (
                  <tr key={a.appointment_id}>
                    <td><strong>#{a.appointment_id}</strong></td>
                    <td>
                      <div><strong>{a.full_name}</strong></div>
                      <div className="text-sm text-muted">{a.phone}</div>
                    </td>
                    <td><span className="blood-badge">{a.blood_group}</span></td>
                    <td>{new Date(a.appointment_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</td>
                    <td><span className={`badge badge-${a.status}`}>{a.status}</span></td>
                    <td>
                      {a.status === 'requested' && (
                        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                          <button
                            className="btn btn-success btn-sm"
                            disabled={updating === a.appointment_id}
                            onClick={() => updateStatus(a.appointment_id, 'confirmed')}
                          >
                            ✅ Confirm
                          </button>
                          <button
                            className="btn btn-primary btn-sm"
                            disabled={updating === a.appointment_id}
                            onClick={() => completeDonation(a.appointment_id)}
                            title="Donor arrived: mark completed and record donation"
                          >
                            🩸 Donated
                          </button>
                          <button
                            className="btn btn-danger btn-sm"
                            disabled={updating === a.appointment_id}
                            onClick={() => updateStatus(a.appointment_id, 'rejected')}
                          >
                            ✗ Reject
                          </button>
                        </div>
                      )}
                      {a.status === 'confirmed' && (
                        <div style={{ display: 'flex', gap: 6 }}>
                          <button
                            className="btn btn-primary btn-sm"
                            disabled={updating === a.appointment_id}
                            onClick={() => completeDonation(a.appointment_id)}
                            title="Donor arrived: mark completed and record donation"
                          >
                            🩸 Complete Donation
                          </button>
                          <button
                            className="btn btn-outline btn-sm"
                            disabled={updating === a.appointment_id}
                            onClick={() => updateStatus(a.appointment_id, 'cancelled')}
                          >
                            Cancel
                          </button>
                        </div>
                      )}
                      {a.status === 'completed' && (
                        <span className="text-success text-sm font-bold">✅ Donated</span>
                      )}
                      {(a.status === 'rejected' || a.status === 'cancelled') && (
                        <span className="text-muted text-sm">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

function RecordDonation() {
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ donor_id: '', appointment_id: '', donation_date: '' });
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);

  const today = new Date().toISOString().split('T')[0];

  const fetchDonations = async () => {
    setLoading(true);
    try {
      const res = await API.get('/donations');
      setDonations(res.data.donations);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchDonations(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setResult(null);
    try {
      const payload = {
        donor_id: form.donor_id,
        donation_date: form.donation_date,
        ...(form.appointment_id && { appointment_id: form.appointment_id }),
      };
      const res = await API.post('/donations', payload);
      setResult({ success: true, message: res.data.message });
      setForm({ donor_id: '', appointment_id: '', donation_date: '' });
      fetchDonations();
    } catch (err) {
      setResult({ success: false, message: err.response?.data?.message || 'Failed to record donation' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      {/* Record Form */}
      <div className="card mb-6" style={{ maxWidth: 480 }}>
        <div className="card-header">
          <span className="card-title">🩸 Record New Donation</span>
        </div>
        <div className="card-body">
          {result && (
            <div className={`alert ${result.success ? 'alert-success' : 'alert-error'}`}>
              {result.success ? '✅' : '❌'} {result.message}
            </div>
          )}
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Donor ID *</label>
              <input
                className="form-input"
                type="number"
                value={form.donor_id}
                onChange={(e) => setForm({ ...form, donor_id: e.target.value })}
                placeholder="e.g. 3"
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Appointment ID (optional)</label>
              <input
                className="form-input"
                type="number"
                value={form.appointment_id}
                onChange={(e) => setForm({ ...form, appointment_id: e.target.value })}
                placeholder="Leave blank if no linked appointment"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Donation Date *</label>
              <input
                className="form-input"
                type="date"
                value={form.donation_date}
                onChange={(e) => setForm({ ...form, donation_date: e.target.value })}
                max={today}
                required
              />
            </div>
            <button type="submit" className="btn btn-primary w-full" disabled={submitting}>
              {submitting ? 'Recording...' : '🩸 Record Donation'}
            </button>
          </form>
        </div>
      </div>

      {/* Donations Table */}
      <div className="card">
        <div className="card-header">
          <span className="card-title">Donation Records</span>
          <button className="btn btn-outline btn-sm" onClick={fetchDonations}>Refresh</button>
        </div>
        {loading ? <div className="spinner" /> : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>ID</th><th>Donor</th><th>Blood Group</th><th>Date</th><th>Appointment</th>
                </tr>
              </thead>
              <tbody>
                {donations.length === 0 ? (
                  <tr><td colSpan={5} style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>No donations recorded yet</td></tr>
                ) : donations.map((d) => (
                  <tr key={d.donation_id}>
                    <td><strong>#{d.donation_id}</strong></td>
                    <td>
                      <div><strong>{d.full_name}</strong></div>
                      <div className="text-sm text-muted">{d.phone}</div>
                    </td>
                    <td><span className="blood-badge">{d.blood_group}</span></td>
                    <td>{new Date(d.donation_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</td>
                    <td>{d.appointment_id ? `#${d.appointment_id}` : <span className="text-muted">—</span>}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Main Dashboard ──
const PAGES = [
  { id: 'overview', label: 'Overview', icon: '📊' },
  { id: 'donors', label: 'Donors', icon: '👥' },
  { id: 'appointments', label: 'Appointments', icon: '📅' },
  { id: 'donations', label: 'Record Donation', icon: '🩸' },
];

export default function DashboardPage() {
  const { staff, logout } = useAuth();
  const navigate = useNavigate();
  const [activePage, setActivePage] = useState('overview');
  const [stats, setStats] = useState(null);

  useEffect(() => {
    API.get('/donations/stats').then((res) => setStats(res.data.stats)).catch(console.error);
  }, []);

  const handleLogout = () => { logout(); navigate('/'); };

  const pageTitles = { overview: 'Overview', donors: 'Donor Management', appointments: 'Appointments', donations: 'Record Donation' };

  return (
    <div className="dashboard-layout">
      {/* Sidebar */}
      <aside className="sidebar">
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>
            Signed in as
          </div>
          <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{staff?.full_name}</div>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{staff?.role}</div>
        </div>

        <nav>
          <ul className="sidebar-nav">
            {PAGES.map((p) => (
              <li key={p.id}>
                <button
                  className={activePage === p.id ? 'active' : ''}
                  onClick={() => setActivePage(p.id)}
                >
                  {p.icon} {p.label}
                </button>
              </li>
            ))}
            <li style={{ marginTop: 'auto', paddingTop: 16 }}>
              <button onClick={handleLogout} style={{ color: 'var(--danger)' }}>
                🚪 Sign Out
              </button>
            </li>
          </ul>
        </nav>
      </aside>

      {/* Content */}
      <main className="sidebar-content">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28 }}>
          <div>
            <h1 style={{ fontFamily: 'Outfit,sans-serif', fontSize: '1.5rem', fontWeight: 700 }}>
              {pageTitles[activePage]}
            </h1>
            <p className="text-sm text-muted">BloodConnect Management Dashboard</p>
          </div>
        </div>

        {activePage === 'overview' && <Overview stats={stats} />}
        {activePage === 'donors' && <DonorsList />}
        {activePage === 'appointments' && <AppointmentsList />}
        {activePage === 'donations' && <RecordDonation />}
      </main>
    </div>
  );
}
