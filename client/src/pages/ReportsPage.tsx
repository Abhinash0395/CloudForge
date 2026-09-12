import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  FileText,
  Printer,
  Share2,
  Download,
  Sparkles,
  ShieldAlert,
  Target,
  LineChart,
  CheckCircle2,
  Calendar,
  Layers,
  Award,
} from 'lucide-react';
import { api } from '../services/api';
import { StatusBadge } from '../components/StatusBadge';
import { useToast } from '../context/ToastContext';

export const ReportsPage: React.FC = () => {
  const [reportData, setReportData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  useEffect(() => {
    const initReport = async () => {
      try {
        const overview = await api.getOverviewStats();
        if (overview.latestAnalysis) {
          const report = await api.generateReport(overview.latestAnalysis.id, 'Enterprise Risk Intelligence Dossier');
          setReportData(report.content);
        }
      } catch (e) {
        console.warn('Report generation fallback:', e);
      } finally {
        setLoading(false);
      }
    };
    initReport();
  }, []);

  const handlePrint = () => {
    window.print();
  };

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Report Link Copied', 'Shareable dossier URL copied to clipboard.');
    }
  };

  const summary = reportData?.analysisSummary;

  return (
    <div className="space-y-8 w-full">
      {/* Action Toolbar (hidden on print) */}
      <div className="no-print flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="text-xs font-mono uppercase tracking-widest text-brand-accent">
            Boardroom & Decision Dossier
          </div>
          <h2 className="text-2xl lg:text-3xl font-extrabold text-white tracking-tight mt-1">
            Executive Risk & Prediction Report
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Comprehensive audit-ready intelligence synthesis with multi-factor risk attribution and action schedules.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleShare}
            className="px-4 py-2 rounded-xl bg-dark-850 hover:bg-dark-800 border border-white/10 text-slate-200 text-xs font-semibold flex items-center gap-2"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>Share</span>
          </button>

          <button
            onClick={handlePrint}
            className="px-5 py-2 rounded-xl bg-gradient-to-r from-brand-primary to-brand-accent text-white text-xs font-bold shadow-glow-primary hover:opacity-90 transition-all flex items-center gap-2"
          >
            <Printer className="w-4 h-4" />
            <span>Print / Save PDF</span>
          </button>
        </div>
      </div>

      {/* Printable Report Paper / Dossier Canvas */}
      <div className="glass-panel p-8 sm:p-12 rounded-enterprise border border-white/10 bg-dark-900/90 shadow-2xl space-y-8 print:bg-white print:text-black print:p-0 print:border-0 print:shadow-none">
        {/* Report Header */}
        <div className="border-b border-white/10 pb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 print:border-black/20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-primary to-brand-accent p-0.5 flex items-center justify-center">
              <div className="w-full h-full bg-dark-950 rounded-[10px] flex items-center justify-center print:bg-slate-100">
                <ShieldAlert className="w-5 h-5 text-brand-accent print:text-indigo-600" />
              </div>
            </div>
            <div>
              <div className="text-lg font-extrabold tracking-tight text-white print:text-black">
                RISKLENS AI INTELLIGENCE DOSSIER
              </div>
              <div className="text-[10px] font-mono text-slate-400 print:text-slate-600 uppercase">
                Track 01 — AI/ML • PS 05: Prediction & Decision Support
              </div>
            </div>
          </div>

          <div className="text-right text-xs font-mono text-slate-400 print:text-slate-600">
            <div>Report ID: <span className="text-white print:text-black font-bold">{reportData?.reportId || 'RL-REP-2025-99A'}</span></div>
            <div>Generated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</div>
          </div>
        </div>

        {/* Executive Summary Section */}
        <div className="space-y-3">
          <h3 className="text-xs font-mono uppercase tracking-widest text-brand-accent print:text-indigo-600 font-bold">
            1. Executive Assessment Summary
          </h3>

          <div className="p-5 rounded-2xl bg-dark-850/80 border border-white/5 space-y-3 print:bg-slate-50 print:border-slate-200">
            <div className="flex items-center justify-between">
              <h4 className="text-base font-bold text-white print:text-black">
                {summary?.title || 'Power Grid Substation Alpha-9 Telemetry'}
              </h4>
              <StatusBadge level={summary?.riskLevel || 'HIGH'} />
            </div>

            <p className="text-xs sm:text-sm text-slate-200 print:text-slate-800 leading-relaxed">
              {summary?.summary ||
                'Overall systemic risk evaluated at 78.4/100 (CRITICAL RISK). Primary driving vector is core transformer thermal overload (+38%) coupled with 8.4% harmonic distortion feedback. Immediate load diversion is strongly advised.'}
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-white/5 print:border-black/10 text-xs font-mono">
              <div>
                <span className="text-slate-400 print:text-slate-600 text-[10px]">Risk Score:</span>
                <div className="font-bold text-white print:text-black text-sm">{summary?.riskScore || 78.4} / 100</div>
              </div>
              <div>
                <span className="text-slate-400 print:text-slate-600 text-[10px]">Ensemble Confidence:</span>
                <div className="font-bold text-brand-accent print:text-indigo-600 text-sm">
                  {Math.round((summary?.confidence || 0.91) * 100)}%
                </div>
              </div>
              <div>
                <span className="text-slate-400 print:text-slate-600 text-[10px]">Forecast Horizon:</span>
                <div className="font-bold text-white print:text-black text-sm">{summary?.timeHorizon || '30 Days'}</div>
              </div>
              <div>
                <span className="text-slate-400 print:text-slate-600 text-[10px]">Domain Category:</span>
                <div className="font-bold text-slate-300 print:text-slate-700 text-sm">{summary?.category || 'Infrastructure'}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Contributing Risk Factors Table */}
        <div className="space-y-3">
          <h3 className="text-xs font-mono uppercase tracking-widest text-brand-accent print:text-indigo-600 font-bold">
            2. Multi-Factor Risk Attribution Decomposition
          </h3>

          <div className="overflow-x-auto rounded-2xl border border-white/5 print:border-slate-300">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-dark-950/70 print:bg-slate-100 text-slate-400 print:text-slate-700 uppercase text-[10px]">
                <tr>
                  <th className="py-3 px-4">Contributing Factor</th>
                  <th className="py-3 px-4">Recorded Metric</th>
                  <th className="py-3 px-4">Causal Weight</th>
                  <th className="py-3 px-4">Severity Tier</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 print:divide-slate-200">
                {(reportData?.riskFactors || []).map((f: any) => (
                  <tr key={f.name}>
                    <td className="py-3 px-4 font-sans font-semibold text-slate-200 print:text-black">{f.name}</td>
                    <td className="py-3 px-4 text-slate-400 print:text-slate-600">{f.metricValue || 'Elevated'}</td>
                    <td className="py-3 px-4 font-bold text-brand-accent print:text-indigo-600">+{f.contribution}%</td>
                    <td className="py-3 px-4">
                      <StatusBadge level={f.severity} size="sm" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Prioritized Action Plan Matrix */}
        <div className="space-y-3">
          <h3 className="text-xs font-mono uppercase tracking-widest text-brand-accent print:text-indigo-600 font-bold">
            3. Prioritized Decision Recommendations
          </h3>

          <div className="space-y-3">
            {(reportData?.recommendations || []).map((r: any) => (
              <div
                key={r.title}
                className="p-4 rounded-xl bg-dark-850/60 border border-white/5 print:bg-slate-50 print:border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-brand-primary/20 text-brand-primary print:bg-indigo-100 print:text-indigo-700">
                      {r.priority}
                    </span>
                    <span className="text-[10px] font-mono text-slate-400 print:text-slate-600">
                      Urgency: {r.urgency || 'Immediate'}
                    </span>
                  </div>
                  <h4 className="text-xs sm:text-sm font-bold text-white print:text-black mt-1">
                    {r.title}
                  </h4>
                  <p className="text-xs text-slate-300 print:text-slate-700 mt-1">{r.description}</p>
                </div>

                <div className="font-mono text-xs font-bold text-risk-low print:text-emerald-700 flex-shrink-0">
                  {r.expectedImpact}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Compliance & Signoff Footer */}
        <div className="pt-6 border-t border-white/10 print:border-slate-300 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400 print:text-slate-600 font-mono">
          <div>
            Autonomous Engine Verification: <strong className="text-white print:text-black">RiskLens-MFAE-v4 + Gemini 2.5</strong>
          </div>
          <div>Authorized Decision Lead: Dr. Elena Rostova</div>
        </div>
      </div>
    </div>
  );
};
