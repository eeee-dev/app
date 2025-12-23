import express from 'express';
import { 
  register, 
  login, 
  logout, 
  refreshToken, 
  getCurrentUser,
  updateProfile,
  changePassword
} from '../controllers/auth.controller.js';
import { authenticateToken } from '../middleware/auth.js';
import { registerValidation, loginValidation, validate } from '../middleware/validation.js';

const router = express.Router();

// Public routes
router.post('/register', registerValidation, validate, register);
router.post('/login', loginValidation, validate, login);
router.post('/refresh-token', refreshToken);

// Protected routes
router.use(authenticateToken);
router.post('/logout', logout);
router.get('/me', getCurrentUser);
router.put('/profile', updateProfile);
router.put('/change-password', changePassword);

export default router;