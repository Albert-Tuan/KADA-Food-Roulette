import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform, DeviceEventEmitter } from 'react-native';
import { API_TIMEOUT, API_URL as ENV_API_URL } from '@/lib/constants';

let API_URL = process.env.EXPO_PUBLIC_API_URL || ENV_API_URL || 'https://food-roulette-api-backend.onrender.com/api/v1';

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
    if (config.headers) {
      config.headers['Bypass-Tunnel-Reminder'] = 'true';
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
      // Clear token and trigger logout event
      await removeStorageItem('token');
      DeviceEventEmitter.emit('AUTH_EXPIRED');
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
