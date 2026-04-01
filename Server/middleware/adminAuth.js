const jwt = require('jsonwebtoken');

const verifyAdminToken = (req, res, next) => {
  try {
    // Get token from header - handle both "Bearer token" and just "token"
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      return res.status(401).json({
        success: false,
        message: 'No authorization header provided'
      });
    }

    // Extract token (handle both "Bearer token" and "token" formats)
    let token = authHeader;
    if (authHeader.startsWith('Bearer ')) {
      token = authHeader.slice(7); // Remove "Bearer " prefix
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'No token provided'
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Check if token is for admin (check both 'role' and 'adminId' fields)
    if (decoded.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized as admin'
      });
    }

    // Attach admin data to request
    req.admin = decoded;
    next();
  } catch (error) {
    console.error('Admin token verification error:', error.message);
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expired. Please login again'
      });
    }

    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token'
      });
    }

    return res.status(401).json({
      success: false,
      message: 'Token verification failed',
      error: error.message
    });
  }
};

module.exports = verifyAdminToken;
