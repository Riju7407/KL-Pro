import React, { useState, useEffect } from 'react';
import './Services.css';
import API_BASE_URL from '../config/apiConfig';
import { SERVICE_HIERARCHY, getHierarchyOptions, getServiceTypeOptions } from '../config/serviceHierarchy';

function Services() {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedSubCategory, setSelectedSubCategory] = useState('all');
  const [selectedSubSubCategory, setSelectedSubSubCategory] = useState('all');
  const [selectedServiceType, setSelectedServiceType] = useState('all');
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
          subCategory: service.subCategory || '',
          subSubCategory: service.subSubCategory || '',
          serviceType: service.serviceType || '',
          price: service.basePrice,
          duration: `${service.estimatedDuration} min`,
          rating: service.rating || 0,
          reviews: service.reviewCount || 0,
          description: service.description,
          availability: 'Instant',
          image: service.image || null
        }));
      
      setServicesData(formattedServices);
    } catch (err) {
      setError(err.message || 'Failed to load services');
      console.error('Error fetching services:', err);
    } finally {
      setLoading(false);
    }
  };

  const categoryIcons = {
    HelpingHand: '🤝',
    "Women's Salon & Spa": '💄',
    "Men's Salon & Massage": '💈',
    'Cleaning & Pest Control': '🧽',
    'AC & Appliance Repair': '🛠️',
    'Electrician, Plumber, Carpenter & Mason': '🔧',
    Repairs: '🔧',
    'Home Decoration': '🎉',
  };

  const dataCategories = Array.from(new Set(servicesData.map((service) => service.category).filter(Boolean)));
  const hierarchyCategories = Object.keys(SERVICE_HIERARCHY);
  const mergedCategories = Array.from(new Set([...hierarchyCategories, ...dataCategories]));

  const categories = [
    { id: 'all', name: 'All Services', icon: '🔍' },
    ...mergedCategories.map((category) => ({
      id: category,
      name: category,
      icon: categoryIcons[category] || '⭐',
    })),
  ];

  const getSubCategoryOptions = () => {
    if (selectedCategory === 'all') {
      return Array.from(new Set(servicesData.map((service) => service.subCategory).filter(Boolean)));
    }

    if (SERVICE_HIERARCHY[selectedCategory]) {
      return getHierarchyOptions(selectedCategory).subCategories;
    }

    return Array.from(
      new Set(
        servicesData
          .filter((service) => service.category === selectedCategory)
          .map((service) => service.subCategory)
          .filter(Boolean)
      )
    );
  };

  const getSubSubCategoryOptions = () => {
    if (selectedSubCategory === 'all') {
      return Array.from(
        new Set(
          servicesData
            .filter((service) => selectedCategory === 'all' || service.category === selectedCategory)
            .map((service) => service.subSubCategory)
            .filter(Boolean)
        )
      );
    }

    if (selectedCategory !== 'all' && SERVICE_HIERARCHY[selectedCategory]) {
      return getHierarchyOptions(selectedCategory, selectedSubCategory).subSubCategories;
    }

    return Array.from(
      new Set(
        servicesData
          .filter(
            (service) =>
              (selectedCategory === 'all' || service.category === selectedCategory) &&
              service.subCategory === selectedSubCategory
          )
          .map((service) => service.subSubCategory)
          .filter(Boolean)
      )
    );
  };

  const getServiceTypeFilterOptions = () => {
    if (selectedSubSubCategory === 'all') {
      return Array.from(
        new Set(
          servicesData
            .filter(
              (service) =>
                (selectedCategory === 'all' || service.category === selectedCategory) &&
                (selectedSubCategory === 'all' || service.subCategory === selectedSubCategory)
            )
            .map((service) => service.serviceType)
            .filter(Boolean)
        )
      );
    }

    if (selectedCategory !== 'all' && selectedSubCategory !== 'all') {
      return getServiceTypeOptions(selectedCategory, selectedSubCategory, selectedSubSubCategory);
    }

    return Array.from(
      new Set(
        servicesData
          .filter(
            (service) =>
              (selectedCategory === 'all' || service.category === selectedCategory) &&
              (selectedSubCategory === 'all' || service.subCategory === selectedSubCategory) &&
              service.subSubCategory === selectedSubSubCategory
          )
          .map((service) => service.serviceType)
          .filter(Boolean)
      )
    );
  };

  const subCategoryOptions = getSubCategoryOptions();
  const subSubCategoryOptions = getSubSubCategoryOptions();

  const filtered = servicesData.filter((service) => {
    const matchesCategory = selectedCategory === 'all' || service.category === selectedCategory;
    const matchesSubCategory = selectedSubCategory === 'all' || service.subCategory === selectedSubCategory;
    const matchesSubSubCategory =
      selectedSubSubCategory === 'all' || service.subSubCategory === selectedSubSubCategory;
    const matchesServiceType = selectedServiceType === 'all' || service.serviceType === selectedServiceType;

    return matchesCategory && matchesSubCategory && matchesSubSubCategory && matchesServiceType;
  });

  const sorted = [...filtered].sort((a, b) => {
    if (sortBy === 'price') return a.price - b.price;
    if (sortBy === 'rating') return b.rating - a.rating;
    return 0;
  });

  return (
    <div className="services-page">
      <section className="services-hero">
        <div className="services-hero-bg" style={{ backgroundImage: "url('/kl2.png')" }} />
      </section>

      <div className="container">
        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        {loading ? (
          <div className="loading-message">
            Loading services...
          </div>
        ) : (
          <>
            <section className="filters-section">
              <div className="filters-title-row">
                <h2>Choose Your Service</h2>
                <p>{sorted.length} results</p>
              </div>

              <div className="category-tabs" role="tablist" aria-label="Service categories">
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    className={`category-tab ${selectedCategory === cat.id ? 'active' : ''}`}
                    onClick={() => {
                      setSelectedCategory(cat.id);
                      setSelectedSubCategory('all');
                      setSelectedSubSubCategory('all');
                      setSelectedServiceType('all');
                    }}
                    type="button"
                  >
                    <span className="tab-icon">{cat.icon}</span>
                    <span className="tab-name">{cat.name}</span>
                  </button>
                ))}
              </div>

              <div className="hierarchy-filters" aria-label="Service hierarchy filters">
                <div className="hierarchy-filter-item">
                  <label htmlFor="subCategory">Subcategory</label>
                  <select
                    id="subCategory"
                    value={selectedSubCategory}
                    onChange={(e) => {
                      setSelectedSubCategory(e.target.value);
                      setSelectedSubSubCategory('all');
                      setSelectedServiceType('all');
                    }}
                    className="sort-select"
                  >
                    <option value="all">All Subcategories</option>
                    {subCategoryOptions.map((subCategory) => (
                      <option key={subCategory} value={subCategory}>
                        {subCategory}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="hierarchy-filter-item">
                  <label htmlFor="subSubCategory">Sub-subcategory</label>
                  <select
                    id="subSubCategory"
                    value={selectedSubSubCategory}
                    onChange={(e) => {
                      setSelectedSubSubCategory(e.target.value);
                      setSelectedServiceType('all');
                    }}
                    className="sort-select"
                  >
                    <option value="all">All Sub-subcategories</option>
                    {subSubCategoryOptions.map((subSubCategory) => (
                      <option key={subSubCategory} value={subSubCategory}>
                        {subSubCategory}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="hierarchy-filter-item">
                  <label htmlFor="serviceType">Service Type</label>
                  <select
                    id="serviceType"
                    value={selectedServiceType}
                    onChange={(e) => setSelectedServiceType(e.target.value)}
                    className="sort-select"
                  >
                    <option value="all">All Service Types</option>
                    {getServiceTypeFilterOptions().map((serviceType) => (
                      <option key={serviceType} value={serviceType}>
                        {serviceType}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="sort-options">
                <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="sort-select">
                  <option value="popular">Most Popular</option>
                  <option value="rating">Highest Rated</option>
                  <option value="price">Price: Low to High</option>
                </select>
              </div>
            </section>

            <section className="services-section">
              <div className="services-grid">
                {sorted.length > 0 ? (
                  sorted.map((service) => (
                    <div key={service.id} className="service-card">
                      <div className="service-image">
                        {service.image ? (
                          <img src={service.image} alt={service.name} />
                        ) : (
                          <div className="image-placeholder">📷</div>
                        )}
                      </div>
                      
                      <div className="service-content">
                        <h3 className="service-name">{service.name}</h3>
                        <p className="service-description">{service.description}</p>

                        <div className="service-hierarchy-badges">
                          <span className="service-hierarchy-badge">{service.category}</span>
                          {service.subCategory && <span className="service-hierarchy-badge">{service.subCategory}</span>}
                          {service.subSubCategory && (
                            <span className="service-hierarchy-badge">{service.subSubCategory}</span>
                          )}
                          {service.serviceType && (
                            <span className="service-hierarchy-badge">{service.serviceType}</span>
                          )}
                        </div>
                        
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
                          <button className="book-now-btn" type="button">Book Now</button>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="no-services">
                    <p>No services available with the selected filters</p>
                  </div>
                )}
              </div>
            </section>
          </>
        )}
      </div>
    </div>
  );
}

export default Services;
