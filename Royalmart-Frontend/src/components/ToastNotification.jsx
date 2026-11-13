import { useStore } from '../store/StoreContext';

export default function ToastNotification() {
  const { toast } = useStore();

  if (!toast) return null;

  return (
    <div className="toast-notification show">
      <span className="material-symbols-outlined toast-icon">check_circle</span>
      <span className="toast-message">{toast}</span>
    </div>
  );
}
