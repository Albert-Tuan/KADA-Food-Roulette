import { Router } from 'express';
import { authController } from './auth.controller';
import { authenticateJWT } from '../../shared/middleware/auth.middleware';

const router = Router();

router.post('/register', authController.register);
router.post('/login', authController.login);
router.get('/me', authenticateJWT, authController.me);
router.post('/google', authController.google);
router.post('/onboarding', authenticateJWT, authController.onboarding);
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password', authController.resetPassword);
router.post('/refresh', authController.refresh);

export default router;
