import { io } from 'socket.io-client';

class SocketService {
  constructor() {
    this.socket = null;
    this.isConnected = false;
    this.eventListeners = new Map();
  }

  // Connect to WebSocket server
  connect(token = null) {
    if (this.socket && this.isConnected) {
      return Promise.resolve();
    }

    return new Promise((resolve, reject) => {
      try {
        // Get the current frontend URL to determine the correct WebSocket URL
        const frontendUrl = window.location.origin;
        const backendUrl = frontendUrl.replace(/:\d+/, ':5000'); // Replace frontend port with backend port
        
        console.log(`🔗 Connecting to WebSocket at: ${backendUrl}`);
        
        this.socket = io(backendUrl, {
          transports: ['websocket', 'polling'],
          autoConnect: true,
        });

        // Connection events
        this.socket.on('connect', () => {
          console.log('WebSocket connected');
          this.isConnected = true;
          
          // Authenticate if token is provided
          if (token) {
            this.authenticate(token);
          }
          
          resolve();
        });

        this.socket.on('disconnect', () => {
          console.log('WebSocket disconnected');
          this.isConnected = false;
        });

        this.socket.on('connect_error', (error) => {
          console.error('WebSocket connection error:', error);
          this.isConnected = false;
          reject(error);
        });

        // Authentication events
        this.socket.on('authenticated', (data) => {
          console.log('WebSocket authenticated:', data);
          this.emit('authenticated', data);
        });

        this.socket.on('auth_error', (error) => {
          console.error('WebSocket authentication error:', error);
          this.emit('auth_error', error);
        });

        // Message events
        this.socket.on('new_message', (data) => {
          console.log('New message received:', data);
          this.emit('new_message', data);
        });

        this.socket.on('message_notification', (data) => {
          console.log('Message notification:', data);
          this.emit('message_notification', data);
        });

        this.socket.on('user_typing', (data) => {
          this.emit('user_typing', data);
        });

        // Swap events
        this.socket.on('swap_request_received', (data) => {
          console.log('Swap request received:', data);
          this.emit('swap_request_received', data);
        });

        this.socket.on('swap_request_sent', (data) => {
          console.log('Swap request sent:', data);
          this.emit('swap_request_sent', data);
        });

        this.socket.on('swap_response_received', (data) => {
          console.log('Swap response received:', data);
          this.emit('swap_response_received', data);
        });

        this.socket.on('swap_response_sent', (data) => {
          console.log('Swap response sent:', data);
          this.emit('swap_response_sent', data);
        });

        // User status events
        this.socket.on('user_online', (data) => {
          console.log('User online:', data);
          this.emit('user_online', data);
        });

        this.socket.on('user_offline', (data) => {
          console.log('User offline:', data);
          this.emit('user_offline', data);
        });

        this.socket.on('user_status_changed', (data) => {
          this.emit('user_status_changed', data);
        });

        // Error events
        this.socket.on('error', (error) => {
          console.error('WebSocket error:', error);
          this.emit('error', error);
        });

      } catch (error) {
        console.error('Failed to connect to WebSocket:', error);
        reject(error);
      }
    });
  }

  // Disconnect from WebSocket server
  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
      this.eventListeners.clear();
    }
  }

  // Authenticate with JWT token
  authenticate(token) {
    if (this.socket && this.isConnected) {
      this.socket.emit('authenticate', { token });
    }
  }

  // Join chat room
  joinChat(otherUserId) {
    if (this.socket && this.isConnected) {
      this.socket.emit('join_chat', { otherUserId });
    }
  }

  // Send message
  sendMessage(messageData) {
    if (this.socket && this.isConnected) {
      this.socket.emit('send_message', messageData);
    }
  }

  // Send typing indicator
  sendTyping(recipientId, isTyping) {
    if (this.socket && this.isConnected) {
      this.socket.emit('typing', { recipientId, isTyping });
    }
  }

  // Send swap request
  sendSwapRequest(swapData) {
    if (this.socket && this.isConnected) {
      this.socket.emit('swap_request', swapData);
    }
  }

  // Send swap response
  sendSwapResponse(swapId, action, reason = '') {
    if (this.socket && this.isConnected) {
      this.socket.emit('swap_response', { swapId, action, reason });
    }
  }

  // Update user status
  updateStatus(isOnline) {
    if (this.socket && this.isConnected) {
      this.socket.emit('status_update', { isOnline });
    }
  }

  // Event listener management
  on(event, callback) {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, []);
    }
    this.eventListeners.get(event).push(callback);
  }

  off(event, callback) {
    if (this.eventListeners.has(event)) {
      const listeners = this.eventListeners.get(event);
      const index = listeners.indexOf(callback);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    }
  }

  emit(event, data) {
    if (this.eventListeners.has(event)) {
      this.eventListeners.get(event).forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`Error in event listener for ${event}:`, error);
        }
      });
    }
  }

  // Get connection status
  getConnectionStatus() {
    return {
      isConnected: this.isConnected,
      socketId: this.socket?.id,
    };
  }
}

// Create singleton instance
const socketService = new SocketService();

export default socketService; 