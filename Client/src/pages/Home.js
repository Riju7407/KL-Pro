import React, { useState, useEffect } from 'react';
import './Home.css';
import HeroCarousel from '../components/HeroCarousel';
import API_BASE_URL from '../config/apiConfig';

function Home() {
  const [mostBookedServices, setMostBookedServices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMostBookedServices();
  }, []);

  const fetchMostBookedServices = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/services/most-booked`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch most booked services');
      }

      const services = await response.json();
      // Map database services to display format
      const formattedServices = (Array.isArray(services) ? services : [])
        .map(service => ({
          id: service._id,
          name: service.name,
          price: service.basePrice,
          rating: service.rating || 0,
          reviews: service.reviewCount || 0,
          time: `${service.estimatedDuration} mins`,
          image: service.image || null,
          discount: null
        }))
        .slice(0, 6); // Show only first 6
      
      setMostBookedServices(formattedServices);
    } catch (err) {
      console.error('Error fetching most booked services:', err);
      // Fallback to empty array if fetch fails
      setMostBookedServices([]);
    } finally {
      setLoading(false);
    }
  };

  const quickCategories = [
    { id: 1, name: "Women's Salon & Spa", image: '/WSS.png', time: '45 mins' },
    { id: 2, name: "Men's Grooming", image: '/MG.png', time: '30 mins' },
    { id: 3, name: 'Spa Services', image: '/SS.png', time: '60 mins' },
    { id: 4, name: 'Hair Services', image: '/HS.png', time: '45 mins' },
    { id: 5, name: 'Makeup', image: '/M.png', time: '50 mins' },
    { id: 6, name: 'Home Cleaning', image: '/C.png', time: '90 mins' },
  ];

  const categoryServices = [
    {
      title: 'Salon for Women',
      subtitle: 'Signature beauty sessions with trained experts',
      icon: 'WSS.png',
      services: ['Waxing', 'Threading', 'Facial', 'Cleanup', 'Makeup'],
    },
    {
      title: 'Cleaning Essentials',
      subtitle: 'Deep cleaning routines for every corner',
      icon: 'C.png',
      services: ['Home Cleaning', 'Carpet Cleaning', 'Kitchen Cleaning', 'Bathroom Cleaning'],
    },
    {
      title: 'Grooming for Men',
      subtitle: 'Contemporary grooming with premium products',
      icon: 'MG.png',
      services: ['Haircut', 'Shave', 'Beard Trim', 'Massage'],
    },
  ];

  const platformHighlights = [
    { id: 1, value: '10K+', label: 'Monthly Appointments' },
    { id: 2, value: '4.8★', label: 'Average Customer Rating' },
    { id: 3, value: '60 Min', label: 'Average Arrival Time' },
    { id: 4, value: '100%', label: 'Verified Professionals' },
  ];

  const trustPillars = [
    {
      title: 'Vetted Experts',
      description: 'Every professional is identity-verified and skill-tested before going live.',
    },
    {
      title: 'Transparent Pricing',
      description: 'No hidden charges, with clear service pricing shown before booking.',
    },
    {
      title: 'On-Time Support',
      description: 'Real-time support and updates from booking to service completion.',
    },
  ];

  return (
    <div className="home">
      <HeroCarousel />

      <section className="home-intro">
        <div className="container">
          <div className="intro-card">
            <p className="intro-eyebrow">KLPro Home Services</p>
            <h1>Professional Home Services, Curated for Modern Living</h1>
            <p>
              Browse expert-led beauty, grooming, spa, and cleaning services with fast scheduling
              and consistent quality standards.
            </p>
            <div className="intro-cta-row">
              <a href="/services" className="intro-btn primary">Browse All Services</a>
              <a href="/professionals" className="intro-btn secondary">Meet Professionals</a>
            </div>
          </div>
        </div>
      </section>

      <section className="quick-categories">
        <div className="container">
          <div className="section-header-block">
            <h2>Explore Popular Categories</h2>
            <p>Find the right service in seconds and book at your convenience.</p>
          </div>
          <div className="categories-grid">
            {quickCategories.map((cat) => (
              <div key={cat.id} className="quick-card">
                <div className="quick-image">
                  <img src={cat.image} alt={cat.name} />
                </div>
                <h3>{cat.name}</h3>
                <p className="quick-time">⏱️ {cat.time}</p>
                <button className="quick-btn" type="button">Book</button>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="stats-section">
        <div className="container">
          <div className="stats-grid">
            {platformHighlights.map((item) => (
              <div key={item.id} className="stat-card">
                <h3>{item.value}</h3>
                <p>{item.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="offers-section">
        <div className="container">
          <div className="section-header-block">
            <h2>Exclusive Booking Benefits</h2>
            <p>Make every booking more rewarding with limited-time offers.</p>
          </div>
          <div className="offers-carousel">
            <div className="offer-banner">
              <span className="offer-badge">New User</span>
              <h3>Save 20% on first booking</h3>
              <p>Use code: KL20</p>
            </div>
            <div className="offer-banner">
              <span className="offer-badge">Referral</span>
              <h3>Refer & Earn Rewards</h3>
              <p>Get ₹200 for each referral</p>
            </div>
            <div className="offer-banner">
              <span className="offer-badge">Weekend</span>
              <h3>Weekend Special</h3>
              <p>Flat 30% off on services</p>
            </div>
          </div>
        </div>
      </section>

      <section className="most-booked">
        <div className="container">
          <div className="section-header">
            <h2>Most Booked Services</h2>
            <a href="/services" className="see-all">See all →</a>
          </div>
          {loading ? (
            <div className="loading-message" style={{ textAlign: 'center', padding: '40px', fontSize: '1.1em', color: '#666' }}>
              Loading services...
            </div>
          ) : mostBookedServices.length > 0 ? (
            <div className="services-carousel">
              {mostBookedServices.map((service) => (
                <div key={service.id} className="service-carousel-card">
                  {service.discount && (
                    <div className="discount-badge">{service.discount}</div>
                  )}
                  <div className="service-image">
                    {service.image ? (
                      <img src={service.image} alt={service.name} />
                    ) : (
                      <div className="image-placeholder">📷</div>
                    )}
                  </div>
                  <h3>{service.name}</h3>
                  <div className="rating">
                    <span className="stars">⭐ {service.rating.toFixed(1)}</span>
                    <span className="reviews">({service.reviews})</span>
                  </div>
                  <div className="service-details">
                    <span className="time">⏱️ {service.time}</span>
                    <span className="instant">Instant</span>
                  </div>
                  <div className="price-section">
                    <span className="price">₹{service.price}</span>
                    <button className="book-btn" type="button">Book</button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="no-services-message" style={{ textAlign: 'center', padding: '40px', fontSize: '1.1em', color: '#999' }}>
              No most booked services available yet. Check back soon!
            </div>
          )}
        </div>
      </section>

      {categoryServices.map((category) => (
        <section key={category.title} className="category-section">
          <div className="container">
            <div className="category-header">
              <div>
                <h2>{category.title}</h2>
                <p>{category.subtitle}</p>
              </div>
              <a href="/services" className="see-all">See all →</a>
            </div>
            <div className="category-services">
              {category.services.map((service, idx) => (
                <div key={idx} className="category-service-card">
                  <div className="service-image-lg">
                    <img src={`/${category.icon}`} alt={category.title} />
                  </div>
                  <h3>{service}</h3>
                  <p>Professional & verified</p>
                  <button className="service-btn" type="button">Explore</button>
                </div>
              ))}
            </div>
          </div>
        </section>
      ))}

      <section className="why-us">
        <div className="container">
          <div className="section-header-block">
            <h2>Why KLPro Stands Out</h2>
            <p>Built for reliability, quality delivery, and complete peace of mind.</p>
          </div>
          <div className="why-grid">
            {trustPillars.map((pillar) => (
              <div key={pillar.title} className="why-card">
                <h3>{pillar.title}</h3>
                <p>{pillar.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="home-cta">
        <div className="container">
          <div className="cta-box">
            <h2>Ready to Book a Service?</h2>
            <p>Choose your service, pick a slot, and let our experts handle the rest.</p>
            <a href="/services" className="cta-btn">Start Booking</a>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Home;
