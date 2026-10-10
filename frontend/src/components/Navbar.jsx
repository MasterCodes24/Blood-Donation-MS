import { NavLink, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { staff, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="navbar">
      <Link to="/" className="navbar-brand">
        <div className="brand-icon">🩸</div>
        <span>BloodConnect</span>
      </Link>

      <ul className="navbar-links">
        <li><NavLink to="/">Home</NavLink></li>
        <li><NavLink to="/register">Donate</NavLink></li>
        <li><NavLink to="/appointment">Appointment</NavLink></li>
        <li><NavLink to="/status">Check Status</NavLink></li>

        {staff ? (
          <>
            <li><NavLink to="/dashboard">Dashboard</NavLink></li>
            <li>
              <button onClick={handleLogout} style={{ color: 'var(--red-primary)' }}>
                Sign Out
              </button>
            </li>
          </>
        ) : (
          <li>
            <NavLink to="/staff/login">
              <button className="btn btn-primary btn-sm">Staff Login</button>
            </NavLink>
          </li>
        )}
      </ul>
    </nav>
  );
}
