import express from 'express';
import { startApproach, nextApproachHint } from '../controllers/approachController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/start', protect, startApproach);
router.post('/next', protect, nextApproachHint);
// Compatibility routes removed

export default router;
