const express = require('express');
const router = express.Router();
const User = require('../models/User');
const authMiddleware = require('../middleware/auth');

// Get user profile
router.get('/profile', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.isDeleted) {
      return res.status(403).json({ message: 'This account has been deleted by admin.' });
    }

    if (user.userType === 'professional' && user.approvalStatus === 'rejected') {
      return res.status(403).json({
        message: 'Your professional account has been suspended. Please contact support.',
        approvalStatus: 'rejected',
      });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update user profile
router.put('/profile', authMiddleware, async (req, res) => {
  try {
    const { name, phone, address, city } = req.body;
    const existingUser = await User.findById(req.userId);
    if (!existingUser || existingUser.isDeleted) {
      return res.status(403).json({ message: 'This account has been deleted by admin.' });
    }

    const user = await User.findByIdAndUpdate(
      req.userId,
      { name, phone, address, city },
      { new: true, runValidators: true }
    );
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get all users (admin only)
router.get('/', authMiddleware, async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
