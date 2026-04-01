const express = require('express');
const router = express.Router();
const Professional = require('../models/Professional');
const authMiddleware = require('../middleware/auth');

// Get all professionals
router.get('/', async (req, res) => {
  try {
    const professionals = await Professional.find().populate('userId', 'name email phone rating');
    res.json(professionals);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get professional by ID
router.get('/:id', async (req, res) => {
  try {
    const professional = await Professional.findById(req.params.id).populate('userId', 'name email phone');
    if (!professional) {
      return res.status(404).json({ message: 'Professional not found' });
    }
    res.json(professional);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create professional profile
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { specializations, experience, bio, services } = req.body;
    const professional = new Professional({
      userId: req.userId,
      specializations,
      experience,
      bio,
      services,
    });
    await professional.save();
    res.status(201).json(professional);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update professional profile
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const professional = await Professional.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!professional) {
      return res.status(404).json({ message: 'Professional not found' });
    }
    res.json(professional);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
