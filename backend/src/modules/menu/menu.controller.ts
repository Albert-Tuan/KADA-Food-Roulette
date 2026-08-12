import { Request, Response } from 'express';
import { menuService } from './menu.service';

export const menuController = {
  capture: async (req: Request, res: Response) => {
    try {
      const restaurantId = (req.body?.restaurantId || req.query?.restaurantId as string) || 'rest-1';
      const userId = req.user?.id || 'anonymous';
      const rawFiles = req.files || (req.file ? [req.file] : []);
      const files = Array.isArray(rawFiles) ? rawFiles : (typeof rawFiles === 'object' ? Object.values(rawFiles).flat() : []);

      if (!files || files.length === 0) {
        return res.status(400).json({ message: 'Vui lòng tải lên ít nhất 1 ảnh menu.' });
      }

      console.log(`[menuController.capture] Processing menu for restaurant: ${restaurantId}, user: ${userId}, files: ${files.length}`);
      
      const imagePaths = files.map((f: any) => f.path);
      const result = await menuService.createMenu(restaurantId, userId, imagePaths);
      
      return res.status(201).json(result);
    } catch (error: any) {
      console.error('[menuController.capture Error]:', error);
      return res.status(500).json({ message: 'Lỗi khi xử lý menu', error: error.message });
    }
  },

  verify: async (req: Request, res: Response) => {
    try {
      const menuId = req.params.menuId as string;
      const { items } = req.body;
      const userId = req.user?.id || 'anonymous';

      const result = await menuService.verifyMenu(menuId, items, userId);
      return res.status(200).json(result);
    } catch (error: any) {
      return res.status(500).json({ message: 'Lỗi khi xác nhận menu', error: error.message });
    }
  },

  getById: async (req: Request, res: Response) => {
    try {
      const menuId = req.params.menuId as string;
      const result = await menuService.getMenuById(menuId);
      return res.status(200).json(result);
    } catch (error: any) {
      return res.status(404).json({ message: 'Không tìm thấy menu', error: error.message });
    }
  },

  getByRestaurant: async (req: Request, res: Response) => {
    try {
      const restaurantId = req.params.restaurantId as string;
      const result = await menuService.getMenusByRestaurant(restaurantId);
      return res.status(200).json(result);
    } catch (error: any) {
      return res.status(500).json({ message: 'Lỗi khi tải danh sách menu', error: error.message });
    }
  }
};
