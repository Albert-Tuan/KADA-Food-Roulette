import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';

export const apiClient = axios.create({
  baseURL: API_URL,
  timeout: 60000,
});

// Request interceptor - add auth token and set content type
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    // Only set JSON content-type for non-FormData requests
    if (config.data && !(config.data instanceof FormData) && config.headers) {
      config.headers['Content-Type'] = 'application/json';
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - handle errors without aggressive hard redirects in demo mode
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    if (error.response?.status === 401) {
      const existingToken = localStorage.getItem('token');
      localStorage.removeItem('token');
      // Only redirect to login if an actual expired token was present and user was trying to access a protected route
      if (existingToken && window.location.pathname.startsWith('/profile')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;
