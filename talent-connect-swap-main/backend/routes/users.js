import express from 'express';
import { body, validationResult, query } from 'express-validator';
import User from '../models/User.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { optionalAuth, authMiddleware } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';

const router = express.Router();

// Public endpoint to get all users (for browsing)
router.get('/public', [
  query('search').optional().trim(),
  query('location').optional().trim(),
  query('skill').optional().trim(),
  query('availability').optional().isIn(['Weekdays', 'Weekends', 'Evenings', 'Flexible', 'Weekdays & Evenings']),
  query('rating').optional().isFloat({ min: 0, max: 5 }),
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 50 })
], optionalAuth, asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ 
      success: false,
      errors: errors.array() 
    });
  }

  const { 
    search, 
    location, 
    skill, 
    availability, 
    rating, 
    page = 1, 
    limit = 20 
  } = req.query;

  const skip = (page - 1) * limit;
  const query = {};

  // Search filter
  if (search) {
    query.$text = { $search: search };
  }

  // Location filter
  if (location) {
    query.location = { $regex: location, $options: 'i' };
  }

  // Skill filter
  if (skill) {
    query.$or = [
      { skillsOffered: { $regex: skill, $options: 'i' } },
      { skillsWanted: { $regex: skill, $options: 'i' } }
    ];
  }

  // Availability filter
  if (availability) {
    query.availability = availability;
  }

  // Rating filter
  if (rating) {
    query.rating = { $gte: parseFloat(rating) };
  }

  // Exclude current user from results if authenticated
  if (req.user) {
    query._id = { $ne: req.user._id };
  }

  const users = await User.find(query)
    .select('name avatar location bio rating totalRatings totalSwaps skillsOffered skillsWanted availability isOnline lastSeen')
    .sort({ isOnline: -1, lastSeen: -1 })
    .skip(skip)
    .limit(parseInt(limit))
    .lean();

  // Add averageRating to each user
  const usersWithAverageRating = users.map(user => ({
    ...user,
    id: user._id.toString(),
    averageRating: user.totalRatings > 0 ? parseFloat(user.rating.toFixed(1)) : 0.0
  }));

  const total = await User.countDocuments(query);

  res.json({
    success: true,
    data: {
      users: usersWithAverageRating,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    }
  });
}));

// Get all users with filters (authenticated)
router.get('/', [
  query('search').optional().trim(),
  query('location').optional().trim(),
  query('skill').optional().trim(),
  query('availability').optional().isIn(['Weekdays', 'Weekends', 'Evenings', 'Flexible', 'Weekdays & Evenings']),
  query('rating').optional().isFloat({ min: 0, max: 5 }),
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 50 })
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ 
      success: false,
      errors: errors.array() 
    });
  }

  const { 
    search, 
    location, 
    skill, 
    availability, 
    rating, 
    page = 1, 
    limit = 20 
  } = req.query;

  const skip = (page - 1) * limit;
  const query = {};

  // Search filter
  if (search) {
    query.$text = { $search: search };
  }

  // Location filter
  if (location) {
    query.location = { $regex: location, $options: 'i' };
  }

  // Skill filter
  if (skill) {
    query.$or = [
      { skillsOffered: { $regex: skill, $options: 'i' } },
      { skillsWanted: { $regex: skill, $options: 'i' } }
    ];
  }

  // Availability filter
  if (availability) {
    query.availability = availability;
  }

  // Rating filter
  if (rating) {
    query.rating = { $gte: parseFloat(rating) };
  }

  // Exclude current user from results
  if (req.user) {
    query._id = { $ne: req.user._id };
  }

  const users = await User.find(query)
    .select('name avatar location bio rating totalRatings totalSwaps skillsOffered skillsWanted availability isOnline lastSeen')
    .sort({ isOnline: -1, lastSeen: -1 })
    .skip(skip)
    .limit(parseInt(limit))
    .lean();

  // Add averageRating to each user
  const usersWithAverageRating = users.map(user => ({
    ...user,
    id: user._id.toString(),
    averageRating: user.totalRatings > 0 ? parseFloat(user.rating.toFixed(1)) : 0.0
  }));

  const total = await User.countDocuments(query);

  res.json({
    success: true,
    data: {
      users: usersWithAverageRating,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    }
  });
}));

