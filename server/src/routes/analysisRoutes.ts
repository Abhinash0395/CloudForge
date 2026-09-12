import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { AnalysisController } from '../controllers/analysisController';
import { config } from '../config';

const router = Router();

// Configure multer storage for image uploads
if (!fs.existsSync(config.uploadDir)) {
  fs.mkdirSync(config.uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, config.uploadDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname) || '.jpg';
    cb(null, `vision_${Date.now()}_${Math.random().toString(36).substring(7)}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 15 * 1024 * 1024 }, // 15MB limit
});

// Routes
router.post('/analyze', AnalysisController.analyzeStructured);
router.post('/analyze/text', AnalysisController.analyzeText);
router.post('/analyze/image', upload.single('image'), AnalysisController.analyzeImage);
router.get('/analyses', AnalysisController.getAllAnalyses);
router.get('/analyses/:id', AnalysisController.getAnalysisById);
router.delete('/analyses/:id', AnalysisController.deleteAnalysis);

export default router;
