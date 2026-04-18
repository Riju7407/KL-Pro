import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminServicesSection from '../components/AdminServicesSection';
import API_BASE_URL from '../config/apiConfig';
import { SERVICE_HIERARCHY, getHierarchyOptions, getServiceTypeOptions } from '../config/serviceHierarchy';
import './AdminDashboard.css';

function AdminDashboard() {
  const [users, setUsers] = useState([]);
  const [services, setServices] = useState([]);
  const [statistics, setStatistics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('shop');
  const [theme, setTheme] = useState(() => localStorage.getItem('adminTheme') || 'light');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [editingUser, setEditingUser] = useState(null);
  const [selectedService, setSelectedService] = useState(null);
  const [editingService, setEditingService] = useState(null);
  const [showServiceForm, setShowServiceForm] = useState(false);
  const [serviceImageFile, setServiceImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [professionalApplications, setProfessionalApplications] = useState([]);
  const [applicationActionLoadingId, setApplicationActionLoadingId] = useState(null);
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
      fetchServices(),
      fetchProfessionalApplications()
    ]).catch(err => {
      setError(err.message);
      if (err.message.includes('401')) {
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminEmail');
        navigate('/admin/login');
      }
    }).finally(() => setLoading(false));
  }, [navigate]);

  useEffect(() => {
    localStorage.setItem('adminTheme', theme);
  }, [theme]);

  useEffect(() => {
    setSelectedUser(null);
    setEditingUser(null);
  }, [activeTab]);

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

  const fetchProfessionalApplications = async () => {
    const token = localStorage.getItem('adminToken');
    const response = await fetch(`${API_BASE_URL}/admin/professionals/applications`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      throw new Error('Failed to fetch professional applications');
    }

    const data = await response.json();
    setProfessionalApplications(data.applications || []);
  };

  const handleReviewProfessional = async (applicationId, status) => {
    try {
      setApplicationActionLoadingId(applicationId);
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`${API_BASE_URL}/admin/professionals/${applicationId}/review`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status })
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to review professional application');
      }

      await Promise.all([fetchProfessionalApplications(), fetchUsers(), fetchStatistics()]);
      alert(`Professional application ${status} successfully`);
    } catch (err) {
      setError(err.message || 'Failed to review professional application');
    } finally {
      setApplicationActionLoadingId(null);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user?')) {
      return;
    }

    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`${API_BASE_URL}/admin/users/${userId}`, {
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
      const response = await fetch(`${API_BASE_URL}/admin/users/${editingUser._id}`, {
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
      const response = await fetch(`${API_BASE_URL}/admin/services/${serviceId}`, {
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
      // Client-side validation - use proper checks for numeric fields
      if (!editingService.name || !editingService.description || !editingService.category || 
          editingService.basePrice === undefined || editingService.basePrice === '' || 
          editingService.estimatedDuration === undefined || editingService.estimatedDuration === '') {
        setError('Please fill in all required fields: Name, Description, Category, Price, and Duration');
        return;
      }

      const subCategoryOptions = Object.keys(SERVICE_HIERARCHY[editingService.category] || {});
      if (subCategoryOptions.length > 0 && !editingService.subCategory) {
        setError('Please select a subcategory');
        return;
      }

      const subSubCategoryOptions = getHierarchyOptions(editingService.category, editingService.subCategory).subSubCategories;
      if (subSubCategoryOptions.length > 0 && !editingService.subSubCategory) {
        setError('Please select a sub-subcategory');
        return;
      }

      const serviceTypeOptions = getServiceTypeOptions(
        editingService.category,
        editingService.subCategory,
        editingService.subSubCategory
      );
      if (serviceTypeOptions.length > 0 && !editingService.serviceType) {
        setError('Please select a service type');
        return;
      }
      
      const token = localStorage.getItem('adminToken');
      const formData = new FormData();
      
      formData.append('name', editingService.name);
      formData.append('description', editingService.description);
      formData.append('category', editingService.category);
      formData.append('subCategory', editingService.subCategory || '');
      formData.append('subSubCategory', editingService.subSubCategory || '');
      formData.append('serviceType', editingService.serviceType || '');
      formData.append('basePrice', editingService.basePrice);
      formData.append('estimatedDuration', editingService.estimatedDuration);
      formData.append('isActive', editingService.isActive);
      formData.append('rating', editingService.rating);
      formData.append('reviewCount', editingService.reviewCount);
      
      // Add image file if selected, otherwise add the current image URL
      if (serviceImageFile) {
        formData.append('image', serviceImageFile);
      } else if (editingService.image) {
        formData.append('image', editingService.image);
      }

      const response = await fetch(`${API_BASE_URL}/admin/services/${editingService._id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (!response.ok) {
        throw new Error('Failed to update service');
      }

      const updatedService = await response.json();
      setServices(services.map(s => s._id === updatedService.service._id ? updatedService.service : s));
      setEditingService(null);
      setSelectedService(null);
      setServiceImageFile(null);
      setImagePreview(null);
      alert('Service updated successfully');
    } catch (err) {
      setError(err.message || 'Failed to update service');
    }
  };

  const handleCreateService = async () => {
    try {
      // Client-side validation - use proper checks for numeric fields
      if (!editingService.name || !editingService.description || !editingService.category || 
          editingService.basePrice === undefined || editingService.basePrice === '' || 
          editingService.estimatedDuration === undefined || editingService.estimatedDuration === '') {
        setError('Please fill in all required fields: Name, Description, Category, Price, and Duration');
        return;
      }

      const subCategoryOptions = Object.keys(SERVICE_HIERARCHY[editingService.category] || {});
      if (subCategoryOptions.length > 0 && !editingService.subCategory) {
        setError('Please select a subcategory');
        return;
      }

      const subSubCategoryOptions = getHierarchyOptions(editingService.category, editingService.subCategory).subSubCategories;
      if (subSubCategoryOptions.length > 0 && !editingService.subSubCategory) {
        setError('Please select a sub-subcategory');
        return;
      }

      const serviceTypeOptions = getServiceTypeOptions(
        editingService.category,
        editingService.subCategory,
        editingService.subSubCategory
      );
      if (serviceTypeOptions.length > 0 && !editingService.serviceType) {
        setError('Please select a service type');
        return;
      }
      
      const token = localStorage.getItem('adminToken');
      const formData = new FormData();
      
      formData.append('name', editingService.name);
      formData.append('description', editingService.description);
      formData.append('category', editingService.category);
      formData.append('subCategory', editingService.subCategory || '');
      formData.append('subSubCategory', editingService.subSubCategory || '');
      formData.append('serviceType', editingService.serviceType || '');
      formData.append('basePrice', editingService.basePrice);
      formData.append('estimatedDuration', editingService.estimatedDuration);
      
      // Log what's being sent
      console.log('Creating service with:', {
        name: editingService.name,
        description: editingService.description,
        category: editingService.category,
        subCategory: editingService.subCategory,
        subSubCategory: editingService.subSubCategory,
        serviceType: editingService.serviceType,
        basePrice: editingService.basePrice,
        estimatedDuration: editingService.estimatedDuration,
        hasImage: !!serviceImageFile
      });
      
      // Add image file if selected
      if (serviceImageFile) {
        formData.append('image', serviceImageFile);
      }

      const response = await fetch(`${API_BASE_URL}/admin/services`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Server error response:', errorData);
        throw new Error(errorData.message || 'Failed to create service');
      }

      const newService = await response.json();
      setServices([...services, newService.service]);
      setEditingService(null);
      setShowServiceForm(false);
      setServiceImageFile(null);
      setImagePreview(null);
      alert('Service created successfully');
    } catch (err) {
      console.error('Error in handleCreateService:', err);
      setError(err.message || 'Failed to create service');
    }
  };

  const handleServiceImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setServiceImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleToggleMostBooked = async (serviceId) => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`${API_BASE_URL}/admin/services/${serviceId}/most-booked`, {
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
      await fetch(`${API_BASE_URL}/admin/logout`, {
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

  const customerUsers = users.filter((user) => user.userType === 'customer');
  const professionalUsers = users.filter((user) => user.userType === 'professional');

  const filteredCustomers = customerUsers.filter((user) =>
    user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredProfessionals = professionalUsers.filter((user) =>
    user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const pendingProfessionalApplications = professionalApplications.filter(
    (application) => application.approvalStatus === 'pending'
  );
  const pendingApplicationsCount = pendingProfessionalApplications.length;

  const adminEmail = localStorage.getItem('adminEmail') || 'Administrator';
  const totalServices = services.length;
  const activeServices = services.filter((service) => service.isActive).length;
  const mostBookedServices = services.filter((service) => service.isMostBooked).length;
  const todayLabel = new Date().toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });

  const categorySplit = services.reduce((acc, service) => {
    const key = service.category || 'Other';
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});

  const categoryColors = ['#00a6fb', '#2a9d8f', '#ff9f1c', '#ef476f', '#7b2cbf', '#3d5a80'];
  const categoryEntries = Object.entries(categorySplit)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([category, count], index) => ({
      category,
      count,
      percent: totalServices > 0 ? Math.round((count / totalServices) * 100) : 0,
      color: categoryColors[index % categoryColors.length]
    }));

  let runningAngle = 0;
  const donutSegments = categoryEntries.map((item) => {
    const sweep = Math.round((item.count / Math.max(totalServices, 1)) * 360);
    const segment = `${item.color} ${runningAngle}deg ${runningAngle + sweep}deg`;
    runningAngle += sweep;
    return segment;
  });

  const donutStyle = {
    background: donutSegments.length > 0
      ? `conic-gradient(${donutSegments.join(', ')})`
      : 'conic-gradient(#dbe5f0 0deg 360deg)'
  };

  const getDateKey = (date) => new Date(date).toISOString().slice(0, 10);
  const weekDays = Array.from({ length: 7 }, (_, index) => {
    const day = new Date();
    day.setDate(day.getDate() - (6 - index));
    return {
      key: getDateKey(day),
      label: day.toLocaleDateString('en-US', { weekday: 'short' })
    };
  });

  const weeklyGrowthData = weekDays.map((day) => {
    const value = users.filter((user) => user.createdAt && getDateKey(user.createdAt) === day.key).length;
    return {
      label: day.label,
      value
    };
  });

  const weeklyMax = Math.max(...weeklyGrowthData.map((point) => point.value), 1);
  let latestVerification = statistics?.totalUsers
    ? Math.round(((statistics?.verifiedUsers || 0) / statistics.totalUsers) * 100)
    : 0;

  const verificationTrendData = weekDays.map((day) => {
    const dayUsers = users.filter((user) => user.createdAt && getDateKey(user.createdAt) === day.key);
    if (dayUsers.length === 0) {
      return { label: day.label, value: latestVerification };
    }

    const verifiedCount = dayUsers.filter((user) => user.isVerified).length;
    latestVerification = Math.round((verifiedCount / dayUsers.length) * 100);
    return { label: day.label, value: latestVerification };
  });

  const trendPoints = verificationTrendData
    .map((point, index) => {
      const x = verificationTrendData.length === 1 ? 50 : (index / (verificationTrendData.length - 1)) * 100;
      const y = 40 - (Math.min(100, Math.max(0, point.value)) / 100) * 35;
      return `${x},${y}`;
    })
    .join(' ');

  const sidebarItems = [
    { id: 'shop', icon: '🛍️', label: 'Shop', count: statistics?.totalUsers || 0 },
    { id: 'orders', icon: '📦', label: 'Booking', count: 0 },
    { id: 'customers', icon: '👥', label: 'Customers', count: customerUsers.length },
    { id: 'professionals', icon: '🧑‍🔧', label: 'Professionals', count: professionalUsers.length, pendingCount: pendingApplicationsCount },
    { id: 'catalog', icon: '🧾', label: 'Services', count: services.length },
    { id: 'analytics', icon: '📈', label: 'Analytics', count: 3 },
    { id: 'settings', icon: '⚙️', label: 'Settings', count: null }
  ];

  const renderCharts = () => (
    <section className="charts-grid">
      <article className="chart-card">
        <div className="chart-head">
          <h3>Weekly Growth</h3>
          <span>User registrations</span>
        </div>
        <div className="weekly-bars">
          {weeklyGrowthData.map((point) => (
            <div key={point.label} className="bar-item">
              <div className="bar-track">
                <div
                  className="bar-fill"
                  style={{ height: `${Math.max(8, Math.round((point.value / weeklyMax) * 100))}%` }}
                />
              </div>
              <span className="bar-value">{point.value}</span>
              <span className="bar-label">{point.label}</span>
            </div>
          ))}
        </div>
      </article>

      <article className="chart-card">
        <div className="chart-head">
          <h3>Service Category Split</h3>
          <span>Catalog composition</span>
        </div>
        <div className="donut-layout">
          <div className="donut-chart" style={donutStyle}>
            <span>{totalServices}</span>
            <small>Services</small>
          </div>
          <div className="donut-legend">
            {categoryEntries.length > 0 ? (
              categoryEntries.map((item) => (
                <div key={item.category} className="legend-item">
                  <span className="legend-swatch" style={{ background: item.color }} />
                  <span className="legend-text">{item.category}</span>
                  <span className="legend-value">{item.percent}%</span>
                </div>
              ))
            ) : (
              <p className="empty-chart">No category data yet.</p>
            )}
          </div>
        </div>
      </article>

      <article className="chart-card">
        <div className="chart-head">
          <h3>Verification Trend</h3>
          <span>7-day trust score</span>
        </div>
        <div className="line-chart-wrap">
          <svg viewBox="0 0 100 42" className="line-chart" preserveAspectRatio="none" aria-hidden="true">
            <polyline points="0,40 100,40" className="line-grid" />
            <polyline points={trendPoints} className="line-path" />
          </svg>
          <div className="line-chart-footer">
            {verificationTrendData.map((point) => (
              <div key={point.label} className="line-dot">
                <strong>{point.value}%</strong>
                <span>{point.label}</span>
              </div>
            ))}
          </div>
        </div>
      </article>
    </section>
  );

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  if (loading) {
    return (
      <div className="admin-dashboard-container">
        <div className="admin-loading">Loading...</div>
      </div>
    );
  }

  return (
    <div className={`admin-dashboard-container theme-${theme}`}>
      <div className="admin-workspace">
        <aside className="admin-sidebar">
          <div className="sidebar-brand">
            <span className="sidebar-logo">KL</span>
            <div>
              <p className="sidebar-title">KL Admin</p>
              <p className="sidebar-subtitle">Commerce Ops</p>
            </div>
          </div>
          <nav className="sidebar-nav" aria-label="Admin navigation">
            {sidebarItems.map((item) => (
              <button
                key={item.id}
                className={`sidebar-link ${activeTab === item.id ? 'active' : ''}`}
                onClick={() => setActiveTab(item.id)}
                type="button"
              >
                <span className="sidebar-icon" aria-hidden="true">{item.icon}</span>
                <span className="sidebar-link-text">{item.label}</span>
                {item.count !== null && <span className="sidebar-count">{item.count}</span>}
                {item.pendingCount > 0 && <span className="sidebar-pending-badge">{item.pendingCount}</span>}
              </button>
            ))}
          </nav>
          <div className="sidebar-footer">
            <button className="theme-toggle-btn" onClick={toggleTheme} type="button">
              {theme === 'dark' ? 'Switch to Light' : 'Switch to Dark'}
            </button>
            <button className="admin-logout-btn sidebar-logout" onClick={handleLogout}>
              Logout
            </button>
          </div>
        </aside>

        <div className="admin-main-panel">
          <div className="admin-header">
            <div className="admin-header-content">
              <div className="admin-header-copy">
                <p className="admin-kicker">Store Command Center</p>
                <h1>E-Commerce Admin Panel</h1>
                <p className="admin-subtitle">Manage customers, services, and platform health from one place.</p>
                <div className="admin-admin-meta">
                  <span>{adminEmail}</span>
                  <span>{todayLabel}</span>
                </div>
              </div>
              <button className="theme-toggle-btn header-theme-toggle" onClick={toggleTheme} type="button">
                {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
              </button>
            </div>
          </div>

          {pendingApplicationsCount > 0 && (
            <div className="admin-top-notification" role="status" aria-live="polite">
              <div>
                <strong>{pendingApplicationsCount} professional registration request{pendingApplicationsCount > 1 ? 's' : ''} pending</strong>
                <p>Review PAN/Aadhaar documents and approve or reject from Customer Management.</p>
              </div>
              <button
                type="button"
                className="admin-top-notification-btn"
                onClick={() => setActiveTab('customers')}
              >
                Review Now
              </button>
            </div>
          )}

          {error && <div className="admin-error">{error}</div>}

          <div className="admin-dashboard-content">
            {(activeTab === 'shop' || activeTab === 'analytics') && (
              <div className="admin-highlight-grid">
                <article className="highlight-card highlight-users">
                  <span className="highlight-title">Total Customers</span>
                  <span className="highlight-value">{statistics?.customers || 0}</span>
                  <span className="highlight-caption">Registered shopper accounts</span>
                </article>
                <article className="highlight-card highlight-services">
                  <span className="highlight-title">Active Services</span>
                  <span className="highlight-value">{activeServices}</span>
                  <span className="highlight-caption">Out of {totalServices} listed services</span>
                </article>
                <article className="highlight-card highlight-growth">
                  <span className="highlight-title">Verified Profiles</span>
                  <span className="highlight-value">{statistics?.verifiedUsers || 0}</span>
                  <span className="highlight-caption">KYC and trust-ready users</span>
                </article>
                <article className="highlight-card highlight-trending">
                  <span className="highlight-title">Trending Services</span>
                  <span className="highlight-value">{mostBookedServices}</span>
                  <span className="highlight-caption">Marked as most booked</span>
                </article>
              </div>
            )}

            {activeTab === 'shop' && statistics && (
              <>
                <div className="stats-container">
                  <h2>Business Overview</h2>
                  <div className="stats-grid">
                    <div className="stat-card">
                      <div className="stat-value stat-value-total">{statistics.totalUsers}</div>
                      <div className="stat-label">Total Users</div>
                      <div className="stat-meta">All registered accounts</div>
                    </div>
                    <div className="stat-card">
                      <div className="stat-value stat-value-customers">{statistics.customers}</div>
                      <div className="stat-label">Customers</div>
                      <div className="stat-meta">Active marketplace buyers</div>
                    </div>
                    <div className="stat-card">
                      <div className="stat-value stat-value-professionals">{statistics.professionals}</div>
                      <div className="stat-label">Professionals</div>
                      <div className="stat-meta">Sellers and service experts</div>
                    </div>
                    <div className="stat-card">
                      <div className="stat-value stat-value-verified">{statistics.verifiedUsers}</div>
                      <div className="stat-label">Verified Users</div>
                      <div className="stat-meta">Trusted platform members</div>
                    </div>
                  </div>
                </div>
                {renderCharts()}
              </>
            )}

            {activeTab === 'orders' && (
              <section className="users-section">
                <div className="users-header">
                  <h2>Orders</h2>
                </div>
                <div className="placeholder-panel">
                  <h3>Order Operations Dashboard</h3>
                  <p>Connect this panel to your order APIs to track new, packed, shipped, and delivered orders in real time.</p>
                  <div className="placeholder-metrics">
                    <article>
                      <strong>0</strong>
                      <span>New Orders</span>
                    </article>
                    <article>
                      <strong>0</strong>
                      <span>Pending Dispatch</span>
                    </article>
                    <article>
                      <strong>0</strong>
                      <span>Returns</span>
                    </article>
                  </div>
                </div>
              </section>
            )}

            {activeTab === 'customers' && (
          <div className="users-section">
            <div className="users-header">
              <h2>Customer Management</h2>
              <input
                type="text"
                placeholder="Search customer by name or email..."
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
                    {filteredCustomers.length > 0 ? (
                      filteredCustomers.map(user => (
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

        {activeTab === 'professionals' && (
          <div className="users-section">
            <div className="users-header">
              <h2>Professional Management</h2>
              <input
                type="text"
                placeholder="Search professional by name or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="search-input"
              />
            </div>

            <div className="professional-applications-panel">
              <h3>Professional Registration Requests</h3>
              {pendingProfessionalApplications.length === 0 ? (
                <p className="professional-applications-empty">No pending professional registrations.</p>
              ) : (
                <div className="users-table-container">
                  <table className="users-table">
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Category</th>
                        <th>Subcategory</th>
                        <th>PAN</th>
                        <th>PAN Image</th>
                        <th>Aadhaar</th>
                        <th>Aadhaar Image</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pendingProfessionalApplications.map((application) => (
                        <tr key={application._id}>
                          <td>{application.userId?.name || 'Unknown'}</td>
                          <td>{application.userId?.email || 'Unknown'}</td>
                          <td>{application.category || '-'}</td>
                          <td>{application.subCategory || '-'}</td>
                          <td>{application.panCardNumber || '-'}</td>
                          <td>
                            {application.panCardImageUrl ? (
                              <a
                                href={application.panCardImageUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="kyc-doc-link"
                              >
                                View Image
                              </a>
                            ) : (
                              '-'
                            )}
                          </td>
                          <td>{application.aadhaarCardNumber || '-'}</td>
                          <td>
                            {application.aadhaarCardImageUrl ? (
                              <a
                                href={application.aadhaarCardImageUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="kyc-doc-link"
                              >
                                View Image
                              </a>
                            ) : (
                              '-'
                            )}
                          </td>
                          <td>
                            <button
                              className="btn-view"
                              type="button"
                              disabled={applicationActionLoadingId === application._id}
                              onClick={() => handleReviewProfessional(application._id, 'approved')}
                            >
                              Approve
                            </button>
                            <button
                              className="btn-delete-small"
                              type="button"
                              disabled={applicationActionLoadingId === application._id}
                              onClick={() => handleReviewProfessional(application._id, 'rejected')}
                            >
                              Reject
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
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
                    <h3>Edit Professional</h3>
                    <div className="form-group">
                      <label>Name</label>
                      <input
                        type="text"
                        value={editingUser.name}
                        onChange={(e) => setEditingUser({ ...editingUser, name: e.target.value })}
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
                        onChange={(e) => setEditingUser({ ...editingUser, phone: e.target.value })}
                      />
                    </div>
                    <div className="form-group">
                      <label>City</label>
                      <input
                        type="text"
                        value={editingUser.city}
                        onChange={(e) => setEditingUser({ ...editingUser, city: e.target.value })}
                      />
                    </div>
                    <div className="form-group">
                      <label>Verified</label>
                      <input
                        type="checkbox"
                        checked={editingUser.isVerified}
                        onChange={(e) => setEditingUser({ ...editingUser, isVerified: e.target.checked })}
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
                      <button className="btn-edit" onClick={() => setEditingUser({ ...selectedUser })}>
                        Edit Professional
                      </button>
                      <button className="btn-delete" onClick={() => handleDeleteUser(selectedUser._id)}>
                        Delete Professional
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
                    {filteredProfessionals.length > 0 ? (
                      filteredProfessionals.map((user) => (
                        <tr key={user._id}>
                          <td>{user.name}</td>
                          <td>{user.email}</td>
                          <td><span className="badge">{user.userType}</span></td>
                          <td>{user.isVerified ? '✓' : '✗'}</td>
                          <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                          <td>
                            <button className="btn-view" onClick={() => setSelectedUser(user)}>
                              View
                            </button>
                            <button className="btn-delete-small" onClick={() => handleDeleteUser(user._id)}>
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="6" className="text-center">No professionals found</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {activeTab === 'catalog' && (
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
            handleServiceImageChange={handleServiceImageChange}
            imagePreview={imagePreview}
          />
        )}

            {activeTab === 'analytics' && (
              <section className="users-section">
                <div className="users-header">
                  <h2>Analytics</h2>
                </div>
                {renderCharts()}
              </section>
            )}

            {activeTab === 'settings' && (
              <section className="users-section">
                <div className="users-header">
                  <h2>Settings</h2>
                </div>
                <div className="settings-grid">
                  <article className="settings-card">
                    <h3>Appearance</h3>
                    <p>Choose how your admin panel looks during day and night operations.</p>
                    <button className="theme-toggle-btn settings-toggle" onClick={toggleTheme} type="button">
                      {theme === 'dark' ? 'Use Light Theme' : 'Use Dark Theme'}
                    </button>
                  </article>
                  <article className="settings-card">
                    <h3>Admin Session</h3>
                    <p>Signed in as <strong>{adminEmail}</strong>.</p>
                    <p>Use secure logout if you are done with dashboard management.</p>
                    <button className="btn-delete" onClick={handleLogout} type="button">Secure Logout</button>
                  </article>
                </div>
              </section>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;
