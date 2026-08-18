import { Platform } from 'react-native';
import apiClient from '../client';

export interface MenuItem {
  id?: string;
  name: string;
  priceVND?: number | null;
  category?: string;
  tags?: string[];
  sortOrder?: number;
}

export interface MenuCaptureResponse {
  menuId: string;
  items: MenuItem[];
  confidence: number;
  requiresVerification: boolean;
}

export interface Menu {
  id: string;
  restaurantId: string;
  imageUrl: string;
  extractedText?: string;
  confidence?: number;
  capturedBy: string;
  capturedAt: string;
  status: 'PENDING' | 'VERIFIED' | 'REJECTED';
  items: MenuItem[];
  isFresh?: boolean;
}

export interface VoicePickResponse {
  transcription: string;
  cravedItems: Array<{ name: string; reason: string }>;
  matchedItems: Array<{ name: string; reason: string }>;
  excludedItems: Array<{ name: string; reason: string }>;
  aiSuggestions: Array<{ name: string; reason: string }>;
}

let latestCapturedMenu: MenuCaptureResponse | null = null;

export function setLatestCapturedMenu(menu: MenuCaptureResponse | null) {
  latestCapturedMenu = menu;
}

export function getLatestCapturedMenu(): MenuCaptureResponse | null {
  return latestCapturedMenu;
}

export const menuApi = {
  captureMenu: async (restaurantId: string, imageUris: string[]): Promise<MenuCaptureResponse> => {
    const formData = new FormData();
    formData.append('restaurantId', restaurantId);

    for (const imageUri of imageUris) {
      const filename = imageUri.split('/').pop() || 'menu.jpg';
      const match = /\.(\w+)$/.exec(filename);
      const type = match ? `image/${match[1]}` : `image/jpeg`;

      if (Platform.OS === 'web') {
        const response = await fetch(imageUri);
        const blob = await response.blob();
        formData.append('menuImages', blob, filename);
      } else {
        formData.append('menuImages', {
          uri: imageUri,
          name: filename,
          type,
        } as any);
      }
    }

    const response = await apiClient.post<MenuCaptureResponse>('/menu/capture', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      timeout: 300000, // 5 minutes timeout for AI processing of long menus
    });
    return response.data;
  },

  processVoicePick: async (audioUri: string, menuItems: MenuItem[]): Promise<VoicePickResponse> => {
    const formData = new FormData();
    formData.append('menuItems', JSON.stringify(menuItems));

    const filename = audioUri.split('/').pop() || 'recording.m4a';

    if (Platform.OS === 'web') {
      const response = await fetch(audioUri);
      const blob = await response.blob();
      formData.append('audioFile', blob, filename);
    } else {
      formData.append('audioFile', {
        uri: audioUri,
        name: filename,
        type: 'audio/m4a',
      } as any);
    }

    const response = await apiClient.post<VoicePickResponse>('/menu/voice-pick', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  verifyMenu: async (menuId: string, items: MenuItem[]): Promise<Menu> => {
    const response = await apiClient.post<Menu>(`/menu/${menuId}/verify`, { items });
    return response.data;
  },

  getMenuById: async (menuId: string): Promise<Menu> => {
    const response = await apiClient.get<Menu>(`/menu/${menuId}`);
    return response.data;
  },

  getMenusByRestaurant: async (restaurantId: string): Promise<Menu[]> => {
    const response = await apiClient.get<Menu[]>(`/menu/restaurant/${restaurantId}`);
    return response.data;
  },
};
