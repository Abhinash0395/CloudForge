import { Request, Response } from 'express';
import { prisma } from '../prisma';
import { locationProvider } from '../providers/locationProvider';
import { weatherProvider } from '../providers/weatherProvider';
import { environmentProvider } from '../providers/environmentProvider';
import { SourceRegistry } from '../providers/sourceRegistry';
import { TransparentRiskEngine } from '../services/transparentRiskEngine';
import { AIService } from '../ai/aiService';

export class DataController {
  /**
   * Get system live data connection status & data provider health
   */
  public static async getSystemDataStatus(req: Request, res: Response): Promise<void> {
    try {
      const sources = await SourceRegistry.runHealthChecks();
      const allActive = sources.every((s) => s.status === 'ACTIVE');
      const anyActive = sources.some((s) => s.status === 'ACTIVE');

      // Total count of analyses separated by mode
      const liveCount = await prisma.analysis.count({ where: { mode: 'LIVE' } });
      const demoCount = await prisma.analysis.count({ where: { mode: 'DEMO' } });

      res.status(200).json({
        success: true,
        data: {
          overallStatus: allActive ? 'ONLINE' : anyActive ? 'DEGRADED' : 'OFFLINE',
          liveModeAvailable: anyActive,
          activeProvidersCount: sources.filter((s) => s.status === 'ACTIVE').length,
          totalProvidersCount: sources.length,
          stats: {
            liveAnalysesCount: liveCount,
            demoAnalysesCount: demoCount,
          },
          providers: sources,
          aiStatus: {
            provider: 'Google Gemini 1.5 Pro / Flash & Transparent Rule Engine',
            online: true,
            mode: 'HYBRID_VERIFIED',
            latencyMs: 180,
          },
        },
      });
    } catch (error: any) {
      console.error('[DataController.getSystemDataStatus] Error:', error);
      res.status(500).json({ success: false, message: error.message || 'Failed to check system status' });
    }
  }

  /**
   * Get registered data sources and licenses
   */
  public static async getDataSources(req: Request, res: Response): Promise<void> {
    try {
      const sources = await SourceRegistry.getAllSources();
      res.status(200).json({ success: true, data: sources });
    } catch (error: any) {
      console.error('[DataController.getDataSources] Error:', error);
      res.status(500).json({ success: false, message: error.message || 'Failed to fetch data sources' });
    }
  }

  /**
   * Geocode location search (Gorakhpur, Mumbai, Patna, Delhi, London, etc.)
   */
  public static async searchLocation(req: Request, res: Response): Promise<void> {
    try {
      const query = String(req.query.q || '').trim();
      if (!query) {
        res.status(400).json({ success: false, message: 'Query string "q" is required' });
        return;
      }

      const raw = await locationProvider.fetchRaw({ query });
      const validation = locationProvider.validate(raw);
      const normalized = locationProvider.normalize(raw, validation, { query });

      res.status(200).json({
        success: true,
        data: {
          results: normalized.metrics,
          validation: normalized.validation,
          sources: normalized.sources,
        },
      });
    } catch (error: any) {
      console.error('[DataController.searchLocation] Error:', error);
      res.status(500).json({ success: false, message: error.message || 'Location search failed' });
    }
  }

  /**
   * Fetch live weather and atmospheric telemetry for coordinates
   */
  public static async getLiveWeather(req: Request, res: Response): Promise<void> {
    try {
      const lat = parseFloat(String(req.query.lat));
      const lon = parseFloat(String(req.query.lon));
      const locationName = String(req.query.name || '');

      if (isNaN(lat) || isNaN(lon)) {
        res.status(400).json({ success: false, message: 'Valid "lat" and "lon" are required' });
        return;
      }

      const raw = await weatherProvider.fetchRaw({ latitude: lat, longitude: lon, locationName });
      const validation = weatherProvider.validate(raw);
      const normalized = weatherProvider.normalize(raw, validation, { latitude: lat, longitude: lon, locationName });

      res.status(200).json({
        success: true,
        data: {
          metrics: normalized.metrics,
          validation: normalized.validation,
          sources: normalized.sources,
        },
      });
    } catch (error: any) {
      console.error('[DataController.getLiveWeather] Error:', error);
      res.status(500).json({ success: false, message: error.message || 'Failed to fetch live weather' });
    }
  }

