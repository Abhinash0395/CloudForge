import { Request, Response } from 'express';
import { prisma } from '../prisma';
import { AIService } from '../ai/aiService';
import { VisionService } from '../services/visionService';

export class AnalysisController {
  /**
   * Run new structured risk analysis
   */
  public static async analyzeStructured(req: Request, res: Response): Promise<void> {
    try {
      const data = req.body;
      const title = data.scenarioName || data.title || 'Structured Telemetry Risk Assessment';
      const category = data.category || 'Operational Risk';

      // Run AI/ML pipeline analysis
      const result = await AIService.analyzeStructured(data);

      // Save to database
      const analysis = await prisma.analysis.create({
        data: {
          title,
          category,
          inputType: 'STRUCTURED',
          status: 'COMPLETED',
          mode: data.mode === 'LIVE' ? 'LIVE' : 'DEMO',
          location: data.location || null,
          dataQuality: 'HIGH',
          dataFreshness: data.mode === 'LIVE' ? 'Live Streaming' : 'Demo Sandbox',
          calculationMethod: 'Heuristic Multi-Factor Neural & Domain Weighting Matrix',
          riskScore: result.riskScore,
          riskLevel: result.riskLevel,
          confidence: result.confidence,
          prediction: result.prediction,
          summary: result.summary,
          timeHorizon: result.predictionDetails.timeHorizon || '30 Days',
          tags: JSON.stringify([data.mode === 'LIVE' ? 'LIVE DATA' : 'DEMO DATA', category, `${result.riskLevel} RISK`, 'Telemetry']),
          inputData: {
            create: {
              rawInput: JSON.stringify(data),
              structuredData: JSON.stringify(data),
              source: 'Structured Parameter Form',
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
                type: 'RISK_CHANGE',
                severity: result.riskLevel === 'CRITICAL' ? 'CRITICAL' : 'HIGH',
                title: `Risk Score Evaluated at ${result.riskScore}/100`,
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
      console.error('[AnalysisController.analyzeStructured] Error:', error);
      res.status(500).json({ success: false, message: error.message || 'Analysis processing failed' });
    }
  }

  /**
   * Run Natural Language text analysis
   */
  public static async analyzeText(req: Request, res: Response): Promise<void> {
    try {
      const { text, title, category } = req.body;
      if (!text || text.trim().length === 0) {
        res.status(400).json({ success: false, message: 'Text input is required' });
        return;
      }

      const result = await AIService.analyzeText(text);
      const analysisTitle = title || `Narrative Assessment: ${text.substring(0, 45)}...`;
      const analysisCategory = category || 'Operational Risk';

      const analysis = await prisma.analysis.create({
        data: {
          title: analysisTitle,
          category: analysisCategory,
          inputType: 'TEXT',
          status: 'COMPLETED',
          riskScore: result.riskScore,
          riskLevel: result.riskLevel,
          confidence: result.confidence,
          prediction: result.prediction,
          summary: result.summary,
          timeHorizon: '30 Days',
          tags: JSON.stringify([analysisCategory, 'NLP', `${result.riskLevel} RISK`]),
          inputData: {
            create: {
              rawInput: text,
              source: 'Natural Language Stream',
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
                type: 'ANOMALY',
                severity: result.riskLevel === 'CRITICAL' ? 'CRITICAL' : 'HIGH',
                title: 'Natural Language Risk Extraction Completed',
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
      console.error('[AnalysisController.analyzeText] Error:', error);
      res.status(500).json({ success: false, message: error.message || 'Text analysis failed' });
    }
  }

  /**
   * Run Computer Vision Image Analysis
   */
  public static async analyzeImage(req: Request, res: Response): Promise<void> {
    try {
      let imageUrl = '/uploads/demo_structural_scan.jpg';
      let imageName = 'Structural_Inspection_Scan.jpg';

      if (req.file) {
        imageUrl = `/uploads/${req.file.filename}`;
        imageName = req.file.originalname;
      } else if (req.body.imageUrl) {
        imageUrl = req.body.imageUrl;
        imageName = req.body.imageName || 'Asset_Scan.jpg';
      }

      const visionResult = VisionService.analyzeImage(imageUrl, imageName);

      res.status(200).json({
        success: true,
        data: visionResult,
      });
    } catch (error: any) {
      console.error('[AnalysisController.analyzeImage] Error:', error);
      res.status(500).json({ success: false, message: error.message || 'Image analysis failed' });
    }
  }

  /**
   * Get all analyses with optional pagination and filtering
   */
  public static async getAllAnalyses(req: Request, res: Response): Promise<void> {
    try {
      const { category, riskLevel, mode, search, limit = 50 } = req.query;

      const where: any = {};
      if (category && category !== 'ALL') {
        where.category = String(category);
      }
      if (riskLevel && riskLevel !== 'ALL') {
        where.riskLevel = String(riskLevel);
      }
      if (mode && mode !== 'ALL') {
        where.mode = String(mode);
      }
      if (search) {
        where.OR = [
          { title: { contains: String(search) } },
          { summary: { contains: String(search) } },
          { category: { contains: String(search) } },
        ];
      }

      const analyses = await prisma.analysis.findMany({
        where,
        take: Number(limit),
        orderBy: { createdAt: 'desc' },
        include: {
          riskFactors: true,
          predictions: true,
          recommendations: true,
          inputData: true,
        },
      });

      res.status(200).json({ success: true, data: analyses });
    } catch (error: any) {
      console.error('[AnalysisController.getAllAnalyses] Error:', error);
      res.status(500).json({ success: false, message: error.message || 'Failed to fetch analyses' });
    }
  }

  /**
   * Get analysis by ID
   */
  public static async getAnalysisById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const analysis = await prisma.analysis.findUnique({
        where: { id },
        include: {
          riskFactors: true,
          predictions: true,
          recommendations: true,
          inputData: true,
          insights: true,
          reports: true,
          imageAnalysis: true,
        },
      });

      if (!analysis) {
        res.status(404).json({ success: false, message: 'Analysis record not found' });
        return;
      }

      res.status(200).json({ success: true, data: analysis });
    } catch (error: any) {
      console.error('[AnalysisController.getAnalysisById] Error:', error);
      res.status(500).json({ success: false, message: error.message || 'Failed to fetch analysis' });
    }
  }

  /**
   * Delete analysis by ID
   */
  public static async deleteAnalysis(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      await prisma.analysis.delete({ where: { id } });
      res.status(200).json({ success: true, message: 'Analysis deleted successfully' });
    } catch (error: any) {
      console.error('[AnalysisController.deleteAnalysis] Error:', error);
      res.status(500).json({ success: false, message: error.message || 'Failed to delete analysis' });
    }
  }
}
