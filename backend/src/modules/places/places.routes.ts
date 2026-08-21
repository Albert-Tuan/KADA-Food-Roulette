import { Router } from 'express';
import { googlePlacesController } from './places.controller';
import { optionalAuth } from '../../middleware/auth.js';

const router = Router();

// Public: search nearby real places (Google Places / OpenStreetMap)
router.get('/nearby', googlePlacesController.searchNearby);

// Seed nearby real places into DB (auto-approved for Map and Wheel)
router.post('/seed', optionalAuth, googlePlacesController.seed);

export default router;