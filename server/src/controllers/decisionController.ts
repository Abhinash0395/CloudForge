import { Request, Response } from 'express';
import { prisma } from '../prisma';

export class DecisionController {
  /**
   * Get all decision center recommendations grouped by priority
   */
  public static async getDecisionQueue(req: Request, res: Response): Promise<void> {
    try {
      const recommendations = await prisma.recommendation.findMany({
        take: 30,
        orderBy: [{ orderIndex: 'asc' }, { id: 'desc' }],
        include: {
          analysis: {
            select: {
              id: true,
              title: true,
              category: true,
              riskScore: true,
              riskLevel: true,
              confidence: true,
              prediction: true,
            },
          },
        },
      });

      const priority1 = recommendations.filter(r => r.priority === 'PRIORITY 1');
      const priority2 = recommendations.filter(r => r.priority === 'PRIORITY 2');
      const priority3 = recommendations.filter(r => r.priority === 'PRIORITY 3');

      res.status(200).json({
        success: true,
        data: {
          totalActions: recommendations.length,
          priority1,
          priority2,
          priority3,
          allRecommendations: recommendations,
        },
      });
    } catch (error: any) {
      console.error('[DecisionController.getDecisionQueue] Error:', error);
      res.status(500).json({ success: false, message: error.message || 'Failed to fetch decision queue' });
    }
  }

  /**
   * Update recommendation status (ACCEPT, DISMISS, SAVE)
   */
  public static async updateStatus(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { status } = req.body; // ACCEPTED, DISMISSED, SAVED, PENDING

      if (!status) {
        res.status(400).json({ success: false, message: 'Status is required' });
        return;
      }

      const updated = await prisma.recommendation.update({
        where: { id },
        data: { status },
        include: {
          analysis: true,
        },
      });

      // Create Audit Log
      await prisma.auditLog.create({
        data: {
          action: `DECISION_ACTION_${status}`,
          details: `Recommendation "${updated.title}" marked as ${status}. Expected Impact: ${updated.expectedImpact}`,
        },
      });

      // Create Notification
      await prisma.notification.create({
        data: {
          title: `Action Marked as ${status}`,
          message: `Decision "${updated.title}" updated to ${status}. Expected Impact: ${updated.expectedImpact}`,
          type: 'DECISION_ACTION',
          severity: status === 'ACCEPTED' ? 'SUCCESS' : 'INFO',
        },
      });

      res.status(200).json({ success: true, data: updated });
    } catch (error: any) {
      console.error('[DecisionController.updateStatus] Error:', error);
      res.status(500).json({ success: false, message: error.message || 'Failed to update decision action' });
    }
  }

  public static async acceptRecommendation(req: Request, res: Response): Promise<void> {
    req.body = { status: 'ACCEPTED' };
    return DecisionController.updateStatus(req, res);
  }

  public static async saveRecommendation(req: Request, res: Response): Promise<void> {
    req.body = { status: 'SAVED' };
    return DecisionController.updateStatus(req, res);
  }

  public static async dismissRecommendation(req: Request, res: Response): Promise<void> {
    req.body = { status: 'DISMISSED' };
    return DecisionController.updateStatus(req, res);
  }
}

