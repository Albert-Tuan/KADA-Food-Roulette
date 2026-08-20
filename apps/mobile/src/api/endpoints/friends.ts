import apiClient from '../client';

export interface FriendUser {
  id: string;
  publicId: string;
  displayNamePublic: string;
  avatarUrl: string;
  bio?: string | null;
  role?: string;
  email?: string;
  friendshipId?: string | null;
  friendshipStatus?: 'NONE' | 'PENDING' | 'ACCEPTED';
  isSender?: boolean;
}

export interface PendingFriendRequests {
  incoming: FriendUser[];
  outgoing: FriendUser[];
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
  error?: string;
}

export const friendsApi = {
  // Get accepted friends list
  getFriends: async (): Promise<FriendUser[]> => {
    const res = await apiClient.get<ApiResponse<FriendUser[]>>('/friends');
    return res.data.data || [];
  },

  // Get pending friend requests (incoming & outgoing)
  getPendingRequests: async (): Promise<PendingFriendRequests> => {
    const res = await apiClient.get<ApiResponse<PendingFriendRequests>>('/friends/pending');
    return res.data.data || { incoming: [], outgoing: [] };
  },

  // Search users by name, email, or publicId
  searchUsers: async (query: string): Promise<FriendUser[]> => {
    const res = await apiClient.get<ApiResponse<FriendUser[]>>(`/friends/search?q=${encodeURIComponent(query)}`);
    return res.data.data || [];
  },

  // Send friend request
  sendRequest: async (target: string): Promise<{ id: string; status: string }> => {
    const res = await apiClient.post<ApiResponse<{ id: string; status: string }>>('/friends/request', { target });
    return res.data.data;
  },

  // Accept incoming friend request
  acceptRequest: async (friendshipId: string): Promise<any> => {
    const res = await apiClient.post<ApiResponse<any>>(`/friends/${friendshipId}/accept`);
    return res.data.data;
  },

  // Reject incoming friend request
  rejectRequest: async (friendshipId: string): Promise<any> => {
    const res = await apiClient.post<ApiResponse<any>>(`/friends/${friendshipId}/reject`);
    return res.data.data;
  },

  // Unfriend / Remove friend
  removeFriend: async (friendshipId: string): Promise<any> => {
    const res = await apiClient.delete<ApiResponse<any>>(`/friends/${friendshipId}`);
    return res.data.data;
  },
};
