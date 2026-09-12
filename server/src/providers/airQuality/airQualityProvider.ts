import { environmentProvider, EnvironmentalMetrics } from '../environmentProvider';
import { ValidationResult, CitationPayload, NormalizedData, DataQuality } from '../dataProvider';

export interface AirQualityProviderResponse {
  data: EnvironmentalMetrics;
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

export class AirQualityProvider {
  public static async getData(lat: number, lon: number, locationName = 'Unknown'): Promise<AirQualityProviderResponse> {
    try {
      const raw = await environmentProvider.fetchRaw({ latitude: lat, longitude: lon, locationName });
      const validation = environmentProvider.validate(raw);
      const normalized = environmentProvider.normalize(raw, validation, { latitude: lat, longitude: lon, locationName });

      return {
        data: normalized.metrics,
        source: normalized.sources[0],
        retrievedAt: normalized.retrievedAt,
        location: {
          name: locationName,
          latitude: lat,
          longitude: lon,
        },
        status: normalized.mode === 'LIVE' ? 'LIVE' : 'DEMO',
        dataQuality: validation.quality,
      };
    } catch (error: any) {
      console.warn('[AirQualityProvider] Air quality fetch failed:', error.message);
      return {
        data: {} as any,
        source: {
          key: 'copernicus-cams-air-quality',
          name: 'Copernicus Atmosphere Monitoring Service (CAMS)',
          provider: 'European Centre for Medium-Range Weather Forecasts (ECMWF)',
          category: 'Air Quality',
          endpoint: 'https://air-quality-api.open-meteo.com/v1/air-quality',
          license: 'Copernicus Climate Change Service (C3S) / CC BY 4.0',
          updateFrequency: 'Hourly (15-min cadence)',
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
    return environmentProvider.validate(raw);
  }

  public static normalize(raw: any, validation: ValidationResult, input: { latitude: number; longitude: number; locationName?: string }): NormalizedData<EnvironmentalMetrics> {
    return environmentProvider.normalize(raw, validation, input);
  }

  public static getSourceInfo(): CitationPayload {
    return {
      key: 'copernicus-cams-air-quality',
      name: 'Copernicus Atmosphere Monitoring Service (CAMS)',
      provider: 'European Centre for Medium-Range Weather Forecasts (ECMWF)',
      category: 'Air Quality',
      endpoint: 'https://air-quality-api.open-meteo.com/v1/air-quality',
      license: 'Copernicus Climate Change Service (C3S) / CC BY 4.0',
      updateFrequency: 'Hourly (15-min cadence)',
      retrievedAt: new Date().toISOString(),
      dataFreshness: '< 30m ago',
      quality: 'HIGH',
    };
  }
}

export { environmentProvider };
