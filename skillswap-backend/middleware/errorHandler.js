const logger = require('../utils/logger');

/**
 * Error Handler Middleware
 * Centralized error handling for all Express routes
 */

class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    Error.captureStackTrace(this, this.constructor);
  }
}

// Global error handler middleware
const errorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.message = err.message || 'Internal Server Error';

  // Log error with context
  logger.error({
    message: err.message,
    status: err.statusCode,
    method: req.method,
    path: req.path,
    stack: err.stack,
    userAgent: req.get('user-agent'),
    ip: req.ip,
  });

  // Duplicate key error (MongoDB/MySQL)
  if (err.code === 'ER_DUP_ENTRY' || err.code === 11000) {
    const statusCode = 409;
    const message = 'Duplicate field value entered';
    return res.status(statusCode).json({
      success: false,
      message,
      statusCode,
    });
  }

  // JSON Web Token error
  if (err.name === 'JsonWebTokenError') {
    const statusCode = 401;
    const message = 'Invalid token';
    return res.status(statusCode).json({
      success: false,
      message,
      statusCode,
    });
  }

  // JWT expired error
  if (err.name === 'TokenExpiredError') {
    const statusCode = 401;
    const message = 'Token expired';
    return res.status(statusCode).json({
      success: false,
      message,
      statusCode,
    });
  }

  // Wrong JWT secret error
  if (err.message === 'invalid signature') {
    const statusCode = 401;
    const message = 'Invalid token signature';
    return res.status(statusCode).json({
      success: false,
      message,
      statusCode,
    });
  }

  // Cast error (e.g., invalid ObjectId)
  if (err.name === 'CastError') {
    const statusCode = 400;
    const message = `Invalid ${err.path}`;
    return res.status(statusCode).json({
      success: false,
      message,
      statusCode,
    });
  }

  // Validation error
  if (err.name === 'ValidationError') {
    const statusCode = 400;
    const message = Object.values(err.errors)
      .map((val) => val.message)
      .join(', ');
    return res.status(statusCode).json({
      success: false,
      message,
      statusCode,
    });
  }

  // Generic error response
  return res.status(err.statusCode).json({
    success: false,
    message: err.message,
    statusCode: err.statusCode,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

// Async error wrapper - wraps async route handlers
const catchAsync = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = {
  AppError,
  errorHandler,
  catchAsync,
};
