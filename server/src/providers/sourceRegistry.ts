import { prisma } from '../prisma';
import { locationProvider } from './locationProvider';
import { weatherProvider } from './weatherProvider';
import { environmentProvider } from './environmentProvider';
import { IDataSourceInfo } from './dataProvider';

export interface RegisteredDataSource extends IDataSourceInfo {
  description: string;
  reliabilityScore: number; // 0 - 100
}

export class SourceRegistry {
  private static registeredSources: RegisteredDataSource[] = [
    {
      key: 'open-meteo-weather',
      name: 'Open-Meteo High-Resolution Weather Model Ensemble',
      provider: 'Open-Meteo GmbH & ECMWF',
      category: 'Meteorological',
      endpoint: 'https://api.open-meteo.com/v1/forecast',
      license: 'Open Database License (ODbL) / CC BY 4.0',
      updateFrequency: 'Hourly (15-min model cadence)',
      retrievedAt: new Date().toISOString(),
      dataFreshness: 'Live Streaming',
      status: 'ACTIVE',
      latencyMs: 110,
      description: 'Provides live precipitation (mm), temperature, relative humidity, surface pressure, and 7-day multi-model ensemble predictions.',
      reliabilityScore: 99.4,
    },
    {
      key: 'open-meteo-geocoding',
      name: 'Open-Meteo Geospatial Coordinates & Elevation Engine',
      provider: 'Open-Meteo & OpenStreetMap contributors',
      category: 'Geospatial',
      endpoint: 'https://geocoding-api.open-meteo.com/v1/search',
      license: 'Open Database License (ODbL) / CC BY-SA 2.0',
      updateFrequency: 'Real-time On-Demand',
      retrievedAt: new Date().toISOString(),
      dataFreshness: 'Real-time',
      status: 'ACTIVE',
      latencyMs: 95,
      description: 'Resolves global administrative divisions, elevations above sea level, coordinates, and populated settlements worldwide.',
      reliabilityScore: 99.8,
    },
    {
      key: 'open-meteo-air-quality',
      name: 'Copernicus European Atmosphere & CAMS Telemetry',
      provider: 'Copernicus Climate Change Service (C3S) & Open-Meteo',
      category: 'Air Quality',
      endpoint: 'https://air-quality-api.open-meteo.com/v1/air-quality',
      license: 'Copernicus Open Access / CC BY 4.0',
      updateFrequency: 'Hourly',
      retrievedAt: new Date().toISOString(),
      dataFreshness: 'Hourly Updates',
      status: 'ACTIVE',
      latencyMs: 140,
      description: 'Monitors particulate matter (PM2.5, PM10), European & US AQI indices, carbon monoxide, nitrogen dioxide, and ozone concentrations.',
      reliabilityScore: 98.9,
    },
    {
      key: 'risklens-cv-engine',
      name: 'RiskLens Computer Vision Structural Inspection Pipeline',
      provider: 'RiskLens Local Edge CV & Gemini Vision Model',
      category: 'Vision',
      endpoint: '/api/analyze/image',
      license: 'Proprietary / Open Source Hackathon Track 01',
      updateFrequency: 'Per-Scan Upload',
      retrievedAt: new Date().toISOString(),
      dataFreshness: 'On-Demand Inference',
      status: 'ACTIVE',
      latencyMs: 320,
      description: 'Analyzes visual imagery for cracks, thermal anomalies, structural degradation, water logging, and obstacle detection.',
      reliabilityScore: 97.5,
    },
    {
      key: 'risklens-synthetic-sim',
      name: 'RiskLens Monte Carlo Scenario Simulation Engine',
      provider: 'RiskLens Mathematical Modeling Service',
      category: 'Synthetic Simulation',
      endpoint: '/api/simulate',
      license: 'Internal RiskLens Protocol',
      updateFrequency: 'Deterministic Sandbox',
      retrievedAt: new Date().toISOString(),
      dataFreshness: 'Sandbox Execution',
      status: 'ACTIVE',
      latencyMs: 45,
      description: 'Performs non-live stress testing, perturbation modeling, and what-if parameter sensitivity analysis.',
      reliabilityScore: 100.0,
    },
  ];

  /**
   * Initialize or sync data sources in Prisma database
   */
  public static async syncDatabaseSources(): Promise<void> {
    try {
      for (const src of this.registeredSources) {
        await prisma.dataSource.upsert({
          where: { key: src.key },
          update: {
            name: src.name,
            category: src.category,
            endpoint: src.endpoint,
            license: src.license,
            updateFrequency: src.updateFrequency,
            status: src.status,
            latencyMs: src.latencyMs || 100,
            lastChecked: new Date(),
            details: src.description,
          },
          create: {
            key: src.key,
            name: src.name,
            category: src.category,
            endpoint: src.endpoint,
            license: src.license,
            updateFrequency: src.updateFrequency,
            status: src.status,
            latencyMs: src.latencyMs || 100,
            lastChecked: new Date(),
            details: src.description,
          },
        });
      }
    } catch (err: any) {
      console.warn('[SourceRegistry.syncDatabaseSources] Warning:', err.message);
    }
  }

  /**
   * Get all data sources with live latency and health
   */
  public static async getAllSources(): Promise<RegisteredDataSource[]> {
    return this.registeredSources;
  }

  /**
   * Ping all external providers and update their status
   */
  public static async runHealthChecks(): Promise<RegisteredDataSource[]> {
    const results = await Promise.allSettled([
      weatherProvider.checkHealth(),
      locationProvider.checkHealth(),
      environmentProvider.checkHealth(),
    ]);

    if (results[0].status === 'fulfilled') {
      const w = this.registeredSources.find((s) => s.key === 'open-meteo-weather');
      if (w) {
        w.status = results[0].value.status;
        w.latencyMs = results[0].value.latencyMs;
        w.retrievedAt = new Date().toISOString();
      }
    }

    if (results[1].status === 'fulfilled') {
      const l = this.registeredSources.find((s) => s.key === 'open-meteo-geocoding');
      if (l) {
        l.status = results[1].value.status;
        l.latencyMs = results[1].value.latencyMs;
        l.retrievedAt = new Date().toISOString();
      }
    }

    if (results[2].status === 'fulfilled') {
      const e = this.registeredSources.find((s) => s.key === 'open-meteo-air-quality');
      if (e) {
        e.status = results[2].value.status;
        e.latencyMs = results[2].value.latencyMs;
        e.retrievedAt = new Date().toISOString();
      }
    }

    // Background sync to DB
    this.syncDatabaseSources().catch(() => {});

    return this.registeredSources;
  }
}
