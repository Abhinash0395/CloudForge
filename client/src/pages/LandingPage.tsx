import React from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ShieldAlert,
  Sparkles,
  ArrowRight,
  TrendingUp,
  Cpu,
  Layers,
  LineChart,
  Target,
  SlidersHorizontal,
  Compass,
  CheckCircle2,
  Lock,
  Zap,
  Award,
  ChevronRight,
  Eye,
} from 'lucide-react';
import { RiskScoreMeter } from '../components/RiskScoreMeter';

interface OutletContextType {
  onOpenJudgeDemo: () => void;
}

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const context = useOutletContext<OutletContextType>();

  const floatingBadges = [
    { title: 'Current Risk Score', val: '72 / 100', color: 'text-risk-high', delta: '+8 pts' },
    { title: 'Prediction Confidence', val: '87%', color: 'text-brand-accent', delta: 'High Precision' },
    { title: 'Critical Factors', val: '4 Extracted', color: 'text-rose-400', delta: 'Normalized' },
    { title: 'Recommended Actions', val: '6 Prioritized', color: 'text-risk-low', delta: '-22.5% Target' },
  ];

  const workflowSteps = [
    { num: '01', title: 'Connect Multi-Modal Data', desc: 'Ingest structured sensor telemetry, qualitative natural language incident logs, or computer vision scans.' },
    { num: '02', title: 'Feature Extraction & ML', desc: 'Multi-Factor Analytical Ensemble (MFAE-v4) extracts anomalies, baseline deviations, and rate-of-change.' },
    { num: '03', title: 'Forecasting & Risk Scoring', desc: 'Calculates standardized 0–100 risk score and projects multi-horizon time-series prediction curves.' },
    { num: '04', title: 'Explainable AI Attribution', desc: 'Gemini reasoning synthesizes glassbox causal breakdowns: "What the model saw", "What changed", and "Why it matters".' },
    { num: '05', title: 'Strategic Decision Triage', desc: 'Prioritized recommendations (Priority 1, 2, 3) with estimated risk reduction and human-in-the-loop action workflows.' },
  ];

  const intelligenceFeatures = [
    {
      icon: LineChart,
      title: 'Predictive Risk Forecasting',
      desc: 'Time-series forecasting over 7 to 90 days with expanding uncertainty envelopes and probability curves.',
      badge: 'PS 05 Core',
    },
    {
      icon: Sparkles,
      title: 'Explainable AI (XAI)',
      desc: 'Normalized feature contribution weights with plain-language causal narratives and technical model metadata.',
      badge: 'Glassbox AI',
    },
    {
      icon: SlidersHorizontal,
      title: 'What-If Scenario Simulator',
      desc: 'Perturb operational and environmental factors to simulate dynamic risk deltas and explore mitigation impact before real-world changes.',
      badge: 'Differentiator',
    },
    {
      icon: Target,
      title: 'Decision Center & Action Plans',
      desc: 'Prioritized decision matrix with estimated risk reduction percentages, urgency ratings, and actionable triage controls.',
      badge: 'Decision Support',
    },
    {
      icon: Eye,
      title: 'Computer Vision Intelligence',
      desc: 'Supporting visual anomaly and defect detection with direct bridge into the multi-factor risk scoring pipeline.',
      badge: 'Multi-Modal',
    },
    {
      icon: Compass,
      title: 'Live Scenario Center',
      desc: '5 one-click live scenarios spanning Infrastructure, Environmental, Operational, Resource, and Custom AI domains.',
      badge: 'Judge Ready',
    },
  ];

  return (
    <div className="relative overflow-hidden pt-6 pb-20">
      {/* Top Floating Navbar for Landing Page */}
      <nav className="w-full px-6 lg:px-12 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-primary to-brand-accent p-0.5 shadow-glow-primary/40 flex items-center justify-center">
            <div className="w-full h-full bg-dark-950 rounded-[10px] flex items-center justify-center">
              <ShieldAlert className="w-5 h-5 text-brand-accent" />
            </div>
          </div>
          <div>
            <div className="text-base font-extrabold tracking-wider text-white flex items-center gap-1.5">
              RISKLENS <span className="text-brand-accent font-mono">AI</span>
            </div>
            <div className="text-[10px] uppercase tracking-widest text-slate-400 font-mono">
              Predict. Understand. Decide.
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => context?.onOpenJudgeDemo()}
            className="hidden sm:flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-brand-primary to-brand-accent text-white text-xs font-bold shadow-glow-primary hover:opacity-90 transition-all"
          >
            <Award className="w-4 h-4" />
            <span>Judge Demo Mode</span>
          </button>
          <button
            onClick={() => navigate('/overview')}
            className="px-4 py-2 rounded-xl bg-dark-850 hover:bg-dark-800 border border-white/10 text-white text-xs font-semibold hover:border-brand-primary/40 transition-all flex items-center gap-1.5"
          >
            <span>Launch Dashboard</span>
            <ChevronRight className="w-4 h-4 text-brand-accent" />
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="w-full px-6 lg:px-12 pt-16 pb-24 text-center relative z-10">
        {/* Track / Problem Statement Pill */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-primary/15 border border-brand-primary/30 text-brand-accent text-xs font-mono font-semibold mb-6 shadow-glow-primary/20"
        >
          <span className="w-2 h-2 rounded-full bg-brand-accent animate-ping" />
          TRACK 01 — AI & ML • PRIMARY STATEMENT: PS 05 (PREDICTION & DECISION SUPPORT)
        </motion.div>

        {/* Main Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white max-w-4xl mx-auto leading-tight"
        >
          See the risk. <br />
          <span className="bg-gradient-to-r from-brand-primary via-indigo-300 to-brand-accent bg-clip-text text-transparent">
            Understand the cause.
          </span> <br />
          Make the right decision.
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="text-base sm:text-lg lg:text-xl text-slate-300 max-w-2xl mx-auto mt-6 leading-relaxed"
        >
          AI-powered prediction and decision intelligence that transforms complex structured data, telemetry, natural-language logs, and computer vision scans into actionable recommendations.
        </motion.p>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="flex flex-wrap items-center justify-center gap-4 mt-8"
        >
          <button
            onClick={() => navigate('/analysis')}
            className="px-6 py-3.5 rounded-xl bg-gradient-to-r from-brand-primary via-indigo-600 to-brand-accent text-white font-bold text-sm shadow-glow-primary hover:shadow-glow-cyan hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-2"
          >
            <span>Analyze Risk</span>
            <ArrowRight className="w-4 h-4" />
          </button>
          <button
            onClick={() => navigate('/scenarios')}
            className="px-6 py-3.5 rounded-xl bg-dark-850 hover:bg-dark-800 border border-white/10 hover:border-brand-primary/40 text-slate-200 font-bold text-sm hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-2"
          >
            <Compass className="w-4 h-4 text-brand-accent" />
            <span>Explore Demo Scenarios</span>
          </button>
        </motion.div>

        {/* Hero Interactive Visualization: Pipeline & Floating Cards */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-16 max-w-5xl mx-auto glass-panel p-6 sm:p-8 rounded-enterprise border border-brand-primary/30 shadow-2xl relative"
        >
          {/* Pipeline flow bar */}
          <div className="hidden md:flex items-center justify-between pb-6 border-b border-white/10 text-xs font-mono text-slate-400">
            <span className="flex items-center gap-1.5 text-brand-accent font-bold">
              <span className="w-2 h-2 rounded-full bg-brand-accent animate-pulse" /> INPUT DATA
            </span>
            <ArrowRight className="w-4 h-4 text-slate-600" />
            <span className="text-indigo-400 font-semibold">AI/ML ANALYSIS</span>
            <ArrowRight className="w-4 h-4 text-slate-600" />
            <span className="text-violet-400 font-semibold">PREDICTION</span>
            <ArrowRight className="w-4 h-4 text-slate-600" />
            <span className="text-risk-high font-semibold">RISK SCORE</span>
            <ArrowRight className="w-4 h-4 text-slate-600" />
            <span className="text-risk-low font-bold">DECISION ACTION</span>
          </div>

          {/* Visualization Grid: Central Risk Meter + 4 Floating Intelligence Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center pt-6">
            {/* Center Left: Interactive Gauge */}
            <div className="lg:col-span-5 flex flex-col items-center justify-center p-4 bg-dark-900/60 rounded-2xl border border-white/5">
              <RiskScoreMeter score={72} level="HIGH" delta={8.4} size={200} />
              <div className="mt-4 text-center">
                <span className="text-xs px-3 py-1 rounded-full bg-risk-high/20 border border-risk-high/40 text-risk-high font-bold font-mono">
                  HIGH RISK DETECTED
                </span>
                <p className="text-xs text-slate-400 mt-2 max-w-xs">
                  Harmonic transformer overload & ambient heatwave threshold breach.
                </p>
              </div>
            </div>

            {/* Right: Floating KPI cards */}
            <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
              {floatingBadges.map((badge) => (
                <div
                  key={badge.title}
                  className="glass-panel p-4 rounded-xl border border-white/10 hover:border-brand-primary/40 transition-all text-left bg-dark-850/60"
                >
                  <div className="text-xs text-slate-400 font-medium">{badge.title}</div>
                  <div className={`text-2xl font-extrabold font-mono mt-1 ${badge.color}`}>
                    {badge.val}
                  </div>
                  <div className="text-[11px] text-slate-400 font-mono mt-1 flex items-center gap-1">
                    <TrendingUp className="w-3 h-3 text-brand-accent" />
                    <span>{badge.delta}</span>
                  </div>
                </div>
              ))}

              {/* Recommended Decision Highlight */}
              <div className="sm:col-span-2 p-4 rounded-xl bg-risk-low/10 border border-risk-low/30 text-left flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-risk-low flex-shrink-0 mt-0.5" />
                <div>
                  <div className="text-xs font-bold text-risk-low uppercase tracking-wider font-mono">
                    Autonomous Recommendation
                  </div>
                  <div className="text-sm font-semibold text-slate-100 mt-0.5">
                    "Divert 30% Load to Substation Delta Backup & activate secondary cooling loop"
                  </div>
                  <div className="text-xs text-slate-300 mt-1">
                    Expected Outcome: <strong>-22.5% Systemic Risk Reduction</strong> within 48h.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* How It Works Workflow Section */}
      <section className="w-full px-6 lg:px-12 py-20 border-t border-white/5">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="text-xs uppercase font-mono tracking-widest text-brand-accent font-bold">
            The Decision Intelligence Loop
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white mt-2">
            How RiskLens AI Operates
          </h2>
          <p className="text-slate-400 text-sm mt-3">
            From raw structured telemetry to prioritized human decisions with zero black-box obscurity.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {workflowSteps.map((step) => (
            <div
              key={step.num}
              className="glass-panel p-5 rounded-2xl border border-white/5 hover:border-brand-primary/30 transition-all flex flex-col justify-between bg-dark-900/60"
            >
              <div>
                <span className="text-2xl font-black font-mono text-brand-primary/60">
                  {step.num}
                </span>
                <h3 className="text-sm font-bold text-white mt-2 leading-snug">
                  {step.title}
                </h3>
                <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                  {step.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Intelligence Features Grid */}
      <section className="w-full px-6 lg:px-12 py-20 border-t border-white/5">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="text-xs uppercase font-mono tracking-widest text-brand-accent font-bold">
            Full-Spectrum Capabilities
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white mt-2">
            Engineered for Prediction & Decision Support
          </h2>
          <p className="text-slate-400 text-sm mt-3">
            Built from first principles for Hackathon Track 01, Problem Statement 05.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {intelligenceFeatures.map((feat) => {
            const Icon = feat.icon;
            return (
              <div
                key={feat.title}
                className="glass-panel p-6 rounded-enterprise border border-white/5 hover:border-brand-primary/40 transition-all flex flex-col justify-between bg-dark-900/50 group"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 rounded-xl bg-dark-800 text-brand-accent group-hover:bg-brand-primary/20 group-hover:text-white transition-all">
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-mono px-2.5 py-1 rounded-full bg-white/5 text-slate-400 border border-white/5">
                      {feat.badge}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-white group-hover:text-brand-accent transition-colors">
                    {feat.title}
                  </h3>
                  <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                    {feat.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Why RiskLens AI */}
      <section className="w-full px-6 lg:px-12 py-20 border-t border-white/5">
        <div className="glass-panel p-8 sm:p-12 rounded-enterprise border border-brand-primary/30 bg-gradient-to-br from-dark-900 via-dark-850 to-dark-900">
          <div className="max-w-3xl">
            <span className="text-xs font-mono uppercase tracking-widest text-brand-accent font-bold">
              Why RiskLens AI?
            </span>
            <h2 className="text-3xl font-extrabold text-white mt-2">
              Transforming Reactive Alarms into Proactive Strategic Action
            </h2>
            <p className="text-slate-300 text-sm mt-4 leading-relaxed">
              Traditional monitoring systems overwhelm operators with thousands of raw alerts without context. RiskLens AI isolates true signal from noise, quantifies systemic exposure on a 0–100 risk scale, and delivers explainable decision intelligence with verifiable expected impacts.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-8">
              <div className="flex items-center gap-3 p-3 rounded-xl bg-dark-800/80 border border-white/5">
                <CheckCircle2 className="w-5 h-5 text-risk-low flex-shrink-0" />
                <span className="text-xs font-semibold text-slate-200">Zero Black-Box Obscurity</span>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-xl bg-dark-800/80 border border-white/5">
                <CheckCircle2 className="w-5 h-5 text-risk-low flex-shrink-0" />
                <span className="text-xs font-semibold text-slate-200">Interactive What-If Sensitivity Simulator</span>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-xl bg-dark-800/80 border border-white/5">
                <CheckCircle2 className="w-5 h-5 text-risk-low flex-shrink-0" />
                <span className="text-xs font-semibold text-slate-200">Multi-Modal (Telemetry, Text & Vision)</span>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-xl bg-dark-800/80 border border-white/5">
                <CheckCircle2 className="w-5 h-5 text-risk-low flex-shrink-0" />
                <span className="text-xs font-semibold text-slate-200">Deterministic + Gemini Dual Engine</span>
              </div>
            </div>

            <div className="mt-8 flex items-center gap-4">
              <button
                onClick={() => navigate('/overview')}
                className="px-6 py-3 rounded-xl bg-brand-primary text-white font-bold text-xs shadow-glow-primary hover:bg-brand-primary/90 transition-all flex items-center gap-2"
              >
                <span>Run Your First Analysis</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
