// src/utils/auth.js - FIXED: No artificial timeouts, clear error messages
import api from './api';

export const authService = {
  async register(userData) {
    try {
      const response = await api.post('/auth/register/', userData);
      
      if (response.data.access) {
        this.setTokens(response.data.access, response.data.refresh);
        this.setUser(response.data.user);
      }
      
      return response.data;
    } catch (error) {
      console.error('Registration error:', error);
      throw this.handleError(error);
    }
  },

  async login(username, password) {
    try {
      const response = await api.post('/auth/login/', {
        username,
        password
      });
      
      if (response.data.access) {
        this.setTokens(response.data.access, response.data.refresh);
        this.setUser(response.data.user);
      }
      
      return response.data;
    } catch (error) {
      console.error('Login error:', error);
      throw this.handleError(error);
    }
  },

  async logout() {
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      
      if (refreshToken) {
        await api.post('/auth/logout/', {
          refresh_token: refreshToken
        });
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      this.removeTokens();
    }
  },

  async refreshToken() {
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      
      if (!refreshToken) {
        throw new Error('No refresh token available');
      }
      
      const response = await api.post('/auth/refresh/', {
        refresh: refreshToken
      });
      
      if (response.data.access) {
        this.setTokens(response.data.access, response.data.refresh);
      }
      
      return response.data.access;
    } catch (error) {
      console.error('Token refresh error:', error);
      this.removeTokens();
      throw error;
    }
  },

  setTokens(accessToken, refreshToken) {
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
    api.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
  },

  setUser(user) {
    localStorage.setItem('user', JSON.stringify(user));
  },

  getUser() {
    const userStr = localStorage.getItem('user');
    try {
      return userStr ? JSON.parse(userStr) : null;
    } catch {
      return null;
    }
  },

  getAccessToken() {
    return localStorage.getItem('accessToken');
  },

  getRefreshToken() {
    return localStorage.getItem('refreshToken');
  },

  removeTokens() {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    delete api.defaults.headers.common['Authorization'];
  },

  isAuthenticated() {
    const token = this.getAccessToken();
    if (!token) return false;

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const expirationTime = payload.exp * 1000;
      
      return Date.now() < expirationTime;
    } catch (error) {
      console.error('Token validation error:', error);
      return false;
    }
  },

  handleError(error) {
    // Network errors (can't reach server at all)
    if (error.code === 'ERR_NETWORK' || !error.response) {
      return new Error('Cannot connect to server. Please check your internet connection.');
    }
    
    // Server responded with error
    if (error.response) {
      const status = error.response.status;
      const data = error.response.data;
      
      // Handle specific status codes
      if (status === 400) {
        // Validation errors
        if (data.username) {
          return new Error(data.username[0] || 'Invalid username');
        }
        if (data.email) {
          return new Error(data.email[0] || 'Invalid email');
        }
        if (data.password) {
          return new Error(data.password[0] || 'Invalid password');
        }
        if (data.error) {
          return new Error(data.error);
        }
        if (data.detail) {
          return new Error(data.detail);
        }
        return new Error('Please check your input and try again');
      }
      
      if (status === 401) {
        return new Error('Invalid username or password');
      }
      
      if (status === 500) {
        return new Error('Server error. Please try again in a moment.');
      }
      
      // Fallback for other errors
      const message = data?.error || data?.detail || data?.message || 'An error occurred';
      return new Error(message);
    }
    
    // Unknown error
    return new Error(error.message || 'An unexpected error occurred');
  }
};

export default authService;