// Steward API endpoints — Steward/Admin only
import apiClient from '../client';

export interface StewardStats {
  pending: number;
  approved: number;
  rejected: number;
}

export interface DuplicateCheckResult {
  hasDuplicate: boolean;
  duplicates: {
    id: string;
    name: string;
    distanceMeters: number;
    source: string;
  }[];
}

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
  nearbyDuplicates: any[];
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
    const res = await apiClient.get<PendingListResponse>('/v1/steward/pending-restaurants', {
      params: { page, pageSize },
    });
    return res.data.data;
  },

  decide: async (id: string, payload: ApproveRequest) => {
    const res = await apiClient.post<{ success: boolean; message: string }>(`/v1/steward/approve-restaurant/${id}`, payload);
    return res.data;
  },

  getPending: async () => {
    const res = await stewardApi.listPending();
    return res.restaurants;
  },
  approve: async (id: string, notes?: string) => stewardApi.decide(id, { action: 'APPROVE', notes }),
  reject: async (id: string, notes?: string) => stewardApi.decide(id, { action: 'REJECT', notes }),

  getStats: async (): Promise<StewardStats> => {
    // Mock implementation for now
    return { pending: 0, approved: 0, rejected: 0 };
  },

  checkDuplicate: async (lat: number, lng: number, name: string): Promise<DuplicateCheckResult> => {
    // Mock implementation for now
    return { hasDuplicate: false, duplicates: [] };
  },
};
