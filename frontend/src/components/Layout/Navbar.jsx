import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const pageTitles = {
  '/': 'Dashboard',
  '/books': 'Book Catalog',
  '/members': 'Member Management',
  '/borrows': 'Borrow Records',
  '/profile': 'My Profile'
};

export default function Navbar() {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const title = pageTitles[location.pathname] || 'Library';

  return (
    <header className="navbar">
      <span className="navbar-title">{title}</span>
      <div className="navbar-right">
        <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
          {new Date().toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}
        </span>
        <div className="user-badge" onClick={() => navigate('/profile')}>
          <div className="avatar">{user?.name?.charAt(0).toUpperCase()}</div>
          <div>
            <div style={{ fontSize: '13px', fontWeight: '500' }}>{user?.name}</div>
          </div>
          <span className="role-badge">{user?.role}</span>
        </div>
      </div>
    </header>
  );
}
