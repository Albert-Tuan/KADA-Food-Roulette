import { describe, it, expect, vi, beforeEach } from 'vitest';
import { checkLocketOwner, checkLocketVisibility } from '../../../middleware/locketAuth';
import { prisma } from '../../../shared/utils/prisma';
import { Request, Response, NextFunction } from 'express';

vi.mock('../../../shared/utils/prisma', () => {
  const mockPrisma = {
    locket: { findUnique: vi.fn(), create: vi.fn(), update: vi.fn(), findMany: vi.fn() },
    friendship: { findFirst: vi.fn() },
    user: { findUnique: vi.fn(), update: vi.fn() },
  };
  return {
    prisma: mockPrisma,
    default: mockPrisma
  };
});

describe('Locket Middleware', () => {
  let mockReq: any;
  let mockRes: any;
  let mockNext: NextFunction;

  beforeEach(() => {
    vi.clearAllMocks();
    mockReq = {
      params: { id: 'locket-123' },
      user: { id: 'user-1' }
    };
    mockRes = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
      locals: {}
    };
    mockNext = vi.fn();
  });

  describe('checkLocketOwner', () => {
    it('should call next() when user is owner', async () => {
      vi.mocked(prisma.locket.findUnique).mockResolvedValue({ id: 'locket-123', userId: 'user-1' } as any);

      await checkLocketOwner(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(mockRes.locals.locket).toBeDefined();
    });

    it('should return 403 when user is not owner', async () => {
      vi.mocked(prisma.locket.findUnique).mockResolvedValue({ id: 'locket-123', userId: 'user-2' } as any);

      await checkLocketOwner(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(403);
      expect(mockRes.json).toHaveBeenCalledWith({ success: false, error: 'Không có quyền truy cập' });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should return 404 when locket not found', async () => {
      vi.mocked(prisma.locket.findUnique).mockResolvedValue(null);

      await checkLocketOwner(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({ success: false, error: 'Locket không tồn tại' });
      expect(mockNext).not.toHaveBeenCalled();
    });
  });

  describe('checkLocketVisibility', () => {
    it('should allow PUBLIC locket for anonymous', async () => {
      mockReq.user = undefined;
      vi.mocked(prisma.locket.findUnique).mockResolvedValue({ id: 'locket-123', userId: 'user-1', visibility: 'PUBLIC' } as any);

      await checkLocketVisibility(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalled();
    });

    it('should deny PRIVATE locket for non-owner', async () => {
      mockReq.user = { id: 'user-2' };
      vi.mocked(prisma.locket.findUnique).mockResolvedValue({ id: 'locket-123', userId: 'user-1', visibility: 'PRIVATE' } as any);

      await checkLocketVisibility(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(403);
      expect(mockRes.json).toHaveBeenCalledWith({ success: false, error: 'Không có quyền xem' });
    });

    it('should allow PRIVATE locket for owner', async () => {
      mockReq.user = { id: 'user-1' };
      vi.mocked(prisma.locket.findUnique).mockResolvedValue({ id: 'locket-123', userId: 'user-1', visibility: 'PRIVATE' } as any);

      await checkLocketVisibility(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalled();
    });

    it('should allow FRIENDS locket for accepted friend', async () => {
      mockReq.user = { id: 'user-2' };
      vi.mocked(prisma.locket.findUnique).mockResolvedValue({ id: 'locket-123', userId: 'user-1', visibility: 'FRIENDS' } as any);
      vi.mocked(prisma.friendship.findFirst).mockResolvedValue({ id: 'friendship-1', status: 'ACCEPTED' } as any);

      await checkLocketVisibility(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalled();
    });

    it('should deny FRIENDS locket for non-friend', async () => {
      mockReq.user = { id: 'user-3' };
      vi.mocked(prisma.locket.findUnique).mockResolvedValue({ id: 'locket-123', userId: 'user-1', visibility: 'FRIENDS' } as any);
      vi.mocked(prisma.friendship.findFirst).mockResolvedValue(null);

      await checkLocketVisibility(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(403);
      expect(mockRes.json).toHaveBeenCalledWith({ success: false, error: 'Không có quyền xem' });
    });
  });
});
