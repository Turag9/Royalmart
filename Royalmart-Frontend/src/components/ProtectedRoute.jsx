import { useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useStore } from '../store/StoreContext';
import { ROUTES } from '../utils/constants';

export default function ProtectedRoute({ children }) {
  const { user, setToast } = useStore();

  useEffect(() => {
    if (!user) setToast('Please login first');
  }, [user, setToast]);

  return user ? children : <Navigate to={ROUTES.login} replace />;
}
