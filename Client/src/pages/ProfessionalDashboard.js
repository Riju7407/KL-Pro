import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API_BASE_URL from '../config/apiConfig';
import { SERVICE_HIERARCHY, getHierarchyOptions } from '../config/serviceHierarchy';
import { getSocket, disconnectSocket } from '../api/socket';
import './ProfessionalDashboard.css';

const formatCurrency = (amount) => `INR ${Number(amount || 0).toLocaleString('en-IN')}`;

function ProfessionalDashboard() {
  const navigate = useNavigate();
  const token = localStorage.getItem('userToken') || localStorage.getItem('token') || '';

  const [profile, setProfile] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [profileForm, setProfileForm] = useState({
    category: '',
    subCategory: '',
    subSubCategory: '',
    serviceType: '',
    bio: '',
    experience: '',
    availability: [],
    servicePricing: [],
  });
  const [profileImageFile, setProfileImageFile] = useState(null);
  const [profileImagePreview, setProfileImagePreview] = useState('');
  const [approvalStatus, setApprovalStatus] = useState('approved');
  const [activeFilter, setActiveFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [saveMessage, setSaveMessage] = useState('');
  const [updatingId, setUpdatingId] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [startOtpInputs, setStartOtpInputs] = useState({});
  const [startPhotoFiles, setStartPhotoFiles] = useState({});
  const [endPhotoFiles, setEndPhotoFiles] = useState({});
  const [completionOtpInputs, setCompletionOtpInputs] = useState({});

  const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  useEffect(() => {
    if (!token) return;
    getSocket(token);

    return () => {
      disconnectSocket();
    };
  }, [token]);

  useEffect(() => {
    const bootstrap = async () => {
      if (!token) {
        navigate('/login');
        return;
      }

      try {
        setLoading(true);
        setError('');

        const [profileResponse, jobsResponse, professionalResponse] = await Promise.all([
          fetch(`${API_BASE_URL}/users/profile`, {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          }),
          fetch(`${API_BASE_URL}/bookings/professional/my-jobs`, {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          }),
          fetch(`${API_BASE_URL}/professionals/me`, {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          }),
        ]);

        if (!profileResponse.ok) {
          if (profileResponse.status === 401) {
            localStorage.removeItem('userToken');
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            navigate('/login');
            return;
          }
          throw new Error('Failed to load profile');
        }

        const profileData = await profileResponse.json();
        if (profileData?.userType !== 'professional') {
          navigate('/profile');
          return;
        }

        setProfile(profileData);
        setProfileImagePreview(profileData?.profileImage || '');

        if (!jobsResponse.ok) {
          if (jobsResponse.status === 404) {
            setJobs([]);
            setApprovalStatus(profileData.approvalStatus || 'pending');
          } else {
            throw new Error('Failed to load work orders');
          }

        } else {
          const jobsData = await jobsResponse.json();
          setJobs(Array.isArray(jobsData?.bookings) ? jobsData.bookings : []);
          setApprovalStatus(jobsData?.approvalStatus || profileData.approvalStatus || 'approved');
        }

        if (professionalResponse.ok) {
          const professionalData = await professionalResponse.json();
          const specializations = Array.isArray(professionalData?.specializations)
            ? professionalData.specializations
            : [];

          const resolvedCategory =
            professionalData?.category ||
            specializations[0] ||
            '';

          const resolvedSubCategory =
            professionalData?.subCategory ||
            specializations[1] ||
            specializations[0] ||
            '';

          setProfileForm({
            category: resolvedCategory,
            subCategory: resolvedSubCategory,
            subSubCategory: professionalData?.subSubCategory || '',
            serviceType: professionalData?.serviceType || '',
            bio: professionalData?.bio || '',
            experience: String(professionalData?.experience ?? ''),
            availability: Array.isArray(professionalData?.availability)
              ? professionalData.availability
              : [],
            servicePricing: Array.isArray(professionalData?.services)
              ? professionalData.services.map((item) => ({
                  serviceName: item?.serviceName || '',
                  serviceId: item?.serviceId || '',
                  price: String(item?.price || ''),
                }))
              : [],
          });
          setApprovalStatus(professionalData?.approvalStatus || profileData.approvalStatus || 'approved');
          setProfileImagePreview(professionalData?.userId?.profileImage || profileData?.profileImage || '');
        } else if (professionalResponse.status !== 404) {
          setError('Unable to load existing professional profile details.');
        }
      } catch (fetchError) {
        setError(fetchError.message || 'Failed to load professional dashboard');
      } finally {
        setLoading(false);
      }
    };

    bootstrap();
  }, [navigate, token]);

  useEffect(() => {
    const playNotificationSound = () => {
      try {
        const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();
        oscillator.connect(gainNode);
        gainNode.connect(audioCtx.destination);
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(880, audioCtx.currentTime);
        gainNode.gain.setValueAtTime(0.05, audioCtx.currentTime);
        oscillator.start();
        oscillator.stop(audioCtx.currentTime + 0.2);
      } catch (soundError) {
        console.error('Notification sound failed:', soundError);
      }
    };

    const interval = setInterval(async () => {
      if (!token) return;
      try {
        const response = await fetch(`${API_BASE_URL}/bookings/professional/my-jobs`, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) return;
        const jobsData = await response.json();
        const incomingJobs = Array.isArray(jobsData?.bookings) ? jobsData.bookings : [];

        setJobs((prevJobs) => {
          const previousPendingIds = new Set(prevJobs.filter((job) => job.status === 'pending').map((job) => job._id));
          const newPending = incomingJobs.filter(
            (job) => job.status === 'pending' && !previousPendingIds.has(job._id)
          );

          if (newPending.length > 0) {
            playNotificationSound();
          }

          return incomingJobs;
        });
      } catch (pollError) {
        console.error('Polling jobs failed:', pollError);
      }
    }, 20000);

    return () => clearInterval(interval);
  }, [token]);

  const stats = useMemo(() => {
    const total = jobs.length;
    const pending = jobs.filter((job) => job.status === 'pending').length;
    const inProgress = jobs.filter((job) => ['confirmed', 'in-progress'].includes(job.status)).length;
    const completed = jobs.filter((job) => job.status === 'completed').length;
    const earnings = jobs
      .filter((job) => job.status === 'completed')
      .reduce((sum, job) => sum + (Number(job.price) || 0), 0);

    return { total, pending, inProgress, completed, earnings };
  }, [jobs]);

  const filteredJobs = useMemo(() => {
    if (activeFilter === 'all') return jobs;
    return jobs.filter((job) => job.status === activeFilter);
  }, [activeFilter, jobs]);

  const updateStatus = async (bookingId, status) => {
    try {
      setUpdatingId(bookingId);
      const response = await fetch(`${API_BASE_URL}/bookings/professional/${bookingId}/status`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to update booking status');
      }

      setJobs((prev) => prev.map((job) => (job._id === bookingId ? data : job)));
    } catch (updateError) {
      setError(updateError.message || 'Failed to update booking status');
    } finally {
      setUpdatingId('');
    }
  };

  const startWorkWithOtp = async (bookingId) => {
    try {
      const otpValue = String(startOtpInputs[bookingId] || '').trim();
      const photoFile = startPhotoFiles[bookingId];

      if (!otpValue) {
        setError('Start OTP is required to begin work.');
        return;
      }

      if (!photoFile) {
        setError('Please upload start work photo.');
        return;
      }

      setUpdatingId(bookingId);
      setError('');

      const payload = new FormData();
      payload.append('startOtp', otpValue);
      payload.append('startPhoto', photoFile);

      const response = await fetch(`${API_BASE_URL}/bookings/professional/${bookingId}/start`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: payload,
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Failed to verify start OTP');
      }

      setJobs((prev) => prev.map((job) => (job._id === bookingId ? data.booking : job)));
      setStartOtpInputs((prev) => ({ ...prev, [bookingId]: '' }));
      setStartPhotoFiles((prev) => ({ ...prev, [bookingId]: null }));
    } catch (startError) {
      setError(startError.message || 'Failed to start work');
    } finally {
      setUpdatingId('');
    }
  };

  const prepareCompletionOtp = async (bookingId) => {
    try {
      const photoFile = endPhotoFiles[bookingId];
      if (!photoFile) {
        setError('Please upload completion photo first.');
        return;
      }

      setUpdatingId(bookingId);
      setError('');

      const payload = new FormData();
      payload.append('endPhoto', photoFile);

      const response = await fetch(`${API_BASE_URL}/bookings/professional/${bookingId}/prepare-completion`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: payload,
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Failed to generate completion OTP');
      }

      setJobs((prev) => prev.map((job) => (job._id === bookingId ? data.booking : job)));
      setSaveMessage('Final OTP generated. Ask the customer to check it in their booking page.');
      setEndPhotoFiles((prev) => ({ ...prev, [bookingId]: null }));
    } catch (completeError) {
      setError(completeError.message || 'Failed to prepare completion OTP');
    } finally {
      setUpdatingId('');
    }
  };

  const completeWithOtp = async (bookingId) => {
    try {
      const completionOtp = String(completionOtpInputs[bookingId] || '').trim();
      if (!completionOtp) {
        setError('Please enter final OTP provided by customer.');
        return;
      }

      setUpdatingId(bookingId);
      setError('');

      const response = await fetch(`${API_BASE_URL}/bookings/professional/${bookingId}/complete`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ completionOtp }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Failed to complete booking');
      }

      setJobs((prev) => prev.map((job) => (job._id === bookingId ? data.booking : job)));
      setCompletionOtpInputs((prev) => ({ ...prev, [bookingId]: '' }));
      setSaveMessage('Booking completed successfully.');
    } catch (completeError) {
      setError(completeError.message || 'Failed to complete booking');
    } finally {
      setUpdatingId('');
    }
  };

  const handleProfileFieldChange = (event) => {
    const { name, value } = event.target;

    if (name === 'category') {
      setProfileForm((prev) => ({
        ...prev,
        category: value,
        subCategory: '',
        subSubCategory: '',
        serviceType: '',
      }));
      return;
    }

    if (name === 'subCategory') {
      setProfileForm((prev) => ({
        ...prev,
        subCategory: value,
        subSubCategory: '',
        serviceType: '',
      }));
      return;
    }

    if (name === 'subSubCategory') {
      setProfileForm((prev) => ({
        ...prev,
        subSubCategory: value,
        serviceType: '',
      }));
      return;
    }

    setProfileForm((prev) => ({ ...prev, [name]: value }));
  };

  const addServicePricingRow = () => {
    setProfileForm((prev) => ({
      ...prev,
      servicePricing: [...prev.servicePricing, { serviceName: '', serviceId: '', price: '' }],
    }));
  };

  const updateServicePricingRow = (index, field, value) => {
    setProfileForm((prev) => ({
      ...prev,
      servicePricing: prev.servicePricing.map((item, itemIndex) =>
        itemIndex === index ? { ...item, [field]: value } : item
      ),
    }));
  };

  const removeServicePricingRow = (index) => {
    setProfileForm((prev) => ({
      ...prev,
      servicePricing: prev.servicePricing.filter((_, itemIndex) => itemIndex !== index),
    }));
  };

  const addAvailabilitySlot = () => {
    setProfileForm((prev) => ({
      ...prev,
      availability: [
        ...prev.availability,
        { day: 'Mon', startTime: '09:00', endTime: '18:00' },
      ],
    }));
  };

  const updateAvailabilitySlot = (index, field, value) => {
    setProfileForm((prev) => ({
      ...prev,
      availability: prev.availability.map((slot, slotIndex) =>
        slotIndex === index ? { ...slot, [field]: value } : slot
      ),
    }));
  };

  const removeAvailabilitySlot = (index) => {
    setProfileForm((prev) => ({
      ...prev,
      availability: prev.availability.filter((_, slotIndex) => slotIndex !== index),
    }));
  };

  const saveProfessionalProfile = async () => {
    try {
      setSavingProfile(true);
      setError('');
      setSaveMessage('');

      const formData = new FormData();
      formData.append('category', profileForm.category);
      formData.append('subCategory', profileForm.subCategory);
      formData.append('subSubCategory', profileForm.subSubCategory || '');
      formData.append('serviceType', profileForm.serviceType || '');
      formData.append('bio', profileForm.bio);
      formData.append('experience', String(Number(profileForm.experience) || 0));
      formData.append('availability', JSON.stringify(profileForm.availability));
      formData.append(
        'services',
        JSON.stringify(
          profileForm.servicePricing
            .filter((item) => item?.serviceName && Number(item?.price) > 0)
            .map((item) => ({
              serviceName: item.serviceName,
              serviceId: item.serviceId || undefined,
              price: Number(item.price),
            }))
        )
      );

      if (profileImageFile) {
        formData.append('profileImage', profileImageFile);
      }

      const response = await fetch(`${API_BASE_URL}/professionals/me`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Failed to save professional profile');
      }

      setProfileForm({
        category: data?.category || '',
        subCategory: data?.subCategory || '',
        subSubCategory: data?.subSubCategory || '',
        serviceType: data?.serviceType || '',
        bio: data?.bio || '',
        experience: String(data?.experience ?? ''),
        availability: Array.isArray(data?.availability) ? data.availability : [],
        servicePricing: Array.isArray(data?.services)
          ? data.services.map((item) => ({
              serviceName: item?.serviceName || '',
              serviceId: item?.serviceId || '',
              price: String(item?.price || ''),
            }))
          : [],
      });
      const updatedImage = data?.userId?.profileImage || '';
      if (updatedImage) {
        setProfileImagePreview(updatedImage);
      }
      setProfile((prev) => ({
        ...(prev || {}),
        profileImage: updatedImage || prev?.profileImage || '',
      }));
      setProfileImageFile(null);
      setSaveMessage('Professional profile updated successfully.');
      setIsEditMode(false);
    } catch (saveError) {
      setError(saveError.message || 'Failed to save professional profile');
    } finally {
      setSavingProfile(false);
    }
  };

  if (loading) {
    return (
      <div className="professional-dashboard">
        <div className="professional-loading">Loading professional dashboard...</div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="professional-dashboard">
        <div className="professional-error">{error || 'Unable to load dashboard'}</div>
      </div>
    );
  }

  const categoryOptions = Object.keys(SERVICE_HIERARCHY);
  const hierarchyOptions = getHierarchyOptions(
    profileForm.category,
    profileForm.subCategory,
    profileForm.subSubCategory
  );

  return (
    <div className="professional-dashboard">
      <section className="pro-hero">
        <div>
          <p className="pro-kicker">Professional Workspace</p>
          <h1>Welcome, {profile.name}</h1>
          <p>Manage your service requests, update status, and track completed earnings.</p>
        </div>
        <div className={`pro-approval ${approvalStatus}`}>
          Status: {approvalStatus}
        </div>
      </section>

      {error && <div className="professional-error">{error}</div>}

      <section className="pro-stats-grid">
        <article><span>Total Jobs</span><strong>{stats.total}</strong></article>
        <article><span>Pending</span><strong>{stats.pending}</strong></article>
        <article><span>In Progress</span><strong>{stats.inProgress}</strong></article>
        <article><span>Completed</span><strong>{stats.completed}</strong></article>
        <article><span>Total Earnings</span><strong>{formatCurrency(stats.earnings)}</strong></article>
      </section>

      <section className="pro-profile-editor">
        <div className="pro-editor-header">
          <h2>Edit Professional Profile</h2>
          <p>Keep your public profile updated so customers can trust and book you faster.</p>
          {!isEditMode ? (
            <button type="button" className="pro-edit-btn" onClick={() => setIsEditMode(true)}>
              Edit
            </button>
          ) : null}
        </div>

        {saveMessage && <div className="professional-success">{saveMessage}</div>}

        {isEditMode ? (
          <>
            <div className="pro-editor-grid">
              <label className="pro-editor-full pro-image-field">
                Profile Image
                <input
                  type="file"
                  accept="image/*"
                  onChange={(event) => {
                    const file = event.target.files?.[0] || null;
                    setProfileImageFile(file);

                    if (file) {
                      const previewUrl = URL.createObjectURL(file);
                      setProfileImagePreview(previewUrl);
                    }
                  }}
                />
                {profileImagePreview && (
                  <img
                    src={profileImagePreview}
                    alt="Professional profile preview"
                    className="pro-image-preview"
                  />
                )}
              </label>

              <label>
                Category
                <select name="category" value={profileForm.category} onChange={handleProfileFieldChange}>
                  <option value="">Select category</option>
                  {categoryOptions.map((category) => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </label>

              <label>
                Sub Category
                <select
                  name="subCategory"
                  value={profileForm.subCategory}
                  onChange={handleProfileFieldChange}
                  disabled={!profileForm.category}
                >
                  <option value="">Select sub category</option>
                  {hierarchyOptions.subCategories.map((option) => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
              </label>

              <label>
                Sub-Subcategory
                <select
                  name="subSubCategory"
                  value={profileForm.subSubCategory}
                  onChange={handleProfileFieldChange}
                  disabled={!profileForm.subCategory}
                >
                  <option value="">Select sub-subcategory</option>
                  {hierarchyOptions.subSubCategories.map((option) => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
              </label>

              <label>
                Next Subcategory
                <select
                  name="serviceType"
                  value={profileForm.serviceType}
                  onChange={handleProfileFieldChange}
                  disabled={!profileForm.subSubCategory || !hierarchyOptions.serviceTypes.length}
                >
                  <option value="">Select next subcategory</option>
                  {hierarchyOptions.serviceTypes.map((option) => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
              </label>

              <label>
                Experience (Years)
                <input
                  type="number"
                  min="0"
                  name="experience"
                  value={profileForm.experience}
                  onChange={handleProfileFieldChange}
                  placeholder="Enter years of experience"
                />
              </label>

              <label className="pro-editor-full">
                Bio
                <textarea
                  name="bio"
                  rows="4"
                  value={profileForm.bio}
                  onChange={handleProfileFieldChange}
                  placeholder="Write a short intro about your skills and service quality"
                />
              </label>
            </div>

            <div className="availability-editor">
              <div className="availability-header">
                <h3>Availability Slots</h3>
                <button type="button" onClick={addAvailabilitySlot}>+ Add Slot</button>
              </div>

              {profileForm.availability.length === 0 ? (
                <p className="availability-empty">No slots added yet. Add your available days and times.</p>
              ) : (
                <div className="availability-list">
                  {profileForm.availability.map((slot, index) => (
                    <div key={`${slot.day}-${slot.startTime}-${index}`} className="availability-row">
                      <select
                        value={slot.day}
                        onChange={(e) => updateAvailabilitySlot(index, 'day', e.target.value)}
                      >
                        {weekDays.map((day) => (
                          <option key={day} value={day}>{day}</option>
                        ))}
                      </select>

                      <input
                        type="time"
                        value={slot.startTime}
                        onChange={(e) => updateAvailabilitySlot(index, 'startTime', e.target.value)}
                      />

                      <input
                        type="time"
                        value={slot.endTime}
                        onChange={(e) => updateAvailabilitySlot(index, 'endTime', e.target.value)}
                      />

                      <button type="button" onClick={() => removeAvailabilitySlot(index)}>
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="availability-editor">
              <div className="availability-header">
                <h3>Service Pricing</h3>
                <button type="button" onClick={addServicePricingRow}>+ Add Service Price</button>
              </div>

              {profileForm.servicePricing.length === 0 ? (
                <p className="availability-empty">No custom prices added yet.</p>
              ) : (
                <div className="service-pricing-list">
                  {profileForm.servicePricing.map((item, index) => (
                    <div key={`service-pricing-${index}`} className="service-pricing-row">
                      <input
                        type="text"
                        value={item.serviceName}
                        placeholder="Service name"
                        onChange={(e) => updateServicePricingRow(index, 'serviceName', e.target.value)}
                      />
                      <input
                        type="number"
                        min="1"
                        value={item.price}
                        placeholder="Price"
                        onChange={(e) => updateServicePricingRow(index, 'price', e.target.value)}
                      />
                      <button type="button" onClick={() => removeServicePricingRow(index)}>
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="pro-editor-actions">
              <button type="button" className="ghost" onClick={() => setIsEditMode(false)} disabled={savingProfile}>
                Cancel
              </button>
              <button type="button" onClick={saveProfessionalProfile} disabled={savingProfile}>
                {savingProfile ? 'Saving...' : 'Save Professional Profile'}
              </button>
            </div>
          </>
        ) : (
          <div className="pro-profile-summary">
            {profileImagePreview ? <img src={profileImagePreview} alt="Professional" className="pro-image-preview" /> : null}
            <p><strong>Category:</strong> {profileForm.category || 'Not set'}</p>
            <p><strong>Sub Category:</strong> {profileForm.subCategory || 'Not set'}</p>
            <p><strong>Sub-Subcategory:</strong> {profileForm.subSubCategory || 'Not set'}</p>
            <p><strong>Next Subcategory:</strong> {profileForm.serviceType || 'Not set'}</p>
            <p><strong>Experience:</strong> {profileForm.experience || '0'} years</p>
            <p><strong>Custom Service Prices:</strong> {profileForm.servicePricing.length}</p>
          </div>
        )}
      </section>

      <section className="pro-jobs-section">
        <div className="pro-jobs-header">
          <h2>Work Orders</h2>
          <select value={activeFilter} onChange={(e) => setActiveFilter(e.target.value)}>
            <option value="all">All</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="in-progress">In Progress</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>

        {filteredJobs.length === 0 ? (
          <div className="pro-empty-state">
            <p>No work orders found for the selected filter.</p>
            <button type="button" onClick={() => navigate('/services')}>Browse Services</button>
          </div>
        ) : (
          <div className="pro-job-list">
            {filteredJobs.map((job) => (
              <article key={job._id} className="pro-job-card">
                <div className="pro-job-top">
                  <h3>{job?.serviceId?.name || 'Service Request'}</h3>
                  <span className={`job-status ${job.status}`}>{job.status}</span>
                </div>

                <p><strong>Customer:</strong> {job?.customerId?.name || 'N/A'}</p>
                <p><strong>Date:</strong> {job?.scheduledDate ? new Date(job.scheduledDate).toLocaleDateString() : 'N/A'} at {job?.scheduledTime || 'N/A'}</p>
                <p><strong>Amount:</strong> {formatCurrency(job?.price)}</p>
                <p><strong>Location:</strong> {job?.serviceAddress?.city || profile.city || 'N/A'}</p>

                <div className="job-actions">
                  <button
                    type="button"
                    onClick={() => updateStatus(job._id, 'confirmed')}
                    disabled={updatingId === job._id || job.status !== 'pending'}
                  >
                    Approve
                  </button>
                  <button
                    type="button"
                    onClick={() => updateStatus(job._id, 'rejected')}
                    disabled={updatingId === job._id || job.status !== 'pending'}
                  >
                    Reject
                  </button>
                </div>

                {job.status === 'confirmed' && (
                  <div className="job-actions">
                    <input
                      type="text"
                      placeholder="Enter start OTP"
                      value={startOtpInputs[job._id] || ''}
                      onChange={(event) =>
                        setStartOtpInputs((prev) => ({
                          ...prev,
                          [job._id]: event.target.value,
                        }))
                      }
                    />
                    <input
                      type="file"
                      accept="image/*"
                      capture="environment"
                      onChange={(event) =>
                        setStartPhotoFiles((prev) => ({
                          ...prev,
                          [job._id]: event.target.files?.[0] || null,
                        }))
                      }
                    />
                    <button
                      type="button"
                      onClick={() => startWorkWithOtp(job._id)}
                      disabled={updatingId === job._id}
                    >
                      Start Work (OTP + Photo)
                    </button>
                  </div>
                )}

                {job.status === 'in-progress' && (
                  <div className="job-actions">
                    <input
                      type="file"
                      accept="image/*"
                      capture="environment"
                      onChange={(event) =>
                        setEndPhotoFiles((prev) => ({
                          ...prev,
                          [job._id]: event.target.files?.[0] || null,
                        }))
                      }
                    />
                    <button
                      type="button"
                      onClick={() => prepareCompletionOtp(job._id)}
                      disabled={updatingId === job._id}
                    >
                      Upload End Photo & Generate Final OTP
                    </button>

                    {job?.completionOtpIssuedAt ? (
                      <>
                        <input
                          type="text"
                          placeholder="Enter final OTP from user"
                          value={completionOtpInputs[job._id] || ''}
                          onChange={(event) =>
                            setCompletionOtpInputs((prev) => ({
                              ...prev,
                              [job._id]: event.target.value,
                            }))
                          }
                        />
                        <button
                          type="button"
                          onClick={() => completeWithOtp(job._id)}
                          disabled={updatingId === job._id}
                        >
                          Verify Final OTP & Complete
                        </button>
                      </>
                    ) : null}
                  </div>
                )}

                <div className="job-actions">
                  <button
                    type="button"
                    onClick={() => updateStatus(job._id, 'cancelled')}
                    disabled={updatingId === job._id || !['confirmed', 'in-progress'].includes(job.status)}
                  >
                    Cancel Job
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

export default ProfessionalDashboard;