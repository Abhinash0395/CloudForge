import { Request, Response } from 'express';
import { prisma } from '../prisma';
import { AIService } from '../ai/aiService';

export class ScenarioController {
  /**
   * List all preset demo scenarios
   */
  public static async getAllScenarios(req: Request, res: Response): Promise<void> {
    try {
      const scenarios = await prisma.scenario.findMany({
        orderBy: { baselineRisk: 'desc' },
      });
      res.status(200).json({ success: true, data: scenarios });
    } catch (error: any) {
      console.error('[ScenarioController.getAllScenarios] Error:', error);
      res.status(500).json({ success: false, message: error.message || 'Failed to fetch scenarios' });
    }
  }

  /**
   * Get single scenario by ID or key
   */
  public static async getScenarioByKey(req: Request, res: Response): Promise<void> {
    try {
      const { key } = req.params;
      const scenario = await prisma.scenario.findFirst({
        where: {
          OR: [{ key }, { id: key }],
        },
      });

      if (!scenario) {
        res.status(404).json({ success: false, message: 'Scenario not found' });
        return;
      }

      res.status(200).json({ success: true, data: scenario });
    } catch (error: any) {
      console.error('[ScenarioController.getScenarioByKey] Error:', error);
      res.status(500).json({ success: false, message: error.message || 'Failed to fetch scenario' });
    }
  }

  /**
   * Run a scenario through the complete prediction and decision pipeline
   */
  public static async runScenario(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const scenario = await prisma.scenario.findFirst({
        where: {
          OR: [{ key: id }, { id }],
        },
      });

      if (!scenario) {
        res.status(404).json({ success: false, message: 'Scenario not found' });
        return;
      }

      const inputData = JSON.parse(scenario.demoData);
      const result = await AIService.analyzeStructured({
        ...inputData,
        scenarioName: `${scenario.name} (Live Run)`,
        category: scenario.category,
      });

      // Create new Analysis record from this scenario run
      const analysis = await prisma.analysis.create({
        data: {
          title: `${scenario.name} - Autonomous Run`,
          category: scenario.category,
          inputType: 'SCENARIO',
          status: 'COMPLETED',
          riskScore: result.riskScore,
          riskLevel: result.riskLevel,
          confidence: result.confidence,
          prediction: result.prediction,
          summary: result.summary,
          timeHorizon: '30 Days',
          tags: JSON.stringify([scenario.category, 'Demo Scenario', `${result.riskLevel} RISK`]),
          inputData: {
            create: {
              rawInput: JSON.stringify(inputData),
              structuredData: JSON.stringify(inputData),
              source: `Preset Scenario: ${scenario.name}`,
            },
          },
          riskFactors: {
            create: result.riskFactors.map((f) => ({
              name: f.name,
              category: f.category,
              contribution: f.contribution,
              severity: f.severity,
              explanation: f.explanation,
              trend: f.trend || 'INCREASING',
              metricValue: f.metricValue,
            })),
          },
          predictions: {
            create: [
              {
                value: result.predictionDetails.value,
                probability: result.predictionDetails.probability,
                confidence: result.predictionDetails.confidence,
                timeHorizon: result.predictionDetails.timeHorizon,
                baselineComparison: result.predictionDetails.baselineComparison,
                trendDirection: result.predictionDetails.trendDirection,
                forecastPoints: JSON.stringify(result.predictionDetails.forecastPoints),
              },
            ],
          },
          recommendations: {
            create: result.recommendations.map((r, idx) => ({
              title: r.title,
              description: r.description,
              priority: r.priority,
              expectedImpact: r.expectedImpact,
              urgency: r.urgency,
              reasoning: r.reasoning,
              status: 'PENDING',
              orderIndex: idx,
            })),
          },
          insights: {
            create: [
              {
                type: 'TREND',
                severity: result.riskLevel === 'CRITICAL' ? 'CRITICAL' : 'HIGH',
                title: `Demo Scenario Executed: ${scenario.name}`,
                description: result.summary,
                affectedFactor: result.riskFactors[0]?.name,
                recommendedAction: result.recommendations[0]?.title,
              },
            ],
          },
        },
        include: {
          riskFactors: true,
          predictions: true,
          recommendations: true,
          inputData: true,
          insights: true,
        },
      });

      res.status(201).json({
        success: true,
        data: {
          ...analysis,
          explainability: result.explainability,
          isAiFallback: result.isAiFallback,
        },
      });
    } catch (error: any) {
      console.error('[ScenarioController.runScenario] Error:', error);
      res.status(500).json({ success: false, message: error.message || 'Failed to run scenario' });
    }
  }
}
