import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { adminApi } from '../services/adminApi';
import { getApiError } from '../services/http';

const AdminAuthContext = createContext(null);

export function AdminAuthProvider({ children }) {
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    adminApi
      .profile()
      .then((response) => {
        if (!mounted) return;
        const user = response.data?.data;
        setAdmin(user?.role === 'ADMIN' ? user : null);
      })
      .catch(() => {
        if (mounted) {
          setAdmin(null);
        }
      })
      .finally(() => {
        if (mounted) {
          setLoading(false);
        }
      });

    return () => {
      mounted = false;
    };
  }, []);

  const value = useMemo(
    () => ({
      admin,
      loading,
      async login(payload) {
        const response = await adminApi.login(payload).catch((error) => {
          throw new Error(getApiError(error, 'Login failed'));
        });
        const user = response.data?.data;

        if (user?.role !== 'ADMIN') {
          throw new Error('This account does not have admin access');
        }

        setAdmin(user);
        return user;
      },
      async logout() {
        await adminApi.logout();
        setAdmin(null);
      }
    }),
    [admin, loading]
  );

  return <AdminAuthContext.Provider value={value}>{children}</AdminAuthContext.Provider>;
}

export function useAdminAuth() {
  const context = useContext(AdminAuthContext);

  if (!context) {
    throw new Error('useAdminAuth must be used inside AdminAuthProvider');
  }

  return context;
}
