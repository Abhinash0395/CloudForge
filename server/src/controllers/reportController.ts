import { Request, Response } from 'express';
import { prisma } from '../prisma';

export class ReportController {
  /**
   * Generate or fetch report for an analysis
   */
  public static async generateReport(req: Request, res: Response): Promise<void> {
    try {
      const { analysisId, title = 'RiskLens Executive Risk Intelligence Report' } = req.body;

      if (!analysisId) {
        res.status(400).json({ success: false, message: 'analysisId is required' });
        return;
      }

      const analysis = await prisma.analysis.findUnique({
        where: { id: analysisId },
        include: {
          riskFactors: true,
          predictions: true,
          recommendations: true,
          inputData: true,
        },
      });

      if (!analysis) {
        res.status(404).json({ success: false, message: 'Analysis record not found' });
        return;
      }

      const reportPayload = {
        reportId: `RL-REP-${Date.now().toString(36).toUpperCase()}`,
        generatedAt: new Date().toISOString(),
        classification: 'ENTERPRISE AI DECISION INTELLIGENCE',
        track: 'Track 01 — AI, ML & Emerging Technologies',
        problemStatement: 'PS 05 — AI for Prediction & Decision Support',
        analysisSummary: {
          id: analysis.id,
          title: analysis.title,
          category: analysis.category,
          riskScore: analysis.riskScore,
          riskLevel: analysis.riskLevel,
          confidence: analysis.confidence,
          prediction: analysis.prediction,
          summary: analysis.summary,
          timeHorizon: analysis.timeHorizon,
          createdAt: analysis.createdAt,
        },
        riskFactors: analysis.riskFactors,
        predictions: analysis.predictions,
        recommendations: analysis.recommendations,
        executiveDisclaimer: 'Generated autonomously by RiskLens AI Decision Engine. Recommendations are intended for decision support and risk mitigation planning.',
      };

      const report = await prisma.report.create({
        data: {
          analysisId: analysis.id,
          title,
          format: 'EXECUTIVE_PDF',
          content: JSON.stringify(reportPayload),
          status: 'GENERATED',
          generatedBy: 'RiskLens AI Decision Engine v4.2',
        },
      });

      res.status(201).json({
        success: true,
        data: {
          id: report.id,
          title: report.title,
          content: reportPayload,
          createdAt: report.createdAt,
        },
      });
    } catch (error: any) {
      console.error('[ReportController.generateReport] Error:', error);
      res.status(500).json({ success: false, message: error.message || 'Report generation failed' });
    }
  }

  /**
   * Get report by ID
   */
  public static async getReportById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const report = await prisma.report.findUnique({
        where: { id },
        include: {
          analysis: {
            include: {
              riskFactors: true,
              predictions: true,
              recommendations: true,
            },
          },
        },
      });

      if (!report) {
        res.status(404).json({ success: false, message: 'Report not found' });
        return;
      }

      res.status(200).json({
        success: true,
        data: {
          id: report.id,
          title: report.title,
          content: JSON.parse(report.content),
          analysis: report.analysis,
          createdAt: report.createdAt,
        },
      });
    } catch (error: any) {
      console.error('[ReportController.getReportById] Error:', error);
      res.status(500).json({ success: false, message: error.message || 'Failed to fetch report' });
    }
  }
}
