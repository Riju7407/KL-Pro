import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import API_BASE_URL from '../config/apiConfig';
import { SERVICE_HIERARCHY } from '../config/serviceHierarchy';
import './Login.css';

function Login() {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    city: '',
    userType: 'customer',
    professionalCategory: '',
    professionalSubCategory: '',
    panCardNumber: '',
    aadhaarCardNumber: '',
    panCardImage: null,
    aadhaarCardImage: null,
    experience: '',
    bio: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === 'userType' && value !== 'professional') {
      setFormData(prev => ({
        ...prev,
        [name]: value,
        professionalCategory: '',
        professionalSubCategory: '',
        panCardNumber: '',
        aadhaarCardNumber: '',
        panCardImage: null,
        aadhaarCardImage: null,
        experience: '',
        bio: ''
      }));
      return;
    }

    if (name === 'professionalCategory') {
      setFormData(prev => ({
        ...prev,
        professionalCategory: value,
        professionalSubCategory: ''
      }));
      return;
    }

    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e) => {
    const { name, files } = e.target;
    const selectedFile = files?.[0] || null;
    setFormData((prev) => ({
      ...prev,
      [name]: selectedFile,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (!isLogin && formData.password !== formData.confirmPassword) {
        setError('Password and confirm password must match');
        setLoading(false);
        return;
      }

      const endpoint = isLogin ? '/auth/login' : '/auth/register';
      const payload = isLogin 
        ? { email: formData.email, password: formData.password }
        : null;

      let response;
      if (isLogin) {
        response = await fetch(`${API_BASE_URL}${endpoint}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(payload)
        });
      } else {
        const registerData = new FormData();
        registerData.append('name', formData.name);
        registerData.append('email', formData.email);
        registerData.append('password', formData.password);
        registerData.append('phone', formData.phone);
        registerData.append('city', formData.city);
        registerData.append('userType', formData.userType);

        if (formData.userType === 'professional') {
          if (!formData.panCardImage || !formData.aadhaarCardImage) {
            setError('PAN and Aadhaar images are required for professional registration');
            setLoading(false);
            return;
          }

          registerData.append('professionalCategory', formData.professionalCategory);
          registerData.append('professionalSubCategory', formData.professionalSubCategory);
          registerData.append('panCardNumber', formData.panCardNumber);
          registerData.append('aadhaarCardNumber', formData.aadhaarCardNumber);
          registerData.append('panCardImage', formData.panCardImage);
          registerData.append('aadhaarCardImage', formData.aadhaarCardImage);
          registerData.append('experience', formData.experience || '0');
          registerData.append('bio', formData.bio);
        }

        response = await fetch(`${API_BASE_URL}${endpoint}`, {
          method: 'POST',
          body: registerData
        });
      }

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || (isLogin ? 'Login failed' : 'Registration failed'));
        setLoading(false);
        return;
      }

      if (!isLogin && data.requiresApproval) {
        setError('Registration submitted. Wait for admin approval before login.');
        setIsLogin(true);
        setLoading(false);
        return;
      }

      // Store token and user info if login succeeded
      if (data.token) {
        localStorage.setItem('userToken', data.token);
      }

      if (data.user) {
        localStorage.setItem('user', JSON.stringify({
          id: data.user.id,
          name: data.user.name,
          email: data.user.email,
          userType: data.user.userType,
          approvalStatus: data.user.approvalStatus
        }));
      }

      if (isLogin) {
        navigate('/');
      }
    } catch (err) {
      setError(err.message || 'Server error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setError('');
    setFormData({
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      phone: '',
      city: '',
      userType: 'customer',
      professionalCategory: '',
      professionalSubCategory: '',
      panCardNumber: '',
      aadhaarCardNumber: '',
      panCardImage: null,
      aadhaarCardImage: null,
      experience: '',
      bio: ''
    });
  };

  const professionalCategories = Object.keys(SERVICE_HIERARCHY);
  const professionalSubCategories = formData.professionalCategory
    ? Object.keys(SERVICE_HIERARCHY[formData.professionalCategory] || {})
    : [];

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <h1>{isLogin ? 'Login' : 'Create Account'}</h1>
          <p>{isLogin ? 'Welcome back!' : 'Join our community'}</p>
        </div>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit} className="login-form">
          {!isLogin && (
            <>
              <div className="form-group">
                <label htmlFor="name">Full Name</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter your full name"
                  required
                  disabled={loading}
                />
              </div>

              <div className="form-group">
                <label htmlFor="phone">Phone</label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="Enter your phone number"
                  disabled={loading}
                />
              </div>

              <div className="form-group">
                <label htmlFor="city">City</label>
                <input
                  type="text"
                  id="city"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  placeholder="Enter your city"
                  disabled={loading}
                />
              </div>

              <div className="form-group">
                <label htmlFor="userType">Account Type</label>
                <select
                  id="userType"
                  name="userType"
                  value={formData.userType}
                  onChange={handleChange}
                  disabled={loading}
                >
                  <option value="customer">Customer</option>
                  <option value="professional">Professional</option>
                </select>
              </div>

              {formData.userType === 'professional' && (
                <>
                  <div className="form-group">
                    <label htmlFor="professionalCategory">Professional Category</label>
                    <select
                      id="professionalCategory"
                      name="professionalCategory"
                      value={formData.professionalCategory}
                      onChange={handleChange}
                      required
                      disabled={loading}
                    >
                      <option value="">Select category</option>
                      {professionalCategories.map((category) => (
                        <option key={category} value={category}>
                          {category}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label htmlFor="professionalSubCategory">Professional Subcategory</label>
                    <select
                      id="professionalSubCategory"
                      name="professionalSubCategory"
                      value={formData.professionalSubCategory}
                      onChange={handleChange}
                      required
                      disabled={loading || !formData.professionalCategory}
                    >
                      <option value="">Select subcategory</option>
                      {professionalSubCategories.map((subCategory) => (
                        <option key={subCategory} value={subCategory}>
                          {subCategory}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label htmlFor="panCardNumber">PAN Card Number</label>
                    <input
                      type="text"
                      id="panCardNumber"
                      name="panCardNumber"
                      value={formData.panCardNumber}
                      onChange={handleChange}
                      placeholder="ABCDE1234F"
                      required
                      disabled={loading}
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="aadhaarCardNumber">Aadhaar Card Number</label>
                    <input
                      type="text"
                      id="aadhaarCardNumber"
                      name="aadhaarCardNumber"
                      value={formData.aadhaarCardNumber}
                      onChange={handleChange}
                      placeholder="12-digit Aadhaar number"
                      required
                      disabled={loading}
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="panCardImage">PAN Card Image</label>
                    <input
                      type="file"
                      id="panCardImage"
                      name="panCardImage"
                      accept="image/*"
                      onChange={handleFileChange}
                      required
                      disabled={loading}
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="aadhaarCardImage">Aadhaar Card Image</label>
                    <input
                      type="file"
                      id="aadhaarCardImage"
                      name="aadhaarCardImage"
                      accept="image/*"
                      onChange={handleFileChange}
                      required
                      disabled={loading}
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="experience">Experience (Years)</label>
                    <input
                      type="number"
                      id="experience"
                      name="experience"
                      min="0"
                      value={formData.experience}
                      onChange={handleChange}
                      placeholder="e.g. 3"
                      disabled={loading}
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="bio">Short Bio (Work You Know)</label>
                    <textarea
                      id="bio"
                      name="bio"
                      value={formData.bio}
                      onChange={handleChange}
                      placeholder="Example: Hair cutting, facial, cleanup, bridal makeup"
                      disabled={loading}
                      rows={3}
                    />
                  </div>
                </>
              )}
            </>
          )}

          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your email"
              required
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter your password"
              required
              disabled={loading}
            />
          </div>

          {!isLogin && (
            <div className="form-group">
              <label htmlFor="confirmPassword">Confirm Password</label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Re-enter your password"
                required
                disabled={loading}
              />
            </div>
          )}

          <button
            type="submit"
            className="login-btn"
            disabled={loading}
          >
            {loading ? (isLogin ? 'Logging in...' : 'Creating account...') : (isLogin ? 'Login' : 'Sign Up')}
          </button>
        </form>

        <div className="login-footer">
          <p>
            {isLogin ? "Don't have an account? " : 'Already have an account? '}
            <button 
              type="button"
              onClick={toggleMode}
              className="toggle-btn"
            >
              {isLogin ? 'Sign up' : 'Login'}
            </button>
          </p>
        </div>

        <div className="admin-link">
          <Link to="/admin/login" className="admin-login-link">Admin Login</Link>
        </div>
      </div>
    </div>
  );
}

export default Login;
