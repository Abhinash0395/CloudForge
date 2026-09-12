import { Request, Response } from 'express';
import { SimulationEngine, FactorAdjustment } from '../services/simulationEngine';

export class SimulationController {
  /**
   * Run What-If Simulation
   */
  public static async simulate(req: Request, res: Response): Promise<void> {
    try {
      const { baselineRisk = 72, factors = [] } = req.body;

      const defaultFactors: FactorAdjustment[] = factors.length > 0 ? factors : [
        { name: 'Operational Load Spike', originalContribution: 34.0, deltaPercent: 15 },
        { name: 'Environmental Exposure Variance', originalContribution: 26.5, deltaPercent: -10 },
        { name: 'Thermal & Telemetry Gradient', originalContribution: 22.0, deltaPercent: 25 },
        { name: 'Historical Incident Recurrence', originalContribution: 17.5, deltaPercent: 0 },
      ];

      const result = SimulationEngine.runWhatIfSimulation(Number(baselineRisk), defaultFactors);

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error: any) {
      console.error('[SimulationController.simulate] Error:', error);
      res.status(500).json({ success: false, message: error.message || 'Simulation execution failed' });
    }
  }
}
