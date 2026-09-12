import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Compass,
  Zap,
  Droplets,
  Cpu,
  Truck,
  Activity,
  ArrowRight,
  ShieldAlert,
  Target,
  Sparkles,
  CheckCircle2,
  Play,
  RotateCw,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { Scenario, Analysis } from '../types';
import { StatusBadge } from '../components/StatusBadge';
import { PipelineAnimation } from '../components/PipelineAnimation';
import { useToast } from '../context/ToastContext';
import { TableSkeleton } from '../components/SkeletonLoaders';

export const DemoScenariosPage: React.FC = () => {
  const [scenarios, setScenarios] = useState<Scenario[]>([]);
  const [loading, setLoading] = useState(true);
  const [runningId, setRunningId] = useState<string | null>(null);
  const [activeAnalysis, setActiveAnalysis] = useState<Analysis | null>(null);
  const toast = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchScenarios = async () => {
      try {
        const data = await api.getScenarios();
        setScenarios(data);
      } catch (e) {
        console.error('Failed to load scenarios:', e);
      } finally {
        setLoading(false);
      }
    };
    fetchScenarios();
  }, []);

  const getScenarioIcon = (iconName: string) => {
    switch (iconName) {
      case 'Zap':
        return <Zap className="w-6 h-6 text-amber-400" />;
      case 'Droplets':
        return <Droplets className="w-6 h-6 text-blue-400" />;
      case 'Cpu':
        return <Cpu className="w-6 h-6 text-brand-primary" />;
      case 'Truck':
        return <Truck className="w-6 h-6 text-emerald-400" />;
      default:
        return <Activity className="w-6 h-6 text-brand-accent" />;
    }
  };

  const handleRunScenario = async (scenario: Scenario) => {
    setRunningId(scenario.id);
    setActiveAnalysis(null);

    try {
      const result = await api.runScenario(scenario.id);
      setTimeout(() => {
        setActiveAnalysis(result);
        setRunningId(null);
        toast.success(
          `Scenario Executed: ${scenario.name}`,
          `Evaluated Risk: ${result.riskScore}/100 (${result.riskLevel})`
        );
      }, 1500);
    } catch (err: any) {
      setRunningId(null);
      toast.error('Execution Failed', err.message);
    }
  };

  return (
    <div className="space-y-8 w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="text-xs font-mono uppercase tracking-widest text-brand-accent">
            Curated Hackathon Showcase
          </div>
          <h2 className="text-2xl lg:text-3xl font-extrabold text-white tracking-tight mt-1">
            Live Scenario Center
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Click "Run Scenario" to trigger complete autonomous multi-factor analysis, future risk projections, and decision action matrices.
          </p>
        </div>

        {activeAnalysis && (
          <button
            onClick={() => setActiveAnalysis(null)}
            className="px-4 py-2 rounded-xl bg-dark-850 hover:bg-dark-800 border border-white/10 text-slate-300 text-xs font-semibold flex items-center gap-2"
          >
            <RotateCw className="w-3.5 h-3.5" />
            <span>Reset Demo View</span>
          </button>
        )}
      </div>

      {/* Pipeline Loader during Scenario Run */}
      {runningId && <PipelineAnimation speedMs={240} />}

      {/* Scenario Execution Result Banner */}
      {activeAnalysis && !runningId && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass-panel p-6 sm:p-8 rounded-enterprise border border-brand-primary/40 bg-gradient-to-r from-brand-primary/20 via-dark-850 to-dark-900 shadow-2xl space-y-6"
        >
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-2">
                <StatusBadge level={activeAnalysis.riskLevel} />
                <span className="text-xs font-mono text-brand-accent font-bold">
                  Score: {activeAnalysis.riskScore}/100
                </span>
                <span className="text-xs font-mono text-slate-400">
                  • Confidence: {Math.round(activeAnalysis.confidence * 100)}%
                </span>
              </div>
              <h3 className="text-xl font-extrabold text-white mt-2">{activeAnalysis.title}</h3>
              <p className="text-xs sm:text-sm text-slate-200 mt-1 leading-relaxed max-w-3xl">
                {activeAnalysis.summary}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto flex-shrink-0">
              <button
                onClick={() => navigate('/decisions')}
                className="px-4 py-2.5 rounded-xl bg-risk-low text-dark-950 font-bold text-xs shadow-glow-low/30 hover:bg-emerald-400 transition-all flex items-center justify-center gap-2"
              >
                <Target className="w-4 h-4" />
                <span>Decision Center</span>
              </button>
              <button
                onClick={() => navigate('/simulator')}
                className="px-4 py-2.5 rounded-xl bg-dark-800 hover:bg-dark-750 border border-white/10 text-white text-xs font-semibold transition-all flex items-center justify-center gap-2"
              >
                <span>Simulate What-If</span>
              </button>
            </div>
          </div>

          {/* Quick Breakdown Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-white/10">
            <div className="space-y-2">
              <span className="text-xs font-bold text-white font-mono uppercase">Primary Risk Factors:</span>
              {activeAnalysis.riskFactors.slice(0, 3).map((f) => (
                <div key={f.name} className="p-3 rounded-xl bg-dark-850/80 text-xs flex justify-between">
                  <span className="text-slate-200">{f.name}</span>
                  <span className="font-mono font-bold text-brand-accent">+{f.contribution}%</span>
                </div>
              ))}
            </div>

            <div className="space-y-2">
              <span className="text-xs font-bold text-white font-mono uppercase">Top Recommended Decisions:</span>
              {activeAnalysis.recommendations.slice(0, 2).map((r) => (
                <div key={r.title} className="p-3 rounded-xl bg-dark-850/80 text-xs space-y-1">
                  <div className="flex justify-between font-bold text-white">
                    <span>{r.title}</span>
                    <span className="text-risk-low font-mono">{r.expectedImpact}</span>
                  </div>
                  <p className="text-[11px] text-slate-400">{r.description}</p>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      )}

      {/* 5 Scenario Cards Grid */}
      {loading ? (
        <TableSkeleton rows={5} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4 3xl:grid-cols-5 gap-6">
          {scenarios.map((scenario) => {
            const isCurrentRunning = runningId === scenario.id;
            const parsedData = JSON.parse(scenario.demoData || '{}');

            return (
              <div
                key={scenario.id}
                className="glass-panel p-6 rounded-enterprise border border-white/5 hover:border-brand-primary/40 transition-all flex flex-col justify-between bg-dark-900/60 group"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="p-3 rounded-2xl bg-dark-800 border border-white/5 group-hover:scale-105 transition-transform">
                      {getScenarioIcon(scenario.icon)}
                    </div>
                    <StatusBadge
                      level={scenario.baselineRisk > 75 ? 'CRITICAL' : scenario.baselineRisk > 50 ? 'HIGH' : 'MODERATE'}
                      size="sm"
                    />
                  </div>

                  <div>
                    <span className="text-[10px] font-mono uppercase tracking-wider text-brand-accent font-bold">
                      {scenario.category}
                    </span>
                    <h3 className="text-base font-bold text-white mt-1 leading-snug group-hover:text-brand-accent transition-colors">
                      {scenario.name}
                    </h3>
                    <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                      {scenario.description}
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-dark-850/90 border border-white/5 space-y-1.5 text-xs font-mono">
                    <div className="flex justify-between text-slate-400 text-[11px]">
                      <span>Operational Load:</span>
                      <span className="text-white font-bold">{parsedData.currentValue || 75}%</span>
                    </div>
                    <div className="flex justify-between text-slate-400 text-[11px]">
                      <span>Rate of Change:</span>
                      <span className="text-risk-high font-bold">+{parsedData.changeRate || 18}%/hr</span>
                    </div>
                    <div className="flex justify-between text-slate-400 text-[11px]">
                      <span>Prior Incidents:</span>
                      <span className="text-slate-200">{parsedData.previousIncidents || 2} Recorded</span>
                    </div>
                  </div>
                </div>

                <div className="pt-5 mt-4 border-t border-white/5">
                  <button
                    onClick={() => handleRunScenario(scenario)}
                    disabled={Boolean(runningId)}
                    className="w-full py-2.5 px-4 rounded-xl bg-brand-primary hover:bg-indigo-600 disabled:opacity-50 text-white font-bold text-xs shadow-glow-primary hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>{isCurrentRunning ? 'Executing Pipeline...' : 'Run Scenario'}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
