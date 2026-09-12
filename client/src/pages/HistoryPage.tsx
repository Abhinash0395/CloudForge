import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  History,
  Search,
  Filter,
  Columns,
  X,
  ArrowRight,
  TrendingUp,
  ShieldAlert,
  Target,
  Sparkles,
  Layers,
  ChevronRight,
} from 'lucide-react';
import { api } from '../services/api';
import { Analysis } from '../types';
import { StatusBadge } from '../components/StatusBadge';
import { TableSkeleton } from '../components/SkeletonLoaders';
import { useToast } from '../context/ToastContext';

export const HistoryPage: React.FC = () => {
  const [analyses, setAnalyses] = useState<Analysis[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [modeFilter, setModeFilter] = useState<'ALL' | 'LIVE' | 'DEMO'>('ALL');

  // Compare mode state
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [showComparison, setShowComparison] = useState(false);
  const toast = useToast();

  const fetchAnalyses = async () => {
    setLoading(true);
    try {
      const data = await api.getAllAnalyses({
        category: categoryFilter === 'ALL' ? undefined : categoryFilter,
        search: search || undefined,
      });

      let filtered = data;
      if (modeFilter !== 'ALL') {
        filtered = data.filter((a) => (a.mode || 'DEMO') === modeFilter);
      }
      setAnalyses(filtered);
    } catch (e) {
      console.error('Failed to load history:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalyses();
  }, [categoryFilter, modeFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchAnalyses();
  };

  const handleToggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      if (prev.includes(id)) return prev.filter((item) => item !== id);
      if (prev.length >= 2) {
        toast.info('Comparison Limit', 'Select at most 2 analyses to compare.');
        return [prev[1], id];
      }
      return [...prev, id];
    });
  };

  const compareAnalyses = analyses.filter((a) => selectedIds.includes(a.id));

  return (
    <div className="space-y-8 w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="text-xs font-mono uppercase tracking-widest text-brand-accent">
            Historical Intelligence Archive
          </div>
          <h2 className="text-2xl lg:text-3xl font-extrabold text-white tracking-tight mt-1">
            Analysis History & Comparison
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Explore past operational telemetry evaluations, review long-term drift, or compare two runs side-by-side.
          </p>
        </div>

        {selectedIds.length === 2 && (
          <button
            onClick={() => setShowComparison(true)}
            className="px-4 py-2.5 rounded-xl bg-brand-primary text-white text-xs font-bold shadow-glow-primary hover:bg-brand-primary/90 transition-all flex items-center gap-2"
          >
            <Columns className="w-4 h-4" />
            <span>Compare 2 Selected Runs</span>
          </button>
        )}
      </div>

      {/* Filter & Search Bar */}
      <div className="glass-panel p-4 rounded-2xl border border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4 bg-dark-900/60">
        <form onSubmit={handleSearchSubmit} className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search titles, summaries, or categories..."
            className="w-full pl-9 pr-3 py-2 rounded-xl bg-dark-800 border border-white/10 text-white text-xs placeholder-slate-500 focus:outline-none focus:border-brand-primary"
          />
        </form>

        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          {/* Data Mode Filter */}
          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-dark-950/80 border border-white/5">
            <button
              onClick={() => setModeFilter('ALL')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                modeFilter === 'ALL'
                  ? 'bg-cyan-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              All Runs
            </button>
            <button
              onClick={() => setModeFilter('LIVE')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                modeFilter === 'LIVE'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-emerald-400 hover:text-white'
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>Live Real Data</span>
            </button>
            <button
              onClick={() => setModeFilter('DEMO')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                modeFilter === 'DEMO'
                  ? 'bg-amber-600 text-white shadow-sm'
                  : 'text-amber-400 hover:text-white'
              }`}
            >
              Demo Sandbox
            </button>
          </div>

          {/* Category Filter */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            {['ALL', 'Infrastructure', 'Environmental', 'Operational'].map((cat) => (
              <button
                key={cat}
                onClick={() => setCategoryFilter(cat)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  categoryFilter === cat
                    ? 'bg-cyan-600 text-white shadow-glow-primary'
                    : 'bg-dark-850 text-slate-400 hover:text-white hover:bg-dark-800'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* History Table */}
      {loading ? (
        <TableSkeleton rows={8} />
      ) : (
        <div className="glass-panel rounded-enterprise border border-white/10 bg-dark-900/60 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-white/10 text-slate-400 font-mono uppercase text-[10px] bg-dark-950/60">
                  <th className="py-3.5 px-4 w-12 text-center">Select</th>
                  <th className="py-3.5 px-4">Date / Time</th>
                  <th className="py-3.5 px-4">Scenario / Telemetry Stream</th>
                  <th className="py-3.5 px-4">Mode / Provenance</th>
                  <th className="py-3.5 px-4">Risk Score</th>
                  <th className="py-3.5 px-4">Risk Level</th>
                  <th className="py-3.5 px-4">Prediction Horizon</th>
                  <th className="py-3.5 px-4">Confidence</th>
                  <th className="py-3.5 px-4 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {analyses.map((analysis) => {
                  const isSelected = selectedIds.includes(analysis.id);
                  const isLive = analysis.mode === 'LIVE';

                  return (
                    <tr
                      key={analysis.id}
                      className={`hover:bg-brand-primary/5 transition-colors ${
                        isSelected ? 'bg-brand-primary/10' : ''
                      }`}
                    >
                      <td className="py-3.5 px-4 text-center">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleToggleSelect(analysis.id)}
                          className="rounded accent-brand-primary cursor-pointer w-4 h-4"
                        />
                      </td>
                      <td className="py-3.5 px-4 font-mono text-slate-400 text-[11px]">
                        {new Date(analysis.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-white">{analysis.title}</div>
                        <div className="text-[10px] text-cyan-400 font-mono flex items-center gap-1 mt-0.5">
                          <span>{analysis.category}</span>
                          {analysis.location && (
                            <>
                              <span className="text-slate-500">•</span>
                              <span className="text-slate-300">{analysis.location}</span>
                            </>
                          )}
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border inline-flex items-center gap-1 ${
                          isLive
                            ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                            : 'bg-amber-500/15 text-amber-400 border-amber-500/30'
                        }`}>
                          {isLive ? <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> : null}
                          {isLive ? 'LIVE DATA' : 'DEMO SANDBOX'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-mono font-bold text-white text-sm">
                        {analysis.riskScore}
                      </td>
                      <td className="py-3.5 px-4">
                        <StatusBadge level={analysis.riskLevel} size="sm" />
                      </td>
                      <td className="py-3.5 px-4 font-mono text-slate-300">
                        {analysis.timeHorizon || '30 Days'}
                      </td>
                      <td className="py-3.5 px-4 font-mono text-cyan-300">
                        {Math.round(analysis.confidence * 100)}%
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-bold">
                          COMPLETED
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Side-by-Side Comparison Modal */}
      <AnimatePresence>
        {showComparison && compareAnalyses.length === 2 && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-5xl glass-panel p-6 sm:p-8 rounded-enterprise border border-brand-primary/40 shadow-2xl bg-dark-900/95 space-y-6 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-brand-primary/20 text-brand-accent">
                    <Columns className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">Side-by-Side Telemetry Comparison</h3>
                    <p className="text-xs text-slate-400">Comparing multi-factor vectors across two analysis runs</p>
                  </div>
                </div>

                <button
                  onClick={() => setShowComparison(false)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Comparison Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {compareAnalyses.map((item, idx) => (
                  <div
                    key={item.id}
                    className="p-5 rounded-2xl glass-panel border border-white/10 bg-dark-850/80 space-y-4"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-brand-primary/20 text-brand-accent">
                        Analysis #{idx + 1}
                      </span>
                      <span className="text-xs font-mono text-slate-400">
                        {new Date(item.createdAt).toLocaleDateString()}
                      </span>
                    </div>

                    <h4 className="text-sm font-bold text-white">{item.title}</h4>

                    <div className="flex items-center justify-between p-3 rounded-xl bg-dark-800">
                      <div>
                        <div className="text-[10px] text-slate-400 font-mono">Risk Score:</div>
                        <div className="text-2xl font-extrabold font-mono text-white mt-0.5">
                          {item.riskScore} / 100
                        </div>
                      </div>
                      <StatusBadge level={item.riskLevel} />
                    </div>

                    <div className="space-y-1.5">
                      <span className="text-[10px] font-mono text-slate-400 uppercase font-bold">
                        Top Risk Factors:
                      </span>
                      {item.riskFactors.slice(0, 3).map((f) => (
                        <div key={f.name} className="p-2.5 rounded-lg bg-dark-800 text-xs flex justify-between">
                          <span className="text-slate-200">{f.name}</span>
                          <span className="font-mono font-bold text-brand-accent">+{f.contribution}%</span>
                        </div>
                      ))}
                    </div>

                    <div className="space-y-1.5">
                      <span className="text-[10px] font-mono text-slate-400 uppercase font-bold">
                        Primary Decision Action:
                      </span>
                      <div className="p-3 rounded-lg bg-risk-low/10 border border-risk-low/20 text-xs text-slate-200">
                        <div className="font-bold text-risk-low">{item.recommendations[0]?.title}</div>
                        <div className="text-[11px] text-slate-300 mt-0.5">{item.recommendations[0]?.expectedImpact}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="text-center pt-2">
                <button
                  onClick={() => setShowComparison(false)}
                  className="px-6 py-2.5 rounded-xl bg-dark-800 hover:bg-dark-750 text-white text-xs font-bold"
                >
                  Close Comparison
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
