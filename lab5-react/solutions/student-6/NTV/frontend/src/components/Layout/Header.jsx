import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import '../../styles/Header.css';

const Header = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getInitials = (username) => {
    return username ? username.charAt(0).toUpperCase() : 'U';
  };

  return (
    <header className="header">
      <div className="header-content">
        <div className="logo">
          <Link to="/">
            <span className="logo-icon">🌐</span>
            Network Visualizer
          </Link>
        </div>
        
        <nav className="nav">
          <Link 
            to="/" 
            className={location.pathname === '/' ? 'nav-link active' : 'nav-link'}
          >
            Dashboard
          </Link>
          <Link 
            to="/editor" 
            className={location.pathname === '/editor' ? 'nav-link active' : 'nav-link'}
          >
            Editor
          </Link>
          <Link 
            to="/account" 
            className={location.pathname === '/account' ? 'nav-link active' : 'nav-link'}
          >
            Account
          </Link>
          {user?.role === 'Administrator' && (
            <Link 
              to="/admin" 
              className={location.pathname === '/admin' ? 'nav-link active' : 'nav-link'}
              style={{ color: '#ef4444' }}
            >
              🔐 Admin
            </Link>
          )}
        </nav>

        <div className="user-section">
          <div className="user-info">
            <div className="user-avatar">
              {getInitials(user?.username)}
            </div>
            <div className="user-details">
              <span className="username">{user?.username}</span>
              <span className="user-role">{user?.role || 'User'}</span>
            </div>
          </div>
          <button onClick={handleLogout} className="logout-btn">
            Logout
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
