const jwt = require('jsonwebtoken');
const User = require('../models/User');
const logger = require('../config/logger');

const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ error: 'Access denied. No token provided.' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    if (global.useMemoryDB) {
      const users = global.memoryDB.users;
      const user = users.get(decoded.id);
      
      if (!user) {
        return res.status(401).json({ error: 'Invalid token or user not found.' });
      }
      
      req.user = { id: user._id, username: user.username, email: user.email };
    } else {
      const user = await User.findById(decoded.id).select('-password');
      
      if (!user || !user.isActive) {
        return res.status(401).json({ error: 'Invalid token or user inactive.' });
      }
      
      req.user = user;
    }

    next();
  } catch (error) {
    logger.error('Auth middleware error:', error);
    res.status(401).json({ error: 'Invalid token.' });
  }
};

module.exports = auth;