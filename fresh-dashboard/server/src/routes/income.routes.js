import express from 'express';
import {
  getAllIncome,
  getIncomeById,
  createIncome,
  updateIncome,
  deleteIncome,
  getIncomeStats,
  updateIncomeStatus
} from '../controllers/income.controller.js';
import { authenticateToken, authorizeRole } from '../middleware/auth.js';
import { incomeValidation, idValidation, validate } from '../middleware/validation.js';

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// GET routes
router.get('/', getAllIncome);
router.get('/stats', getIncomeStats);
router.get('/:id', idValidation, validate, getIncomeById);

// POST routes
router.post('/', 
  incomeValidation, 
  validate, 
  createIncome
);

// PUT routes
router.put('/:id', 
  idValidation, 
  incomeValidation, 
  validate, 
  updateIncome
);

router.patch('/:id/status', 
  idValidation, 
  validate, 
  updateIncomeStatus
);

// DELETE routes (admin/manager only)
router.delete('/:id', 
  authorizeRole('admin', 'manager'), 
  idValidation, 
  validate, 
  deleteIncome
);

export default router;