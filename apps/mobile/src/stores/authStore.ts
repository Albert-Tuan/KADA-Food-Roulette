import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';
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

export const useAuthStore = create<UserState>()((set, get) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: true,

  setUser: (user) => set({ user, isAuthenticated: !!user }),

  setToken: async (token) => {
    if (token) {
      await SecureStore.setItemAsync('token', token);
    } else {
      await SecureStore.deleteItemAsync('token');
    }
    set({ token });
  },

  login: async (email: string, password: string) => {
    try {
      const result = await authApi.login({ email, password });
      await SecureStore.setItemAsync('token', result.token);
      set({ token: result.token, user: result.user, isAuthenticated: true });
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  },

  logout: async () => {
    await SecureStore.deleteItemAsync('token');
    await AsyncStorage.removeItem('user-storage');
    set({ token: null, user: null, isAuthenticated: false });
  },

  updateUser: (updates) =>
    set((state) => ({
      user: state.user ? { ...state.user, ...updates } : null,
    })),

  checkAuth: async () => {
    try {
      set({ isLoading: true });
      const token = await SecureStore.getItemAsync('token');
      if (token) {
        set({ token, isAuthenticated: true });
        // Optionally fetch user data here
        // const user = await authApi.me();
        // set({ user });
      }
    } catch (error) {
      console.error('Check auth error:', error);
    } finally {
      set({ isLoading: false });
    }
  },
}));
