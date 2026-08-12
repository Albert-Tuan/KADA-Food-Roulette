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

export const menuApi = {
  captureMenu: async (restaurantId: string, imageUri: string): Promise<MenuCaptureResponse> => {
    const formData = new FormData();
    formData.append('restaurantId', restaurantId);
    
    // In React Native, we need to append the file like this
    const filename = imageUri.split('/').pop() || 'menu.jpg';
    const match = /\.(\w+)$/.exec(filename);
    const type = match ? `image/${match[1]}` : `image/jpeg`;

    formData.append('menuImage', {
      uri: imageUri,
      name: filename,
      type,
    } as any);

    const response = await apiClient.post<MenuCaptureResponse>('/menu/capture', formData, {
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
