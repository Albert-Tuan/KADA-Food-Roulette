import { create } from 'zustand';
import type { Restaurant, GroupMember, VoteDecision, GroupPhase } from '../features/spin/types';
import { groupsApi, GroupRoomDto, RoomPhase } from '../api/endpoints/groups';

interface GroupSpinState {
  groupId: string | null;
  roomCode: string;
  members: GroupMember[];
  hostId: string | null;
  status: RoomPhase;
  candidates: Restaurant[];
  currentResult: Restaurant | null;
  votes: Record<string, VoteDecision>;
  phase: GroupPhase;
  spinnerId: string | null;
  isJoinedAsGuest: boolean;
  isLoadingRoom: boolean;

  fetchOrInitHostRoom: () => Promise<void>;
  createNewRoom: () => Promise<string>;
  syncRoom: () => Promise<void>;
  joinByCode: (code: string) => Promise<boolean>;
  removeMember: (memberId: string) => Promise<void>;
  inviteMember: (user: GroupMember) => void;
  startGroupSpin: (winner?: Restaurant) => Promise<void>;
  finishGroupSpin: (winner?: Restaurant) => Promise<void>;
  castGroupVote: (decision: 'ACCEPT' | 'RESPIN' | 'VETO') => Promise<void>;
  resetGroupSpin: () => Promise<void>;
  setPhase: (phase: GroupPhase) => void;
  setSpinner: (memberId: string) => void;
  setResult: (restaurant: Restaurant) => void;
  castVote: (memberId: string, decision: VoteDecision) => void;
  resetVotes: () => void;
}

export const useGroupSpinStore = create<GroupSpinState>((set, get) => ({
  groupId: null,
  roomCode: '',
  members: [],
  hostId: null,
  status: 'LOBBY',
  candidates: [],
  currentResult: null,
  votes: {},
  phase: 'LOBBY',
  spinnerId: null,
  isJoinedAsGuest: false,
  isLoadingRoom: false,

  fetchOrInitHostRoom: async () => {
    const state = get();
    // If currently in a joined guest room, sync that room instead of overwriting
    if (state.isJoinedAsGuest && state.roomCode) {
      await get().syncRoom();
      return;
    }

    try {
      set({ isLoadingRoom: true });
      const room = await groupsApi.createOrGetRoom();
      set({
        groupId: room.id,
        roomCode: room.roomCode,
        hostId: room.hostId,
        status: room.status,
        members: room.members,
        votes: room.votes as Record<string, VoteDecision>,
        currentResult: room.currentResult,
        isJoinedAsGuest: false,
        isLoadingRoom: false,
      });
    } catch (err) {
      console.error('[GroupSpinStore] Failed to fetch host room:', err);
      set({ isLoadingRoom: false });
    }
  },

  createNewRoom: async () => {
    try {
      set({ isLoadingRoom: true });
      const room = await groupsApi.createNewCode();
      set({
        groupId: room.id,
        roomCode: room.roomCode,
        hostId: room.hostId,
        status: 'LOBBY',
        members: room.members,
        votes: {},
        currentResult: null,
        isJoinedAsGuest: false,
        isLoadingRoom: false,
      });
      return room.roomCode;
    } catch (err) {
      console.error('[GroupSpinStore] Failed to create new code:', err);
      set({ isLoadingRoom: false });
      return get().roomCode;
    }
  },

  syncRoom: async () => {
    const code = get().roomCode;
    if (!code) return;

    try {
      const room = await groupsApi.getRoomByCode(code);
      set({
        groupId: room.id,
        roomCode: room.roomCode,
        hostId: room.hostId,
        status: room.status,
        members: room.members,
        votes: room.votes as Record<string, VoteDecision>,
        currentResult: room.currentResult || get().currentResult,
      });
    } catch (err) {
      console.log('[GroupSpinStore] Sync room check:', err);
    }
  },

  joinByCode: async (code: string) => {
    const cleanCode = code.trim().toUpperCase().replace('#', '');
    if (!cleanCode) return false;

    try {
      set({ isLoadingRoom: true });
      const room = await groupsApi.joinRoom(cleanCode);
      set({
        groupId: room.id,
        roomCode: room.roomCode,
        hostId: room.hostId,
        status: room.status,
        members: room.members,
        votes: room.votes as Record<string, VoteDecision>,
        currentResult: room.currentResult,
        isJoinedAsGuest: true,
        isLoadingRoom: false,
      });
      return true;
    } catch (err: any) {
      console.error('[GroupSpinStore] Join room failed:', err);
      set({ isLoadingRoom: false });
      throw err;
    }
  },

  removeMember: async (memberId: string) => {
    const code = get().roomCode;
    if (!code) return;

    try {
      const updatedRoom = await groupsApi.kickMember(code, memberId);
      set({
        members: updatedRoom.members,
      });
    } catch (err) {
      console.error('[GroupSpinStore] Kick member failed:', err);
      set((state) => ({
        members: state.members.filter((m) => m.id !== memberId),
      }));
    }
  },

  inviteMember: (user: GroupMember) =>
    set((state) => {
      if (state.members.length >= 20) return state;
      return {
        members: state.members.some((m) => m.id === user.id) ? state.members : [...state.members, user],
      };
    }),

  startGroupSpin: async (winner?: Restaurant) => {
    const code = get().roomCode;
    if (!code) return;

    try {
      const room = await groupsApi.startSpin(code, winner);
      set({
        status: 'SPINNING',
        currentResult: winner || room.currentResult,
        votes: {},
      });
    } catch (err) {
      console.error('[GroupSpinStore] Start spin failed:', err);
    }
  },

  finishGroupSpin: async (winner?: Restaurant) => {
    const code = get().roomCode;
    if (!code) return;

    try {
      const room = await groupsApi.finishSpin(code, winner);
      set({
        status: 'VOTING',
        currentResult: winner || room.currentResult,
      });
    } catch (err) {
      console.error('[GroupSpinStore] Finish spin failed:', err);
    }
  },

  castGroupVote: async (decision: 'ACCEPT' | 'RESPIN' | 'VETO') => {
    const code = get().roomCode;
    if (!code) return;

    try {
      const room = await groupsApi.vote(code, decision);
      set({
        status: room.status,
        votes: room.votes as Record<string, VoteDecision>,
        currentResult: room.currentResult,
      });
    } catch (err) {
      console.error('[GroupSpinStore] Cast vote failed:', err);
    }
  },

  resetGroupSpin: async () => {
    const code = get().roomCode;
    if (!code) return;

    try {
      const room = await groupsApi.resetSpin(code);
      set({
        status: 'LOBBY',
        votes: {},
        currentResult: null,
      });
    } catch (err) {
      console.error('[GroupSpinStore] Reset spin failed:', err);
    }
  },

  setPhase: (phase) => set({ phase }),

  setSpinner: (spinnerId) => set({ spinnerId }),

  setResult: (restaurant) => set({ currentResult: restaurant }),

  castVote: (memberId, decision) =>
    set((state) => ({
      votes: {
        ...state.votes,
        [memberId]: decision,
      },
    })),

  resetVotes: () => set({ votes: {} }),
}));
