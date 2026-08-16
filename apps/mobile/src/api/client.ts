import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import { API_TIMEOUT, API_URL as ENV_API_URL } from '@/lib/constants';

const API_URL = Platform.OS === 'web' ? 'http://localhost:3000/api/v1' : (ENV_API_URL || 'http://192.168.1.181:3000/api/v1');

const getStorageItem = async (key: string) => {
  if (Platform.OS === 'web') {
    return await AsyncStorage.getItem(key);
  }
  return await SecureStore.getItemAsync(key);
};

const removeStorageItem = async (key: string) => {
  if (Platform.OS === 'web') {
    await AsyncStorage.removeItem(key);
  } else {
    await SecureStore.deleteItemAsync(key);
  }
};

export const apiClient = axios.create({
  baseURL: API_URL,
  timeout: API_TIMEOUT,
});

// Request interceptor - add auth token & handle FormData boundary
apiClient.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    const token = await getStorageItem('token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    if (config.data instanceof FormData) {
      if (config.headers?.delete) {
        config.headers.delete('Content-Type');
        config.headers.delete('content-type');
      } else if (config.headers) {
        delete config.headers['Content-Type'];
        delete config.headers['content-type'];
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - handle errors
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    if (error.response?.status === 401) {
      removeStorageItem('token');
    }
    return Promise.reject(error);
  }
);

export const getApiErrorMessage = (error: unknown, defaultMessage: string = 'Đã có lỗi xảy ra'): string => {
  if (axios.isAxiosError(error)) {
    return error.response?.data?.message || error.message || defaultMessage;
  }
  return error instanceof Error ? error.message : defaultMessage;
};

export default apiClient;
