import { Router } from 'express';
import { ChatController } from '../controllers/chatController';

const router = Router();

router.post('/chat', ChatController.handleChat);

export default router;
