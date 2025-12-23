import express from 'express';
import {
  getAllExpenses,
  getExpenseById,
  createExpense,
  updateExpense,
  deleteExpense,
  getExpenseStats,
  updateExpenseStatus
} from '../controllers/expenses.controller.js';
import { authenticateToken, authorizeRole } from '../middleware/auth.js';
import { expenseValidation, idValidation, validate } from '../middleware/validation.js';

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// GET routes
router.get('/', getAllExpenses);
router.get('/stats', getExpenseStats);
router.get('/:id', idValidation, validate, getExpenseById);

// POST routes
router.post('/', 
  expenseValidation, 
  validate, 
  createExpense
);

// PUT routes
router.put('/:id', 
  idValidation, 
  expenseValidation, 
  validate, 
  updateExpense
);

router.patch('/:id/status', 
  idValidation, 
  validate, 
  updateExpenseStatus
);

// DELETE routes (admin/manager only)
router.delete('/:id', 
  authorizeRole('admin', 'manager'), 
  idValidation, 
  validate, 
  deleteExpense
);

export default router;