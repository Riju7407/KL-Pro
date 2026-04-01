import React, { useState, useEffect } from 'react';
import './Home.css';
import HeroCarousel from '../components/HeroCarousel';

function Home() {
  const [mostBookedServices, setMostBookedServices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMostBookedServices();
  }, []);

  const fetchMostBookedServices = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:5000/api/services/most-booked', {
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
    { id: 6, name: 'Cleaning', image: '/C.png', time: '90 mins' },
  ];

  const categoryServices = [
    {
      title: 'Salon for Women',
      subtitle: 'Pamper yourself at home',
      icon: '✨',
      services: ['Waxing', 'Threading', 'Facial', 'Cleanup', 'Makeup'],
    },
    {
      title: 'Cleaning Essentials',
      subtitle: 'Professional cleaning services',
      icon: '🧹',
      services: ['Home Cleaning', 'Carpet Cleaning', 'Kitchen Cleaning', 'Bathroom Cleaning'],
    },
    {
      title: 'Grooming for Men',
      subtitle: 'Grooming essentials',
      icon: '💈',
      services: ['Haircut', 'Shave', 'Beard Trim', 'Massage'],
    },
  ];

  return (
    <div className="home">
      {/* Hero Carousel Section */}
      <HeroCarousel />

      {/* Quick Access Categories */}
      <section className="quick-categories">
        <div className="container">
          <h2>What are you looking for?</h2>
          <div className="categories-grid">
            {quickCategories.map((cat) => (
              <div key={cat.id} className="quick-card">
                <div className="quick-image">
                  <img src={cat.image} alt={cat.name} />
                </div>
                <h3>{cat.name}</h3>
                <p className="quick-time">⏱️ {cat.time}</p>
                <button className="quick-btn">Book</button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="stats-section">
        <div className="container">
          <div className="stats-grid">
            <div className="stat-card">
              <h3>5000+</h3>
              <p>Professionals</p>
            </div>
            <div className="stat-card">
              <h3>50+</h3>
              <p>Cities</p>
            </div>
            <div className="stat-card">
              <h3>100K+</h3>
              <p>Bookings Completed</p>
            </div>
            <div className="stat-card">
              <h3>4.8⭐</h3>
              <p>Average Rating</p>
            </div>
          </div>
        </div>
      </section>

      {/* Offers & Discounts */}
      <section className="offers-section">
        <div className="container">
          <h2>Offers & Discounts</h2>
          <div className="offers-carousel">
            <div className="offer-banner">
              <span className="offer-badge">SPECIAL</span>
              <h3>Save 20% on first booking</h3>
              <p>Use code: KL20</p>
            </div>
            <div className="offer-banner">
              <span className="offer-badge">HOT</span>
              <h3>Refer & Earn Rewards</h3>
              <p>Get ₹200 for each referral</p>
            </div>
            <div className="offer-banner">
              <span className="offer-badge">NEW</span>
              <h3>Weekend Special</h3>
              <p>Flat 30% off on services</p>
            </div>
          </div>
        </div>
      </section>

      {/* Most Booked Services */}
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
                  <div className="service-image">📷</div>
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
                    <button className="book-btn">Book</button>
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

      {/* Category Sections */}
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
                  <div className="service-image-lg">{category.icon}</div>
                  <h3>{service}</h3>
                  <p>Professional & verified</p>
                  <button className="service-btn">Explore</button>
                </div>
              ))}
            </div>
          </div>
        </section>
      ))}

      {/* Why Choose Us */}
      <section className="why-us">
        <div className="container">
          <h2>Why Choose KLPro Pvt Ltd?</h2>
          <div className="why-grid">
            <div className="why-card">
              <div className="why-icon">🛡️</div>
              <h3>Verified Professionals</h3>
              <p>All professionals are background checked and verified</p>
            </div>
            <div className="why-card">
              <div className="why-icon">⏰</div>
              <h3>On-Time Service</h3>
              <p>Professionals arrive on time or we refund 50%</p>
            </div>
            <div className="why-card">
              <div className="why-icon">⭐</div>
              <h3>Quality Guarantee</h3>
              <p>Satisfaction guaranteed or money back</p>
            </div>
            <div className="why-card">
              <div className="why-icon">✨</div>
              <h3>Easy Booking</h3>
              <p>Book services in just 2 minutes from home</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Home;
