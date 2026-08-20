import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { menuController } from './menu.controller';
import { voiceController } from './voice.controller';
import { optionalAuth } from '../../middleware/auth.js';

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
    const ext = path.extname(file.originalname) || '.jpg';
    const uniqueSuffix = Date.now() + '_' + Math.round(Math.random() * 1e6);
    cb(null, 'menu_' + uniqueSuffix + ext);
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

router.post('/capture-base64', optionalAuth, menuController.captureBase64);
router.post('/capture', optionalAuth, upload.any(), menuController.capture);
router.post('/', optionalAuth, upload.any(), menuController.capture);
router.post('/voice-pick', optionalAuth, upload.single('audioFile'), voiceController.processVoicePick);
router.post('/:menuId/verify', optionalAuth, menuController.verify);
router.get('/restaurant/:restaurantId', optionalAuth, menuController.getByRestaurant);
router.get('/:menuId', optionalAuth, menuController.getById);

export default router;
