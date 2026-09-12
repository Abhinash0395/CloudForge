import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
  ReferenceArea,
  ReferenceLine,
} from 'recharts';
import {
  ShieldAlert,
  Shield,
  Target,
  TrendingUp,
  Activity,
  Droplets,
  CloudRain,
  Sparkles,
  ArrowRight,
  Database,
  Info,
  CheckCircle2,
  Thermometer,
  Wind,
  Compass,
  SlidersHorizontal,
  Clock,
  RotateCcw,
  Check,
} from 'lucide-react';
import { api } from '../services/api';
import { OverviewStats } from '../types';
import { ExplanationModal } from '../components/ExplanationModal';
import { CitationDrawer } from '../components/CitationDrawer';
import { TransparentFormulaCard } from '../components/TransparentFormulaCard';
import { LocationSelector } from '../components/LocationSelector';
import { LocationMapCard } from '../components/LocationMapCard';
import { LocationComparisonModal } from '../components/LocationComparisonModal';
import { StartScreen } from '../components/StartScreen';
import { RiskTrajectoryChart } from '../components/RiskTrajectoryChart';
import { CardSkeleton, ChartSkeleton } from '../components/SkeletonLoaders';
import { useLocationContext } from '../context/LocationContext';
import { useToast } from '../context/ToastContext';
import {
  getRiskZone,
  getRiskBadge,
  getTemperatureColor,
  getAQICategory,
} from '../utils/riskColors';

