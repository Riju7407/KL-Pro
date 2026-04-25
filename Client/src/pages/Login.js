import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import API_BASE_URL from '../config/apiConfig';
import { SERVICE_HIERARCHY, getHierarchyOptions } from '../config/serviceHierarchy';
import './Login.css';

function Login() {
  const [searchParams] = useSearchParams();
  const initialMode = (searchParams.get('mode') || '').toLowerCase();
  const [isLogin, setIsLogin] = useState(initialMode !== 'signup');
  const [loginAs, setLoginAs] = useState('user');
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
    professionalSubSubCategory: '',
    professionalServiceType: '',
    profileImage: null,
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

  // Geolocation for city autofill
  const getCurrentCity = () => {
    return new Promise((resolve) => {
      if (!navigator.geolocation) {
        resolve('');
        return;
      }
      navigator.geolocation.getCurrentPosition(async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          const response = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`);
          const data = await response.json();
          const city = data.address.city || data.address.town || data.address.village || data.address.state_district || data.address.state || '';
          resolve(city);
        } catch (err) {
          resolve('');
        }
      }, () => {
        resolve('');
      });
    });
  };

  const toggleMode = () => setIsLogin(!isLogin);

  useEffect(() => {
    const mode = (searchParams.get('mode') || '').toLowerCase();
    setIsLogin(mode !== 'signup');
  }, [searchParams]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === 'userType' && value !== 'professional') {
      setFormData(prev => ({
        ...prev,
        [name]: value,
        professionalCategory: '',
        professionalSubCategory: '',
        professionalSubSubCategory: '',
        professionalServiceType: '',
        profileImage: null,
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
        professionalSubCategory: '',
        professionalSubSubCategory: '',
        professionalServiceType: '',
      }));
      return;
    }

    if (name === 'professionalSubCategory') {
      setFormData(prev => ({
        ...prev,
        professionalSubCategory: value,
        professionalSubSubCategory: '',
        professionalServiceType: '',
      }));
      return;
    }

    if (name === 'professionalSubSubCategory') {
      setFormData(prev => ({
        ...prev,
        professionalSubSubCategory: value,
        professionalServiceType: '',
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

      let currentCity = '';
      if (isLogin) {
        currentCity = await getCurrentCity();
        payload.currentCity = currentCity;
      }

      let response;
      let data;
      if (isLogin) {
        response = await fetch(`${API_BASE_URL}${endpoint}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(payload)
        });

        data = await response.json();

        if (!response.ok) {
          setError(data.message || 'Login failed');
          return;
        }
      } else {
        // Strict validation for customer required fields
        if (formData.userType !== 'professional') {
          if (!formData.name || !formData.email || !formData.password) {
            setError('Name, email, and password are required for customer registration.');
            setLoading(false);
            return;
          }
        }
        const registerData = new FormData();
        registerData.append('name', formData.name);
        registerData.append('email', formData.email);
        registerData.append('password', formData.password);
        registerData.append('phone', formData.phone);
        registerData.append('city', formData.city);
        registerData.append('userType', formData.userType);

        if (formData.userType === 'professional') {
          // Strict validation for all required fields
          if (!formData.professionalCategory || !formData.professionalSubCategory || !formData.panCardNumber || !formData.aadhaarCardNumber || !formData.panCardImage || !formData.aadhaarCardImage) {
            setError('All professional fields are required: Category, Subcategory, PAN number, Aadhaar number, PAN image, Aadhaar image.');
            setLoading(false);
            return;
          }
          registerData.append('professionalCategory', formData.professionalCategory);
          registerData.append('professionalSubCategory', formData.professionalSubCategory);
          registerData.append('professionalSubSubCategory', formData.professionalSubSubCategory);
          registerData.append('professionalServiceType', formData.professionalServiceType);
          registerData.append('currentCity', formData.city || '');
          if (formData.profileImage) {
            registerData.append('profileImage', formData.profileImage);
          }
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

        data = await response.json();

        if (!response.ok) {
          setError(data.message || 'Registration failed');
          return;
        }
      }

      if (!isLogin && data.requiresApproval) {
        // Registration for professional: show message and redirect to login
        setTimeout(() => {
          setIsLogin(true);
          setError('Registration submitted. Wait for admin approval before login. Redirecting to sign-in...');
        }, 100);
        setTimeout(() => {
          setError('');
          navigate('/login');
        }, 2500);
        return;
      }
      if (!isLogin && !data.requiresApproval) {
        // Registration for customer: redirect to login
        setTimeout(() => {
          setIsLogin(true);
          setError('Registration successful! Redirecting to sign-in...');
        }, 100);
        setTimeout(() => {
          setError('');
          navigate('/login');
        }, 2000);
        return;
      }

      if (isLogin) {
        // Login successful, navigate to home
        navigate('/');
      }
    } catch (error) {
      console.error('Error:', error);
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const professionalCategories = Object.keys(SERVICE_HIERARCHY);
  const hierarchyOptions = getHierarchyOptions(
    formData.professionalCategory,
    formData.professionalSubCategory,
    formData.professionalSubSubCategory
  );
  const professionalSubCategories = hierarchyOptions.subCategories;
  const professionalSubSubCategories = hierarchyOptions.subSubCategories;
  const professionalServiceTypes = hierarchyOptions.serviceTypes;

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <h1>{isLogin ? 'Login' : 'Create Account'}</h1>
          <p>{isLogin ? 'Welcome back!' : 'Join our community'}</p>
        </div>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit} className="login-form">
          {isLogin && (
            <div className="form-group">
              <label htmlFor="loginAs">Login As</label>
              <select
                id="loginAs"
                value={loginAs}
                onChange={(e) => setLoginAs(e.target.value)}
                disabled={loading}
              >
                <option value="user">User</option>
                <option value="professional">Professional</option>
                <option value="admin">Admin</option>
              </select>
            </div>
          )}

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
                    <label htmlFor="professionalSubSubCategory">Sub-Subcategory</label>
                    <select
                      id="professionalSubSubCategory"
                      name="professionalSubSubCategory"
                      value={formData.professionalSubSubCategory}
                      onChange={handleChange}
                      required={professionalSubSubCategories.length > 0}
                      disabled={loading || !formData.professionalSubCategory}
                    >
                      <option value="">Select sub-subcategory</option>
                      {professionalSubSubCategories.map((subSubCategory) => (
                        <option key={subSubCategory} value={subSubCategory}>
                          {subSubCategory}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label htmlFor="professionalServiceType">Next Subcategory</label>
                    <select
                      id="professionalServiceType"
                      name="professionalServiceType"
                      value={formData.professionalServiceType}
                      onChange={handleChange}
                      required={professionalServiceTypes.length > 0}
                      disabled={loading || !formData.professionalSubSubCategory || !professionalServiceTypes.length}
                    >
                      <option value="">Select next subcategory</option>
                      {professionalServiceTypes.map((serviceType) => (
                        <option key={serviceType} value={serviceType}>
                          {serviceType}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label htmlFor="profileImage">Professional Photo</label>
                    <input
                      type="file"
                      id="profileImage"
                      name="profileImage"
                      accept="image/*"
                      onChange={handleFileChange}
                      disabled={loading}
                    />
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
      </div>
    </div>
  );
}

export default Login;
