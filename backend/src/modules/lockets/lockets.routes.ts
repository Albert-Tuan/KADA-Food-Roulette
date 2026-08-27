import { Router, type NextFunction, type Request, type Response } from 'express';
import multer from 'multer';
import { optionalJWT, requireJWT } from '../../shared/middleware/auth.middleware.js';
import { locketsController } from './lockets.controller.js';
import { MAX_LOCKET_FILE_SIZE } from './lockets.validation.js';

const router = Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_LOCKET_FILE_SIZE, files: 1, fields: 12 },
});

function uploadLocketImage(req: Request, res: Response, next: NextFunction) {
  upload.single('image')(req, res, (error: unknown) => {
    if (!error) return next();
    if (req.body && (req.body.image_base64 || req.body.image)) {
      return next();
    }
    const message = error instanceof multer.MulterError && error.code === 'LIMIT_FILE_SIZE'
      ? 'Ảnh vượt quá giới hạn 10 MB.'
      : 'Multipart upload không hợp lệ.';
    return res.status(400).json({
      success: false,
      error: { code: 'LOCKET_UPLOAD_INVALID', message },
    });
  });
}

router.get(
  '/media/:namespace/:userId/:locketId/:fileName',
  optionalJWT,
  locketsController.getMedia,
);
router.get('/me', requireJWT, locketsController.getMine);
router.get('/feed', optionalJWT, locketsController.getFeed);
router.get('/', optionalJWT, locketsController.getFeed);
router.post('/', requireJWT, uploadLocketImage, locketsController.create);
router.post('/:id/like', requireJWT, locketsController.like);
router.delete('/:id/like', requireJWT, locketsController.unlike);
router.get('/:id', optionalJWT, locketsController.getById);
router.patch('/:id', requireJWT, locketsController.update);
router.delete('/:id', requireJWT, locketsController.delete);

export default router;