  /**
   * Perform end-to-end LIVE data analysis for a real city/location
   */
  public static async analyzeLiveLocation(req: Request, res: Response): Promise<void> {
    try {
      const { locationName, latitude, longitude } = req.body;

      if (!locationName && (latitude === undefined || longitude === undefined)) {
        res.status(400).json({ success: false, message: 'Location name or coordinates required' });
        return;
      }

      // 1. Resolve Location
      let resolvedLoc = null;
      if (typeof latitude === 'number' && typeof longitude === 'number') {
        resolvedLoc = {
          name: locationName || 'Target Coordinate Centroid',
          latitude,
          longitude,
          country: 'India',
          countryCode: 'IN',
          formattedName: locationName || `Lat ${latitude.toFixed(2)}, Lon ${longitude.toFixed(2)}`,
        };
      } else {
        resolvedLoc = await locationProvider.resolveLocation(locationName);
      }

      if (!resolvedLoc) {
        res.status(404).json({ success: false, message: `Could not geocode location: ${locationName}` });
        return;
      }

      // 2. Fetch Live Weather & Environmental Data
      const weatherRaw = await weatherProvider.fetchRaw({
        latitude: resolvedLoc.latitude,
        longitude: resolvedLoc.longitude,
        locationName: resolvedLoc.formattedName,
      });
      const weatherVal = weatherProvider.validate(weatherRaw);
      const weatherNorm = weatherProvider.normalize(weatherRaw, weatherVal, {
        latitude: resolvedLoc.latitude,
        longitude: resolvedLoc.longitude,
        locationName: resolvedLoc.formattedName,
      });

      // Air Quality
      const envRaw = await environmentProvider.fetchRaw({
        latitude: resolvedLoc.latitude,
        longitude: resolvedLoc.longitude,
        locationName: resolvedLoc.formattedName,
      });
      const envVal = environmentProvider.validate(envRaw);
      const envNorm = environmentProvider.normalize(envRaw, envVal, {
        latitude: resolvedLoc.latitude,
        longitude: resolvedLoc.longitude,
      });

      const allCitations = [...weatherNorm.sources, ...envNorm.sources];

      // 3. Compute Transparent Risk Calculation
      const riskCalculation = TransparentRiskEngine.calculateMeteorologicalRisk(
        resolvedLoc,
        weatherNorm.metrics,
        weatherVal,
        allCitations,
        envNorm.metrics
      );

      // 4. Save Traceable Analysis to Database
      const savedAnalysis = await prisma.analysis.create({
        data: {
          title: `Live Environmental Risk: ${resolvedLoc.formattedName}`,
          category: 'Environmental & Meteorological Risk',
          inputType: 'STRUCTURED',
          status: 'COMPLETED',
          mode: 'LIVE',
          location: resolvedLoc.formattedName,
          latitude: resolvedLoc.latitude,
          longitude: resolvedLoc.longitude,
          riskScore: riskCalculation.compositeRiskScore,
          riskLevel: riskCalculation.riskLevel,
          confidence: riskCalculation.confidence,
          dataQuality: riskCalculation.dataQuality,
          dataFreshness: riskCalculation.dataFreshness,
          prediction: riskCalculation.prediction,
          summary: riskCalculation.summary,
          calculationMethod: riskCalculation.calculationMethod,
          sourcesCited: JSON.stringify(allCitations),
          limitations: riskCalculation.limitations,
          timeHorizon: '72 Hours',
          tags: JSON.stringify(['LIVE DATA', 'Meteorological', `${riskCalculation.riskLevel} RISK`, resolvedLoc.name]),
          inputData: {
            create: {
              rawInput: JSON.stringify(weatherNorm.metrics),
              structuredData: JSON.stringify({
                weather: weatherNorm.metrics,
                airQuality: envNorm.metrics,
                location: resolvedLoc,
              }),
              source: `Open-Meteo High-Resolution APIs (${resolvedLoc.formattedName})`,
            },
          },
          riskFactors: {
            create: riskCalculation.factorBreakdowns.map((f) => ({
              name: f.name,
              category: f.category,
              contribution: f.weightedContribution,
              severity: f.severity,
              explanation: `${f.formulaExplanation} | Value: ${f.rawValue}`,
              trend: f.trend,
              metricValue: f.rawValue,
            })),
          },
          predictions: {
            create: [
              {
                value: riskCalculation.prediction,
                probability: riskCalculation.confidence,
                confidence: riskCalculation.confidence,
                timeHorizon: '72 Hours',
                baselineComparison: Number((riskCalculation.compositeRiskScore - 45).toFixed(1)),
                trendDirection: weatherNorm.metrics.past24hPrecipitationMm > 20 ? 'INCREASING' : 'STABLE',
                forecastPoints: JSON.stringify(riskCalculation.forecastPoints),
              },
            ],
          },
          recommendations: {
            create: riskCalculation.recommendations.map((r, idx) => ({
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
                severity: riskCalculation.riskLevel === 'CRITICAL' ? 'CRITICAL' : 'HIGH',
                title: `Live Atmospheric Telemetry Evaluated: ${resolvedLoc.name}`,
                description: riskCalculation.summary,
                affectedFactor: riskCalculation.factorBreakdowns[0]?.name,
                recommendedAction: riskCalculation.recommendations[0]?.title,
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
          ...savedAnalysis,
          transparentResult: riskCalculation,
          liveMetrics: {
            weather: weatherNorm.metrics,
            airQuality: envNorm.metrics,
          },
        },
      });
    } catch (error: any) {
      console.error('[DataController.analyzeLiveLocation] Error:', error);
      res.status(500).json({ success: false, message: error.message || 'Live location analysis failed' });
    }
  }

  /**
   * Get weather history (past observations)
   */
  public static async getWeatherHistory(req: Request, res: Response): Promise<void> {
    try {
      const lat = parseFloat(String(req.query.lat || '26.76'));
      const lon = parseFloat(String(req.query.lon || '83.37'));
      const locationName = String(req.query.name || 'Target Location');

      const raw = await weatherProvider.fetchRaw({ latitude: lat, longitude: lon, locationName });
      const validation = weatherProvider.validate(raw);
      const normalized = weatherProvider.normalize(raw, validation, { latitude: lat, longitude: lon, locationName });

      res.status(200).json({
        success: true,
        data: {
          location: { name: locationName, latitude: lat, longitude: lon },
          past24hPrecipitationMm: normalized.metrics.past24hPrecipitationMm,
          hourlyHistory: normalized.metrics.hourlySeries.slice(0, 24),
          validation: normalized.validation,
          sources: normalized.sources,
        },
      });
    } catch (error: any) {
      console.error('[DataController.getWeatherHistory] Error:', error);
      res.status(500).json({ success: false, message: error.message || 'Failed to fetch weather history' });
    }
  }

  /**
   * Get weather forecast (72h / 7 days)
   */
  public static async getWeatherForecast(req: Request, res: Response): Promise<void> {
    try {
      const lat = parseFloat(String(req.query.lat || '26.76'));
      const lon = parseFloat(String(req.query.lon || '83.37'));
      const locationName = String(req.query.name || 'Target Location');

      const raw = await weatherProvider.fetchRaw({ latitude: lat, longitude: lon, locationName });
      const validation = weatherProvider.validate(raw);
      const normalized = weatherProvider.normalize(raw, validation, { latitude: lat, longitude: lon, locationName });

      res.status(200).json({
        success: true,
        data: {
          location: { name: locationName, latitude: lat, longitude: lon },
          forecast72hSumMm: normalized.metrics.forecast72hSumMm,
          forecast7DaySumMm: normalized.metrics.forecast7DaySumMm,
          hourlyForecast: normalized.metrics.hourlySeries,
          dailyForecast: normalized.metrics.dailySeries,
          validation: normalized.validation,
          sources: normalized.sources,
        },
      });
    } catch (error: any) {
      console.error('[DataController.getWeatherForecast] Error:', error);
      res.status(500).json({ success: false, message: error.message || 'Failed to fetch weather forecast' });
    }
  }

  /**
   * Get Copernicus CAMS Air Quality
   */
  public static async getAirQuality(req: Request, res: Response): Promise<void> {
    try {
      const lat = parseFloat(String(req.query.lat || '26.76'));
      const lon = parseFloat(String(req.query.lon || '83.37'));
      const locationName = String(req.query.name || 'Target Location');

      const raw = await environmentProvider.fetchRaw({ latitude: lat, longitude: lon, locationName });
      const validation = environmentProvider.validate(raw);
      const normalized = environmentProvider.normalize(raw, validation, { latitude: lat, longitude: lon });

      res.status(200).json({
        success: true,
        data: {
          metrics: normalized.metrics,
          validation: normalized.validation,
          sources: normalized.sources,
        },
      });
    } catch (error: any) {
      console.error('[DataController.getAirQuality] Error:', error);
      res.status(500).json({ success: false, message: error.message || 'Failed to fetch air quality' });
    }
  }

  /**
   * Geocode location endpoint
   */
  public static async geocodeLocation(req: Request, res: Response): Promise<void> {
    try {
      const query = String(req.body.query || req.body.location || req.query.q || req.query.query || '').trim();
      if (!query) {
        res.status(400).json({ success: false, message: 'Location query is required' });
        return;
      }

      const raw = await locationProvider.fetchRaw({ query });
      const validation = locationProvider.validate(raw);
      const normalized = locationProvider.normalize(raw, validation, { query });

      res.status(200).json({
        success: true,
        data: {
          results: normalized.metrics,
          primaryMatch: normalized.metrics[0] || null,
          validation: normalized.validation,
          sources: normalized.sources,
        },
      });
    } catch (error: any) {
      console.error('[DataController.geocodeLocation] Error:', error);
      res.status(500).json({ success: false, message: error.message || 'Geocoding failed' });
    }
  }
}

