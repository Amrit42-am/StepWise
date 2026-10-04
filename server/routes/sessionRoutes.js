import express from 'express';
import { getSessions, getSessionById } from '../controllers/sessionController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', protect, getSessions);
router.get('/:id', protect, getSessionById);

export default router;
