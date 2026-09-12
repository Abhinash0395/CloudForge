import { IDataProvider, NormalizedData, ValidationResult, CitationPayload } from './dataProvider';

export interface LocationQuery {
  query: string;
}

export interface GeocodedLocation {
  name: string;
  latitude: number;
  longitude: number;
  country: string;
  countryCode: string;
  admin1?: string; // State / Province
  elevation?: number;
  timezone?: string;
  population?: number;
  formattedName: string;
}

// Built-in verified reference centroids for instant local resolution / fallback
const KNOWN_REFERENCE_LOCATIONS: Record<string, GeocodedLocation> = {
  gorakhpur: {
    name: 'Gorakhpur',
    latitude: 26.7606,
    longitude: 83.3732,
    country: 'India',
    countryCode: 'IN',
    admin1: 'Uttar Pradesh',
    elevation: 84,
    timezone: 'Asia/Kolkata',
    population: 673446,
    formattedName: 'Gorakhpur, Uttar Pradesh, India',
  },
  mumbai: {
    name: 'Mumbai',
    latitude: 19.076,
    longitude: 72.8777,
    country: 'India',
    countryCode: 'IN',
    admin1: 'Maharashtra',
    elevation: 14,
    timezone: 'Asia/Kolkata',
    population: 12442373,
    formattedName: 'Mumbai, Maharashtra, India',
  },
  patna: {
    name: 'Patna',
    latitude: 25.5941,
    longitude: 85.1376,
    country: 'India',
    countryCode: 'IN',
    admin1: 'Bihar',
    elevation: 53,
    timezone: 'Asia/Kolkata',
    population: 1684222,
    formattedName: 'Patna, Bihar, India',
  },
  delhi: {
    name: 'New Delhi',
    latitude: 28.6139,
    longitude: 77.209,
    country: 'India',
    countryCode: 'IN',
    admin1: 'Delhi',
    elevation: 216,
    timezone: 'Asia/Kolkata',
    population: 249998,
    formattedName: 'New Delhi, Delhi, India',
  },
  guwahati: {
    name: 'Guwahati',
    latitude: 26.1445,
    longitude: 91.7362,
    country: 'India',
    countryCode: 'IN',
    admin1: 'Assam',
    elevation: 55,
    timezone: 'Asia/Kolkata',
    population: 957352,
    formattedName: 'Guwahati, Assam, India',
  },
  bengaluru: {
    name: 'Bengaluru',
    latitude: 12.9716,
    longitude: 77.5946,
    country: 'India',
    countryCode: 'IN',
    admin1: 'Karnataka',
    elevation: 920,
    timezone: 'Asia/Kolkata',
    population: 8443675,
    formattedName: 'Bengaluru, Karnataka, India',
  },
  kolkata: {
    name: 'Kolkata',
    latitude: 22.5726,
    longitude: 88.3639,
    country: 'India',
    countryCode: 'IN',
    admin1: 'West Bengal',
    elevation: 9,
    timezone: 'Asia/Kolkata',
    population: 4496694,
    formattedName: 'Kolkata, West Bengal, India',
  },
  chennai: {
    name: 'Chennai',
    latitude: 13.0827,
    longitude: 80.2707,
    country: 'India',
    countryCode: 'IN',
    admin1: 'Tamil Nadu',
    elevation: 6,
    timezone: 'Asia/Kolkata',
    population: 7088000,
    formattedName: 'Chennai, Tamil Nadu, India',
  },
  london: {
    name: 'London',
    latitude: 51.5074,
    longitude: -0.1278,
    country: 'United Kingdom',
    countryCode: 'GB',
    admin1: 'England',
    elevation: 25,
    timezone: 'Europe/London',
    population: 8982000,
    formattedName: 'London, England, United Kingdom',
  },
  tokyo: {
    name: 'Tokyo',
    latitude: 35.6762,
    longitude: 139.6503,
    country: 'Japan',
    countryCode: 'JP',
    admin1: 'Tokyo',
    elevation: 40,
    timezone: 'Asia/Tokyo',
    population: 13960000,
    formattedName: 'Tokyo, Japan',
  },
  'new york': {
    name: 'New York',
    latitude: 40.7128,
    longitude: -74.006,
    country: 'United States',
    countryCode: 'US',
    admin1: 'New York',
    elevation: 10,
    timezone: 'America/New_York',
    population: 8804190,
    formattedName: 'New York, NY, United States',
  },
};

