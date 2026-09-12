import { Router } from 'express';
import { DataController } from '../controllers/dataController';

const router = Router();

router.get('/data/status', DataController.getSystemDataStatus);
router.get('/data/sources', DataController.getDataSources);
router.get('/data/location/search', DataController.searchLocation);
router.get('/data/live/weather', DataController.getLiveWeather);
router.post('/data/analyze/live', DataController.analyzeLiveLocation);

// Section 55 Direct Endpoints
router.get('/weather', DataController.getLiveWeather);
router.get('/weather/history', DataController.getWeatherHistory);
router.get('/weather/forecast', DataController.getWeatherForecast);
router.get('/air-quality', DataController.getAirQuality);
router.post('/geocode', DataController.geocodeLocation);
router.get('/geocode', DataController.geocodeLocation);

export default router;

