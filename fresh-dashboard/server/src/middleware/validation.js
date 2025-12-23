import { body, param, query, validationResult } from 'express-validator';

// Validation result checker
export const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ 
      success: false,
      errors: errors.array() 
    });
  }
  next();
};

// Department validation rules
export const departmentValidation = [
  body('name')
    .trim()
    .notEmpty().withMessage('Department name is required')
    .isLength({ min: 2, max: 100 }).withMessage('Name must be 2-100 characters'),
  body('budget')
    .optional()
    .isFloat({ min: 0 }).withMessage('Budget must be a positive number'),
  body('manager')
    .optional()
    .trim()
    .isLength({ max: 100 }).withMessage('Manager name too long')
];

// Project validation rules
export const projectValidation = [
  body('name')
    .trim()
    .notEmpty().withMessage('Project name is required')
    .isLength({ min: 2, max: 200 }).withMessage('Name must be 2-200 characters'),
  body('code')
    .trim()
    .notEmpty().withMessage('Project code is required')
    .matches(/^[A-Z0-9-]+$/).withMessage('Code must contain only uppercase letters, numbers, and hyphens'),
  body('department_id')
    .notEmpty().withMessage('Department is required'),
  body('budget')
    .optional()
    .isFloat({ min: 0 }).withMessage('Budget must be a positive number'),
  body('start_date')
    .optional()
    .isISO8601().withMessage('Invalid start date format'),
  body('end_date')
    .optional()
    .isISO8601().withMessage('Invalid end date format')
    .custom((value, { req }) => {
      if (req.body.start_date && value < req.body.start_date) {
        throw new Error('End date must be after start date');
      }
      return true;
    })
];

// Expense validation rules
export const expenseValidation = [
  body('description')
    .trim()
    .notEmpty().withMessage('Description is required')
    .isLength({ min: 2, max: 500 }).withMessage('Description must be 2-500 characters'),
  body('amount')
    .notEmpty().withMessage('Amount is required')
    .isFloat({ min: 0.01 }).withMessage('Amount must be greater than 0'),
  body('category')
    .trim()
    .notEmpty().withMessage('Category is required'),
  body('date')
    .notEmpty().withMessage('Date is required')
    .isISO8601().withMessage('Invalid date format')
];

// Income validation rules
export const incomeValidation = [
  body('invoice_number')
    .trim()
    .notEmpty().withMessage('Invoice number is required'),
  body('client_name')
    .trim()
    .notEmpty().withMessage('Client name is required')
    .isLength({ min: 2, max: 200 }).withMessage('Client name must be 2-200 characters'),
  body('amount')
    .notEmpty().withMessage('Amount is required')
    .isFloat({ min: 0.01 }).withMessage('Amount must be greater than 0'),
  body('date')
    .notEmpty().withMessage('Date is required')
    .isISO8601().withMessage('Invalid date format'),
  body('client_email')
    .optional()
    .isEmail().withMessage('Invalid email format')
];

// User registration validation
export const registerValidation = [
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Invalid email format')
    .normalizeEmail(),
  body('password')
    .notEmpty().withMessage('Password is required')
    .isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/).withMessage('Password must contain uppercase, lowercase, and number'),
  body('full_name')
    .trim()
    .notEmpty().withMessage('Full name is required')
    .isLength({ min: 2, max: 100 }).withMessage('Name must be 2-100 characters'),
  body('role')
    .optional()
    .isIn(['admin', 'manager', 'accountant', 'viewer']).withMessage('Invalid role')
];

// Login validation
export const loginValidation = [
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Invalid email format')
    .normalizeEmail(),
  body('password')
    .notEmpty().withMessage('Password is required')
];

// ID parameter validation
export const idValidation = [
  param('id')
    .notEmpty().withMessage('ID is required')
    .isInt({ min: 1 }).withMessage('ID must be a positive integer')
];