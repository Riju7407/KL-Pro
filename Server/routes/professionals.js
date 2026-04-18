const express = require('express');
const router = express.Router();
const Professional = require('../models/Professional');
const authMiddleware = require('../middleware/auth');

// Get all professionals
router.get('/', async (req, res) => {
  try {
    const professionals = await Professional.find({
      $or: [{ approvalStatus: 'approved' }, { approvalStatus: { $exists: false } }],
      isBlocked: false,
    }).populate('userId', 'name email phone rating approvalStatus');
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
    const {
      specializations,
      experience,
      bio,
      services,
      category,
      subCategory,
      panCardNumber,
      aadhaarCardNumber,
      panCardImageUrl,
      aadhaarCardImageUrl,
    } = req.body;

    if (
      !category ||
      !subCategory ||
      !panCardNumber ||
      !aadhaarCardNumber ||
      !panCardImageUrl ||
      !aadhaarCardImageUrl
    ) {
      return res.status(400).json({
        message:
          'Category, subcategory, PAN, Aadhaar, PAN image and Aadhaar image are required for professionals',
      });
    }

    const professional = new Professional({
      userId: req.userId,
      specializations,
      experience,
      bio,
      services,
      category,
      subCategory,
      panCardNumber,
      panCardImageUrl,
      aadhaarCardNumber,
      aadhaarCardImageUrl,
      approvalStatus: 'pending',
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
