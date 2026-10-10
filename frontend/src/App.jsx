import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';

import HomePage from './pages/HomePage';
import RegisterPage from './pages/RegisterPage';
import AppointmentPage from './pages/AppointmentPage';
import StatusPage from './pages/StatusPage';
import StaffLoginPage from './pages/StaffLoginPage';
import DashboardPage from './pages/DashboardPage';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Navbar />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/appointment" element={<AppointmentPage />} />
          <Route path="/status" element={<StatusPage />} />
          <Route path="/staff/login" element={<StaffLoginPage />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            }
          />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
