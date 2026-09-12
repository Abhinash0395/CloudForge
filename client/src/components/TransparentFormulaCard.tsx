import React, { useState } from 'react';
import { Calculator, ChevronDown, ChevronUp, CheckCircle2, TrendingUp, ShieldAlert, Cpu } from 'lucide-react';

interface FactorItem {
  name: string;
  category?: string;
  weight?: number;
  rawValue?: string;
  normalizedScore?: number;
  contribution?: number;
  severity: string;
  explanation?: string;
  trend?: string;
}

interface TransparentFormulaCardProps {
  score: number;
  riskLevel: string;
  confidence: number;
  factors: FactorItem[];
  calculationMethod?: string;
  mathematicalFormula?: string;
  isLive?: boolean;
}

export const TransparentFormulaCard: React.FC<TransparentFormulaCardProps> = ({
  score,
  riskLevel,
  confidence,
  factors,
  calculationMethod = 'Multi-factor Open-Meteo Meteorological Weighted Composite',
  mathematicalFormula,
  isLive = true,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="rounded-2xl bg-[#081B30]/90 border border-cyan-500/20 p-5 backdrop-blur-md shadow-xl space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
            <Calculator className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              Transparent Mathematical Calculation
              <span className={`text-[11px] px-2 py-0.5 rounded-full font-semibold border ${
                isLive
                  ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                  : 'bg-amber-500/20 text-amber-400 border-amber-500/30'
              }`}>
                {isLive ? '● Live Telemetry Composite' : '● Demo Heuristic Matrix'}
              </span>
            </h3>
            <p className="text-xs text-slate-400">
              Deterministic scoring pipeline with documented weights & zero hidden bias
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 text-xs font-medium border border-cyan-500/30 transition-colors"
        >
          <span>{isExpanded ? 'Hide Details' : 'View Formula'}</span>
          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
      </div>

      {/* Summary Formula Row */}
      <div className="p-3.5 rounded-xl bg-[#06111F] border border-cyan-500/20 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 font-mono text-cyan-300">
          <Cpu className="w-4 h-4 text-cyan-400" />
          <span>Composite Score: </span>
          <strong className="text-white text-sm">{score} / 100</strong>
          <span className="text-slate-500">|</span>
          <span>Risk Level: </span>
          <strong className="text-white">{riskLevel}</strong>
          <span className="text-slate-500">|</span>
          <span>Confidence: </span>
          <strong className="text-emerald-400">{(confidence * 100).toFixed(0)}%</strong>
        </div>
        <div className="text-[11px] text-slate-400">
          Evaluated via <span className="text-slate-200 font-medium">{calculationMethod}</span>
        </div>
      </div>

      {/* Expandable Mathematical Breakdown */}
      {isExpanded && (
        <div className="space-y-4 pt-2 animate-in fade-in duration-200">
          {mathematicalFormula && (
            <div className="p-3.5 rounded-xl bg-[#0B2544]/60 border border-cyan-500/30 font-mono text-xs text-cyan-200 leading-relaxed overflow-x-auto">
              <span className="text-slate-400 uppercase text-[10px] block font-sans mb-1 font-semibold">Active Mathematical Equation:</span>
              {mathematicalFormula}
            </div>
          )}

          <div className="space-y-2">
            <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
              Factor Contribution Weights (Total: 100%)
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {factors.map((factor, idx) => {
                const weightPct = factor.weight ? `${(factor.weight * 100).toFixed(0)}%` : `${factor.contribution?.toFixed(0) || 25}%`;
                return (
                  <div
                    key={idx}
                    className="p-3 rounded-xl bg-[#06111F]/90 border border-slate-700/60 flex flex-col justify-between space-y-2"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="text-xs font-semibold text-white block">{factor.name}</span>
                        {factor.rawValue && (
                          <span className="text-[11px] font-mono text-cyan-400">{factor.rawValue}</span>
                        )}
                      </div>
                      <span className="text-[11px] px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-300 font-mono font-bold border border-cyan-500/20">
                        {weightPct} Weight
                      </span>
                    </div>

                    {factor.explanation && (
                      <p className="text-[11px] text-slate-400 leading-snug">{factor.explanation}</p>
                    )}

                    <div className="flex items-center justify-between text-[11px] pt-1 border-t border-slate-800 text-slate-400">
                      <span>Severity: <strong className="text-slate-200">{factor.severity}</strong></span>
                      {factor.trend && (
                        <span className="flex items-center gap-1 text-cyan-300">
                          <TrendingUp className="w-3 h-3" />
                          {factor.trend}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
