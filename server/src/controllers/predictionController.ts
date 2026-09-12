import { Request, Response } from 'express';
import { prisma } from '../prisma';
import { PredictionEngine } from '../services/predictionEngine';

export class PredictionController {
  /**
   * Run standalone prediction forecast
   */
  public static async predict(req: Request, res: Response): Promise<void> {
    try {
      const { riskScore = 72, horizon = '30 Days', category = 'Operational' } = req.body;
      const forecastPoints = PredictionEngine.generateForecastTimeline(Number(riskScore), horizon);
      
      const currentPoint = forecastPoints.find(p => p.period === 'Now') || forecastPoints[0];
      const targetPoint = forecastPoints[forecastPoints.length - 1];

      res.status(200).json({
        success: true,
        data: {
          currentRisk: riskScore,
          predictedRisk: targetPoint.predicted,
          probability: Math.round((0.65 + (riskScore / 300)) * 100) / 100,
          confidence: currentPoint.confidence,
          horizon,
          category,
          forecastTimeline: forecastPoints,
          deltaVsBaseline: Math.round((targetPoint.predicted! - riskScore) * 10) / 10,
        },
      });
    } catch (error: any) {
      console.error('[PredictionController.predict] Error:', error);
      res.status(500).json({ success: false, message: error.message || 'Prediction calculation failed' });
    }
  }

  /**
   * Get latest prediction overview
   */
  public static async getLatest(req: Request, res: Response): Promise<void> {
    try {
      const latestAnalysis = await prisma.analysis.findFirst({
        orderBy: { createdAt: 'desc' },
        include: {
          predictions: true,
          riskFactors: true,
        },
      });

      if (!latestAnalysis) {
        // Return default high-impact prediction if db empty
        const defaultTimeline = PredictionEngine.generateForecastTimeline(72, '30 Days');
        res.status(200).json({
          success: true,
          data: {
            currentRisk: 72,
            predictedRisk: 84,
            probability: 0.82,
            confidence: 0.89,
            horizon: 'Next 30 Days',
            trendDirection: 'INCREASING',
            forecastTimeline: defaultTimeline,
          },
        });
        return;
      }

      const prediction = latestAnalysis.predictions?.[0];
      let forecastTimeline: any[] = [];
      if (prediction?.forecastPoints) {
        try {
          const parsed = JSON.parse(prediction.forecastPoints);
          if (Array.isArray(parsed) && parsed.length > 0) {
            forecastTimeline = parsed.map((item: any) => ({
              period: item.period || item.time || 'T',
              time: item.time || item.period || 'T',
              historical: item.historical !== undefined ? item.historical : (item.period === 'Now' ? latestAnalysis.riskScore : undefined),
              predicted: item.predicted !== undefined ? item.predicted : (item.predictedRisk !== undefined ? item.predictedRisk : undefined),
              lowerBound: item.lowerBound !== undefined ? item.lowerBound : (item.predicted !== undefined ? Math.max(0, Math.round((item.predicted - 4) * 10) / 10) : undefined),
              upperBound: item.upperBound !== undefined ? item.upperBound : (item.predicted !== undefined ? Math.min(100, Math.round((item.predicted + 4) * 10) / 10) : undefined),
              confidence: item.confidence || latestAnalysis.confidence || 0.88,
              rainfallMm: item.rainfallMm,
              temperatureC: item.temperatureC,
            }));
          }
        } catch (e) {
          console.warn('Failed to parse forecastPoints JSON:', e);
        }
      }

      if (forecastTimeline.length === 0) {
        forecastTimeline = PredictionEngine.generateForecastTimeline(latestAnalysis.riskScore, latestAnalysis.timeHorizon);
      }

      const futurePoints = forecastTimeline.filter((p: any) => p.predicted !== undefined && p.period !== 'Now');
      const targetPoint = futurePoints.length > 0 ? futurePoints[futurePoints.length - 1] : forecastTimeline[forecastTimeline.length - 1];
      const predictedRisk = targetPoint?.predicted !== undefined ? targetPoint.predicted : Math.min(100, Math.round(latestAnalysis.riskScore * 1.15 * 10) / 10);
      const deltaVsBaseline = Number((predictedRisk - latestAnalysis.riskScore).toFixed(1));

      res.status(200).json({
        success: true,
        data: {
          analysisId: latestAnalysis.id,
          title: latestAnalysis.title,
          category: latestAnalysis.category,
          currentRisk: latestAnalysis.riskScore,
          riskLevel: latestAnalysis.riskLevel,
          predictedRisk,
          deltaVsBaseline,
          probability: prediction?.probability || 0.84,
          confidence: latestAnalysis.confidence,
          predictionStatement: latestAnalysis.prediction,
          timeHorizon: latestAnalysis.timeHorizon,
          forecastTimeline,
          riskFactors: latestAnalysis.riskFactors,
        },
      });
    } catch (error: any) {
      console.error('[PredictionController.getLatest] Error:', error);
      res.status(500).json({ success: false, message: error.message || 'Failed to fetch latest prediction' });
    }
  }
}
