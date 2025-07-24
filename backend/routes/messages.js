import express from 'express';
import { body, validationResult, query } from 'express-validator';
import Message from '../models/Message.js';
import User from '../models/User.js';
import { asyncHandler } from '../middleware/errorHandler.js';

const router = express.Router();

// Get conversations list
router.get('/conversations', asyncHandler(async (req, res) => {
  const conversations = await Message.getRecentConversations(req.user._id);
  
  // Populate user details for each conversation
  const populatedConversations = await Promise.all(
    conversations.map(async (conv) => {
      const otherUser = await User.findById(conv._id).select('name avatar location isOnline lastSeen');
      return {
        ...conv,
        otherUser
      };
    })
  );

  res.json({
    success: true,
    data: { conversations: populatedConversations }
  });
}));

// Get conversation with specific user
router.get('/conversation/:userId', [
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 })
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ 
      success: false,
      errors: errors.array() 
    });
  }

  const { userId } = req.params;
  const { page = 1, limit = 50 } = req.query;
  const skip = (page - 1) * limit;

  // Check if other user exists
  const otherUser = await User.findById(userId).select('name avatar location isOnline lastSeen');
  if (!otherUser) {
    return res.status(404).json({
      success: false,
      error: 'User not found'
    });
  }

  // Get messages
  const messages = await Message.getConversation(req.user._id, userId, parseInt(limit), skip);
  
  // Mark messages as read
  await Message.updateMany(
    {
      sender: userId,
      recipient: req.user._id,
      isRead: false
    },
    { isRead: true, readAt: new Date() }
  );

  res.json({
    success: true,
    data: {
      messages: messages.reverse(), // Show oldest first
      otherUser,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit)
      }
    }
  });
}));

// Send message
router.post('/', [
  body('recipientId').isMongoId().withMessage('Valid recipient ID is required'),
  body('content').trim().notEmpty().withMessage('Message content is required'),
  body('content').isLength({ max: 1000 }).withMessage('Message cannot be more than 1000 characters'),
  body('messageType').optional().isIn(['text', 'image', 'file', 'swap_request', 'swap_response']),
  body('swapId').optional().isMongoId(),
  body('replyTo').optional().isMongoId(),
  body('attachments').optional().isArray()
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ 
      success: false,
      errors: errors.array() 
    });
  }

  const {
    recipientId,
    content,
    messageType = 'text',
    swapId,
    replyTo,
    attachments = []
  } = req.body;

  // Check if recipient exists
  const recipient = await User.findById(recipientId);
  if (!recipient) {
    return res.status(404).json({
      success: false,
      error: 'Recipient not found'
    });
  }

  // Check if user is trying to message themselves
  if (req.user._id.toString() === recipientId) {
    return res.status(400).json({
      success: false,
      error: 'Cannot send message to yourself'
    });
  }

  // Check if replyTo message exists and belongs to the conversation
  if (replyTo) {
    const replyMessage = await Message.findById(replyTo);
    if (!replyMessage || 
        (replyMessage.sender.toString() !== req.user._id.toString() && 
         replyMessage.recipient.toString() !== req.user._id.toString()) ||
        (replyMessage.sender.toString() !== recipientId && 
         replyMessage.recipient.toString() !== recipientId)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid reply message'
      });
    }
  }

  // Create message
  const message = new Message({
    sender: req.user._id,
    recipient: recipientId,
    content,
    messageType,
    swapId: swapId || null,
    replyTo: replyTo || null,
    attachments
  });

  await message.save();

  // Populate sender and recipient details
  await message.populate('sender', 'name avatar');
  await message.populate('recipient', 'name avatar');
  if (replyTo) {
    await message.populate('replyTo', 'content sender');
  }

  res.status(201).json({
    success: true,
    message: 'Message sent successfully',
    data: { message }
  });
}));

// Mark messages as read
router.put('/read/:userId', asyncHandler(async (req, res) => {
  const { userId } = req.params;

  // Check if user exists
  const otherUser = await User.findById(userId);
  if (!otherUser) {
    return res.status(404).json({
      success: false,
      error: 'User not found'
    });
  }

  // Mark all messages from this user as read
  const result = await Message.updateMany(
    {
      sender: userId,
      recipient: req.user._id,
      isRead: false
    },
    { isRead: true, readAt: new Date() }
  );

  res.json({
    success: true,
    message: 'Messages marked as read',
    data: { updatedCount: result.modifiedCount }
  });
}));

// Get unread message count
router.get('/unread/count', asyncHandler(async (req, res) => {
  const count = await Message.getUnreadCount(req.user._id);

  res.json({
    success: true,
    data: { unreadCount: count }
  });
}));

// Delete message
router.delete('/:messageId', asyncHandler(async (req, res) => {
  const message = await Message.findById(req.params.messageId);

  if (!message) {
    return res.status(404).json({
      success: false,
      error: 'Message not found'
    });
  }

  // Check if user is the sender
  if (message.sender.toString() !== req.user._id.toString()) {
    return res.status(403).json({
      success: false,
      error: 'Can only delete your own messages'
    });
  }

  await Message.findByIdAndDelete(req.params.messageId);

  res.json({
    success: true,
    message: 'Message deleted successfully'
  });
}));

// Search messages
router.get('/search', [
  query('q').trim().notEmpty().withMessage('Search query is required'),
  query('userId').optional().isMongoId(),
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

  const { q, userId, page = 1, limit = 20 } = req.query;
  const skip = (page - 1) * limit;

  const query = {
    $or: [
      { sender: req.user._id },
      { recipient: req.user._id }
    ],
    content: { $regex: q, $options: 'i' }
  };

  // Filter by specific user if provided
  if (userId) {
    query.$and = [
      {
        $or: [
          { sender: userId },
          { recipient: userId }
        ]
      }
    ];
  }

  const messages = await Message.find(query)
    .populate('sender', 'name avatar')
    .populate('recipient', 'name avatar')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit));

  const total = await Message.countDocuments(query);

  res.json({
    success: true,
    data: {
      messages,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    }
  });
}));

export default router; 