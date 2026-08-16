import { Router } from 'express';
import { profileController } from './profile.controller.js';
import { authenticate, optionalAuth } from '../../middleware/auth.js';

const router = Router();

router.get('/me', authenticate, profileController.getMe);
router.patch('/', authenticate, profileController.updateProfile);
router.get('/preferences', authenticate, profileController.getPreferences);
router.put('/preferences', authenticate, profileController.updatePreferences);
router.post('/onboard', authenticate, profileController.completeOnboarding);
router.get('/:publicId', optionalAuth, profileController.getPublicProfile);

export default router;
