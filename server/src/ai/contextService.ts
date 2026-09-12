import { prisma } from '../prisma';
import { weatherProvider } from '../providers/weatherProvider';
import { environmentProvider } from '../providers/environmentProvider';
import { locationProvider } from '../providers/locationProvider';
import { SimulationEngine } from '../services/simulationEngine';

export interface RetrievedContext {
  activeAnalysis?: any;
  previousAnalysis?: any;
  liveTelemetry?: any;
  simulationResult?: any;
  dataQualityRating?: string;
  dataFreshness?: string;
  isLiveMode?: boolean;
  location?: string;
  summaryText: string;
  sources: Array<{ name: string; endpoint: string; license: string; timestamp?: string }>;
}

export class ContextService {
  /**
   * Build comprehensive grounded context for a user query
   */
  public static async buildContext(
    analysisId?: string,
    userQuery: string = '',
    currentLocation?: string
  ): Promise<RetrievedContext> {
    let activeAnalysis: any = null;
    let previousAnalysis: any = null;
    let liveTelemetry: any = null;
    let simulationResult: any = null;
    const sources: Array<{ name: string; endpoint: string; license: string; timestamp?: string }> = [];

    // 1. Fetch Active Analysis from Database
    if (analysisId) {
      activeAnalysis = await prisma.analysis.findUnique({
        where: { id: analysisId },
        include: {
          riskFactors: true,
          predictions: true,
          recommendations: true,
          inputData: true,
          insights: true,
        },
      });
    } else {
      // Get the latest analysis as default active context
      activeAnalysis = await prisma.analysis.findFirst({
        orderBy: { createdAt: 'desc' },
        include: {
          riskFactors: true,
          predictions: true,
          recommendations: true,
          inputData: true,
          insights: true,
        },
      });
    }

    // 2. Fetch Previous Analysis for Comparison Queries
    const isComparisonQuery = /compare|difference|change|previous|last time|earlier|trend/i.test(userQuery);
    if (isComparisonQuery && activeAnalysis) {
      previousAnalysis = await prisma.analysis.findFirst({
        where: {
          id: { not: activeAnalysis.id },
          category: activeAnalysis.category,
        },
        orderBy: { createdAt: 'desc' },
        include: {
          riskFactors: true,
          predictions: true,
          recommendations: true,
        },
      });
    }

    // 3. Handle Live Data Query ("what is current rainfall / temperature / aqi now?")
    const isLiveTelemetryQuery = /current|now|today|latest|live|weather|rain|temperature|air quality|aqi|humidity/i.test(userQuery);
    const targetLocName = currentLocation || activeAnalysis?.location || 'Gorakhpur, Uttar Pradesh, India';

    if (isLiveTelemetryQuery) {
      try {
        const resolved = await locationProvider.resolveLocation(targetLocName);
        if (resolved) {
          const weatherRaw = await weatherProvider.fetchRaw({
            latitude: resolved.latitude,
            longitude: resolved.longitude,
            locationName: resolved.formattedName,
          });
          const weatherVal = weatherProvider.validate(weatherRaw);
          const weatherNorm = weatherProvider.normalize(weatherRaw, weatherVal, {
            latitude: resolved.latitude,
            longitude: resolved.longitude,
            locationName: resolved.formattedName,
          });

          const envRaw = await environmentProvider.fetchRaw({
            latitude: resolved.latitude,
            longitude: resolved.longitude,
          });
          const envVal = environmentProvider.validate(envRaw);
          const envNorm = environmentProvider.normalize(envRaw, envVal, {
            latitude: resolved.latitude,
            longitude: resolved.longitude,
          });

          liveTelemetry = {
            location: resolved.formattedName,
            elevation: resolved.elevation,
            weather: weatherNorm.metrics,
            airQuality: envNorm.metrics,
            freshness: weatherVal.dataFreshness,
            quality: weatherVal.quality,
          };

          sources.push(
            {
              name: 'Open-Meteo High-Resolution Weather Ensemble',
              endpoint: 'https://api.open-meteo.com/v1/forecast',
              license: 'Open Database License (ODbL) / CC BY 4.0',
              timestamp: weatherNorm.retrievedAt,
            },
            {
              name: 'Copernicus Atmosphere CAMS Telemetry',
              endpoint: 'https://air-quality-api.open-meteo.com/v1/air-quality',
              license: 'Copernicus Open Access / CC BY 4.0',
              timestamp: envNorm.retrievedAt,
            }
          );
        }
      } catch (err: any) {
        console.warn('[ContextService] Live telemetry fetch notice:', err.message);
      }
    }

    // 4. Handle What-If Simulation Queries ("what if rainfall increases by 20%?")
    const isWhatIfQuery = /what if|increase by|decrease by|simulate|what happens if|perturb/i.test(userQuery);
    if (isWhatIfQuery && activeAnalysis) {
      try {
        const deltaMatch = userQuery.match(/([+-]?\d+)\s*%/);
        const deltaPercent = deltaMatch ? parseInt(deltaMatch[1], 10) : 25;
        const targetFactor = userQuery.toLowerCase().includes('rainfall') || userQuery.toLowerCase().includes('precipitation')
          ? 'Precipitation Accumulation'
          : activeAnalysis.riskFactors[0]?.name || 'Primary Operational Factor';

        const factorPerturbations = (activeAnalysis.riskFactors || []).map((f: any) => ({
          name: f.name,
          originalContribution: f.contribution,
          deltaPercent: f.name.toLowerCase().includes(targetFactor.toLowerCase()) ? deltaPercent : 0,
        }));

        simulationResult = SimulationEngine.runWhatIfSimulation(
          activeAnalysis.riskScore,
          factorPerturbations
        );
      } catch (err: any) {
        console.warn('[ContextService] Simulation run notice:', err.message);
      }
    }

    // 5. Handle Cross-Location Comparison Queries in Chat ("compare this with Delhi")
    const compareMatch = userQuery.match(/compare\s+(?:this\s+)?(?:location\s+)?(?:with|to|vs|and)\s+([a-zA-Z\s]+)/i);
    let comparisonCityData: any = null;
    if (compareMatch && compareMatch[1]) {
      const secondCity = compareMatch[1].trim();
      if (secondCity.length > 2) {
        try {
          const resolvedB = await locationProvider.resolveLocation(secondCity);
          if (resolvedB) {
            const rawB = await weatherProvider.fetchRaw({ latitude: resolvedB.latitude, longitude: resolvedB.longitude, locationName: resolvedB.formattedName });
            const normB = weatherProvider.normalize(rawB, weatherProvider.validate(rawB), { latitude: resolvedB.latitude, longitude: resolvedB.longitude });
            const envRawB = await environmentProvider.fetchRaw({ latitude: resolvedB.latitude, longitude: resolvedB.longitude });
            const envNormB = environmentProvider.normalize(envRawB, environmentProvider.validate(envRawB), { latitude: resolvedB.latitude, longitude: resolvedB.longitude });

            comparisonCityData = {
              location: resolvedB.formattedName,
              weather: normB.metrics,
              airQuality: envNormB.metrics,
            };
          }
        } catch (err: any) {
          console.warn('[ContextService] Cross-location fetch notice:', err.message);
        }
      }
    }

    // Attach Citations from Active Analysis if present
    if (activeAnalysis?.sourcesCited) {
      try {
        const parsed = typeof activeAnalysis.sourcesCited === 'string' ? JSON.parse(activeAnalysis.sourcesCited) : activeAnalysis.sourcesCited;
        if (Array.isArray(parsed)) {
          parsed.forEach((p: any) => {
            if (!sources.some((s) => s.name === p.name)) {
              sources.push({
                name: p.name,
                endpoint: p.endpoint,
                license: p.license,
                timestamp: p.retrievedAt,
              });
            }
          });
        }
      } catch {}
    }

    // Format Textual Summary for LLM Ingestion
    const lines: string[] = [];
    if (activeAnalysis) {
      lines.push(`--- ACTIVE ANALYSIS CONTEXT ---`);
      lines.push(`Title: ${activeAnalysis.title}`);
      lines.push(`Category: ${activeAnalysis.category}`);
      lines.push(`Mode: ${activeAnalysis.mode || 'DEMO'}`);
      lines.push(`Location: ${activeAnalysis.location || 'Not Specified'}`);
      lines.push(`Risk Score: ${activeAnalysis.riskScore}/100 (${activeAnalysis.riskLevel})`);
      lines.push(`Confidence: ${(activeAnalysis.confidence * 100).toFixed(0)}%`);
      lines.push(`Data Quality: ${activeAnalysis.dataQuality || 'HIGH'}`);
      lines.push(`Data Freshness: ${activeAnalysis.dataFreshness || 'Real-time'}`);
      lines.push(`Prediction: ${activeAnalysis.prediction}`);
      lines.push(`Summary: ${activeAnalysis.summary}`);
      lines.push(`Calculation Method: ${activeAnalysis.calculationMethod || 'Heuristic Multi-Factor Neural & Domain Weighting Matrix'}`);
      if (activeAnalysis.limitations) {
        lines.push(`Limitations: ${activeAnalysis.limitations}`);
      }

      lines.push(`Top Contributing Factors:`);
      (activeAnalysis.riskFactors || []).forEach((f: any) => {
        lines.push(`- ${f.name}: Contribution +${f.contribution}%, Severity: ${f.severity}, Detail: ${f.explanation || f.metricValue || 'Nominal'}`);
      });

      lines.push(`Prioritized Recommendations:`);
      (activeAnalysis.recommendations || []).forEach((r: any) => {
        lines.push(`- [${r.priority}] ${r.title} (${r.expectedImpact}): ${r.description}`);
      });
    }

    if (previousAnalysis) {
      lines.push(`--- PREVIOUS COMPARATIVE RUN ---`);
      lines.push(`Previous Title: ${previousAnalysis.title}`);
      lines.push(`Previous Risk Score: ${previousAnalysis.riskScore}/100 (${previousAnalysis.riskLevel})`);
      lines.push(`Previous Date: ${new Date(previousAnalysis.createdAt).toLocaleDateString()}`);
      lines.push(`Risk Score Delta: ${activeAnalysis ? (activeAnalysis.riskScore - previousAnalysis.riskScore).toFixed(1) : 0} points`);
    }

    if (liveTelemetry) {
      lines.push(`--- VERIFIED LIVE TELEMETRY (Open-Meteo & Copernicus) ---`);
      lines.push(`Location: ${liveTelemetry.location} (Elevation: ${liveTelemetry.elevation}m)`);
      lines.push(`Current Temperature: ${liveTelemetry.weather.currentTemperatureC}°C (${liveTelemetry.weather.weatherDescription})`);
      lines.push(`Current Rain Rate: ${liveTelemetry.weather.currentPrecipitationMm} mm/h`);
      lines.push(`24-Hour Rainfall Sum: ${liveTelemetry.weather.past24hPrecipitationMm} mm`);
      lines.push(`72-Hour Forecast Precipitation: ${liveTelemetry.weather.forecast72hSumMm} mm`);
      lines.push(`Relative Humidity: ${liveTelemetry.weather.relativeHumidityPct}%`);
      lines.push(`Surface Pressure: ${liveTelemetry.weather.surfacePressureHpa} hPa`);
      lines.push(`Air Quality Index: ${liveTelemetry.airQuality.usAqi} US AQI (${liveTelemetry.airQuality.airQualityRating})`);
      lines.push(`Particulate Matter PM2.5: ${liveTelemetry.airQuality.pm2_5} µg/m³ | PM10: ${liveTelemetry.airQuality.pm10} µg/m³`);
    }

    if (simulationResult) {
      lines.push(`--- WHAT-IF MONTE CARLO SIMULATION RESULT ---`);
      lines.push(`Baseline Risk: ${simulationResult.baselineRisk}/100`);
      lines.push(`Simulated Risk: ${simulationResult.simulatedRisk}/100`);
      lines.push(`Risk Delta: ${simulationResult.delta >= 0 ? '+' : ''}${simulationResult.delta.toFixed(1)} points`);
      lines.push(`Simulation Category: SIMULATION (Non-Live Synthetic Perturbation)`);
    }

    if (comparisonCityData) {
      lines.push(`--- COMPARATIVE LOCATION DATA: ${comparisonCityData.location} ---`);
      lines.push(`Comparison Target: ${comparisonCityData.location}`);
      lines.push(`Target Temperature: ${comparisonCityData.weather.currentTemperatureC}°C (${comparisonCityData.weather.weatherDescription})`);
      lines.push(`Target 24h Rainfall: ${comparisonCityData.weather.past24hPrecipitationMm} mm`);
      lines.push(`Target AQI: ${comparisonCityData.airQuality.usAqi} (${comparisonCityData.airQuality.airQualityRating})`);
    }

    return {
      activeAnalysis,
      previousAnalysis,
      liveTelemetry,
      simulationResult,
      dataQualityRating: activeAnalysis?.dataQuality || 'HIGH',
      dataFreshness: liveTelemetry?.freshness || activeAnalysis?.dataFreshness || 'Real-time',
      isLiveMode: activeAnalysis?.mode === 'LIVE' || liveTelemetry !== null,
      location: activeAnalysis?.location || liveTelemetry?.location,
      summaryText: lines.join('\n'),
      sources,
    };
  }
}
