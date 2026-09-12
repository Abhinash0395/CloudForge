import { Request, Response } from 'express';
import { prisma } from '../prisma';

export class InsightController {
  /**
   * Get all intelligence feed insights with filtering
   */
  public static async getAllInsights(req: Request, res: Response): Promise<void> {
    try {
      const { severity, type, limit = 50 } = req.query;

      const where: any = {};
      if (severity && severity !== 'ALL') {
        where.severity = String(severity);
      }
      if (type && type !== 'ALL') {
        where.type = String(type);
      }

      const insights = await prisma.insight.findMany({
        where,
        take: Number(limit),
        orderBy: { createdAt: 'desc' },
        include: {
          analysis: {
            select: {
              id: true,
              title: true,
              category: true,
              riskScore: true,
              riskLevel: true,
            },
          },
        },
      });

      res.status(200).json({ success: true, data: insights });
    } catch (error: any) {
      console.error('[InsightController.getAllInsights] Error:', error);
      res.status(500).json({ success: false, message: error.message || 'Failed to fetch insights' });
    }
  }
}
