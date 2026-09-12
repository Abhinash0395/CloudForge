import { Request, Response } from 'express';
import { prisma } from '../prisma';
import { locationProvider, GeocodedLocation } from '../providers/locationProvider';
import { weatherProvider } from '../providers/weatherProvider';
import { environmentProvider } from '../providers/environmentProvider';
import { TransparentRiskEngine } from '../services/transparentRiskEngine';
import { getGeminiClient, isGeminiAvailable } from '../ai/geminiClient';

export class LocationController {
  /**
   * POST /api/location/current
   * Browser geolocation coordinates -> Reverse Geocoded City, State, Country
   */
  public static async getCurrentLocation(req: Request, res: Response): Promise<void> {
    try {
      const { latitude, longitude } = req.body;
      const lat = parseFloat(String(latitude));
      const lon = parseFloat(String(longitude));

      if (isNaN(lat) || isNaN(lon)) {
        res.status(400).json({
          success: false,
          message: 'Valid "latitude" and "longitude" coordinates are required.',
        });
        return;
      }

      // Reverse geocode to real location structure
      const resolved = await locationProvider.reverseGeocode(lat, lon);

      res.status(200).json({
        success: true,
        data: {
          name: resolved.name,
          city: resolved.name,
          state: resolved.admin1 || '',
          country: resolved.country,
          countryCode: resolved.countryCode,
          latitude: resolved.latitude,
          longitude: resolved.longitude,
          elevation: resolved.elevation,
          timezone: resolved.timezone,
          formattedName: resolved.formattedName,
        },
      });
    } catch (error: any) {
      console.error('[LocationController.getCurrentLocation] Error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Reverse geocoding failed',
      });
    }
  }

  /**
   * POST /api/location/search & GET /api/location/search
   * Search any location with multi-candidate disambiguation
   */
  public static async searchLocation(req: Request, res: Response): Promise<void> {
    try {
      const query = String(req.body?.query || req.body?.q || req.query?.q || req.query?.query || '').trim();

      if (!query) {
        res.status(400).json({
          success: false,
          message: 'Query parameter "query" is required',
        });
        return;
      }

      const raw = await locationProvider.fetchRaw({ query });
      const validation = locationProvider.validate(raw);
      const normalized = locationProvider.normalize(raw, validation, { query });

      res.status(200).json({
        success: true,
        data: {
          results: normalized.metrics.map((loc) => ({
            name: loc.name,
            city: loc.name,
            state: loc.admin1 || '',
            country: loc.country,
            countryCode: loc.countryCode,
            latitude: loc.latitude,
            longitude: loc.longitude,
            elevation: loc.elevation,
            timezone: loc.timezone,
            population: loc.population,
            formattedName: loc.formattedName,
          })),
          count: normalized.metrics.length,
          validation: normalized.validation,
          sources: normalized.sources,
        },
      });
    } catch (error: any) {
      console.error('[LocationController.searchLocation] Error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Location search failed',
      });
    }
  }

  /**
   * POST /api/location/analyze
   * Full end-to-end telemetry and deterministic risk evaluation for any location
   */
  public static async analyzeLocation(req: Request, res: Response): Promise<void> {
    try {
      const { locationName, latitude, longitude, mode = 'LIVE' } = req.body;

      if (!locationName && (latitude === undefined || longitude === undefined)) {
        res.status(400).json({
          success: false,
          message: 'Location name or valid coordinates (latitude, longitude) required',
        });
        return;
      }

      // 1. Resolve Location Entity
      let resolvedLoc: GeocodedLocation | null = null;
      if (typeof latitude === 'number' && typeof longitude === 'number' && !isNaN(latitude) && !isNaN(longitude)) {
        if (locationName && locationName.length > 2 && !locationName.startsWith('Lat ')) {
          resolvedLoc = {
            name: locationName.split(',')[0].trim(),
            latitude,
            longitude,
            country: 'India',
            countryCode: 'IN',
            formattedName: locationName,
          };
        } else {
          resolvedLoc = await locationProvider.reverseGeocode(latitude, longitude);
        }
      } else {
        resolvedLoc = await locationProvider.resolveLocation(String(locationName));
      }

      if (!resolvedLoc) {
        res.status(404).json({
          success: false,
          message: `Unable to geocode location: "${locationName}". Please verify spelling or try another location.`,
        });
        return;
      }

      // 2. Fetch Live Weather & Historical Observations
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

      // 3. Fetch Copernicus CAMS Air Quality
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

      // 4. Compute Transparent Mathematical Risk Result
      const riskCalculation = TransparentRiskEngine.calculateMeteorologicalRisk(
        resolvedLoc,
        weatherNorm.metrics,
        weatherVal,
        allCitations,
        envNorm.metrics
      );

      // 5. Generate Location AI Summary (strictly grounded in verified numbers)
      let aiSummary = '';
      const gemini = getGeminiClient();
      if (gemini && isGeminiAvailable()) {
        try {
          const model = gemini.getGenerativeModel({ model: 'gemini-1.5-flash' });
          const prompt = `You are the RiskLens AI Location Intelligence Analyst. Provide a concise 2-sentence executive summary for the location: ${resolvedLoc.formattedName}.
STRICT GROUNDING RULES:
- Temperature: ${weatherNorm.metrics.currentTemperatureC}°C (${weatherNorm.metrics.weatherDescription})
- 24h Rainfall: ${weatherNorm.metrics.past24hPrecipitationMm} mm
- Air Quality (AQI): ${envNorm.metrics.usAqi} (${envNorm.metrics.airQualityRating})
- Composite Risk Score: ${riskCalculation.compositeRiskScore}/100 (${riskCalculation.riskLevel} RISK)
- Primary Risk Factor: ${riskCalculation.factorBreakdowns[0]?.name || 'Precipitation'}
DO NOT hallucinate other numbers. Write professional, grounded, and concise text.`;
          const result = await model.generateContent(prompt);
          aiSummary = result.response.text();
        } catch (e: any) {
          console.warn('[LocationController.analyzeLocation] Gemini summary error:', e.message);
        }
      }

      if (!aiSummary) {
        aiSummary = `Atmospheric telemetry for ${resolvedLoc.formattedName} indicates a ${riskCalculation.riskLevel.toLowerCase()} risk profile (Score: ${riskCalculation.compositeRiskScore}/100). Current temperature is ${weatherNorm.metrics.currentTemperatureC}°C with ${weatherNorm.metrics.past24hPrecipitationMm}mm 24h precipitation and AQI of ${envNorm.metrics.usAqi} (${envNorm.metrics.airQualityRating}).`;
      }

      // 6. Save Analysis Record in Database
      let savedAnalysisId = '';
      try {
        const saved = await prisma.analysis.create({
          data: {
            title: `Location Risk: ${resolvedLoc.formattedName}`,
            category: 'Environmental & Meteorological Risk',
            inputType: 'STRUCTURED',
            status: 'COMPLETED',
            mode: mode === 'LIVE' ? 'LIVE' : 'DEMO',
            location: resolvedLoc.formattedName,
            latitude: resolvedLoc.latitude,
            longitude: resolvedLoc.longitude,
            riskScore: riskCalculation.compositeRiskScore,
            riskLevel: riskCalculation.riskLevel,
            confidence: riskCalculation.confidence,
            dataQuality: riskCalculation.dataQuality,
            dataFreshness: riskCalculation.dataFreshness,
            prediction: riskCalculation.prediction,
            summary: aiSummary || riskCalculation.summary,
            calculationMethod: riskCalculation.calculationMethod,
            sourcesCited: JSON.stringify(allCitations),
            limitations: riskCalculation.limitations,
            timeHorizon: '72 Hours',
            tags: JSON.stringify(['LOCATION INTELLIGENCE', resolvedLoc.name, `${riskCalculation.riskLevel} RISK`]),
            inputData: {
              create: {
                rawInput: JSON.stringify(weatherNorm.metrics),
                structuredData: JSON.stringify({
                  weather: weatherNorm.metrics,
                  airQuality: envNorm.metrics,
                  location: resolvedLoc,
                }),
                source: `Open-Meteo & Copernicus (${resolvedLoc.formattedName})`,
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
                  baselineComparison: Number((riskCalculation.compositeRiskScore - 40).toFixed(1)),
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
          },
        });
        savedAnalysisId = saved.id;
      } catch (dbErr: any) {
        console.warn('[LocationController.analyzeLocation] DB save notice:', dbErr.message);
      }

      res.status(200).json({
        success: true,
        data: {
          analysisId: savedAnalysisId,
          location: resolvedLoc,
          weather: weatherNorm.metrics,
          forecast: {
            forecast72hSumMm: weatherNorm.metrics.forecast72hSumMm,
            forecast7DaySumMm: weatherNorm.metrics.forecast7DaySumMm,
            hourlySeries: weatherNorm.metrics.hourlySeries,
            dailySeries: weatherNorm.metrics.dailySeries,
          },
          historical: {
            historicalDays: weatherNorm.metrics.historicalDays,
            past24hPrecipitationMm: weatherNorm.metrics.past24hPrecipitationMm,
          },
          airQuality: envNorm.metrics,
          risk: riskCalculation,
          dataQuality: riskCalculation.dataQuality,
          dataFreshness: riskCalculation.dataFreshness,
          sources: allCitations,
          aiSummary,
          retrievedAt: new Date().toISOString(),
        },
      });
    } catch (error: any) {
      console.error('[LocationController.analyzeLocation] Error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Location analysis failed',
      });
    }
  }

  /**
   * POST /api/location/compare
   * Side-by-side comparison of two locations
   */
  public static async compareLocations(req: Request, res: Response): Promise<void> {
    try {
      const { locationA, locationB } = req.body;

      if (!locationA || !locationB) {
        res.status(400).json({
          success: false,
          message: 'Both "locationA" and "locationB" parameters are required for comparison.',
        });
        return;
      }

      // Resolve Location A & B in parallel
      const [locA, locB] = await Promise.all([
        typeof locationA.latitude === 'number' && typeof locationA.longitude === 'number'
          ? locationProvider.reverseGeocode(locationA.latitude, locationA.longitude)
          : locationProvider.resolveLocation(locationA.name || locationA),
        typeof locationB.latitude === 'number' && typeof locationB.longitude === 'number'
          ? locationProvider.reverseGeocode(locationB.latitude, locationB.longitude)
          : locationProvider.resolveLocation(locationB.name || locationB),
      ]);

      if (!locA || !locB) {
        res.status(404).json({
          success: false,
          message: `Unable to resolve one or both locations: "${locationA.name || locationA}" vs "${locationB.name || locationB}"`,
        });
        return;
      }

      // Fetch telemetry in parallel
      const [weatherRawA, envRawA, weatherRawB, envRawB] = await Promise.all([
        weatherProvider.fetchRaw({ latitude: locA.latitude, longitude: locA.longitude, locationName: locA.formattedName }),
        environmentProvider.fetchRaw({ latitude: locA.latitude, longitude: locA.longitude }),
        weatherProvider.fetchRaw({ latitude: locB.latitude, longitude: locB.longitude, locationName: locB.formattedName }),
        environmentProvider.fetchRaw({ latitude: locB.latitude, longitude: locB.longitude }),
      ]);

      const weatherValA = weatherProvider.validate(weatherRawA);
      const weatherNormA = weatherProvider.normalize(weatherRawA, weatherValA, { latitude: locA.latitude, longitude: locA.longitude });
      const envNormA = environmentProvider.normalize(envRawA, environmentProvider.validate(envRawA), { latitude: locA.latitude, longitude: locA.longitude });

      const weatherValB = weatherProvider.validate(weatherRawB);
      const weatherNormB = weatherProvider.normalize(weatherRawB, weatherValB, { latitude: locB.latitude, longitude: locB.longitude });
      const envNormB = environmentProvider.normalize(envRawB, environmentProvider.validate(envRawB), { latitude: locB.latitude, longitude: locB.longitude });

      // Compute risk scores for both
      const riskA = TransparentRiskEngine.calculateMeteorologicalRisk(locA, weatherNormA.metrics, weatherValA, weatherNormA.sources, envNormA.metrics);
      const riskB = TransparentRiskEngine.calculateMeteorologicalRisk(locB, weatherNormB.metrics, weatherValB, weatherNormB.sources, envNormB.metrics);

      // Compute comparative deltas
      const tempDelta = Number((weatherNormB.metrics.currentTemperatureC - weatherNormA.metrics.currentTemperatureC).toFixed(1));
      const rainfallDelta = Number((weatherNormB.metrics.past24hPrecipitationMm - weatherNormA.metrics.past24hPrecipitationMm).toFixed(1));
      const aqiDelta = envNormB.metrics.usAqi - envNormA.metrics.usAqi;
      const riskScoreDelta = Number((riskB.compositeRiskScore - riskA.compositeRiskScore).toFixed(1));

      const higherRiskLocation = riskA.compositeRiskScore > riskB.compositeRiskScore ? locA.name : locB.name;
      const higherRiskScore = Math.max(riskA.compositeRiskScore, riskB.compositeRiskScore);

      const summary = `${locA.name} exhibits a risk score of ${riskA.compositeRiskScore}/100 (${riskA.riskLevel}) compared to ${locB.name}'s score of ${riskB.compositeRiskScore}/100 (${riskB.riskLevel}). ${higherRiskLocation} displays the higher operational exposure (${higherRiskScore}/100), primarily driven by ${rainfallDelta > 0 ? `${locB.name}'s elevated precipitation delta (+${rainfallDelta}mm)` : `${locA.name}'s higher surface saturation`}.`;

      res.status(200).json({
        success: true,
        data: {
          locationA: {
            location: locA,
            weather: weatherNormA.metrics,
            airQuality: envNormA.metrics,
            risk: riskA,
          },
          locationB: {
            location: locB,
            weather: weatherNormB.metrics,
            airQuality: envNormB.metrics,
            risk: riskB,
          },
          comparison: {
            tempDelta,
            rainfallDelta,
            aqiDelta,
            riskScoreDelta,
            higherRiskLocation,
            summary,
          },
        },
      });
    } catch (error: any) {
      console.error('[LocationController.compareLocations] Error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Location comparison failed',
      });
    }
  }
}
