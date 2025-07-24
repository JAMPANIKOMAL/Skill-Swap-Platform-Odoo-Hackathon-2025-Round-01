import express from 'express';
import { body, validationResult } from 'express-validator';
import User from '../models/User.js';
import { generateToken } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { config } from '../config/index.js';
import nodemailer from 'nodemailer';
import crypto from 'crypto';

const router = express.Router();

// Register user
router.post('/register', [
  body('name').trim().isLength({ min: 2, max: 50 }).withMessage('Name must be between 2 and 50 characters'),
  body('email').isEmail().normalizeEmail().withMessage('Please provide a valid email'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('location').trim().notEmpty().withMessage('Location is required'),
  body('skillsOffered').isArray().withMessage('Skills offered must be an array'),
  body('skillsWanted').isArray().withMessage('Skills wanted must be an array'),
  body('bio').optional().isLength({ max: 500 }).withMessage('Bio cannot be more than 500 characters'),
  body('availability').optional().isIn(['Weekdays', 'Weekends', 'Evenings', 'Flexible', 'Weekdays & Evenings']).withMessage('Invalid availability option')
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ 
      success: false,
      errors: errors.array() 
    });
  }

  const { name, email, password, location, skillsOffered, skillsWanted, availability, bio } = req.body;

  // Check if user already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return res.status(400).json({
      success: false,
      error: 'User with this email already exists'
    });
  }

  // Create new user
  const user = new User({
    name,
    email,
    password,
    location,
    skillsOffered: skillsOffered || [],
    skillsWanted: skillsWanted || [],
    availability: availability || 'Flexible',
    bio: bio || ''
  });

  await user.save();

  // Generate token
  const token = generateToken(user._id);

  res.status(201).json({
    success: true,
    message: 'User registered successfully',
    data: {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        location: user.location,
        bio: user.bio,
        avatar: user.avatar,
        rating: user.averageRating,
        totalSwaps: user.totalSwaps,
        skillsOffered: user.skillsOffered,
        skillsWanted: user.skillsWanted,
        availability: user.availability,
        isOnline: user.isOnline
      },
      token
    }
  });
}));

// Login user
router.post('/login', [
  body('email').isEmail().normalizeEmail().withMessage('Please provide a valid email'),
  body('password').notEmpty().withMessage('Password is required')
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ 
      success: false,
      errors: errors.array() 
    });
  }

  const { email, password } = req.body;

  // Find user
  const user = await User.findOne({ email });
  if (!user) {
    return res.status(401).json({
      success: false,
      error: 'Invalid credentials'
    });
  }

  // Check password
  const isPasswordValid = await user.comparePassword(password);
  if (!isPasswordValid) {
    return res.status(401).json({
      success: false,
      error: 'Invalid credentials'
    });
  }

  // Update online status
  await user.updateOnlineStatus(true);

  // Generate token
  const token = generateToken(user._id);

  res.json({
    success: true,
    message: 'Login successful',
    data: {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        location: user.location,
        bio: user.bio,
        avatar: user.avatar,
        rating: user.averageRating,
        totalSwaps: user.totalSwaps,
        skillsOffered: user.skillsOffered,
        skillsWanted: user.skillsWanted,
        availability: user.availability,
        isOnline: user.isOnline
      },
      token
    }
  });
}));

// Get current user
router.get('/me', asyncHandler(async (req, res) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  
  if (!token) {
    return res.status(401).json({
      success: false,
      error: 'No token provided'
    });
  }

  try {
    const jwt = await import('jsonwebtoken');
    const decoded = jwt.default.verify(token, config.JWT_SECRET);
    const user = await User.findById(decoded.userId).select('-password');
    
    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'User not found'
      });
    }

    res.json({
      success: true,
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          location: user.location,
          avatar: user.avatar,
          rating: user.averageRating,
          totalSwaps: user.totalSwaps,
          skillsOffered: user.skillsOffered,
          skillsWanted: user.skillsWanted,
          availability: user.availability,
          isOnline: user.isOnline,
          bio: user.bio,
          preferences: user.preferences,
          socialLinks: user.socialLinks
        }
      }
    });
  } catch (error) {
    res.status(401).json({
      success: false,
      error: 'Invalid token'
    });
  }
}));

// Logout user
router.post('/logout', asyncHandler(async (req, res) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  
  if (token) {
    try {
      const jwt = await import('jsonwebtoken');
      const decoded = jwt.default.verify(token, config.JWT_SECRET);
      const user = await User.findById(decoded.userId);
      
      if (user) {
        await user.updateOnlineStatus(false);
      }
    } catch (error) {
      // Token might be invalid, but we still want to respond
    }
  }

  res.json({
    success: true,
    message: 'Logout successful'
  });
}));

