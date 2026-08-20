import { Platform } from 'react-native';
import * as FileSystem from 'expo-file-system';
import * as ImageManipulator from 'expo-image-manipulator';
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
    // Convert images to compressed base64 and send as JSON (avoids massive payload & timeout)
    const images: Array<{ base64: string; filename: string; mimeType: string }> = [];

    for (const imageUri of imageUris) {
      let base64: string = '';
      if (Platform.OS === 'web') {
        const response = await fetch(imageUri);
        const blob = await response.blob();
        base64 = await new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => {
            const result = reader.result as string;
            resolve(result.split(',')[1] || result);
          };
          reader.readAsDataURL(blob);
        });
      } else {
        try {
          // Compress and resize image to width 1024 to drastically reduce payload size (from 10MB to ~150KB)
          const manipResult = await ImageManipulator.manipulateAsync(
            imageUri,
            [{ resize: { width: 1024 } }],
            { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG, base64: true }
          );
          base64 = manipResult.base64 || '';
        } catch (manipErr) {
          console.warn('ImageManipulator failed, falling back to raw file:', manipErr);
          base64 = await FileSystem.readAsStringAsync(imageUri, {
            encoding: FileSystem.EncodingType.Base64,
          });
        }
      }

      if (base64) {
        images.push({ base64, filename: 'menu.jpg', mimeType: 'image/jpeg' });
      }
    }

    const response = await apiClient.post<MenuCaptureResponse>('/menu/capture-base64', {
      restaurantId,
      images,
    }, {
      timeout: 300000, // 5 minutes timeout for AI processing
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

    const response = await apiClient.post<VoicePickResponse>('/menu/voice-pick', formData);
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
