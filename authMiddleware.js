const jwt = require('jsonwebtoken');
const User = require('../models/User');
 
const authMiddleware = async (req, res, next) => {
  const token = req.header('Authorization');
  if (!token) {
    return res.status(401).json({ msg: 'Authentication failed: No Authorization header provided. Please log in again.' });
  }

  // Debug: Log token format
  if (!token.startsWith('Bearer ')) {
    console.warn(`[AUTH] Malformed token received from ${req.ip}`);
    return res.status(401).json({ msg: 'Authentication failed: Malformed token format.' });
  }

  try {
    const decoded = jwt.verify(token.replace('Bearer ', ''), process.env.JWT_SECRET);
    req.user = decoded;

    // Update last active - non-blocking
    User.findByIdAndUpdate(req.user.id, { lastActive: Date.now() }).catch(err => console.error('Error updating last active:', err));

    next();
  } catch (err) {
    res.status(401).json({ msg: 'Token is not valid' });
  }
};

const roleMiddleware = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !req.user.role) {
      return res.status(401).json({ msg: 'Unauthorized: User role not found. Please log in again.' });
    }

    const userRole = req.user.role.toLowerCase();
    const allowedRoles = roles.map(r => r.toLowerCase());

    if (!allowedRoles.includes(userRole)) {
      return res.status(403).json({ msg: `Access denied: This action requires one of the following roles: ${roles.join(', ')}` });
    }
    next();
  };
};



module.exports = { authMiddleware, roleMiddleware };
