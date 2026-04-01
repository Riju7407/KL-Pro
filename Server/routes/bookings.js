const express = require('express');
const router = express.Router();
const Booking = require('../models/Booking');
const authMiddleware = require('../middleware/auth');

// Get user bookings
router.get('/', authMiddleware, async (req, res) => {
  try {
    const bookings = await Booking.find({ customerId: req.userId })
      .populate('professionalId', 'userId')
      .populate('serviceId', 'name basePrice')
      .sort({ createdAt: -1 });
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get booking by ID
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('customerId', 'name email phone')
      .populate('professionalId', 'userId')
      .populate('serviceId', 'name');
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }
    res.json(booking);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create booking
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { professionalId, serviceId, scheduledDate, scheduledTime, serviceAddress, price, notes } =
      req.body;
    const booking = new Booking({
      customerId: req.userId,
      professionalId,
      serviceId,
      scheduledDate,
      scheduledTime,
      serviceAddress,
      price,
      notes,
    });
    await booking.save();
    res.status(201).json(booking);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update booking status
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const { status, rating, review, paymentStatus } = req.body;
    const booking = await Booking.findByIdAndUpdate(
      req.params.id,
      { status, rating, review, paymentStatus },
      { new: true, runValidators: true }
    );
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }
    res.json(booking);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Cancel booking
router.post('/:id/cancel', authMiddleware, async (req, res) => {
  try {
    const booking = await Booking.findByIdAndUpdate(
      req.params.id,
      { status: 'cancelled' },
      { new: true }
    );
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }
    res.json({ message: 'Booking cancelled', booking });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
