import { Router } from 'express';
import { restaurantsController } from './restaurants.controller';
import { authenticateJWT } from '../../shared/middleware/auth.middleware';

const router = Router();

router.get('/', restaurantsController.getNearby);
router.get('/:id', restaurantsController.getById);
router.post('/', authenticateJWT, restaurantsController.create);
router.put('/:id', authenticateJWT, restaurantsController.updateStatus);

export default router;
