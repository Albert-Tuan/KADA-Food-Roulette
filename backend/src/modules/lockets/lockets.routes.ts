import { Router } from 'express';
import { locketsController } from './lockets.controller';
import { authenticate, optionalAuth } from '../../middleware/auth';
import { checkLocketOwner, checkLocketVisibility } from '../../middleware/locketAuth';

const router = Router();

router.post('/', authenticate, locketsController.create);
router.get('/feed', optionalAuth, locketsController.getFeed);
router.get('/me', authenticate, locketsController.getMyLockets);
router.get('/:id', optionalAuth, checkLocketVisibility, locketsController.getById);
router.patch('/:id', authenticate, checkLocketOwner, locketsController.update);
router.delete('/:id', authenticate, checkLocketOwner, locketsController.remove);

export default router;
