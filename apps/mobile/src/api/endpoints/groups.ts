import apiClient from '../client';
import type { GroupMember, Restaurant } from '../../features/spin/types';

export type { GroupMember };

export interface Group {
  id: string;
  name: string;
  groupCode?: string;
  membersCount: number;
  maxMembers: number;
  lastSpinResult?: string;
  role?: string;
  creatorId?: string;
  createdAt?: string;
}

export interface SpinSession {
  sessionId: string;
  groupId: string;
  selectedRestaurant: {
    id: string;
    name: string;
    address: string;
    rating: number;
  };
  spunBy?: string;
  status: string;
  voteTimeoutSeconds: number;
}

export interface Vote {
  message: string;
  votedAt: string;
}

export type RoomPhase = 'LOBBY' | 'SPINNING' | 'VOTING' | 'RESULT';

export interface GroupRoomDto {
  id: string;
  name: string;
  roomCode: string;
  hostId: string;
  status: RoomPhase;
  members: GroupMember[];
  customCandidates: Array<{ id: string; name: string }>;
  votes: Record<string, string>;
  currentResult: Restaurant | null;
  spunAt?: number;
  updatedAt: string;
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
  error?: string;
}

export const groupsApi = {
  // Create or get user's active host room
  createOrGetRoom: async (): Promise<GroupRoomDto> => {
    const res = await apiClient.post<ApiResponse<GroupRoomDto>>('/groups/create-or-get');
    return res.data.data;
  },

  // Regenerate room code for host
  createNewCode: async (): Promise<GroupRoomDto> => {
    const res = await apiClient.post<ApiResponse<GroupRoomDto>>('/groups/new-code');
    return res.data.data;
  },

  // Get live room status by code
  getRoomByCode: async (code: string): Promise<GroupRoomDto> => {
    const cleanCode = code.trim().toUpperCase().replace('#', '');
    const res = await apiClient.get<ApiResponse<GroupRoomDto>>(`/groups/code/${cleanCode}`);
    return res.data.data;
  },

  // Join existing room by code
  joinRoom: async (code: string): Promise<GroupRoomDto> => {
    const cleanCode = code.trim().toUpperCase().replace('#', '');
    const res = await apiClient.post<ApiResponse<GroupRoomDto>>('/groups/join', { code: cleanCode });
    if (!res.data?.success || !res.data.data) {
      throw new Error(res.data?.error || 'Không thể vào phòng');
    }
    return res.data.data;
  },

  // Kick member from room (Host only)
  kickMember: async (code: string, memberId: string): Promise<GroupRoomDto> => {
    const cleanCode = code.trim().toUpperCase().replace('#', '');
    const res = await apiClient.post<ApiResponse<GroupRoomDto>>(`/groups/${cleanCode}/kick`, { memberId });
    if (!res.data?.success || !res.data.data) {
      throw new Error(res.data?.error || 'Lỗi xóa thành viên');
    }
    return res.data.data;
  },

  // Host starts the spin for everyone
  startSpin: async (code: string, winner?: any): Promise<GroupRoomDto> => {
    const cleanCode = code.trim().toUpperCase().replace('#', '');
    const res = await apiClient.post<ApiResponse<GroupRoomDto>>(`/groups/${cleanCode}/spin`, { winner });
    return res.data.data;
  },

  // Wheel animation ends, transition to voting
  finishSpin: async (code: string, winner?: any): Promise<GroupRoomDto> => {
    const cleanCode = code.trim().toUpperCase().replace('#', '');
    const res = await apiClient.post<ApiResponse<GroupRoomDto>>(`/groups/${cleanCode}/finish-spin`, { winner });
    return res.data.data;
  },

  // Vote on spin result
  vote: async (code: string, decision: 'ACCEPT' | 'RESPIN' | 'VETO'): Promise<GroupRoomDto> => {
    const cleanCode = code.trim().toUpperCase().replace('#', '');
    const res = await apiClient.post<ApiResponse<GroupRoomDto>>(`/groups/${cleanCode}/vote`, { decision });
    return res.data.data;
  },

  // Reset spin to lobby
  resetSpin: async (code: string): Promise<GroupRoomDto> => {
    const cleanCode = code.trim().toUpperCase().replace('#', '');
    const res = await apiClient.post<ApiResponse<GroupRoomDto>>(`/groups/${cleanCode}/reset-spin`);
    return res.data.data;
  },

  // Add custom dish contribution
  addCandidate: async (code: string, name: string): Promise<GroupRoomDto> => {
    const cleanCode = code.trim().toUpperCase().replace('#', '');
    const res = await apiClient.post<ApiResponse<GroupRoomDto>>(`/groups/${cleanCode}/candidates`, { name });
    return res.data.data;
  },

  // Remove custom dish
  removeCandidate: async (code: string, candId: string): Promise<GroupRoomDto> => {
    const cleanCode = code.trim().toUpperCase().replace('#', '');
    const res = await apiClient.delete<ApiResponse<GroupRoomDto>>(`/groups/${cleanCode}/candidates/${candId}`);
    return res.data.data;
  },

  // Legacy methods for hooks compatibility
  list: async (): Promise<Group[]> => {
    const res = await apiClient.get<ApiResponse<Group[]>>('/groups');
    return res.data?.data || [];
  },
  create: async (name?: string, maxMembers?: number): Promise<Group> => {
    const res = await apiClient.post<Group>('/groups', { name, maxMembers });
    return res.data;
  },
  get: async (id: string): Promise<GroupRoomDto> => {
    const res = await apiClient.get<ApiResponse<GroupRoomDto>>(`/groups/${id}`);
    return res.data.data;
  },
  join: async (id: string): Promise<GroupRoomDto> => {
    return groupsApi.joinRoom(id);
  },
  leave: async (id: string): Promise<void> => {},
};
