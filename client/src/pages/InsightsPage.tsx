import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Activity,
  AlertCircle,
  AlertTriangle,
  TrendingUp,
  Sparkles,
  Target,
  Filter,
  CheckCircle2,
  Clock,
  Layers,
  Search,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { Insight } from '../types';
import { StatusBadge } from '../components/StatusBadge';
import { TableSkeleton } from '../components/SkeletonLoaders';

export const InsightsPage: React.FC = () => {
  const [insights, setInsights] = useState<Insight[]>([]);
  const [severityFilter, setSeverityFilter] = useState<string>('ALL');
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const navigate = useNavigate();

  const fetchInsights = async () => {
    setLoading(true);
    try {
      const data = await api.getInsights({
        severity: severityFilter === 'ALL' ? undefined : severityFilter,
      });
      setInsights(data);
    } catch (e) {
      console.error('Failed to load insights:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInsights();
  }, [severityFilter]);

  const filtered = insights.filter(
    (ins) =>
      ins.title.toLowerCase().includes(search.toLowerCase()) ||
      ins.description.toLowerCase().includes(search.toLowerCase()) ||
      (ins.affectedFactor && ins.affectedFactor.toLowerCase().includes(search.toLowerCase()))
  );

  const getInsightIcon = (type: string, severity: string) => {
    if (severity === 'CRITICAL') return <AlertCircle className="w-5 h-5 text-risk-critical" />;
    if (type === 'TREND') return <TrendingUp className="w-5 h-5 text-brand-accent" />;
    if (type === 'RECOMMENDATION') return <Target className="w-5 h-5 text-risk-low" />;
    return <Sparkles className="w-5 h-5 text-brand-primary" />;
  };

  return (
    <div className="space-y-8 w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="text-xs font-mono uppercase tracking-widest text-brand-accent">
            Autonomous Stream Intelligence
          </div>
          <h2 className="text-2xl lg:text-3xl font-extrabold text-white tracking-tight mt-1">
            Real-Time AI Intelligence Feed
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Live stream of anomalies, emerging telemetry trends, and automated mitigation suggestions.
          </p>
        </div>

        <button
          onClick={() => navigate('/analysis')}
          className="px-4 py-2.5 rounded-xl bg-brand-primary text-white text-xs font-bold shadow-glow-primary hover:bg-brand-primary/90 transition-all flex items-center gap-2"
        >
          <Sparkles className="w-4 h-4" />
          <span>Ingest New Telemetry</span>
        </button>
      </div>

      {/* Filters & Search Toolbar */}
      <div className="glass-panel p-4 rounded-2xl border border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4 bg-dark-900/60">
        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          <span className="text-xs text-slate-400 font-mono mr-1">Severity:</span>
          {['ALL', 'CRITICAL', 'HIGH', 'MODERATE', 'LOW'].map((sev) => (
            <button
              key={sev}
              onClick={() => setSeverityFilter(sev)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                severityFilter === sev
                  ? 'bg-brand-primary text-white shadow-glow-primary'
                  : 'bg-dark-850 text-slate-400 hover:text-white hover:bg-dark-800'
              }`}
            >
              {sev}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Filter insights..."
            className="w-full pl-9 pr-3 py-2 rounded-xl bg-dark-800 border border-white/10 text-white text-xs placeholder-slate-500 focus:outline-none focus:border-brand-primary"
          />
        </div>
      </div>

      {/* Insights Feed List */}
      {loading ? (
        <TableSkeleton rows={6} />
      ) : filtered.length === 0 ? (
        <div className="glass-panel p-12 text-center text-slate-400 rounded-enterprise border border-white/5">
          <Activity className="w-10 h-10 text-slate-600 mx-auto mb-3" />
          <p className="text-sm font-semibold text-slate-300">No matching insights found</p>
          <p className="text-xs text-slate-500 mt-1">Try broadening your severity filter or search keywords.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((item) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-panel p-5 rounded-2xl border border-white/5 hover:border-brand-primary/30 transition-all bg-dark-900/70 space-y-3"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-dark-800 border border-white/5 flex-shrink-0">
                    {getInsightIcon(item.type, item.severity)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-brand-primary/20 text-brand-accent font-bold">
                        {item.type}
                      </span>
                      <StatusBadge level={item.severity} size="sm" />
                    </div>
                    <h4 className="text-sm font-bold text-white mt-1">{item.title}</h4>
                  </div>
                </div>

                <span className="text-[11px] font-mono text-slate-400 flex items-center gap-1 sm:self-start">
                  <Clock className="w-3 h-3" />
                  {new Date(item.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed">{item.description}</p>

              {(item.affectedFactor || item.recommendedAction) && (
                <div className="p-3 rounded-xl bg-dark-850/80 border border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs font-mono">
                  {item.affectedFactor && (
                    <div className="text-slate-400">
                      Primary Factor: <span className="text-brand-accent font-bold">{item.affectedFactor}</span>
                    </div>
                  )}
                  {item.recommendedAction && (
                    <div className="text-risk-low flex items-center gap-1.5">
                      <Target className="w-3.5 h-3.5 flex-shrink-0" />
                      <span className="truncate">Action: {item.recommendedAction}</span>
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};
