import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminServicesSection from '../components/AdminServicesSection';
import API_BASE_URL from '../config/apiConfig';
import './AdminDashboard.css';

function AdminDashboard() {
  const [users, setUsers] = useState([]);
  const [services, setServices] = useState([]);
  const [statistics, setStatistics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [editingUser, setEditingUser] = useState(null);
  const [selectedService, setSelectedService] = useState(null);
  const [editingService, setEditingService] = useState(null);
  const [showServiceForm, setShowServiceForm] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (!token) {
      navigate('/admin/login');
      return;
    }
    
    Promise.all([
      fetchAdminProfile(),
      fetchUsers(),
      fetchStatistics(),
      fetchServices()
    ]).catch(err => {
      setError(err.message);
      if (err.message.includes('401')) {
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminEmail');
        navigate('/admin/login');
      }
    }).finally(() => setLoading(false));
  }, [navigate]);

  const fetchAdminProfile = async () => {
    const token = localStorage.getItem('adminToken');
    try {
      const response = await fetch(`${API_BASE_URL}/admin/profile`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch admin profile');
      }
    } catch (err) {
      console.error('Error fetching admin profile:', err);
    }
  };

  const fetchUsers = async () => {
    const token = localStorage.getItem('adminToken');
    const response = await fetch(`${API_BASE_URL}/admin/users`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      throw new Error('Failed to fetch users');
    }

    const data = await response.json();
    setUsers(data.users || []);
  };

  const fetchStatistics = async () => {
    const token = localStorage.getItem('adminToken');
    const response = await fetch(`${API_BASE_URL}/admin/users/stats`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      throw new Error('Failed to fetch statistics');
    }

    const data = await response.json();
    setStatistics(data.statistics);
  };

  const fetchServices = async () => {
    const token = localStorage.getItem('adminToken');
    const response = await fetch(`${API_BASE_URL}/admin/services`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      throw new Error('Failed to fetch services');
    }

    const data = await response.json();
    setServices(data.services || []);
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user?')) {
      return;
    }

    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`http://localhost:5000/api/admin/users/${userId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to delete user');
      }

      setUsers(users.filter(u => u._id !== userId));
      setSelectedUser(null);
      alert('User deleted successfully');
    } catch (err) {
      setError(err.message || 'Failed to delete user');
    }
  };

  const handleUpdateUser = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`http://localhost:5000/api/admin/users/${editingUser._id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(editingUser)
      });

      if (!response.ok) {
        throw new Error('Failed to update user');
      }

      const updatedUser = await response.json();
      setUsers(users.map(u => u._id === updatedUser.user._id ? updatedUser.user : u));
      setEditingUser(null);
      setSelectedUser(null);
      alert('User updated successfully');
    } catch (err) {
      setError(err.message || 'Failed to update user');
    }
  };

  const handleDeleteService = async (serviceId) => {
    if (!window.confirm('Are you sure you want to delete this service?')) {
      return;
    }

    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`http://localhost:5000/api/admin/services/${serviceId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to delete service');
      }

      setServices(services.filter(s => s._id !== serviceId));
      setSelectedService(null);
      alert('Service deleted successfully');
    } catch (err) {
      setError(err.message || 'Failed to delete service');
    }
  };

  const handleUpdateService = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`http://localhost:5000/api/admin/services/${editingService._id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(editingService)
      });

      if (!response.ok) {
        throw new Error('Failed to update service');
      }

      const updatedService = await response.json();
      setServices(services.map(s => s._id === updatedService.service._id ? updatedService.service : s));
      setEditingService(null);
      setSelectedService(null);
      alert('Service updated successfully');
    } catch (err) {
      setError(err.message || 'Failed to update service');
    }
  };

  const handleCreateService = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch('http://localhost:5000/api/admin/services', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(editingService)
      });

      if (!response.ok) {
        throw new Error('Failed to create service');
      }

      const newService = await response.json();
      setServices([...services, newService.service]);
      setEditingService(null);
      setShowServiceForm(false);
      alert('Service created successfully');
    } catch (err) {
      setError(err.message || 'Failed to create service');
    }
  };

  const handleToggleMostBooked = async (serviceId) => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`http://localhost:5000/api/admin/services/${serviceId}/most-booked`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to toggle most booked status');
      }

      const updatedService = await response.json();
      setServices(services.map(s => s._id === updatedService.service._id ? updatedService.service : s));
      setSelectedService(updatedService.service);
      alert(`Service ${updatedService.service.isMostBooked ? 'marked as' : 'unmarked from'} most booked`);
    } catch (err) {
      setError(err.message || 'Failed to toggle most booked status');
    }
  };

  const handleLogout = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      await fetch('http://localhost:5000/api/admin/logout', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
    } catch (err) {
      console.error('Logout error:', err);
    }

    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminEmail');
    navigate('/');
  };

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="admin-dashboard-container">
        <div className="admin-loading">Loading...</div>
      </div>
    );
  }

  return (
    <div className="admin-dashboard-container">
      <div className="admin-header">
        <div className="admin-header-content">
          <h1>Admin Dashboard</h1>
          <button className="admin-logout-btn" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </div>

      {error && <div className="admin-error">{error}</div>}

      <div className="admin-dashboard-content">
        {/* Overview Statistics */}
        {activeTab === 'overview' && statistics && (
          <div className="stats-container">
            <h2>Statistics</h2>
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-value">{statistics.totalUsers}</div>
                <div className="stat-label">Total Users</div>
              </div>
              <div className="stat-card">
                <div className="stat-value" style={{color: '#27ae60'}}>{statistics.customers}</div>
                <div className="stat-label">Customers</div>
              </div>
              <div className="stat-card">
                <div className="stat-value" style={{color: '#e74c3c'}}>{statistics.professionals}</div>
                <div className="stat-label">Professionals</div>
              </div>
              <div className="stat-card">
                <div className="stat-value" style={{color: '#f39c12'}}>{statistics.verifiedUsers}</div>
                <div className="stat-label">Verified Users</div>
              </div>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="admin-tabs">
          <button 
            className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            Overview
          </button>
          <button 
            className={`tab-btn ${activeTab === 'users' ? 'active' : ''}`}
            onClick={() => setActiveTab('users')}
          >
            Manage Users
          </button>
          <button 
            className={`tab-btn ${activeTab === 'services' ? 'active' : ''}`}
            onClick={() => setActiveTab('services')}
          >
            Manage Services
          </button>
        </div>

        {/* Users Management */}
        {activeTab === 'users' && (
          <div className="users-section">
            <div className="users-header">
              <h2>User Management</h2>
              <input
                type="text"
                placeholder="Search users..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="search-input"
              />
            </div>

            {selectedUser ? (
              <div className="user-detail-view">
                <button 
                  className="back-btn"
                  onClick={() => {
                    setSelectedUser(null);
                    setEditingUser(null);
                  }}
                >
                  ← Back to List
                </button>

                {editingUser ? (
                  <div className="user-edit-form">
                    <h3>Edit User</h3>
                    <div className="form-group">
                      <label>Name</label>
                      <input
                        type="text"
                        value={editingUser.name}
                        onChange={(e) => setEditingUser({...editingUser, name: e.target.value})}
                      />
                    </div>
                    <div className="form-group">
                      <label>Email</label>
                      <input type="email" value={editingUser.email} disabled />
                    </div>
                    <div className="form-group">
                      <label>Phone</label>
                      <input
                        type="tel"
                        value={editingUser.phone}
                        onChange={(e) => setEditingUser({...editingUser, phone: e.target.value})}
                      />
                    </div>
                    <div className="form-group">
                      <label>City</label>
                      <input
                        type="text"
                        value={editingUser.city}
                        onChange={(e) => setEditingUser({...editingUser, city: e.target.value})}
                      />
                    </div>
                    <div className="form-group">
                      <label>User Type</label>
                      <select
                        value={editingUser.userType}
                        onChange={(e) => setEditingUser({...editingUser, userType: e.target.value})}
                      >
                        <option value="customer">Customer</option>
                        <option value="professional">Professional</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Verified</label>
                      <input
                        type="checkbox"
                        checked={editingUser.isVerified}
                        onChange={(e) => setEditingUser({...editingUser, isVerified: e.target.checked})}
                      />
                    </div>
                    <div className="form-actions">
                      <button className="btn-save" onClick={handleUpdateUser}>Save Changes</button>
                      <button className="btn-cancel" onClick={() => setEditingUser(null)}>Cancel</button>
                    </div>
                  </div>
                ) : (
                  <div className="user-detail-card">
                    <h3>{selectedUser.name}</h3>
                    <div className="detail-row">
                      <span className="label">Email:</span>
                      <span>{selectedUser.email}</span>
                    </div>
                    <div className="detail-row">
                      <span className="label">Phone:</span>
                      <span>{selectedUser.phone || 'Not provided'}</span>
                    </div>
                    <div className="detail-row">
                      <span className="label">City:</span>
                      <span>{selectedUser.city || 'Not provided'}</span>
                    </div>
                    <div className="detail-row">
                      <span className="label">Type:</span>
                      <span className="badge">{selectedUser.userType}</span>
                    </div>
                    <div className="detail-row">
                      <span className="label">Verified:</span>
                      <span>{selectedUser.isVerified ? '✓ Yes' : '✗ No'}</span>
                    </div>
                    <div className="detail-row">
                      <span className="label">Member Since:</span>
                      <span>{new Date(selectedUser.createdAt).toLocaleDateString()}</span>
                    </div>
                    <div className="detail-actions">
                      <button 
                        className="btn-edit"
                        onClick={() => setEditingUser({...selectedUser})}
                      >
                        Edit User
                      </button>
                      <button 
                        className="btn-delete"
                        onClick={() => handleDeleteUser(selectedUser._id)}
                      >
                        Delete User
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="users-table-container">
                <table className="users-table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Type</th>
                      <th>Verified</th>
                      <th>Joined</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.length > 0 ? (
                      filteredUsers.map(user => (
                        <tr key={user._id}>
                          <td>{user.name}</td>
                          <td>{user.email}</td>
                          <td><span className="badge">{user.userType}</span></td>
                          <td>{user.isVerified ? '✓' : '✗'}</td>
                          <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                          <td>
                            <button 
                              className="btn-view"
                              onClick={() => setSelectedUser(user)}
                            >
                              View
                            </button>
                            <button 
                              className="btn-delete-small"
                              onClick={() => handleDeleteUser(user._id)}
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="6" className="text-center">No users found</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Services Management */}
        {activeTab === 'services' && (
          <AdminServicesSection
            services={services}
            selectedService={selectedService}
            setSelectedService={setSelectedService}
            editingService={editingService}
            setEditingService={setEditingService}
            showServiceForm={showServiceForm}
            setShowServiceForm={setShowServiceForm}
            handleDeleteService={handleDeleteService}
            handleUpdateService={handleUpdateService}
            handleCreateService={handleCreateService}
            handleToggleMostBooked={handleToggleMostBooked}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
          />
        )}
      </div>
    </div>
  );
}

export default AdminDashboard;
