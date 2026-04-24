import React, { useEffect, useMemo, useState } from 'react';
import './Products.css';
import { useLocation, useNavigate } from 'react-router-dom';
import API_BASE_URL from '../config/apiConfig';
import { addToCart } from '../utils/cart';

function Products() {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('popular');
  const [productsData, setProductsData] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    setSearchTerm(params.get('search') || '');
    setSelectedCategory(params.get('category') || 'all');
    setSortBy(params.get('sort') || 'popular');
  }, [location.search]);

  const unwrapResponse = (response) => response?.data ?? response;

  const getProductImage = (product) => {
    const image = product?.images?.[0];

    if (typeof image === 'string') {
      return image;
    }

    return image?.url || product?.image || product?.imageUrl || '';
  };

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/products?limit=1000`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch products');
      }

      const payload = await response.json();
      const items = Array.isArray(payload) ? payload : payload.products || [];

      setProductsData(
        items.map((product) => ({
          id: product._id || product.id,
          name: product.name,
          category: product.category || 'Uncategorized',
          subCategory: product.subcategory || '',
          subSubCategory: product.subSubcategory || '',
          size: product.size || '',
          price: product.price || 0,
          rating: product.rating || 0,
          reviews: product.reviewCount || 0,
          stock: product.stock || 0,
          description: product.description || '',
          image: getProductImage(product),
        }))
      );
    } catch (err) {
      setError(err.message || 'Failed to load products');
      console.error('Error fetching products:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/products/categories`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch categories');
      }

      const payload = await response.json();
      const data = unwrapResponse(payload);

      if (data?.success) {
        setCategories(data.mainCategories || data.categories || []);
      }
    } catch (err) {
      console.error('Error fetching categories:', err);
    }
  };

  const updateQuery = (nextValues) => {
    const params = new URLSearchParams();
    const nextSearch = nextValues.searchTerm ?? searchTerm;
    const nextCategory = nextValues.selectedCategory ?? selectedCategory;
    const nextSort = nextValues.sortBy ?? sortBy;

    if (nextSearch) params.set('search', nextSearch);
    if (nextCategory && nextCategory !== 'all') params.set('category', nextCategory);
    if (nextSort && nextSort !== 'popular') params.set('sort', nextSort);

    navigate({ pathname: '/products', search: params.toString() ? `?${params.toString()}` : '' }, { replace: true });
  };

  const categoryIcons = useMemo(
    () => ({
      'Branded Uniform For KLPro Professional': '🧥',
      'Beauty & Salon Products': '💄',
      'Cleaning Supplies & Equipment': '🧽',
      'Repair & Maintenance Tools': '🛠️',
      'Grooming Equipment': '✂️',
      'Personal Protective Equipment': '🦺',
      'Specialized Machines & Equipment': '⚙️',
    }),
    []
  );

  const mergedCategories = Array.from(
    new Set(['all', ...categories, ...productsData.map((product) => product.category).filter(Boolean)])
  );

  const tabs = [
    { id: 'all', name: 'All Products', icon: '🔍' },
    ...mergedCategories
      .filter((category) => category !== 'all')
      .map((category) => ({
        id: category,
        name: category,
        icon: categoryIcons[category] || '⭐',
      })),
  ];

  const filtered = productsData.filter((product) => {
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
    const search = searchTerm.trim().toLowerCase();
    const matchesSearch =
      !search ||
      product.name.toLowerCase().includes(search) ||
      product.description.toLowerCase().includes(search) ||
      product.category.toLowerCase().includes(search);

    return matchesCategory && matchesSearch;
  });

  const sorted = [...filtered].sort((a, b) => {
    if (sortBy === 'price') return a.price - b.price;
    if (sortBy === 'rating') return b.rating - a.rating;
    return b.reviews - a.reviews;
  });

  const renderStars = (rating = 0) => (
    <div className="rating-section">
      <span className="rating">⭐ {rating.toFixed(1)}</span>
      <span className="reviews">({rating > 0 ? Math.max(1, Math.round(rating * 2)) : 0})</span>
    </div>
  );

  const openProduct = (productId) => {
    navigate(`/product/${productId}`);
  };

  const handleBuyNow = (product) => {
    addToCart(product, 1);
    navigate('/cart');
  };

  return (
    <div className="products-page">
      <section className="products-hero">
        <div className="products-hero-bg" style={{ backgroundImage: "url('/kl2.png')" }} />
      </section>

      <div className="container">
        {error && <div className="error-message">{error}</div>}

        {loading ? (
          <div className="loading-message">Loading products...</div>
        ) : (
          <>
            <section className="filters-section">
              <div className="filters-title-row">
                <h2>Choose Your Product</h2>
                <p>{sorted.length} results</p>
              </div>

              <div className="search-row">
                <div className="search-field">
                  <label htmlFor="productSearch">Search Products</label>
                  <input
                    id="productSearch"
                    type="text"
                    placeholder="Search by product name, category, or description"
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value);
                      updateQuery({ searchTerm: e.target.value });
                    }}
                  />
                </div>

                <div className="sort-options">
                  <label htmlFor="productSort">Sort</label>
                  <select
                    id="productSort"
                    value={sortBy}
                    onChange={(e) => {
                      setSortBy(e.target.value);
                      updateQuery({ sortBy: e.target.value });
                    }}
                    className="sort-select"
                  >
                    <option value="popular">Most Popular</option>
                    <option value="rating">Highest Rated</option>
                    <option value="price">Price: Low to High</option>
                  </select>
                </div>
              </div>

              <div className="category-tabs" role="tablist" aria-label="Product categories">
                {tabs.map((category) => (
                  <button
                    key={category.id}
                    className={`category-tab ${selectedCategory === category.id ? 'active' : ''}`}
                    onClick={() => {
                      setSelectedCategory(category.id);
                      updateQuery({ selectedCategory: category.id });
                    }}
                    type="button"
                  >
                    <span className="tab-icon">{category.icon}</span>
                    <span className="tab-name">{category.name}</span>
                  </button>
                ))}
              </div>
            </section>

            <section className="products-section">
              <div className="products-grid">
                {sorted.length > 0 ? (
                  sorted.map((product) => (
                    <div key={product.id} className="service-card product-card">
                      <div className="service-image product-image-wrap">
                        {product.image ? (
                          <img src={product.image} alt={product.name} />
                        ) : (
                          <div className="image-placeholder">📷</div>
                        )}
                        <span className={`stock-badge ${product.stock > 0 ? 'in-stock' : 'out-stock'}`}>
                          {product.stock > 0 ? 'In Stock' : 'Out of Stock'}
                        </span>
                      </div>

                      <div className="service-content product-content">
                        <h3 className="service-name">{product.name}</h3>
                        <p className="service-description">{product.description}</p>

                        <div className="service-hierarchy-badges">
                          <span className="service-hierarchy-badge">{product.category}</span>
                          {product.subCategory && <span className="service-hierarchy-badge">{product.subCategory}</span>}
                          {product.subSubCategory && <span className="service-hierarchy-badge">{product.subSubCategory}</span>}
                          {product.size && <span className="service-hierarchy-badge">{product.size}</span>}
                        </div>

                        {renderStars(product.rating)}

                        <div className="service-meta product-meta-row">
                          <span className="duration">🧩 {product.reviews} reviews</span>
                          <span className="availability instant">Premium</span>
                        </div>

                        <div className="service-footer">
                          <span className="price">₹{product.price}</span>
                          <div className="product-card-actions">
                            <button className="book-now-btn secondary-action" type="button" onClick={() => openProduct(product.id)}>
                              View Details
                            </button>
                            <button
                              className="book-now-btn"
                              type="button"
                              disabled={product.stock <= 0}
                              onClick={() => handleBuyNow(product)}
                            >
                              Buy Now
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="no-services">
                    <p>No products available with the selected filters</p>
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

export default Products;