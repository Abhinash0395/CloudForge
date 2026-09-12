import React, { useState } from 'react';
import {
  X,
  SlidersHorizontal,
  Search,
  ArrowRight,
  TrendingUp,
  TrendingDown,
  Minus,
  CloudRain,
  Thermometer,
  Wind,
  ShieldAlert,
  MapPin,
  RefreshCw,
  CheckCircle2,
} from 'lucide-react';
import { useLocationContext } from '../context/LocationContext';
import { GeocodedLocation, LocationComparisonData } from '../types';

interface LocationComparisonModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LocationComparisonModal: React.FC<LocationComparisonModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { selectedLocation, compareWithLocation, searchLocations } = useLocationContext();

  const [searchQuery, setSearchQuery] = useState('');
  const [candidates, setCandidates] = useState<GeocodedLocation[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [targetLocation, setTargetLocation] = useState<GeocodedLocation | null>(null);
  const [comparisonResult, setComparisonResult] = useState<LocationComparisonData | null>(null);
  const [isComparing, setIsComparing] = useState(false);

  if (!isOpen) return null;

  const handleSearch = async (val: string) => {
    setSearchQuery(val);
    if (val.trim().length < 2) {
      setCandidates([]);
      return;
    }
    setIsSearching(true);
    const res = await searchLocations(val.trim());
    setCandidates(res);
    setIsSearching(false);
  };

  const handleSelectTarget = async (cand: GeocodedLocation) => {
    setTargetLocation(cand);
    setCandidates([]);
    setSearchQuery(cand.formattedName || cand.name);
    setIsComparing(true);
    const result = await compareWithLocation(cand);
    setComparisonResult(result);
    setIsComparing(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl bg-[#081B30] border border-white/15 rounded-2xl shadow-2xl p-6 overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <SlidersHorizontal className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Compare Locations</h2>
              <p className="text-xs text-slate-400">
                Side-by-side comparative analysis of verified telemetry and risk scores
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-white/5 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto py-5 space-y-6">
          {/* Target Location Search Input */}
          <div className="relative">
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Select Location to Compare with <span className="text-cyan-400 font-bold">{selectedLocation.name}</span>
            </label>
            <div className="relative flex items-center">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                placeholder="Search comparison target (e.g. New Delhi, Mumbai, London, Patna)..."
                className="w-full bg-[#06111F] border border-white/10 focus:border-cyan-500/50 text-sm text-white placeholder-slate-500 pl-10 pr-10 py-2.5 rounded-xl outline-none"
              />
              {isSearching && (
                <RefreshCw className="w-4 h-4 text-cyan-400 animate-spin absolute right-3.5" />
              )}
            </div>

            {/* Candidates */}
            {candidates.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-[#06111F] border border-white/15 rounded-xl shadow-2xl z-50 max-h-48 overflow-y-auto divide-y divide-white/5">
                {candidates.map((c, i) => (
                  <button
                    key={`${c.name}-${i}`}
                    onClick={() => handleSelectTarget(c)}
                    className="w-full text-left px-3.5 py-2.5 hover:bg-cyan-500/10 text-xs text-white flex items-center justify-between"
                  >
                    <div>
                      <span className="font-semibold">{c.name}</span>
                      {c.admin1 && <span className="text-slate-400">, {c.admin1}</span>}
                      <span className="text-slate-500"> ({c.country})</span>
                    </div>
                    <span className="text-[11px] text-cyan-400 font-medium">Compare →</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {isComparing && (
            <div className="py-12 flex flex-col items-center justify-center gap-3">
              <RefreshCw className="w-8 h-8 text-cyan-400 animate-spin" />
              <p className="text-xs text-slate-300">
                Retrieving verified Open-Meteo & Copernicus telemetry for comparison...
              </p>
            </div>
          )}

          {comparisonResult && !isComparing && (
            <div className="space-y-6">
              {/* Executive Summary Card */}
              <div className="p-4 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-xs text-slate-200 leading-relaxed">
                <span className="font-bold text-cyan-300 block mb-1">Comparative Finding:</span>
                {comparisonResult.comparison.summary}
              </div>

              {/* Side-by-Side Metric Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Location A */}
                <div className="p-4 rounded-xl bg-[#06111F] border border-white/10 space-y-4">
                  <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
                    <div>
                      <span className="text-[10px] text-cyan-400 font-bold uppercase tracking-wider">
                        Location A (Active)
                      </span>
                      <h4 className="text-base font-bold text-white">
                        {comparisonResult.locationA.location.name}
                      </h4>
                      <p className="text-[11px] text-slate-400">
                        {comparisonResult.locationA.location.formattedName}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="text-xs text-slate-400">Risk Score</span>
                      <div className="text-xl font-black text-cyan-400">
                        {comparisonResult.locationA.risk.compositeRiskScore}/100
                      </div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300">
                        {comparisonResult.locationA.risk.riskLevel}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="p-2.5 rounded-lg bg-white/5">
                      <span className="text-[10px] text-slate-400 flex items-center gap-1">
                        <Thermometer className="w-3 h-3 text-cyan-400" /> Temperature
                      </span>
                      <span className="text-sm font-bold text-white mt-1 block">
                        {comparisonResult.locationA.weather.currentTemperatureC}°C
                      </span>
                    </div>
                    <div className="p-2.5 rounded-lg bg-white/5">
                      <span className="text-[10px] text-slate-400 flex items-center gap-1">
                        <CloudRain className="w-3 h-3 text-blue-400" /> 24h Rainfall
                      </span>
                      <span className="text-sm font-bold text-white mt-1 block">
                        {comparisonResult.locationA.weather.past24hPrecipitationMm} mm
                      </span>
                    </div>
                    <div className="p-2.5 rounded-lg bg-white/5">
                      <span className="text-[10px] text-slate-400 flex items-center gap-1">
                        <Wind className="w-3 h-3 text-emerald-400" /> AQI
                      </span>
                      <span className="text-sm font-bold text-white mt-1 block">
                        {comparisonResult.locationA.airQuality.usAqi} ({comparisonResult.locationA.airQuality.airQualityRating})
                      </span>
                    </div>
                    <div className="p-2.5 rounded-lg bg-white/5">
                      <span className="text-[10px] text-slate-400 flex items-center gap-1">
                        <CloudRain className="w-3 h-3 text-indigo-400" /> 72h Forecast
                      </span>
                      <span className="text-sm font-bold text-white mt-1 block">
                        {comparisonResult.locationA.weather.forecast72hSumMm} mm
                      </span>
                    </div>
                  </div>
                </div>

                {/* Location B */}
                <div className="p-4 rounded-xl bg-[#06111F] border border-white/10 space-y-4">
                  <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
                    <div>
                      <span className="text-[10px] text-purple-400 font-bold uppercase tracking-wider">
                        Location B (Target)
                      </span>
                      <h4 className="text-base font-bold text-white">
                        {comparisonResult.locationB.location.name}
                      </h4>
                      <p className="text-[11px] text-slate-400">
                        {comparisonResult.locationB.location.formattedName}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="text-xs text-slate-400">Risk Score</span>
                      <div className="text-xl font-black text-purple-400">
                        {comparisonResult.locationB.risk.compositeRiskScore}/100
                      </div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-purple-500/20 text-purple-300">
                        {comparisonResult.locationB.risk.riskLevel}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="p-2.5 rounded-lg bg-white/5">
                      <span className="text-[10px] text-slate-400 flex items-center gap-1">
                        <Thermometer className="w-3 h-3 text-purple-400" /> Temperature
                      </span>
                      <span className="text-sm font-bold text-white mt-1 block">
                        {comparisonResult.locationB.weather.currentTemperatureC}°C
                        <span className="text-[11px] ml-1.5 font-normal text-slate-400">
                          ({comparisonResult.comparison.tempDelta >= 0 ? `+${comparisonResult.comparison.tempDelta}` : comparisonResult.comparison.tempDelta}°C)
                        </span>
                      </span>
                    </div>
                    <div className="p-2.5 rounded-lg bg-white/5">
                      <span className="text-[10px] text-slate-400 flex items-center gap-1">
                        <CloudRain className="w-3 h-3 text-blue-400" /> 24h Rainfall
                      </span>
                      <span className="text-sm font-bold text-white mt-1 block">
                        {comparisonResult.locationB.weather.past24hPrecipitationMm} mm
                        <span className="text-[11px] ml-1.5 font-normal text-slate-400">
                          ({comparisonResult.comparison.rainfallDelta >= 0 ? `+${comparisonResult.comparison.rainfallDelta}` : comparisonResult.comparison.rainfallDelta}mm)
                        </span>
                      </span>
                    </div>
                    <div className="p-2.5 rounded-lg bg-white/5">
                      <span className="text-[10px] text-slate-400 flex items-center gap-1">
                        <Wind className="w-3 h-3 text-emerald-400" /> AQI
                      </span>
                      <span className="text-sm font-bold text-white mt-1 block">
                        {comparisonResult.locationB.airQuality.usAqi}
                        <span className="text-[11px] ml-1.5 font-normal text-slate-400">
                          ({comparisonResult.comparison.aqiDelta >= 0 ? `+${comparisonResult.comparison.aqiDelta}` : comparisonResult.comparison.aqiDelta})
                        </span>
                      </span>
                    </div>
                    <div className="p-2.5 rounded-lg bg-white/5">
                      <span className="text-[10px] text-slate-400 flex items-center gap-1">
                        <CloudRain className="w-3 h-3 text-indigo-400" /> 72h Forecast
                      </span>
                      <span className="text-sm font-bold text-white mt-1 block">
                        {comparisonResult.locationB.weather.forecast72hSumMm} mm
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-white/10 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-xs font-semibold text-white transition-all"
          >
            Close Comparison
          </button>
        </div>
      </div>
    </div>
  );
};
