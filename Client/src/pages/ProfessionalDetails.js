import React, { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { professionalService, serviceService } from '../api/services';
import { getSocket } from '../api/socket';
import API_BASE_URL from '../config/apiConfig';
import './ProfessionalDetails.css';

const THUMBNAIL_PALETTES = [
  ['#1f7aa8', '#49b7cb'],
  ['#8356c8', '#b58bf2'],
  ['#0e8f68', '#67cd9f'],
  ['#b25522', '#f29f66'],
  ['#2b5fb8', '#7aa7f4'],
];

const SLOT_WINDOW_START = 9 * 60;
const SLOT_WINDOW_END = 21 * 60;
const SLOT_INTERVAL_MINUTES = 30;

const FALLBACK_PROFESSIONALS = [
  {
    id: 'p1',
    name: 'Priya Sharma',
    specialization: 'Hair Stylist',
    skills: ['Hair Stylist', 'Hair Spa', 'Keratin'],
    rating: 4.9,
    reviews: 234,
    location: 'Lucknow',
    experienceYears: 5,
    completedBookings: 520,
    startingPrice: 699,
    bio: 'Precision cuts, styling and bridal-ready finish for all hair types.',
  },
  {
    id: 'p2',
    name: 'Anjali Verma',
    specialization: 'Beauty Therapist',
    skills: ['Beauty Therapist', 'Waxing', 'Facials'],
    rating: 4.8,
    reviews: 167,
    location: 'Lucknow',
    experienceYears: 7,
    completedBookings: 710,
    startingPrice: 549,
    bio: 'Premium skincare rituals and event-ready beauty treatments at home.',
  },
  {
    id: 'p3',
    name: 'Neha Mishra',
    specialization: 'Spa Therapist',
    skills: ['Spa Therapist', 'Body Massage', 'Relaxation Therapy'],
    rating: 4.7,
    reviews: 145,
    location: 'Lucknow',
    experienceYears: 4,
    completedBookings: 430,
    startingPrice: 899,
    bio: 'Deep tissue and stress-relief massage sessions tailored to your needs.',
  },
  {
    id: 'p4',
    name: 'Ritika Singh',
    specialization: 'Makeup Artist',
    skills: ['Makeup Artist', 'Bridal Makeup', 'Party Makeup'],
    rating: 4.9,
    reviews: 189,
    location: 'Lucknow',
    experienceYears: 6,
    completedBookings: 610,
    startingPrice: 1499,
    bio: 'Camera-ready premium looks for bridal, festive and occasion makeup.',
  },
];

const getInitials = (name) =>
  String(name || 'Pro')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join('') || 'PR';

const getSpecializationMark = (specialization) => {
  const normalized = String(specialization || '').toLowerCase();
  if (normalized.includes('hair')) return 'HS';
  if (normalized.includes('beauty')) return 'BT';
  if (normalized.includes('spa')) return 'SP';
  if (normalized.includes('makeup')) return 'MU';
  if (normalized.includes('massage')) return 'MG';
  return 'PRO';
};

const createProfessionalThumbnail = (name, specialization, index = 0) => {
  const [startColor, endColor] = THUMBNAIL_PALETTES[index % THUMBNAIL_PALETTES.length];
  const initials = getInitials(name);
  const mark = getSpecializationMark(specialization);
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 360"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="${startColor}"/><stop offset="100%" stop-color="${endColor}"/></linearGradient></defs><rect width="640" height="360" fill="url(#g)"/><circle cx="120" cy="280" r="120" fill="rgba(255,255,255,0.14)"/><circle cx="540" cy="40" r="100" fill="rgba(255,255,255,0.12)"/><text x="40" y="58" fill="rgba(255,255,255,0.9)" font-size="28" font-family="Arial, sans-serif" font-weight="700">${mark}</text><text x="40" y="322" fill="#ffffff" font-size="78" font-family="Arial, sans-serif" font-weight="700">${initials}</text></svg>`;
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
};

const formatDateInput = (dateObj) => {
  const year = dateObj.getFullYear();
  const month = String(dateObj.getMonth() + 1).padStart(2, '0');
  const day = String(dateObj.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const makeTimeLabel = (minutes) => {
  const hours24 = Math.floor(minutes / 60);
  const minutesPart = String(minutes % 60).padStart(2, '0');
  const period = hours24 >= 12 ? 'PM' : 'AM';
  const hours12 = ((hours24 + 11) % 12) + 1;
  return `${hours12}:${minutesPart} ${period}`;
};

const makeDeterministicSeed = (value) => {
  const input = String(value || 'seed');
  let hash = 0;
  for (let i = 0; i < input.length; i += 1) {
    hash = (hash << 5) - hash + input.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
};

const formatRatingSummary = (ratingValue, reviewsCount) => {
  const safeRating = Number(ratingValue) || 0;
  const safeReviews = Number(reviewsCount) || 0;
  const reviewLabel = safeReviews === 1 ? 'review' : 'reviews';
  return `${safeRating.toFixed(1)} (${safeReviews.toLocaleString()} ${reviewLabel})`;
};

const buildAvailabilityText = (availability) => {
  if (!Array.isArray(availability) || !availability.length) {
    return 'Schedule available this week';
  }

  const today = new Date().toLocaleDateString('en-US', { weekday: 'short' });
  const todaySlots = availability.filter((slot) => slot?.day === today);
  if (todaySlots.length > 0) {
    return `${todaySlots.length} slots left today`;
  }

  return `Next slot: ${availability[0]?.day || 'Soon'}`;
};

const normalizeProfessional = (professional, servicePriceMap, index) => {
  const servicePrices = (professional?.services || [])
    .map((item) => {
      if (typeof item?.price === 'number' && item.price > 0) {
        return item.price;
      }
      return servicePriceMap.get(String(item?.serviceId)) || null;
    })
    .filter((price) => typeof price === 'number' && price > 0);

  const reviewsCount = Array.isArray(professional?.reviews)
    ? professional.reviews.length
    : professional?.completedBookings
      ? Math.max(8, Math.floor(professional.completedBookings / 4))
      : 0;

  const experienceYears = Number(professional?.experience) || 1;
  const rating = Number(professional?.rating) || 4.5;
  const name = professional?.userId?.name || `Professional ${index + 1}`;
  const skills = Array.isArray(professional?.specializations) && professional.specializations.length
    ? professional.specializations
    : ['Home Expert'];

  return {
    id: professional?._id || `fallback-${index}`,
    userId: professional?.userId?._id || '',
    name,
    specialization: skills[0],
    skills,
    rating,
    reviews: reviewsCount,
    availabilityText: buildAvailabilityText(professional?.availability),
    location: 'Lucknow',
    experienceYears,
    completedBookings: professional?.completedBookings || reviewsCount * 2,
    startingPrice: servicePrices.length ? Math.min(...servicePrices) : 499,
    bio: professional?.bio || 'Trusted professional delivering premium at-home service quality.',
    isOnline: Boolean(professional?.isOnline),
    thumbnail:
      professional?.userId?.profileImage ||
      createProfessionalThumbnail(name, skills[0], index),
  };
};

const buildLiveSlots = ({ professionalId, selectedDate, nowMs }) => {
  const slots = [];
  const todayString = formatDateInput(new Date(nowMs));
  const nowMinutes = new Date(nowMs).getHours() * 60 + new Date(nowMs).getMinutes();
  const seedRoot = makeDeterministicSeed(`${professionalId}-${selectedDate}`);
  const isToday = selectedDate === todayString;

  for (let minutes = SLOT_WINDOW_START; minutes <= SLOT_WINDOW_END; minutes += SLOT_INTERVAL_MINUTES) {
    const label = makeTimeLabel(minutes);
    const seed = makeDeterministicSeed(`${seedRoot}-${minutes}`);
    const dynamicDemand = seed % 5;
    const seatsLeft = Math.max(0, 4 - dynamicDemand);
    const unavailableBecausePast = isToday && minutes <= nowMinutes + 30;
    const isAvailable = seatsLeft > 0 && !unavailableBecausePast;

    slots.push({
      label,
      seatsLeft,
      isAvailable,
      reason: unavailableBecausePast ? 'Elapsed' : seatsLeft === 0 ? 'Booked out' : 'Available',
    });
  }

  return slots;
};

function ProfessionalDetails() {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams();

  const authToken = localStorage.getItem('userToken') || localStorage.getItem('token') || '';
  const isLoggedIn = Boolean(authToken);

  const [professional, setProfessional] = useState(location.state?.professional || null);
  const [loading, setLoading] = useState(!location.state?.professional);
  const [error, setError] = useState('');

  const [selectedDate, setSelectedDate] = useState(formatDateInput(new Date()));
  const [selectedSlot, setSelectedSlot] = useState('');
  const [slotNotice, setSlotNotice] = useState('');
  const [liveNow, setLiveNow] = useState(Date.now());

  const [userRating, setUserRating] = useState(0);
  const [ratingComment, setRatingComment] = useState('');
  const [ratingLoading, setRatingLoading] = useState(false);
  const [ratingMessage, setRatingMessage] = useState('');

  useEffect(() => {
    const timer = setInterval(() => {
      setLiveNow(Date.now());
    }, 30000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('userToken') || localStorage.getItem('token') || '';
    const socket = getSocket(token);

    const handlePresence = ({ userId, isOnline }) => {
      setProfessional((prev) => {
        if (!prev) return prev;
        const matches = String(prev.userId || prev.id) === String(userId);
        if (!matches) return prev;
        return {
          ...prev,
          isOnline: Boolean(isOnline),
        };
      });
    };

    socket.on('professional-presence-changed', handlePresence);

    return () => {
      socket.off('professional-presence-changed', handlePresence);
    };
  }, []);

  useEffect(() => {
    const fetchProfessional = async () => {
      if (professional) return;
      try {
        setLoading(true);
        setError('');

        const [professionalsResponse, servicesResponse] = await Promise.all([
          professionalService.getAll(),
          serviceService.getAll(),
        ]);

        const apiProfessionals = Array.isArray(professionalsResponse?.data)
          ? professionalsResponse.data
          : Array.isArray(professionalsResponse?.data?.professionals)
            ? professionalsResponse.data.professionals
            : [];

        const apiServices = Array.isArray(servicesResponse?.data)
          ? servicesResponse.data
          : Array.isArray(servicesResponse?.data?.services)
            ? servicesResponse.data.services
            : [];

        const servicePriceMap = new Map(
          apiServices.map((service) => [String(service?._id), Number(service?.basePrice) || 0])
        );

        const normalized = (apiProfessionals.length ? apiProfessionals : FALLBACK_PROFESSIONALS).map((item, index) =>
          normalizeProfessional(item, servicePriceMap, index)
        );

        const found = normalized.find((pro) => String(pro.id) === String(id));
        if (!found) {
          setError('Professional not found.');
          return;
        }

        setProfessional(found);
      } catch (fetchError) {
        console.error('Failed to load professional details:', fetchError);
        const foundFallback = FALLBACK_PROFESSIONALS.find((pro) => String(pro.id) === String(id));
        if (foundFallback) {
          setProfessional(foundFallback);
        } else {
          setError('Failed to load professional details.');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchProfessional();
  }, [id, professional]);

  const liveSlots = useMemo(() => {
    if (!professional) return [];
    return buildLiveSlots({
      professionalId: professional.id,
      selectedDate,
      nowMs: liveNow,
    });
  }, [professional, selectedDate, liveNow]);

  const handleContinueBooking = () => {
    if (!professional) return;

    if (!selectedSlot) {
      setSlotNotice('Choose an available slot before continuing.');
      return;
    }

    const bookingDraft = {
      professionalId: professional.id,
      professionalName: professional.name,
      scheduledDate: selectedDate,
      scheduledTime: selectedSlot,
      expectedPrice: professional.startingPrice,
    };

    localStorage.setItem('bookingDraft', JSON.stringify(bookingDraft));
    navigate('/bookings');
  };

  const handleSubmitRating = async () => {
    try {
      if (!professional) return;

      if (!isLoggedIn) {
        setRatingMessage('Please login to submit a rating.');
        return;
      }

      if (userRating < 1 || userRating > 5) {
        setRatingMessage('Choose a rating between 1 and 5 stars.');
        return;
      }

      setRatingLoading(true);
      setRatingMessage('');

      const response = await fetch(`${API_BASE_URL}/professionals/${professional.id}/rate`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          rating: userRating,
          comment: ratingComment,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to submit rating');
      }

      setProfessional((prev) =>
        prev
          ? {
              ...prev,
              rating: Number(data.rating) || prev.rating,
              reviews: Number(data.reviewsCount) || prev.reviews,
            }
          : prev
      );

      setUserRating(Number(data.userRating) || userRating);
      setRatingMessage(data.message || 'Rating submitted successfully.');
    } catch (submitError) {
      setRatingMessage(submitError.message || 'Failed to submit rating.');
    } finally {
      setRatingLoading(false);
    }
  };

  if (loading) {
    return <p className="professional-details-message">Loading professional details...</p>;
  }

  if (error || !professional) {
    return (
      <div className="professional-details-message error">
        <p>{error || 'Professional not found.'}</p>
        <button type="button" onClick={() => navigate('/professionals')}>
          Back to Professionals
        </button>
      </div>
    );
  }

  return (
    <div className="professional-details-page">
      <div className="details-top-actions">
        <button type="button" className="ghost" onClick={() => navigate('/professionals')}>
          Back
        </button>
      </div>

      <section className="details-hero">
        <img
          src={professional.thumbnail || createProfessionalThumbnail(professional.name, professional.specialization, 0)}
          alt={`${professional.name} preview`}
        />
        <div>
          <h1>{professional.name}</h1>
          <p>{professional.specialization}</p>
          <p className={`details-online ${professional.isOnline ? 'online' : 'offline'}`}>
            {professional.isOnline ? 'Online now' : 'Offline'}
          </p>
          <span>⭐ {formatRatingSummary(professional.rating, professional.reviews)}</span>
          <p className="details-bio">{professional.bio}</p>
        </div>
      </section>

      <section className="details-grid">
        <div>
          <small>Experience</small>
          <strong>{professional.experienceYears}+ years</strong>
        </div>
        <div>
          <small>Completed Jobs</small>
          <strong>{professional.completedBookings}+</strong>
        </div>
        <div>
          <small>Location</small>
          <strong>{professional.location}</strong>
        </div>
        <div>
          <small>Starting Price</small>
          <strong>INR {professional.startingPrice}</strong>
        </div>
      </section>

      <div className="skills-row details-skills">
        {(professional.skills || []).map((skill) => (
          <span key={`${professional.id}-details-${skill}`}>{skill}</span>
        ))}
      </div>

      <div className="details-panel rating-panel">
        <h3>Rate this Professional</h3>
        {!isLoggedIn ? (
          <div className="rating-login-note">
            <p>Login required to submit rating.</p>
            <button type="button" onClick={() => navigate('/login')}>Login</button>
          </div>
        ) : (
          <>
            {userRating > 0 && (
              <p className="user-rating-highlight">Your rating: {userRating}/5 - edit your previous rating below.</p>
            )}
            <div className="rating-stars-row">
              {[1, 2, 3, 4, 5].map((value) => (
                <button
                  key={`star-${value}`}
                  type="button"
                  className={`star-btn ${userRating >= value ? 'active' : ''}`}
                  onClick={() => setUserRating(value)}
                >
                  ★
                </button>
              ))}
            </div>
            <textarea
              rows="2"
              placeholder="Optional feedback"
              value={ratingComment}
              onChange={(event) => setRatingComment(event.target.value)}
            />
            <button
              type="button"
              className="submit-rating-btn"
              onClick={handleSubmitRating}
              disabled={ratingLoading}
            >
              {ratingLoading ? 'Submitting...' : 'Submit Rating'}
            </button>
          </>
        )}
        {ratingMessage && <p className="rating-message">{ratingMessage}</p>}
      </div>

      <div className="details-panel slot-picker">
        <div className="slot-picker-head">
          <h3>Select a slot</h3>
          <small>Live updated at {new Date(liveNow).toLocaleTimeString()}</small>
        </div>
        <div className="slot-date-row">
          <label htmlFor="appointmentDate">Date</label>
          <input
            id="appointmentDate"
            type="date"
            min={formatDateInput(new Date())}
            value={selectedDate}
            onChange={(event) => {
              setSelectedDate(event.target.value);
              setSelectedSlot('');
              setSlotNotice('');
            }}
          />
        </div>

        <div className="slot-grid">
          {liveSlots.map((slot) => (
            <button
              key={`${professional.id}-${selectedDate}-${slot.label}`}
              type="button"
              disabled={!slot.isAvailable}
              className={`slot-item ${selectedSlot === slot.label ? 'selected' : ''}`}
              onClick={() => {
                setSelectedSlot(slot.label);
                setSlotNotice('');
              }}
            >
              <span>{slot.label}</span>
              <small>{slot.isAvailable ? `${slot.seatsLeft} left` : slot.reason}</small>
            </button>
          ))}
        </div>
      </div>

      {slotNotice && <p className="slot-notice">{slotNotice}</p>}

      <div className="details-actions">
        <button type="button" className="primary" onClick={handleContinueBooking}>
          Continue to Booking
        </button>
      </div>
    </div>
  );
}

export default ProfessionalDetails;
