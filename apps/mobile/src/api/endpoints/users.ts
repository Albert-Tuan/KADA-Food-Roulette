import apiClient from '../client';
import type { LocketDto } from './lockets';

export interface ProfileStatsDto {
  locket_count: number;
  check_in_count: number;
  group_count: number;
}

export interface PublicProfileDto {
  id: string;
  public_id: string;
  display_name_public: string;
  avatar_url?: string | null;
  bio?: string | null;
  stats: ProfileStatsDto;
  public_lockets: LocketDto[];
  created_at: string;
}

export interface PrivateProfileDto extends PublicProfileDto {
  email: string;
  display_name_private: string;
}

interface ApiResponse<T> {
  success: true;
  data: T;
}

export const usersApi = {
  getMe: async (): Promise<PrivateProfileDto> => {
    const response = await apiClient.get<ApiResponse<PrivateProfileDto>>('/users/me');
    return response.data.data;
  },

  getPublic: async (publicId: string): Promise<PublicProfileDto> => {
    const response = await apiClient.get<ApiResponse<PublicProfileDto>>(`/users/${encodeURIComponent(publicId)}`);
    return response.data.data;
  },

  updateMe: async (input: {
    bio?: string | null;
    display_name_private?: string;
    display_name_public?: string;
  }): Promise<PrivateProfileDto> => {
    const response = await apiClient.patch<ApiResponse<PrivateProfileDto>>('/users/me', input);
    return response.data.data;
  },
};