// Refresh token
router.post('/refresh', asyncHandler(async (req, res) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  
  if (!token) {
    return res.status(401).json({
      success: false,
      error: 'No token provided'
    });
  }

  try {
    const jwt = await import('jsonwebtoken');
    const decoded = jwt.default.verify(token, config.JWT_SECRET);
    const user = await User.findById(decoded.userId).select('-password');
    
    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'User not found'
      });
    }

    // Generate new token
    const newToken = generateToken(user._id);

    res.json({
      success: true,
      data: {
        token: newToken,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          location: user.location,
          avatar: user.avatar,
          rating: user.averageRating,
          totalSwaps: user.totalSwaps,
          skillsOffered: user.skillsOffered,
          skillsWanted: user.skillsWanted,
          availability: user.availability,
          isOnline: user.isOnline
        }
      }
    });
  } catch (error) {
    res.status(401).json({
      success: false,
      error: 'Invalid token'
    });
  }
}));

// Update user profile
router.put('/profile', [
  body('name').optional().trim().isLength({ min: 2, max: 50 }).withMessage('Name must be between 2 and 50 characters'),
  body('location').optional().trim().notEmpty().withMessage('Location cannot be empty'),
  body('bio').optional().isLength({ max: 500 }).withMessage('Bio cannot be more than 500 characters'),
  body('skillsOffered').optional().isArray().withMessage('Skills offered must be an array'),
  body('skillsWanted').optional().isArray().withMessage('Skills wanted must be an array'),
  body('availability').optional().isIn(['Weekdays', 'Weekends', 'Evenings', 'Flexible', 'Weekdays & Evenings']).withMessage('Invalid availability option')
], asyncHandler(async (req, res) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  
  if (!token) {
    return res.status(401).json({
      success: false,
      error: 'No token provided'
    });
  }

  try {
    const jwt = await import('jsonwebtoken');
    const decoded = jwt.default.verify(token, config.JWT_SECRET);
    const user = await User.findById(decoded.userId);
    
    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'User not found'
      });
    }

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false,
        errors: errors.array() 
      });
    }

    const { name, location, bio, skillsOffered, skillsWanted, availability } = req.body;

    // Update fields if provided
    if (name !== undefined) user.name = name;
    if (location !== undefined) user.location = location;
    if (bio !== undefined) user.bio = bio;
    if (skillsOffered !== undefined) user.skillsOffered = skillsOffered;
    if (skillsWanted !== undefined) user.skillsWanted = skillsWanted;
    if (availability !== undefined) user.availability = availability;

    await user.save();

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          location: user.location,
          bio: user.bio,
          avatar: user.avatar,
          rating: user.averageRating,
          totalSwaps: user.totalSwaps,
          skillsOffered: user.skillsOffered,
          skillsWanted: user.skillsWanted,
          availability: user.availability,
          isOnline: user.isOnline
        }
      }
    });
  } catch (error) {
    res.status(401).json({
      success: false,
      error: 'Invalid token'
    });
  }
}));

// Forgot password - send reset link
router.post('/forgot-password', [
  body('email').isEmail().normalizeEmail().withMessage('Please provide a valid email'),
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }

  const { email } = req.body;
  const user = await User.findOne({ email });
  if (!user) {
    // For security, do not reveal if user exists
    return res.json({ success: true, message: 'If that email is registered, a reset link has been sent.' });
  }

  // Generate token
  const token = crypto.randomBytes(32).toString('hex');
  user.resetPasswordToken = token;
  user.resetPasswordExpires = Date.now() + 60 * 60 * 1000; // 1 hour
  await user.save();

  // Send email with reset link
  console.log('EMAIL_USER:', process.env.EMAIL_USER);
  console.log('EMAIL_PASS:', process.env.EMAIL_PASS ? '***' : undefined);
  const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password?token=${token}`;
  const transporter = nodemailer.createTransport({
    service: process.env.EMAIL_SERVICE || 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
  const mailOptions = {
    from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
    to: user.email,
    subject: 'Password Reset (Skill Swap Platform)',
    text: `You requested a password reset. Click the link below to set a new password:\n${resetUrl}\n\nIf you did not request this, please ignore this email.`
  };
  try {
    await transporter.sendMail(mailOptions);
  } catch (err) {
    console.error('Failed to send password reset email:', err);
  }

  res.json({ success: true, message: 'If that email is registered, a reset link has been sent.' });
}));

// Reset password with token
router.post('/reset-password', [
  body('token').notEmpty().withMessage('Token is required'),
  body('newPassword').isLength({ min: 6 }).withMessage('New password must be at least 6 characters'),
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }

  const { token, newPassword } = req.body;
  const user = await User.findOne({
    resetPasswordToken: token,
    resetPasswordExpires: { $gt: Date.now() }
  });
  if (!user) {
    return res.status(400).json({ success: false, error: 'Invalid or expired token' });
  }

  user.password = newPassword;
  user.resetPasswordToken = null;
  user.resetPasswordExpires = null;
  await user.save();

  res.json({ success: true, message: 'Password has been reset successfully.' });
}));

export default router; 