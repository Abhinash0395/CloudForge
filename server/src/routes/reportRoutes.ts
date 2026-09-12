import { Router } from 'express';
import { ReportController } from '../controllers/reportController';

const router = Router();

router.post('/reports', ReportController.generateReport);
router.get('/reports/:id', ReportController.getReportById);

export default router;
