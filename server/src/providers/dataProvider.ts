/**
 * RISKLENS AI — Traceable Data Provider Core Interface & Contracts
 * Principle: Truthfulness > Visual Effects. Never fabricate live data.
 */

export type DataQuality = 'HIGH' | 'MODERATE' | 'LOW';
export type OperationMode = 'LIVE' | 'DEMO';

export interface IDataSourceInfo {
  key: string;
  name: string;
  provider: string;
  category: 'Meteorological' | 'Geospatial' | 'Air Quality' | 'Infrastructure' | 'Vision' | 'Synthetic Simulation';
  endpoint: string;
  license: string;
  updateFrequency: string;
  retrievedAt: string; // ISO String
  dataFreshness: string; // e.g. "Just now", "4 mins ago", "1 hour ago"
  status: 'ACTIVE' | 'DEGRADED' | 'FALLBACK' | 'OFFLINE';
  latencyMs?: number;
}

export interface ValidationResult {
  isValid: boolean;
  quality: DataQuality;
  dataFreshness: string;
  missingFields: string[];
  anomaliesDetected: string[];
  confidenceModifier: number; // 0.8 - 1.0 based on data completeness
  notes: string[];
}

export interface CitationPayload {
  key: string;
  name: string;
  provider: string;
  category: string;
  endpoint: string;
  license: string;
  updateFrequency: string;
  retrievedAt: string;
  dataFreshness: string;
  quality: DataQuality;
  rawMetricCount?: number;
  sampleMetrics?: Record<string, any>;
}

export interface NormalizedData<T = any> {
  mode: OperationMode;
  location?: {
    name: string;
    latitude: number;
    longitude: number;
    country?: string;
    admin1?: string;
    elevation?: number;
    timezone?: string;
  };
  metrics: T;
  validation: ValidationResult;
  sources: CitationPayload[];
  retrievedAt: string;
}

export interface IDataProvider<TInput, TOutput> {
  key: string;
  name: string;
  category: string;
  endpoint: string;
  license: string;
  updateFrequency: string;

  /**
   * Fetch raw data from external API or verified source
   */
  fetchRaw(input: TInput): Promise<any>;

  /**
   * Validate raw data completeness, freshness, and format integrity
   */
  validate(raw: any): ValidationResult;

  /**
   * Normalize raw data into standardized risk engine telemetry
   */
  normalize(raw: any, validation: ValidationResult, input: TInput): NormalizedData<TOutput>;

  /**
   * Health check / ping
   */
  checkHealth(): Promise<{ status: 'ACTIVE' | 'DEGRADED' | 'OFFLINE'; latencyMs: number }>;
}
