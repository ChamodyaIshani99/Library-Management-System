import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';

const navItems = [
  { path: '/', icon: '📊', label: 'Dashboard' },
  { path: '/books', icon: '📚', label: 'Books' },
  { path: '/members', icon: '👥', label: 'Members' },
  { path: '/borrows', icon: '🔄', label: 'Borrows' },
];

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    toast.success('Logged out successfully');
    navigate('/login');
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <div className="logo-icon">📖</div>
        <div>
          <h1>LibraryMS</h1>
          <span>Management System</span>
        </div>
      </div>

      <nav className="sidebar-nav">
        <div className="sidebar-section-label">Main Menu</div>
        {navItems.map(item => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
            end={item.path === '/'}
          >
            <span className="nav-icon">{item.icon}</span>
            {item.label}
          </NavLink>
        ))}

        <div className="sidebar-section-label">Account</div>
        <NavLink to="/profile" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
          <span className="nav-icon">⚙️</span>
          Profile
        </NavLink>
      </nav>

      <div className="sidebar-footer">
        <button
          onClick={handleLogout}
          className="nav-link"
          style={{ width: '100%', background: 'rgba(220,38,38,0.15)', color: '#fca5a5', border: 'none', cursor: 'pointer' }}
        >
          <span className="nav-icon">🚪</span>
          Logout
        </button>
      </div>
    </aside>
  );
}
