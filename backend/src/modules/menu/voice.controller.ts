import { Request, Response } from 'express';
import { analyzeVoiceIntent } from '../../shared/services/voice.service';

export const voiceController = {
  processVoicePick: async (req: Request, res: Response) => {
    try {
      const file = req.file as Express.Multer.File;
      const rawMenuItems = req.body.menuItems;

      if (!file) {
        return res.status(400).json({ message: 'Vui lòng gửi file âm thanh ghi âm.' });
      }

      let menuItems = [];
      if (typeof rawMenuItems === 'string') {
        try {
          menuItems = JSON.parse(rawMenuItems);
        } catch {
          menuItems = [];
        }
      } else if (Array.isArray(rawMenuItems)) {
        menuItems = rawMenuItems;
      }

      console.log(`[voiceController] Processing audio: ${file.filename}, mime: ${file.mimetype}, items: ${menuItems.length}`);

      const mimeType = file.mimetype && file.mimetype.includes('audio') ? file.mimetype : 'audio/m4a';
      const result = await analyzeVoiceIntent(file.path, mimeType, menuItems);

      return res.status(200).json(result);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error('[voiceController] Error processing voice pick:', error);
      return res.status(500).json({
        message: 'Lỗi khi xử lý giọng nói với AI',
        error: errorMessage,
      });
    }
  },
};
