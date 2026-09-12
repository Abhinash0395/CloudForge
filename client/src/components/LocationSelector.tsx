import React, { useState, useEffect, useRef } from 'react';
import {
  MapPin,
  Search,
  Crosshair,
  RefreshCw,
  SlidersHorizontal,
  ChevronDown,
  AlertCircle,
  Check,
  Globe2,
  X,
  Compass,
} from 'lucide-react';
import { useLocationContext } from '../context/LocationContext';
import { GeocodedLocation } from '../types';

interface LocationSelectorProps {
  onOpenCompare?: () => void;
  className?: string;
  isHeroPrompt?: boolean;
}

export const LocationSelector: React.FC<LocationSelectorProps> = ({
  onOpenCompare,
  className = '',
  isHeroPrompt = false,
}) => {
  const {
    selectedLocation,
    locationData,
    isLoading,
    isRefreshing,
    error,
    locationMode,
    dataStatus,
    lastRefreshed,
    requestCurrentLocation,
    selectLocation,
    searchLocations,
    refreshLocationData,
    clearError,
  } = useLocationContext();

  const [query, setQuery] = useState('');
  const [candidates, setCandidates] = useState<GeocodedLocation[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchTimeoutRef = useRef<any>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Debounced search
  const handleQueryChange = (val: string) => {
    setQuery(val);
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);

    if (val.trim().length < 2) {
      setCandidates([]);
      setDropdownOpen(false);
      return;
    }

    setIsSearching(true);
    searchTimeoutRef.current = setTimeout(async () => {
      const results = await searchLocations(val.trim());
      setCandidates(results);
      setIsSearching(false);
      setDropdownOpen(true);
    }, 280);
  };

  const handleSelectCandidate = async (candidate: GeocodedLocation) => {
    setDropdownOpen(false);
    setQuery('');
    await selectLocation(candidate);
  };

  return (
    <div
      className={`rounded-2xl border border-white/15 bg-[#081B30]/95 backdrop-blur-xl p-4 sm:p-6 shadow-2xl relative z-20 ${className}`}
    >
      {/* Top Banner Header: Where do you want to analyze? */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/15 border border-cyan-500/40 flex items-center justify-center text-cyan-400 shadow-glow-cyan/20 flex-shrink-0">
            {locationMode === 'CURRENT_GPS' ? (
              <Crosshair className="w-5 h-5 text-cyan-400 animate-pulse" />
            ) : (
              <MapPin className="w-5 h-5 text-cyan-400" />
            )}
          </div>
          <div>
            <div className="text-xs uppercase tracking-wider font-bold text-cyan-400 flex items-center gap-1.5 font-mono">
              <span>📍 Where do you want to analyze?</span>
            </div>
            <h2 className="text-base sm:text-xl font-bold text-white flex items-center gap-2 mt-0.5">
              <span>{selectedLocation.formattedName || selectedLocation.name}</span>
            </h2>
          </div>
        </div>

        {/* Live Status Pill & Refresh Controls */}
        <div className="flex items-center gap-2">
          {dataStatus === 'LIVE' && (
            <span
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold"
              title="Verified live telemetry from Open-Meteo & Copernicus CAMS"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>● LIVE DATA</span>
            </span>
          )}
          {dataStatus === 'PARTIAL' && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-semibold">
              <span className="w-2 h-2 rounded-full bg-amber-400" />
              <span>● PARTIAL DATA</span>
            </span>
          )}
          {dataStatus === 'STALE' && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-500/10 border border-orange-500/30 text-orange-400 text-xs font-semibold">
              <span className="w-2 h-2 rounded-full bg-orange-400" />
              <span>● STALE DATA</span>
            </span>
          )}
          {dataStatus === 'DEMO' && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs font-semibold">
              <span>● DEMO MODE</span>
            </span>
          )}

          <button
            onClick={refreshLocationData}
            disabled={isLoading || isRefreshing}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white transition-all disabled:opacity-50 cursor-pointer"
            title="Refresh verified telemetry now"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading || isRefreshing ? 'animate-spin text-cyan-400' : ''}`} />
          </button>
        </div>
      </div>

      {/* Permission / Geocoding Notice Banner */}
      {error && (
        <div className="mt-3 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
            <span>{error}</span>
          </div>
          <button
            onClick={clearError}
            className="text-slate-400 hover:text-white p-1"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Search Input and Location Controls */}
      <div className="mt-4 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        {/* Search Input with Autocomplete */}
        <div className="relative flex-1" ref={dropdownRef}>
          <div className="relative flex items-center">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" />
            <input
              type="text"
              value={query}
              onChange={(e) => handleQueryChange(e.target.value)}
              onFocus={() => candidates.length > 0 && setDropdownOpen(true)}
              placeholder="Search any location (e.g. Gorakhpur, Delhi, London, Tokyo, New York)..."
              className="w-full bg-[#06111F] border border-white/15 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/40 text-sm text-white placeholder-slate-400 pl-10 pr-10 py-3 rounded-xl transition-all outline-none shadow-inner"
            />
            {isSearching && (
              <RefreshCw className="w-4 h-4 text-cyan-400 animate-spin absolute right-3.5" />
            )}
            {query && !isSearching && (
              <button
                onClick={() => {
                  setQuery('');
                  setCandidates([]);
                  setDropdownOpen(false);
                }}
                className="absolute right-3 text-slate-400 hover:text-white p-1"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Autocomplete Dropdown List */}
          {dropdownOpen && candidates.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-[#06111F] border border-cyan-500/30 rounded-xl shadow-2xl overflow-hidden z-50 max-h-64 overflow-y-auto backdrop-blur-2xl">
              <div className="px-3.5 py-2 bg-white/5 border-b border-white/10 text-[11px] font-semibold text-slate-400 flex items-center justify-between">
                <span>Matching Verified Locations ({candidates.length})</span>
                <span className="text-[10px] text-cyan-400 font-mono">Select to load telemetry</span>
              </div>
              <div className="divide-y divide-white/5">
                {candidates.map((cand, idx) => (
                  <button
                    key={`${cand.name}-${cand.latitude}-${idx}`}
                    onClick={() => handleSelectCandidate(cand)}
                    className="w-full text-left px-3.5 py-2.5 hover:bg-cyan-500/15 transition-colors flex items-center justify-between gap-2 group cursor-pointer"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 group-hover:text-cyan-400 flex-shrink-0" />
                      <div className="truncate">
                        <div className="text-xs font-semibold text-white group-hover:text-cyan-300 truncate">
                          {cand.name}
                          {cand.admin1 && cand.admin1 !== cand.name && (
                            <span className="text-slate-400 font-normal">, {cand.admin1}</span>
                          )}
                        </div>
                        <div className="text-[11px] text-slate-400 font-mono truncate">
                          {cand.country} • Lat {cand.latitude.toFixed(2)}°, Lon {cand.longitude.toFixed(2)}°
                        </div>
                      </div>
                    </div>
                    <span className="text-[11px] text-cyan-400 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 font-medium flex-shrink-0">
                      Analyze <Check className="w-3 h-3" />
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {dropdownOpen && candidates.length === 0 && !isSearching && query.length >= 2 && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-[#06111F] border border-white/15 rounded-xl p-4 shadow-2xl z-50 text-center text-xs text-slate-400">
              No matching locations found for "{query}". Try a major city or region name.
            </div>
          )}
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {/* Use My Location Button */}
          <button
            onClick={requestCurrentLocation}
            disabled={isLoading || isRefreshing}
            className="flex items-center gap-2 px-4 py-3 rounded-xl bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-500/40 text-cyan-300 hover:text-cyan-200 text-xs sm:text-sm font-semibold transition-all shadow-sm disabled:opacity-50 cursor-pointer"
            title="Request browser GPS location (on-demand only)"
          >
            <Crosshair className={`w-4 h-4 ${isLoading && locationMode === 'CURRENT_GPS' ? 'animate-spin' : ''}`} />
            <span>📍 Use My Location</span>
          </button>

          {/* Compare Location Modal Trigger */}
          {onOpenCompare && (
            <button
              onClick={onOpenCompare}
              className="flex items-center gap-2 px-3.5 py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white text-xs sm:text-sm font-semibold transition-all cursor-pointer"
              title="Compare side-by-side with another location"
            >
              <SlidersHorizontal className="w-4 h-4 text-slate-400" />
              <span className="hidden sm:inline">Compare</span>
            </button>
          )}
        </div>
      </div>

      {/* Coordinate & Freshness Sub-bar */}
      <div className="mt-3 pt-3 border-t border-white/5 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-400 font-mono">
        <div className="flex items-center gap-2">
          <span>Coordinates: {selectedLocation.latitude.toFixed(4)}°N, {selectedLocation.longitude.toFixed(4)}°E</span>
          {selectedLocation.elevation !== undefined && (
            <>
              <span>•</span>
              <span>Elev: {selectedLocation.elevation}m</span>
            </>
          )}
        </div>
        <div className="flex items-center gap-2">
          <span>Sources: Open-Meteo & Copernicus</span>
          {lastRefreshed && (
            <>
              <span>•</span>
              <span className="text-cyan-400">Refreshed: {lastRefreshed.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
