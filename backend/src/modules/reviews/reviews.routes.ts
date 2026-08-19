import { Router } from 'express';
import { reviewsController } from './reviews.controller';
import { authenticateJWT } from '../../shared/middleware/auth.middleware';

const router = Router();

// Public: list reviews by restaurant
router.get('/', reviewsController.listByRestaurant);

import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Setup multer for local uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(process.cwd(), 'uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, 'review-' + uniqueSuffix + ext);
  },
});
const upload = multer({ 
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
});

// Auth required
router.post('/upload', authenticateJWT, upload.single('photo'), reviewsController.uploadPhoto);
router.post('/', authenticateJWT, reviewsController.create);
router.delete('/:id', authenticateJWT, reviewsController.delete);
router.post('/:id/helpful', authenticateJWT, reviewsController.markHelpful);

export default router;