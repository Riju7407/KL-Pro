const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload');
const {
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
} = require('../controllers/adminController');
const {
  getAllServices,
  getServiceById,
  createService,
  updateService,
  deleteService,
  getServiceStatistics,
  toggleServiceStatus,
  toggleMostBooked
} = require('../controllers/serviceController');
const verifyAdminToken = require('../middleware/adminAuth');

// Debug middleware
router.use((req, res, next) => {
  console.log(`Admin route hit: ${req.method} ${req.path}`);
  console.log('Content-Type:', req.get('Content-Type'));
  console.log('Authorization header:', req.headers.authorization ? 'Present' : 'Missing');
  if (req.method === 'POST' || req.method === 'PUT') {
    console.log('Request body:', req.body);
    console.log('Request file:', req.file ? 'Present' : 'Not present');
  }
  next();
});

// Test route (no auth required)
router.get('/test', (req, res) => {
  res.json({ message: 'Admin router is working' });
});

// Public routes
router.post('/login', adminLogin);

// Protected routes
router.post('/logout', verifyAdminToken, adminLogout);
router.get('/profile', verifyAdminToken, getAdminProfile);

// User Management Routes (Admin only)
// Important: Specific routes must come before dynamic routes
router.get('/users/stats', verifyAdminToken, getUserStatistics);
router.get('/users', verifyAdminToken, getAllUsers);
router.get('/professionals/applications', verifyAdminToken, getProfessionalApplications);
router.patch('/professionals/:id/review', verifyAdminToken, reviewProfessionalApplication);
router.get('/users/:id', verifyAdminToken, getUserById);
router.put('/users/:id', verifyAdminToken, updateUser);
router.delete('/users/:id', verifyAdminToken, deleteUser);

// Service Management Routes (Admin only)
// Important: Specific routes must come before dynamic routes
router.get('/services/stats', verifyAdminToken, getServiceStatistics);
router.patch('/services/:id/toggle', verifyAdminToken, toggleServiceStatus);
router.patch('/services/:id/most-booked', verifyAdminToken, toggleMostBooked);
router.delete('/services/:id', verifyAdminToken, deleteService);
router.put('/services/:id', verifyAdminToken, upload.single('image'), updateService);
router.get('/services/:id', verifyAdminToken, getServiceById);
router.post('/services', verifyAdminToken, upload.single('image'), createService);
router.get('/services', verifyAdminToken, getAllServices);

module.exports = router;
