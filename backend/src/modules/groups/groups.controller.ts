import { Request, Response } from 'express';
import { AuthRequest } from '../../shared/middleware/auth.middleware';
import { prisma } from '../../shared/utils/prisma';

export interface LiveRoomMember {
  id: string;
  name: string;
  avatarUrl: string;
  role: 'HOST' | 'MEMBER';
}

export interface LiveRoomCandidate {
  id: string;
  name: string;
}

export type RoomPhase = 'LOBBY' | 'SPINNING' | 'VOTING' | 'RESULT';

export interface LiveRoom {
  id: string;
  name: string;
  roomCode: string;
  hostId: string;
  status: RoomPhase;
  members: LiveRoomMember[];
  customCandidates: LiveRoomCandidate[];
  votes: Record<string, string>;
  currentResult: any;
  spunAt?: number;
  updatedAt: string;
}

// In-memory live room synchronization store for realtime group spins
const liveRooms = new Map<string, LiveRoom>();

const generateRoomCode = (): string => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let result = '';
  for (let i = 0; i < 4; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `FOOD-${result}`;
};

const getMemberFromUser = async (userId: string, role: 'HOST' | 'MEMBER' = 'MEMBER'): Promise<LiveRoomMember> => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, displayNamePublic: true, displayNamePrivate: true, avatarUrl: true, email: true },
    });

    if (user) {
      return {
        id: user.id,
        name: user.displayNamePublic || user.displayNamePrivate || user.email.split('@')[0],
        avatarUrl: user.avatarUrl || `https://api.dicebear.com/7.x/avataaars/png?seed=${user.email}`,
        role,
      };
    }
  } catch (err) {
    console.error('[Groups] Error fetching user for room:', err);
  }

  return {
    id: userId,
    name: 'Thành viên',
    avatarUrl: `https://api.dicebear.com/7.x/avataaars/png?seed=${userId}`,
    role,
  };
};

