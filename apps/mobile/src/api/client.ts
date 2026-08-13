import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import { API_TIMEOUT, API_URL as ENV_API_URL } from '@/lib/constants';

const API_URL = ENV_API_URL;

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
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - add auth token
apiClient.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    const token = await getStorageItem('token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
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
      // Clear token and redirect to login
      removeStorageItem('token');
      // In a real app we'd dispatch a logout event or clear Zustand state directly
    }
    return Promise.reject(error);
  }
);

export const getApiErrorMessage = (error: unknown, defaultMessage: string = 'Đã có lỗi xảy ra'): string => {
  if (axios.isAxiosError(error)) {
    if (error.code === 'ECONNABORTED') {
      return 'Kết nối API quá thời gian. Bạn kiểm tra backend và thử lại nhé.';
    }
    if (!error.response) {
      return 'Không kết nối được API. Bạn kiểm tra địa chỉ backend, Wi-Fi và CORS rồi thử lại nhé.';
    }
    return error.response?.data?.message || error.message || defaultMessage;
  }
  return error instanceof Error ? error.message : defaultMessage;
};

export default apiClient;
