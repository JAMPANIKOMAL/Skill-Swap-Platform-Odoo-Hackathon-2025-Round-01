import express from 'express';
import { body, validationResult, query } from 'express-validator';
import Swap from '../models/Swap.js';
import User from '../models/User.js';
import { asyncHandler } from '../middleware/errorHandler.js';

const router = express.Router();

// Create a new swap request
router.post('/', [
  body('providerId').isMongoId().withMessage('Valid provider ID is required'),
  body('requestedSkill').trim().notEmpty().withMessage('Requested skill is required'),
  body('offeredSkill').trim().notEmpty().withMessage('Offered skill is required'),
  body('message').optional().trim().isLength({ max: 1000 }),
  body('scheduledDate').optional().isISO8601().withMessage('Valid date format required'),
  body('location').optional().trim(),
  body('duration').optional().isInt({ min: 15, max: 480 }).withMessage('Duration must be between 15 and 480 minutes'),
  body('isRemote').optional().isBoolean()
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ 
      success: false,
      errors: errors.array() 
    });
  }

  const {
    providerId,
    requestedSkill,
    offeredSkill,
    message,
    scheduledDate,
    location,
    duration = 60,
    isRemote = false
  } = req.body;

  // Check if provider exists
  const provider = await User.findById(providerId);
  if (!provider) {
    return res.status(404).json({
      success: false,
      error: 'Provider not found'
    });
  }

  // Check if requester is trying to swap with themselves
  if (req.user._id.toString() === providerId) {
    return res.status(400).json({
      success: false,
      error: 'Cannot create swap with yourself'
    });
  }

  // Check if provider has the requested skill
  if (!provider.skillsOffered.some(skill => 
    skill.toLowerCase().includes(requestedSkill.toLowerCase())
  )) {
    return res.status(400).json({
      success: false,
      error: 'Provider does not offer the requested skill'
    });
  }

  // Check if requester has the offered skill
  if (!req.user.skillsOffered.some(skill => 
    skill.toLowerCase().includes(offeredSkill.toLowerCase())
  )) {
    return res.status(400).json({
      success: false,
      error: 'You do not offer the skill you are trying to swap'
    });
  }

  // Check if there's already a pending swap between these users
  const existingSwap = await Swap.findOne({
    $or: [
      { requester: req.user._id, provider: providerId },
      { requester: providerId, provider: req.user._id }
    ],
    status: 'pending'
  });

  if (existingSwap) {
    return res.status(400).json({
      success: false,
      error: 'There is already a pending swap request between you and this user'
    });
  }

  // Create the swap
  const swap = new Swap({
    requester: req.user._id,
    provider: providerId,
    requestedSkill,
    offeredSkill,
    message: message || '',
    scheduledDate: scheduledDate ? new Date(scheduledDate) : null,
    location: location || null,
    duration,
    isRemote
  });

  await swap.save();

  // Populate user details for response
  await swap.populate('requester', 'name avatar location');
  await swap.populate('provider', 'name avatar location');

  res.status(201).json({
    success: true,
    message: 'Swap request created successfully',
    data: { swap }
  });
}));

// Get user's swaps
router.get('/', [
  query('status').optional().isIn(['pending', 'accepted', 'rejected', 'completed', 'cancelled']),
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

  const { status, page = 1, limit = 20 } = req.query;
  const skip = (page - 1) * limit;

  const swaps = await Swap.getUserSwaps(req.user._id, status)
    .skip(skip)
    .limit(parseInt(limit));

  const total = await Swap.countDocuments({
    $or: [{ requester: req.user._id }, { provider: req.user._id }],
    ...(status && { status })
  });

  res.json({
    success: true,
    data: {
      swaps,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    }
  });
}));

// Get swap by ID
router.get('/:id', asyncHandler(async (req, res) => {
  const swap = await Swap.findById(req.params.id)
    .populate('requester', 'name avatar location')
    .populate('provider', 'name avatar location')
    .populate('cancelledBy', 'name');

  if (!swap) {
    return res.status(404).json({
      success: false,
      error: 'Swap not found'
    });
  }

  // Check if user is part of this swap
  if (swap.requester._id.toString() !== req.user._id.toString() && 
      swap.provider._id.toString() !== req.user._id.toString()) {
    return res.status(403).json({
      success: false,
      error: 'Access denied'
    });
  }

  res.json({
    success: true,
    data: { swap }
  });
}));

// Accept swap
router.put('/:id/accept', asyncHandler(async (req, res) => {
  const swap = await Swap.findById(req.params.id);

  if (!swap) {
    return res.status(404).json({
      success: false,
      error: 'Swap not found'
    });
  }

  // Check if user is the provider
  if (swap.provider.toString() !== req.user._id.toString()) {
    return res.status(403).json({
      success: false,
      error: 'Only the provider can accept a swap'
    });
  }

  // Check if swap is pending
  if (swap.status !== 'pending') {
    return res.status(400).json({
      success: false,
      error: 'Swap is not in pending status'
    });
  }

  await swap.accept();

  // Populate user details for response
  await swap.populate('requester', 'name avatar location');
  await swap.populate('provider', 'name avatar location');

  res.json({
    success: true,
    message: 'Swap accepted successfully',
    data: { swap }
  });
}));

