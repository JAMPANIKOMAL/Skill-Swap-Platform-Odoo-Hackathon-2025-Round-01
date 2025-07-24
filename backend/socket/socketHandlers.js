import User from '../models/User.js';
import Message from '../models/Message.js';
import Swap from '../models/Swap.js';
import { config } from '../config/index.js';

// Store connected users
const connectedUsers = new Map();

export const setupSocketHandlers = (io, socket) => {
  console.log(`User connected: ${socket.id}`);

  // Handle user authentication
  socket.on('authenticate', async (data) => {
    try {
      const { token } = data;
      
      if (!token) {
        socket.emit('auth_error', { message: 'No token provided' });
        return;
      }

      const jwt = await import('jsonwebtoken');
      const decoded = jwt.default.verify(token, config.JWT_SECRET);
      
      const user = await User.findById(decoded.userId).select('-password');
      if (!user) {
        socket.emit('auth_error', { message: 'User not found' });
        return;
      }

      // Update user's online status
      await user.updateOnlineStatus(true);
      
      // Store user connection
      connectedUsers.set(socket.id, {
        userId: user._id.toString(),
        user: user
      });

      // Join user to their personal room
      socket.join(`user:${user._id}`);
      
      // Notify others that user is online
      socket.broadcast.emit('user_online', {
        userId: user._id,
        user: {
          id: user._id,
          name: user.name,
          avatar: user.avatar,
          isOnline: true
        }
      });

      socket.emit('authenticated', {
        message: 'Successfully authenticated',
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          avatar: user.avatar,
          isOnline: true
        }
      });

      console.log(`User authenticated: ${user.name} (${user._id})`);
    } catch (error) {
      console.error('Authentication error:', error);
      socket.emit('auth_error', { message: 'Invalid token' });
    }
  });

  // Handle joining chat room
  socket.on('join_chat', async (data) => {
    try {
      const { otherUserId } = data;
      const userData = connectedUsers.get(socket.id);
      
      if (!userData) {
        socket.emit('error', { message: 'Not authenticated' });
        return;
      }

      // Join the chat room for this conversation
      const roomId = getChatRoomId(userData.userId, otherUserId);
      socket.join(roomId);
      
      socket.emit('joined_chat', { roomId, otherUserId });
      console.log(`User joined chat room: ${roomId}`);
    } catch (error) {
      console.error('Join chat error:', error);
      socket.emit('error', { message: 'Failed to join chat' });
    }
  });

  // Handle sending message
  socket.on('send_message', async (data) => {
    try {
      const { recipientId, content, messageType = 'text', swapId, replyTo, attachments = [] } = data;
      const userData = connectedUsers.get(socket.id);
      
      if (!userData) {
        socket.emit('error', { message: 'Not authenticated' });
        return;
      }

      // Check if recipient exists
      const recipient = await User.findById(recipientId);
      if (!recipient) {
        socket.emit('error', { message: 'Recipient not found' });
        return;
      }

      // Create message in database
      const message = new Message({
        sender: userData.userId,
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

      // Emit to chat room
      const roomId = getChatRoomId(userData.userId, recipientId);
      io.to(roomId).emit('new_message', {
        message,
        roomId
      });

      // Emit to recipient's personal room for notification
      io.to(`user:${recipientId}`).emit('message_notification', {
        message: {
          id: message._id,
          content: message.content,
          sender: {
            id: message.sender._id,
            name: message.sender.name,
            avatar: message.sender.avatar
          },
          createdAt: message.createdAt
        }
      });

      console.log(`Message sent: ${userData.user.name} -> ${recipient.name}`);
    } catch (error) {
      console.error('Send message error:', error);
      socket.emit('error', { message: 'Failed to send message' });
    }
  });

  // Handle typing indicator
  socket.on('typing', (data) => {
    try {
      const { recipientId, isTyping } = data;
      const userData = connectedUsers.get(socket.id);
      
      if (!userData) return;

      const roomId = getChatRoomId(userData.userId, recipientId);
      socket.to(roomId).emit('user_typing', {
        userId: userData.userId,
        isTyping,
        roomId
      });
    } catch (error) {
      console.error('Typing indicator error:', error);
    }
  });

  // Handle swap request
  socket.on('swap_request', async (data) => {
    try {
      const { providerId, requestedSkill, offeredSkill, message, scheduledDate, location, duration, isRemote } = data;
      const userData = connectedUsers.get(socket.id);
      
      if (!userData) {
        socket.emit('error', { message: 'Not authenticated' });
        return;
      }

      // Create swap in database
      const swap = new Swap({
        requester: userData.userId,
        provider: providerId,
        requestedSkill,
        offeredSkill,
        message: message || '',
        scheduledDate: scheduledDate ? new Date(scheduledDate) : null,
        location: location || null,
        duration: duration || 60,
        isRemote: isRemote || false
      });

      await swap.save();

      // Populate user details
      await swap.populate('requester', 'name avatar location');
      await swap.populate('provider', 'name avatar location');

      // Emit to provider
      io.to(`user:${providerId}`).emit('swap_request_received', {
        swap,
        requester: {
          id: swap.requester._id,
          name: swap.requester.name,
          avatar: swap.requester.avatar
        }
      });

      // Emit to requester
      socket.emit('swap_request_sent', {
        swap,
        message: 'Swap request sent successfully'
      });

      console.log(`Swap request: ${userData.user.name} -> ${swap.provider.name}`);
    } catch (error) {
      console.error('Swap request error:', error);
      socket.emit('error', { message: 'Failed to send swap request' });
    }
  });

  // Handle swap response
  socket.on('swap_response', async (data) => {
    try {
      const { swapId, action, reason } = data;
      const userData = connectedUsers.get(socket.id);
      
      if (!userData) {
        socket.emit('error', { message: 'Not authenticated' });
        return;
      }

      const swap = await Swap.findById(swapId);
      if (!swap) {
        socket.emit('error', { message: 'Swap not found' });
        return;
      }

      // Check if user is the provider
      if (swap.provider.toString() !== userData.userId) {
        socket.emit('error', { message: 'Not authorized' });
        return;
      }

      let updatedSwap;
      if (action === 'accept') {
        await swap.accept();
        updatedSwap = swap;
      } else if (action === 'reject') {
        await swap.reject();
        updatedSwap = swap;
      }

      // Populate user details
      await updatedSwap.populate('requester', 'name avatar location');
      await updatedSwap.populate('provider', 'name avatar location');

      // Emit to requester
      io.to(`user:${swap.requester}`).emit('swap_response_received', {
        swap: updatedSwap,
        action,
        provider: {
          id: updatedSwap.provider._id,
          name: updatedSwap.provider.name,
          avatar: updatedSwap.provider.avatar
        }
      });

      // Emit to provider
      socket.emit('swap_response_sent', {
        swap: updatedSwap,
        action,
        message: `Swap ${action}ed successfully`
      });

      console.log(`Swap ${action}: ${userData.user.name} -> ${updatedSwap.requester.name}`);
    } catch (error) {
      console.error('Swap response error:', error);
      socket.emit('error', { message: 'Failed to respond to swap request' });
    }
  });

  // Handle user status updates
  socket.on('status_update', async (data) => {
    try {
      const { isOnline } = data;
      const userData = connectedUsers.get(socket.id);
      
      if (!userData) return;

      await userData.user.updateOnlineStatus(isOnline);

      // Notify others of status change
      socket.broadcast.emit('user_status_changed', {
        userId: userData.userId,
        isOnline,
        user: {
          id: userData.user._id,
          name: userData.user.name,
          avatar: userData.user.avatar
        }
      });
    } catch (error) {
      console.error('Status update error:', error);
    }
  });

  // Handle disconnect
  socket.on('disconnect', async () => {
    try {
      const userData = connectedUsers.get(socket.id);
      
      if (userData) {
        // Update user's online status
        await userData.user.updateOnlineStatus(false);
        
        // Notify others that user is offline
        socket.broadcast.emit('user_offline', {
          userId: userData.userId,
          user: {
            id: userData.user._id,
            name: userData.user.name,
            avatar: userData.user.avatar,
            isOnline: false
          }
        });

        // Remove from connected users
        connectedUsers.delete(socket.id);
        
        console.log(`User disconnected: ${userData.user.name} (${userData.userId})`);
      }
    } catch (error) {
      console.error('Disconnect error:', error);
    }
  });

  // Handle error
  socket.on('error', (error) => {
    console.error('Socket error:', error);
  });
};

// Helper function to generate chat room ID
const getChatRoomId = (userId1, userId2) => {
  const sortedIds = [userId1, userId2].sort();
  return `chat:${sortedIds[0]}:${sortedIds[1]}`;
};

// Export connected users for other modules
export { connectedUsers }; 