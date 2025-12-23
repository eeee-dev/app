import bcrypt from 'bcryptjs';
import { executeQuery } from '../config/database.js';
import { generateToken, generateRefreshToken, verifyRefreshToken } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/errorHandler.js';

// Register new user
export const register = asyncHandler(async (req, res) => {
  const { email, password, full_name, role = 'viewer' } = req.body;

  // Check if user exists
  const existingUser = await executeQuery(
    'SELECT id FROM users WHERE email = ?',
    [email]
  );

  if (existingUser.length > 0) {
    return res.status(409).json({ 
      success: false, 
      error: 'User with this email already exists' 
    });
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(password, 10);

  // Create user
  const result = await executeQuery(
    `INSERT INTO users (email, password, full_name, role, created_at, updated_at) 
     VALUES (?, ?, ?, ?, NOW(), NOW())`,
    [email, hashedPassword, full_name, role]
  );

  const user = {
    id: result.insertId,
    email,
    full_name,
    role
  };

  const token = generateToken(user);
  const refreshToken = generateRefreshToken(user);

  res.status(201).json({
    success: true,
    message: 'User registered successfully',
    data: {
      user: {
        id: user.id,
        email: user.email,
        full_name: user.full_name,
        role: user.role
      },
      token,
      refreshToken
    }
  });
});

// Login user
export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // Find user
  const users = await executeQuery(
    'SELECT * FROM users WHERE email = ?',
    [email]
  );

  if (users.length === 0) {
    return res.status(401).json({ 
      success: false, 
      error: 'Invalid email or password' 
    });
  }

  const user = users[0];

  // Check password
  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!isPasswordValid) {
    return res.status(401).json({ 
      success: false, 
      error: 'Invalid email or password' 
    });
  }

  // Update last login
  await executeQuery(
    'UPDATE users SET last_login = NOW() WHERE id = ?',
    [user.id]
  );

  const token = generateToken(user);
  const refreshToken = generateRefreshToken(user);

  res.json({
    success: true,
    message: 'Login successful',
    data: {
      user: {
        id: user.id,
        email: user.email,
        full_name: user.full_name,
        role: user.role
      },
      token,
      refreshToken
    }
  });
});

// Logout user
export const logout = asyncHandler(async (req, res) => {
  // In a production app, you might want to blacklist the token
  res.json({
    success: true,
    message: 'Logout successful'
  });
});

// Refresh token
export const refreshToken = asyncHandler(async (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return res.status(400).json({ 
      success: false, 
      error: 'Refresh token required' 
    });
  }

  const decoded = verifyRefreshToken(refreshToken);

  // Get user
  const users = await executeQuery(
    'SELECT * FROM users WHERE id = ?',
    [decoded.id]
  );

  if (users.length === 0) {
    return res.status(404).json({ 
      success: false, 
      error: 'User not found' 
    });
  }

  const user = users[0];
  const newToken = generateToken(user);
  const newRefreshToken = generateRefreshToken(user);

  res.json({
    success: true,
    data: {
      token: newToken,
      refreshToken: newRefreshToken
    }
  });
});

// Get current user
export const getCurrentUser = asyncHandler(async (req, res) => {
  const users = await executeQuery(
    'SELECT id, email, full_name, role, created_at, last_login FROM users WHERE id = ?',
    [req.user.id]
  );

  if (users.length === 0) {
    return res.status(404).json({ 
      success: false, 
      error: 'User not found' 
    });
  }

  res.json({
    success: true,
    data: users[0]
  });
});

// Update profile
export const updateProfile = asyncHandler(async (req, res) => {
  const { full_name } = req.body;

  await executeQuery(
    'UPDATE users SET full_name = ?, updated_at = NOW() WHERE id = ?',
    [full_name, req.user.id]
  );

  res.json({
    success: true,
    message: 'Profile updated successfully'
  });
});

// Change password
export const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  // Get user
  const users = await executeQuery(
    'SELECT password FROM users WHERE id = ?',
    [req.user.id]
  );

  if (users.length === 0) {
    return res.status(404).json({ 
      success: false, 
      error: 'User not found' 
    });
  }

  // Verify current password
  const isPasswordValid = await bcrypt.compare(currentPassword, users[0].password);

  if (!isPasswordValid) {
    return res.status(401).json({ 
      success: false, 
      error: 'Current password is incorrect' 
    });
  }

  // Hash new password
  const hashedPassword = await bcrypt.hash(newPassword, 10);

  // Update password
  await executeQuery(
    'UPDATE users SET password = ?, updated_at = NOW() WHERE id = ?',
    [hashedPassword, req.user.id]
  );

  res.json({
    success: true,
    message: 'Password changed successfully'
  });
});