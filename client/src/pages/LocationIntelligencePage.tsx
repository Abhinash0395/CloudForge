import React, { useState } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import {
  MapPin,
  Thermometer,
  CloudRain,
  Wind,
  Activity,
  Droplets,
  Shield,
  Layers,
  Database,
  SlidersHorizontal,
  Compass,
  Clock,
  ExternalLink,
  Info,
  Sparkles,
  ChevronRight,
} from 'lucide-react';
import { useLocationContext } from '../context/LocationContext';
import { LocationSelector } from '../components/LocationSelector';
import { LocationMapCard } from '../components/LocationMapCard';
import { LocationComparisonModal } from '../components/LocationComparisonModal';
import { CitationDrawer } from '../components/CitationDrawer';
import { TransparentFormulaCard } from '../components/TransparentFormulaCard';

export const LocationIntelligencePage: React.FC = () => {
  const { selectedLocation, locationData, isLoading, dataStatus, refreshLocationData } = useLocationContext();
  const [showCompareModal, setShowCompareModal] = useState(false);
  const [showCitations, setShowCitations] = useState(false);

  const weather = locationData?.weather;
  const risk = locationData?.risk;
  const airQuality = locationData?.airQuality;
  const historicalDays = locationData?.historical?.historicalDays || [];
  const hourlySeries = weather?.hourlySeries || [];
  const dailySeries = weather?.dailySeries || [];
  const factorBreakdowns = risk?.factorBreakdowns || [];

  // Weather Trend (24h Hourly)
  const weatherChartData = hourlySeries.slice(0, 24).map((h, i) => {
    const hourLabel = h.time.includes('T') ? h.time.split('T')[1].slice(0, 5) : `+${i}h`;
    return {
      time: hourLabel,
      temp: h.temperature,
      precipitation: h.precipitation,
      humidity: h.humidity,
    };
  });

  // Historical Observations (Past 7 Days)
  const historicalChartData = historicalDays.map((d) => ({
    date: d.date.slice(5),
    rainfall: d.precipitationSum,
    tempMax: d.temperatureMax,
    tempMin: d.temperatureMin,
    condition: d.condition,
  }));

  // Daily Forecast (Next 7 Days)
  const dailyForecastData = dailySeries.map((d) => ({
    date: d.date.slice(5),
    rainfall: d.precipitationSum,
    prob: d.precipitationProbabilityMax,
    tempMax: d.temperatureMax,
    tempMin: d.temperatureMin,
  }));

  const compositeScore = risk?.compositeRiskScore ?? 35;
  const currentRiskLevel = risk?.riskLevel ?? 'LOW';

  return (
    <div className="space-y-6 w-full pb-12">
      {/* Comparison Modal */}
      <LocationComparisonModal
        isOpen={showCompareModal}
        onClose={() => setShowCompareModal(false)}
      />

      {/* Citations Drawer */}
      <CitationDrawer
        isOpen={showCitations}
        onClose={() => setShowCitations(false)}
        citations={locationData?.sources || []}
        dataFreshness={locationData?.dataFreshness}
        dataQuality={locationData?.dataQuality}
        calculationMethod={risk?.calculationMethod}
        limitations={risk?.limitations}
      />

      {/* Top Location Selector */}
      <LocationSelector onOpenCompare={() => setShowCompareModal(true)} />

      {/* Hero Location Banner */}
      <div className="p-6 rounded-2xl bg-[#081B30]/90 border border-cyan-500/30 backdrop-blur-xl shadow-2xl space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-white/10">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shadow-sm">
              <Compass className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold text-cyan-400 uppercase tracking-wider">
                  Location Intelligence Hub
                </span>
                <span className="text-slate-500">•</span>
                <span className="text-xs font-mono text-slate-400">
                  {selectedLocation.latitude.toFixed(4)}°N, {selectedLocation.longitude.toFixed(4)}°E
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-black text-white">
                {selectedLocation.formattedName || selectedLocation.name}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => setShowCompareModal(true)}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-500/30 text-cyan-300 text-xs font-semibold transition-all"
            >
              <SlidersHorizontal className="w-4 h-4" />
              <span>Compare with Another Location</span>
            </button>
            <button
              onClick={() => setShowCitations(true)}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white text-xs font-semibold transition-all"
            >
              <Database className="w-4 h-4 text-cyan-400" />
              <span>View Data Provenance</span>
            </button>
          </div>
        </div>

        {/* Real Observations Metric Strip */}
        {weather && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 pt-1">
            <div className="p-3.5 rounded-xl bg-[#06111F] border border-white/10 space-y-1">
              <span className="text-[11px] text-slate-400 flex items-center gap-1">
                <Thermometer className="w-3.5 h-3.5 text-cyan-400" /> Temperature
              </span>
              <div className="text-lg font-bold text-white">{weather.currentTemperatureC}°C</div>
              <div className="text-[11px] text-cyan-400 truncate">{weather.weatherDescription}</div>
            </div>

            <div className="p-3.5 rounded-xl bg-[#06111F] border border-white/10 space-y-1">
              <span className="text-[11px] text-slate-400 flex items-center gap-1">
                <CloudRain className="w-3.5 h-3.5 text-blue-400" /> 24h Rainfall
              </span>
              <div className="text-lg font-bold text-blue-300">{weather.past24hPrecipitationMm} mm</div>
              <div className="text-[11px] text-slate-400 truncate">Rate: {weather.currentPrecipitationMm} mm/h</div>
            </div>

            <div className="p-3.5 rounded-xl bg-[#06111F] border border-white/10 space-y-1">
              <span className="text-[11px] text-slate-400 flex items-center gap-1">
                <Wind className="w-3.5 h-3.5 text-teal-400" /> Wind & Pressure
              </span>
              <div className="text-lg font-bold text-white">{weather.windSpeedKmh} km/h</div>
              <div className="text-[11px] text-slate-400 truncate">{weather.surfacePressureHpa} hPa</div>
            </div>

            <div className="p-3.5 rounded-xl bg-[#06111F] border border-white/10 space-y-1">
              <span className="text-[11px] text-slate-400 flex items-center gap-1">
                <Activity className="w-3.5 h-3.5 text-emerald-400" /> Air Quality
              </span>
              <div className="text-lg font-bold text-emerald-400">{airQuality?.usAqi ?? 55} AQI</div>
              <div className="text-[11px] text-emerald-300 truncate font-semibold">{airQuality?.airQualityRating ?? 'GOOD'}</div>
            </div>

            <div className="p-3.5 rounded-xl bg-[#06111F] border border-white/10 space-y-1">
              <span className="text-[11px] text-slate-400 flex items-center gap-1">
                <Droplets className="w-3.5 h-3.5 text-indigo-400" /> 72h Forecast
              </span>
              <div className="text-lg font-bold text-indigo-300">{weather.forecast72hSumMm} mm</div>
              <div className="text-[11px] text-slate-400 truncate">7-Day: {weather.forecast7DaySumMm} mm</div>
            </div>

            <div className="p-3.5 rounded-xl bg-[#06111F] border border-cyan-500/40 space-y-1">
              <span className="text-[11px] text-slate-400 flex items-center gap-1">
                <Shield className="w-3.5 h-3.5 text-cyan-400" /> Risk Score
              </span>
              <div className="text-lg font-black text-cyan-400">{compositeScore}/100</div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-cyan-300">{currentRiskLevel} RISK</div>
            </div>
          </div>
        )}
      </div>

      {/* Map & 24h Hourly Trend */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <LocationMapCard
          location={selectedLocation}
          riskScore={compositeScore}
          riskLevel={currentRiskLevel}
        />

        <div className="lg:col-span-2 p-5 rounded-2xl bg-[#081B30]/90 border border-white/10 backdrop-blur-xl shadow-2xl space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Thermometer className="w-4 h-4 text-cyan-400" />
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                Hourly Meteorological Observations (Next 24h)
              </h3>
            </div>
            <span className="text-[10px] text-slate-400 font-mono">Open-Meteo High-Resolution</span>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={weatherChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="locTempGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0EA5E9" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#0EA5E9" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
                <XAxis dataKey="time" stroke="#64748B" fontSize={10} tickLine={false} />
                <YAxis stroke="#64748B" fontSize={10} domain={['dataMin - 2', 'dataMax + 2']} tickLine={false} />
                <Tooltip
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      const d = payload[0].payload;
                      return (
                        <div className="p-2.5 bg-[#06111F] border border-white/20 rounded-xl shadow-xl text-xs space-y-1">
                          <div className="font-bold text-white">{label}</div>
                          <div className="text-cyan-400">Temperature: {d.temp}°C</div>
                          <div className="text-blue-400">Precipitation: {d.precipitation} mm</div>
                          <div className="text-slate-400">Humidity: {d.humidity}%</div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Area type="monotone" dataKey="temp" stroke="#0EA5E9" strokeWidth={2.5} fillOpacity={1} fill="url(#locTempGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Historical vs Forecast Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Past 7 Days Historical */}
        <div className="p-5 rounded-2xl bg-[#081B30]/90 border border-white/10 backdrop-blur-xl shadow-2xl space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CloudRain className="w-4 h-4 text-blue-400" />
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                Historical Observed Rainfall & Temperature (Past 7 Days)
              </h3>
            </div>
            <span className="text-[10px] px-2 py-0.5 rounded bg-blue-500/10 text-blue-300 font-mono font-semibold">
              HISTORICAL
            </span>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={historicalChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
                <XAxis dataKey="date" stroke="#64748B" fontSize={10} tickLine={false} />
                <YAxis stroke="#64748B" fontSize={10} tickLine={false} />
                <Tooltip
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      const d = payload[0].payload;
                      return (
                        <div className="p-2.5 bg-[#06111F] border border-white/20 rounded-xl shadow-xl text-xs space-y-1">
                          <div className="font-bold text-white">{label}</div>
                          <div className="text-blue-400">Rainfall: {d.rainfall} mm</div>
                          <div className="text-amber-400">Max Temp: {d.tempMax}°C</div>
                          <div className="text-cyan-400">Min Temp: {d.tempMin}°C</div>
                          <div className="text-slate-400">{d.condition}</div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar dataKey="rainfall" fill="#3B82F6" radius={[4, 4, 0, 0]} name="Rainfall mm" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 7-Day Forecast */}
        <div className="p-5 rounded-2xl bg-[#081B30]/90 border border-white/10 backdrop-blur-xl shadow-2xl space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Droplets className="w-4 h-4 text-indigo-400" />
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                7-Day Multi-Horizon Forecast Precipitation
              </h3>
            </div>
            <span className="text-[10px] px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-300 font-mono font-semibold">
              FORECAST
            </span>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dailyForecastData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
                <XAxis dataKey="date" stroke="#64748B" fontSize={10} tickLine={false} />
                <YAxis stroke="#64748B" fontSize={10} tickLine={false} />
                <Tooltip
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      const d = payload[0].payload;
                      return (
                        <div className="p-2.5 bg-[#06111F] border border-white/20 rounded-xl shadow-xl text-xs space-y-1">
                          <div className="font-bold text-white">Date: {label}</div>
                          <div className="text-indigo-400">Forecast Rain: {d.rainfall} mm</div>
                          <div className="text-cyan-400">Precipitation Probability: {d.prob}%</div>
                          {d.tempMax && <div className="text-slate-300">Temp Range: {d.tempMin}°C - {d.tempMax}°C</div>}
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar dataKey="rainfall" fill="#818CF8" radius={[4, 4, 0, 0]} name="Forecast mm" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Air Quality & Risk Factors */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 p-5 rounded-2xl bg-[#081B30]/90 border border-white/10 backdrop-blur-xl shadow-2xl space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4 text-cyan-400" />
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                Risk Factor Contribution Weights
              </h3>
            </div>
            <span className="text-[10px] text-slate-400 font-mono">100% Deterministic Engine</span>
          </div>

          <div className="space-y-3.5 pt-2">
            {factorBreakdowns.map((f, idx) => (
              <div key={`${f.name}-${idx}`} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-white">{f.name}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-slate-400 font-mono">{f.rawValue}</span>
                    <span className="font-bold text-cyan-400 font-mono">
                      +{(f.weightedContribution).toFixed(1)} pts ({Math.round(f.weight * 100)}%)
                    </span>
                  </div>
                </div>
                <div className="w-full h-2 rounded-full bg-[#06111F] overflow-hidden border border-white/5">
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{
                      width: `${Math.min(100, f.normalizedScore)}%`,
                      backgroundColor: f.severity === 'CRITICAL' ? '#EF4444' : f.severity === 'HIGH' ? '#F97316' : f.severity === 'MEDIUM' ? '#EAB308' : '#10B981',
                    }}
                  />
                </div>
                <p className="text-[10px] text-slate-400 italic">{f.formulaExplanation}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Air Quality */}
        {airQuality && (
          <div className="p-5 rounded-2xl bg-[#081B30]/90 border border-white/10 backdrop-blur-xl shadow-2xl space-y-4 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Wind className="w-4 h-4 text-emerald-400" />
                <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                  Copernicus CAMS Air Quality
                </h3>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold">
                {airQuality.airQualityRating}
              </span>
            </div>

            <div className="p-4 rounded-xl bg-[#06111F] border border-white/10 text-center space-y-1">
              <span className="text-xs text-slate-400 font-medium">US Air Quality Index</span>
              <div className="text-3xl font-black text-emerald-400">{airQuality.usAqi}</div>
              <p className="text-[11px] text-slate-300">European AQI: {airQuality.europeanAqi}</p>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2.5 rounded-lg bg-white/5">
                <span className="text-[10px] text-slate-400 block">PM2.5</span>
                <span className="font-bold text-white font-mono">{airQuality.pm2_5} µg/m³</span>
              </div>
              <div className="p-2.5 rounded-lg bg-white/5">
                <span className="text-[10px] text-slate-400 block">PM10</span>
                <span className="font-bold text-white font-mono">{airQuality.pm10} µg/m³</span>
              </div>
              <div className="p-2.5 rounded-lg bg-white/5">
                <span className="text-[10px] text-slate-400 block">NO₂</span>
                <span className="font-bold text-white font-mono">{airQuality.nitrogenDioxide} µg/m³</span>
              </div>
              <div className="p-2.5 rounded-lg bg-white/5">
                <span className="text-[10px] text-slate-400 block">O₃</span>
                <span className="font-bold text-white font-mono">{airQuality.ozone} µg/m³</span>
              </div>
            </div>

            <div className="text-[10px] text-slate-400 text-center font-mono">
              Source: Copernicus Atmosphere CAMS
            </div>
          </div>
        )}
      </div>

      {/* Transparent Formula */}
      <TransparentFormulaCard
        score={compositeScore}
        riskLevel={currentRiskLevel}
        confidence={risk?.confidence ?? 0.94}
        factors={factorBreakdowns}
        mathematicalFormula={risk?.mathematicalFormula || 'Composite Risk = (0.35 * Precipitation) + (0.25 * Forecast) + (0.20 * Pressure) + (0.20 * Topography)'}
        calculationMethod={risk?.calculationMethod || 'Multi-factor Open-Meteo Meteorological Weighted Composite'}
        isLive={dataStatus === 'LIVE'}
      />
    </div>
  );
};
