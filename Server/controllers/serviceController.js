const Service = require('../models/Service');
const cloudinary = require('../config/cloudinary');

// Helper function to upload image to Cloudinary
const uploadImageToCloudinary = (fileBuffer) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: 'kl-services/services',
        resource_type: 'auto'
      },
      (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result.secure_url);
        }
      }
    );
    stream.end(fileBuffer);
  });
};

// Get all services (with filters)
const getAllServices = async (req, res) => {
  try {
    const { category, isActive } = req.query;
    const query = {};
    
    if (category) {
      query.category = category;
    }
    
    if (isActive !== undefined) {
      query.isActive = isActive === 'true';
    }

    const services = await Service.find(query).sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true,
      count: services.length,
      services: services
    });
  } catch (error) {
    console.error('Get all services error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching services',
      error: error.message
    });
  }
};

// Get service by ID
const getServiceById = async (req, res) => {
  try {
    const service = await Service.findById(req.params.id);

    if (!service) {
      return res.status(404).json({
        success: false,
        message: 'Service not found'
      });
    }

    res.status(200).json({
      success: true,
      service: service
    });
  } catch (error) {
    console.error('Get service error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching service',
      error: error.message
    });
  }
};

// Create new service
const createService = async (req, res) => {
  try {
    console.log('\n=== CREATE SERVICE DEBUG INFO ===');
    console.log('Full body object:', JSON.stringify(req.body));
    console.log('req.body keys:', Object.keys(req.body));
    console.log('req.body:', req.body);
    console.log('req.file:', req.file ? { filename: req.file.filename, mimetype: req.file.mimetype, size: req.file.size } : 'No file');
    console.log('req.headers:', req.headers);
    
    const { name, description, category, subCategory, subSubCategory, serviceType, basePrice, estimatedDuration } = req.body;
    
    console.log('Extracted values:', { name, description, category, basePrice, estimatedDuration });
    console.log('Types:', { 
      name: typeof name, 
      description: typeof description, 
      category: typeof category, 
      basePrice: typeof basePrice, 
      estimatedDuration: typeof estimatedDuration 
    });

    // Validate required fields - use undefined/null check instead of falsy check
    if (!name || !description || !category || basePrice === undefined || basePrice === '' || estimatedDuration === undefined || estimatedDuration === '') {
      console.log('Validation failed at: ', {
        name: !name ? 'Missing or empty' : 'OK',
        description: !description ? 'Missing or empty' : 'OK',
        category: !category ? 'Missing or empty' : 'OK',
        basePrice: (basePrice === undefined || basePrice === '') ? 'Missing or empty' : 'OK',
        estimatedDuration: (estimatedDuration === undefined || estimatedDuration === '') ? 'Missing or empty' : 'OK'
      });
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields',
        received: { name, description, category, basePrice, estimatedDuration }
      });
    }

    // Parse numeric fields from FormData (they come as strings)
    const parsedBasePrice = Number(basePrice);
    const parsedDuration = Number(estimatedDuration);

    if (isNaN(parsedBasePrice) || isNaN(parsedDuration)) {
      return res.status(400).json({
        success: false,
        message: 'basePrice and estimatedDuration must be valid numbers'
      });
    }

    let imageUrl = null;

    // Upload image to Cloudinary if file provided
    if (req.file) {
      try {
        imageUrl = await uploadImageToCloudinary(req.file.buffer);
      } catch (uploadError) {
        console.error('Cloudinary upload error:', uploadError);
        return res.status(400).json({
          success: false,
          message: 'Failed to upload image',
          error: uploadError.message
        });
      }
    }

    const service = new Service({
      name,
      description,
      category,
      subCategory: subCategory || '',
      subSubCategory: subSubCategory || '',
      serviceType: serviceType || '',
      basePrice: parsedBasePrice,
      estimatedDuration: parsedDuration,
      image: imageUrl
    });

    await service.save();

    res.status(201).json({
      success: true,
      message: 'Service created successfully',
      service: service
    });
  } catch (error) {
    console.error('Create service error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error creating service',
      error: error.message
    });
  }
};

