import { Router } from 'express';
import { SimulationController } from '../controllers/simulationController';

const router = Router();

router.post('/simulate', SimulationController.simulate);

export default router;
