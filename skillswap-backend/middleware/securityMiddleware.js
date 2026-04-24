const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

/**
 * Security Middleware Configuration
 * Provides:
 * - HTTP headers security (Helmet)
 * - Rate limiting on sensitive endpoints
 * - CORS handling
 */

// Helmet middleware for secure HTTP headers
const helmetMiddleware = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", 'data:', 'https:'],
    },
  },
  hsts: {
    maxAge: 31536000, // 1 year
    includeSubDomains: true,
    preload: true,
  },
  frameguard: { action: 'deny' },
  noSniff: true,
  xssFilter: true,
});

// Rate limiting for authentication endpoints (5 attempts per 15 minutes)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 requests per windowMs
  message: 'Too many login attempts, please try again later.',
  standardHeaders: true, // Return rate limit info in RateLimit-* headers
  legacyHeaders: false, // Disable X-RateLimit-* headers
  skip: (req) => process.env.NODE_ENV === 'test', // Skip rate limiting in tests
});

// Rate limiting for general API endpoints (100 requests per 15 minutes)
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => process.env.NODE_ENV === 'test',
});

// Rate limiting for WebSocket connections (20 connections per minute per IP)
const wsLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 20,
  message: 'Too many connection attempts, please try again later.',
  skip: (req) => process.env.NODE_ENV === 'test',
});

module.exports = {
  helmetMiddleware,
  authLimiter,
  apiLimiter,
  wsLimiter,
};
