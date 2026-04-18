import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import API_BASE_URL from '../config/apiConfig';
import './Header.css';

function Header() {
  const [searchQuery, setSearchQuery] = useState('');
  const [authUser, setAuthUser] = useState(null);
  const [isAdminSession, setIsAdminSession] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const syncAuthState = () => {
      const adminToken = localStorage.getItem('adminToken');
      const adminEmail = localStorage.getItem('adminEmail');
      const userToken = localStorage.getItem('userToken') || localStorage.getItem('token');
      const storedUserRaw = localStorage.getItem('user');

      let storedUser = null;
      if (storedUserRaw) {
        try {
          storedUser = JSON.parse(storedUserRaw);
        } catch (parseError) {
          storedUser = null;
        }
      }

      if (adminToken && (adminEmail || storedUser?.userType === 'admin')) {
        const resolvedEmail = adminEmail || storedUser?.email || 'admin@localhost';
        setIsAdminSession(true);
        setAuthUser({
          name: storedUser?.name || 'Admin',
          email: resolvedEmail,
          userType: 'admin',
        });
        return;
      }

      if (userToken && storedUser) {
        setIsAdminSession(false);
        setAuthUser(storedUser);
        return;
      }

      setIsAdminSession(false);
      setAuthUser(null);
    };

    syncAuthState();
    setShowUserMenu(false);

    const onStorage = () => syncAuthState();
    window.addEventListener('storage', onStorage);

    return () => {
      window.removeEventListener('storage', onStorage);
    };
  }, [location.pathname]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      console.log('Searching for:', searchQuery);
    }
  };

  const handleLogout = async () => {
    try {
      const adminToken = localStorage.getItem('adminToken');
      const userToken = localStorage.getItem('userToken') || localStorage.getItem('token');

      if (adminToken) {
        await fetch(`${API_BASE_URL}/admin/logout`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${adminToken}`,
            'Content-Type': 'application/json',
          },
        });
      } else if (userToken) {
        await fetch(`${API_BASE_URL}/auth/logout`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${userToken}`,
            'Content-Type': 'application/json',
          },
        });
      }
    } catch (err) {
      console.error('Logout error:', err);
    }

    // Clear storage
    localStorage.removeItem('userToken');
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminEmail');
    setAuthUser(null);
    setIsAdminSession(false);
    setShowUserMenu(false);
    navigate('/');
  };

  return (
    <header className="header">
      <div className="header-container">
        <div className="logo-section">
          <Link to="/" className="logo-link">
            <img src="/kl.png" alt="KLPro Pvt Ltd Logo" className="logo" />
            <h1>KLPro Pvt Ltd</h1>
          </Link>
        </div>
        
        <div className="header-search">
          <form onSubmit={handleSearch}>
            <input 
              type="text" 
              placeholder="What are you looking for?" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button type="submit">Search</button>
          </form>
        </div>

        <nav className="navbar">
          <Link to="/" className="nav-link">Home</Link>
          <Link to="/services" className="nav-link">Services</Link>
          <Link to="/professionals" className="nav-link">Professionals</Link>
          <Link to="/bookings" className="nav-link">My Bookings</Link>
          
          {authUser ? (
            <div className="user-menu-container">
              <button 
                className="user-btn"
                onClick={() => setShowUserMenu(!showUserMenu)}
              >
                <span className="user-avatar">{authUser?.name?.charAt(0)?.toUpperCase() || 'U'}</span>
                <span className="user-name">{authUser?.name || 'User'}</span>
              </button>
              
              {showUserMenu && (
                <div className="user-dropdown">
                  {isAdminSession ? (
                    <Link to="/admin/dashboard" className="dropdown-item">
                      Admin Dashboard
                    </Link>
                  ) : (
                    <Link to="/profile" className="dropdown-item">
                      My Profile
                    </Link>
                  )}
                  <button 
                    className="dropdown-item logout-item"
                    onClick={handleLogout}
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="auth-links">
              <Link to="/login" className="nav-link login-link">
                SignIn
              </Link>
              <Link to="/login?mode=signup" className="nav-link signup-link">
                SignUp
              </Link>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
}

export default Header;