// Get user by ID
router.get('/:id', asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id)
    .select('-password')
    .populate('socialLinks');

  if (!user) {
    return res.status(404).json({
      success: false,
      error: 'User not found'
    });
  }

  res.json({
    success: true,
    data: { user }
  });
}));

// Update user profile
router.put('/profile', [
  body('name').optional().trim().isLength({ min: 2, max: 50 }),
  body('location').optional().trim().notEmpty(),
  body('bio').optional().trim().isLength({ max: 500 }),
  body('skillsOffered').optional().isArray(),
  body('skillsWanted').optional().isArray(),
  body('availability').optional().isIn(['Weekdays', 'Weekends', 'Evenings', 'Flexible', 'Weekdays & Evenings']),
  body('preferences').optional().isObject(),
  body('socialLinks').optional().isObject()
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ 
      success: false,
      errors: errors.array() 
    });
  }

  const allowedUpdates = [
    'name', 'location', 'bio', 'skillsOffered', 'skillsWanted', 
    'availability', 'preferences', 'socialLinks'
  ];

  const updates = {};
  allowedUpdates.forEach(field => {
    if (req.body[field] !== undefined) {
      updates[field] = req.body[field];
    }
  });

  const user = await User.findByIdAndUpdate(
    req.user._id,
    updates,
    { new: true, runValidators: true }
  ).select('-password');

  res.json({
    success: true,
    message: 'Profile updated successfully',
    data: { user }
  });
}));

// Update avatar
router.put('/avatar', authMiddleware, upload.single('avatar'), asyncHandler(async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ 
      success: false,
      error: 'No file uploaded' 
    });
  }

  // Create the avatar URL using the proxy route
  const avatarUrl = `${req.protocol}://${req.get('host')}/api/images/${req.file.filename}`;

  const user = await User.findByIdAndUpdate(
    req.user._id,
    { avatar: avatarUrl },
    { new: true }
  ).select('-password');

  res.json({
    success: true,
    message: 'Avatar updated successfully',
    data: { user }
  });
}));

// Get user's swap history
router.get('/swaps/history', asyncHandler(async (req, res) => {
  const Swap = await import('../models/Swap.js');
  
  const swaps = await Swap.default.getUserSwaps(req.user._id);
  
  res.json({
    success: true,
    data: { swaps }
  });
}));

// Get user's pending swaps
router.get('/swaps/pending', asyncHandler(async (req, res) => {
  const Swap = await import('../models/Swap.js');
  
  const swaps = await Swap.default.getPendingSwaps(req.user._id);
  
  res.json({
    success: true,
    data: { swaps }
  });
}));

// Get user statistics
router.get('/stats/overview', asyncHandler(async (req, res) => {
  const Swap = await import('../models/Swap.js');
  const Message = await import('../models/Message.js');
  
  const [
    totalSwaps,
    completedSwaps,
    pendingSwaps,
    totalMessages,
    unreadMessages
  ] = await Promise.all([
    Swap.default.countDocuments({ 
      $or: [{ requester: req.user._id }, { recipient: req.user._id }] 
    }),
    Swap.default.countDocuments({ 
      $or: [{ requester: req.user._id }, { recipient: req.user._id }],
      status: 'completed'
    }),
    Swap.default.countDocuments({ 
      $or: [{ requester: req.user._id }, { recipient: req.user._id }],
      status: { $in: ['pending', 'accepted'] }
    }),
    Message.default.countDocuments({ 
      $or: [{ sender: req.user._id }, { recipient: req.user._id }] 
    }),
    Message.default.countDocuments({ 
      recipient: req.user._id,
      read: false
    })
  ]);

  res.json({
    success: true,
    data: {
      totalSwaps,
      completedSwaps,
      pendingSwaps,
      totalMessages,
      unreadMessages
    }
  });
}));

// Delete user account
router.delete('/account', asyncHandler(async (req, res) => {
  // Delete user's swaps
  const Swap = await import('../models/Swap.js');
  await Swap.default.deleteMany({
    $or: [{ requester: req.user._id }, { provider: req.user._id }]
  });

  // Delete user's messages
  const Message = await import('../models/Message.js');
  await Message.default.deleteMany({
    $or: [{ sender: req.user._id }, { recipient: req.user._id }]
  });

  // Delete user
  await User.findByIdAndDelete(req.user._id);

  res.json({
    success: true,
    message: 'Account deleted successfully'
  });
}));

export default router; 