export const groupsController = {
  // POST /api/v1/groups/create-or-get (or POST /api/v1/groups)
  createOrGetGroup: async (req: AuthRequest, res: Response) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ success: false, error: 'Chưa đăng nhập.' });
      }

      const hostMember = await getMemberFromUser(userId, 'HOST');

      // Check if user already owns a room
      for (const [code, room] of liveRooms.entries()) {
        if (room.hostId === userId) {
          // Update host info if changed
          room.members = room.members.map(m => (m.id === userId ? { ...m, ...hostMember, role: 'HOST' } : m));
          return res.json({ success: true, data: room });
        }
      }

      const roomCode = generateRoomCode();
      const newRoom: LiveRoom = {
        id: `grp_${Date.now()}`,
        name: 'Phòng Nhậu Roulette',
        roomCode,
        hostId: userId,
        status: 'LOBBY',
        members: [hostMember],
        customCandidates: [],
        votes: {},
        currentResult: null,
        updatedAt: new Date().toISOString(),
      };

      liveRooms.set(roomCode, newRoom);
      return res.status(201).json({ success: true, data: newRoom });
    } catch (error: any) {
      console.error('[Groups] Create group error:', error);
      return res.status(500).json({ success: false, error: 'Lỗi tạo phòng nhóm.' });
    }
  },

  // POST /api/v1/groups/new-code (Host wants to regenerate room code)
  createNewCode: async (req: AuthRequest, res: Response) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ success: false, error: 'Chưa đăng nhập.' });
      }

      const hostMember = await getMemberFromUser(userId, 'HOST');

      // Delete old rooms of this host
      for (const [code, room] of liveRooms.entries()) {
        if (room.hostId === userId) {
          liveRooms.delete(code);
        }
      }

      const newCode = generateRoomCode();
      const newRoom: LiveRoom = {
        id: `grp_${Date.now()}`,
        name: 'Phòng Nhậu Roulette',
        roomCode: newCode,
        hostId: userId,
        status: 'LOBBY',
        members: [hostMember],
        customCandidates: [],
        votes: {},
        currentResult: null,
        updatedAt: new Date().toISOString(),
      };

      liveRooms.set(newCode, newRoom);
      return res.json({ success: true, data: newRoom });
    } catch (error: any) {
      return res.status(500).json({ success: false, error: 'Lỗi đổi mã phòng.' });
    }
  },

  // GET /api/v1/groups/code/:code
  getGroupByCode: async (req: AuthRequest, res: Response) => {
    try {
      const rawCode = String(req.params.code || req.params.id || '').trim().toUpperCase().replace('#', '');
      const room = liveRooms.get(rawCode);

      if (!room) {
        return res.status(404).json({
          success: false,
          error: `Không tìm thấy phòng với mã #${rawCode}. Vui lòng kiểm tra lại mã phòng!`,
        });
      }

      return res.json({ success: true, data: room });
    } catch (error: any) {
      return res.status(500).json({ success: false, error: 'Lỗi lấy thông tin phòng.' });
    }
  },

  // POST /api/v1/groups/join
  joinGroup: async (req: AuthRequest, res: Response) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ success: false, error: 'Chưa đăng nhập.' });
      }

      const { code } = req.body;
      const rawCode = String(code || '').trim().toUpperCase().replace('#', '');

      const room = liveRooms.get(rawCode);
      if (!room) {
        return res.status(404).json({
          success: false,
          error: `Mã phòng #${rawCode} không tồn tại hoặc đã đóng. Hãy nhờ chủ phòng gửi lại mã!`,
        });
      }

      if (room.members.length >= 20) {
        return res.status(400).json({
          success: false,
          error: 'Phòng đã đủ số lượng tối đa (20 người).',
        });
      }

      const joiningMember = await getMemberFromUser(userId, 'MEMBER');

      // If user is already in room, update details
      const existingIdx = room.members.findIndex(m => m.id === userId);
      if (existingIdx >= 0) {
        room.members[existingIdx] = {
          ...room.members[existingIdx],
          ...joiningMember,
          role: room.hostId === userId ? 'HOST' : 'MEMBER',
        };
      } else {
        room.members.push(joiningMember);
      }

      room.updatedAt = new Date().toISOString();
      return res.json({ success: true, data: room });
    } catch (error: any) {
      console.error('[Groups] Join group error:', error);
      return res.status(500).json({ success: false, error: 'Lỗi tham gia phòng.' });
    }
  },

  // POST /api/v1/groups/:code/kick
  kickMember: async (req: AuthRequest, res: Response) => {
    try {
      const userId = req.user?.id;
      const rawCode = String(req.params.code || '').trim().toUpperCase().replace('#', '');
      const { memberId } = req.body;

      if (!userId) {
        return res.status(401).json({ success: false, error: 'Chưa đăng nhập.' });
      }

      const room = liveRooms.get(rawCode);
      if (!room) {
        return res.status(404).json({ success: false, error: 'Phòng không tồn tại.' });
      }

      if (room.hostId !== userId) {
        return res.status(403).json({ success: false, error: 'Chỉ Trưởng Nhóm mới có quyền kick thành viên.' });
      }

      if (memberId === userId) {
        return res.status(400).json({ success: false, error: 'Trưởng nhóm không thể tự kick chính mình.' });
      }

      room.members = room.members.filter(m => m.id !== memberId);
      delete room.votes[memberId];
      room.updatedAt = new Date().toISOString();

      return res.json({ success: true, data: room });
    } catch (error: any) {
      return res.status(500).json({ success: false, error: 'Lỗi kick thành viên.' });
    }
  },

  // POST /api/v1/groups/:code/spin
  startSpin: async (req: AuthRequest, res: Response) => {
    try {
      const userId = req.user?.id;
      const rawCode = String(req.params.code || req.params.id || '').trim().toUpperCase().replace('#', '');
      const { winner } = req.body;

      const room = liveRooms.get(rawCode);
      if (!room) {
        return res.status(404).json({ success: false, error: 'Phòng không tồn tại.' });
      }

      if (room.hostId !== userId) {
        return res.status(403).json({ success: false, error: 'Chỉ Trưởng Nhóm mới có quyền bấm quay vòng!' });
      }

      room.status = 'SPINNING';
      room.currentResult = winner || null;
      room.votes = {};
      room.spunAt = Date.now();
      room.updatedAt = new Date().toISOString();

      return res.json({ success: true, data: room });
    } catch (error: any) {
      return res.status(500).json({ success: false, error: 'Lỗi bắt đầu quay nhóm.' });
    }
  },

  // POST /api/v1/groups/:code/finish-spin
  finishSpin: async (req: AuthRequest, res: Response) => {
    try {
      const rawCode = String(req.params.code || req.params.id || '').trim().toUpperCase().replace('#', '');
      const { winner } = req.body;

      const room = liveRooms.get(rawCode);
      if (!room) {
        return res.status(404).json({ success: false, error: 'Phòng không tồn tại.' });
      }

      room.status = 'VOTING';
      if (winner) {
        room.currentResult = winner;
      }
      room.updatedAt = new Date().toISOString();

      return res.json({ success: true, data: room });
    } catch (error: any) {
      return res.status(500).json({ success: false, error: 'Lỗi chuyển trạng thái vote.' });
    }
  },

  // POST /api/v1/groups/:code/vote
  vote: async (req: AuthRequest, res: Response) => {
    try {
      const userId = req.user?.id;
      const rawCode = String(req.params.code || req.params.id || '').trim().toUpperCase().replace('#', '');
      const { decision } = req.body; // 'ACCEPT' | 'RESPIN' | 'VETO'

      if (!userId) {
        return res.status(401).json({ success: false, error: 'Chưa đăng nhập.' });
      }

      const room = liveRooms.get(rawCode);
      if (!room) {
        return res.status(404).json({ success: false, error: 'Phòng không tồn tại.' });
      }

      if (!['ACCEPT', 'RESPIN', 'VETO'].includes(decision)) {
        return res.status(400).json({ success: false, error: 'Quyết định vote không hợp lệ.' });
      }

      room.votes[userId] = decision;

      // If someone voted RESPIN or VETO and majority wants respin, or if all ACCEPT
      const voteValues = Object.values(room.votes);
      const respinCount = voteValues.filter(v => v === 'RESPIN' || v === 'VETO').length;
      const acceptCount = voteValues.filter(v => v === 'ACCEPT').length;

      // If majority accepts
      if (acceptCount > room.members.length / 2) {
        room.status = 'RESULT';
      } else if (respinCount > room.members.length / 2) {
        room.status = 'LOBBY';
        room.votes = {};
        room.currentResult = null;
      }

      room.updatedAt = new Date().toISOString();
      return res.json({ success: true, data: room });
    } catch (error: any) {
      return res.status(500).json({ success: false, error: 'Lỗi gửi vote.' });
    }
  },

  // POST /api/v1/groups/:code/reset-spin
  resetSpin: async (req: AuthRequest, res: Response) => {
    try {
      const rawCode = String(req.params.code || req.params.id || '').trim().toUpperCase().replace('#', '');
      const room = liveRooms.get(rawCode);
      if (!room) {
        return res.status(404).json({ success: false, error: 'Phòng không tồn tại.' });
      }

      room.status = 'LOBBY';
      room.votes = {};
      room.currentResult = null;
      room.updatedAt = new Date().toISOString();

      return res.json({ success: true, data: room });
    } catch (error: any) {
      return res.status(500).json({ success: false, error: 'Lỗi đặt lại phòng.' });
    }
  },

  // POST /api/v1/groups/:code/candidates
  addCandidate: async (req: AuthRequest, res: Response) => {
    try {
      const rawCode = String(req.params.code || '').trim().toUpperCase().replace('#', '');
      const { name } = req.body;

      if (!name || !name.trim()) {
        return res.status(400).json({ success: false, error: 'Vui lòng nhập tên món ăn.' });
      }

      const room = liveRooms.get(rawCode);
      if (!room) {
        return res.status(404).json({ success: false, error: 'Phòng không tồn tại.' });
      }

      const newCand: LiveRoomCandidate = {
        id: `cand_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        name: name.trim(),
      };

      room.customCandidates.push(newCand);
      room.updatedAt = new Date().toISOString();

      return res.json({ success: true, data: room });
    } catch (error: any) {
      return res.status(500).json({ success: false, error: 'Lỗi thêm món ăn vào nhóm.' });
    }
  },

  // DELETE /api/v1/groups/:code/candidates/:candId
  removeCandidate: async (req: AuthRequest, res: Response) => {
    try {
      const rawCode = String(req.params.code || '').trim().toUpperCase().replace('#', '');
      const candId = String(req.params.candId || '');

      const room = liveRooms.get(rawCode);
      if (!room) {
        return res.status(404).json({ success: false, error: 'Phòng không tồn tại.' });
      }

      room.customCandidates = room.customCandidates.filter(c => c.id !== candId);
      room.updatedAt = new Date().toISOString();

      return res.json({ success: true, data: room });
    } catch (error: any) {
      return res.status(500).json({ success: false, error: 'Lỗi xóa món ăn khỏi nhóm.' });
    }
  },

  // Legacy compatibility handlers
  createGroup: async (req: AuthRequest, res: Response) => {
    return groupsController.createOrGetGroup(req, res);
  },
  listGroups: async (req: AuthRequest, res: Response) => {
    const list = Array.from(liveRooms.values());
    return res.json({ success: true, data: list });
  },
  getGroup: async (req: AuthRequest, res: Response) => {
    return groupsController.getGroupByCode(req, res);
  },
};
