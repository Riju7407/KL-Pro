const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { getAdminSocketKey } = require('../realtime/presence');

const callAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization || '';
    let token = authHeader;

    if (authHeader.startsWith('Bearer ')) {
      token = authHeader.slice(7);
    }

    const normalizedToken = String(token || '').trim();
    if (!normalizedToken) {
      return res.status(401).json({ message: 'Authorization token is required' });
    }

    const decoded = jwt.verify(normalizedToken, process.env.JWT_SECRET || 'your_secret_key');

    if (decoded?.role === 'admin') {
      const adminSocketKey = getAdminSocketKey(decoded);
      if (!adminSocketKey) {
        return res.status(401).json({ message: 'Admin token is invalid' });
      }

      req.actor = {
        type: 'admin',
        email: decoded.email || '',
        adminId: decoded.adminId || '',
        role: 'admin',
        adminSocketKey,
      };
      return next();
    }

    if (!decoded?.id) {
      return res.status(401).json({ message: 'Token is not valid for user routes' });
    }

    const user = await User.findById(decoded.id).select('name email userType approvalStatus');
    if (!user) {
      return res.status(401).json({ message: 'User not found for this token' });
    }

    req.actor = {
      type: 'user',
      userId: String(user._id),
      name: user.name || '',
      email: user.email || '',
      userType: user.userType || 'customer',
      approvalStatus: user.approvalStatus || 'approved',
    };

    next();
  } catch (error) {
    return res.status(401).json({ message: 'Token is not valid' });
  }
};

module.exports = callAuth;
