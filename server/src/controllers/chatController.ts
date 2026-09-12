import { Request, Response } from 'express';
import { ChatService, ChatRequest } from '../ai/chatService';

export class ChatController {
  /**
   * Process a grounded chat message for RiskLens AI Copilot
   */
  public static async handleChat(req: Request, res: Response): Promise<void> {
    try {
      const { message, analysisId, conversationId, currentPage, currentLocation, history } = req.body;

      if (!message || typeof message !== 'string' || message.trim().length === 0) {
        res.status(400).json({ success: false, message: 'Field "message" is required and cannot be empty.' });
        return;
      }

      const chatPayload: ChatRequest = {
        message: message.trim(),
        analysisId,
        conversationId,
        currentPage: currentPage || 'Overview',
        currentLocation,
        history,
      };

      const result = await ChatService.processMessage(chatPayload);

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error: any) {
      console.error('[ChatController.handleChat] Error:', error);
      res.status(500).json({ success: false, message: error.message || 'Error processing chat query.' });
    }
  }
}
