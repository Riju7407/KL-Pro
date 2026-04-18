const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Professional = require('../models/Professional');
const authMiddleware = require('../middleware/auth');
const upload = require('../middleware/upload');
const cloudinary = require('../config/cloudinary');

const uploadImageToCloudinary = (fileBuffer, folderName) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: folderName,
        resource_type: 'auto',
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

// Register
router.post(
  '/register',
  upload.fields([
    { name: 'panCardImage', maxCount: 1 },
    { name: 'aadhaarCardImage', maxCount: 1 },
  ]),
  async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      city,
      phone,
      userType,
      professionalCategory,
      professionalSubCategory,
      panCardNumber,
      aadhaarCardNumber,
      experience,
      bio,
    } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email and password are required' });
    }

    const normalizedUserType = userType || 'customer';

    // Check if user exists
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    user = new User({
      name,
      email,
      password: hashedPassword,
      city,
      phone,
      userType: normalizedUserType,
      approvalStatus: normalizedUserType === 'professional' ? 'pending' : 'approved',
      approvalNote: normalizedUserType === 'professional' ? 'Awaiting admin approval' : '',
    });

    await user.save();

    if (normalizedUserType === 'professional') {
      const panCardImageFile = req.files?.panCardImage?.[0];
      const aadhaarCardImageFile = req.files?.aadhaarCardImage?.[0];

      if (!professionalCategory || !professionalSubCategory || !panCardNumber || !aadhaarCardNumber) {
        await User.findByIdAndDelete(user._id);
        return res.status(400).json({
          message: 'Professional category, subcategory, PAN card and Aadhaar card are required',
        });
      }

      if (!panCardImageFile || !aadhaarCardImageFile) {
        await User.findByIdAndDelete(user._id);
        return res.status(400).json({
          message: 'PAN card image and Aadhaar card image are required',
        });
      }

      let panCardImageUrl = '';
      let aadhaarCardImageUrl = '';

      try {
        panCardImageUrl = await uploadImageToCloudinary(
          panCardImageFile.buffer,
          'kl-services/professionals/pan-cards'
        );
        aadhaarCardImageUrl = await uploadImageToCloudinary(
          aadhaarCardImageFile.buffer,
          'kl-services/professionals/aadhaar-cards'
        );
      } catch (uploadError) {
        await User.findByIdAndDelete(user._id);
        return res.status(400).json({
          message: 'Failed to upload PAN/Aadhaar images',
          error: uploadError.message,
        });
      }

      const professional = new Professional({
        userId: user._id,
        specializations: [professionalSubCategory],
        category: professionalCategory,
        subCategory: professionalSubCategory,
        panCardNumber: String(panCardNumber).trim().toUpperCase(),
        panCardImageUrl,
        aadhaarCardNumber: String(aadhaarCardNumber).trim(),
        aadhaarCardImageUrl,
        experience: Number(experience) > 0 ? Number(experience) : 1,
        bio: bio || '',
        approvalStatus: 'pending',
        approvalNote: 'Awaiting admin approval',
      });

      await professional.save();

      return res.status(201).json({
        success: true,
        requiresApproval: true,
        message: 'Professional registration submitted. You can login after admin approval.',
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          userType: user.userType,
          approvalStatus: user.approvalStatus,
        },
      });
    }

    // Create JWT token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET || 'your_secret_key', {
      expiresIn: '7d',
    });

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        userType: user.userType,
        approvalStatus: user.approvalStatus,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}
);

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const normalizedEmail = String(email).trim().toLowerCase();
    const normalizedAdminEmail = String(process.env.ADMIN_EMAIL || '').trim().toLowerCase();
    const normalizedPassword = String(password).trim();
    const normalizedAdminPassword = String(process.env.ADMIN_PASSWORD || '').trim();

    // Unified login: allow admin credentials through the same login form.
    if (
      normalizedEmail === normalizedAdminEmail &&
      normalizedPassword === normalizedAdminPassword
    ) {
      const adminToken = jwt.sign(
        {
          adminId: 'admin_001',
          email: normalizedAdminEmail,
          role: 'admin',
        },
        process.env.JWT_SECRET || 'your_secret_key',
        {
          expiresIn: process.env.JWT_EXPIRY || '7d',
        }
      );

      return res.json({
        success: true,
        token: adminToken,
        user: {
          id: 'admin_001',
          name: 'Admin',
          email: normalizedAdminEmail,
          userType: 'admin',
          approvalStatus: 'approved',
        },
      });
    }

    // Check if user exists
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    if (user.userType === 'professional' && ['pending', 'rejected'].includes(user.approvalStatus)) {
      const statusLabel = user.approvalStatus || 'pending';
      return res.status(403).json({
        success: false,
        message:
          statusLabel === 'rejected'
            ? 'Your professional account was rejected by admin. Please contact support.'
            : 'Your professional account is pending admin approval.',
        approvalStatus: statusLabel,
      });
    }

    // Compare password
    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Create JWT token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET || 'your_secret_key', {
      expiresIn: '7d',
    });

    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        userType: user.userType,
        approvalStatus: user.approvalStatus,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Logout (client-side token removal, can also be used to blacklist tokens if needed)
router.post('/logout', authMiddleware, (req, res) => {
  try {
    res.json({
      success: true,
      message: 'Logout successful'
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
