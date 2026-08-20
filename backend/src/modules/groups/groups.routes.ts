import { Router } from 'express';
import { groupsController } from './groups.controller';
import { authenticate } from '../../middleware/auth';

const router = Router();

// Create or get user's group room
router.post('/', authenticate, groupsController.createOrGetGroup);
router.post('/create-or-get', authenticate, groupsController.createOrGetGroup);
router.post('/new-code', authenticate, groupsController.createNewCode);

// Join existing group by room code
router.post('/join', authenticate, groupsController.joinGroup);

// Get group details by room code
router.get('/code/:code', authenticate, groupsController.getGroupByCode);
router.get('/:id', authenticate, groupsController.getGroupByCode);

// Group member actions
router.post('/:code/kick', authenticate, groupsController.kickMember);

// Group spin & voting lifecycle
router.post('/:code/spin', authenticate, groupsController.startSpin);
router.post('/:code/finish-spin', authenticate, groupsController.finishSpin);
router.post('/:code/vote', authenticate, groupsController.vote);
router.post('/:code/reset-spin', authenticate, groupsController.resetSpin);

// Group dish contributions
router.post('/:code/candidates', authenticate, groupsController.addCandidate);
router.delete('/:code/candidates/:candId', authenticate, groupsController.removeCandidate);

export default router;
