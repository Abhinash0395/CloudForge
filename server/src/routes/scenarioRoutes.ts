import { Router } from 'express';
import { ScenarioController } from '../controllers/scenarioController';

const router = Router();

router.get('/scenarios', ScenarioController.getAllScenarios);
router.get('/scenarios/:key', ScenarioController.getScenarioByKey);
router.post('/scenarios/:id/run', ScenarioController.runScenario);

export default router;
