const express = require('express');
const router = express.Router();
const Service = require('../models/Service');
const authMiddleware = require('../middleware/auth');

// Get all services
router.get('/', async (req, res) => {
  try {
    const { category } = req.query;
    const query = { isActive: true };
    if (category) {
      query.category = category;
    }
    const services = await Service.find(query);
    res.json(services);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get most booked services
router.get('/most-booked', async (req, res) => {
  try {
    const services = await Service.find({ isMostBooked: true, isActive: true }).sort({ createdAt: -1 });
    res.json(services);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get service by ID
router.get('/:id', async (req, res) => {
  try {
    const service = await Service.findById(req.params.id);
    if (!service) {
      return res.status(404).json({ message: 'Service not found' });
    }
    res.json(service);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create service (admin only)
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { name, description, category, subCategory, subSubCategory, serviceType, basePrice, estimatedDuration, image } = req.body;
    const service = new Service({
      name,
      description,
      category,
      subCategory,
      subSubCategory,
      serviceType,
      basePrice,
      estimatedDuration,
      image,
    });
    await service.save();
    res.status(201).json(service);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update service (admin only)
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const service = await Service.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!service) {
      return res.status(404).json({ message: 'Service not found' });
    }
    res.json(service);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete service (admin only)
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const service = await Service.findByIdAndDelete(req.params.id);
    if (!service) {
      return res.status(404).json({ message: 'Service not found' });
    }
    res.json({ message: 'Service deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
