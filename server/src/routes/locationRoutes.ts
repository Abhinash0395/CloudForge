import { Router } from 'express';
import { LocationController } from '../controllers/locationController';

const router = Router();

// Section 18: My Current Location (Reverse Geocoding Coordinates)
router.post('/location/current', LocationController.getCurrentLocation);

// Section 19: Search Any Location (Multi-Candidate Geospatial Search)
router.post('/location/search', LocationController.searchLocation);
router.get('/location/search', LocationController.searchLocation);

// Section 20: Location Analysis (End-to-End Live Telemetry & Deterministic Risk)
router.post('/location/analyze', LocationController.analyzeLocation);

// Section 15: Compare Two Locations Side-by-Side
router.post('/location/compare', LocationController.compareLocations);

export default router;
