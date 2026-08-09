// Spin/Roulette API endpoints
import apiClient from '../client';
import { Restaurant } from './restaurants';

export interface SpinResult {
  success: boolean;
  data?: {
    sessionId: string;
    restaurant: Restaurant;
    xpEarned: number;
    coinsEarned: number;
  };
  error?: string;
}

export interface SpinRequest {
  category?: string;
  lat?: number;
  lng?: number;
  radius?: number;
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
