import { Router } from 'express';
import { DecisionController } from '../controllers/decisionController';

const router = Router();

router.get('/decisions', DecisionController.getDecisionQueue);
router.patch('/decisions/:id/status', DecisionController.updateStatus);
router.post('/recommendations/:id/accept', DecisionController.acceptRecommendation);
router.post('/recommendations/:id/save', DecisionController.saveRecommendation);
router.post('/recommendations/:id/dismiss', DecisionController.dismissRecommendation);

export default router;

