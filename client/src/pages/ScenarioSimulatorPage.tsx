import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import {
  SlidersHorizontal,
  Sparkles,
  TrendingUp,
  TrendingDown,
  RefreshCw,
  ShieldAlert,
  Target,
  ArrowRight,
  Info,
  CheckCircle2,
  Brain,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { RiskScoreMeter } from '../components/RiskScoreMeter';
import { StatusBadge } from '../components/StatusBadge';
import { useToast } from '../context/ToastContext';

export const ScenarioSimulatorPage: React.FC = () => {
  const [baselineRisk, setBaselineRisk] = useState<number>(72);
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulationResult, setSimulationResult] = useState<any>(null);
  const toast = useToast();
  const navigate = useNavigate();

  const [factors, setFactors] = useState([
    { name: 'Operational Load & Thermal Stress', originalContribution: 35.0, deltaPercent: 15 },
    { name: 'Ambient Heatwave Stress Index', originalContribution: 25.0, deltaPercent: -10 },
    { name: 'Harmonic Vibration Drift (THD)', originalContribution: 22.5, deltaPercent: 20 },
    { name: 'Coolant Flow Circulation Cavitation', originalContribution: 17.5, deltaPercent: 5 },
  ]);

  const handleFactorChange = (idx: number, delta: number) => {
    setFactors((prev) => {
      const next = [...prev];
      next[idx].deltaPercent = delta;
      return next;
    });
  };

  const handleResetSliders = () => {
    setFactors([
      { name: 'Operational Load & Thermal Stress', originalContribution: 35.0, deltaPercent: 0 },
      { name: 'Ambient Heatwave Stress Index', originalContribution: 25.0, deltaPercent: 0 },
      { name: 'Harmonic Vibration Drift (THD)', originalContribution: 22.5, deltaPercent: 0 },
      { name: 'Coolant Flow Circulation Cavitation', originalContribution: 17.5, deltaPercent: 0 },
    ]);
    setSimulationResult(null);
  };

  const handleRunSimulation = async () => {
    setIsSimulating(true);
    try {
      const result = await api.simulateWhatIf({
        baselineRisk,
        factors,
      });

      setTimeout(() => {
        setSimulationResult(result);
        setIsSimulating(false);
        toast.success(
          'What-If Simulation Calculated',
          `Simulated Risk: ${result.simulatedRisk}/100 (Delta: ${result.deltaSign} pts)`
        );
      }, 400);
    } catch (e: any) {
      setIsSimulating(false);
      toast.error('Simulation Failed', e.message);
    }
  };

  // Run initial simulation on first load if null
  React.useEffect(() => {
    handleRunSimulation();
  }, []);

  const chartData = simulationResult?.forecastPoints || [
    { period: 'Current', baseline: baselineRisk, simulated: baselineRisk },
    { period: '+7 Days', baseline: Math.min(100, Math.round(baselineRisk * 1.04)), simulated: 78 },
    { period: '+14 Days', baseline: Math.min(100, Math.round(baselineRisk * 1.08)), simulated: 82 },
    { period: '+30 Days', baseline: Math.min(100, Math.round(baselineRisk * 1.15)), simulated: 85 },
  ];

  return (
    <div className="space-y-8 w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="text-xs font-mono uppercase tracking-widest text-brand-accent">
            Core Differentiator • Causal Perturbation Engine
          </div>
          <h2 className="text-2xl lg:text-3xl font-extrabold text-white tracking-tight mt-1">
            "What-If" Scenario Simulator
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Tweak contributing operational and environmental variables to test causal sensitivity and simulate risk deltas before real-world changes occur.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleResetSliders}
            className="px-4 py-2 rounded-xl bg-dark-850 hover:bg-dark-800 border border-white/10 text-slate-300 text-xs font-semibold flex items-center gap-1.5"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Reset Sliders</span>
          </button>

          <button
            onClick={handleRunSimulation}
            disabled={isSimulating}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-brand-primary to-brand-accent text-white text-xs font-bold shadow-glow-primary hover:opacity-90 disabled:opacity-50 transition-all flex items-center gap-2"
          >
            <Sparkles className="w-4 h-4" />
            <span>{isSimulating ? 'Recalculating...' : 'Simulate What-If'}</span>
          </button>
        </div>
      </div>

      {/* Simulator Control & Visualizations Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 6 cols: Live Sliders */}
        <div className="lg:col-span-6 glass-panel p-6 rounded-enterprise border border-white/10 bg-dark-900/60 space-y-5">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <SlidersHorizontal className="w-5 h-5 text-brand-primary" />
              <span>Factor Perturbation Controls</span>
            </h3>
            <span className="text-[11px] font-mono text-slate-400">Baseline Risk: {baselineRisk}/100</span>
          </div>

          <div className="space-y-4">
            {factors.map((f, idx) => (
              <div
                key={f.name}
                className="p-4 rounded-xl bg-dark-850/80 border border-white/5 space-y-2.5 transition-all hover:border-brand-primary/30"
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-200">{f.name}</span>
                  <span
                    className={`font-mono font-bold px-2 py-0.5 rounded ${
                      f.deltaPercent > 0
                        ? 'bg-risk-high/20 text-risk-high'
                        : f.deltaPercent < 0
                        ? 'bg-risk-low/20 text-risk-low'
                        : 'bg-dark-750 text-slate-400'
                    }`}
                  >
                    {f.deltaPercent > 0 ? `+${f.deltaPercent}%` : `${f.deltaPercent}%`}
                  </span>
                </div>

                <input
                  type="range"
                  min={-40}
                  max={40}
                  step={5}
                  value={f.deltaPercent}
                  onChange={(e) => {
                    handleFactorChange(idx, Number(e.target.value));
                    handleRunSimulation();
                  }}
                  className="w-full accent-brand-accent cursor-pointer"
                />

                <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                  <span>-40% Mitigation</span>
                  <span>Baseline (0%)</span>
                  <span>+40% Stress</span>
                </div>
              </div>
            ))}
          </div>

          <div className="p-3.5 rounded-xl bg-brand-primary/10 border border-brand-primary/20 text-[11px] text-slate-300 flex items-center gap-2">
            <Info className="w-4 h-4 text-brand-accent flex-shrink-0" />
            <span>Move any slider above to observe real-time causal delta and dynamic AI explanation.</span>
          </div>
        </div>

        {/* Right 6 cols: Before vs After Risk Comparison */}
        <div className="lg:col-span-6 space-y-6">
          {/* Dual Score Comparison Banner */}
          <div className="glass-panel p-6 rounded-enterprise border border-white/10 bg-dark-900/60">
            <h3 className="text-sm font-bold text-white mb-4">
              Baseline vs Simulated Risk Outcome
            </h3>

            <div className="grid grid-cols-2 gap-4 items-center text-center">
              {/* Baseline */}
              <div className="p-4 rounded-xl bg-dark-850 border border-white/5 flex flex-col items-center">
                <span className="text-xs text-slate-400 font-medium">Baseline Risk</span>
                <div className="mt-2 text-3xl font-extrabold text-slate-200 font-mono">
                  {baselineRisk}
                </div>
                <div className="mt-1">
                  <StatusBadge level={simulationResult?.baselineLevel || 'HIGH'} size="sm" />
                </div>
              </div>

              {/* Simulated */}
              <div className="p-4 rounded-xl bg-dark-850 border border-brand-primary/40 flex flex-col items-center relative overflow-hidden shadow-glow-primary/20">
                <span className="text-xs text-brand-accent font-medium">Simulated Risk</span>
                <div className="mt-2 text-3xl font-extrabold text-white font-mono">
                  {simulationResult?.simulatedRisk || 84}
                </div>
                <div className="mt-1 flex items-center gap-2">
                  <StatusBadge level={simulationResult?.simulatedLevel || 'CRITICAL'} size="sm" />
                  <span
                    className={`text-xs font-mono font-bold ${
                      (simulationResult?.delta || 0) >= 0 ? 'text-risk-high' : 'text-risk-low'
                    }`}
                  >
                    ({simulationResult?.deltaSign || '+12'} pts)
                  </span>
                </div>
              </div>
            </div>

            {/* AI Causal Explanation Callout */}
            {simulationResult && (
              <div className="mt-5 p-4 rounded-xl bg-dark-850/90 border border-brand-primary/30 space-y-1.5">
                <div className="flex items-center gap-2 text-xs font-mono font-bold text-brand-accent">
                  <Brain className="w-4 h-4" />
                  <span>AI Causal Explanation</span>
                </div>
                <p className="text-xs text-slate-200 leading-relaxed">
                  {simulationResult.explanation}
                </p>
              </div>
            )}
          </div>

          {/* Forecasted Trajectory Delta Chart */}
          <div className="glass-panel p-6 rounded-enterprise border border-white/10 bg-dark-900/60 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-white font-mono uppercase">
                Forecasted Trajectory Comparison
              </h4>
              <div className="flex items-center gap-3 text-xs font-mono">
                <span className="flex items-center gap-1.5 text-slate-400">
                  <span className="w-2.5 h-0.5 bg-slate-400" /> Baseline
                </span>
                <span className="flex items-center gap-1.5 text-brand-accent">
                  <span className="w-2.5 h-0.5 bg-brand-accent" /> Simulated
                </span>
              </div>
            </div>

            <div className="h-44 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="period" stroke="#64748B" fontSize={11} tickLine={false} />
                  <YAxis stroke="#64748B" fontSize={11} domain={[20, 100]} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0B0F17',
                      borderColor: 'rgba(99,102,241,0.4)',
                      borderRadius: '8px',
                      fontSize: '12px',
                    }}
                  />
                  <Line type="monotone" dataKey="baseline" stroke="#64748B" strokeWidth={2} dot={{ r: 3 }} />
                  <Line type="monotone" dataKey="simulated" stroke="#06B6D4" strokeWidth={2.5} dot={{ r: 4, fill: '#06B6D4' }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      {/* Simulated Adaptive Action Recommendations */}
      {simulationResult?.simulatedRecommendations && (
        <div className="glass-panel p-6 sm:p-8 rounded-enterprise border border-white/10 bg-dark-900/60 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
                <Target className="w-5 h-5 text-risk-low" />
                <span>Simulated Countermeasures & Recommended Action Plan</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Dynamic adaptations synthesized by RiskLens to neutralize the simulated risk elevation
              </p>
            </div>

            <button
              onClick={() => navigate('/decisions')}
              className="px-4 py-2 rounded-xl bg-risk-low text-dark-950 font-bold text-xs shadow-glow-low/30 hover:bg-emerald-400 transition-all flex items-center gap-1.5"
            >
              <span>Commit to Decision Center</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            {simulationResult.simulatedRecommendations.map((rec: any) => (
              <div key={rec.title} className="p-4 rounded-xl bg-dark-850 border border-white/5 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-brand-primary/20 text-brand-accent">
                    {rec.priority}
                  </span>
                  <span className="text-xs font-mono font-bold text-risk-low">
                    {rec.impact}
                  </span>
                </div>
                <h4 className="text-xs font-bold text-white">{rec.title}</h4>
                <p className="text-[11px] text-slate-300">{rec.actionRequired}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
