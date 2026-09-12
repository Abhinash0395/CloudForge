import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import path from 'path';
import { config } from './config';
import { errorHandler } from './middleware/errorHandler';

// Route imports
import analysisRoutes from './routes/analysisRoutes';
import predictionRoutes from './routes/predictionRoutes';
import decisionRoutes from './routes/decisionRoutes';
import simulationRoutes from './routes/simulationRoutes';
import scenarioRoutes from './routes/scenarioRoutes';
import insightRoutes from './routes/insightRoutes';
import reportRoutes from './routes/reportRoutes';
import systemRoutes from './routes/systemRoutes';
import dataRoutes from './routes/dataRoutes';
import chatRoutes from './routes/chatRoutes';
import locationRoutes from './routes/locationRoutes';
import { SourceRegistry } from './providers/sourceRegistry';

const app = express();

// Security and utility middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
}));
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(morgan('dev'));
app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true, limit: '20mb' }));

// Static uploads serving
app.use('/uploads', express.static(config.uploadDir));

// API Route Mounts
app.use('/api', systemRoutes);
app.use('/api', analysisRoutes);
app.use('/api', predictionRoutes);
app.use('/api', decisionRoutes);
app.use('/api', simulationRoutes);
app.use('/api', scenarioRoutes);
app.use('/api', insightRoutes);
app.use('/api', reportRoutes);
app.use('/api', dataRoutes);
app.use('/api', chatRoutes);
app.use('/api', locationRoutes);

// Error Handling Middleware
app.use(errorHandler);

// Start Server
const PORT = config.port;
const server = app.listen(PORT, () => {
  console.log(`=====================================================`);
  console.log(`🚀 RISKLENS AI ENGINE ONLINE — PORT ${PORT}`);
  console.log(`📡 Environment: ${config.nodeEnv}`);
  console.log(`🎯 Hackathon Track: Track 01 — AI, ML & Emerging Technologies`);
  console.log(`🧠 Primary PS: PS 05 — AI for Prediction & Decision Support`);
  console.log(`🌐 Live Open Data Layer: Connected (Open-Meteo & Copernicus)`);
  console.log(`=====================================================`);

  // Initialize data source registry in database
  SourceRegistry.syncDatabaseSources().catch((err) => {
    console.warn('Initial data source sync notice:', err.message);
  });
});

export default app;
