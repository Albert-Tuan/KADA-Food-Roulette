import { Request, Response } from 'express';
import { AuthRequest } from '../../shared/middleware/auth.middleware';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const stewardController = {
  // GET /api/steward/pending-restaurants
  getPending: async (req: AuthRequest, res: Response) => {
    try {
      const page = Number(req.query.page) || 1;
      const pageSize = Number(req.query.pageSize) || 20;
      
      const total = await prisma.restaurant.count({
        where: { status: 'PENDING' }
      });
      
      const pendingList = await prisma.restaurant.findMany({
        where: { status: 'PENDING' },
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { createdAt: 'desc' }
      });

      return res.json({
        success: true,
        data: {
          restaurants: pendingList.map(r => ({
            ...r,
            lat: r.lat ? Number(r.lat) : null,
            lng: r.lng ? Number(r.lng) : null,
          })),
          pagination: { page, pageSize, total, totalPages: Math.ceil(total / pageSize) }
        }
      });
    } catch (error: any) {
      console.error('Error in getPending:', error);
      return res.status(500).json({ error: 'Lỗi lấy danh sách quán chờ duyệt.' });
    }
  },

  // POST /api/steward/approve-restaurant/:id
  approve: async (req: AuthRequest, res: Response) => {
    try {
      const { id } = req.params;
      const { action, notes } = req.body; // 'APPROVE' | 'REJECT'

      if (!['APPROVE', 'REJECT'].includes(action)) {
        return res.status(400).json({ error: 'Action không hợp lệ.' });
      }

      const status = action === 'APPROVE' ? 'APPROVED' : 'REJECTED';
      
      const updated = await prisma.restaurant.update({
        where: { id: id as string },
        data: { status } // assuming we don't save notes in this simple version
      });

      return res.json({
        success: true,
        message: action === 'APPROVE' ? `Đã duyệt quán ${updated.name} thành công!` : `Đã từ chối quán ${updated.name}.`,
      });
    } catch (error: any) {
      console.error('Error in approve:', error);
      return res.status(500).json({ error: 'Lỗi duyệt quán.' });
    }
  },
};
