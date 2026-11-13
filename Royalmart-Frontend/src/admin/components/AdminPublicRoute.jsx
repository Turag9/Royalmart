import { Navigate } from 'react-router-dom';
import { useAdminAuth } from '../context/AdminAuthContext';

export default function AdminPublicRoute({ children }) {
  const { admin, loading } = useAdminAuth();

  if (loading) {
    return <div className="admin-auth-shell">Loading admin dashboard...</div>;
  }

  if (admin) {
    return <Navigate to="/admin" replace />;
  }

  return children;
}
