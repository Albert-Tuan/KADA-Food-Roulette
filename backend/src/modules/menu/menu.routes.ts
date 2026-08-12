import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { menuController } from './menu.controller';
import { voiceController } from './voice.controller';
import { authenticateJWT } from '../../shared/middleware/auth.middleware';

const router = Router();

const uploadDir = path.resolve(process.cwd(), 'uploads/menus');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname) || '.m4a';
    const uniqueSuffix = Date.now() + '_' + Math.round(Math.random() * 1e6);
    cb(null, 'voice_' + uniqueSuffix + ext);
  },
});

const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  cb(null, true);
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 15 * 1024 * 1024, // 15MB limit
  },
});

router.post('/capture', authenticateJWT, upload.array('menuImages', 5), menuController.capture);
router.post('/', authenticateJWT, upload.array('menuImages', 5), menuController.capture);
router.post('/voice-pick', authenticateJWT, upload.single('audioFile'), voiceController.processVoicePick);
router.post('/:menuId/verify', authenticateJWT, menuController.verify);
router.get('/restaurant/:restaurantId', authenticateJWT, menuController.getByRestaurant);
router.get('/:menuId', authenticateJWT, menuController.getById);

export default router;
