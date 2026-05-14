import { Outlet } from 'react-router-dom';
import AdminSidebar from '../components/AdminSidebar';
import AdminTopbar from '../components/AdminTopbar';

export default function AdminLayout() {
  return (
    <div className="admin-shell">
      <AdminSidebar />
      <div className="admin-main">
        <AdminTopbar />
        <main className="admin-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
