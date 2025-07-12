import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authAPI } from '../services/api';
import socketService from '../services/socket';

interface User {
  id: string;
  name: string;
  email: string;
  location: string;
  avatar?: string;
  rating: number;
  averageRating?: number;
  totalSwaps: number;
  skillsOffered: string[];
  skillsWanted: string[];
  availability: string;
  isOnline: boolean;
  bio?: string;
  preferences?: any;
  socialLinks?: any;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: any) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (userData: Partial<User> | User) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [isLoading, setIsLoading] = useState(true);

  const isAuthenticated = !!user && !!token;

  // Initialize authentication on mount
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        if (token) {
          // Verify token and get current user
          const response = await authAPI.getCurrentUser();
          setUser(response.data.user);
          
          // Connect to WebSocket
          await socketService.connect(token);
        }
      } catch (error) {
        console.error('Authentication initialization failed:', error);
        // Clear invalid token
        localStorage.removeItem('token');
        setToken(null);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, [token]);

  // Login function
  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      const response = await authAPI.login({ email, password });
      
      const { user: userData, token: authToken } = response.data;
      
      // Store token
      localStorage.setItem('token', authToken);
      setToken(authToken);
      setUser(userData);
      
      // Connect to WebSocket
      await socketService.connect(authToken);
      
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Register function
  const register = async (userData: any) => {
    try {
      setIsLoading(true);
      const response = await authAPI.register(userData);
      
      const { user: newUser, token: authToken } = response.data;
      
      // Store token
      localStorage.setItem('token', authToken);
      setToken(authToken);
      setUser(newUser);
      
      // Connect to WebSocket
      await socketService.connect(authToken);
      
    } catch (error) {
      console.error('Registration failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Logout function
  const logout = async () => {
    try {
      // Call logout API
      await authAPI.logout();
    } catch (error) {
      console.error('Logout API call failed:', error);
    } finally {
      // Clear local state
      localStorage.removeItem('token');
      setToken(null);
      setUser(null);
      
      // Disconnect WebSocket
      socketService.disconnect();
    }
  };

  // Update user function
  const updateUser = async (userData: Partial<User> | User) => {
    try {
      // If userData is a complete user object, use it directly
      if (userData && typeof userData === 'object' && 'id' in userData) {
        setUser(userData as User);
      } else {
        // Otherwise, fetch the current user data
        const response = await authAPI.getCurrentUser();
        setUser(response.data.user);
      }
    } catch (error) {
      console.error('Failed to update user:', error);
      throw error;
    }
  };

  const value: AuthContextType = {
    user,
    token,
    isAuthenticated,
    isLoading,
    login,
    register,
    logout,
    updateUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 