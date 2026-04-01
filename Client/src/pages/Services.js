import React, { useState, useEffect } from 'react';
import './Services.css';
import API_BASE_URL from '../config/apiConfig';

function Services() {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('popular');
  const [servicesData, setServicesData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/services`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch services');
      }

      const services = await response.json();
      // Map database services to display format
      const formattedServices = (Array.isArray(services) ? services : services.services || [])
        .map(service => ({
          id: service._id,
          name: service.name,
          category: service.category,
          price: service.basePrice,
          duration: `${service.estimatedDuration} min`,
          rating: service.rating || 0,
          reviews: service.reviewCount || 0,
          description: service.description,
          availability: 'Instant'
        }));
      
      setServicesData(formattedServices);
    } catch (err) {
      setError(err.message || 'Failed to load services');
      console.error('Error fetching services:', err);
    } finally {
      setLoading(false);
    }
  };

  const categories = [
    { id: 'all', name: 'All Services', icon: '🔍' },
    { id: 'hair', name: 'Hair Services', icon: '✂️' },
    { id: 'salon', name: 'Salon', icon: '💄' },
    { id: 'spa', name: 'Spa', icon: '🧖' },
    { id: 'makeup', name: 'Makeup', icon: '💅' },
    { id: 'grooming', name: 'Grooming', icon: '💈' },
    { id: 'other', name: 'Other', icon: '⭐' },
  ];

  const filtered = selectedCategory === 'all' 
    ? servicesData 
    : servicesData.filter(s => s.category === selectedCategory);

  const sorted = [...filtered].sort((a, b) => {
    if (sortBy === 'price') return a.price - b.price;
    if (sortBy === 'rating') return b.rating - a.rating;
    return 0;
  });

  return (
    <div className="services-page">
      {/* Header Section */}
      <section className="services-header">
        <div className="container">
          <h1>Explore Our Services</h1>
          <p>Choose from {servicesData.length}+ professional services</p>
        </div>
      </section>

      <div className="container">
        {error && (
          <div className="error-message" style={{ padding: '15px', background: '#fee', color: '#c00', borderRadius: '4px', marginBottom: '20px' }}>
            {error}
          </div>
        )}

        {loading ? (
          <div className="loading-message" style={{ textAlign: 'center', padding: '40px', fontSize: '1.1em', color: '#666' }}>
            Loading services...
          </div>
        ) : (
          <>
            {/* Filters Section */}
            <section className="filters-section">
              <div className="category-tabs">
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    className={`category-tab ${selectedCategory === cat.id ? 'active' : ''}`}
                    onClick={() => setSelectedCategory(cat.id)}
                  >
                    <span className="tab-icon">{cat.icon}</span>
                    <span className="tab-name">{cat.name}</span>
                  </button>
                ))}
              </div>

              <div className="sort-options">
                <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="sort-select">
                  <option value="popular">Most Popular</option>
                  <option value="rating">Highest Rated</option>
                  <option value="price">Price: Low to High</option>
                </select>
              </div>
            </section>

            {/* Services Grid */}
            <section className="services-section">
              <div className="services-grid">
                {sorted.length > 0 ? (
                  sorted.map((service) => (
                    <div key={service.id} className="service-card">
                      <div className="service-image">📷</div>
                      
                      <div className="service-content">
                        <h3 className="service-name">{service.name}</h3>
                        
                        <div className="rating-section">
                          <span className="rating">⭐ {service.rating.toFixed(1)}</span>
                          <span className="reviews">({service.reviews})</span>
                        </div>

                        <div className="service-meta">
                          <span className="duration">⏱️ {service.duration}</span>
                          <span className={`availability ${service.availability === 'Instant' ? 'instant' : ''}`}>
                            {service.availability}
                          </span>
                        </div>

                        <div className="service-footer">
                          <span className="price">₹{service.price}</span>
                          <button className="book-now-btn">Book Now</button>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="no-services">
                    <p>No services available in this category</p>
                  </div>
                )}
              </div>
            </section>

            {/* Trust Section */}
            <section className="trust-section">
              <div className="trust-content">
                <h2>Trusted by Millions</h2>
                <div className="trust-stats">
                  <div className="trust-stat">
                    <h4>{servicesData.length}+</h4>
                    <p>Services</p>
                  </div>
                  <div className="trust-stat">
                    <h4>5000+</h4>
                    <p>Professionals</p>
                  </div>
                  <div className="trust-stat">
                    <h4>4.8⭐</h4>
                    <p>Average Rating</p>
                  </div>
                  <div className="trust-stat">
                    <h4>100K+</h4>
                    <p>Happy Customers</p>
                  </div>
                </div>
              </div>
            </section>
          </>
        )}
      </div>
    </div>
  );
}

export default Services;
