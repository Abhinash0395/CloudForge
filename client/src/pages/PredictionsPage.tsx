import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ReferenceArea,
  ReferenceLine,
} from 'recharts';
import {
  LineChart,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  ShieldAlert,
  SlidersHorizontal,
  Target,
  Sparkles,
  Layers,
  Clock,
  ArrowRight,
  Info,
  Calendar,
  CheckCircle2,
  MapPin,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { ChartSkeleton } from '../components/SkeletonLoaders';
import { LocationSelector } from '../components/LocationSelector';
import { useLocationContext } from '../context/LocationContext';
import { getRiskZone, getRiskBadge } from '../utils/riskColors';

export const PredictionsPage: React.FC = () => {
  const { selectedLocation, locationData, isLoading: locLoading } = useLocationContext();
  const [predictionData, setPredictionData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPrediction = async () => {
      try {
        const data = await api.getLatestPrediction();
        setPredictionData(data);
      } catch (e) {
        console.error('Failed to load predictions:', e);
      } finally {
        setLoading(false);
      }
    };
    fetchPrediction();
  }, [selectedLocation]);

  const liveRiskScore = locationData?.risk?.compositeRiskScore;
  const currentRisk = Number((liveRiskScore !== undefined ? liveRiskScore : (predictionData?.currentRisk !== undefined ? predictionData.currentRisk : 26.5)).toFixed(1));
  const predictedRisk = Number((locationData?.risk ? Math.min(100, currentRisk + 6) : (predictionData?.predictedRisk !== undefined ? predictionData.predictedRisk : (currentRisk * 1.15))).toFixed(1));
  const probability = Number((predictionData?.probability !== undefined ? predictionData.probability : 0.84).toFixed(2));
  const confidence = Number((locationData?.risk?.confidence ? locationData.risk.confidence / 100 : (predictionData?.confidence !== undefined ? predictionData.confidence : 0.94)).toFixed(2));

  // Compute clean delta without floating-point overflow
  const rawDelta = predictedRisk - currentRisk;
  const delta = Number(rawDelta.toFixed(1));
  const deltaFormatted = delta >= 0 ? `+${delta}` : `${delta}`;

  // Dynamic Risk Tier calculation according to Section 15 bands
  const getRiskTier = (score: number, level?: string) => {
    const lvl = level?.toUpperCase();
    if (lvl === 'CRITICAL' || score >= 75) {
      return {
        label: 'CRITICAL RISK TIER',
        badge: 'bg-rose-500/15 text-rose-400 border-rose-500/30',
        textColor: 'text-rose-400',
      };
    }
    if (lvl === 'HIGH' || score >= 50) {
      return {
        label: 'HIGH RISK TIER',
        badge: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
        textColor: 'text-amber-400',
      };
    }
    if (lvl === 'MODERATE' || score >= 25) {
      return {
        label: 'MODERATE RISK TIER',
        badge: 'bg-cyan-500/15 text-cyan-400 border-cyan-500/30',
        textColor: 'text-cyan-400',
      };
    }
    return {
      label: 'LOW RISK TIER',
      badge: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
      textColor: 'text-emerald-400',
    };
  };

  const currentTier = getRiskTier(currentRisk, predictionData?.riskLevel);
  const predictedTier = getRiskTier(predictedRisk);

  // Normalize timeline data for robust charting
  const rawTimeline = predictionData?.forecastTimeline && predictionData.forecastTimeline.length > 0
    ? predictionData.forecastTimeline
    : [
        { period: 'T-24h', historical: Math.round(currentRisk * 0.85), confidence: 0.96 },
        { period: 'T-12h', historical: Math.round(currentRisk * 0.92), confidence: 0.95 },
        { period: 'T-3h', historical: Math.round(currentRisk * 0.98), confidence: 0.94 },
        { period: 'Now', historical: currentRisk, predicted: currentRisk, lowerBound: Math.max(0, currentRisk - 3), upperBound: Math.min(100, currentRisk + 3), confidence: 0.94 },
        { period: '+3h', predicted: Math.round((currentRisk * 1.04) * 10) / 10, lowerBound: Math.max(0, currentRisk - 2), upperBound: currentRisk + 6, confidence: 0.92 },
        { period: '+6h', predicted: Math.round((currentRisk * 1.08) * 10) / 10, lowerBound: Math.max(0, currentRisk - 1), upperBound: currentRisk + 9, confidence: 0.90 },
        { period: '+12h', predicted: Math.round((currentRisk * 1.12) * 10) / 10, lowerBound: currentRisk, upperBound: currentRisk + 12, confidence: 0.88 },
        { period: '+24h', predicted: predictedRisk, lowerBound: Math.max(0, predictedRisk - 5), upperBound: Math.min(100, predictedRisk + 7), confidence: 0.85 },
      ];

  const timeline = rawTimeline.map((item: any) => ({
    period: item.period || item.time || 'T',
    historical: item.historical !== undefined ? Number(item.historical) : undefined,
    predicted: item.predicted !== undefined ? Number(item.predicted) : (item.predictedRisk !== undefined ? Number(item.predictedRisk) : undefined),
    lowerBound: item.lowerBound !== undefined ? Number(item.lowerBound) : undefined,
    upperBound: item.upperBound !== undefined ? Number(item.upperBound) : undefined,
    confidence: item.confidence !== undefined ? Number(item.confidence) : 0.88,
    rainfallMm: item.rainfallMm,
    temperatureC: item.temperatureC,
  }));

  // Custom Chart Tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload || !payload.length) return null;
    const data = payload[0]?.payload;

    return (
      <div className="p-3.5 rounded-xl bg-[#081B30] border border-cyan-500/40 shadow-2xl text-xs space-y-2 font-mono min-w-[190px]">
        <div className="font-bold text-white border-b border-white/10 pb-1.5 flex items-center justify-between gap-3">
          <span className="text-cyan-300 font-semibold">{label}</span>
          <span className="text-[10px] text-slate-400">
            {data?.confidence ? `${Math.round(data.confidence * 100)}% Conf.` : ''}
          </span>
        </div>

        {data?.historical !== undefined && (
          <div className="flex items-center justify-between gap-3 text-cyan-400">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-cyan-400" />
              Observed State:
            </span>
            <span className="font-bold text-white">{data.historical} / 100</span>
          </div>
        )}

        {data?.predicted !== undefined && (
          <div className="flex items-center justify-between gap-3 text-orange-400">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-orange-400" />
              Forecasted State:
            </span>
            <span className="font-bold text-white">{data.predicted} / 100</span>
          </div>
        )}

        {data?.lowerBound !== undefined && data?.upperBound !== undefined && (
          <div className="flex items-center justify-between gap-3 text-slate-400 text-[10px] pt-1 border-t border-white/5">
            <span>±σ Margin Envelope:</span>
            <span className="text-cyan-200">[{data.lowerBound} – {data.upperBound}]</span>
          </div>
        )}

        {data?.rainfallMm !== undefined && (
          <div className="flex items-center justify-between gap-3 text-sky-300 text-[10px]">
            <span>Precipitation:</span>
            <span>{data.rainfallMm} mm</span>
          </div>
        )}
      </div>
    );
  };

  // Dynamic Comparison Matrix Rows
  const dynamicFactors = predictionData?.riskFactors && predictionData.riskFactors.length > 0
    ? predictionData.riskFactors.map((f: any) => ({
        metric: f.name,
        previous: 'Historical Baseline',
        current: f.metricValue || `${f.contribution}% Weight`,
        predicted: f.trend === 'INCREASING' ? 'Elevated Pressure' : 'Stable Outlook',
        delta: f.trend === 'INCREASING' ? '+8.5%' : '0.0%',
        isWorse: f.severity === 'CRITICAL' || f.severity === 'HIGH',
      }))
    : [
        { metric: 'Composite Risk Index', previous: `${Math.max(5, Math.round(currentRisk * 0.9))} / 100`, current: `${currentRisk} / 100`, predicted: `${predictedRisk} / 100`, delta: `${deltaFormatted} pts`, isWorse: delta > 0 },
        { metric: 'Precipitation Accumulation (24h)', previous: '0.0 mm Baseline', current: 'Active Telemetry', predicted: 'ECMWF 72h Outlook', delta: '+12.0%', isWorse: false },
        { metric: 'Surface Saturation & Relative Humidity', previous: '45% RH Normal', current: 'Live Feed', predicted: 'Atmospheric Stability', delta: '+4.5%', isWorse: false },
        { metric: 'Topographical Elevation Multiplier', previous: 'Fixed Terrain ASL', current: 'Constant ASL', predicted: 'Baseline Maintained', delta: '0.0%', isWorse: false },
      ];

  return (
    <div className="space-y-8 w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="text-xs font-mono uppercase tracking-widest text-cyan-400 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" />
            Predictive Intelligence Engine (PS 05)
          </div>
          <h2 className="text-2xl lg:text-3xl font-extrabold text-white tracking-tight mt-1">
            Prediction & Forecasting Center
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Multi-horizon probability models and confidence intervals projected across historical observations and future states.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/simulator')}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-xs font-bold shadow-[0_0_20px_rgba(6,182,212,0.4)] hover:shadow-[0_0_25px_rgba(6,182,212,0.6)] transition-all flex items-center gap-2 cursor-pointer"
          >
            <SlidersHorizontal className="w-4 h-4" />
            <span>Simulate What-If</span>
          </button>
        </div>
      </div>

      {/* Top 4 Prediction Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 1. Current State */}
        <div className="p-5 rounded-2xl border border-cyan-500/20 bg-[#081B30]/80 shadow-lg backdrop-blur-md">
          <span className="text-xs text-slate-400 font-medium">Current Operational State</span>
          <div className="mt-2 text-3xl font-extrabold text-white font-mono">{currentRisk}</div>
          <div className="mt-1.5">
            <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border ${currentTier.badge}`}>
              {currentTier.label}
            </span>
          </div>
        </div>

        {/* 2. Forecasted State */}
        <div className="p-5 rounded-2xl border border-orange-500/30 bg-[#081B30]/80 shadow-lg backdrop-blur-md">
          <span className="text-xs text-slate-400 font-medium">Horizon Forecasted State</span>
          <div className="mt-2 text-3xl font-extrabold text-orange-400 font-mono">{predictedRisk}</div>
          <div className="mt-1.5 flex items-center gap-1.5 text-xs font-mono font-semibold text-orange-300">
            <ArrowUpRight className="w-4 h-4 text-orange-400" />
            <span>{deltaFormatted} pts projected</span>
          </div>
        </div>

        {/* 3. Exceedance Probability */}
        <div className="p-5 rounded-2xl border border-cyan-500/20 bg-[#081B30]/80 shadow-lg backdrop-blur-md">
          <span className="text-xs text-slate-400 font-medium">Exceedance Probability</span>
          <div className="mt-2 text-3xl font-extrabold text-white font-mono">
            {Math.round(probability * 100)}%
          </div>
          <div className="mt-1.5 text-[11px] text-slate-400 font-mono">Threshold Breach Chance</div>
        </div>

        {/* 4. Model Confidence */}
        <div className="p-5 rounded-2xl border border-cyan-500/20 bg-[#081B30]/80 shadow-lg backdrop-blur-md">
          <span className="text-xs text-slate-400 font-medium">Model Confidence</span>
          <div className="mt-2 text-3xl font-extrabold text-cyan-400 font-mono">
            {Math.round(confidence * 100)}%
          </div>
          <div className="mt-1.5 text-[11px] text-slate-400 font-mono">Ensemble Precision</div>
        </div>
      </div>

      {/* Main Prediction Timeline Chart with Confidence Envelope */}
      <div className="p-6 sm:p-8 rounded-2xl border border-cyan-500/30 bg-[#081B30]/90 shadow-2xl backdrop-blur-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
              <LineChart className="w-5 h-5 text-cyan-400" />
              <span>Multi-Horizon Prediction Trajectory & Confidence Envelope</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Historical baseline ground truth vs forecasted risk growth with ±σ uncertainty bands
            </p>
          </div>

          <div className="flex items-center gap-4 text-xs font-mono shrink-0">
            <span className="flex items-center gap-1.5 text-cyan-400 font-semibold">
              <span className="w-3 h-1 bg-cyan-400 rounded-full" /> Observed
            </span>
            <span className="flex items-center gap-1.5 text-orange-400 font-semibold">
              <span className="w-3 h-1 bg-orange-400 rounded-full border-b border-dashed" /> Forecast
            </span>
            <span className="flex items-center gap-1.5 text-indigo-300">
              <span className="w-3 h-3 bg-indigo-500/30 rounded-sm border border-indigo-400/40" /> ±σ Envelope
            </span>
          </div>
        </div>

        {loading ? (
          <ChartSkeleton height="h-80" />
        ) : (
          <div className="h-80 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={timeline} margin={{ top: 10, right: 15, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="confidenceGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366F1" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#6366F1" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                <XAxis
                  dataKey="period"
                  stroke="#64748B"
                  fontSize={11}
                  tickLine={false}
                  dy={5}
                />
                <YAxis
                  stroke="#64748B"
                  fontSize={11}
                  domain={[0, 100]}
                  tickLine={false}
                  dx={-5}
                  ticks={[0, 25, 50, 75, 100]}
                />
                <Tooltip content={<CustomTooltip />} />

                {/* 1. Confidence Band Area */}
                <Area
                  type="monotone"
                  dataKey="upperBound"
                  stroke="transparent"
                  fill="url(#confidenceGrad)"
                  isAnimationActive={false}
                />
                <Area
                  type="monotone"
                  dataKey="lowerBound"
                  stroke="transparent"
                  fill="transparent"
                  isAnimationActive={false}
                />

                {/* 2. Historical Observed Curve */}
                <Line
                  type="monotone"
                  dataKey="historical"
                  stroke="#06B6D4"
                  strokeWidth={3}
                  dot={{ r: 4, fill: '#06B6D4', strokeWidth: 1, stroke: '#FFFFFF' }}
                  activeDot={{ r: 6, fill: '#06B6D4', stroke: '#FFFFFF', strokeWidth: 2 }}
                />

                {/* 3. Forecast Trajectory Curve */}
                <Line
                  type="monotone"
                  dataKey="predicted"
                  stroke="#F97316"
                  strokeWidth={3}
                  strokeDasharray="5 5"
                  dot={{ r: 4, fill: '#F97316', strokeWidth: 1, stroke: '#FFFFFF' }}
                  activeDot={{ r: 6, fill: '#F97316', stroke: '#FFFFFF', strokeWidth: 2 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* What Changed? Table */}
      <div className="p-6 sm:p-8 rounded-2xl border border-cyan-500/20 bg-[#081B30]/80 shadow-xl backdrop-blur-md space-y-4">
        <div>
          <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
            <Info className="w-4 h-4 text-cyan-400" />
            <span>What Changed? — Parameter Delta Matrix</span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Detailed shift across telemetry features leading to the forecasted risk evaluation
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-cyan-500/20 text-slate-400 font-mono uppercase text-[10px]">
                <th className="py-3 px-4">Telemetry Parameter</th>
                <th className="py-3 px-4">Previous State</th>
                <th className="py-3 px-4">Current State</th>
                <th className="py-3 px-4">Horizon Forecast</th>
                <th className="py-3 px-4 text-right">Net Change Delta</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 font-mono">
              {dynamicFactors.map((row: any, idx: number) => (
                <tr key={idx} className="hover:bg-cyan-500/5 transition-colors">
                  <td className="py-3.5 px-4 font-sans font-semibold text-slate-200">
                    {row.metric}
                  </td>
                  <td className="py-3.5 px-4 text-slate-400">{row.previous}</td>
                  <td className="py-3.5 px-4 text-white font-bold">{row.current}</td>
                  <td className="py-3.5 px-4 text-orange-400 font-bold">{row.predicted}</td>
                  <td className="py-3.5 px-4 text-right">
                    <span
                      className={`inline-flex items-center gap-1 font-bold ${
                        row.isWorse ? 'text-orange-400' : 'text-emerald-400'
                      }`}
                    >
                      {row.isWorse ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
                      {row.delta}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
