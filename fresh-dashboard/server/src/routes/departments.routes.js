import express from 'express';
import {
  getAllDepartments,
  getDepartmentById,
  createDepartment,
  updateDepartment,
  deleteDepartment,
  getDepartmentStats
} from '../controllers/departments.controller.js';
import { authenticateToken, authorizeRole } from '../middleware/auth.js';
import { departmentValidation, idValidation, validate } from '../middleware/validation.js';

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// GET routes
router.get('/', getAllDepartments);
router.get('/stats', getDepartmentStats);
router.get('/:id', idValidation, validate, getDepartmentById);

// POST routes (admin/manager only)
router.post('/', 
  authorizeRole('admin', 'manager'), 
  departmentValidation, 
  validate, 
  createDepartment
);

// PUT routes (admin/manager only)
router.put('/:id', 
  authorizeRole('admin', 'manager'), 
  idValidation, 
  departmentValidation, 
  validate, 
  updateDepartment
);

// DELETE routes (admin only)
router.delete('/:id', 
  authorizeRole('admin'), 
  idValidation, 
  validate, 
  deleteDepartment
);

export default router;