// Reject swap
router.put('/:id/reject', [
  body('reason').optional().trim().isLength({ max: 200 })
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ 
      success: false,
      errors: errors.array() 
    });
  }

  const swap = await Swap.findById(req.params.id);

  if (!swap) {
    return res.status(404).json({
      success: false,
      error: 'Swap not found'
    });
  }

  // Check if user is the provider
  if (swap.provider.toString() !== req.user._id.toString()) {
    return res.status(403).json({
      success: false,
      error: 'Only the provider can reject a swap'
    });
  }

  // Check if swap is pending
  if (swap.status !== 'pending') {
    return res.status(400).json({
      success: false,
      error: 'Swap is not in pending status'
    });
  }

  await swap.reject();

  // Populate user details for response
  await swap.populate('requester', 'name avatar location');
  await swap.populate('provider', 'name avatar location');

  res.json({
    success: true,
    message: 'Swap rejected successfully',
    data: { swap }
  });
}));

// Complete swap
router.put('/:id/complete', asyncHandler(async (req, res) => {
  const swap = await Swap.findById(req.params.id);

  if (!swap) {
    return res.status(404).json({
      success: false,
      error: 'Swap not found'
    });
  }

  // Check if user is part of this swap
  if (swap.requester.toString() !== req.user._id.toString() && 
      swap.provider.toString() !== req.user._id.toString()) {
    return res.status(403).json({
      success: false,
      error: 'Access denied'
    });
  }

  // Check if swap is accepted
  if (swap.status !== 'accepted') {
    return res.status(400).json({
      success: false,
      error: 'Swap must be accepted before completion'
    });
  }

  await swap.complete();

  // Update user swap counts
  const requester = await User.findById(swap.requester);
  const provider = await User.findById(swap.provider);
  
  if (requester) {
    requester.totalSwaps += 1;
    await requester.save();
  }
  
  if (provider) {
    provider.totalSwaps += 1;
    await provider.save();
  }

  // Populate user details for response
  await swap.populate('requester', 'name avatar location');
  await swap.populate('provider', 'name avatar location');

  res.json({
    success: true,
    message: 'Swap completed successfully',
    data: { swap }
  });
}));

// Cancel swap
router.put('/:id/cancel', [
  body('reason').optional().trim().isLength({ max: 200 })
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ 
      success: false,
      errors: errors.array() 
    });
  }

  const swap = await Swap.findById(req.params.id);

  if (!swap) {
    return res.status(404).json({
      success: false,
      error: 'Swap not found'
    });
  }

  // Check if user is part of this swap
  if (swap.requester.toString() !== req.user._id.toString() && 
      swap.provider.toString() !== req.user._id.toString()) {
    return res.status(403).json({
      success: false,
      error: 'Access denied'
    });
  }

  // Check if swap can be cancelled
  if (!['pending', 'accepted'].includes(swap.status)) {
    return res.status(400).json({
      success: false,
      error: 'Swap cannot be cancelled in its current status'
    });
  }

  await swap.cancel(req.user._id, req.body.reason);

  // Populate user details for response
  await swap.populate('requester', 'name avatar location');
  await swap.populate('provider', 'name avatar location');
  await swap.populate('cancelledBy', 'name');

  res.json({
    success: true,
    message: 'Swap cancelled successfully',
    data: { swap }
  });
}));

// Rate swap
router.post('/:id/rate', [
  body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
  body('review').optional().trim().isLength({ max: 500 })
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ 
      success: false,
      errors: errors.array() 
    });
  }

  const swap = await Swap.findById(req.params.id);

  if (!swap) {
    return res.status(404).json({
      success: false,
      error: 'Swap not found'
    });
  }

  // Check if user is part of this swap
  if (swap.requester.toString() !== req.user._id.toString() && 
      swap.provider.toString() !== req.user._id.toString()) {
    return res.status(403).json({
      success: false,
      error: 'Access denied'
    });
  }

  // Check if swap is completed
  if (swap.status !== 'completed') {
    return res.status(400).json({
      success: false,
      error: 'Can only rate completed swaps'
    });
  }

  const isRequester = swap.requester.toString() === req.user._id.toString();
  
  // Check if user has already rated
  if (isRequester && swap.requesterRating !== null) {
    return res.status(400).json({
      success: false,
      error: 'You have already rated this swap'
    });
  }
  
  if (!isRequester && swap.providerRating !== null) {
    return res.status(400).json({
      success: false,
      error: 'You have already rated this swap'
    });
  }

  await swap.addRating(req.body.rating, req.body.review, isRequester);

  // Update the other user's rating
  const otherUserId = isRequester ? swap.provider : swap.requester;
  const otherUser = await User.findById(otherUserId);
  if (otherUser) {
    await otherUser.updateRating(req.body.rating);
  }

  // Populate user details for response
  await swap.populate('requester', 'name avatar location');
  await swap.populate('provider', 'name avatar location');

  res.json({
    success: true,
    message: 'Rating submitted successfully',
    data: { swap }
  });
}));

export default router; 