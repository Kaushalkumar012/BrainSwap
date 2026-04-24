const jwt = require('jsonwebtoken');
const config = require('../config');
const logger = require('../utils/logger');
const { AppError } = require('./errorHandler');

/**
 * Authentication Middleware
 * Verifies JWT tokens and protects routes
 */

// Verify JWT token
const verifyToken = (req, res, next) => {
  try {
    // Get token from headers
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'No token provided',
      });
    }

    // Verify token
    const decoded = jwt.verify(token, config.jwt.secret);
    req.user = decoded;
    next();
  } catch (error) {
    logger.warn('Token verification failed:', error.message);

    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expired',
      });
    }

    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token',
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Token verification failed',
    });
  }
};

// Optional token verification (doesn't fail if no token)
const verifyTokenOptional = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (token) {
      const decoded = jwt.verify(token, config.jwt.secret);
      req.user = decoded;
    }

    next();
  } catch (error) {
    logger.warn('Optional token verification failed:', error.message);
    next(); // Continue even if token is invalid
  }
};

// Generate JWT token
const generateToken = (userId, email, username) => {
  return jwt.sign(
    {
      id: userId,
      email,
      username,
    },
    config.jwt.secret,
    {
      expiresIn: config.jwt.expiresIn,
      algorithm: config.jwt.algorithm,
    }
  );
};

// Verify user owns the resource
const verifyOwnership = (req, res, next) => {
  const userId = parseInt(req.params.id || req.body.user_id, 10);

  if (!req.user || req.user.id !== userId) {
    return res.status(403).json({
      success: false,
      message: 'You do not have permission to access this resource',
    });
  }

  next();
};

module.exports = {
  verifyToken,
  verifyTokenOptional,
  generateToken,
  verifyOwnership,
};
