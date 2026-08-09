import apiClient from '../client';

export interface UserPreference {
  userId: string;
  cuisineScores: Record<string, number>;
  priceRange: number;
  dietaryRestrictions: string[];
  spiceTolerance: string;
  dislikedIngredients: string[];
}

export interface UpdatePreferenceInput {
  priceRange?: number;
  dietaryRestrictions?: string[];
  spiceTolerance?: string;
  dislikedIngredients?: string[];
}

export const preferencesApi = {
  getPreferences: async (): Promise<UserPreference> => {
    const response = await apiClient.get<UserPreference>('/preferences');
    return response.data;
  },

  updatePreferences: async (data: UpdatePreferenceInput): Promise<UserPreference> => {
    const response = await apiClient.put<UserPreference>('/preferences', data);
    return response.data;
  },

  resetPreferences: async (): Promise<UserPreference> => {
    const response = await apiClient.post<UserPreference>('/preferences/reset');
    return response.data;
  },
};
