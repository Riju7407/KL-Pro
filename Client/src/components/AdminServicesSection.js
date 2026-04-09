import React from 'react';

function AdminServicesSection({
  services,
  selectedService,
  setSelectedService,
  editingService,
  setEditingService,
  showServiceForm,
  setShowServiceForm,
  handleDeleteService,
  handleUpdateService,
  handleCreateService,
  handleToggleMostBooked,
  searchQuery,
  setSearchQuery,
  handleServiceImageChange,
  imagePreview
}) {
  const filteredServices = services.filter(service =>
    service.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    service.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="services-section">
      <div className="services-header">
        <h2>Services Management</h2>
        <button 
          className="btn-add-service"
          onClick={() => {
            setShowServiceForm(true);
            setEditingService({
              name: '',
              description: '',
              category: 'salon',
              basePrice: 0,
              estimatedDuration: 30,
              image: '',
              isActive: true
            });
          }}
        >
          + Add New Service
        </button>
        <input
          type="text"
          placeholder="Search services..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="search-input"
        />
      </div>

      {selectedService ? (
        <div className="service-detail-view">
          <button 
            className="back-btn"
            onClick={() => {
              setSelectedService(null);
              setEditingService(null);
              setShowServiceForm(false);
            }}
          >
            ← Back to List
          </button>

          {editingService ? (
            <div className="service-edit-form">
              <h3>Edit Service</h3>
              <div className="form-group">
                <label>Service Name</label>
                <input
                  type="text"
                  value={editingService.name}
                  onChange={(e) => setEditingService({...editingService, name: e.target.value})}
                />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea
                  value={editingService.description}
                  onChange={(e) => setEditingService({...editingService, description: e.target.value})}
                  rows="3"
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Category</label>
                  <select
                    value={editingService.category}
                    onChange={(e) => setEditingService({...editingService, category: e.target.value})}
                  >
                    <option value="hair">Hair</option>
                    <option value="salon">Salon</option>
                    <option value="spa">Spa</option>
                    <option value="makeup">Makeup</option>
                    <option value="grooming">Grooming</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Base Price (₹)</label>
                  <input
                    type="number"
                    value={editingService.basePrice}
                    onChange={(e) => setEditingService({...editingService, basePrice: Number(e.target.value)})}
                  />
                </div>
                <div className="form-group">
                  <label>Duration (minutes)</label>
                  <input
                    type="number"
                    value={editingService.estimatedDuration}
                    onChange={(e) => setEditingService({...editingService, estimatedDuration: Number(e.target.value)})}
                  />
                </div>
              </div>
              <div className="form-group">
                <label>Active</label>
                <input
                  type="checkbox"
                  checked={editingService.isActive}
                  onChange={(e) => setEditingService({...editingService, isActive: e.target.checked})}
                />
              </div>
              <div className="form-group">
                <label>Service Image</label>
                <div className="image-upload-container">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleServiceImageChange}
                    className="image-input"
                  />
                  {(imagePreview || editingService.image) && (
                    <div className="image-preview">
                      <img src={imagePreview || editingService.image} alt="Service Preview" />
                    </div>
                  )}
                </div>
              </div>
              <div className="form-actions">
                <button className="btn-save" onClick={handleUpdateService}>Save Changes</button>
                <button className="btn-cancel" onClick={() => setEditingService(null)}>Cancel</button>
              </div>
            </div>
          ) : (
            <div className="service-detail-card">
              <h3>{selectedService.name}</h3>
              <div className="detail-row">
                <span className="label">Category:</span>
                <span className="badge">{selectedService.category}</span>
              </div>
              <div className="detail-row">
                <span className="label">Description:</span>
                <span>{selectedService.description}</span>
              </div>
              <div className="detail-row">
                <span className="label">Price:</span>
                <span>₹{selectedService.basePrice}</span>
              </div>
              <div className="detail-row">
                <span className="label">Duration:</span>
                <span>{selectedService.estimatedDuration} minutes</span>
              </div>
              <div className="detail-row">
                <span className="label">Status:</span>
                <span>{selectedService.isActive ? '✓ Active' : '✗ Inactive'}</span>
              </div>
              <div className="detail-row">
                <span className="label">Rating:</span>
                <span>⭐ {selectedService.rating} ({selectedService.reviewCount} reviews)</span>
              </div>
              <div className="detail-row">
                <span className="label">Most Booked:</span>
                <span>{selectedService.isMostBooked ? '✓ Yes' : '✗ No'}</span>
              </div>
              <div className="detail-actions">
                <button 
                  className="btn-edit"
                  onClick={() => setEditingService({...selectedService})}
                >
                  Edit Service
                </button>
                <button 
                  className={`btn-most-booked ${selectedService.isMostBooked ? 'active' : ''}`}
                  onClick={() => handleToggleMostBooked(selectedService._id)}
                  title={selectedService.isMostBooked ? 'Remove from Most Booked' : 'Add to Most Booked'}
                >
                  {selectedService.isMostBooked ? '⭐ Remove from Most Booked' : '☆ Add to Most Booked'}
                </button>
                <button 
                  className="btn-delete"
                  onClick={() => handleDeleteService(selectedService._id)}
                >
                  Delete Service
                </button>
              </div>
            </div>
          )}
        </div>
      ) : showServiceForm ? (
        <div className="service-form-view">
          <button 
            className="back-btn"
            onClick={() => {
              setShowServiceForm(false);
              setEditingService(null);
            }}
          >
            ← Cancel
          </button>
          <div className="service-create-form">
            <h3>Create New Service</h3>
            <div className="form-group">
              <label>Service Name</label>
              <input
                type="text"
                value={editingService?.name || ''}
                onChange={(e) => setEditingService({...editingService, name: e.target.value})}
                placeholder="e.g., Hair Spa Treatment"
              />
            </div>
            <div className="form-group">
              <label>Description</label>
              <textarea
                value={editingService?.description || ''}
                onChange={(e) => setEditingService({...editingService, description: e.target.value})}
                placeholder="Service description"
                rows="3"
              />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Category</label>
                <select
                  value={editingService?.category || 'salon'}
                  onChange={(e) => setEditingService({...editingService, category: e.target.value})}
                >
                  <option value="hair">Hair</option>
                  <option value="salon">Salon</option>
                  <option value="spa">Spa</option>
                  <option value="makeup">Makeup</option>
                  <option value="grooming">Grooming</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div className="form-group">
                <label>Base Price (₹)</label>
                <input
                  type="number"
                  value={editingService?.basePrice || 0}
                  onChange={(e) => setEditingService({...editingService, basePrice: Number(e.target.value)})}
                  placeholder="500"
                />
              </div>
              <div className="form-group">
                <label>Duration (minutes)</label>
                <input
                  type="number"
                  value={editingService?.estimatedDuration || 30}
                  onChange={(e) => setEditingService({...editingService, estimatedDuration: Number(e.target.value)})}
                  placeholder="30"
                />
              </div>
            </div>
            <div className="form-group">
              <label>Service Image</label>
              <div className="image-upload-container">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleServiceImageChange}
                  className="image-input"
                />
                {imagePreview && (
                  <div className="image-preview">
                    <img src={imagePreview} alt="Service Preview" />
                  </div>
                )}
              </div>
            </div>
            <div className="form-actions">
              <button className="btn-save" onClick={handleCreateService}>Create Service</button>
              <button className="btn-cancel" onClick={() => {
                setShowServiceForm(false);
                setEditingService(null);
              }}>Cancel</button>
            </div>
          </div>
        </div>
      ) : (
        <div className="services-table-container">
          <table className="services-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Category</th>
                <th>Price</th>
                <th>Duration</th>
                <th>Status</th>
                <th>Most Booked</th>
                <th>Rating</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredServices.length > 0 ? (
                filteredServices.map(service => (
                  <tr key={service._id}>
                    <td>{service.name}</td>
                    <td><span className="badge">{service.category}</span></td>
                    <td>₹{service.basePrice}</td>
                    <td>{service.estimatedDuration} min</td>
                    <td>{service.isActive ? '✓ Active' : '✗ Inactive'}</td>
                    <td>
                      <button 
                        className={`btn-most-booked-small ${service.isMostBooked ? 'active' : ''}`}
                        onClick={() => handleToggleMostBooked(service._id)}
                        title={service.isMostBooked ? 'Remove from Most Booked' : 'Add to Most Booked'}
                      >
                        {service.isMostBooked ? '⭐' : '☆'}
                      </button>
                    </td>
                    <td>⭐ {service.rating}</td>
                    <td>
                      <button 
                        className="btn-view"
                        onClick={() => setSelectedService(service)}
                      >
                        View
                      </button>
                      <button 
                        className="btn-delete-small"
                        onClick={() => handleDeleteService(service._id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="text-center">No services found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default AdminServicesSection;
