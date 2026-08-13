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

export interface UploadLocketRequest {
  localImageUri: string;
  mimeType: 'image/jpeg' | 'image/png' | 'image/webp';
  restaurantId?: string;
  note?: string;
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
    const form = new FormData();
    form.append('image', {
      uri: input.localImageUri,
      name: `locket.${input.mimeType === 'image/png' ? 'png' : 'jpg'}`,
      type: input.mimeType,
    } as unknown as Blob);
    if (input.restaurantId) form.append('restaurant_id', input.restaurantId);
    if (input.note) form.append('note', input.note);
    form.append('visibility', input.visibility);
    form.append('latitude', String(input.latitude));
    form.append('longitude', String(input.longitude));

    const response = await apiClient.post<ApiResponse<LocketDto>>('/lockets', form, {
      headers: {
        'Content-Type': 'multipart/form-data',
        'X-Device-ID': input.deviceHash,
        'X-Captured-At': input.capturedAt,
      },
      timeout: 30_000,
    });
    return response.data.data;
  },

  update: async (id: string, input: UpdateLocketRequest): Promise<LocketDto> => {
    const response = await apiClient.patch<ApiResponse<LocketDto>>(`/lockets/${id}`, input);
    return response.data.data;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/lockets/${id}`);
  },
};
