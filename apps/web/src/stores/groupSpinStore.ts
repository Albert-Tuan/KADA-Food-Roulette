import { create } from 'zustand';
import { Restaurant } from './spinStore';

export interface GroupMember {
  id: string;
  name: string;
  avatarUrl: string;
  role: 'HOST' | 'MEMBER';
}

export type VoteDecision = 'ACCEPT' | 'RESPIN' | 'VETO' | null;

export interface GroupVote {
  memberId: string;
  decision: VoteDecision;
}

interface GroupSpinState {
  groupId: string | null;
  members: GroupMember[];
  hostId: string | null;
  candidates: Restaurant[];
  currentResult: Restaurant | null;
  votes: Record<string, VoteDecision>;
  phase: 'LOBBY' | 'WHO_SPINS' | 'SPINNING' | 'VOTING' | 'RESULT';
  spinnerId: string | null;

  // Actions
  joinGroup: (groupId: string, user: GroupMember) => void;
  setPhase: (phase: GroupSpinState['phase']) => void;
  setSpinner: (memberId: string) => void;
  setResult: (restaurant: Restaurant) => void;
  castVote: (memberId: string, decision: VoteDecision) => void;
  resetVotes: () => void;
}

// MOCK DATA
const MOCK_MEMBERS: GroupMember[] = [
  { id: '1', name: '@minh', role: 'HOST', avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Minh' },
  { id: '2', name: '@tuan', role: 'MEMBER', avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Tuan' },
  { id: '3', name: '@lan', role: 'MEMBER', avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Lan' },
  { id: '4', name: '@hoa', role: 'MEMBER', avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Hoa' },
];

export const useGroupSpinStore = create<GroupSpinState>((set) => ({
  groupId: 'mock-group-123',
  members: MOCK_MEMBERS,
  hostId: '1',
  candidates: [], // will be set from spinStore mock
  currentResult: null,
  votes: {},
  phase: 'WHO_SPINS',
  spinnerId: null,

  joinGroup: (groupId, user) => set((state) => ({
    groupId,
    members: [...state.members, user]
  })),

  setPhase: (phase) => set({ phase }),

  setSpinner: (spinnerId) => set({ spinnerId }),

  setResult: (restaurant) => set({ currentResult: restaurant }),

  castVote: (memberId, decision) => set((state) => ({
    votes: {
      ...state.votes,
      [memberId]: decision
    }
  })),

  resetVotes: () => set({ votes: {} }),
}));
