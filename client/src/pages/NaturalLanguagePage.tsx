import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Sparkles,
  ArrowRight,
  ShieldAlert,
  Target,
  FileText,
  SlidersHorizontal,
  RefreshCw,
  Cpu,
  Layers,
} from 'lucide-react';
import { api } from '../services/api';
import { Analysis } from '../types';
import { RiskScoreMeter } from '../components/RiskScoreMeter';
import { StatusBadge } from '../components/StatusBadge';
import { PipelineAnimation } from '../components/PipelineAnimation';
import { useToast } from '../context/ToastContext';

export const NaturalLanguagePage: React.FC = () => {
  const [text, setText] = useState(
    'Several unusual changes have appeared in the recent operational data for Substation 7-G, while the current ambient thermal conditions are significantly elevated above the historical average.'
  );
  const [category, setCategory] = useState('Operational Risk');
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<Analysis | null>(null);
  const toast = useToast();
  const navigate = useNavigate();

  const sampleScenarios = [
    {
      title: 'Operational Heat & Pressure',
      cat: 'Operational Risk',
      prompt:
        'Continuous high-load operations in Compressor Unit 3 resulted in a sudden +28% pressure drift and localized thermal buildup exceeding 92°C.',
    },
    {
      title: 'Watershed Flash Runoff',
      cat: 'Environmental Monitoring',
      prompt:
        'Heavy storm precipitation upstream has triggered sudden turbidity spikes in the municipal intake basin, with sediment levels rising 3x baseline.',
    },
    {
      title: 'Semiconductor Chamber Micro-Leak',
      cat: 'Infrastructure Risk',
      prompt:
        'Vacuum seal sensors in EUV Lithography Stage 2 show micro-pressure oscillations and harmonic acoustic vibrations during wafer etching.',
    },
  ];

  const handleAnalyze = async () => {
    if (!text.trim()) {
      toast.warning('Input Required', 'Please enter a description to analyze.');
      return;
    }

    setIsProcessing(true);
    setResult(null);

    try {
      const data = await api.analyzeText({ text, category });
      setTimeout(() => {
        setResult(data);
        setIsProcessing(false);
        toast.success('NLP Extraction Complete', `Risk evaluated at ${data.riskScore}/100 (${data.riskLevel})`);
      }, 1500);
    } catch (err: any) {
      setIsProcessing(false);
      toast.error('Analysis Failed', err.message || 'Error processing natural language input.');
    }
  };

  return (
    <div className="space-y-8 w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="text-xs font-mono uppercase tracking-widest text-brand-accent">
            Semantic Intelligence & Entity Extraction
          </div>
          <h2 className="text-2xl lg:text-3xl font-extrabold text-white tracking-tight mt-1">
            Natural Language Risk Assessment
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Describe situational anomalies in plain English. The AI engine parses qualitative narratives into quantified risk matrices.
          </p>
        </div>

        {result && (
          <button
            onClick={() => setResult(null)}
            className="px-4 py-2 rounded-xl bg-dark-850 hover:bg-dark-800 border border-white/10 text-slate-300 text-xs font-semibold flex items-center gap-2"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>New Narrative</span>
          </button>
        )}
      </div>

      {isProcessing ? (
        <PipelineAnimation speedMs={250} />
      ) : !result ? (
        <div className="glass-panel p-6 sm:p-8 rounded-enterprise border border-white/10 bg-dark-900/60 space-y-6">
          <div>
            <label className="text-xs font-semibold text-slate-300">
              Operational Domain Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full mt-1.5 px-3.5 py-2.5 rounded-xl bg-dark-800 border border-white/10 text-white text-xs focus:outline-none focus:border-brand-primary max-w-xs"
            >
              <option value="Operational Risk">Operational Risk</option>
              <option value="Infrastructure Risk">Infrastructure Risk</option>
              <option value="Environmental Monitoring">Environmental Monitoring</option>
              <option value="Resource Management">Resource Management</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-300">
              Incident Narrative / Qualitative Telemetry Report
            </label>
            <textarea
              rows={5}
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Describe the situation you want RiskLens AI to analyze..."
              className="w-full mt-2 p-4 rounded-xl bg-dark-800 border border-white/10 text-white text-xs leading-relaxed focus:outline-none focus:border-brand-primary"
            />
          </div>

          {/* Quick Prompt Presets */}
          <div className="space-y-2">
            <span className="text-xs font-semibold text-slate-400">Preset Sample Narratives:</span>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {sampleScenarios.map((scen) => (
                <button
                  key={scen.title}
                  onClick={() => {
                    setText(scen.prompt);
                    setCategory(scen.cat);
                  }}
                  className="p-3 rounded-xl bg-dark-850 hover:bg-dark-800 border border-white/5 hover:border-brand-primary/30 text-left transition-all"
                >
                  <div className="text-xs font-bold text-white">{scen.title}</div>
                  <div className="text-[11px] text-slate-400 mt-1 line-clamp-2">{scen.prompt}</div>
                </button>
              ))}
            </div>
          </div>

          <div className="pt-4 border-t border-white/5 flex items-center justify-between">
            <div className="text-xs text-slate-400 font-mono flex items-center gap-2">
              <Cpu className="w-4 h-4 text-brand-accent" />
              <span>Google Gemini 2.5 / 2.0 Semantic Extractor Active</span>
            </div>

            <button
              onClick={handleAnalyze}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-brand-primary to-brand-accent text-white text-xs font-bold shadow-glow-primary hover:opacity-95 transition-all flex items-center gap-2"
            >
              <span>Extract & Analyze</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      ) : (
        /* Result View */
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          <div className="glass-panel p-6 rounded-enterprise border border-brand-primary/40 bg-gradient-to-r from-brand-primary/20 via-dark-850 to-dark-900 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex flex-col md:flex-row items-center gap-6">
              <RiskScoreMeter score={result.riskScore} level={result.riskLevel} size={160} />
              <div>
                <StatusBadge level={result.riskLevel} />
                <h3 className="text-xl font-bold text-white mt-2">{result.title}</h3>
                <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">{result.summary}</p>
              </div>
            </div>

            <button
              onClick={() => navigate('/decisions')}
              className="px-5 py-2.5 rounded-xl bg-risk-low text-dark-950 font-bold text-xs shadow-glow-low/30 hover:bg-emerald-400 transition-all flex items-center gap-2 flex-shrink-0"
            >
              <Target className="w-4 h-4" />
              <span>Triage Decisions</span>
            </button>
          </div>

          {/* Factors & Predictions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="glass-panel p-6 rounded-enterprise border border-white/10 bg-dark-900/60 space-y-3">
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-risk-high" />
                <span>Extracted Risk Factors</span>
              </h4>
              {result.riskFactors.map((f) => (
                <div key={f.name} className="p-3.5 rounded-xl bg-dark-850/80 border border-white/5 space-y-1">
                  <div className="flex justify-between text-xs font-bold text-white">
                    <span>{f.name}</span>
                    <span className="text-brand-accent">+{f.contribution}%</span>
                  </div>
                  <p className="text-[11px] text-slate-400">{f.explanation}</p>
                </div>
              ))}
            </div>

            <div className="glass-panel p-6 rounded-enterprise border border-white/10 bg-dark-900/60 space-y-3">
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <Target className="w-4 h-4 text-risk-low" />
                <span>Extracted Action Plans</span>
              </h4>
              {result.recommendations.map((r) => (
                <div key={r.title} className="p-3.5 rounded-xl bg-dark-850/80 border border-white/5 space-y-1">
                  <div className="flex justify-between text-xs font-bold">
                    <span className="text-white">{r.title}</span>
                    <span className="text-risk-low font-mono">{r.expectedImpact}</span>
                  </div>
                  <p className="text-[11px] text-slate-400">{r.description}</p>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};
