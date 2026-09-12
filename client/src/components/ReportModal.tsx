import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Printer, ShieldAlert, Target, Sparkles, CheckCircle2 } from 'lucide-react';
import { StatusBadge } from './StatusBadge';

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  analysis?: any;
}

export const ReportModal: React.FC<ReportModalProps> = ({ isOpen, onClose, analysis }) => {
  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  const title = analysis?.title || 'Flood Risk Prediction — Urban Catchment Area';
  const riskScore = analysis?.riskScore || 72;
  const riskLevel = analysis?.riskLevel || 'HIGH';
  const confidence = analysis?.confidence || 0.87;
  const prediction = analysis?.prediction || 'Risk is likely to increase over the next analysis period due to compounding runoff.';
  const summary = analysis?.summary || 'Flood risk is higher than usual. Immediate monitoring and preventive action is recommended across drainage nodes.';

  const factors = analysis?.riskFactors && analysis.riskFactors.length > 0
    ? analysis.riskFactors
    : [
        { name: 'Data anomaly', contribution: 24, explanation: 'Precipitation surge +24% over 30-day baseline' },
        { name: 'Environmental condition', contribution: 18, explanation: 'Watershed soil moisture saturation at 88%' },
        { name: 'Historical pattern', contribution: 15, explanation: 'Correlates with past flash flood event signatures' },
        { name: 'Operational factor', contribution: 15, explanation: 'Drainage culverts operating at 92% capacity' },
      ];

  const recommendations = analysis?.recommendations && analysis.recommendations.length > 0
    ? analysis.recommendations
    : [
        { title: 'Monitor water level and rainfall patterns', priority: 'PRIORITY 1', impact: 'High impact' },
        { title: 'Check drainage system status', priority: 'PRIORITY 2', impact: 'Medium impact' },
        { title: 'Prepare emergency response team', priority: 'PRIORITY 3', impact: 'Medium impact' },
      ];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="w-full max-w-3xl bg-dark-850 border border-white/10 rounded-2xl shadow-2xl p-6 sm:p-8 space-y-6 max-h-[90vh] overflow-y-auto"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-primary to-brand-purple flex items-center justify-center">
                <ShieldAlert className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Risk Intelligence Report</h3>
                <p className="text-xs text-slate-400 font-mono">
                  Generated {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })} • PS 05
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handlePrint}
                className="px-3 py-1.5 rounded-lg bg-brand-primary hover:bg-brand-primary/90 text-white text-xs font-bold transition-all flex items-center gap-1.5"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print / Save PDF</span>
              </button>
              <button
                onClick={onClose}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Report Body */}
          <div className="space-y-5 print:text-black">
            {/* Summary */}
            <div className="p-4 rounded-xl bg-dark-800 border border-white/5 space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-white">{title}</h4>
                <StatusBadge level={riskLevel} />
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">{summary}</p>
              <div className="grid grid-cols-3 gap-2 pt-2 border-t border-white/5 text-xs font-mono">
                <div>
                  <span className="text-slate-400 text-[10px]">Risk Score:</span>
                  <div className="font-bold text-white">{riskScore} / 100</div>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px]">Confidence:</span>
                  <div className="font-bold text-brand-accent">{Math.round(confidence * 100)}%</div>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px]">Prediction:</span>
                  <div className="font-bold text-white truncate">{prediction}</div>
                </div>
              </div>
            </div>

            {/* Factors */}
            <div className="space-y-2">
              <h5 className="text-xs font-bold text-slate-300 uppercase font-mono">Contributing Risk Factors</h5>
              <div className="space-y-2">
                {factors.map((f: any) => (
                  <div key={f.name} className="p-3 rounded-lg bg-dark-800 border border-white/5 flex justify-between text-xs">
                    <div>
                      <span className="font-bold text-white">{f.name}</span>
                      <p className="text-[11px] text-slate-400 mt-0.5">{f.explanation}</p>
                    </div>
                    <span className="font-mono font-bold text-brand-accent ml-2 flex-shrink-0">+{f.contribution}%</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Recommendations */}
            <div className="space-y-2">
              <h5 className="text-xs font-bold text-slate-300 uppercase font-mono">Prioritized Decision Actions</h5>
              <div className="space-y-2">
                {recommendations.map((r: any) => (
                  <div key={r.title} className="p-3 rounded-lg bg-dark-800 border border-white/5 flex items-center justify-between text-xs">
                    <div>
                      <span className="font-bold text-white">{r.title}</span>
                      <div className="text-[10px] text-brand-primary font-mono mt-0.5">{r.priority}</div>
                    </div>
                    <span className="text-risk-low font-mono font-bold">{r.impact || 'High impact'}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
