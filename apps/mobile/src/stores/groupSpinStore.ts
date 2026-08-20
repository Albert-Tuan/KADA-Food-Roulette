import { create } from 'zustand';
import type { Restaurant, GroupMember, VoteDecision, GroupPhase } from '../features/spin/types';

interface GroupSpinState {
  groupId: string | null;
  roomCode: string;
  members: GroupMember[];
  hostId: string | null;
  candidates: Restaurant[];
  currentResult: Restaurant | null;
  votes: Record<string, VoteDecision>;
  phase: GroupPhase;
  spinnerId: string | null;

  joinGroup: (groupId: string, user: GroupMember) => void;
  inviteMember: (user: GroupMember) => void;
  removeMember: (memberId: string) => void;
  setRoomCode: (code: string) => void;
  joinByCode: (code: string, user?: GroupMember) => boolean;
  setPhase: (phase: GroupPhase) => void;
  setSpinner: (memberId: string) => void;
  setResult: (restaurant: Restaurant) => void;
  castVote: (memberId: string, decision: VoteDecision) => void;
  resetVotes: () => void;
}

const MOCK_MEMBERS: GroupMember[] = [
  { id: '1', name: '@minh', role: 'HOST', avatarUrl: 'https://api.dicebear.com/7.x/avataaars/png?seed=Minh' },
  { id: '2', name: '@tuan', role: 'MEMBER', avatarUrl: 'https://api.dicebear.com/7.x/avataaars/png?seed=Tuan' },
  { id: '3', name: '@lan', role: 'MEMBER', avatarUrl: 'https://api.dicebear.com/7.x/avataaars/png?seed=Lan' },
  { id: '4', name: '@hoa', role: 'MEMBER', avatarUrl: 'https://api.dicebear.com/7.x/avataaars/png?seed=Hoa' },
];

export const useGroupSpinStore = create<GroupSpinState>((set, get) => ({
  groupId: 'mock-group-123',
  roomCode: 'PARTY2026',
  members: MOCK_MEMBERS,
  hostId: '1',
  candidates: [],
  currentResult: null,
  votes: {},
  phase: 'LOBBY',
  spinnerId: null,

  joinGroup: (groupId, user) => set((state) => ({
    groupId,
    members: state.members.some(m => m.id === user.id) ? state.members : [...state.members, user],
  })),

  inviteMember: (user) => set((state) => {
    if (state.members.length >= 20) return state; // Core invariant: max 20 members
    return {
      members: state.members.some(m => m.id === user.id) ? state.members : [...state.members, user],
    };
  }),

  removeMember: (memberId) => set((state) => ({
    members: state.members.filter(m => m.id !== memberId),
  })),

  setRoomCode: (code) => set({ roomCode: code.toUpperCase() }),

  joinByCode: (code, user) => {
    const cleanCode = code.trim().toUpperCase().replace('#', '');
    if (!cleanCode) return false;
    const defaultUser: GroupMember = user || {
      id: `user-${Date.now().toString().slice(-4)}`,
      name: '@ban_moi',
      role: 'MEMBER',
      avatarUrl: `https://api.dicebear.com/7.x/avataaars/png?seed=${cleanCode}`,
    };
    set((state) => ({
      roomCode: cleanCode,
      members: state.members.some(m => m.id === defaultUser.id) ? state.members : [...state.members, defaultUser],
    }));
    return true;
  },

  setPhase: (phase) => set({ phase }),

  setSpinner: (spinnerId) => set({ spinnerId }),

  setResult: (restaurant) => set({ currentResult: restaurant }),

  castVote: (memberId, decision) => set((state) => ({
    votes: {
      ...state.votes,
      [memberId]: decision,
    },
  })),

  resetVotes: () => set({ votes: {} }),
}));
