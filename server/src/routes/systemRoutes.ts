import { Router } from 'express';
import { SystemController } from '../controllers/systemController';

const router = Router();

router.get('/health', SystemController.health);
router.get('/status/ai', SystemController.getAiStatus);
router.get('/stats/overview', SystemController.getOverviewStats);
router.get('/notifications', SystemController.getNotifications);
router.post('/notifications/read-all', SystemController.markNotificationsRead);

export default router;
