import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API_BASE_URL from '../config/apiConfig';
import './Bookings.css';

const isObjectId = (value) => /^[a-fA-F0-9]{24}$/.test(String(value || ''));

const formatDateInput = (dateObj) => {
  const year = dateObj.getFullYear();
  const month = String(dateObj.getMonth() + 1).padStart(2, '0');
  const day = String(dateObj.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const createTimeOptions = () => {
  const slots = [];
  for (let minutes = 9 * 60; minutes <= 21 * 60; minutes += 30) {
    const hours24 = Math.floor(minutes / 60);
    const minutePart = String(minutes % 60).padStart(2, '0');
    const period = hours24 >= 12 ? 'PM' : 'AM';
    const hours12 = ((hours24 + 11) % 12) + 1;
    slots.push(`${hours12}:${minutePart} ${period}`);
  }
  return slots;
};

const getProfessionalName = (professionalIdField) => {
  if (!professionalIdField) return 'Professional';
  if (typeof professionalIdField === 'string') return 'Professional';
  const userObj = professionalIdField.userId;
  if (userObj && typeof userObj === 'object' && userObj.name) return userObj.name;
  return 'Professional';
};

function Bookings() {
  const navigate = useNavigate();
  const token = localStorage.getItem('userToken') || localStorage.getItem('token') || '';

  const [bookings, setBookings] = useState([]);
  const [professionals, setProfessionals] = useState([]);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [prefillNotice, setPrefillNotice] = useState('');

  const [formData, setFormData] = useState({
    professionalId: '',
    serviceId: '',
    scheduledDate: formatDateInput(new Date()),
    scheduledTime: '10:00 AM',
    price: '',
    notes: '',
    serviceAddress: {
      street: '',
      city: '',
      state: '',
      zipCode: '',
    },
  });

  const timeOptions = useMemo(() => createTimeOptions(), []);

  const selectedService = useMemo(
    () => services.find((service) => String(service._id) === String(formData.serviceId)),
    [services, formData.serviceId]
  );

  const draftData = useMemo(() => {
    try {
      const draft = localStorage.getItem('bookingDraft');
      return draft ? JSON.parse(draft) : null;
    } catch (parseError) {
      console.error('Invalid bookingDraft JSON:', parseError);
      return null;
    }
  }, []);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError('');

        const requestHeaders = token
          ? {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            }
          : {
              'Content-Type': 'application/json',
            };

        const requests = [
          fetch(`${API_BASE_URL}/professionals`, { headers: requestHeaders }),
          fetch(`${API_BASE_URL}/services`, { headers: requestHeaders }),
        ];

        if (token) {
          requests.push(fetch(`${API_BASE_URL}/bookings`, { headers: requestHeaders }));
          requests.push(fetch(`${API_BASE_URL}/users/profile`, { headers: requestHeaders }));
        }

        const [professionalsResponse, servicesResponse, bookingsResponse, profileResponse] = await Promise.all(requests);

        const professionalsData = professionalsResponse.ok ? await professionalsResponse.json() : [];
        const servicesData = servicesResponse.ok ? await servicesResponse.json() : [];

        setProfessionals(Array.isArray(professionalsData) ? professionalsData : professionalsData.professionals || []);
        setServices(Array.isArray(servicesData) ? servicesData : servicesData.services || []);

        if (token && bookingsResponse && bookingsResponse.ok) {
          const bookingsData = await bookingsResponse.json();
          setBookings(Array.isArray(bookingsData) ? bookingsData : []);
        }

        if (token && profileResponse && profileResponse.ok) {
          const profile = await profileResponse.json();
          setFormData((current) => ({
            ...current,
            serviceAddress: {
              street: profile.address || current.serviceAddress.street,
              city: profile.city || current.serviceAddress.city,
              state: current.serviceAddress.state,
              zipCode: current.serviceAddress.zipCode,
            },
          }));
        }
      } catch (loadError) {
        console.error('Failed to load booking page data:', loadError);
        setError('Failed to load booking details. Please refresh and try again.');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [token]);

  useEffect(() => {
    if (!draftData) return;

    setFormData((current) => {
      const professionalExists = professionals.some(
        (professional) => String(professional._id) === String(draftData.professionalId)
      );

      const nextProfessionalId = professionalExists ? String(draftData.professionalId) : current.professionalId;
      const nextDate = draftData.scheduledDate || current.scheduledDate;
      const nextTime = draftData.scheduledTime || current.scheduledTime;

      const matchedService = services.find((service) => {
        const haystack = `${service.name} ${service.category}`.toLowerCase();
        return haystack.includes((draftData.professionalName || '').toLowerCase());
      });

      const fallbackService = services[0];

      const nextServiceId = current.serviceId || matchedService?._id || fallbackService?._id || '';

      return {
        ...current,
        professionalId: nextProfessionalId,
        serviceId: String(nextServiceId),
        scheduledDate: nextDate,
        scheduledTime: nextTime,
        price: current.price || String(draftData.expectedPrice || ''),
      };
    });

    setPrefillNotice('Booking details were prefilled from your selected professional.');
  }, [draftData, professionals, services]);

  useEffect(() => {
    if (!selectedService) return;
    setFormData((current) => ({
      ...current,
      price: String(selectedService.basePrice || current.price || ''),
    }));
  }, [selectedService]);

  const refreshBookings = async () => {
    if (!token) return;

    try {
      const response = await fetch(`${API_BASE_URL}/bookings`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      if (response.ok) {
        const data = await response.json();
        setBookings(Array.isArray(data) ? data : []);
      }
    } catch (refreshError) {
      console.error('Failed to refresh bookings:', refreshError);
    }
  };

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setFormData((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const handleAddressChange = (event) => {
    const { name, value } = event.target;
    setFormData((current) => ({
      ...current,
      serviceAddress: {
        ...current.serviceAddress,
        [name]: value,
      },
    }));
  };

  const handleSubmitBooking = async (event) => {
    event.preventDefault();

    if (!token) {
      setError('Please login to confirm your booking.');
      navigate('/login');
      return;
    }

    if (!isObjectId(formData.professionalId)) {
      setError('Please select a valid professional to proceed.');
      return;
    }

    if (!isObjectId(formData.serviceId)) {
      setError('Please select a valid service to proceed.');
      return;
    }

    if (!formData.scheduledDate || !formData.scheduledTime) {
      setError('Please select date and time for your appointment.');
      return;
    }

    const parsedPrice = Number(formData.price);
    if (!parsedPrice || parsedPrice <= 0) {
      setError('Please provide a valid booking amount.');
      return;
    }

    try {
      setSubmitting(true);
      setError('');
      setSuccessMessage('');

      const payload = {
        professionalId: formData.professionalId,
        serviceId: formData.serviceId,
        scheduledDate: formData.scheduledDate,
        scheduledTime: formData.scheduledTime,
        serviceAddress: formData.serviceAddress,
        price: parsedPrice,
        notes: formData.notes,
      };

      const response = await fetch(`${API_BASE_URL}/bookings`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorPayload = await response.json().catch(() => null);
        throw new Error(errorPayload?.message || 'Failed to create booking');
      }

      localStorage.removeItem('bookingDraft');
      setSuccessMessage('Booking confirmed successfully. You can track it below.');
      setPrefillNotice('');

      setFormData((current) => ({
        ...current,
        notes: '',
      }));

      await refreshBookings();
    } catch (submitError) {
      console.error('Booking submit error:', submitError);
      setError(submitError.message || 'Failed to confirm booking');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancelBooking = async (bookingId) => {
    if (!token) {
      setError('Please login to cancel a booking.');
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/bookings/${bookingId}/cancel`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorPayload = await response.json().catch(() => null);
        throw new Error(errorPayload?.message || 'Failed to cancel booking');
      }

      setSuccessMessage('Booking cancelled successfully.');
      await refreshBookings();
    } catch (cancelError) {
      console.error('Booking cancel error:', cancelError);
      setError(cancelError.message || 'Failed to cancel booking');
    }
  };

  const handleRebook = (booking) => {
    setFormData((current) => ({
      ...current,
      professionalId: String(booking?.professionalId?._id || booking?.professionalId || ''),
      serviceId: String(booking?.serviceId?._id || booking?.serviceId || ''),
      scheduledDate: formatDateInput(new Date()),
      scheduledTime: booking?.scheduledTime || current.scheduledTime,
      price: String(booking?.price || current.price || ''),
      notes: '',
    }));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="bookings">
      <h1>Bookings</h1>

      {!token && (
        <div className="auth-reminder">
          <p>Login is required to create and manage bookings.</p>
          <button type="button" onClick={() => navigate('/login')}>Go to Login</button>
        </div>
      )}

      {prefillNotice && <div className="alert info">{prefillNotice}</div>}
      {error && <div className="alert error">{error}</div>}
      {successMessage && <div className="alert success">{successMessage}</div>}

      <section className="booking-form-section">
        <h2>Confirm Appointment</h2>

        <form className="booking-form" onSubmit={handleSubmitBooking}>
          <div className="form-grid">
            <label>
              Professional
              <select
                name="professionalId"
                value={formData.professionalId}
                onChange={handleInputChange}
                required
              >
                <option value="">Select professional</option>
                {professionals.map((professional) => (
                  <option key={professional._id} value={professional._id}>
                    {professional?.userId?.name || 'Professional'}
                  </option>
                ))}
              </select>
            </label>

            <label>
              Service
              <select
                name="serviceId"
                value={formData.serviceId}
                onChange={handleInputChange}
                required
              >
                <option value="">Select service</option>
                {services.map((service) => (
                  <option key={service._id} value={service._id}>
                    {service.name} - INR {service.basePrice}
                  </option>
                ))}
              </select>
            </label>

            <label>
              Date
              <input
                type="date"
                name="scheduledDate"
                min={formatDateInput(new Date())}
                value={formData.scheduledDate}
                onChange={handleInputChange}
                required
              />
            </label>

            <label>
              Time
              <select
                name="scheduledTime"
                value={formData.scheduledTime}
                onChange={handleInputChange}
                required
              >
                {timeOptions.map((timeSlot) => (
                  <option key={timeSlot} value={timeSlot}>{timeSlot}</option>
                ))}
                {!timeOptions.includes(formData.scheduledTime) && formData.scheduledTime && (
                  <option value={formData.scheduledTime}>{formData.scheduledTime}</option>
                )}
              </select>
            </label>

            <label>
              Amount (INR)
              <input
                type="number"
                name="price"
                min="1"
                value={formData.price}
                onChange={handleInputChange}
                required
              />
            </label>

            <label className="full-width">
              Notes (optional)
              <textarea
                name="notes"
                rows="3"
                value={formData.notes}
                onChange={handleInputChange}
                placeholder="Any instructions for the professional"
              />
            </label>

            <label>
              Street Address
              <input
                type="text"
                name="street"
                value={formData.serviceAddress.street}
                onChange={handleAddressChange}
                required
              />
            </label>

            <label>
              City
              <input
                type="text"
                name="city"
                value={formData.serviceAddress.city}
                onChange={handleAddressChange}
                required
              />
            </label>

            <label>
              State
              <input
                type="text"
                name="state"
                value={formData.serviceAddress.state}
                onChange={handleAddressChange}
              />
            </label>

            <label>
              ZIP Code
              <input
                type="text"
                name="zipCode"
                value={formData.serviceAddress.zipCode}
                onChange={handleAddressChange}
              />
            </label>
          </div>

          <div className="form-actions">
            <button type="button" className="btn-secondary" onClick={() => navigate('/professionals')}>
              Change Professional
            </button>
            <button type="submit" className="btn-primary" disabled={submitting || loading}>
              {submitting ? 'Confirming...' : 'Confirm Booking'}
            </button>
          </div>
        </form>
      </section>

      <section className="booking-history-section">
        <div className="history-header">
          <h2>My Booking History</h2>
          <button type="button" onClick={refreshBookings}>Refresh</button>
        </div>

        {loading ? (
          <div className="no-bookings">
            <p>Loading bookings...</p>
          </div>
        ) : bookings.length === 0 ? (
          <div className="no-bookings">
            <p>No bookings yet. Confirm your first appointment above.</p>
            <button type="button" onClick={() => navigate('/services')}>Browse Services</button>
          </div>
        ) : (
          <div className="bookings-list">
            {bookings.map((booking) => (
              <div key={booking._id || booking.id} className="booking-card">
                <div className="booking-info">
                  <h3>{booking?.serviceId?.name || 'Service'}</h3>
                  <p><strong>Professional:</strong> {getProfessionalName(booking.professionalId)}</p>
                  <p>
                    <strong>Date & Time:</strong>{' '}
                    {booking.scheduledDate ? new Date(booking.scheduledDate).toLocaleDateString() : '-'} at {booking.scheduledTime || '-'}
                  </p>
                  <p><strong>Amount:</strong> INR {booking.price}</p>
                </div>
                <div className="booking-status">
                  <span className={`status-badge ${booking.status}`}>
                    {String(booking.status || 'pending').replace('-', ' ')}
                  </span>
                  <div className="booking-actions">
                    <button type="button" className="btn-reschedule" onClick={() => handleRebook(booking)}>
                      Rebook
                    </button>
                    <button
                      type="button"
                      className="btn-cancel"
                      onClick={() => handleCancelBooking(booking._id)}
                      disabled={booking.status === 'cancelled'}
                    >
                      {booking.status === 'cancelled' ? 'Cancelled' : 'Cancel'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

export default Bookings;
