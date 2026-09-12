import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import {
  Award,
  ChevronRight,
  ChevronLeft,
  X,
  Sparkles,
  Zap,
  Target,
  SlidersHorizontal,
  FileText,
  ShieldAlert,
  LineChart,
  Brain,
  CheckCircle,
} from 'lucide-react';

interface JudgeDemoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const JudgeDemoModal: React.FC<JudgeDemoModalProps> = ({ isOpen, onClose }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const navigate = useNavigate();

  const steps = [
    {
      stepNumber: 1,
      title: 'Welcome to RiskLens AI (PS 05)',
      subtitle: 'Track 01 — AI, ML & Emerging Tech | PS 05 — Prediction & Decision Support',
      icon: Award,
      description:
        'RiskLens AI is not a generic chatbot. It is a full-stack, enterprise AI decision cockpit that converts structured parameters, telemetry, natural-language streams, and computer vision images into explainable predictions and prioritized action plans.',
      actionLabel: 'Explore Live Scenarios',
      actionRoute: '/scenarios',
      tip: 'Click Next to step through the entire 2-minute decision cycle.',
    },
    {
      stepNumber: 2,
      title: 'Step 1: Select a Real-World Scenario',
      subtitle: '5 Ready-to-Run Live Industry Scenarios',
      icon: Zap,
      description:
        'Select from Power Grid Overload, Coastal Flash Flood, EUV Cleanroom Vibration, Cold-Chain Biologics, or Autonomous Fleet EV battery risk models.',
      actionLabel: 'View Scenarios',
      actionRoute: '/scenarios',
      tip: 'Judges can trigger complete end-to-end execution in one click.',
    },
    {
      stepNumber: 3,
      title: 'Step 2: Multi-Modal Analysis Workbench',
      subtitle: 'Structured Telemetry, Natural Language & Vision',
      icon: ShieldAlert,
      description:
        'Test parameters with numeric sliders, describe a crisis in plain English, or upload an asset scan for computer vision anomaly detection.',
      actionLabel: 'Open Analysis Workbench',
      actionRoute: '/analysis',
      tip: 'Witness the automated multi-stage pipeline execute with fast, realistic feedback.',
    },
    {
      stepNumber: 4,
      title: 'Step 3: Normalized Risk Scoring (0–100)',
      subtitle: 'Multi-Factor Analytical Ensemble Engine',
      icon: ShieldAlert,
      description:
        'Watch the animated circular gauge count up and classify systemic vulnerability into Low, Moderate, High, or Critical risk with exact delta over baseline.',
      actionLabel: 'View Dashboard Overview',
      actionRoute: '/overview',
      tip: 'Risk scores are mathematically grounded with weighted factor contributions.',
    },
    {
      stepNumber: 5,
      title: 'Step 4: Future Prediction & Forecasting',
      subtitle: 'Time-Series Trajectory & Probability Horizons',
      icon: LineChart,
      description:
        'Inspect forecasted outcomes over 7, 14, 30, and 90 days with expanding uncertainty cones and confidence intervals.',
      actionLabel: 'Open Prediction Center',
      actionRoute: '/predictions',
      tip: 'Notice clear separation between historical truth, current state, and projected bounds.',
    },
    {
      stepNumber: 6,
      title: 'Step 5: Explainable AI & Feature Attribution',
      subtitle: '"Why did AI make this prediction?"',
      icon: Brain,
      description:
        'Explore feature contribution percentages, "What the model saw", "What changed", "Why it matters", and "What could happen" in plain language + technical metadata.',
      actionLabel: 'View Explainability Breakdown',
      actionRoute: '/explainability',
      tip: 'Powered by Google Gemini generative reasoning with zero-failure fallback.',
    },
    {
      stepNumber: 7,
      title: 'Step 6: Strategic Decision Center',
      subtitle: 'Action Prioritization & Impact Estimation',
      icon: Target,
      description:
        'Review Priority 1, 2, and 3 actionable recommendations with expected risk reduction (e.g. -22.5%), urgency level, and interactive Accept/Dismiss/Save triage.',
      actionLabel: 'Open Decision Center',
      actionRoute: '/decisions',
      tip: 'Decision support puts humans in the loop without executing hazardous real-world operations.',
    },
    {
      stepNumber: 8,
      title: 'Step 7: "What-If" Scenario Simulator',
      subtitle: 'Interactive Causal Perturbation Engine',
      icon: SlidersHorizontal,
      description:
        'Adjust factor sliders (e.g. Factor A +15%, Factor B -10%) and watch simulated risk and AI causal explanation update in real-time.',
      actionLabel: 'Launch What-If Simulator',
      actionRoute: '/simulator',
      tip: 'The ultimate differentiator demonstrating dynamic sensitivity and root-cause impact.',
    },
    {
      stepNumber: 9,
      title: 'Step 8: Computer Vision Asset Intelligence',
      subtitle: 'Supporting Capability for PS 05',
      icon: Sparkles,
      description:
        'Inspect structural weld micro-fractures and thermal hotspots with bounding boxes, then click "Use Vision Results in Risk Analysis" to feed results into the decision loop.',
      actionLabel: 'Open Image Vision Workbench',
      actionRoute: '/analysis/image',
      tip: 'Vision seamlessly feeds into the primary prediction and scoring pipeline.',
    },
    {
      stepNumber: 10,
      title: 'Step 9 & 10: Executive Reports & Completion',
      subtitle: 'Print-Ready PDF Intelligence Dossiers',
      icon: FileText,
      description:
        'Generate full executive intelligence reports with risk summaries, factor weights, and decision action tables ready for boardroom review or PDF download.',
      actionLabel: 'Generate Executive Report',
      actionRoute: '/reports',
      tip: 'Complete decision-intelligence loop verified and production-ready!',
    },
  ];

  const current = steps[currentStep];
  const Icon = current.icon;

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      });
      onClose();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleNavigate = (route: string) => {
    navigate(route);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ duration: 0.2 }}
            className="w-full max-w-2xl glass-panel rounded-2xl border border-brand-primary/50 shadow-2xl overflow-hidden bg-dark-900/95 flex flex-col"
          >
            {/* Header */}
            <div className="p-6 border-b border-white/10 flex items-center justify-between bg-gradient-to-r from-brand-primary/20 via-brand-accent/10 to-transparent">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-brand-primary/30 text-brand-accent border border-brand-primary/40 shadow-glow-primary/30">
                  <Award className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold uppercase tracking-widest text-brand-accent">
                      Judge Demo Tour
                    </span>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-white/10 text-slate-300 font-mono">
                      Step {current.stepNumber} of {steps.length}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-white mt-0.5">{current.title}</h3>
                </div>
              </div>

              <button
                onClick={onClose}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Progress Line */}
            <div className="w-full bg-dark-800 h-1">
              <div
                className="h-full bg-gradient-to-r from-brand-primary to-brand-accent transition-all duration-300"
                style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
              />
            </div>

            {/* Step Body */}
            <div className="p-6 space-y-5">
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-2xl bg-dark-800 border border-white/10 text-brand-primary flex-shrink-0">
                  <Icon className="w-7 h-7" />
                </div>
                <div>
                  <div className="text-xs font-bold text-brand-accent uppercase tracking-wider">
                    {current.subtitle}
                  </div>
                  <p className="text-sm text-slate-200 mt-2 leading-relaxed">
                    {current.description}
                  </p>
                </div>
              </div>

              {/* Pro Tip Callout */}
              <div className="p-4 rounded-xl bg-brand-primary/10 border border-brand-primary/20 flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs text-brand-accent font-medium">
                  <Sparkles className="w-4 h-4 flex-shrink-0" />
                  <span>{current.tip}</span>
                </div>
                {current.actionRoute && (
                  <button
                    onClick={() => handleNavigate(current.actionRoute)}
                    className="px-3 py-1.5 rounded-lg bg-brand-primary text-white text-xs font-semibold hover:bg-brand-primary/90 transition-all flex items-center gap-1.5 flex-shrink-0 ml-3"
                  >
                    <span>{current.actionLabel}</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* Modal Footer Controls */}
            <div className="p-5 border-t border-white/10 bg-dark-950/80 flex items-center justify-between">
              <button
                onClick={handlePrev}
                disabled={currentStep === 0}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white disabled:opacity-30 disabled:pointer-events-none hover:bg-white/5 transition-all flex items-center gap-1.5"
              >
                <ChevronLeft className="w-4 h-4" />
                Previous
              </button>

              <div className="flex items-center gap-1.5">
                {steps.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentStep(i)}
                    className={`h-2 rounded-full transition-all ${
                      i === currentStep ? 'w-6 bg-brand-accent' : 'w-2 bg-dark-700 hover:bg-slate-500'
                    }`}
                  />
                ))}
              </div>

              <button
                onClick={handleNext}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-brand-primary to-brand-accent text-white text-xs font-bold hover:shadow-glow-primary transition-all flex items-center gap-2"
              >
                <span>{currentStep === steps.length - 1 ? 'Finish Tour 🎉' : 'Next Step'}</span>
                {currentStep === steps.length - 1 ? <CheckCircle className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
