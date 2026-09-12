import { Router } from 'express';
import { PredictionController } from '../controllers/predictionController';

const router = Router();

router.post('/predict', PredictionController.predict);
router.get('/predictions/latest', PredictionController.getLatest);

export default router;
