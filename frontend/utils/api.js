// src/utils/api.js - FIXED: No annoying timeout messages
import axios from "axios";

// Get API URL from environment variable
const getApiUrl = () => {
  // For Vite projects (most common with modern React)
  if (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  
  // For Create React App projects
  if (typeof process !== 'undefined' && process.env?.REACT_APP_API_URL) {
    return process.env.REACT_APP_API_URL;
  }
  
  // Fallback for development
  console.warn('No API URL environment variable found. Using localhost fallback.');
  return 'http://127.0.0.1:8000/api';
};

// Create axios instance with base configuration
const api = axios.create({
  baseURL: getApiUrl(),
  timeout: 30000, // 30 seconds - enough for Render cold start
  headers: {
    'Content-Type': 'application/json',
  },
});

// Token refresh state management
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  
  failedQueue = [];
};

// Request interceptor - Attach access token to all requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor - Handle token refresh on 401 errors
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If error is not 401 or request has already been retried, reject
    if (error.response?.status !== 401 || originalRequest._retry) {
      return Promise.reject(error);
    }

    // If already refreshing, queue the request
    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      })
        .then(token => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return api(originalRequest);
        })
        .catch(err => {
          return Promise.reject(err);
        });
    }

    originalRequest._retry = true;
    isRefreshing = true;

    const refreshToken = localStorage.getItem('refreshToken');
    
    if (!refreshToken) {
      isRefreshing = false;
      // Clear tokens and redirect to login
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      window.location.href = '/login';
      return Promise.reject(error);
    }

    try {
      const { data } = await axios.post(`${getApiUrl()}/auth/refresh/`, {
        refresh: refreshToken
      });

      const newAccessToken = data.access;
      localStorage.setItem('accessToken', newAccessToken);
      
      // Update authorization header
      api.defaults.headers.common['Authorization'] = `Bearer ${newAccessToken}`;
      originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
      
      processQueue(null, newAccessToken);
      isRefreshing = false;
      
      return api(originalRequest);
    } catch (refreshError) {
      processQueue(refreshError, null);
      isRefreshing = false;
      
      // Clear tokens and redirect to login
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      window.location.href = '/login';
      
      return Promise.reject(refreshError);
    }
  }
);

// Export the configured axios instance
export default api;

// Export helper to check if API is configured
export const isApiConfigured = () => {
  const url = getApiUrl();
  const isLocalhost = url.includes('127.0.0.1') || url.includes('localhost');
  
  if (isLocalhost && typeof window !== 'undefined' && window.location.hostname !== 'localhost') {
    console.error('Production deployment detected but API URL is still localhost!');
    console.error('Set VITE_API_URL environment variable in Vercel to your Render backend URL');
    return false;
  }
  
  return true;
};

// Log API configuration on load (only in development)
if (typeof window !== 'undefined' && import.meta.env?.DEV) {
}