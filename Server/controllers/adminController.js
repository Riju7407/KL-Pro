const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Professional = require('../models/Professional');

// Admin Login
const adminLogin = (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
    }

    // Check credentials against environment variables
    if (email !== process.env.ADMIN_EMAIL || password !== process.env.ADMIN_PASSWORD) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Create JWT token with 7 day expiry
    const token = jwt.sign(
      {
        adminId: 'admin_001',
        email: email,
        role: 'admin'
      },
      process.env.JWT_SECRET,
      {
        expiresIn: process.env.JWT_EXPIRY || '7d'
      }
    );

    res.status(200).json({
      success: true,
      message: 'Login successful',
      token: token,
      admin: {
        email: email,
        role: 'admin'
      }
    });
  } catch (error) {
    console.error('Admin login error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during login',
      error: error.message
    });
  }
};

// Admin Logout
const adminLogout = (req, res) => {
  try {
    res.status(200).json({
      success: true,
      message: 'Logout successful'
    });
  } catch (error) {
    console.error('Admin logout error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during logout',
      error: error.message
    });
  }
};

// Get Admin Profile
const getAdminProfile = (req, res) => {
  try {
    res.status(200).json({
      success: true,
      admin: {
        email: req.admin.email,
        role: req.admin.role
      }
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching profile',
      error: error.message
    });
  }
};

// Get All Users
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.status(200).json({
      success: true,
      count: users.length,
      users: users
    });
  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching users',
      error: error.message
    });
  }
};

// Get User by ID
const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    res.status(200).json({
      success: true,
      user: user
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching user',
      error: error.message
    });
  }
};

// Update User
const updateUser = async (req, res) => {
  try {
    const { name, email, phone, address, city, userType, isVerified } = req.body;
    
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { name, email, phone, address, city, userType, isVerified },
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'User updated successfully',
      user: user
    });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error updating user',
      error: error.message
    });
  }
};

// Delete User
const deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error deleting user',
      error: error.message
    });
  }
};

// Get User Statistics
const getUserStatistics = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const customers = await User.countDocuments({ userType: 'customer' });
    const professionals = await User.countDocuments({ userType: 'professional' });
    const verifiedUsers = await User.countDocuments({ isVerified: true });

    res.status(200).json({
      success: true,
      statistics: {
        totalUsers,
        customers,
        professionals,
        verifiedUsers,
        unverifiedUsers: totalUsers - verifiedUsers
      }
    });
  } catch (error) {
    console.error('Get statistics error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching statistics',
      error: error.message
    });
  }
};

// Get professional applications for admin review
const getProfessionalApplications = async (req, res) => {
  try {
    const { status } = req.query;
    const filter = {};

    if (status && ['pending', 'approved', 'rejected'].includes(status)) {
      filter.approvalStatus = status;
    }

    const applications = await Professional.find(filter)
      .populate('userId', 'name email phone city userType approvalStatus isVerified')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: applications.length,
      applications,
    });
  } catch (error) {
    console.error('Get professional applications error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching professional applications',
      error: error.message,
    });
  }
};

// Approve or reject professional application
const reviewProfessionalApplication = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, note } = req.body;

    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Status must be approved or rejected',
      });
    }

    const professional = await Professional.findById(id);
    if (!professional) {
      return res.status(404).json({
        success: false,
        message: 'Professional application not found',
      });
    }

    professional.approvalStatus = status;
    professional.approvalNote = note || '';
    professional.reviewedByAdminEmail = req.admin?.email || '';
    professional.reviewedAt = new Date();
    await professional.save();

    const userUpdate = {
      approvalStatus: status,
      approvalNote: note || '',
      isVerified: status === 'approved',
    };

    const user = await User.findByIdAndUpdate(professional.userId, userUpdate, {
      new: true,
      runValidators: true,
    }).select('-password');

    res.status(200).json({
      success: true,
      message: `Professional application ${status} successfully`,
      professional,
      user,
    });
  } catch (error) {
    console.error('Review professional application error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error reviewing professional application',
      error: error.message,
    });
  }
};

module.exports = {
  adminLogin,
  adminLogout,
  getAdminProfile,
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  getUserStatistics,
  getProfessionalApplications,
  reviewProfessionalApplication,
};
