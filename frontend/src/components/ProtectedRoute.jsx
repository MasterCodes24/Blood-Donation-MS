import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ children }) {
  const { staff } = useAuth();
  if (!staff) {
    return <Navigate to="/staff/login" replace />;
  }
  return children;
}
