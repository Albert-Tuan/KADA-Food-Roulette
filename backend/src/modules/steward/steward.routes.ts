import { Router } from 'express';
import { stewardController } from './steward.controller';
import { authenticateJWT, requireRole } from '../../shared/middleware/auth.middleware';

const router = Router();

router.get('/pending-restaurants', authenticateJWT, requireRole(['STEWARD', 'ADMIN']), stewardController.getPending);
router.post('/approve-restaurant/:id', authenticateJWT, requireRole(['STEWARD', 'ADMIN']), stewardController.approve);

export default router;
