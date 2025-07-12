// Get the current frontend URL to determine the correct backend URL
const getBackendUrl = () => {
  const frontendUrl = window.location.origin;
  return frontendUrl.replace(/:\d+/, ':5000'); // Replace frontend port with backend port
};

const API_BASE_URL = `${getBackendUrl()}/api`;

// Helper function to handle API responses
const handleResponse = async (response) => {
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'API request failed');
  }
  return response.json();
};

// Helper function to get auth headers
const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` })
  };
};

// Helper function to check if user is authenticated
const isAuthenticated = () => {
  return !!localStorage.getItem('token');
};

// Authentication API
export const authAPI = {
  // Register new user
  register: async (userData) => {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });
    return handleResponse(response);
  },

  // Login user
  login: async (credentials) => {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    });
    return handleResponse(response);
  },

  // Get current user
  getCurrentUser: async () => {
    const response = await fetch(`${API_BASE_URL}/auth/me`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  // Logout user
  logout: async () => {
    const response = await fetch(`${API_BASE_URL}/auth/logout`, {
      method: 'POST',
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  // Refresh token
  refreshToken: async () => {
    const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
      method: 'POST',
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  // Update user profile
  updateProfile: async (profileData) => {
    const response = await fetch(`${API_BASE_URL}/auth/profile`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(profileData),
    });
    return handleResponse(response);
  },

  // Reset password with token
  resetPassword: async ({ token, newPassword }) => {
    const response = await fetch(`${API_BASE_URL}/auth/reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, newPassword }),
    });
    return handleResponse(response);
  },

  // Forgot password (send reset link)
  forgotPassword: async ({ email }) => {
    const response = await fetch(`${API_BASE_URL}/auth/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
    return handleResponse(response);
  },
};

// Users API
export const usersAPI = {
  // Get all users with filters (uses public endpoint if not authenticated)
  getUsers: async (filters = {}) => {
    const endpoint = isAuthenticated() ? '/users' : '/users/public';
    const params = new URLSearchParams(filters);
    const response = await fetch(`${API_BASE_URL}${endpoint}?${params}`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  // Get user by ID
  getUser: async (userId) => {
    const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  // Update user profile
  updateProfile: async (profileData) => {
    const response = await fetch(`${API_BASE_URL}/users/profile`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(profileData),
    });
    return handleResponse(response);
  },

  // Update user avatar
  updateAvatar: async (file) => {
    const formData = new FormData();
    formData.append('avatar', file);
    
    const headers = getAuthHeaders();
    // Remove Content-Type header to let browser set it with boundary for FormData
    delete headers['Content-Type'];
    
    const response = await fetch(`${API_BASE_URL}/users/avatar`, {
      method: 'PUT',
      headers,
      body: formData,
    });
    return handleResponse(response);
  },

  // Get user statistics
  getUserStats: async () => {
    const response = await fetch(`${API_BASE_URL}/users/stats/overview`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },
};

// Skills API
export const skillsAPI = {
  // Get skill categories
  getCategories: async () => {
    const response = await fetch(`${API_BASE_URL}/skills/categories`);
    return handleResponse(response);
  },

  // Get popular skills
  getPopularSkills: async () => {
    const response = await fetch(`${API_BASE_URL}/skills/popular`);
    return handleResponse(response);
  },

  // Search skills
  searchSkills: async (query, category = null, limit = 20) => {
    const params = new URLSearchParams({ q: query, limit });
    if (category) params.append('category', category);
    
    const response = await fetch(`${API_BASE_URL}/skills/search?${params}`);
    return handleResponse(response);
  },

  // Get users by skill
  getUsersBySkill: async (skill, filters = {}) => {
    const params = new URLSearchParams(filters);
    const response = await fetch(`${API_BASE_URL}/skills/users/${encodeURIComponent(skill)}?${params}`);
    return handleResponse(response);
  },

  // Get skill statistics
  getSkillStats: async (skill) => {
    const response = await fetch(`${API_BASE_URL}/skills/stats/${encodeURIComponent(skill)}`);
    return handleResponse(response);
  },
};

// Swaps API
export const swapsAPI = {
  // Create swap request
  createSwap: async (swapData) => {
    const response = await fetch(`${API_BASE_URL}/swaps`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(swapData),
    });
    return handleResponse(response);
  },

  // Get user's swaps
  getUserSwaps: async (filters = {}) => {
    const params = new URLSearchParams(filters);
    const response = await fetch(`${API_BASE_URL}/swaps?${params}`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  // Get swap by ID
  getSwap: async (swapId) => {
    const response = await fetch(`${API_BASE_URL}/swaps/${swapId}`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  // Accept swap
  acceptSwap: async (swapId) => {
    const response = await fetch(`${API_BASE_URL}/swaps/${swapId}/accept`, {
      method: 'PUT',
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  // Reject swap
  rejectSwap: async (swapId, reason = '') => {
    const response = await fetch(`${API_BASE_URL}/swaps/${swapId}/reject`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({ reason }),
    });
    return handleResponse(response);
  },

  // Complete swap
  completeSwap: async (swapId) => {
    const response = await fetch(`${API_BASE_URL}/swaps/${swapId}/complete`, {
      method: 'PUT',
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  // Cancel swap
  cancelSwap: async (swapId, reason = '') => {
    const response = await fetch(`${API_BASE_URL}/swaps/${swapId}/cancel`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({ reason }),
    });
    return handleResponse(response);
  },

  // Rate swap
  rateSwap: async (swapId, rating, review = '') => {
    const response = await fetch(`${API_BASE_URL}/swaps/${swapId}/rate`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ rating, review }),
    });
    return handleResponse(response);
  },
};

// Messages API
export const messagesAPI = {
  // Get conversations list
  getConversations: async () => {
    const response = await fetch(`${API_BASE_URL}/messages/conversations`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  // Get conversation with user
  getConversation: async (userId, page = 1, limit = 50) => {
    const params = new URLSearchParams({ page, limit });
    const response = await fetch(`${API_BASE_URL}/messages/conversation/${userId}?${params}`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  // Send message
  sendMessage: async (messageData) => {
    const response = await fetch(`${API_BASE_URL}/messages`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(messageData),
    });
    return handleResponse(response);
  },

  // Mark messages as read
  markAsRead: async (userId) => {
    const response = await fetch(`${API_BASE_URL}/messages/read/${userId}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  // Get unread count
  getUnreadCount: async () => {
    const response = await fetch(`${API_BASE_URL}/messages/unread/count`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  // Delete message
  deleteMessage: async (messageId) => {
    const response = await fetch(`${API_BASE_URL}/messages/${messageId}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  // Search messages
  searchMessages: async (query, userId = null, page = 1, limit = 20) => {
    const params = new URLSearchParams({ q: query, page, limit });
    if (userId) params.append('userId', userId);
    
    const response = await fetch(`${API_BASE_URL}/messages/search?${params}`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },
};

// Health check
export const healthCheck = async () => {
  const backendUrl = getBackendUrl();
  const response = await fetch(`${backendUrl}/health`);
  return handleResponse(response);
}; 