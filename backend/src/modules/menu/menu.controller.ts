import { Request, Response } from 'express';
import fs from 'fs';
import os from 'os';
import path from 'path';
import { menuService } from './menu.service';

export const menuController = {
  captureBase64: async (req: Request, res: Response) => {
    try {
      const { restaurantId = 'rest-1', images } = req.body;
      const userId = req.user?.id || 'anonymous';

      if (!images || !Array.isArray(images) || images.length === 0) {
        return res.status(400).json({ message: 'Vui lòng gửi ít nhất 1 ảnh menu (base64).' });
      }

      console.log(`[menuController.captureBase64] Processing ${images.length} base64 images for restaurant: ${restaurantId}`);

      // Write base64 images to temp files
      const imagePaths: string[] = [];
      for (const img of images) {
        const buffer = Buffer.from(img.base64, 'base64');
        const ext = (img.filename || 'menu.jpg').split('.').pop() || 'jpg';
        const tempPath = path.join(os.tmpdir(), `menu_${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`);
        fs.writeFileSync(tempPath, buffer);
        imagePaths.push(tempPath);
      }

      const result = await menuService.createMenu(restaurantId, userId, imagePaths);

      // Cleanup temp files
      for (const p of imagePaths) {
        try { fs.unlinkSync(p); } catch { /* ignore */ }
      }

      return res.status(201).json(result);
    } catch (error: unknown) {
      const err = error as Error;
      console.error('[menuController.captureBase64 Error]:', err);
      return res.status(500).json({ message: 'Lỗi khi xử lý menu', error: err.message });
    }
  },

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
      
      const imagePaths = files.map((f: Express.Multer.File | { path: string }) => f.path);
      const result = await menuService.createMenu(restaurantId, userId, imagePaths);
      
      return res.status(201).json(result);
    } catch (error: unknown) {
      const err = error as Error;
      console.error('[menuController.capture Error]:', err);
      return res.status(500).json({ message: 'Lỗi khi xử lý menu', error: err.message });
    }
  },

  verify: async (req: Request, res: Response) => {
    try {
      const menuId = req.params.menuId as string;
      const { items } = req.body;
      const userId = req.user?.id || 'anonymous';

      const result = await menuService.verifyMenu(menuId, items, userId);
      return res.status(200).json(result);
    } catch (error: unknown) {
      const err = error as Error;
      return res.status(500).json({ message: 'Lỗi khi xác nhận menu', error: err.message });
    }
  },

  getById: async (req: Request, res: Response) => {
    try {
      const menuId = req.params.menuId as string;
      const result = await menuService.getMenuById(menuId);
      return res.status(200).json(result);
    } catch (error: unknown) {
      const err = error as Error;
      return res.status(404).json({ message: 'Không tìm thấy menu', error: err.message });
    }
  },

  getByRestaurant: async (req: Request, res: Response) => {
    try {
      const restaurantId = req.params.restaurantId as string;
      const result = await menuService.getMenusByRestaurant(restaurantId);
      return res.status(200).json(result);
    } catch (error: unknown) {
      const err = error as Error;
      return res.status(500).json({ message: 'Lỗi khi tải danh sách menu', error: err.message });
    }
  }
};
