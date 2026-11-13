import { createContext, useContext, useMemo, useState } from 'react';
import { FiAlertCircle, FiCheckCircle, FiInfo, FiX } from 'react-icons/fi';

const AdminToastContext = createContext(null);

function ToastIcon({ type }) {
  if (type === 'success') return <FiCheckCircle />;
  if (type === 'error') return <FiAlertCircle />;
  return <FiInfo />;
}

export function AdminToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const value = useMemo(
    () => ({
      showToast(message, type = 'info') {
        const id = crypto.randomUUID();
        setToasts((current) => [...current, { id, message, type }]);

        window.setTimeout(() => {
          setToasts((current) => current.filter((toast) => toast.id !== id));
        }, 3200);
      }
    }),
    []
  );

  return (
    <AdminToastContext.Provider value={value}>
      {children}
      <div className="admin-toast-stack">
        {toasts.map((toast) => (
          <div key={toast.id} className={`admin-toast admin-toast--${toast.type}`}>
            <span className="admin-toast__icon">
              <ToastIcon type={toast.type} />
            </span>
            <p>{toast.message}</p>
            <button
              type="button"
              className="admin-toast__close"
              onClick={() => setToasts((current) => current.filter((item) => item.id !== toast.id))}
            >
              <FiX />
            </button>
          </div>
        ))}
      </div>
    </AdminToastContext.Provider>
  );
}

export function useAdminToast() {
  const context = useContext(AdminToastContext);

  if (!context) {
    throw new Error('useAdminToast must be used inside AdminToastProvider');
  }

  return context;
}
