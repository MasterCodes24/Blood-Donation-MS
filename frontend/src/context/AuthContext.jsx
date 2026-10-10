import { createContext, useContext, useState, useEffect } from 'react';
import API from '../api/axios';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [staff, setStaff] = useState(() => {
    const saved = localStorage.getItem('staff');
    return saved ? JSON.parse(saved) : null;
  });
  const [loading, setLoading] = useState(false);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const res = await API.post('/staff/login', { email, password });
      const { token, staff: staffData } = res.data;
      localStorage.setItem('token', token);
      localStorage.setItem('staff', JSON.stringify(staffData));
      setStaff(staffData);
      return { success: true };
    } catch (err) {
      return { success: false, message: err.response?.data?.message || 'Login failed' };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('staff');
    setStaff(null);
  };

  return (
    <AuthContext.Provider value={{ staff, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
