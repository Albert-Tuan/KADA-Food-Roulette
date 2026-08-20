import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import { authApi, UserProfile } from '../api';

interface UserState {
  user: UserProfile | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  
  // Actions
  setUser: (user: UserProfile | null) => void;
  setToken: (token: string | null) => void;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (updates: Partial<UserProfile>) => void;
  checkAuth: () => Promise<void>;
}

const setStorageItem = async (key: string, value: string) => {
  if (Platform.OS === 'web') {
    await AsyncStorage.setItem(key, value);
  } else {
    await SecureStore.setItemAsync(key, value);
  }
};

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

export const useAuthStore = create<UserState>()((set, get) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: true,

  setUser: (user) => set({ user, isAuthenticated: !!user }),

  setToken: async (token) => {
    if (token) {
      await setStorageItem('token', token);
    } else {
      await removeStorageItem('token');
    }
    set({ token });
  },

  login: async (email: string, password: string) => {
    try {
      const result = await authApi.login({ email, password });
      await setStorageItem('token', result.token);
      await setStorageItem('user_profile', JSON.stringify(result.user));
      set({ token: result.token, user: result.user, isAuthenticated: true });
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  },

  logout: async () => {
    await removeStorageItem('token');
    await removeStorageItem('user_profile');
    await AsyncStorage.removeItem('user-storage');
    set({ token: null, user: null, isAuthenticated: false });
  },

  updateUser: (updates) =>
    set((state) => {
      const updatedUser = state.user ? { ...state.user, ...updates } : null;
      // Persist updated user to storage
      if (updatedUser) {
        setStorageItem('user_profile', JSON.stringify(updatedUser));
      }
      return { user: updatedUser };
    }),

  checkAuth: async () => {
    try {
      set({ isLoading: true });
      const token = await getStorageItem('token');
      if (token) {
        // Restore user profile from storage
        let user: UserProfile | null = null;
        try {
          const userJson = await getStorageItem('user_profile');
          if (userJson) {
            user = JSON.parse(userJson);
          }
        } catch {
          // Ignore parse errors
        }
        set({ token, user, isAuthenticated: true });
      } else {
        set({ token: null, user: null, isAuthenticated: false });
      }
    } catch (error) {
      console.error('Check auth error:', error);
      set({ token: null, user: null, isAuthenticated: false });
    } finally {
      set({ isLoading: false });
    }
  },
}));
