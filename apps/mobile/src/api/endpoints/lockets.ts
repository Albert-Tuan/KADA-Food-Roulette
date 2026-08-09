// Lockets API endpoints
import apiClient from '../client';

export interface Locket {
  id: string;
  userId: string;
  user: {
    id: string;
    displayNamePrivate: string;
    publicId: string;
    avatarUrl?: string;
  };
  restaurantId?: string;
  restaurant?: {
    id: string;
    name: string;
  };
  imageUrl: string;
  caption?: string;
  gpsLat?: number;
  gpsLng?: number;
  capturedAt: string;
  deviceHash: string;
  visibility: 'PRIVATE' | 'FRIENDS' | 'PUBLIC';
  createdAt: string;
}

export interface CreateLocketRequest {
  imageUrl: string;
  restaurantId?: string;
  caption?: string;
  gpsLat: number;
  gpsLng: number;
  capturedAt: string;
  deviceHash: string;
  visibility?: 'PRIVATE' | 'FRIENDS' | 'PUBLIC';
}

export const locketApi = {
  list: async (visibility?: 'PRIVATE' | 'FRIENDS' | 'PUBLIC'): Promise<Locket[]> => {
    const response = await apiClient.get<Locket[]>('/lockets', { params: { visibility } });
    return response.data;
  },

  get: async (id: string): Promise<Locket> => {
    const response = await apiClient.get<Locket>(`/lockets/${id}`);
    return response.data;
  },

  create: async (data: CreateLocketRequest): Promise<Locket> => {
    const response = await apiClient.post<Locket>('/lockets', data);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/lockets/${id}`);
  },
};
