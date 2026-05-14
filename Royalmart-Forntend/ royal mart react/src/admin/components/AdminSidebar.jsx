import { NavLink } from 'react-router-dom';
import { adminMenu } from '../utils/menu';

export default function AdminSidebar() {
  return (
    <aside className="admin-sidebar">
      <div className="admin-brand">
        <div className="admin-brand__badge">RM</div>
        <div>
          <h2>Royal Mart</h2>
          <p>Admin Suite</p>
        </div>
      </div>

      <nav className="admin-nav">
        {adminMenu.map((item) => {
          const Icon = item.icon;

          return (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/admin'}
              className={({ isActive }) => `admin-nav__link ${isActive ? 'is-active' : ''}`}
            >
              <Icon />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>
    </aside>
  );
}
