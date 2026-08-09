// Auth API endpoints
import apiClient from '../client';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  displayNamePrivate: string;
  displayNamePublic: string;
}

export interface UserProfile {
  id: string;
  email: string;
  displayNamePrivate: string;
  displayNamePublic: string;
  publicId: string;
  avatarUrl?: string;
  xp: number;
  streakDays: number;
  coins: number;
  role: 'USER' | 'STEWARD' | 'ADMIN';
  createdAt?: string;
}

export interface AuthResponse {
  success: boolean;
  data?: {
    user: UserProfile;
    access_token: string;
    refresh_token?: string;
    expires_in?: number;
    is_new_user?: boolean;
  };
  error?: string;
}

export const authApi = {
  login: async (data: LoginRequest): Promise<{ token: string; user: UserProfile }> => {
    const response = await apiClient.post<AuthResponse>('/auth/login', data);
    const { data: responseData } = response;
    if (!responseData?.success || !responseData.data) {
      throw new Error(responseData?.error || 'Đăng nhập thất bại');
    }
    return {
      token: responseData.data.access_token,
      user: responseData.data.user
    };
  },

  register: async (data: RegisterRequest): Promise<{ token: string; user: UserProfile }> => {
    const response = await apiClient.post<AuthResponse>('/auth/register', data);
    const { data: responseData } = response;
    if (!responseData?.success || !responseData.data) {
      throw new Error(responseData?.error || 'Đăng ký thất bại');
    }
    return {
      token: responseData.data.access_token,
      user: responseData.data.user
    };
  },

  me: async (): Promise<UserProfile> => {
    const response = await apiClient.get<UserProfile>('/auth/me');
    return response.data;
  },

  google: async (idToken: string): Promise<{ token: string; user: UserProfile }> => {
    const response = await apiClient.post<AuthResponse>('/auth/google', { idToken });
    const { data: responseData } = response;
    if (!responseData?.success || !responseData.data) {
      throw new Error(responseData?.error || 'Đăng nhập Google thất bại');
    }
    return {
      token: responseData.data.access_token,
      user: responseData.data.user
    };
  },

  onboarding: async (data: {
    displayNamePrivate?: string;
    displayNamePublic?: string;
    priceRange?: number;
    dietaryRestrictions?: string[];
    spiceTolerance?: string;
    cuisinePreferences?: string[];
  }) => {
    const response = await apiClient.post('/auth/onboarding', data);
    return response.data;
  },

  forgotPassword: async (email: string) => {
    const response = await apiClient.post('/auth/forgot-password', { email });
    return response.data;
  },

  resetPassword: async (resetToken: string, newPassword: string) => {
    const response = await apiClient.post('/auth/reset-password', { resetToken, newPassword });
    return response.data;
  },

  refresh: async (refreshToken: string) => {
    const response = await apiClient.post('/auth/refresh', { refresh_token: refreshToken });
    return response.data;
  },
};
