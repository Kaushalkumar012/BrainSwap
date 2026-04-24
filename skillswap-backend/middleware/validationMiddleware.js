const { body, validationResult, param, query } = require('express-validator');

/**
 * Validation Middleware
 * Provides centralized request validation using express-validator
 */

// Middleware to handle validation errors
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array().map((err) => ({
        field: err.path,
        message: err.msg,
      })),
    });
  }
  next();
};

// Auth validation rules
const authValidationRules = () => {
  return [
    body('email')
      .isEmail()
      .normalizeEmail()
      .withMessage('Valid email is required'),
    body('password')
      .isLength({ min: 8 })
      .withMessage('Password must be at least 8 characters long')
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
      .withMessage('Password must contain lowercase, uppercase, and number'),
    body('username')
      .optional()
      .isLength({ min: 3, max: 30 })
      .withMessage('Username must be between 3 and 30 characters')
      .matches(/^[a-zA-Z0-9_-]+$/)
      .withMessage('Username can only contain letters, numbers, underscores, and hyphens'),
  ];
};

// Profile validation rules
const profileValidationRules = () => {
  return [
    body('bio')
      .optional()
      .isLength({ max: 500 })
      .withMessage('Bio must not exceed 500 characters'),
    body('location')
      .optional()
      .isLength({ max: 100 })
      .withMessage('Location must not exceed 100 characters'),
    body('avatar_url')
      .optional()
      .isURL()
      .withMessage('Avatar URL must be a valid URL'),
  ];
};

// Skill validation rules
const skillValidationRules = () => {
  return [
    body('name')
      .notEmpty()
      .withMessage('Skill name is required')
      .isLength({ min: 2, max: 100 })
      .withMessage('Skill name must be between 2 and 100 characters'),
    body('proficiency_level')
      .notEmpty()
      .isIn(['beginner', 'intermediate', 'advanced', 'expert'])
      .withMessage('Proficiency level must be one of: beginner, intermediate, advanced, expert'),
    body('category')
      .notEmpty()
      .withMessage('Category is required')
      .isLength({ min: 2, max: 50 })
      .withMessage('Category must be between 2 and 50 characters'),
    body('description')
      .optional()
      .isLength({ max: 500 })
      .withMessage('Description must not exceed 500 characters'),
  ];
};

// Match validation rules
const matchValidationRules = () => {
  return [
    body('skill_id')
      .isInt({ min: 1 })
      .withMessage('Valid skill ID is required'),
    body('user_id')
      .isInt({ min: 1 })
      .withMessage('Valid user ID is required'),
    body('status')
      .optional()
      .isIn(['pending', 'accepted', 'rejected', 'completed'])
      .withMessage('Status must be one of: pending, accepted, rejected, completed'),
  ];
};

// Message validation rules
const messageValidationRules = () => {
  return [
    body('content')
      .notEmpty()
      .withMessage('Message content is required')
      .isLength({ min: 1, max: 5000 })
      .withMessage('Message must be between 1 and 5000 characters'),
    body('recipient_id')
      .isInt({ min: 1 })
      .withMessage('Valid recipient ID is required'),
  ];
};

// Rating validation rules
const ratingValidationRules = () => {
  return [
    body('skill_id')
      .isInt({ min: 1 })
      .withMessage('Valid skill ID is required'),
    body('rated_user_id')
      .isInt({ min: 1 })
      .withMessage('Valid user ID is required'),
    body('rating')
      .isInt({ min: 1, max: 5 })
      .withMessage('Rating must be between 1 and 5'),
    body('comment')
      .optional()
      .isLength({ max: 500 })
      .withMessage('Comment must not exceed 500 characters'),
  ];
};

// ID parameter validation
const idParamValidation = () => {
  return [
    param('id')
      .isInt({ min: 1 })
      .withMessage('Valid ID is required'),
  ];
};

// Pagination query validation
const paginationValidation = () => {
  return [
    query('page')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Page must be a positive integer'),
    query('limit')
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage('Limit must be between 1 and 100'),
  ];
};

module.exports = {
  handleValidationErrors,
  authValidationRules,
  profileValidationRules,
  skillValidationRules,
  matchValidationRules,
  messageValidationRules,
  ratingValidationRules,
  idParamValidation,
  paginationValidation,
};
