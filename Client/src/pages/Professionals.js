import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { professionalService, serviceService } from '../api/services';
import API_BASE_URL from '../config/apiConfig';
import './Professionals.css';

const FALLBACK_PROFESSIONALS = [
  {
    id: 'p1',
    name: 'Priya Sharma',
    specialization: 'Hair Stylist',
    skills: ['Hair Stylist', 'Hair Spa', 'Keratin'],
    rating: 4.9,
    reviews: 234,
    availabilityText: '3 slots left today',
    location: 'Lucknow',
    experienceYears: 5,
    completedBookings: 520,
    startingPrice: 699,
    responseTime: 'Responds in 12 mins',
    badge: 'Top Rated',
    bio: 'Precision cuts, styling and bridal-ready finish for all hair types.',
    serviceTags: ['hair', 'stylist', 'spa', 'keratin'],
  },
  {
    id: 'p2',
    name: 'Anjali Verma',
    specialization: 'Beauty Therapist',
    skills: ['Beauty Therapist', 'Waxing', 'Facials'],
    rating: 4.8,
    reviews: 167,
    availabilityText: 'Available tomorrow',
    location: 'Lucknow',
    experienceYears: 7,
    completedBookings: 710,
    startingPrice: 549,
    responseTime: 'Responds in 20 mins',
    badge: 'Most Booked',
    bio: 'Premium skincare rituals and event-ready beauty treatments at home.',
    serviceTags: ['facial', 'beauty', 'waxing'],
  },
  {
    id: 'p3',
    name: 'Neha Mishra',
    specialization: 'Spa Therapist',
    skills: ['Spa Therapist', 'Body Massage', 'Relaxation Therapy'],
    rating: 4.7,
    reviews: 145,
    availabilityText: '2 slots left today',
    location: 'Lucknow',
    experienceYears: 4,
    completedBookings: 430,
    startingPrice: 899,
    responseTime: 'Responds in 15 mins',
    badge: 'Premium',
    bio: 'Deep tissue and stress-relief massage sessions tailored to your needs.',
    serviceTags: ['spa', 'massage', 'therapy'],
  },
  {
    id: 'p4',
    name: 'Ritika Singh',
    specialization: 'Makeup Artist',
    skills: ['Makeup Artist', 'Bridal Makeup', 'Party Makeup'],
    rating: 4.9,
    reviews: 189,
    availabilityText: 'Available in 2 days',
    location: 'Lucknow',
    experienceYears: 6,
    completedBookings: 610,
    startingPrice: 1499,
    responseTime: 'Responds in 10 mins',
    badge: 'Bridal Expert',
    bio: 'Camera-ready premium looks for bridal, festive and occasion makeup.',
    serviceTags: ['makeup', 'bridal', 'party'],
  },
];

const priceRanges = {
  all: [0, Number.POSITIVE_INFINITY],
  budget: [0, 700],
  standard: [701, 1200],
  premium: [1201, Number.POSITIVE_INFINITY],
};

const SAVED_PRO_IDS_KEY = 'savedProfessionalIds';
const SAVED_PRO_DETAILS_KEY = 'savedProfessionals';

const SLOT_WINDOW_START = 9 * 60;
const SLOT_WINDOW_END = 21 * 60;
const SLOT_INTERVAL_MINUTES = 30;

