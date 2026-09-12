import React from 'react';
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
  TrendingUp,
  Clock,
  Sparkles,
  ShieldAlert,
  Info,
  Layers,
  ArrowRight,
  Target,
} from 'lucide-react';
import { getRiskZone, RISK_ZONES } from '../utils/riskColors';

interface TrajectoryPoint {
  period: string;
  historical?: number | null;
  predicted?: number | null;
  lowerBound?: number | null;
  upperBound?: number | null;
  rainfall?: number;
  temp?: number;
  riskLevel?: string;
  colorHex?: string;
}

interface RiskTrajectoryChartProps {
  data: TrajectoryPoint[];
  currentScore: number;
  locationName: string;
}

export const RiskTrajectoryChart: React.FC<RiskTrajectoryChartProps> = ({
  data,
  currentScore,
  locationName,
}) => {
  const currentZone = getRiskZone(currentScore);

  return (
    <div className="p-5 sm:p-7 rounded-2xl bg-[#081B30]/95 border border-cyan-500/30 backdrop-blur-xl shadow-2xl space-y-5">
      {/* Header & Title */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-cyan-500/20 text-cyan-400">
              <TrendingUp className="w-5 h-5" />
            </div>
            <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">
              Multi-Horizon Risk Prediction Curve & Color-Coded Risk Zones
            </h3>
          </div>
          <p className="text-xs text-slate-300 mt-1 flex flex-wrap items-center gap-1.5">
            <span>Observed historical baseline</span>
            <span className="text-cyan-400 font-bold">→</span>
            <span>Current state</span>
            <span className="text-cyan-400 font-bold">→</span>
            <span>Multi-horizon forecast with ±σ confidence envelope</span>
          </p>
        </div>

        {/* Semantic Color Zone Legend */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs font-mono">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-300">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
            <span className="font-semibold">Low (0–24)</span>
          </div>
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-500/15 border border-amber-500/30 text-amber-300">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400 shadow-[0_0_8px_rgba(245,158,11,0.8)]" />
            <span className="font-semibold">Mod (25–49)</span>
          </div>
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-orange-500/15 border border-orange-500/30 text-orange-300">
            <span className="w-2.5 h-2.5 rounded-full bg-orange-400 shadow-[0_0_8px_rgba(249,115,22,0.8)]" />
            <span className="font-semibold">High (50–74)</span>
          </div>
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-red-500/15 border border-red-500/30 text-red-300">
            <span className="w-2.5 h-2.5 rounded-full bg-red-400 shadow-[0_0_8px_rgba(239,68,68,0.8)]" />
            <span className="font-semibold">Critical (75–100)</span>
          </div>
        </div>
      </div>

      {/* Explanatory 3-Phase Horizon Visual Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3 rounded-xl bg-[#06111F]/80 border border-white/10 text-xs">
        <div className="flex items-center gap-2.5 p-2 rounded-lg bg-white/5">
          <div className="w-3 h-3 rounded-full bg-cyan-400 shadow-glow-cyan flex-shrink-0" />
          <div>
            <div className="font-bold text-white">1. Past Baseline (T-24h to T-3h)</div>
            <div className="text-[11px] text-slate-400 font-mono">Solid line • Verified past telemetry</div>
          </div>
        </div>
        <div className="flex items-center gap-2.5 p-2 rounded-lg bg-cyan-500/10 border border-cyan-500/30">
          <div className="w-3 h-3 rounded-full bg-white shadow-[0_0_10px_#38BDF8] animate-pulse flex-shrink-0" />
          <div>
            <div className="font-bold text-cyan-300">2. Current State (Now)</div>
            <div className="text-[11px] text-cyan-200 font-mono">Score: {currentScore}/100 • {currentZone.label}</div>
          </div>
        </div>
        <div className="flex items-center gap-2.5 p-2 rounded-lg bg-white/5">
          <div className="w-3 h-3 rounded-full bg-purple-400 shadow-[0_0_8px_#A855F7] flex-shrink-0" />
          <div>
            <div className="font-bold text-purple-300">3. Multi-Horizon Forecast (+3h to +72h)</div>
            <div className="text-[11px] text-slate-400 font-mono">Dashed curve • ±σ Probability Envelope</div>
          </div>
        </div>
      </div>

      {/* The Recharts Graphic Canvas */}
      <div className="h-80 w-full relative">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 20, right: 25, left: -15, bottom: 5 }}>
            <defs>
              {/* Dynamic Vertical Multi-Color Gradient Fill */}
              <linearGradient id="riskAreaMultiGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#EF4444" stopOpacity={0.45} />
                <stop offset="30%" stopColor="#F97316" stopOpacity={0.35} />
                <stop offset="60%" stopColor="#F59E0B" stopOpacity={0.25} />
                <stop offset="100%" stopColor="#10B981" stopOpacity={0.12} />
              </linearGradient>

              {/* Forecast Envelope Confidence Gradient */}
              <linearGradient id="forecastEnvelopeGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#A855F7" stopOpacity={0.35} />
                <stop offset="100%" stopColor="#A855F7" stopOpacity={0.05} />
              </linearGradient>
            </defs>

            <CartesianGrid strokeDasharray="3 3" stroke="#1E3A5F" opacity={0.5} vertical={false} />

            {/* 4 Clean, Distinct Horizontal Risk Zone Bands with Neon Borders */}
            {/* Zone 4: Critical (75 - 100) */}
            <ReferenceArea
              y1={75}
              y2={100}
              fill="#EF4444"
              fillOpacity={0.12}
              stroke="#EF4444"
              strokeOpacity={0.25}
              strokeDasharray="4 4"
              label={{
                value: '🔴 CRITICAL RISK (75-100)',
                fill: '#FCA5A5',
                fontSize: 10,
                fontWeight: 'bold',
                position: 'insideTopRight',
              }}
            />

            {/* Zone 3: High (50 - 75) */}
            <ReferenceArea
              y1={50}
              y2={75}
              fill="#F97316"
              fillOpacity={0.10}
              stroke="#F97316"
              strokeOpacity={0.25}
              strokeDasharray="4 4"
              label={{
                value: '🟠 HIGH RISK (50-74)',
                fill: '#FDBA74',
                fontSize: 10,
                fontWeight: 'bold',
                position: 'insideTopRight',
              }}
            />

            {/* Zone 2: Moderate (25 - 50) */}
            <ReferenceArea
              y1={25}
              y2={50}
              fill="#F59E0B"
              fillOpacity={0.09}
              stroke="#F59E0B"
              strokeOpacity={0.25}
              strokeDasharray="4 4"
              label={{
                value: '🟡 MODERATE RISK (25-49)',
                fill: '#FCD34D',
                fontSize: 10,
                fontWeight: 'bold',
                position: 'insideTopRight',
              }}
            />

            {/* Zone 1: Low (0 - 25) */}
            <ReferenceArea
              y1={0}
              y2={25}
              fill="#10B981"
              fillOpacity={0.08}
              stroke="#10B981"
              strokeOpacity={0.2}
              label={{
                value: '🟢 LOW RISK (0-24)',
                fill: '#6EE7B7',
                fontSize: 10,
                fontWeight: 'bold',
                position: 'insideTopRight',
              }}
            />

            {/* Threshold Reference Lines */}
            <ReferenceLine y={25} stroke="#F59E0B" strokeWidth={1.5} strokeDasharray="3 3" opacity={0.6} />
            <ReferenceLine y={50} stroke="#F97316" strokeWidth={1.5} strokeDasharray="3 3" opacity={0.6} />
            <ReferenceLine y={75} stroke="#EF4444" strokeWidth={1.5} strokeDasharray="3 3" opacity={0.6} />

            {/* X and Y Axes */}
            <XAxis
              dataKey="period"
              stroke="#94A3B8"
              fontSize={11}
              tickLine={false}
              dy={5}
            />
            <YAxis
              stroke="#94A3B8"
              fontSize={11}
              domain={[0, 100]}
              ticks={[0, 25, 50, 75, 100]}
              tickLine={false}
              dx={-5}
            />

            {/* Rich Accessible Tooltip */}
            <Tooltip
              content={({ active, payload, label }) => {
                if (active && payload && payload.length) {
                  const pt = payload[0].payload as TrajectoryPoint;
                  const scoreVal = pt.predicted !== null && pt.predicted !== undefined ? pt.predicted : (pt.historical ?? currentScore);
                  const zone = getRiskZone(scoreVal);
                  const isFuture = pt.period.includes('+') || pt.predicted !== undefined;
                  return (
                    <div className="p-4 bg-[#06111F]/95 border border-cyan-500/50 rounded-2xl shadow-[0_0_30px_rgba(0,0,0,0.8)] text-xs space-y-2 backdrop-blur-2xl min-w-[220px]">
                      <div className="font-bold text-white border-b border-white/10 pb-1.5 flex items-center justify-between gap-3">
                        <span className="flex items-center gap-1 text-cyan-300">
                          <span>Horizon:</span>
                          <span className="font-mono">{label}</span>
                        </span>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/5 text-slate-300">
                          {isFuture ? 'Forecasted' : 'Observed'}
                        </span>
                      </div>

                      <div className="flex items-center justify-between gap-3">
                        <span className="text-slate-300">Risk Score:</span>
                        <span className="font-mono font-extrabold text-base text-white">
                          {scoreVal} <span className="text-xs text-slate-400 font-normal">/ 100</span>
                        </span>
                      </div>

                      <div className="flex items-center justify-between gap-3">
                        <span className="text-slate-300">Risk Level:</span>
                        <span className={`font-bold px-2 py-0.5 rounded ${zone.bgColor} ${zone.textColor} border ${zone.borderColor}`}>
                          {zone.badgeText}
                        </span>
                      </div>

                      {pt.lowerBound !== null && pt.upperBound !== null && (
                        <div className="text-[10px] text-slate-400 font-mono pt-1.5 border-t border-white/10 flex items-center justify-between">
                          <span>±σ Bounds:</span>
                          <span className="text-cyan-300 font-bold">[{pt.lowerBound} – {pt.upperBound}]</span>
                        </div>
                      )}

                      {pt.rainfall !== undefined && (
                        <div className="text-[10px] text-blue-300 font-mono flex items-center justify-between">
                          <span>Precipitation:</span>
                          <span>{pt.rainfall} mm</span>
                        </div>
                      )}

                      <div className="text-[9px] text-slate-400 font-mono pt-1 border-t border-white/5">
                        Source: Open-Meteo & Copernicus CAMS
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />

            {/* 1. Shaded Uncertainty Area (Forecast Zone) */}
            <Area
              type="monotone"
              dataKey="upperBound"
              stroke="transparent"
              fill="url(#forecastEnvelopeGrad)"
              isAnimationActive={false}
            />

            {/* 2. Shaded Multi-Color Risk Fill Under Historical Baseline */}
            <Area
              type="monotone"
              dataKey="historical"
              stroke="#06B6D4"
              strokeWidth={3.5}
              fill="url(#riskAreaMultiGrad)"
              dot={{ r: 5, fill: '#06B6D4', stroke: '#FFFFFF', strokeWidth: 2 }}
              activeDot={{ r: 7, fill: '#06B6D4', stroke: '#FFFFFF', strokeWidth: 3 }}
            />

            {/* 3. Forecast Trajectory (Dashed Curve with High Contrast) */}
            <Line
              type="monotone"
              dataKey="predicted"
              stroke="#C084FC"
              strokeWidth={3.5}
              strokeDasharray="6 6"
              dot={{ r: 5, fill: '#C084FC', stroke: '#FFFFFF', strokeWidth: 2 }}
              activeDot={{ r: 7, fill: '#C084FC', stroke: '#FFFFFF', strokeWidth: 3 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Dynamic Zone Interpretation Guide */}
      <div className="pt-3 border-t border-white/10 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-300">
        <div className="flex items-center gap-2">
          <span className="text-slate-400">Current Location Position:</span>
          <span className={`font-bold font-mono px-2 py-0.5 rounded ${currentZone.bgColor} ${currentZone.textColor} border ${currentZone.borderColor}`}>
            {locationName} is in the {currentZone.badgeText} zone ({currentScore}/100)
          </span>
        </div>
        <div className="text-[11px] text-slate-400 font-mono">
          Thresholds: Low (0-24) | Mod (25-49) | High (50-74) | Crit (75-100)
        </div>
      </div>
    </div>
  );
};