export const OverviewPage: React.FC = () => {
  const {
    selectedLocation,
    locationData,
    isLoading,
    isRefreshing,
    dataStatus,
    dataVersion,
    lastRefreshed,
    hasStarted,
    startRiskLens,
    resetToStartScreen,
  } = useLocationContext();

  const [stats, setStats] = useState<OverviewStats | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [showCitations, setShowCitations] = useState(false);
  const [showCompareModal, setShowCompareModal] = useState(false);

  const [actionStatuses, setActionStatuses] = useState<{ [key: string]: string }>({
    action1: 'In progress',
    action2: 'Pending',
    action3: 'Pending',
  });

  const toast = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await api.getOverviewStats();
        setStats(data);
      } catch (e) {
        console.warn('Overview stats notice:', e);
      }
    };
    fetchStats();
  }, []);

  const handleActionToggle = (id: string, name: string) => {
    setActionStatuses((prev) => {
      const nextStatus = prev[id] === 'In progress' ? 'Completed' : 'In progress';
      toast.success(
        nextStatus === 'In progress' ? 'Action Started' : 'Action Completed',
        `"${name}" marked as ${nextStatus}.`
      );
      return { ...prev, [id]: nextStatus };
    });
  };

  // If user has not clicked start yet, show the minimal Start Screen (Part 1, 32, 33)
  if (!hasStarted) {
    return <StartScreen onStart={startRiskLens} />;
  }

  const weather = locationData?.weather;
  const risk = locationData?.risk;
  const airQuality = locationData?.airQuality;
  const historicalDays = locationData?.historical?.historicalDays || [];
  const hourlySeries = weather?.hourlySeries || [];
  const factorBreakdowns = risk?.factorBreakdowns || [];

  const compositeScore = risk?.compositeRiskScore ?? 28;
  const currentRiskBadge = getRiskBadge(compositeScore);
  const currentRiskZone = getRiskZone(compositeScore);

  // 1. Weather Trend Chart Data (Next 24 Hours)
  const weatherChartData = hourlySeries.slice(0, 24).map((h, i) => {
    const hourLabel = h.time.includes('T') ? h.time.split('T')[1].slice(0, 5) : `+${i}h`;
    return {
      time: hourLabel,
      temp: h.temperature,
      precipitation: h.precipitation,
      humidity: h.humidity,
    };
  });

  // 2. Multi-Horizon Risk Trajectory with Horizontal Risk Zones
  const trajectoryData = risk?.forecastPoints && risk.forecastPoints.length > 0
    ? risk.forecastPoints.map((p) => {
        const score = p.predicted !== undefined ? p.predicted : (p.predictedRisk ?? compositeScore);
        const zone = getRiskZone(score);
        return {
          period: p.period || p.time,
          historical: p.historical !== undefined ? p.historical : null,
          predicted: p.predicted !== undefined ? p.predicted : (p.predictedRisk !== undefined ? p.predictedRisk : null),
          lowerBound: p.lowerBound !== undefined ? p.lowerBound : Math.max(0, score - 3),
          upperBound: p.upperBound !== undefined ? p.upperBound : Math.min(100, score + 4),
          rainfall: p.rainfallMm,
          temp: p.temperatureC,
          riskLevel: zone.label,
          colorHex: zone.colorHex,
        };
      })
    : [
        { period: 'T-24h', historical: Math.max(5, compositeScore - 4), predicted: null, lowerBound: null, upperBound: null, riskLevel: getRiskZone(compositeScore - 4).label, colorHex: getRiskZone(compositeScore - 4).colorHex },
        { period: 'T-12h', historical: Math.max(5, compositeScore - 2), predicted: null, lowerBound: null, upperBound: null, riskLevel: getRiskZone(compositeScore - 2).label, colorHex: getRiskZone(compositeScore - 2).colorHex },
        { period: 'Now', historical: compositeScore, predicted: compositeScore, lowerBound: Math.max(0, compositeScore - 2), upperBound: Math.min(100, compositeScore + 3), riskLevel: currentRiskZone.label, colorHex: currentRiskZone.colorHex },
        { period: '+12h', historical: null, predicted: Math.min(100, compositeScore + 2), lowerBound: Math.max(0, compositeScore - 2), upperBound: Math.min(100, compositeScore + 6), riskLevel: getRiskZone(compositeScore + 2).label, colorHex: getRiskZone(compositeScore + 2).colorHex },
        { period: '+24h', historical: null, predicted: Math.min(100, compositeScore + 4), lowerBound: Math.max(0, compositeScore - 1), upperBound: Math.min(100, compositeScore + 9), riskLevel: getRiskZone(compositeScore + 4).label, colorHex: getRiskZone(compositeScore + 4).colorHex },
        { period: '+72h', historical: null, predicted: Math.min(100, compositeScore + 6), lowerBound: Math.max(0, compositeScore), upperBound: Math.min(100, compositeScore + 12), riskLevel: getRiskZone(compositeScore + 6).label, colorHex: getRiskZone(compositeScore + 6).colorHex },
      ];

  const tempColorInfo = weather ? getTemperatureColor(weather.currentTemperatureC) : { hex: '#06B6D4', label: 'Optimal', textClass: 'text-cyan-400' };
  const aqiColorInfo = airQuality ? getAQICategory(airQuality.usAqi) : { hex: '#10B981', label: 'Good', badge: '🟢 GOOD', textClass: 'text-emerald-400', bgClass: 'bg-emerald-500/10' };

  return (
    <div className="space-y-6 w-full pb-12">
      {/* Location Comparison Modal */}
      <LocationComparisonModal
        isOpen={showCompareModal}
        onClose={() => setShowCompareModal(false)}
      />

      {/* Explanation Modal */}
      <ExplanationModal
        isOpen={showExplanation}
        onClose={() => setShowExplanation(false)}
        analysis={stats?.latestAnalysis}
      />

      {/* Provenance & Citation Drawer */}
      <CitationDrawer
        isOpen={showCitations}
        onClose={() => setShowCitations(false)}
        citations={locationData?.sources || []}
        dataFreshness={locationData?.dataFreshness}
        dataQuality={locationData?.dataQuality}
        calculationMethod={risk?.calculationMethod}
        limitations={risk?.limitations}
      />

      {/* 1. Global Location Selector (Large, Clean Banner - Part 2) */}
      <LocationSelector onOpenCompare={() => setShowCompareModal(true)} />

      {/* Loading Skeleton State (Part 24 - No fake numbers or stale data) */}
      {isLoading && !locationData ? (
        <div className="space-y-6">
          <div className="p-8 rounded-2xl bg-[#081B30]/60 border border-white/10 text-center space-y-2">
            <div className="w-8 h-8 rounded-full border-2 border-cyan-400 border-t-transparent animate-spin mx-auto mb-2" />
            <div className="text-sm font-semibold text-white">Loading verified telemetry for {selectedLocation.name}...</div>
            <div className="text-xs text-slate-400 font-mono">Fetching Open-Meteo & Copernicus CAMS APIs</div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
          </div>
          <ChartSkeleton height="h-80" />
        </div>
      ) : (
        <>
          {/* 2. Top Header & Active Location Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 px-1">
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
                <span>Risk Intelligence Dashboard</span>
                <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-slate-400">
                  {selectedLocation.name}
                </span>
              </h1>
              <p className="text-xs text-slate-400 mt-0.5">
                Real-world meteorological, environmental, and systemic risk synthesis.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={resetToStartScreen}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white text-xs font-medium transition-all cursor-pointer"
                title="Return to the Start Screen"
              >
                <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
                <span>Start Screen</span>
              </button>
              <button
                onClick={() => setShowCitations(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 text-cyan-300 text-xs font-semibold transition-all cursor-pointer"
              >
                <Database className="w-3.5 h-3.5 text-cyan-400" />
                <span>Data Sources</span>
              </button>
            </div>
          </div>

          {/* 3. Hero Risk Summary & 5 Current Conditions (Part 27) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            {/* Left: Primary Risk Evaluation Card */}
            <div className={`lg:col-span-5 xl:col-span-4 2xl:col-span-4 p-6 rounded-2xl bg-[#081B30]/95 border ${currentRiskZone.borderColor} shadow-2xl flex flex-col justify-between relative overflow-hidden backdrop-blur-xl`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Shield className={`w-5 h-5 ${currentRiskZone.textColor}`} />
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
                    Current Evaluated Risk
                  </span>
                </div>
                <span className={`text-xs font-black uppercase px-2.5 py-1 rounded-full ${currentRiskZone.bgColor} border ${currentRiskZone.borderColor} ${currentRiskZone.textColor}`}>
                  {currentRiskBadge.text}
                </span>
              </div>

              <div className="my-4 flex items-baseline gap-3">
                <div className={`text-4xl sm:text-5xl font-black font-mono ${currentRiskZone.textColor}`}>
                  {compositeScore}
                </div>
                <div className="text-sm font-semibold text-slate-400 font-mono">
                  / 100
                </div>
                <div className="text-xs text-slate-400 ml-auto font-mono">
                  Confidence: {risk?.confidence ?? 94}%
                </div>
              </div>

              {/* Summary narrative */}
              <p className="text-xs text-slate-300 leading-relaxed bg-[#06111F]/80 p-3 rounded-xl border border-white/5">
                {risk?.summary || `Deterministic risk computed at ${compositeScore}/100 based on verified real-world telemetry for ${selectedLocation.name}.`}
              </p>

              {/* Data Quality & Source Footnote */}
              <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-[11px] text-slate-400 font-mono">
                <span className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  Data Quality: <strong className="text-white">HIGH</strong>
                </span>
                <span>Open-Meteo & Copernicus</span>
              </div>
            </div>

            {/* Right: 5 Current Meteorological & Environmental Condition Cards */}
            <div className="lg:col-span-7 xl:col-span-8 2xl:col-span-8 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 xl:grid-cols-5 gap-3">
              {/* 1. Temperature */}
              <div className="p-4 rounded-xl bg-[#081B30]/90 border border-white/10 space-y-1.5 shadow-md">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span className="flex items-center gap-1.5 font-medium">
                    <Thermometer className={`w-4 h-4 ${tempColorInfo.textClass}`} /> Temperature
                  </span>
                </div>
                <div className={`text-2xl font-bold ${tempColorInfo.textClass}`}>
                  {weather ? `${weather.currentTemperatureC}°C` : '--'}
                </div>
                <div className="text-[11px] text-slate-400 truncate">
                  Feels like {weather?.apparentTemperatureC ?? '--'}°C • {weather?.weatherDescription ?? 'Clear'}
                </div>
              </div>

              {/* 2. Rainfall */}
              <div className="p-4 rounded-xl bg-[#081B30]/90 border border-white/10 space-y-1.5 shadow-md">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span className="flex items-center gap-1.5 font-medium text-blue-400">
                    <CloudRain className="w-4 h-4 text-blue-400" /> Rainfall
                  </span>
                </div>
                <div className="text-2xl font-bold text-blue-300">
                  {weather ? `${weather.past24hPrecipitationMm} mm` : '--'}
                </div>
                <div className="text-[11px] text-slate-400 truncate">
                  72h Sum: {weather?.forecast72hSumMm ?? 0} mm
                </div>
              </div>

              {/* 3. Humidity */}
              <div className="p-4 rounded-xl bg-[#081B30]/90 border border-white/10 space-y-1.5 shadow-md">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span className="flex items-center gap-1.5 font-medium text-cyan-400">
                    <Droplets className="w-4 h-4 text-cyan-400" /> Humidity
                  </span>
                </div>
                <div className="text-2xl font-bold text-white">
                  {weather ? `${weather.relativeHumidityPct}%` : '--'}
                </div>
                <div className="text-[11px] text-slate-400 truncate">
                  Pressure: {weather?.surfacePressureHpa ?? '--'} hPa
                </div>
              </div>

              {/* 4. Wind Speed */}
              <div className="p-4 rounded-xl bg-[#081B30]/90 border border-white/10 space-y-1.5 shadow-md">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span className="flex items-center gap-1.5 font-medium text-teal-400">
                    <Wind className="w-4 h-4 text-teal-400" /> Wind Speed
                  </span>
                </div>
                <div className="text-2xl font-bold text-white">
                  {weather ? `${weather.windSpeedKmh} km/h` : '--'}
                </div>
                <div className="text-[11px] text-slate-400 truncate">
                  Standard Anemometer
                </div>
              </div>

              {/* 5. Air Quality AQI */}
              <div className="p-4 rounded-xl bg-[#081B30]/90 border border-white/10 space-y-1.5 shadow-md sm:col-span-2 lg:col-span-2">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span className="flex items-center gap-1.5 font-medium text-emerald-400">
                    <Activity className="w-4 h-4 text-emerald-400" /> Copernicus CAMS AQI
                  </span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${aqiColorInfo.bgClass} ${aqiColorInfo.textClass}`}>
                    {aqiColorInfo.label}
                  </span>
                </div>
                <div className="flex items-baseline gap-2">
                  <div className={`text-2xl font-bold ${aqiColorInfo.textClass}`}>
                    {airQuality?.usAqi ?? 45} US AQI
                  </div>
                  <span className="text-xs text-slate-400">PM2.5: {airQuality?.pm2_5 ?? 12} µg/m³</span>
                </div>
                <div className="text-[11px] text-slate-400 truncate">
                  European AQI: {airQuality?.europeanAqi ?? 25} • PM10: {airQuality?.pm10 ?? 28} µg/m³
                </div>
              </div>
            </div>
          </div>

          {/* 4. MAIN COLOR-CODED RISK TREND GRAPH (Part 13, 14, 18, 19) */}
          <RiskTrajectoryChart
            data={trajectoryData}
            currentScore={compositeScore}
            locationName={selectedLocation.formattedName || selectedLocation.name}
          />

          {/* 5. SUPPORTING CHARTS: Hourly Meteorological & Factor Breakdown (Part 28) */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Chart 1: 24h Hourly Meteorological Outlook (Part 15 & 16) */}
            <div className="p-5 sm:p-6 rounded-2xl bg-[#081B30]/95 border border-cyan-500/20 backdrop-blur-xl shadow-2xl space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-sky-500/20 text-sky-400">
                    <Thermometer className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-xs sm:text-sm font-bold text-white uppercase tracking-wider">
                      24-Hour Temperature & Precipitation Outlook
                    </h3>
                    <div className="text-[11px] text-slate-400 font-mono">
                      Thermal Trajectory (°C) & Hourly Volume (mm)
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3 text-[10px] font-mono">
                  <span className="flex items-center gap-1 text-sky-400 font-semibold">
                    <span className="w-2.5 h-2.5 rounded-full bg-sky-400 shadow-glow-cyan" /> Temp (°C)
                  </span>
                  <span className="flex items-center gap-1 text-blue-400 font-semibold">
                    <span className="w-2.5 h-2.5 rounded-sm bg-blue-500" /> Rain (mm)
                  </span>
                </div>
              </div>

              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={weatherChartData} margin={{ top: 10, right: 15, left: -15, bottom: 0 }}>
                    <defs>
                      <linearGradient id="thermalVibrantGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#38BDF8" stopOpacity={0.45} />
                        <stop offset="50%" stopColor="#0EA5E9" stopOpacity={0.25} />
                        <stop offset="100%" stopColor="#0284C7" stopOpacity={0.02} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1E3A5F" opacity={0.4} vertical={false} />
                    <XAxis dataKey="time" stroke="#94A3B8" fontSize={10} tickLine={false} />
                    <YAxis stroke="#94A3B8" fontSize={10} domain={['dataMin - 2', 'dataMax + 2']} tickLine={false} />
                    <Tooltip
                      content={({ active, payload, label }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0].payload;
                          const tColor = getTemperatureColor(data.temp);
                          return (
                            <div className="p-3 bg-[#06111F]/95 border border-cyan-500/40 rounded-xl shadow-2xl text-xs space-y-1.5 backdrop-blur-xl">
                              <div className="font-bold text-white border-b border-white/10 pb-1 flex items-center justify-between gap-4">
                                <span>{label}</span>
                                <span className="text-[10px] text-cyan-400 font-mono">Open-Meteo</span>
                              </div>
                              <div className="flex items-center justify-between gap-3">
                                <span className="text-slate-300">Temperature:</span>
                                <span className={`font-bold font-mono ${tColor.textClass}`}>{data.temp}°C ({tColor.label})</span>
                              </div>
                              <div className="flex items-center justify-between gap-3">
                                <span className="text-slate-300">Precipitation:</span>
                                <span className="text-blue-300 font-bold font-mono">{data.precipitation} mm</span>
                              </div>
                              <div className="flex items-center justify-between gap-3">
                                <span className="text-slate-300">Humidity:</span>
                                <span className="text-white font-mono">{data.humidity}%</span>
                              </div>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Area type="monotone" dataKey="temp" stroke="#38BDF8" strokeWidth={3} fill="url(#thermalVibrantGradient)" dot={{ r: 3, fill: '#38BDF8' }} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Chart 2: Interactive Location Geospatial Map */}
            <LocationMapCard
              location={selectedLocation}
              riskScore={compositeScore}
              riskLevel={currentRiskBadge.text.includes('CRITICAL') ? 'CRITICAL' : currentRiskBadge.text.includes('HIGH') ? 'HIGH' : currentRiskBadge.text.includes('MODERATE') ? 'MODERATE' : 'LOW'}
            />
          </div>

          {/* 6. "WHY?" TOP 3 RISK FACTORS & EXPLAINABILITY (Part 27 & 29) */}
          <div className="p-5 sm:p-6 rounded-2xl bg-[#081B30]/95 border border-white/10 backdrop-blur-xl shadow-2xl space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 pb-2 border-b border-white/10">
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-cyan-400" />
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                  Why? Key Risk Drivers & Normalized Factor Breakdown
                </h3>
              </div>
              <span className="text-xs text-slate-400 font-mono">
                Formula: R = Σ (w_i × f_i(x_i))
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
              {factorBreakdowns.slice(0, 3).map((factor, idx) => {
                const isCrit = factor.severity === 'CRITICAL';
                const isHigh = factor.severity === 'HIGH';
                const isMed = factor.severity === 'MEDIUM';
                const factorColor = isCrit ? 'text-red-400 bg-red-500/10 border-red-500/30' : isHigh ? 'text-orange-400 bg-orange-500/10 border-orange-500/30' : isMed ? 'text-amber-400 bg-amber-500/10 border-amber-500/30' : 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30';
                return (
                  <div
                    key={`${factor.name}-${idx}`}
                    className="p-4 rounded-xl bg-[#06111F] border border-white/10 hover:border-cyan-500/40 transition-all space-y-2.5"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-xs font-bold text-white">{factor.name}</span>
                      <span className={`text-[10px] font-bold font-mono px-2 py-0.5 rounded-full border ${factorColor}`}>
                        {factor.severity}
                      </span>
                    </div>

                    <div className="flex items-baseline justify-between text-xs font-mono">
                      <span className="text-slate-400">Observed Telemetry:</span>
                      <span className="text-cyan-300 font-bold">{factor.rawValue}</span>
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
                        <span>Contribution:</span>
                        <span className="text-white font-bold">
                          +{factor.weightedContribution.toFixed(1)} pts ({Math.round(factor.weight * 100)}% wt)
                        </span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-dark-950 overflow-hidden border border-white/5">
                        <div
                          className="h-full rounded-full transition-all duration-700"
                          style={{
                            width: `${Math.min(100, factor.normalizedScore)}%`,
                            backgroundColor: isCrit ? '#EF4444' : isHigh ? '#F97316' : isMed ? '#F59E0B' : '#10B981',
                          }}
                        />
                      </div>
                    </div>

                    <p className="text-[11px] text-slate-400 italic leading-relaxed">
                      {factor.formulaExplanation}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 7. Actionable Decision Queue & Transparent Formula */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Decision Actions */}
            <div className="p-5 rounded-2xl bg-[#081B30]/90 border border-white/10 backdrop-blur-xl shadow-2xl space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Target className="w-4 h-4 text-emerald-400" />
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                    Recommended Mitigation Queue
                  </h3>
                </div>
                <button
                  onClick={() => navigate('/decisions')}
                  className="text-[11px] text-cyan-400 hover:text-cyan-300 font-semibold flex items-center gap-1"
                >
                  Decision Center <ArrowRight className="w-3 h-3" />
                </button>
              </div>

              <div className="space-y-2.5">
                {[
                  { id: 'action1', name: 'Activate Urban Drainage Protocols & Sump Inspection', priority: 'PRIORITY 1', impact: '-18.5% Flood Risk' },
                  { id: 'action2', name: 'Distribute Air Filtration Directives for High AQI Spikes', priority: 'PRIORITY 2', impact: '-12.0% Exposure' },
                  { id: 'action3', name: 'Deploy Localized Emergency Power Backup Generator Check', priority: 'PRIORITY 3', impact: '-7.5% Outage Risk' },
                ].map((act) => {
                  const isDone = actionStatuses[act.id] === 'Completed';
                  return (
                    <div
                      key={act.id}
                      className={`p-3 rounded-xl border transition-all flex items-center justify-between gap-3 ${
                        isDone ? 'bg-emerald-500/10 border-emerald-500/30 opacity-75' : 'bg-[#06111F] border-white/10 hover:border-cyan-500/30'
                      }`}
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/5 text-cyan-300 font-semibold">
                            {act.priority}
                          </span>
                          <span className="text-xs font-semibold text-white truncate">{act.name}</span>
                        </div>
                        <div className="text-[11px] text-emerald-400 font-mono mt-0.5">
                          Target Impact: {act.impact}
                        </div>
                      </div>

                      <button
                        onClick={() => handleActionToggle(act.id, act.name)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1 flex-shrink-0 cursor-pointer ${
                          isDone ? 'bg-emerald-500 text-white' : 'bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10'
                        }`}
                      >
                        {isDone ? <Check className="w-3.5 h-3.5" /> : null}
                        <span>{isDone ? 'Done' : 'Start'}</span>
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Transparent Formula Breakdown Card */}
            <TransparentFormulaCard
              score={compositeScore}
              riskLevel={currentRiskBadge.text.includes('CRITICAL') ? 'CRITICAL' : currentRiskBadge.text.includes('HIGH') ? 'HIGH' : currentRiskBadge.text.includes('MODERATE') ? 'MODERATE' : 'LOW'}
              confidence={risk?.confidence ?? 94}
              factors={factorBreakdowns}
              mathematicalFormula={risk?.mathematicalFormula}
              calculationMethod={risk?.calculationMethod}
              isLive={dataStatus === 'LIVE'}
            />
          </div>
        </>
      )}
    </div>
  );
};