const formatDateInput = (dateObj) => {
  const year = dateObj.getFullYear();
  const month = String(dateObj.getMonth() + 1).padStart(2, '0');
  const day = String(dateObj.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const toTitleCase = (value) =>
  value
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

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

const getProfessionalId = (bookingProfessional) => {
  if (!bookingProfessional) return null;
  if (typeof bookingProfessional === 'string') return bookingProfessional;
  return bookingProfessional?._id || null;
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

const getKeywordTokens = (bookings) => {
  const stopWords = new Set(['and', 'for', 'with', 'the', 'to', 'at', 'home', 'service']);
  const words = bookings
    .map((booking) => booking?.serviceId?.name || '')
    .join(' ')
    .toLowerCase()
    .replace(/[^a-z0-9 ]/g, ' ')
    .split(' ')
    .map((word) => word.trim())
    .filter((word) => word.length >= 3 && !stopWords.has(word));
  return new Set(words);
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

  const serviceTags = skills
    .join(' ')
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter(Boolean);

  return {
    id: professional?._id || `fallback-${index}`,
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
    responseTime: `Responds in ${10 + (index % 3) * 5} mins`,
    badge: rating >= 4.8 ? 'Top Rated' : experienceYears >= 6 ? 'Senior Pro' : 'Verified',
    bio: professional?.bio || 'Trusted professional delivering premium at-home service quality.',
    serviceTags,
  };
};

function Professionals() {
  const navigate = useNavigate();
  const [professionals, setProfessionals] = useState(FALLBACK_PROFESSIONALS);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSpecialization, setSelectedSpecialization] = useState('all');
  const [sortBy, setSortBy] = useState('recommended');
  const [selectedPriceRange, setSelectedPriceRange] = useState('all');
  const [minRating, setMinRating] = useState('all');
  const [savedIds, setSavedIds] = useState(() => {
    try {
      const storedIds = JSON.parse(localStorage.getItem(SAVED_PRO_IDS_KEY) || '[]');
      return Array.isArray(storedIds) ? storedIds : [];
    } catch (parseError) {
      return [];
    }
  });
  const [activeProfessional, setActiveProfessional] = useState(null);
  const [bookingHistory, setBookingHistory] = useState([]);
  const [compareIds, setCompareIds] = useState([]);
  const [isCompareOpen, setIsCompareOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(formatDateInput(new Date()));
  const [selectedSlot, setSelectedSlot] = useState('');
  const [slotNotice, setSlotNotice] = useState('');
  const [liveNow, setLiveNow] = useState(Date.now());

  useEffect(() => {
    const fetchProfessionals = async () => {
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

        if (!apiProfessionals.length) {
          setProfessionals(FALLBACK_PROFESSIONALS);
          return;
        }

        setProfessionals(apiProfessionals.map((item, index) => normalizeProfessional(item, servicePriceMap, index)));
      } catch (fetchError) {
        console.error('Failed to fetch professionals:', fetchError);
        setError('Showing curated experts while we reconnect to live inventory.');
        setProfessionals(FALLBACK_PROFESSIONALS);
      } finally {
        setLoading(false);
      }
    };

    fetchProfessionals();
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setLiveNow(Date.now());
    }, 30000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const fetchBookingHistory = async () => {
      const token = localStorage.getItem('userToken') || localStorage.getItem('token');
      if (!token) {
        setBookingHistory([]);
        return;
      }

      try {
        const response = await fetch(`${API_BASE_URL}/bookings`, {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          setBookingHistory([]);
          return;
        }

        const bookings = await response.json();
        setBookingHistory(Array.isArray(bookings) ? bookings : []);
      } catch (historyError) {
        console.error('Failed to fetch booking history:', historyError);
        setBookingHistory([]);
      }
    };

    fetchBookingHistory();
  }, []);

  useEffect(() => {
    if (!activeProfessional) return;
    setSelectedDate(formatDateInput(new Date()));
    setSelectedSlot('');
    setSlotNotice('');
  }, [activeProfessional]);

  const specializationOptions = useMemo(() => {
    const allSpecializations = professionals
      .flatMap((professional) => professional.skills || [professional.specialization])
      .filter(Boolean);
    return ['all', ...new Set(allSpecializations)];
  }, [professionals]);

  const featuredStats = useMemo(() => {
    const avgRating = professionals.length
      ? (professionals.reduce((sum, professional) => sum + professional.rating, 0) / professionals.length).toFixed(1)
      : '0.0';

    return {
      totalPros: professionals.length,
      avgRating,
      totalBookings: professionals.reduce((sum, professional) => sum + professional.completedBookings, 0),
    };
  }, [professionals]);

  const personalizationContext = useMemo(() => {
    if (!bookingHistory.length) {
      return {
        keywordTokens: new Set(),
        avgPrice: 0,
        bookedProfessionalIds: new Set(),
      };
    }

    const prices = bookingHistory
      .map((booking) => Number(booking?.price) || 0)
      .filter((price) => price > 0);

    const bookedProfessionalIds = new Set(
      bookingHistory
        .map((booking) => getProfessionalId(booking?.professionalId))
        .filter(Boolean)
        .map(String)
    );

    return {
      keywordTokens: getKeywordTokens(bookingHistory),
      avgPrice: prices.length ? prices.reduce((sum, value) => sum + value, 0) / prices.length : 0,
      bookedProfessionalIds,
    };
  }, [bookingHistory]);

  const filteredProfessionals = useMemo(() => {
    const [minPrice, maxPrice] = priceRanges[selectedPriceRange] || priceRanges.all;
    const normalizedRating = minRating === 'all' ? 0 : Number(minRating);

    const filtered = professionals.filter((professional) => {
      const searchValue = searchTerm.trim().toLowerCase();
      const textMatch =
        !searchValue ||
        professional.name.toLowerCase().includes(searchValue) ||
        professional.specialization.toLowerCase().includes(searchValue) ||
        (professional.skills || []).some((skill) => skill.toLowerCase().includes(searchValue));

      const specializationMatch =
        selectedSpecialization === 'all' ||
        (professional.skills || []).includes(selectedSpecialization) ||
        professional.specialization === selectedSpecialization;

      const priceMatch = professional.startingPrice >= minPrice && professional.startingPrice <= maxPrice;
      const ratingMatch = professional.rating >= normalizedRating;

      return textMatch && specializationMatch && priceMatch && ratingMatch;
    });

    const withPersonalization = filtered.map((professional) => {
      const keywordMatchCount = professional.serviceTags.filter((tag) => personalizationContext.keywordTokens.has(tag)).length;
      const bookedBeforeBoost = personalizationContext.bookedProfessionalIds.has(String(professional.id)) ? 3 : 0;
      const priceAffinity = personalizationContext.avgPrice
        ? Math.max(0, 1 - Math.abs(professional.startingPrice - personalizationContext.avgPrice) / 1200)
        : 0;
      const recommendationScore = keywordMatchCount * 1.8 + bookedBeforeBoost + priceAffinity + professional.rating * 0.25;

      return {
        ...professional,
        recommendationScore,
      };
    });

    return withPersonalization.sort((a, b) => {
      if (sortBy === 'rating') return b.rating - a.rating;
      if (sortBy === 'priceLowToHigh') return a.startingPrice - b.startingPrice;
      if (sortBy === 'priceHighToLow') return b.startingPrice - a.startingPrice;
      if (sortBy === 'experience') return b.experienceYears - a.experienceYears;

      const aScore = a.recommendationScore + a.rating * 20 + a.completedBookings * 0.03 + (5 - a.startingPrice / 1000);
      const bScore = b.recommendationScore + b.rating * 20 + b.completedBookings * 0.03 + (5 - b.startingPrice / 1000);
      return bScore - aScore;
    });
  }, [professionals, searchTerm, selectedSpecialization, selectedPriceRange, minRating, sortBy, personalizationContext]);

  const recommendedProfessionals = useMemo(() => {
    if (!bookingHistory.length) return [];
    return [...filteredProfessionals]
      .sort((a, b) => b.recommendationScore - a.recommendationScore)
      .slice(0, 3);
  }, [bookingHistory.length, filteredProfessionals]);

  const recommendedIdSet = useMemo(
    () => new Set(recommendedProfessionals.map((professional) => professional.id)),
    [recommendedProfessionals]
  );

  const comparedProfessionals = useMemo(() => {
    const source = new Map(professionals.map((professional) => [String(professional.id), professional]));
    return compareIds.map((id) => source.get(String(id))).filter(Boolean);
  }, [compareIds, professionals]);

  const liveSlots = useMemo(() => {
    if (!activeProfessional) return [];
    return buildLiveSlots({
      professionalId: activeProfessional.id,
      selectedDate,
      nowMs: liveNow,
    });
  }, [activeProfessional, selectedDate, liveNow]);

  useEffect(() => {
    localStorage.setItem(SAVED_PRO_IDS_KEY, JSON.stringify(savedIds));

    const source = new Map(professionals.map((professional) => [String(professional.id), professional]));
    const savedDetails = savedIds
      .map((id) => source.get(String(id)))
      .filter(Boolean)
      .map((professional) => ({
        id: professional.id,
        name: professional.name,
        specialization: professional.specialization,
        rating: professional.rating,
        reviews: professional.reviews,
        location: professional.location,
        experienceYears: professional.experienceYears,
        startingPrice: professional.startingPrice,
        availabilityText: professional.availabilityText,
        responseTime: professional.responseTime,
        badge: professional.badge,
      }));

    localStorage.setItem(SAVED_PRO_DETAILS_KEY, JSON.stringify(savedDetails));
  }, [savedIds, professionals]);

  const toggleSaved = (id) => {
    setSavedIds((currentSaved) =>
      currentSaved.includes(id)
        ? currentSaved.filter((savedId) => savedId !== id)
        : [...currentSaved, id]
    );
  };

  const toggleCompare = (id) => {
    setCompareIds((current) => {
      if (current.includes(id)) {
        return current.filter((compareId) => compareId !== id);
      }
      if (current.length >= 3) {
        return [...current.slice(1), id];
      }
      return [...current, id];
    });
  };

  const handleContinueBooking = (professional) => {
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

  return (
    <div className="professionals-page">
      <section className="professionals-hero">
        <div className="professionals-hero-content">
          <p className="hero-badge">Trusted Home Services Marketplace</p>
          <h1>Book Top Professionals Near You</h1>
          <p>
            Compare ratings, pricing and availability just like an e-commerce catalog. Find your expert,
            view details instantly and book in a few clicks.
          </p>

          <div className="hero-search">
            <input
              type="text"
              placeholder="Search by professional, service, or skill"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
            />
            <button type="button" onClick={() => setSearchTerm('')}>
              Clear
            </button>
          </div>

          <div className="hero-stats">
            <div>
              <strong>{featuredStats.totalPros}+</strong>
              <span>Verified Pros</span>
            </div>
            <div>
              <strong>{featuredStats.avgRating}</strong>
              <span>Average Rating</span>
            </div>
            <div>
              <strong>{featuredStats.totalBookings}+</strong>
              <span>Completed Jobs</span>
            </div>
          </div>
        </div>
      </section>

      <section className="professionals-toolbar">
        <div className="specialization-filters">
          {specializationOptions.map((specialization) => (
            <button
              key={specialization}
              type="button"
              className={selectedSpecialization === specialization ? 'active' : ''}
              onClick={() => setSelectedSpecialization(specialization)}
            >
              {specialization === 'all' ? 'All Categories' : specialization}
            </button>
          ))}
        </div>

        <div className="sort-filter-controls">
          <select value={sortBy} onChange={(event) => setSortBy(event.target.value)}>
            <option value="recommended">Sort: Recommended</option>
            <option value="rating">Sort: Highest Rating</option>
            <option value="experience">Sort: Most Experienced</option>
            <option value="priceLowToHigh">Sort: Price Low to High</option>
            <option value="priceHighToLow">Sort: Price High to Low</option>
          </select>

          <select value={selectedPriceRange} onChange={(event) => setSelectedPriceRange(event.target.value)}>
            <option value="all">All Price Ranges</option>
            <option value="budget">Budget (up to INR 700)</option>
            <option value="standard">Standard (INR 701 - 1200)</option>
            <option value="premium">Premium (above INR 1200)</option>
          </select>

          <select value={minRating} onChange={(event) => setMinRating(event.target.value)}>
            <option value="all">All Ratings</option>
            <option value="4.8">4.8 and above</option>
            <option value="4.5">4.5 and above</option>
            <option value="4">4.0 and above</option>
          </select>
        </div>
      </section>

      {!!recommendedProfessionals.length && (
        <section className="recommendation-strip">
          <div className="recommendation-title-row">
            <h2>Recommended for you</h2>
            <p>Personalized from your previous bookings</p>
          </div>
          <div className="recommendation-cards">
            {recommendedProfessionals.map((professional) => (
              <button
                key={`rec-${professional.id}`}
                type="button"
                className="recommendation-card"
                onClick={() => setActiveProfessional(professional)}
              >
                <div>
                  <strong>{professional.name}</strong>
                  <span>{professional.specialization}</span>
                </div>
                <p>⭐ {professional.rating.toFixed(1)} | INR {professional.startingPrice}</p>
              </button>
            ))}
          </div>
        </section>
      )}

      {error && <p className="professionals-message warning">{error}</p>}
      {loading && <p className="professionals-message">Loading professionals...</p>}

      {!loading && (
        <section className="professionals-grid">
          {filteredProfessionals.length ? (
            filteredProfessionals.map((professional) => {
              const isSaved = savedIds.includes(professional.id);
              const isCompared = compareIds.includes(professional.id);
              const isRecommended = recommendedIdSet.has(professional.id);
              return (
                <article key={professional.id} className="professional-card">
                  <div className="professional-card-top">
                    <div className="card-chip-group">
                      <span className="status-chip">{professional.badge}</span>
                      {isRecommended && <span className="recommend-chip">Recommended for you</span>}
                    </div>
                    <div className="top-actions">
                      <button
                        type="button"
                        className={`compare-toggle ${isCompared ? 'selected' : ''}`}
                        onClick={() => toggleCompare(professional.id)}
                      >
                        {isCompared ? 'Comparing' : 'Compare'}
                      </button>
                      <button
                        type="button"
                        className={`wishlist-btn ${isSaved ? 'saved' : ''}`}
                        onClick={() => toggleSaved(professional.id)}
                        aria-label={isSaved ? 'Remove from saved professionals' : 'Save professional'}
                      >
                        {isSaved ? '♥' : '♡'}
                      </button>
                    </div>
                  </div>

                  <div className="professional-header">
                    <div className="prof-avatar">{professional.name.charAt(0)}</div>
                    <div>
                      <h3>{professional.name}</h3>
                      <p>{professional.specialization}</p>
                    </div>
                  </div>

                  <div className="professional-meta">
                    <span>⭐ {professional.rating.toFixed(1)} ({professional.reviews})</span>
                    <span>{professional.experienceYears}+ years</span>
                    <span>{professional.location}</span>
                  </div>

                  <p className="professional-bio">{professional.bio}</p>

                  <div className="skills-row">
                    {professional.skills.slice(0, 3).map((skill) => (
                      <span key={`${professional.id}-${skill}`}>{skill}</span>
                    ))}
                  </div>

                  <div className="card-details-row">
                    <div>
                      <small>Starting from</small>
                      <strong>INR {professional.startingPrice}</strong>
                    </div>
                    <div>
                      <small>Availability</small>
                      <strong>{professional.availabilityText}</strong>
                    </div>
                  </div>

                  <p className="response-time">{professional.responseTime}</p>

                  <div className="card-actions">
                    <button type="button" className="ghost" onClick={() => setActiveProfessional(professional)}>
                      Quick View
                    </button>
                    <button
                      type="button"
                      className="primary"
                      onClick={() => navigate('/bookings')}
                    >
                      Book Now
                    </button>
                  </div>
                </article>
              );
            })
          ) : (
            <div className="empty-state">
              <h3>No matching professionals found</h3>
              <p>Try changing filters or searching with another service keyword.</p>
            </div>
          )}
        </section>
      )}

      {activeProfessional && (
        <div className="quick-view-overlay" role="dialog" aria-modal="true">
          <div className="quick-view-modal">
            <button type="button" className="close-btn" onClick={() => setActiveProfessional(null)}>
              ×
            </button>
            <div className="quick-view-head">
              <div className="prof-avatar large">{activeProfessional.name.charAt(0)}</div>
              <div>
                <h2>{activeProfessional.name}</h2>
                <p>{activeProfessional.specialization}</p>
                <span>⭐ {activeProfessional.rating.toFixed(1)} ({activeProfessional.reviews} reviews)</span>
              </div>
            </div>

            <p className="quick-view-bio">{activeProfessional.bio}</p>

            <div className="quick-view-grid">
              <div>
                <small>Experience</small>
                <strong>{activeProfessional.experienceYears}+ years</strong>
              </div>
              <div>
                <small>Completed Jobs</small>
                <strong>{activeProfessional.completedBookings}+</strong>
              </div>
              <div>
                <small>Location</small>
                <strong>{activeProfessional.location}</strong>
              </div>
              <div>
                <small>Starting Price</small>
                <strong>INR {activeProfessional.startingPrice}</strong>
              </div>
            </div>

            <div className="skills-row">
              {activeProfessional.skills.map((skill) => (
                <span key={`${activeProfessional.id}-modal-${skill}`}>{skill}</span>
              ))}
            </div>

            <div className="slot-picker">
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
                    key={`${activeProfessional.id}-${selectedDate}-${slot.label}`}
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

            <div className="card-actions modal-actions">
              <button type="button" className="ghost" onClick={() => toggleSaved(activeProfessional.id)}>
                {savedIds.includes(activeProfessional.id) ? 'Saved' : 'Save for Later'}
              </button>
              <button type="button" className="primary" onClick={() => handleContinueBooking(activeProfessional)}>
                Continue to Booking
              </button>
            </div>
          </div>
        </div>
      )}

      {!!compareIds.length && (
        <div className="compare-dock">
          <div className="compare-dock-info">
            <strong>{compareIds.length} selected for compare</strong>
            <p>{compareIds.length < 2 ? 'Select at least 2 professionals for side-by-side view' : 'Ready for side-by-side comparison'}</p>
          </div>
          <div className="compare-dock-actions">
            <button type="button" onClick={() => setCompareIds([])} className="ghost">
              Clear
            </button>
            <button
              type="button"
              className="primary"
              disabled={compareIds.length < 2}
              onClick={() => setIsCompareOpen(true)}
            >
              Compare Now
            </button>
          </div>
        </div>
      )}

      {isCompareOpen && (
        <div className="quick-view-overlay" role="dialog" aria-modal="true">
          <div className="compare-modal">
            <div className="compare-modal-head">
              <h2>Side-by-side compare</h2>
              <button type="button" className="close-btn" onClick={() => setIsCompareOpen(false)}>
                ×
              </button>
            </div>
            <div className="compare-grid">
              {comparedProfessionals.map((professional) => (
                <article key={`compare-${professional.id}`} className="compare-column">
                  <div className="professional-header">
                    <div className="prof-avatar">{professional.name.charAt(0)}</div>
                    <div>
                      <h3>{professional.name}</h3>
                      <p>{professional.specialization}</p>
                    </div>
                  </div>

                  <div className="compare-row">
                    <span>Rating</span>
                    <strong>⭐ {professional.rating.toFixed(1)}</strong>
                  </div>
                  <div className="compare-row">
                    <span>Experience</span>
                    <strong>{professional.experienceYears}+ years</strong>
                  </div>
                  <div className="compare-row">
                    <span>Starting Price</span>
                    <strong>INR {professional.startingPrice}</strong>
                  </div>
                  <div className="compare-row">
                    <span>Completed Jobs</span>
                    <strong>{professional.completedBookings}+</strong>
                  </div>
                  <div className="compare-row">
                    <span>Response Time</span>
                    <strong>{professional.responseTime.replace('Responds in ', '')}</strong>
                  </div>

                  <div className="skills-row compare-skills">
                    {professional.skills.slice(0, 4).map((skill) => (
                      <span key={`${professional.id}-compare-${skill}`}>{toTitleCase(skill)}</span>
                    ))}
                  </div>

                  <button
                    type="button"
                    className="primary compare-book-btn"
                    onClick={() => {
                      setIsCompareOpen(false);
                      setActiveProfessional(professional);
                    }}
                  >
                    Select This Pro
                  </button>
                </article>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Professionals;
