import React, { useState, useEffect } from 'react';
import './AdminProductsSection.css';
import {
  getProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  uploadProductImages,
  deleteProductImage,
  getProductCategories,
} from '../api/services';
import {
  PRODUCT_CATEGORY_HIERARCHY,
  getMainCategories,
  getSubcategories,
  getSubSubcategories,
  getSizes,
} from '../config/productCategoryHierarchy';

const AdminProductsSection = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    subcategory: '',
    subSubcategory: '',
    subSubSubcategory: '',
    size: '',
    stock: '',
  });
  const [imageFiles, setImageFiles] = useState([]);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    fetchProducts();
  }, [currentPage, searchTerm]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await getProducts({
        page: currentPage,
        search: searchTerm,
        limit: 10,
      });
      if (response.data?.success) {
        setProducts(response.data.products);
      } else if (response.success) {
        setProducts(response.products);
      }
    } catch (err) {
      setError(err.message || 'Error fetching products');
    } finally {
      setLoading(false);
    }
  };

  const handleAddProduct = () => {
    setFormData({
      name: '',
      description: '',
      price: '',
      category: '',
      subcategory: '',
      subSubcategory: '',
      subSubSubcategory: '',
      size: '',
      stock: '',
    });
    setShowForm(true);
    setSelectedProduct(null);
  };

  const handleEditProduct = (product) => {
    setFormData({
      name: product.name,
      description: product.description,
      price: product.price,
      category: product.category || '',
      subcategory: product.subcategory || '',
      subSubcategory: product.subSubcategory || '',
      subSubSubcategory: product.subSubSubcategory || '',
      size: product.size || '',
      stock: product.stock,
    });
    setSelectedProduct(product);
    setShowForm(true);
  };

  const cancelEditMode = () => {
    if (selectedProduct) {
      setShowForm(false);
      return;
    }

    setShowForm(false);
    setImageFiles([]);
  };

  const handleCategoryChange = (value) => {
    setFormData({
      ...formData,
      category: value,
      subcategory: '',
      subSubcategory: '',
      subSubSubcategory: '',
      size: '',
    });
  };

  const handleSubcategoryChange = (value) => {
    setFormData({
      ...formData,
      subcategory: value,
      subSubcategory: '',
      subSubSubcategory: '',
      size: '',
    });
  };

  const handleSubSubcategoryChange = (value) => {
    setFormData({
      ...formData,
      subSubcategory: value,
      subSubSubcategory: '',
      size: '',
    });
  };

  const handleSubSubSubcategoryChange = (value) => {
    setFormData({
      ...formData,
      subSubSubcategory: value,
      size: '',
    });
  };

  const getSizesForCurrentSelection = () => {
    return getSizes(
      formData.category,
      formData.subcategory,
      formData.subSubcategory
    );
  };

  const handleSaveProduct = async () => {
    if (!formData.name || !formData.description || !formData.price || !formData.category) {
      setError('Please fill in all required fields');
      return;
    }

    try {
      setUploadingImages(true);
      let productId;
      let savedProduct = null;
      
      if (selectedProduct) {
        const response = await updateProduct(selectedProduct._id, formData);
        savedProduct = response.data?.product || response.product || null;
        productId = selectedProduct._id;
      } else {
        const response = await createProduct(formData);
        savedProduct = response.data?.product || response.product || null;
        productId = response.data?.product?._id;
      }

      // Upload images if any are selected
      if (imageFiles.length > 0 && productId) {
        await uploadProductImages(productId, imageFiles);
        setImageFiles([]);
      }

      setError('');
      alert(selectedProduct ? 'Product updated successfully' : 'Product created successfully');
      setShowForm(false);
      if (savedProduct && selectedProduct) {
        setSelectedProduct(savedProduct);
      }
      fetchProducts();
    } catch (err) {
      setError(err.response?.data?.message || 'Error saving product');
    } finally {
      setUploadingImages(false);
    }
  };

  const handleDeleteProduct = async (productId) => {
    if (!window.confirm('Are you sure you want to delete this product?')) {
      return;
    }

    try {
      await deleteProduct(productId);
      setError('');
      alert('Product deleted successfully');
      fetchProducts();
    } catch (err) {
      setError(err.response?.data?.message || 'Error deleting product');
    }
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    const remaining = 4 - (selectedProduct?.images?.length || 0);
    if (files.length > remaining) {
      setError(`Maximum ${remaining} images can be uploaded`);
      return;
    }
    setImageFiles(files);
  };

  const handleUploadImages = async () => {
    if (!selectedProduct || imageFiles.length === 0) {
      setError('No images selected');
      return;
    }

    try {
      setUploadingImages(true);
      await uploadProductImages(selectedProduct._id, imageFiles);
      setError('');
      alert('Images uploaded successfully');
      setImageFiles([]);
      // Refresh the product details
      const response = await getProducts({ page: currentPage });
      if (response.data?.success) {
        setProducts(response.data.products);
      } else if (response.success) {
        setProducts(response.products);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Error uploading images');
    } finally {
      setUploadingImages(false);
    }
  };

  const handleDeleteImage = async (publicId) => {
    if (!window.confirm('Are you sure you want to delete this image?')) {
      return;
    }

    try {
      await deleteProductImage(selectedProduct._id, publicId);
      setError('');
      alert('Image deleted successfully');
      // Refresh the product details
      const response = await getProducts({ page: currentPage });
      if (response.data?.success) {
        setProducts(response.data.products);
      } else if (response.success) {
        setProducts(response.products);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Error deleting image');
    }
  };

  const backToProductList = () => {
    setSelectedProduct(null);
    setShowForm(false);
    setImageFiles([]);
  };

  if (loading) {
    return <div className="loading">Loading products...</div>;
  }

  const availableSubcategories = getSubcategories(formData.category);
  const availableSubSubcategories = getSubSubcategories(
    formData.category,
    formData.subcategory
  );
  const availableSubSubSubcategories = getSubSubcategories(
    formData.category,
    formData.subcategory
  );
  const availableSizes = getSizesForCurrentSelection();

  return (
    <div className="admin-products-section">
      <div className="products-header">
        <div>
          <h2>Product Management</h2>
          <p>Manage products, upload images, and control inventory</p>
        </div>
        <button className="btn-add-product" onClick={handleAddProduct}>
          + Add New Product
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="products-content">
        {!selectedProduct ? (
          <div className="products-list-container">
            <div className="search-bar">
              <input
                type="text"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
              />
            </div>

            {showForm ? (
              <div className="product-form-container">
                <h3>{selectedProduct ? 'Edit Product' : 'Add New Product'}</h3>
                <div className="form-group">
                  <label>Product Name *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Enter product name"
                  />
                </div>

                <div className="form-group">
                  <label>Description *</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    placeholder="Enter product description"
                    rows="4"
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Price *</label>
                    <input
                      type="number"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      placeholder="Enter price"
                      min="0"
                    />
                  </div>
                  <div className="form-group">
                    <label>Stock</label>
                    <input
                      type="number"
                      value={formData.stock}
                      onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                      placeholder="Enter stock quantity"
                      min="0"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Category *</label>
                  <select
                    value={formData.category}
                    onChange={(e) => handleCategoryChange(e.target.value)}
                  >
                    <option value="">Select a category</option>
                    {getMainCategories().map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                {availableSubcategories.length > 0 && (
                  <div className="form-group">
                    <label>Subcategory</label>
                    <select
                      value={formData.subcategory}
                      onChange={(e) => handleSubcategoryChange(e.target.value)}
                    >
                      <option value="">Select a subcategory</option>
                      {availableSubcategories.map((subcat) => (
                        <option key={subcat} value={subcat}>
                          {subcat}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {availableSubSubcategories.length > 0 && (
                  <div className="form-group">
                    <label>Sub-Subcategory</label>
                    <select
                      value={formData.subSubcategory}
                      onChange={(e) => handleSubSubcategoryChange(e.target.value)}
                    >
                      <option value="">Select a sub-subcategory</option>
                      {availableSubSubcategories.map((subSubcat) => (
                        <option key={subSubcat} value={subSubcat}>
                          {subSubcat}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {availableSizes.length > 0 && (
                  <div className="form-group">
                    <label>Size</label>
                    <select
                      value={formData.size}
                      onChange={(e) => setFormData({ ...formData, size: e.target.value })}
                    >
                      <option value="">Select a size</option>
                      {availableSizes.map((size) => (
                        <option key={size} value={size}>
                          {size}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <div className="form-group">
                  <label>Product Images (Up to 4)</label>
                  <div className="image-upload-section">
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleImageChange}
                      disabled={uploadingImages}
                      id="product-images"
                    />
                    <label htmlFor="product-images" className="file-input-label">
                      Click to select images (Max 4)
                    </label>
                  </div>
                  {imageFiles.length > 0 && (
                    <div className="selected-images-preview">
                      <p><strong>{imageFiles.length} image(s) selected for upload</strong></p>
                      <div className="images-list">
                        {Array.from(imageFiles).map((file, index) => (
                          <div key={index} className="image-item">
                            <span>✓ {file.name}</span>
                            <small>({(file.size / 1024 / 1024).toFixed(2)} MB)</small>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="form-actions">
                  <button className="btn-save" onClick={handleSaveProduct}>
                    {uploadingImages ? 'Uploading...' : 'Save Product'}
                  </button>
                  <button className="btn-cancel" onClick={cancelEditMode}>
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="products-table-container">
                <table className="products-table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Category</th>
                      <th>Price</th>
                      <th>Stock</th>
                      <th>Rating</th>
                      <th>Images</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.length > 0 ? (
                      products.map((product) => (
                        <tr key={product._id}>
                          <td>{product.name}</td>
                          <td>
                            {product.category}
                            {product.subcategory && ` > ${product.subcategory}`}
                            {product.subSubcategory && ` > ${product.subSubcategory}`}
                          </td>
                          <td>₹{product.price}</td>
                          <td>{product.stock}</td>
                          <td>
                            <span className="rating-badge">{product.rating.toFixed(1)} ★</span>
                          </td>
                          <td>{product.images.length}/4</td>
                          <td className="actions-cell">
                            <button
                              className="btn-view"
                              onClick={() => setSelectedProduct(product)}
                            >
                              View
                            </button>
                            <button
                              className="btn-delete-small"
                              onClick={() => handleDeleteProduct(product._id)}
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="7" className="text-center">
                          No products found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        ) : (
          <div className="product-detail-container">
            <button
              className="back-btn"
              onClick={() => {
                backToProductList();
              }}
            >
              ← Back to Products
            </button>

            {showForm ? (
              <div className="product-edit-form">
                <h3>Edit Product</h3>

                <div className="form-group">
                  <label>Product Name *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label>Description *</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows="3"
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Category *</label>
                    <select value={formData.category} onChange={(e) => handleCategoryChange(e.target.value)}>
                      <option value="">Select a category</option>
                      {getMainCategories().map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Subcategory</label>
                    <select value={formData.subcategory} onChange={(e) => handleSubcategoryChange(e.target.value)}>
                      <option value="">Select a subcategory</option>
                      {availableSubcategories.map((subcat) => (
                        <option key={subcat} value={subcat}>
                          {subcat}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Sub-Subcategory</label>
                    <select value={formData.subSubcategory} onChange={(e) => handleSubSubcategoryChange(e.target.value)}>
                      <option value="">Select a sub-subcategory</option>
                      {availableSubSubcategories.map((subSubcat) => (
                        <option key={subSubcat} value={subSubcat}>
                          {subSubcat}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Size</label>
                    <select value={formData.size} onChange={(e) => setFormData({ ...formData, size: e.target.value })}>
                      <option value="">Select a size</option>
                      {availableSizes.map((size) => (
                        <option key={size} value={size}>
                          {size}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Price *</label>
                    <input
                      type="number"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      min="0"
                    />
                  </div>

                  <div className="form-group">
                    <label>Stock</label>
                    <input
                      type="number"
                      value={formData.stock}
                      onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                      min="0"
                    />
                  </div>
                </div>

                <div className="form-actions">
                  <button className="btn-save" onClick={handleSaveProduct}>
                    {uploadingImages ? 'Saving...' : 'Save Changes'}
                  </button>
                  <button className="btn-cancel" onClick={cancelEditMode}>
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="product-detail-card">
                <div className="product-detail-header">
                  <div>
                    <h3>{selectedProduct.name}</h3>
                    <p className="category-badge">
                      {selectedProduct.category}
                      {selectedProduct.subcategory && ` > ${selectedProduct.subcategory}`}
                      {selectedProduct.subSubcategory && ` > ${selectedProduct.subSubcategory}`}
                      {selectedProduct.size && ` [${selectedProduct.size}]`}
                    </p>
                  </div>
                  <div className="product-stats">
                    <div className="stat">
                      <span className="stat-label">Price</span>
                      <span className="stat-value">₹{selectedProduct.price}</span>
                    </div>
                    <div className="stat">
                      <span className="stat-label">Stock</span>
                      <span className="stat-value">{selectedProduct.stock}</span>
                    </div>
                    <div className="stat">
                      <span className="stat-label">Rating</span>
                      <span className="stat-value">{selectedProduct.rating.toFixed(1)} ★</span>
                    </div>
                  </div>
                </div>

                <div className="product-description">
                  <h4>Description</h4>
                  <p>{selectedProduct.description}</p>
                </div>

                <div className="images-management">
                  <h4>Product Images ({selectedProduct.images.length}/4)</h4>

                  {selectedProduct.images.length > 0 && (
                    <div className="images-grid">
                      {selectedProduct.images.map((image, index) => (
                        <div key={index} className="image-card">
                          <img src={image.url} alt={`Product ${index + 1}`} />
                          <button
                            className="btn-delete-image"
                            onClick={() => handleDeleteImage(image.publicId)}
                            title="Delete image"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {selectedProduct.images.length < 4 && (
                    <div className="upload-section">
                      <input
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={handleImageChange}
                        disabled={uploadingImages}
                      />
                      {imageFiles.length > 0 && (
                        <button
                          className="btn-upload"
                          onClick={handleUploadImages}
                          disabled={uploadingImages}
                        >
                          {uploadingImages ? 'Uploading...' : `Upload ${imageFiles.length} Image(s)`}
                        </button>
                      )}
                    </div>
                  )}
                </div>

                <div className="product-actions detail-actions">
                  <button className="btn-cancel" onClick={backToProductList}>
                    Back to Product Page
                  </button>
                  <button className="btn-edit" onClick={() => handleEditProduct(selectedProduct)}>
                    Edit Product
                  </button>
                  <button
                    className="btn-delete"
                    onClick={() => {
                      handleDeleteProduct(selectedProduct._id);
                      setSelectedProduct(null);
                    }}
                  >
                    Delete Product
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminProductsSection;
