import { Request, Response, NextFunction } from 'express';
import prisma from '../shared/utils/prisma';

export interface AuthRequest extends Request {
  user?: { id: string; email: string; role: string };
}

export const checkLocketOwner = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const locket = await prisma.locket.findUnique({ where: { id } });

    if (!locket) {
      return res.status(404).json({ success: false, error: 'Locket không tồn tại' });
    }

    if (locket.userId !== req.user?.id) {
      return res.status(403).json({ success: false, error: 'Không có quyền truy cập' });
    }

    res.locals.locket = locket;
    next();
  } catch (error) {
    return res.status(500).json({ success: false, error: 'Lỗi máy chủ' });
  }
};

export const checkLocketVisibility = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const viewerId = req.user?.id;
    const locket = await prisma.locket.findUnique({ where: { id } });

    if (!locket) {
      return res.status(404).json({ success: false, error: 'Locket không tồn tại' });
    }

    if (locket.visibility === 'PUBLIC') {
      res.locals.locket = locket;
      return next();
    }

    if (locket.visibility === 'PRIVATE') {
      if (locket.userId === viewerId) {
        res.locals.locket = locket;
        return next();
      }
      return res.status(403).json({ success: false, error: 'Không có quyền xem' });
    }

    if (locket.visibility === 'FRIENDS') {
      if (locket.userId === viewerId) {
        res.locals.locket = locket;
        return next();
      }

      if (!viewerId) {
        return res.status(403).json({ success: false, error: 'Cần đăng nhập để xem' });
      }

      const friendship = await prisma.friendship.findFirst({
        where: {
          OR: [
            { requesterId: locket.userId, addresseeId: viewerId, status: 'ACCEPTED' },
            { requesterId: viewerId, addresseeId: locket.userId, status: 'ACCEPTED' }
          ]
        }
      });

      if (friendship) {
        res.locals.locket = locket;
        return next();
      }

      return res.status(403).json({ success: false, error: 'Không có quyền xem' });
    }

    return res.status(403).json({ success: false, error: 'Không có quyền xem' });
  } catch (error) {
    return res.status(500).json({ success: false, error: 'Lỗi máy chủ' });
  }
};
