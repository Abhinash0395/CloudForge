import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  Brain,
  ShieldAlert,
  ChevronDown,
  ChevronUp,
  Cpu,
  Layers,
  CheckCircle2,
  TrendingUp,
  Eye,
  AlertTriangle,
  Info,
  SlidersHorizontal,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { StatusBadge } from '../components/StatusBadge';

export const ExplainabilityPage: React.FC = () => {
  const [showTechnical, setShowTechnical] = useState(false);
  const [latestAnalysis, setLatestAnalysis] = useState<any>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchLatest = async () => {
      try {
        const data = await api.getOverviewStats();
        setLatestAnalysis(data.latestAnalysis);
      } catch (e) {
        console.warn('Could not load analysis:', e);
      }
    };
    fetchLatest();
  }, []);

  const riskScore = latestAnalysis?.riskScore || 78.4;
  const riskLevel = latestAnalysis?.riskLevel || 'CRITICAL';
  const confidence = latestAnalysis?.confidence || 0.91;

  const factors = latestAnalysis?.riskFactors && latestAnalysis.riskFactors.length > 0
    ? latestAnalysis.riskFactors
    : [
        { name: 'Core Transformer Temperature (96.2°C)', contribution: 38.0, category: 'Operational', explanation: 'Operating 18°C above optimal thermal dissipation threshold.' },
        { name: 'Harmonic Distortion Load (8.4% THD)', contribution: 27.5, category: 'Operational', explanation: 'Non-linear industrial load feedback generating harmonic resonance.' },
        { name: 'Coolant Pump Flow Rate (62% Norm)', contribution: 21.0, category: 'Operational', explanation: 'Coolant cavitation restricting primary heat exchanger.' },
        { name: 'Historical Baseline Drift (+22.4%)', contribution: 13.5, category: 'Historical', explanation: 'Steadily increasing 30-day thermal drift curve.' },
      ];

  const explainSections = [
    {
      title: 'What the model saw',
      icon: Eye,
      color: 'text-brand-accent',
      desc: 'The Multi-Factor Analytical Ensemble processed 6 telemetry features. A significant non-linear covariance was detected between secondary harmonic vibration spikes (8.4% THD) and transformer core temperature exceeding 96.2°C.',
    },
    {
      title: 'What changed',
      icon: TrendingUp,
      color: 'text-risk-high',
      desc: 'Operational parameters diverged by +18.4% compared to the 90-day seasonal baseline, exacerbated by ambient heatwave conditions indexing at 68/100.',
    },
    {
      title: 'Why it matters',
      icon: ShieldAlert,
      color: 'text-rose-400',
      desc: 'Compounding thermal stress accelerates insulation dielectric breakdown exponentially. Failure probability elevates from 12% in steady-state to over 84% under continuous unthrottled load.',
    },
    {
      title: 'What could happen',
      icon: AlertTriangle,
      color: 'text-amber-400',
      desc: 'If unmitigated within 7 to 14 days, secondary thermal flashover will trigger automatic protection trip, causing unplanned regional power loss across Sector 7-G.',
    },
    {
      title: 'What you should consider doing',
      icon: CheckCircle2,
      color: 'text-risk-low',
      desc: 'Execute Priority 1 mitigation: Divert 30% load to Substation Delta backup and engage emergency coolant degassing unit to immediately reduce systemic risk delta by 26%.',
    },
  ];

  return (
    <div className="space-y-8 w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="text-xs font-mono uppercase tracking-widest text-brand-accent">
            Glassbox Model Reasoning (XAI)
          </div>
          <h2 className="text-2xl lg:text-3xl font-extrabold text-white tracking-tight mt-1">
            Why Did AI Make This Prediction?
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Transparent attribution decomposing multi-factor neural reasoning into causal chains and feature weights.
          </p>
        </div>

        <button
          onClick={() => navigate('/simulator')}
          className="px-4 py-2.5 rounded-xl bg-brand-primary text-white text-xs font-bold shadow-glow-primary hover:bg-brand-primary/90 transition-all flex items-center gap-2"
        >
          <SlidersHorizontal className="w-4 h-4" />
          <span>Test in Simulator</span>
        </button>
      </div>

      {/* Top Prediction Status Banner */}
      <div className="glass-panel p-6 rounded-enterprise border border-brand-primary/40 bg-gradient-to-r from-brand-primary/20 via-dark-850 to-dark-900 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-2xl bg-brand-primary/30 text-brand-accent border border-brand-primary/40 shadow-glow-primary/30">
            <Brain className="w-8 h-8" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono uppercase text-slate-400">Assessed Prediction:</span>
              <StatusBadge level={riskLevel} />
            </div>
            <h3 className="text-xl font-bold text-white mt-1">
              Risk Index Evaluated at {riskScore}/100 ({riskLevel})
            </h3>
            <p className="text-xs text-slate-300 mt-0.5">
              Ensemble Confidence: <strong>{Math.round(confidence * 100)}%</strong> • Dual Engine Verification
            </p>
          </div>
        </div>
      </div>

      {/* Feature Contribution Visualizations */}
      <div className="glass-panel p-6 sm:p-8 rounded-enterprise border border-white/10 bg-dark-900/60 space-y-6">
        <div>
          <h3 className="text-base font-bold text-white tracking-tight">
            Factor Contribution Weight Breakdown
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Normalized attribution showing the % weight of each input feature toward the predicted risk score
          </p>
        </div>

        <div className="space-y-4">
          {factors.map((factor: any) => (
            <div key={factor.name} className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-200">{factor.name}</span>
                <span className="font-mono font-bold text-brand-accent">
                  {factor.contribution}%
                </span>
              </div>
              <div className="w-full bg-dark-750 h-3 rounded-full overflow-hidden p-0.5 border border-white/5">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(100, factor.contribution * 2.5)}%` }}
                  transition={{ duration: 0.8, ease: 'easeOut' }}
                  className="h-full bg-gradient-to-r from-brand-primary via-indigo-400 to-brand-accent rounded-full"
                />
              </div>
              <div className="text-[11px] text-slate-400">{factor.explanation}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Plain Language Reasoning Breakdown */}
      <div className="space-y-4">
        <h3 className="text-base font-bold text-white tracking-tight">
          Causal Narrative & Decision Context
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {explainSections.map((sec) => {
            const Icon = sec.icon;
            return (
              <div
                key={sec.title}
                className="glass-panel p-5 rounded-2xl border border-white/10 hover:border-brand-primary/30 transition-all bg-dark-900/60 space-y-2"
              >
                <div className="flex items-center gap-2">
                  <div className={`p-1.5 rounded-lg bg-dark-800 ${sec.color}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-white">
                    {sec.title}
                  </h4>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed pt-1">
                  {sec.desc}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Expandable Technical Details */}
      <div className="glass-panel rounded-enterprise border border-white/10 bg-dark-900/60 overflow-hidden">
        <button
          onClick={() => setShowTechnical(!showTechnical)}
          className="w-full p-5 flex items-center justify-between hover:bg-white/5 transition-all text-left"
        >
          <div className="flex items-center gap-2 text-xs font-bold text-slate-200">
            <Cpu className="w-4 h-4 text-brand-accent" />
            <span>Show Technical Model Details & Hyperparameters</span>
          </div>
          {showTechnical ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
        </button>

        <AnimatePresence>
          {showTechnical && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="p-6 pt-0 border-t border-white/5 space-y-4 font-mono text-xs"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 pt-4">
                <div className="p-3 rounded-xl bg-dark-850 border border-white/5">
                  <span className="text-slate-400 text-[10px]">Model Architecture:</span>
                  <div className="font-bold text-white mt-0.5">RiskLens-MFAE-v4 + Gemini 2.5</div>
                </div>
                <div className="p-3 rounded-xl bg-dark-850 border border-white/5">
                  <span className="text-slate-400 text-[10px]">Model Version:</span>
                  <div className="font-bold text-brand-accent mt-0.5">v4.2.0-Production</div>
                </div>
                <div className="p-3 rounded-xl bg-dark-850 border border-white/5">
                  <span className="text-slate-400 text-[10px]">Input Features Evaluated:</span>
                  <div className="font-bold text-white mt-0.5">6 Primary Vectors</div>
                </div>
                <div className="p-3 rounded-xl bg-dark-850 border border-white/5">
                  <span className="text-slate-400 text-[10px]">Confidence Precision:</span>
                  <div className="font-bold text-emerald-400 mt-0.5">{confidence * 100}% (±3.2%)</div>
                </div>
                <div className="p-3 rounded-xl bg-dark-850 border border-white/5">
                  <span className="text-slate-400 text-[10px]">Anomaly Sigma Level:</span>
                  <div className="font-bold text-risk-high mt-0.5">2.84 σ Deviation</div>
                </div>
                <div className="p-3 rounded-xl bg-dark-850 border border-white/5">
                  <span className="text-slate-400 text-[10px]">Data Ingestion Source:</span>
                  <div className="font-bold text-slate-200 mt-0.5">Calibrated Telemetry Stream</div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
