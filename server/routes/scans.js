import express from 'express';
import { getScans, createScan } from '../controllers/scanController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.route('/')
    .get(protect, getScans)
    .post(protect, createScan);

export default router;
