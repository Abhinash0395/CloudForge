import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { GeocodedLocation, LocationAnalysisData, LocationComparisonData } from '../types';
import { api } from '../services/api';

export interface LocationContextType {
  selectedLocation: GeocodedLocation;
  locationData: LocationAnalysisData | null;
  isLoading: boolean;
  isRefreshing: boolean;
  error: string | null;
  locationMode: 'CURRENT_GPS' | 'SEARCHED' | 'MANUAL';
  dataStatus: 'LIVE' | 'PARTIAL' | 'DEMO' | 'STALE' | 'UNAVAILABLE';
  dataVersion: string;
  lastRefreshed: Date | null;
  requestCurrentLocation: () => Promise<void>;
  selectLocation: (loc: GeocodedLocation) => Promise<void>;
  searchLocations: (query: string) => Promise<GeocodedLocation[]>;
  refreshLocationData: () => Promise<void>;
  compareWithLocation: (targetLoc: GeocodedLocation) => Promise<LocationComparisonData | null>;
  clearError: () => void;
  // Start screen flow control
  hasStarted: boolean;
  startRiskLens: () => void;
  resetToStartScreen: () => void;
}

const DEFAULT_LOCATION: GeocodedLocation = {
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
};

// Configurable background refresh intervals in minutes (defaults to 5 minutes)
const WEATHER_REFRESH_MINUTES = Number((import.meta as any)?.env?.VITE_WEATHER_REFRESH_MINUTES) || 5;
const REFRESH_INTERVAL_MS = Math.max(1, WEATHER_REFRESH_MINUTES) * 60 * 1000;

const LocationContext = createContext<LocationContextType | undefined>(undefined);

export const LocationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [selectedLocation, setSelectedLocation] = useState<GeocodedLocation>(DEFAULT_LOCATION);
  const [locationData, setLocationData] = useState<LocationAnalysisData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [locationMode, setLocationMode] = useState<'CURRENT_GPS' | 'SEARCHED' | 'MANUAL'>('MANUAL');
  const [dataStatus, setDataStatus] = useState<'LIVE' | 'PARTIAL' | 'DEMO' | 'STALE' | 'UNAVAILABLE'>('LIVE');
  const [dataVersion, setDataVersion] = useState<string>(() => new Date().toISOString());
  const [lastRefreshed, setLastRefreshed] = useState<Date | null>(null);

  // Start Screen State: Check sessionStorage so page refreshes remember if the user has started
  const [hasStarted, setHasStarted] = useState<boolean>(() => {
    try {
      return sessionStorage.getItem('risklens_started') === 'true';
    } catch {
      return false;
    }
  });

  const startRiskLens = useCallback(() => {
    setHasStarted(true);
    try {
      sessionStorage.setItem('risklens_started', 'true');
    } catch {}
  }, []);

  const resetToStartScreen = useCallback(() => {
    setHasStarted(false);
    try {
      sessionStorage.removeItem('risklens_started');
    } catch {}
  }, []);

  // Atomic fetch & commit function
  const fetchAnalysisForLocation = useCallback(
    async (
      loc: GeocodedLocation,
      mode: 'CURRENT_GPS' | 'SEARCHED' | 'MANUAL' = 'MANUAL',
      isBackground: boolean = false
    ) => {
      if (isBackground) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }
      setError(null);

      try {
        const result = await api.analyzeLocation({
          locationName: loc.formattedName || loc.name,
          latitude: loc.latitude,
          longitude: loc.longitude,
          mode: 'LIVE',
        });

        // Atomic commit of verified dataset
        const versionTimestamp = new Date().toISOString();
        setSelectedLocation(result.location || loc);
        setLocationData(result);
        setLocationMode(mode);
        setDataStatus(result.risk ? 'LIVE' : 'PARTIAL');
        setDataVersion(versionTimestamp);
        setLastRefreshed(new Date());
      } catch (err: any) {
        console.error('[LocationContext] Fetch analysis error:', err);
        setError(err.message || 'Failed to retrieve location telemetry');
        setDataStatus((prev) => (prev === 'LIVE' ? 'STALE' : 'UNAVAILABLE'));
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    []
  );

  // Initial fetch on app mount
  useEffect(() => {
    fetchAnalysisForLocation(DEFAULT_LOCATION, 'MANUAL', false);
  }, [fetchAnalysisForLocation]);

  // Central Automatic Data Refresh Manager (Part 5)
  useEffect(() => {
    const interval = setInterval(() => {
      // Periodic background refresh of current active location
      fetchAnalysisForLocation(selectedLocation, locationMode, true);
    }, REFRESH_INTERVAL_MS);

    return () => clearInterval(interval);
  }, [selectedLocation, locationMode, fetchAnalysisForLocation]);

  /**
   * Request Browser Geolocation for "My Location" (On-demand only)
   */
  const requestCurrentLocation = async () => {
    if (!navigator.geolocation) {
      const msg = 'Geolocation is not supported by your browser.';
      setError(msg);
      return;
    }

    setIsLoading(true);
    setError(null);

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const { latitude, longitude } = pos.coords;
          const geocoded = await api.getCurrentLocation(latitude, longitude);
          await fetchAnalysisForLocation(geocoded, 'CURRENT_GPS', false);
        } catch (err: any) {
          console.error('[LocationContext] Reverse geocode error:', err);
          setError(err.message || 'Unable to reverse geocode current coordinates');
          setIsLoading(false);
        }
      },
      (geoError) => {
        setIsLoading(false);
        let errorMsg = 'Location permission was not granted.';
        if (geoError.code === geoError.TIMEOUT) {
          errorMsg = 'Location request timed out. Please try searching manually.';
        } else if (geoError.code === geoError.POSITION_UNAVAILABLE) {
          errorMsg = 'Current position unavailable. Please search manually.';
        }
        setError(errorMsg);
      },
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 0 }
    );
  };

  /**
   * User selects a location candidate
   */
  const selectLocation = async (loc: GeocodedLocation) => {
    await fetchAnalysisForLocation(loc, 'SEARCHED', false);
  };

  /**
   * Search query against global geocoding engine
   */
  const searchLocations = async (query: string): Promise<GeocodedLocation[]> => {
    try {
      const resp = await api.searchLocations(query);
      return resp.results || [];
    } catch (err: any) {
      console.warn('[LocationContext] Search error:', err);
      return [];
    }
  };

  /**
   * Explicit user-triggered refresh
   */
  const refreshLocationData = async () => {
    await fetchAnalysisForLocation(selectedLocation, locationMode, false);
  };

  /**
   * Compare active location with another target location
   */
  const compareWithLocation = async (targetLoc: GeocodedLocation): Promise<LocationComparisonData | null> => {
    try {
      return await api.compareLocations(selectedLocation, targetLoc);
    } catch (err: any) {
      console.error('[LocationContext] Compare error:', err);
      return null;
    }
  };

  return (
    <LocationContext.Provider
      value={{
        selectedLocation,
        locationData,
        isLoading,
        isRefreshing,
        error,
        locationMode,
        dataStatus,
        dataVersion,
        lastRefreshed,
        requestCurrentLocation,
        selectLocation,
        searchLocations,
        refreshLocationData,
        compareWithLocation,
        clearError: () => setError(null),
        hasStarted,
        startRiskLens,
        resetToStartScreen,
      }}
    >
      {children}
    </LocationContext.Provider>
  );
};

export const useLocationContext = () => {
  const context = useContext(LocationContext);
  if (!context) {
    throw new Error('useLocationContext must be used within a LocationProvider');
  }
  return context;
};
