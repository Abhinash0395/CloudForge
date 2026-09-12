import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShieldAlert,
  Database,
  Sparkles,
  Camera,
  Compass,
  ArrowRight,
  TrendingUp,
  Cpu,
  Target,
  FileText,
  SlidersHorizontal,
  CheckCircle2,
  RefreshCw,
  MapPin,
  Search,
  ExternalLink,
  ShieldCheck,
  CloudRain,
} from 'lucide-react';
import { api } from '../services/api';
import { Analysis, CitationPayload } from '../types';
import { RiskScoreMeter } from '../components/RiskScoreMeter';
import { StatusBadge } from '../components/StatusBadge';
import { PipelineAnimation } from '../components/PipelineAnimation';
import { CitationDrawer } from '../components/CitationDrawer';
import { TransparentFormulaCard } from '../components/TransparentFormulaCard';
import { useToast } from '../context/ToastContext';

export const RiskAnalysisPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'LIVE_DATA' | 'STRUCTURED' | 'TEXT' | 'IMAGE' | 'SCENARIO'>('LIVE_DATA');
  const [isProcessing, setIsProcessing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<Analysis | null>(null);
  const [showCitations, setShowCitations] = useState(false);
  const [activeCitations, setActiveCitations] = useState<CitationPayload[]>([]);
  const toast = useToast();
  const navigate = useNavigate();

  // Live Real-World Data State
  const [liveCity, setLiveCity] = useState('Gorakhpur');

  // Structured Form State
  const [formData, setFormData] = useState({
    scenarioName: 'Power Grid High-Voltage Transformer Telemetry',
    category: 'Infrastructure',
    location: 'Regional Substation Sector 7-G',
    historicalValue: 48,
    currentValue: 82,
    changeRate: 24,
    environmentalFactor: 68,
    operationalFactor: 85,
    previousIncidents: 3,
    operationalFactorName: 'Peak Harmonic Transformer Load',
    environmentalFactorName: 'Ambient Heatwave Index',
  });

  // Natural Language State
  const [nlText, setNlText] = useState(
    'Several unusual thermal spikes and harmonic oscillations have appeared in the recent operational data for Substation 7-G, while current ambient temperatures are 14°C above seasonal baseline.'
  );

  const handleInputChange = (field: string, val: any) => {
    setFormData((prev) => ({ ...prev, [field]: val }));
  };

  const handleRunAnalysis = async () => {
    setIsProcessing(true);
    setAnalysisResult(null);

    try {
      let result: any;
      if (activeTab === 'LIVE_DATA') {
        result = await api.analyzeLiveLocation({ locationName: liveCity });
        if (result.sourcesCited) {
          const parsed = typeof result.sourcesCited === 'string' ? JSON.parse(result.sourcesCited) : result.sourcesCited;
          setActiveCitations(parsed);
        }
      } else if (activeTab === 'STRUCTURED') {
        result = await api.analyzeStructured(formData);
      } else if (activeTab === 'TEXT') {
        result = await api.analyzeText({ text: nlText, category: formData.category });
      } else {
        result = await api.analyzeStructured(formData);
      }

      // Pipeline animation will complete and reveal the result
      setTimeout(() => {
        setAnalysisResult(result);
        setIsProcessing(false);
        toast.success(
          activeTab === 'LIVE_DATA' ? 'Live Telemetry Verified' : 'Analysis Completed',
          `Calculated Risk Score: ${result.riskScore}/100 (${result.riskLevel})`
        );
      }, 1400);
    } catch (err: any) {
      setIsProcessing(false);
      toast.error('Analysis Failed', err.message || 'Error processing risk assessment');
    }
  };

  return (
    <div className="space-y-8 w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="text-xs font-mono uppercase tracking-widest text-brand-accent">
            Interactive Analysis Workbench
          </div>
          <h2 className="text-2xl lg:text-3xl font-extrabold text-white tracking-tight mt-1">
            New Risk & Prediction Analysis
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Submit multi-modal inputs to compute predictive risk scores, feature attributions, and actionable decisions.
          </p>
        </div>

        {analysisResult && (
          <button
            onClick={() => {
              setAnalysisResult(null);
              setIsProcessing(false);
            }}
            className="px-4 py-2 rounded-xl bg-dark-850 hover:bg-dark-800 border border-white/10 text-slate-300 text-xs font-semibold flex items-center gap-2"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Reset Workbench</span>
          </button>
        )}
      </div>

      {/* Provenance & Citation Drawer */}
      <CitationDrawer
        isOpen={showCitations}
        onClose={() => setShowCitations(false)}
        citations={activeCitations}
        dataFreshness={analysisResult?.dataFreshness}
        dataQuality={analysisResult?.dataQuality}
        calculationMethod={analysisResult?.calculationMethod}
        limitations={analysisResult?.limitations}
      />

      {/* Tabs */}
      <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-dark-900/80 border border-white/5 glass-panel w-full flex-wrap">
        <button
          onClick={() => {
            setActiveTab('LIVE_DATA');
            setAnalysisResult(null);
          }}
          className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
            activeTab === 'LIVE_DATA'
              ? 'bg-cyan-600 text-white shadow-glow-primary'
              : 'text-slate-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>Live Data (Open APIs)</span>
        </button>

        <button
          onClick={() => {
            setActiveTab('STRUCTURED');
            setAnalysisResult(null);
          }}
          className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
            activeTab === 'STRUCTURED'
              ? 'bg-cyan-600 text-white shadow-glow-primary'
              : 'text-slate-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <Database className="w-4 h-4" />
          <span>Parameter Sandbox</span>
        </button>

        <button
          onClick={() => {
            setActiveTab('TEXT');
            setAnalysisResult(null);
          }}
          className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
            activeTab === 'TEXT'
              ? 'bg-cyan-600 text-white shadow-glow-primary'
              : 'text-slate-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span>Natural Language</span>
        </button>

        <button
          onClick={() => navigate('/analysis/image')}
          className="flex-1 py-2.5 px-3 rounded-xl text-xs font-bold text-slate-400 hover:text-white hover:bg-white/5 transition-all flex items-center justify-center gap-1.5"
        >
          <Camera className="w-4 h-4" />
          <span>Computer Vision</span>
        </button>

        <button
          onClick={() => navigate('/scenarios')}
          className="flex-1 py-2.5 px-3 rounded-xl text-xs font-bold text-slate-400 hover:text-white hover:bg-white/5 transition-all flex items-center justify-center gap-1.5"
        >
          <Compass className="w-4 h-4" />
          <span>Demo Scenarios</span>
        </button>
      </div>

      {/* Main Input Form vs Processing Pipeline */}
      {isProcessing ? (
        <PipelineAnimation speedMs={260} />
      ) : !analysisResult ? (
        <div className="glass-panel p-6 sm:p-8 rounded-enterprise border border-white/10 bg-dark-900/60 space-y-6">
          {activeTab === 'LIVE_DATA' && (
            <div className="space-y-6">
              <div className="p-4 rounded-xl bg-cyan-950/40 border border-cyan-500/30 space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-cyan-300">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>Real-World Data Guarantee (Track 01 — PS 05)</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Fetches live high-resolution meteorological telemetry (precipitation mm, ECMWF 72h forecast, atmospheric pressure, relative humidity) and European Copernicus air quality data without synthetic fabrication.
                </p>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300">Select or Search Global Location</label>
                <div className="flex gap-2 mt-1.5">
                  <div className="relative flex-1">
                    <MapPin className="w-4 h-4 absolute left-3.5 top-3 text-cyan-400" />
                    <input
                      type="text"
                      value={liveCity}
                      onChange={(e) => setLiveCity(e.target.value)}
                      placeholder="e.g. Gorakhpur, Mumbai, Patna, Guwahati, London, Tokyo..."
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-dark-800 border border-cyan-500/30 text-white text-xs focus:outline-none focus:border-cyan-400"
                    />
                  </div>
                </div>

                {/* Quick Selection Chips */}
                <div className="flex flex-wrap items-center gap-1.5 mt-2.5">
                  <span className="text-[11px] font-mono text-slate-400 mr-1">Quick Cities:</span>
                  {['Gorakhpur', 'Mumbai', 'Patna', 'Guwahati', 'Delhi', 'Bengaluru', 'London', 'Tokyo'].map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setLiveCity(c)}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-mono transition-all ${
                        liveCity.toLowerCase() === c.toLowerCase()
                          ? 'bg-cyan-600 text-white font-bold'
                          : 'bg-dark-800 text-slate-300 hover:text-white border border-white/5'
                      }`}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-4 rounded-xl bg-[#06111F] border border-slate-700/60 text-xs text-slate-300 space-y-1.5">
                <span className="text-slate-400 text-[11px] block font-mono">Telemetry Pipeline Stages:</span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1 font-mono text-[11px]">
                  <div className="p-2 rounded bg-dark-800/80 border border-white/5">
                    1. Geocoding Centroid
                  </div>
                  <div className="p-2 rounded bg-dark-800/80 border border-white/5">
                    2. ECMWF & CAMS Fetch
                  </div>
                  <div className="p-2 rounded bg-dark-800/80 border border-white/5">
                    3. Transparent Composite
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'STRUCTURED' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-300">Scenario Name / Asset Title</label>
                  <input
                    type="text"
                    value={formData.scenarioName}
                    onChange={(e) => handleInputChange('scenarioName', e.target.value)}
                    className="w-full mt-1.5 px-3.5 py-2.5 rounded-xl bg-dark-800 border border-white/10 text-white text-xs focus:outline-none focus:border-brand-primary"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300">Domain Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => handleInputChange('category', e.target.value)}
                    className="w-full mt-1.5 px-3.5 py-2.5 rounded-xl bg-dark-800 border border-white/10 text-white text-xs focus:outline-none focus:border-brand-primary"
                  >
                    <option value="Infrastructure">Infrastructure Risk</option>
                    <option value="Environmental">Environmental Monitoring</option>
                    <option value="Operational">Operational Risk</option>
                    <option value="Resource">Resource Management</option>
                    <option value="Financial">Financial Risk</option>
                    <option value="Healthcare">Healthcare Operations</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300">Geographic / Subsystem Location</label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => handleInputChange('location', e.target.value)}
                    className="w-full mt-1.5 px-3.5 py-2.5 rounded-xl bg-dark-800 border border-white/10 text-white text-xs focus:outline-none focus:border-brand-primary"
                  />
                </div>
              </div>

              {/* Sliders Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-white/5">
                {/* Historical vs Current */}
                <div className="space-y-4 p-4 rounded-xl bg-dark-850/60 border border-white/5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-200">Current Operational Load / Value</span>
                    <span className="font-mono font-bold text-brand-accent">{formData.currentValue}%</span>
                  </div>
                  <input
                    type="range"
                    min={5}
                    max={100}
                    value={formData.currentValue}
                    onChange={(e) => handleInputChange('currentValue', Number(e.target.value))}
                    className="w-full accent-brand-primary cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                    <span>Baseline: {formData.historicalValue}%</span>
                    <span>Delta: +{formData.currentValue - formData.historicalValue}%</span>
                  </div>
                </div>

                {/* Change Rate */}
                <div className="space-y-4 p-4 rounded-xl bg-dark-850/60 border border-white/5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-200">Rate of Change Velocity</span>
                    <span className="font-mono font-bold text-risk-high">+{formData.changeRate}% / hr</span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={60}
                    value={formData.changeRate}
                    onChange={(e) => handleInputChange('changeRate', Number(e.target.value))}
                    className="w-full accent-risk-high cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                    <span>Stable (0%)</span>
                    <span>Extreme Acceleration (60%)</span>
                  </div>
                </div>

                {/* Environmental Stress Factor */}
                <div className="space-y-4 p-4 rounded-xl bg-dark-850/60 border border-white/5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-200">{formData.environmentalFactorName}</span>
                    <span className="font-mono font-bold text-amber-400">{formData.environmentalFactor}/100</span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    value={formData.environmentalFactor}
                    onChange={(e) => handleInputChange('environmentalFactor', Number(e.target.value))}
                    className="w-full accent-amber-400 cursor-pointer"
                  />
                </div>

                {/* Previous Incidents */}
                <div className="space-y-4 p-4 rounded-xl bg-dark-850/60 border border-white/5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-200">Correlated Prior Incidents (180 Days)</span>
                    <span className="font-mono font-bold text-rose-400">{formData.previousIncidents} Incidents</span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={10}
                    value={formData.previousIncidents}
                    onChange={(e) => handleInputChange('previousIncidents', Number(e.target.value))}
                    className="w-full accent-rose-400 cursor-pointer"
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'TEXT' && (
            <div className="space-y-4">
              <label className="text-xs font-semibold text-slate-300">
                Describe the operational situation or anomaly in plain English:
              </label>
              <textarea
                rows={5}
                value={nlText}
                onChange={(e) => setNlText(e.target.value)}
                placeholder="Describe the situation you want RiskLens AI to analyze..."
                className="w-full p-4 rounded-xl bg-dark-800 border border-white/10 text-white text-xs leading-relaxed focus:outline-none focus:border-brand-primary"
              />
              <div className="flex flex-wrap gap-2 text-[11px] text-slate-400">
                <span className="font-mono text-slate-500">Quick Prompt Chips:</span>
                <button
                  onClick={() =>
                    setNlText(
                      'Severe chemical sensor drift detected in Station 4 watershed basin, with dissolved oxygen plummeting 40% in 12 hours.'
                    )
                  }
                  className="px-2.5 py-1 rounded-lg bg-dark-800 hover:bg-dark-750 border border-white/5 text-slate-300 text-[10px]"
                >
                  Watershed Chemical Surge
                </button>
                <button
                  onClick={() =>
                    setNlText(
                      'Semiconductor photolithography EUV chamber vacuum seal micro-leak detected with resonant harmonic vibration.'
                    )
                  }
                  className="px-2.5 py-1 rounded-lg bg-dark-800 hover:bg-dark-750 border border-white/5 text-slate-300 text-[10px]"
                >
                  EUV Cleanroom Vacuum Anomaly
                </button>
              </div>
            </div>
          )}

          {/* Action Trigger */}
          <div className="pt-4 border-t border-white/5 flex items-center justify-between">
            <div className="text-xs text-slate-400 font-mono flex items-center gap-2">
              <Cpu className="w-4 h-4 text-brand-accent" />
              <span>Multi-Factor Analytical Ensemble + Gemini AI Reasoning</span>
            </div>

            <button
              onClick={handleRunAnalysis}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-brand-primary to-brand-accent text-white text-xs font-bold shadow-glow-primary hover:opacity-95 transition-all flex items-center gap-2"
            >
              <span>Run AI Analysis</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      ) : (
        /* Complete Rendered Analysis Results */
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Top Result Banner */}
          <div className="glass-panel p-6 rounded-enterprise border border-brand-primary/40 bg-gradient-to-r from-brand-primary/20 via-dark-850 to-dark-900 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex flex-col md:flex-row items-center gap-6 text-center md:text-left">
              <RiskScoreMeter score={analysisResult.riskScore} level={analysisResult.riskLevel} size={170} />
              <div>
                <div className="flex items-center justify-center md:justify-start gap-2 flex-wrap">
                  <StatusBadge level={analysisResult.riskLevel} />
                  <span className={`text-[11px] font-mono font-bold px-2 py-0.5 rounded-full border ${
                    analysisResult.mode === 'LIVE'
                      ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                      : 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                  }`}>
                    {analysisResult.mode === 'LIVE' ? '● LIVE DATA' : '● DEMO SANDBOX'}
                  </span>
                  <span className="text-xs font-mono text-slate-400">
                    Confidence: {Math.round(analysisResult.confidence * 100)}%
                  </span>
                </div>
                <h3 className="text-xl font-bold text-white mt-2">
                  {analysisResult.title}
                </h3>
                <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
                  {analysisResult.summary}
                </p>
                {analysisResult.location && (
                  <p className="text-[11px] text-cyan-400 font-mono mt-1 flex items-center gap-1 justify-center md:justify-start">
                    <MapPin className="w-3.5 h-3.5" />
                    {analysisResult.location}
                  </p>
                )}
              </div>
            </div>

            <div className="flex flex-col gap-2 w-full md:w-auto flex-shrink-0">
              <button
                onClick={() => setShowCitations(true)}
                className="px-4 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs shadow-glow-primary transition-all flex items-center justify-center gap-2"
              >
                <Database className="w-4 h-4" />
                <span>View Data Citations</span>
              </button>
              <button
                onClick={() => navigate('/decisions')}
                className="px-4 py-2.5 rounded-xl bg-risk-low text-dark-950 font-bold text-xs shadow-glow-low/30 hover:bg-emerald-400 transition-all flex items-center justify-center gap-2"
              >
                <Target className="w-4 h-4" />
                <span>Open Decision Center</span>
              </button>
              <button
                onClick={() => navigate('/simulator')}
                className="px-4 py-2.5 rounded-xl bg-dark-800 hover:bg-dark-750 border border-white/10 text-white text-xs font-semibold transition-all flex items-center justify-center gap-2"
              >
                <SlidersHorizontal className="w-4 h-4 text-brand-accent" />
                <span>Simulate What-If</span>
              </button>
            </div>
          </div>

          {/* Transparent Mathematical Formula Breakdown Card */}
          <TransparentFormulaCard
            score={analysisResult.riskScore}
            riskLevel={analysisResult.riskLevel}
            confidence={analysisResult.confidence}
            factors={analysisResult.riskFactors}
            calculationMethod={analysisResult.calculationMethod}
            isLive={analysisResult.mode === 'LIVE'}
          />

          {/* Breakdown Grid: Risk Factors & Prioritized Recommendations */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Risk Factors */}
            <div className="glass-panel p-6 rounded-enterprise border border-white/10 bg-dark-900/60">
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-risk-high" />
                <span>Contributing Risk Factors</span>
              </h4>
              <div className="mt-4 space-y-3">
                {analysisResult.riskFactors.map((f) => (
                  <div key={f.name} className="p-3.5 rounded-xl bg-dark-850/80 border border-white/5 space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-200">{f.name}</span>
                      <span className="font-mono font-bold text-brand-accent">+{f.contribution}%</span>
                    </div>
                    <div className="w-full bg-dark-750 h-1.5 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-brand-primary to-brand-accent"
                        style={{ width: `${Math.min(100, f.contribution * 2.5)}%` }}
                      />
                    </div>
                    <p className="text-[11px] text-slate-400">{f.explanation}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Recommendations */}
            <div className="glass-panel p-6 rounded-enterprise border border-white/10 bg-dark-900/60">
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <Target className="w-4 h-4 text-risk-low" />
                <span>Recommended Decisions</span>
              </h4>
              <div className="mt-4 space-y-3">
                {analysisResult.recommendations.map((r) => (
                  <div key={r.title} className="p-4 rounded-xl bg-dark-850/80 border border-white/5 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono font-bold text-brand-primary px-2 py-0.5 rounded bg-brand-primary/20">
                        {r.priority}
                      </span>
                      <span className="text-[10px] text-risk-low font-bold font-mono">
                        {r.expectedImpact}
                      </span>
                    </div>
                    <h5 className="text-xs font-bold text-white mt-1">{r.title}</h5>
                    <p className="text-[11px] text-slate-300 leading-relaxed">{r.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};
