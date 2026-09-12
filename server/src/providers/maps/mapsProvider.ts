import { CitationPayload, ValidationResult, DataQuality } from '../dataProvider';

export interface MapBounds {
  north: number;
  south: number;
  east: number;
  west: number;
}

export interface MapLocationPayload {
  latitude: number;
  longitude: number;
  zoom?: number;
  label?: string;
  bounds?: MapBounds;
}

export class MapsProvider {
  public static async getData(lat: number, lon: number, zoom = 12): Promise<{
    data: MapLocationPayload;
    source: CitationPayload;
    retrievedAt: string;
    status: 'LIVE' | 'DEMO' | 'UNAVAILABLE';
    dataQuality: DataQuality;
  }> {
    const isValid = !isNaN(lat) && !isNaN(lon) && lat >= -90 && lat <= 90 && lon >= -180 && lon <= 180;
    
    return {
      data: {
        latitude: lat,
        longitude: lon,
        zoom,
        bounds: {
          north: lat + 0.1,
          south: lat - 0.1,
          east: lon + 0.1,
          west: lon - 0.1,
        },
      },
      source: this.getSourceInfo(),
      retrievedAt: new Date().toISOString(),
      status: isValid ? 'LIVE' : 'UNAVAILABLE',
      dataQuality: isValid ? 'HIGH' : 'LOW',
    };
  }

  public static validate(payload: any): ValidationResult {
    const lat = Number(payload?.latitude);
    const lon = Number(payload?.longitude);
    const isValid = !isNaN(lat) && !isNaN(lon) && lat >= -90 && lat <= 90 && lon >= -180 && lon <= 180;
    
    return {
      isValid,
      quality: isValid ? 'HIGH' : 'LOW',
      dataFreshness: 'Real-time',
      missingFields: isValid ? [] : ['valid coordinates'],
      anomaliesDetected: [],
      confidenceModifier: isValid ? 1.0 : 0.5,
      notes: isValid ? ['Coordinates within valid geographic bounds'] : ['Invalid coordinates specified'],
    };
  }

  public static getSourceInfo(): CitationPayload {
    return {
      key: 'openstreetmap-carto',
      name: 'OpenStreetMap Cartography & Google Maps Tile Interface',
      provider: 'OpenStreetMap Foundation / Google Maps Platform',
      category: 'Geospatial',
      endpoint: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
      license: 'Open Database License (ODbL) / CC BY-SA 2.0',
      updateFrequency: 'Real-time On-Demand',
      retrievedAt: new Date().toISOString(),
      dataFreshness: 'Real-time',
      quality: 'HIGH',
    };
  }
}
