import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import * as SecureStore from 'expo-secure-store';
import { API_TIMEOUT, API_URL } from '@/lib/constants';

export const apiClient = axios.create({
  baseURL: API_URL,
  timeout: API_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - add auth token
apiClient.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    const token = await SecureStore.getItemAsync('token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export function getApiErrorMessage(error: unknown, fallback: string): string {
  if (!axios.isAxiosError(error)) return error instanceof Error ? error.message : fallback;
  const responseError = error.response?.data as {
    error?: string | { message?: string };
    message?: string;
  } | undefined;
  if (typeof responseError?.error === 'string') return responseError.error;
  return responseError?.error?.message ?? responseError?.message ?? fallback;
}

// Response interceptor - handle errors
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      // Clear token and redirect to login
      SecureStore.deleteItemAsync('token');
      // Navigation will be handled by the component
    }
    return Promise.reject(error);
  }
);

export default apiClient;
