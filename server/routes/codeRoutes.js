import express from 'express';
import { startCodeReview, nextCodeHint } from '../controllers/codeController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/analyze', protect, startCodeReview);
router.post('/hint', protect, nextCodeHint);
// Compatibility routes removed

export default router;
