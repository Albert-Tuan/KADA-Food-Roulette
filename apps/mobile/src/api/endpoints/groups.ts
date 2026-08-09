// Groups API endpoints
import apiClient from '../client';

export interface Group {
  id: string;
  name?: string;
  hostId: string;
  status: 'WAITING' | 'SPINNING' | 'VOTING' | 'DONE' | 'CANCELLED';
  maxMembers: number;
  members: GroupMember[];
  spinResult?: string;
  createdAt: string;
}

export interface GroupMember {
  id: string;
  groupId: string;
  userId: string;
  user: {
    id: string;
    displayNamePrivate: string;
    publicId: string;
    avatarUrl?: string;
  };
  status: 'PENDING' | 'ACCEPTED' | 'VETO';
  hasVeto: boolean;
  joinedAt: string;
}

export interface SpinSession {
  id: string;
  groupId: string;
  initiatorId: string;
  candidates: string[];
  result?: string;
  status: 'active' | 'voting' | 'completed' | 'cancelled';
  expiresAt: string;
  votes: Vote[];
}

export interface Vote {
  id: string;
  spinSessionId: string;
  userId: string;
  vote: 'ACCEPT' | 'VETO' | 'ABSTAIN';
}

export const groupsApi = {
  list: async (): Promise<Group[]> => {
    const response = await apiClient.get<Group[]>('/groups');
    return response.data;
  },

  get: async (id: string): Promise<Group> => {
    const response = await apiClient.get<Group>(`/groups/${id}`);
    return response.data;
  },

  create: async (name?: string, maxMembers = 20): Promise<Group> => {
    const response = await apiClient.post<Group>('/groups', { name, maxMembers });
    return response.data;
  },

  join: async (groupId: string): Promise<Group> => {
    const response = await apiClient.post<Group>(`/groups/${groupId}/join`);
    return response.data;
  },

  leave: async (groupId: string): Promise<void> => {
    await apiClient.post(`/groups/${groupId}/leave`);
  },

  startSpin: async (groupId: string, candidates: string[]): Promise<SpinSession> => {
    const response = await apiClient.post<SpinSession>(`/groups/${groupId}/spin`, { candidates });
    return response.data;
  },

  vote: async (spinSessionId: string, vote: 'ACCEPT' | 'VETO'): Promise<Vote> => {
    const response = await apiClient.post<Vote>(`/spin-sessions/${spinSessionId}/vote`, { vote });
    return response.data;
  },
};
