// Spin/Roulette API endpoints
import apiClient from '../client';
import { Restaurant } from './restaurants';

export interface SpinResult {
  sessionId: string;
  userId?: string;
  selectedRestaurant: any; // Using any here because it's the backend format, we will map it
  spinDurationMs?: number;
  spinDegree?: number;
  spunAt?: string;
  xpEarned?: number;
  coinsEarned?: number;
}

export interface SpinRequest {
  lat: number;
  lng: number;
  radiusKm?: number;
  cuisine?: string;
  isSpicy?: boolean;
  isVegetarian?: boolean;
}

export const rouletteApi = {
  spin: async (data?: SpinRequest): Promise<SpinResult> => {
    const response = await apiClient.post<SpinResult>('/spins/personal', data);
    return response.data;
  },

  acceptResult: async (cuisine?: string) => {
    const response = await apiClient.post('/spins/accept', { cuisine });
    return response.data;
  },

  rerollResult: async (cuisine?: string) => {
    const response = await apiClient.post('/spins/reroll', { cuisine });
    return response.data;
  },

  getHistory: async () => {
    const response = await apiClient.get('/spins/history');
    return response.data;
  },
};
