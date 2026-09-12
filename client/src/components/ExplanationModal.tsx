import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles, Brain, Eye, TrendingUp, AlertTriangle, CheckCircle2, ShieldAlert } from 'lucide-react';
import { StatusBadge } from './StatusBadge';

interface ExplanationModalProps {
  isOpen: boolean;
  onClose: () => void;
  analysis?: any;
}

export const ExplanationModal: React.FC<ExplanationModalProps> = ({ isOpen, onClose, analysis }) => {
  if (!isOpen) return null;

  const riskScore = analysis?.riskScore || 72;
  const riskLevel = analysis?.riskLevel || 'HIGH';
  const confidence = analysis?.confidence || 0.87;

  const factors = analysis?.riskFactors && analysis.riskFactors.length > 0
    ? analysis.riskFactors
    : [
        { name: 'Data anomaly & Precipitation Surge', contribution: 24, explanation: 'Unusual +24% increase in precipitation rate compared with historical 30-day average.' },
        { name: 'Environmental condition & Watershed Saturation', contribution: 18, explanation: 'Soil moisture saturation at 88% reduces natural absorption capacity.' },
        { name: 'Historical pattern recurrence', contribution: 15, explanation: 'Correlates with previous urban flood signatures in regional catchment sector.' },
        { name: 'Operational drainage throughput', contribution: 15, explanation: 'Drainage culverts operating at 92% capacity limit.' },
      ];

  const explainSteps = [
    {
      title: 'What the system detected',
      icon: Eye,
      color: 'text-cyan-400',
      text: 'The analytical ensemble detected sudden non-linear divergence in precipitation volume and rapid elevation in low-lying retention basin water levels.',
    },
    {
      title: 'Main contributing factors',
      icon: TrendingUp,
      color: 'text-risk-high',
      text: 'Data anomaly (+24%) and extreme environmental saturation (+18%) account for over 42% of total systemic vulnerability.',
    },
    {
      title: 'Why it matters',
      icon: AlertTriangle,
      color: 'text-amber-400',
      text: 'Compounding runoff exceeds gravity-drainage tolerance, raising flooding probability from a nominal 8% to over 78% in the next analysis window.',
    },
    {
      title: 'Recommended response',
      icon: CheckCircle2,
      color: 'text-risk-low',
      text: 'Prioritize monitoring water level and rainfall patterns, inspect drainage valve status, and alert regional emergency response units.',
    },
  ];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="w-full max-w-2xl bg-dark-850 border border-white/10 rounded-2xl shadow-2xl p-6 sm:p-8 space-y-6 max-h-[90vh] overflow-y-auto"
        >
          {/* Modal Header */}
          <div className="flex items-start justify-between border-b border-white/10 pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-brand-primary/20 text-brand-accent">
                <Brain className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[10px] font-mono text-brand-accent uppercase font-bold tracking-widest">
                  Explainable AI (XAI)
                </span>
                <h3 className="text-lg font-bold text-white">Why Did AI Make This Prediction?</h3>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-all"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Risk Level Callout */}
          <div className="p-4 rounded-xl bg-dark-800 border border-white/5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <StatusBadge level={riskLevel} />
              <div>
                <div className="text-xs font-bold text-white">System Risk: {riskScore} / 100</div>
                <div className="text-[11px] text-slate-400">Confidence: {Math.round(confidence * 100)}% • MFAE-v4 + Gemini Reasoning</div>
              </div>
            </div>
          </div>

          {/* Factor Contributions */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-300 uppercase font-mono">Factor Contribution Weights</h4>
            <div className="space-y-2.5">
              {factors.map((f: any) => (
                <div key={f.name} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-200 font-semibold">{f.name}</span>
                    <span className="font-mono font-bold text-brand-accent">+{f.contribution}%</span>
                  </div>
                  <div className="w-full bg-dark-900 h-2 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-brand-primary to-brand-accent rounded-full"
                      style={{ width: `${Math.min(100, f.contribution * 3)}%` }}
                    />
                  </div>
                  <p className="text-[11px] text-slate-400">{f.explanation}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Causal Narrative */}
          <div className="space-y-3 pt-2">
            <h4 className="text-xs font-bold text-slate-300 uppercase font-mono">Causal Reasoning Chain</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {explainSteps.map((step) => {
                const Icon = step.icon;
                return (
                  <div key={step.title} className="p-3.5 rounded-xl bg-dark-800 border border-white/5 space-y-1.5">
                    <div className="flex items-center gap-2">
                      <Icon className={`w-4 h-4 ${step.color}`} />
                      <span className="text-xs font-bold text-white">{step.title}</span>
                    </div>
                    <p className="text-[11px] text-slate-300 leading-relaxed">{step.text}</p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Modal Footer */}
          <div className="pt-2">
            <button
              onClick={onClose}
              className="w-full py-2.5 rounded-xl bg-brand-primary hover:bg-brand-primary/90 text-white font-bold text-xs transition-all"
            >
              Close Explanation
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
