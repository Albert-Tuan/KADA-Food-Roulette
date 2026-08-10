import { Router } from 'express';
import { authenticate } from '../../middleware/auth';
import { friendsController } from './friends.controller';

const router = Router();

router.post('/request', authenticate, friendsController.sendRequest);
router.post('/:friendshipId/accept', authenticate, friendsController.acceptRequest);
router.post('/:friendshipId/reject', authenticate, friendsController.rejectRequest);
router.delete('/:friendshipId', authenticate, friendsController.removeFriend);
router.get('/', authenticate, friendsController.getFriends);
router.get('/pending', authenticate, friendsController.getPendingRequests);

export default router;
