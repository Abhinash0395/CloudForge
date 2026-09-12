import { Router } from 'express';
import { InsightController } from '../controllers/insightController';

const router = Router();

router.get('/insights', InsightController.getAllInsights);

export default router;
