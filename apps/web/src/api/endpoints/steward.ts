// Steward API endpoints — Steward/Admin only
import apiClient from '../client';

export interface PendingRestaurant {
  id: string;
  name: string;
  address?: string;
  category?: string;
  priceLevel?: number;
  lat?: number;
  lng?: number;
  source: 'GOOGLE_PLACES' | 'USER_SUBMITTED';
  status: 'PENDING';
  createdAt: string;
  photos: string[];
  nearbyDuplicates: { id: string; name: string; distanceM: number }[];
}

interface PendingListResponse {
  success: boolean;
  data: {
    restaurants: PendingRestaurant[];
    pagination: { page: number; pageSize: number; total: number; totalPages: number };
  };
}

interface ApproveRequest {
  action: 'APPROVE' | 'REJECT' | 'MERGE';
  notes?: string;
  mergeWithId?: string;
}

export const stewardApi = {
  listPending: async (page = 1, pageSize = 20): Promise<PendingListResponse['data']> => {
    const res = await apiClient.get<PendingListResponse>('/steward/pending-restaurants', {
      params: { page, pageSize },
    });
    return res.data.data;
  },

  decide: async (id: string, payload: ApproveRequest) => {
    const res = await apiClient.post<{ success: boolean; message: string }>(`/steward/approve-restaurant/${id}`, payload);
    return res.data;
  },
};