// Update service
const updateService = async (req, res) => {
  try {
    const {
      name,
      description,
      category,
      subCategory,
      subSubCategory,
      serviceType,
      basePrice,
      estimatedDuration,
      isActive,
      rating,
      reviewCount,
      image,
    } = req.body;
    
    // Find the current service to get existing image
    const existingService = await Service.findById(req.params.id);
    if (!existingService) {
      return res.status(404).json({
        success: false,
        message: 'Service not found'
      });
    }

    // Parse numeric fields from FormData (they come as strings)
    const parsedBasePrice = basePrice ? Number(basePrice) : existingService.basePrice;
    const parsedDuration = estimatedDuration ? Number(estimatedDuration) : existingService.estimatedDuration;
    const parsedRating = rating ? Number(rating) : existingService.rating;
    const parsedReviewCount = reviewCount ? Number(reviewCount) : existingService.reviewCount;

    if (isNaN(parsedBasePrice) || isNaN(parsedDuration)) {
      return res.status(400).json({
        success: false,
        message: 'basePrice and estimatedDuration must be valid numbers'
      });
    }

    let imageUrl = image || existingService.image;

    // Upload new image to Cloudinary if file provided
    if (req.file) {
      try {
        imageUrl = await uploadImageToCloudinary(req.file.buffer);
      } catch (uploadError) {
        console.error('Cloudinary upload error:', uploadError);
        return res.status(400).json({
          success: false,
          message: 'Failed to upload image',
          error: uploadError.message
        });
      }
    }

    const service = await Service.findByIdAndUpdate(
      req.params.id,
      {
        name,
        description,
        category,
        subCategory: subCategory || '',
        subSubCategory: subSubCategory || '',
        serviceType: serviceType || '',
        basePrice: parsedBasePrice,
        estimatedDuration: parsedDuration,
        image: imageUrl,
        isActive,
        rating: parsedRating,
        reviewCount: parsedReviewCount
      },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: 'Service updated successfully',
      service: service
    });
  } catch (error) {
    console.error('Update service error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error updating service',
      error: error.message
    });
  }
};

// Delete service
const deleteService = async (req, res) => {
  try {
    const service = await Service.findByIdAndDelete(req.params.id);

    if (!service) {
      return res.status(404).json({
        success: false,
        message: 'Service not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Service deleted successfully'
    });
  } catch (error) {
    console.error('Delete service error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error deleting service',
      error: error.message
    });
  }
};

// Get service statistics
const getServiceStatistics = async (req, res) => {
  try {
    const totalServices = await Service.countDocuments();
    const activeServices = await Service.countDocuments({ isActive: true });
    const inactiveServices = await Service.countDocuments({ isActive: false });
    
    // Get top rated services
    const topRatedServices = await Service.find()
      .sort({ rating: -1 })
      .limit(5);
    
    // Get most reviewed services
    const mostReviewedServices = await Service.find()
      .sort({ reviewCount: -1 })
      .limit(5);

    res.status(200).json({
      success: true,
      statistics: {
        totalServices,
        activeServices,
        inactiveServices,
        topRatedServices,
        mostReviewedServices
      }
    });
  } catch (error) {
    console.error('Get service statistics error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching statistics',
      error: error.message
    });
  }
};

// Toggle service active status
const toggleServiceStatus = async (req, res) => {
  try {
    const service = await Service.findById(req.params.id);

    if (!service) {
      return res.status(404).json({
        success: false,
        message: 'Service not found'
      });
    }

    service.isActive = !service.isActive;
    await service.save();

    res.status(200).json({
      success: true,
      message: `Service ${service.isActive ? 'activated' : 'deactivated'} successfully`,
      service: service
    });
  } catch (error) {
    console.error('Toggle service status error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error toggling service status',
      error: error.message
    });
  }
};

// Toggle most booked status
const toggleMostBooked = async (req, res) => {
  try {
    const service = await Service.findById(req.params.id);

    if (!service) {
      return res.status(404).json({
        success: false,
        message: 'Service not found'
      });
    }

    service.isMostBooked = !service.isMostBooked;
    await service.save();

    res.status(200).json({
      success: true,
      message: `Service ${service.isMostBooked ? 'marked as' : 'unmarked from'} most booked successfully`,
      service: service
    });
  } catch (error) {
    console.error('Toggle most booked error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error toggling most booked status',
      error: error.message
    });
  }
};

// Get most booked services
const getMostBookedServices = async (req, res) => {
  try {
    const mostBookedServices = await Service.find({ 
      isMostBooked: true, 
      isActive: true 
    }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: mostBookedServices.length,
      services: mostBookedServices
    });
  } catch (error) {
    console.error('Get most booked services error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching most booked services',
      error: error.message
    });
  }
};

module.exports = {
  getAllServices,
  getServiceById,
  createService,
  updateService,
  deleteService,
  getServiceStatistics,
  toggleServiceStatus,
  toggleMostBooked,
  getMostBookedServices
};
