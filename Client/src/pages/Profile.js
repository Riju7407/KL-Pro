import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import './Profile.css';

function Profile() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({});
  const navigate = useNavigate();

  const fetchProfile = useCallback(async () => {
    try {
      const token = localStorage.getItem('userToken');
      
      if (!token) {
        navigate('/login');
        return;
      }

      const response = await fetch('http://localhost:5000/api/users/profile', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem('userToken');
          localStorage.removeItem('user');
          navigate('/login');
          return;
        }
        throw new Error('Failed to fetch profile');
      }

      const data = await response.json();
      setProfile(data);
      setEditData(data);
    } catch (err) {
      setError(err.message || 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSaveProfile = async () => {
    try {
      const token = localStorage.getItem('userToken');
      
      const response = await fetch('http://localhost:5000/api/users/profile', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: editData.name,
          phone: editData.phone,
          address: editData.address,
          city: editData.city
        })
      });

      if (!response.ok) {
        throw new Error('Failed to update profile');
      }

      const updated = await response.json();
      setProfile(updated);
      setEditData(updated);
      setIsEditing(false);

      // Update user info in localStorage
      const user = JSON.parse(localStorage.getItem('user'));
      user.name = updated.name;
      localStorage.setItem('user', JSON.stringify(user));

    } catch (err) {
      setError(err.message || 'Failed to update profile');
    }
  };

  const handleLogout = async () => {
    try {
      const token = localStorage.getItem('userToken');
      
      await fetch('http://localhost:5000/api/auth/logout', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
    } catch (err) {
      console.error('Logout error:', err);
    }

    // Clear storage
    localStorage.removeItem('userToken');
    localStorage.removeItem('user');
    navigate('/');
  };

  if (loading) {
    return (
      <div className="profile">
        <div className="loading">Loading profile...</div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="profile">
        <div className="error">{error || 'Profile not found'}</div>
      </div>
    );
  }

  const firstName = profile.name?.split(' ')[0] || 'User';

  return (
    <div className="profile">
      <h1>My Profile</h1>

      <div className="profile-container">
        <div className="profile-header">
          <div className="profile-avatar">{firstName.charAt(0).toUpperCase()}</div>
          <div className="profile-header-info">
            <h2>{profile.name}</h2>
            <p>Member since {new Date(profile.createdAt).toLocaleDateString()}</p>
            <span className="user-type-badge">{profile.userType}</span>
          </div>
        </div>

        {error && <div className="profile-error">{error}</div>}

        {isEditing ? (
          <div className="profile-edit-form">
            <h3>Edit Profile</h3>
            <div className="form-group">
              <label>Name</label>
              <input
                type="text"
                name="name"
                value={editData.name || ''}
                onChange={handleEditChange}
              />
            </div>
            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                value={editData.email || ''}
                disabled
              />
            </div>
            <div className="form-group">
              <label>Phone</label>
              <input
                type="tel"
                name="phone"
                value={editData.phone || ''}
                onChange={handleEditChange}
              />
            </div>
            <div className="form-group">
              <label>City</label>
              <input
                type="text"
                name="city"
                value={editData.city || ''}
                onChange={handleEditChange}
              />
            </div>
            <div className="form-group">
              <label>Address</label>
              <textarea
                name="address"
                value={editData.address || ''}
                onChange={handleEditChange}
                rows="3"
              />
            </div>
            <div className="edit-actions">
              <button className="btn-save" onClick={handleSaveProfile}>Save Changes</button>
              <button className="btn-cancel" onClick={() => setIsEditing(false)}>Cancel</button>
            </div>
          </div>
        ) : (
          <div className="profile-details">
            <div className="detail-item">
              <label>Email</label>
              <p>{profile.email}</p>
            </div>
            <div className="detail-item">
              <label>Phone</label>
              <p>{profile.phone || 'Not provided'}</p>
            </div>
            <div className="detail-item">
              <label>City</label>
              <p>{profile.city || 'Not provided'}</p>
            </div>
            <div className="detail-item">
              <label>Address</label>
              <p>{profile.address || 'Not provided'}</p>
            </div>
          </div>
        )}

        <div className="profile-actions">
          {!isEditing && (
            <>
              <button className="btn-edit" onClick={() => setIsEditing(true)}>Edit Profile</button>
              <button className="btn-history">View History</button>
            </>
          )}
        </div>

        <div className="profile-danger-zone">
          <h3>Account Actions</h3>
          <button className="btn-logout" onClick={handleLogout}>Logout</button>
        </div>
      </div>
    </div>
  );
}

export default Profile;
