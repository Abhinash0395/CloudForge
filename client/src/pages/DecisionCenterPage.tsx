import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Target,
  CheckCircle2,
  Bookmark,
  Sparkles,
  ShieldAlert,
  ArrowRight,
  TrendingDown,
  TrendingUp,
  Clock,
  SlidersHorizontal,
  Brain,
  XCircle,
  X,
  RefreshCw,
} from 'lucide-react';
import { api } from '../services/api';
import { Recommendation } from '../types';
import { StatusBadge } from '../components/StatusBadge';
import { useToast } from '../context/ToastContext';
import { TableSkeleton } from '../components/SkeletonLoaders';

export const DecisionCenterPage: React.FC = () => {
  const [decisions, setDecisions] = useState<{
    priority1: Recommendation[];
    priority2: Recommendation[];
    priority3: Recommendation[];
    totalActions: number;
  }>({ priority1: [], priority2: [], priority3: [], totalActions: 0 });

  const [loading, setLoading] = useState(true);
  const [explainModal, setExplainModal] = useState<Recommendation | null>(null);

  // What-If Simulation State directly integrated
  const [baselineRisk, setBaselineRisk] = useState<number>(72);
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulationResult, setSimulationResult] = useState<any>(null);

  const [factors, setFactors] = useState([
    { name: 'Rainfall & Precipitation Surge', originalContribution: 35.0, deltaPercent: 15 },
    { name: 'Catchment Water Level', originalContribution: 28.0, deltaPercent: 20 },
    { name: 'Drainage Culvert Capacity', originalContribution: 20.0, deltaPercent: -10 },
    { name: 'Soil Saturation Index', originalContribution: 17.0, deltaPercent: 5 },
  ]);

  const toast = useToast();

  const fetchDecisions = async () => {
    try {
      const data = await api.getDecisionQueue();
      setDecisions(data);
    } catch (err: any) {
      console.error('Failed to load decisions:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDecisions();
    handleRunSimulation();
  }, []);

  const handleUpdateStatus = async (id: string, status: 'ACCEPTED' | 'DISMISSED' | 'SAVED') => {
    try {
      await api.updateDecisionStatus(id, status);
      toast.success(
        status === 'ACCEPTED' ? 'Decision Action Accepted' : status === 'SAVED' ? 'Action Saved to Workspace' : 'Decision Dismissed',
        `Action status updated to ${status}.`
      );
      fetchDecisions();
    } catch (err: any) {
      toast.error('Action Failed', err.message);
    }
  };

  const handleFactorChange = (idx: number, delta: number) => {
    setFactors((prev) => {
      const next = [...prev];
      next[idx].deltaPercent = delta;
      return next;
    });
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
      }, 300);
    } catch (e: any) {
      setIsSimulating(false);
    }
  };

  const renderActionCard = (action: Recommendation, priorityLevel: string) => {
    const isAccepted = action.status === 'ACCEPTED';
    const isDismissed = action.status === 'DISMISSED';
    const isSaved = action.status === 'SAVED';

    return (
      <div
        key={action.id || action.title}
        className={`p-4 rounded-2xl navy-card transition-all ${
          isAccepted
            ? 'border-risk-low/50 bg-risk-low/10 shadow-glow-low/20'
            : isDismissed
            ? 'border-white/5 bg-dark-900/40 opacity-50'
            : isSaved
            ? 'border-amber-500/40 bg-amber-500/10'
            : 'border-white/10 hover:border-brand-primary/40'
        }`}
      >
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-brand-primary/20 text-brand-accent">
                {priorityLevel}
              </span>
              <span className="text-[10px] font-mono text-slate-400 flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {action.urgency || 'Immediate'}
              </span>
              {action.status !== 'PENDING' && (
                <span
                  className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                    isAccepted ? 'bg-risk-low text-dark-950' : isSaved ? 'bg-amber-400 text-dark-950' : 'bg-dark-750 text-slate-400'
                  }`}
                >
                  {action.status}
                </span>
              )}
            </div>

            <h4 className="text-sm font-bold text-white mt-2 leading-snug">
              {action.title}
            </h4>
            <p className="text-xs text-slate-300 mt-1 leading-relaxed">
              {action.description}
            </p>

            <div className="mt-2.5 flex items-center gap-2 text-xs font-mono">
              <span className="text-risk-low font-bold flex items-center gap-1">
                <TrendingDown className="w-3.5 h-3.5" />
                Expected Impact: {action.expectedImpact}
              </span>
            </div>
          </div>

          {/* Action Buttons: Accept / Save / Explain */}
          <div className="flex sm:flex-col items-center gap-2 flex-shrink-0 pt-2 sm:pt-0">
            <button
              onClick={() => action.id && handleUpdateStatus(action.id, 'ACCEPTED')}
              disabled={isAccepted}
              className="flex-1 sm:w-24 py-1.5 px-2.5 rounded-xl bg-risk-low/20 hover:bg-risk-low text-risk-low hover:text-dark-950 text-xs font-bold transition-all flex items-center justify-center gap-1"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{isAccepted ? 'Accepted' : 'Accept'}</span>
            </button>

            <button
              onClick={() => action.id && handleUpdateStatus(action.id, 'SAVED')}
              disabled={isSaved}
              className="flex-1 sm:w-24 py-1.5 px-2.5 rounded-xl bg-dark-750 hover:bg-dark-700 text-slate-300 hover:text-amber-400 border border-white/5 text-xs font-semibold transition-all flex items-center justify-center gap-1"
            >
              <Bookmark className="w-3.5 h-3.5" />
              <span>Save</span>
            </button>

            <button
              onClick={() => setExplainModal(action)}
              className="flex-1 sm:w-24 py-1.5 px-2.5 rounded-xl bg-dark-750 hover:bg-dark-700 text-brand-accent hover:text-white border border-white/5 text-xs font-semibold transition-all flex items-center justify-center gap-1"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Explain</span>
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-8 w-full pb-10">
      {/* Header */}
      <div>
        <div className="text-xs font-mono uppercase tracking-widest text-brand-accent">
          Strategic Decision Support (PS 05)
        </div>
        <h2 className="text-2xl lg:text-3xl font-extrabold text-white tracking-tight mt-1">
          Decision Center & Action Matrix
        </h2>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Prioritized operational decisions with quantified risk mitigation impact and interactive What-If scenario simulation.
        </p>
      </div>

      {/* Top Highlighted Recommendation Banner */}
      <div className="navy-card p-6 sm:p-7 rounded-2xl border border-risk-low/40 bg-gradient-to-r from-emerald-500/10 via-dark-850 to-dark-800 space-y-3">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-risk-low animate-ping" />
          <span className="text-xs font-mono uppercase font-bold text-risk-low tracking-wider">
            Primary Recommended Decision
          </span>
        </div>

        <h3 className="text-lg font-bold text-white">
          "Prioritize immediate monitoring of water level & rainfall patterns, and verify drainage culvert status."
        </h3>

        <p className="text-xs text-slate-300 max-w-3xl leading-relaxed">
          Executing this recommendation reduces peak flooding risk by an estimated <strong>-22.5% to -28.0%</strong>, keeping retention basins within standard absorption margins.
        </p>
      </div>

      {/* Interactive What-If Simulator Section */}
      <div className="navy-card p-6 rounded-2xl bg-dark-800/90 space-y-5 border border-brand-primary/30">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/10 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-brand-primary/20 text-brand-accent">
              <SlidersHorizontal className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">What-If Scenario Simulator</h3>
              <p className="text-xs text-slate-400">Change factors below to simulate real-time risk deltas</p>
            </div>
          </div>

          <button
            onClick={() => {
              setFactors([
                { name: 'Rainfall & Precipitation Surge', originalContribution: 35.0, deltaPercent: 0 },
                { name: 'Catchment Water Level', originalContribution: 28.0, deltaPercent: 0 },
                { name: 'Drainage Culvert Capacity', originalContribution: 20.0, deltaPercent: 0 },
                { name: 'Soil Saturation Index', originalContribution: 17.0, deltaPercent: 0 },
              ]);
              handleRunSimulation();
            }}
            className="px-3 py-1.5 rounded-lg bg-dark-750 hover:bg-dark-700 text-slate-300 text-xs font-semibold flex items-center gap-1.5 self-start sm:self-auto"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Reset Sliders</span>
          </button>
        </div>

        {/* Sliders Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {factors.map((f, idx) => (
            <div key={f.name} className="p-3.5 rounded-xl bg-dark-900/60 border border-white/5 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-200">{f.name}</span>
                <span
                  className={`font-mono font-bold px-2 py-0.5 rounded ${
                    f.deltaPercent > 0 ? 'text-red-400 bg-red-500/15' : f.deltaPercent < 0 ? 'text-emerald-400 bg-emerald-500/15' : 'text-slate-400'
                  }`}
                >
                  {f.deltaPercent > 0 ? `+${f.deltaPercent}%` : `${f.deltaPercent}%`}
                </span>
              </div>
              <input
                type="range"
                min={-30}
                max={30}
                step={5}
                value={f.deltaPercent}
                onChange={(e) => {
                  handleFactorChange(idx, Number(e.target.value));
                  handleRunSimulation();
                }}
                className="w-full accent-brand-accent cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                <span>-30% Reduction</span>
                <span>Normal</span>
                <span>+30% Elevation</span>
              </div>
            </div>
          ))}
        </div>

        {/* Simulation Output Card */}
        {simulationResult && (
          <div className="p-4 rounded-xl bg-dark-900 border border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-6">
              <div>
                <span className="text-[10px] uppercase font-mono text-slate-400">Current Risk</span>
                <div className="text-2xl font-extrabold text-slate-200 font-mono">{baselineRisk}</div>
              </div>

              <div className="text-2xl text-slate-600 font-mono">→</div>

              <div>
                <span className="text-[10px] uppercase font-mono text-brand-accent">Simulated Risk</span>
                <div className="text-2xl font-extrabold text-white font-mono flex items-center gap-2">
                  <span>{simulationResult.simulatedRisk}</span>
                  <span
                    className={`text-xs font-mono font-bold px-2 py-0.5 rounded ${
                      simulationResult.delta >= 0 ? 'bg-red-500/20 text-red-400' : 'bg-emerald-500/20 text-emerald-400'
                    }`}
                  >
                    {simulationResult.deltaSign} pts
                  </span>
                </div>
              </div>
            </div>

            <p className="text-xs text-slate-300 flex-1 max-w-md border-l border-white/10 pl-4 leading-relaxed">
              {simulationResult.explanation}
            </p>
          </div>
        )}
      </div>

      {/* Action Prioritization Tiers */}
      {loading ? (
        <TableSkeleton rows={4} />
      ) : (
        <div className="space-y-6">
          {/* Priority 1 */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-red-500" />
              <span>Priority 1: Immediate Critical Response</span>
            </h3>
            <div className="space-y-3">
              {decisions.priority1.length > 0 ? (
                decisions.priority1.map((a) => renderActionCard(a, 'Priority 1'))
              ) : (
                <div className="p-4 rounded-xl bg-dark-900/40 border border-white/5 text-xs text-slate-500 text-center">
                  No pending Priority 1 actions.
                </div>
              )}
            </div>
          </div>

          {/* Priority 2 */}
          <div className="space-y-3 pt-3 border-t border-white/5">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-500" />
              <span>Priority 2: 48-Hour Preventive Checks</span>
            </h3>
            <div className="space-y-3">
              {decisions.priority2.length > 0 ? (
                decisions.priority2.map((a) => renderActionCard(a, 'Priority 2'))
              ) : (
                <div className="p-4 rounded-xl bg-dark-900/40 border border-white/5 text-xs text-slate-500 text-center">
                  No pending Priority 2 actions.
                </div>
              )}
            </div>
          </div>

          {/* Priority 3 */}
          <div className="space-y-3 pt-3 border-t border-white/5">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>Priority 3: Readiness & Standby Preparation</span>
            </h3>
            <div className="space-y-3">
              {decisions.priority3.length > 0 ? (
                decisions.priority3.map((a) => renderActionCard(a, 'Priority 3'))
              ) : (
                <div className="p-4 rounded-xl bg-dark-900/40 border border-white/5 text-xs text-slate-500 text-center">
                  No pending Priority 3 actions.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Decision Explain Modal */}
      <AnimatePresence>
        {explainModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-lg bg-dark-850 border border-white/10 rounded-2xl shadow-2xl p-6 space-y-4"
            >
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-brand-purple" />
                  <h3 className="text-base font-bold text-white">Decision Rationale</h3>
                </div>
                <button onClick={() => setExplainModal(null)} className="p-1 text-slate-400 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-4 rounded-xl bg-dark-800 border border-white/5 space-y-2">
                <h4 className="text-sm font-bold text-white">{explainModal.title}</h4>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {explainModal.reasoning ||
                    'This action targets the highest causal contributor (precipitation surge and retention basin volume), mitigating systemic failure probability before threshold exceedance.'}
                </p>
                <div className="pt-2 text-xs font-mono font-bold text-risk-low">
                  Expected Impact: {explainModal.expectedImpact}
                </div>
              </div>

              <button
                onClick={() => setExplainModal(null)}
                className="w-full py-2.5 rounded-xl bg-brand-primary text-white text-xs font-bold"
              >
                Close Explanation
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
