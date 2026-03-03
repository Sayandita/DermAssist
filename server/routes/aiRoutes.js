import express from 'express';
import { analyzeImage } from '../controllers/aiController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.post('/analyze', protect, analyzeImage);

export default router;
