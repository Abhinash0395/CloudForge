import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Database, CheckCircle2, Cpu, LineChart, ShieldAlert, Sparkles, ArrowRight } from 'lucide-react';

interface PipelineAnimationProps {
  onComplete?: () => void;
  speedMs?: number;
}

export const PipelineAnimation: React.FC<PipelineAnimationProps> = ({
  onComplete,
  speedMs = 320,
}) => {
  const steps = [
    { label: 'Collecting Data', icon: Database, color: 'text-brand-accent' },
    { label: 'Validating Telemetry', icon: CheckCircle2, color: 'text-blue-400' },
    { label: 'AI/ML Feature Extraction', icon: Cpu, color: 'text-brand-primary' },
    { label: 'Prediction Modeling', icon: LineChart, color: 'text-violet-400' },
    { label: 'Calculating Risk Matrix', icon: ShieldAlert, color: 'text-risk-high' },
    { label: 'Synthesizing Recommendations', icon: Sparkles, color: 'text-risk-low' },
  ];

  const [activeStep, setActiveStep] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveStep((prev) => {
        if (prev >= steps.length - 1) {
          clearInterval(timer);
          if (onComplete) setTimeout(onComplete, 200);
          return prev;
        }
        return prev + 1;
      });
    }, speedMs);

    return () => clearInterval(timer);
  }, [speedMs, onComplete, steps.length]);

  return (
    <div className="w-full glass-panel p-6 rounded-enterprise border border-brand-primary/30 shadow-glow-primary/20">
      <div className="text-center mb-6">
        <div className="text-xs uppercase tracking-widest text-brand-accent font-semibold flex items-center justify-center gap-2">
          <span className="w-2 h-2 rounded-full bg-brand-accent animate-ping" />
          Autonomous Pipeline Execution
        </div>
        <h4 className="text-base font-bold text-white mt-1">Processing Telemetry & Decision Graph</h4>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-6 gap-3 relative">
        {steps.map((step, idx) => {
          const Icon = step.icon;
          const isDone = idx < activeStep;
          const isCurrent = idx === activeStep;

          return (
            <motion.div
              key={step.label}
              initial={{ opacity: 0.6, scale: 0.95 }}
              animate={{
                opacity: isCurrent ? 1 : isDone ? 0.9 : 0.4,
                scale: isCurrent ? 1.04 : 1,
              }}
              transition={{ duration: 0.2 }}
              className={`flex flex-col items-center text-center p-3.5 rounded-xl border transition-all ${
                isCurrent
                  ? 'border-brand-primary bg-brand-primary/15 shadow-glow-primary/30'
                  : isDone
                  ? 'border-risk-low/40 bg-risk-low/5'
                  : 'border-white/5 bg-dark-850/40'
              }`}
            >
              <div
                className={`w-9 h-9 rounded-lg flex items-center justify-center mb-2.5 ${
                  isCurrent
                    ? 'bg-brand-primary/30 text-brand-accent animate-pulse'
                    : isDone
                    ? 'bg-risk-low/20 text-risk-low'
                    : 'bg-dark-750 text-slate-500'
                }`}
              >
                <Icon className="w-5 h-5" />
              </div>
              <span className="text-[11px] font-semibold text-slate-200 leading-tight">
                {step.label}
              </span>
              <div className="mt-2 text-[10px] font-mono">
                {isDone ? (
                  <span className="text-risk-low font-bold">COMPLETED</span>
                ) : isCurrent ? (
                  <span className="text-brand-accent font-bold animate-pulse">ANALYZING...</span>
                ) : (
                  <span className="text-slate-500">QUEUED</span>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};