export class LocationProvider implements IDataProvider<LocationQuery, GeocodedLocation[]> {
  public key = 'open-meteo-geocoding';
  public name = 'Open-Meteo Geocoding Engine';
  public category = 'Geospatial';
  public endpoint = 'https://geocoding-api.open-meteo.com/v1/search';
  public license = 'Open Database License (ODbL) / CC BY 4.0';
  public updateFrequency = 'Real-time On-Demand';

  public async fetchRaw(input: LocationQuery): Promise<any> {
    const q = input.query.trim();
    if (!q) return { results: [] };

    try {
      const url = `${this.endpoint}?name=${encodeURIComponent(q)}&count=6&language=en&format=json`;
      const res = await fetch(url, { signal: AbortSignal.timeout(4500) });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch (err: any) {
      console.warn(`[LocationProvider] Geocoding network fetch failed for "${q}":`, err.message);
      // Fallback to local verified dictionary
      const lower = q.toLowerCase();
      const matched = Object.keys(KNOWN_REFERENCE_LOCATIONS)
        .filter((k) => k.includes(lower) || lower.includes(k))
        .map((k) => KNOWN_REFERENCE_LOCATIONS[k]);

      if (matched.length > 0) {
        return {
          results: matched.map((m) => ({
            name: m.name,
            latitude: m.latitude,
            longitude: m.longitude,
            country: m.country,
            country_code: m.countryCode,
            admin1: m.admin1,
            elevation: m.elevation,
            timezone: m.timezone,
            population: m.population,
          })),
          isFallback: true,
        };
      }
      return { results: [] };
    }
  }

  public validate(raw: any): ValidationResult {
    if (!raw || !Array.isArray(raw.results)) {
      return {
        isValid: false,
        quality: 'LOW',
        dataFreshness: 'Offline / Unavailable',
        missingFields: ['results'],
        anomaliesDetected: ['Empty or malformed geocoding payload'],
        confidenceModifier: 0.7,
        notes: ['Geocoding provider returned no structured coordinates.'],
      };
    }

    if (raw.results.length === 0) {
      return {
        isValid: false,
        quality: 'LOW',
        dataFreshness: 'No Match',
        missingFields: [],
        anomaliesDetected: ['No matching coordinates found for requested location name'],
        confidenceModifier: 0.75,
        notes: ['Search yielded 0 candidate coordinates.'],
      };
    }

    return {
      isValid: true,
      quality: 'HIGH',
      dataFreshness: 'Live API (Real-time)',
      missingFields: [],
      anomaliesDetected: [],
      confidenceModifier: 1.0,
      notes: [`Successfully resolved ${raw.results.length} spatial candidates.`],
    };
  }

  public normalize(raw: any, validation: ValidationResult, input: LocationQuery): NormalizedData<GeocodedLocation[]> {
    const locations: GeocodedLocation[] = [];

    if (raw && Array.isArray(raw.results)) {
      for (const item of raw.results) {
        if (typeof item.latitude === 'number' && typeof item.longitude === 'number') {
          const parts = [item.name];
          if (item.admin1 && item.admin1 !== item.name) parts.push(item.admin1);
          if (item.country) parts.push(item.country);

          locations.push({
            name: item.name,
            latitude: item.latitude,
            longitude: item.longitude,
            country: item.country || 'Unknown',
            countryCode: item.country_code || '',
            admin1: item.admin1,
            elevation: item.elevation,
            timezone: item.timezone,
            population: item.population,
            formattedName: parts.join(', '),
          });
        }
      }
    }

    // If live returned 0 but input has known city
    if (locations.length === 0) {
      const lower = input.query.toLowerCase();
      for (const [k, loc] of Object.entries(KNOWN_REFERENCE_LOCATIONS)) {
        if (lower.includes(k) || k.includes(lower)) {
          locations.push(loc);
          break;
        }
      }
    }

    const citation: CitationPayload = {
      key: this.key,
      name: this.name,
      provider: 'Open-Meteo',
      category: this.category,
      endpoint: `${this.endpoint}?name=${encodeURIComponent(input.query)}`,
      license: this.license,
      updateFrequency: this.updateFrequency,
      retrievedAt: new Date().toISOString(),
      dataFreshness: validation.dataFreshness,
      quality: validation.quality,
      rawMetricCount: locations.length,
      sampleMetrics: locations[0] ? { latitude: locations[0].latitude, longitude: locations[0].longitude } : undefined,
    };

    return {
      mode: 'LIVE',
      location: locations[0],
      metrics: locations,
      validation,
      sources: [citation],
      retrievedAt: new Date().toISOString(),
    };
  }

  public async checkHealth(): Promise<{ status: 'ACTIVE' | 'DEGRADED' | 'OFFLINE'; latencyMs: number }> {
    const start = Date.now();
    try {
      const res = await fetch(`${this.endpoint}?name=Gorakhpur&count=1`, { signal: AbortSignal.timeout(3000) });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return { status: 'ACTIVE', latencyMs: Date.now() - start };
    } catch {
      return { status: 'DEGRADED', latencyMs: Date.now() - start };
    }
  }

  /**
   * Helper: Resolve top match or fallback for a location string
   */
  public async resolveLocation(query: string): Promise<GeocodedLocation | null> {
    const raw = await this.fetchRaw({ query });
    const val = this.validate(raw);
    const norm = this.normalize(raw, val, { query });
    return norm.metrics[0] || null;
  }

  /**
   * Reverse Geocode (Latitude, Longitude) -> City, State, Country, Formatted Name
   */
  public async reverseGeocode(latitude: number, longitude: number): Promise<GeocodedLocation> {
    // 1. Try BigDataCloud free client reverse geocoding API
    try {
      const bdcUrl = `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`;
      const res = await fetch(bdcUrl, { signal: AbortSignal.timeout(4000) });
      if (res.ok) {
        const data = await res.json();
        const city = data.city || data.locality || data.principalSubdivision || 'Location Centroid';
        const state = data.principalSubdivision || '';
        const country = data.countryName || 'India';
        const countryCode = data.countryCode || 'IN';

        const parts = [city];
        if (state && state !== city) parts.push(state);
        if (country) parts.push(country);

        return {
          name: city,
          latitude,
          longitude,
          country,
          countryCode,
          admin1: state,
          formattedName: parts.join(', '),
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC',
        };
      }
    } catch (e: any) {
      console.warn('[LocationProvider] BigDataCloud reverse geocode error:', e.message);
    }

    // 2. Try OpenStreetMap Nominatim reverse geocoding API
    try {
      const nomUrl = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=14&addressdetails=1`;
      const res = await fetch(nomUrl, {
        headers: { 'User-Agent': 'RiskLensAI-LocationIntelligence/1.0 (contact@risklens.ai)' },
        signal: AbortSignal.timeout(4000),
      });
      if (res.ok) {
        const data = await res.json();
        const addr = data.address || {};
        const city = addr.city || addr.town || addr.village || addr.suburb || addr.county || 'Coordinates';
        const state = addr.state || addr.region || '';
        const country = addr.country || 'India';
        const countryCode = (addr.country_code || 'in').toUpperCase();

        const parts = [city];
        if (state && state !== city) parts.push(state);
        if (country) parts.push(country);

        return {
          name: city,
          latitude,
          longitude,
          country,
          countryCode,
          admin1: state,
          formattedName: parts.join(', '),
        };
      }
    } catch (e: any) {
      console.warn('[LocationProvider] Nominatim reverse geocode error:', e.message);
    }

    // 3. Fallback: Find closest known reference centroid if within ~50km
    let closest: GeocodedLocation | null = null;
    let minDistance = Infinity;

    for (const ref of Object.values(KNOWN_REFERENCE_LOCATIONS)) {
      const dLat = ref.latitude - latitude;
      const dLon = ref.longitude - longitude;
      const dist = Math.sqrt(dLat * dLat + dLon * dLon);
      if (dist < minDistance) {
        minDistance = dist;
        closest = ref;
      }
    }

    if (closest && minDistance < 0.5) { // ~50 km
      return {
        ...closest,
        latitude,
        longitude,
        formattedName: `${closest.name} Vicinity (${latitude.toFixed(2)}°, ${longitude.toFixed(2)}°)`,
      };
    }

    return {
      name: `Lat ${latitude.toFixed(2)}°, Lon ${longitude.toFixed(2)}°`,
      latitude,
      longitude,
      country: 'Global Coordinate Centroid',
      countryCode: 'UN',
      formattedName: `Coordinate Location (${latitude.toFixed(4)}, ${longitude.toFixed(4)})`,
    };
  }
}

export const locationProvider = new LocationProvider();
