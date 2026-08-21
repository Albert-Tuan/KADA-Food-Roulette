import { Platform } from 'react-native';
import * as ImageManipulator from 'expo-image-manipulator';
import apiClient from '../client';

export interface LocketDto {
  id: string;
  owner_id: string;
  author: {
    id: string;
    public_id: string;
    display_name_public: string;
    avatar_url?: string | null;
  };
  image_url: string;
  dish_name?: string | null;
  restaurant_id?: string | null;
  restaurant_name?: string | null;
  note?: string | null;
  rating?: number | null;
  tags?: string[];
  like_count: number;
  is_liked: boolean;
  visibility: 'PRIVATE' | 'FRIENDS' | 'PUBLIC';
  captured_at: string;
  location?: { latitude: number; longitude: number } | null;
  can_display_location: boolean;
  exif_stripped: boolean;
  permissions: { can_edit: boolean; can_delete: boolean };
  created_at: string;
  updated_at: string;
}

interface ApiResponse<T> {
  success: true;
  data: T;
}

export interface LocketLikeDto {
  is_liked: boolean;
  like_count: number;
}

export interface UploadLocketRequest {
  localImageUri: string;
  mimeType: 'image/jpeg' | 'image/png' | 'image/webp';
  dishName?: string;
  restaurantId?: string;
  restaurantName?: string;
  note?: string;
  rating?: number;
  tags?: string[];
  visibility: 'PRIVATE' | 'FRIENDS' | 'PUBLIC';
  latitude: number;
  longitude: number;
  capturedAt: string;
  deviceHash: string;
}

export interface UpdateLocketRequest {
  dish_name?: string;
  restaurant_id?: string | null;
  restaurant_name?: string | null;
  note?: string | null;
  rating?: number | null;
  tags?: string[];
  visibility?: 'PRIVATE' | 'FRIENDS' | 'PUBLIC';
}

export const locketApi = {
  list: async (type: 'ALL' | 'MINE' | 'FRIENDS' | 'DISCOVER'): Promise<LocketDto[]> => {
    const response = await apiClient.get<ApiResponse<LocketDto[]>>('/lockets', { params: { type } });
    return response.data.data;
  },

  get: async (id: string): Promise<LocketDto> => {
    const response = await apiClient.get<ApiResponse<LocketDto>>(`/lockets/${id}`);
    return response.data.data;
  },

  create: async (input: UploadLocketRequest): Promise<LocketDto> => {
    let base64String = '';

    if (Platform.OS !== 'web') {
      try {
        // Compress and resize image to width 1024 to drastically reduce payload size (from 10MB to ~150KB)
        const manipResult = await ImageManipulator.manipulateAsync(
          input.localImageUri,
          [{ resize: { width: 1024 } }],
          { compress: 0.75, format: ImageManipulator.SaveFormat.JPEG, base64: true }
        );
        if (manipResult.base64) {
          base64String = `data:image/jpeg;base64,${manipResult.base64}`;
        }
      } catch (err) {
        console.warn('ImageManipulator failed for locket photo:', err);
      }
    }

    // If we have base64, send via JSON (100% reliable on React Native Android without multipart boundary bugs)
    if (base64String || input.localImageUri.startsWith('data:')) {
      const payload: Record<string, any> = {
        image_base64: base64String || input.localImageUri,
        dish_name: input.dishName,
        restaurant_id: input.restaurantId,
        restaurant_name: input.restaurantName,
        note: input.note,
        rating: input.rating,
        tags: input.tags,
        visibility: input.visibility,
        latitude: input.latitude,
        longitude: input.longitude,
      };

      const response = await apiClient.post<ApiResponse<LocketDto>>('/lockets', payload, {
        headers: {
          'X-Device-ID': input.deviceHash || 'a'.repeat(64),
          'X-Captured-At': input.capturedAt || new Date().toISOString(),
          'device-hash': input.deviceHash || 'a'.repeat(64),
          'captured-at': input.capturedAt || new Date().toISOString(),
        },
        timeout: 60_000,
      });
      return response.data.data;
    }

    // Fallback FormData for Web
    const form = new FormData();
    if (Platform.OS === 'web' && typeof fetch !== 'undefined') {
      try {
        if (input.localImageUri.startsWith('data:') || input.localImageUri.startsWith('blob:')) {
          const res = await fetch(input.localImageUri);
          const blob = await res.blob();
          form.append('image', blob, `locket.${input.mimeType === 'image/png' ? 'png' : 'jpg'}`);
        } else {
          const base64Data = input.localImageUri.includes(',') ? input.localImageUri.split(',')[1] : input.localImageUri;
          const byteCharacters = atob(base64Data);
          const byteNumbers = new Array(byteCharacters.length);
          for (let i = 0; i < byteCharacters.length; i++) {
            byteNumbers[i] = byteCharacters.charCodeAt(i);
          }
          const byteArray = new Uint8Array(byteNumbers);
          const blob = new Blob([byteArray], { type: input.mimeType });
          form.append('image', blob, `locket.${input.mimeType === 'image/png' ? 'png' : 'jpg'}`);
        }
      } catch {
        form.append('image', {
          uri: input.localImageUri,
          name: `locket.${input.mimeType === 'image/png' ? 'png' : 'jpg'}`,
          type: input.mimeType,
        } as unknown as Blob);
      }
    } else {
      form.append('image', {
        uri: input.localImageUri,
        name: `locket.${input.mimeType === 'image/png' ? 'png' : 'jpg'}`,
        type: input.mimeType,
      } as unknown as Blob);
    }

    if (input.dishName) form.append('dish_name', input.dishName);
    if (input.restaurantId) form.append('restaurant_id', input.restaurantId);
    if (input.restaurantName) form.append('restaurant_name', input.restaurantName);
    if (input.note) form.append('note', input.note);
    if (input.rating != null) form.append('rating', String(input.rating));
    if (input.tags?.length) form.append('tags', JSON.stringify(input.tags));
    form.append('visibility', input.visibility);
    form.append('latitude', String(input.latitude));
    form.append('longitude', String(input.longitude));

    const response = await apiClient.post<ApiResponse<LocketDto>>('/lockets', form, {
      headers: {
        'X-Device-ID': input.deviceHash || 'a'.repeat(64),
        'X-Captured-At': input.capturedAt || new Date().toISOString(),
      },
      timeout: 30_000,
    });
    return response.data.data;
  },

  update: async (id: string, input: UpdateLocketRequest): Promise<LocketDto> => {
    const response = await apiClient.patch<ApiResponse<LocketDto>>(`/lockets/${id}`, input);
    return response.data.data;
  },

  like: async (id: string): Promise<LocketLikeDto> => {
    const response = await apiClient.post<ApiResponse<LocketLikeDto>>(`/lockets/${id}/like`);
    return response.data.data;
  },

  unlike: async (id: string): Promise<LocketLikeDto> => {
    const response = await apiClient.delete<ApiResponse<LocketLikeDto>>(`/lockets/${id}/like`);
    return response.data.data;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/lockets/${id}`);
  },
};
