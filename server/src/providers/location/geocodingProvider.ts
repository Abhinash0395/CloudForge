import { locationProvider, GeocodedLocation } from '../locationProvider';
import { ValidationResult, CitationPayload, NormalizedData, DataQuality } from '../dataProvider';

export interface GeocodingProviderResponse {
  data: GeocodedLocation[];
  source: CitationPayload;
  retrievedAt: string;
  location?: {
    name: string;
    latitude: number;
    longitude: number;
  };
  status: 'LIVE' | 'DEMO' | 'UNAVAILABLE' | 'STALE' | 'ERROR';
  dataQuality: DataQuality;
}

export class GeocodingProvider {
  public static async getData(query: string): Promise<GeocodingProviderResponse> {
    try {
      const raw = await locationProvider.fetchRaw({ query });
      const validation = locationProvider.validate(raw);
      const normalized = locationProvider.normalize(raw, validation, { query });

      return {
        data: normalized.metrics,
        source: normalized.sources[0],
        retrievedAt: normalized.retrievedAt,
        location: normalized.location,
        status: normalized.mode === 'LIVE' ? 'LIVE' : 'DEMO',
        dataQuality: validation.quality,
      };
    } catch (error: any) {
      console.warn('[GeocodingProvider] Geocoding failed, using fallback:', error.message);
      return {
        data: [],
        source: {
          key: 'open-meteo-geocoding',
          name: 'Open-Meteo Global Geocoding API',
          provider: 'Open-Meteo GmbH / OpenStreetMap Foundation',
          category: 'Geospatial',
          endpoint: 'https://geocoding-api.open-meteo.com/v1/search',
          license: 'Open Database License (ODbL) / CC BY-SA 2.0',
          updateFrequency: 'Real-time On-Demand',
          retrievedAt: new Date().toISOString(),
          dataFreshness: 'Offline',
          quality: 'LOW',
        },
        retrievedAt: new Date().toISOString(),
        status: 'UNAVAILABLE',
        dataQuality: 'LOW',
      };
    }
  }

  public static validate(raw: any): ValidationResult {
    return locationProvider.validate(raw);
  }

  public static normalize(raw: any, validation: ValidationResult, input: { query: string }): NormalizedData<GeocodedLocation[]> {
    return locationProvider.normalize(raw, validation, input);
  }

  public static getSourceInfo(): CitationPayload {
    return {
      key: 'open-meteo-geocoding',
      name: 'Open-Meteo Global Geocoding API',
      provider: 'Open-Meteo GmbH / OpenStreetMap Foundation',
      category: 'Geospatial',
      endpoint: 'https://geocoding-api.open-meteo.com/v1/search',
      license: 'Open Database License (ODbL) / CC BY-SA 2.0',
      updateFrequency: 'Real-time On-Demand',
      retrievedAt: new Date().toISOString(),
      dataFreshness: '< 5m ago',
      quality: 'HIGH',
    };
  }
}

export { locationProvider };
