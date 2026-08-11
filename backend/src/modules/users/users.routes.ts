import { Router } from 'express';
import { optionalJWT, requireJWT } from '../../shared/middleware/auth.middleware.js';
import { usersController } from './users.controller.js';

const router = Router();

router.get('/me', requireJWT, usersController.getMe);
router.patch('/me', requireJWT, usersController.updateMe);
router.get('/:publicId', optionalJWT, usersController.getPublic);

export default router;
