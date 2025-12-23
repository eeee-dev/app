import express from 'express';
import {
  getAllProjects,
  getProjectById,
  createProject,
  updateProject,
  deleteProject,
  getProjectStats
} from '../controllers/projects.controller.js';
import { authenticateToken, authorizeRole } from '../middleware/auth.js';
import { projectValidation, idValidation, validate } from '../middleware/validation.js';

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// GET routes
router.get('/', getAllProjects);
router.get('/stats', getProjectStats);
router.get('/:id', idValidation, validate, getProjectById);

// POST routes (admin/manager only)
router.post('/', 
  authorizeRole('admin', 'manager'), 
  projectValidation, 
  validate, 
  createProject
);

// PUT routes (admin/manager only)
router.put('/:id', 
  authorizeRole('admin', 'manager'), 
  idValidation, 
  projectValidation, 
  validate, 
  updateProject
);

// DELETE routes (admin only)
router.delete('/:id', 
  authorizeRole('admin'), 
  idValidation, 
  validate, 
  deleteProject
);

export default router;