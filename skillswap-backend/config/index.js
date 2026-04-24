/**
 * Configuration Management
 * Centralized configuration for all environments
 */

const requiredEnvVars = [
  'PORT',
  'DB_HOST',
  'DB_PORT',
  'DB_USER',
  'DB_PASSWORD',
  'DB_NAME',
  'JWT_SECRET',
];

// Validate required environment variables
const missingVars = requiredEnvVars.filter((varName) => !process.env[varName]);
if (missingVars.length > 0 && process.env.NODE_ENV !== 'test') {
  console.error(`Missing required environment variables: ${missingVars.join(', ')}`);
  process.exit(1);
}

module.exports = {
  // Server
  PORT: process.env.PORT || 8080,
  NODE_ENV: process.env.NODE_ENV || 'development',
  
  // Database
  database: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT, 10) || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'root123',
    database: process.env.DB_NAME || 'skillswap',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
  },
  
  // JWT
  jwt: {
    secret: process.env.JWT_SECRET || 'default_secret_change_in_production',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    algorithm: 'HS256',
  },
  
  // Security
  security: {
    enableRateLimit: process.env.ENABLE_RATE_LIMIT !== 'false',
    enableHelmet: process.env.ENABLE_HELMET !== 'false',
    corsOrigin: process.env.CORS_ORIGIN || /^http:\/\/localhost(:\d+)?$/,
  },
  
  // Logging
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    format: process.env.LOG_FORMAT || 'json',
  },
  
  // Features
  features: {
    enableRealtime: process.env.ENABLE_REALTIME !== 'false',
    enableGamification: process.env.ENABLE_GAMIFICATION !== 'false',
  },
  
  // API
  api: {
    prefix: '/api',
    version: 'v1',
  },
  
  // Validators
  validators: {
    minPasswordLength: 8,
    maxUsernameLength: 30,
    minUsernameLength: 3,
    maxBioLength: 500,
  },
};
