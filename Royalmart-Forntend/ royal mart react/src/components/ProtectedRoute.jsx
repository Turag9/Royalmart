import { Navigate } from 'react-router-dom';
import { useStore } from '../store/StoreContext';
import { ROUTES } from '../utils/constants';

export default function ProtectedRoute({ children }) {
  const { user } = useStore();

  // No logged-in user means this page should stay private.
  return user ? children : <Navigate to={ROUTES.login} replace />;
}
