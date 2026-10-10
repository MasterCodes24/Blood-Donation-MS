import { Link } from 'react-router-dom';

const steps = [
  { num: '01', icon: '📋', title: 'Register', desc: 'Fill out a quick form with your name, blood group, and contact details.' },
  { num: '02', icon: '📅', title: 'Request Appointment', desc: 'Pick a convenient date and submit your appointment request.' },
  { num: '03', icon: '✅', title: 'Confirmation', desc: 'Staff reviews and confirms your appointment via the system.' },
  { num: '04', icon: '🩸', title: 'Donate', desc: 'Visit the centre. Staff records your donation and updates your history.' },
];

export default function HomePage() {
  return (
    <div>
      {/* Hero */}
      <section className="hero">
        <div className="container">
          <div className="hero-content">
            <div className="hero-tag">
              <span>❤️</span>
              <span>Save Lives · Give Blood</span>
            </div>
            <h1>
              Every Drop <br />
              <span className="highlight">Matters.</span>
            </h1>
            <p>
              Register as a blood donor, schedule your appointment, and help
              your community. BloodConnect makes it easy for you and the centre
              to coordinate life-saving donations.
            </p>
            <div className="hero-actions">
              <Link to="/register" className="btn btn-primary btn-lg">
                🩸 Register as Donor
              </Link>
              <Link to="/appointment" className="btn btn-outline btn-lg">
                📅 Book Appointment
              </Link>
            </div>
            <div className="hero-stats">
              <div>
                <div className="hero-stat-value">A, B, O, AB</div>
                <div className="hero-stat-label">All blood groups</div>
              </div>
              <div>
                <div className="hero-stat-value">24/7</div>
                <div className="hero-stat-label">Online registration</div>
              </div>
              <div>
                <div className="hero-stat-value">Fast</div>
                <div className="hero-stat-label">Appointment scheduling</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Steps */}
      <section className="steps-section">
        <div className="container">
          <h2 className="section-title">How It Works</h2>
          <p className="section-sub">Four simple steps from registration to donation</p>
          <div className="steps-grid">
            {steps.map((s) => (
              <div className="step-card" key={s.num}>
                <div className="step-number">{s.num}</div>
                <div className="step-icon">{s.icon}</div>
                <div className="step-title">{s.title}</div>
                <div className="step-desc">{s.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: '60px 0', borderTop: '1px solid var(--border)' }}>
        <div className="container text-center">
          <h2 style={{ fontFamily: 'Outfit,sans-serif', fontSize: '1.6rem', fontWeight: 700, marginBottom: 12 }}>
            Already a Donor?
          </h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: 28 }}>
            Check your appointment status or view your donation history.
          </p>
          <Link to="/status" className="btn btn-primary">
            🔍 Check My Status
          </Link>
        </div>
      </section>
    </div>
  );
}
