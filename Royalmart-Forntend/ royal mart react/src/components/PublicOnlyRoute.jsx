import { Navigate } from 'react-router-dom';
import { useStore } from '../store/StoreContext';
import { ROUTES } from '../utils/constants';

export default function PublicOnlyRoute({ children }) {
  const { user } = useStore();

  // If the user is already logged in, sending them back to profile feels more natural.
  return user ? <Navigate to={ROUTES.profile} replace /> : children;
}
