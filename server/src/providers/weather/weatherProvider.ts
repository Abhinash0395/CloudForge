import { weatherProvider, MeteorologicalMetrics } from '../weatherProvider';
import { ValidationResult, CitationPayload, NormalizedData, DataQuality } from '../dataProvider';

export interface WeatherProviderResponse {
  data: MeteorologicalMetrics;
  source: CitationPayload;
  retrievedAt: string;
  location: {
    name: string;
    latitude: number;
    longitude: number;
  };
  status: 'LIVE' | 'DEMO' | 'UNAVAILABLE' | 'STALE' | 'ERROR';
  dataQuality: DataQuality;
}

export class WeatherDataProvider {
  public static async getData(lat: number, lon: number, locationName = 'Unknown'): Promise<WeatherProviderResponse> {
    try {
      const raw = await weatherProvider.fetchRaw({ latitude: lat, longitude: lon, locationName });
      const validation = weatherProvider.validate(raw);
      const normalized = weatherProvider.normalize(raw, validation, { latitude: lat, longitude: lon, locationName });

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
      console.warn('[WeatherDataProvider] Live fetch failed, using fallback:', error.message);
      return {
        data: {} as any,
        source: {
          key: 'open-meteo-weather',
          name: 'Open-Meteo High-Resolution Weather API',
          provider: 'Open-Meteo GmbH / ECMWF',
          category: 'Meteorological',
          endpoint: 'https://api.open-meteo.com/v1/forecast',
          license: 'Open Database License (ODbL) / CC BY 4.0',
          updateFrequency: 'Hourly (15-min cadence)',
          retrievedAt: new Date().toISOString(),
          dataFreshness: 'Offline',
          quality: 'LOW',
        },
        retrievedAt: new Date().toISOString(),
        location: { name: locationName, latitude: lat, longitude: lon },
        status: 'UNAVAILABLE',
        dataQuality: 'LOW',
      };
    }
  }

  public static validate(raw: any): ValidationResult {
    return weatherProvider.validate(raw);
  }

  public static normalize(raw: any, validation: ValidationResult, input: { latitude: number; longitude: number; locationName?: string }): NormalizedData<MeteorologicalMetrics> {
    return weatherProvider.normalize(raw, validation, input);
  }

  public static getSourceInfo(): CitationPayload {
    return {
      key: 'open-meteo-weather',
      name: 'Open-Meteo High-Resolution Weather API',
      provider: 'Open-Meteo GmbH / ECMWF',
      category: 'Meteorological',
      endpoint: 'https://api.open-meteo.com/v1/forecast',
      license: 'Open Database License (ODbL) / CC BY 4.0',
      updateFrequency: 'Hourly (15-min cadence)',
      retrievedAt: new Date().toISOString(),
      dataFreshness: '< 15m ago',
      quality: 'HIGH',
    };
  }
}

export { weatherProvider };
