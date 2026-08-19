// Restaurant API endpoints
import apiClient from '../client';

export interface Restaurant {
  id: string;
  name: string;
  address?: string;
  lat?: number;
  lng?: number;
  phone?: string;
  website?: string;
  source: 'GOOGLE_PLACES' | 'USER_SUBMITTED';
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  ratingAvg?: number;
  ratingCount: number;
  category?: string;
  priceLevel?: number;
  photos?: string[];
  distance?: number;
  createdAt: string;
}

export interface CreateRestaurantRequest {
  name: string;
  address?: string;
  lat?: number;
  lng?: number;
  phone?: string;
  category?: string;
  priceLevel?: number;
}

export interface RestaurantFilters {
  status?: 'APPROVED' | 'PENDING' | 'REJECTED';
  category?: string;
  lat?: number;
  lng?: number;
  radius?: number; // km
}

export const restaurantApi = {
  list: async (filters?: RestaurantFilters): Promise<Restaurant[]> => {
    const response = await apiClient.get<Restaurant[]>('/restaurants', { params: filters });
    return response.data;
  },

  nearby: async (lat: number, lng: number, radius = 5): Promise<Restaurant[]> => {
    const response = await apiClient.get<Restaurant[]>('/restaurants/nearby', {
      params: { lat, lng, radius },
    });
    return response.data;
  },

  get: async (id: string): Promise<Restaurant> => {
    const response = await apiClient.get<Restaurant>(`/restaurants/${id}`);
    return response.data;
  },

  create: async (data: CreateRestaurantRequest): Promise<Restaurant> => {
    const response = await apiClient.post<{ data: Restaurant }>('/v1/restaurants', data);
    return response.data.data;
  },

  approve: async (id: string): Promise<Restaurant> => {
    const response = await apiClient.put<Restaurant>(`/restaurants/${id}`, { status: 'APPROVED' });
    return response.data;
  },
};

export const placesApi = {
  seedNearby: async (lat: number, lng: number, radius = 5): Promise<{ added: number; skipped: number }> => {
    const response = await apiClient.post('/places/seed', { lat, lng, radiusKm: radius });
    return response.data.data;
  }
};
