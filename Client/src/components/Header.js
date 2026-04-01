import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Header.css';

function Header() {
  const [searchQuery, setSearchQuery] = useState('');
  const [user, setUser] = useState(null);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is logged in
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      console.log('Searching for:', searchQuery);
    }
  };

  const handleLogout = async () => {
    try {
      const token = localStorage.getItem('userToken');
      if (token) {
        await fetch('http://localhost:5000/api/auth/logout', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
      }
    } catch (err) {
      console.error('Logout error:', err);
    }

    // Clear storage
    localStorage.removeItem('userToken');
    localStorage.removeItem('user');
    setUser(null);
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
          
          {user ? (
            <div className="user-menu-container">
              <button 
                className="user-btn"
                onClick={() => setShowUserMenu(!showUserMenu)}
              >
                <span className="user-avatar">{user?.name?.charAt(0)?.toUpperCase() || 'U'}</span>
                <span className="user-name">{user?.name || 'User'}</span>
              </button>
              
              {showUserMenu && (
                <div className="user-dropdown">
                  <Link to="/profile" className="dropdown-item">
                    My Profile
                  </Link>
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
            <Link to="/login" className="nav-link login-link">
              Login
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}

export default Header;
