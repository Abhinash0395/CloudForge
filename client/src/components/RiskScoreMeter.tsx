import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { RiskLevel } from '../types';

interface RiskScoreMeterProps {
  score: number;
  level?: RiskLevel | string;
  delta?: number;
  size?: number;
  strokeWidth?: number;
  showDelta?: boolean;
  animate?: boolean;
  subtext?: string;
}

export const RiskScoreMeter: React.FC<RiskScoreMeterProps> = ({
  score = 0,
  level = 'HIGH',
  delta = 8.4,
  size = 220,
  strokeWidth = 14,
  showDelta = true,
  animate = true,
  subtext = 'System Composite Index',
}) => {
  const [displayScore, setDisplayScore] = useState(0);

  // Score counter animation
  useEffect(() => {
    if (!animate) {
      setDisplayScore(score);
      return;
    }
    let start = 0;
    const end = Math.min(100, Math.max(0, score));
    const duration = 1000;
    const increment = end / (duration / 16);

    const timer = setInterval(() => {
      start += increment;
      if (start >= end) {
        setDisplayScore(end);
        clearInterval(timer);
      } else {
        setDisplayScore(Math.round(start * 10) / 10);
      }
    }, 16);

    return () => clearInterval(timer);
  }, [score, animate]);

  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  // Use a 260 degree arc for gauge look
  const arcLength = circumference * 0.75;
  const strokeDashoffset = arcLength - (arcLength * Math.min(100, Math.max(0, score))) / 100;

  const getColor = () => {
    if (score < 25) return { stroke: '#10B981', glow: 'rgba(16, 185, 129, 0.4)', text: 'text-risk-low', label: 'LOW RISK' };
    if (score < 50) return { stroke: '#F59E0B', glow: 'rgba(245, 158, 11, 0.4)', text: 'text-risk-moderate', label: 'MODERATE RISK' };
    if (score < 75) return { stroke: '#F97316', glow: 'rgba(249, 115, 22, 0.4)', text: 'text-risk-high', label: 'HIGH RISK' };
    return { stroke: '#EF4444', glow: 'rgba(239, 68, 68, 0.5)', text: 'text-risk-critical', label: 'CRITICAL RISK' };
  };

  const config = getColor();

  return (
    <div className="relative flex flex-col items-center justify-center select-none" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="transform -rotate-[135deg] overflow-visible">
        {/* Track Background */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#1C2638"
          strokeWidth={strokeWidth}
          strokeDasharray={`${arcLength} ${circumference}`}
          strokeLinecap="round"
          fill="transparent"
        />

        {/* Animated Active Progress Arc */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={config.stroke}
          strokeWidth={strokeWidth}
          strokeDasharray={`${arcLength} ${circumference}`}
          initial={{ strokeDashoffset: arcLength }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 1.2, ease: 'easeOut' }}
          strokeLinecap="round"
          fill="transparent"
          style={{
            filter: `drop-shadow(0 0 10px ${config.glow})`,
          }}
        />
      </svg>

      {/* Center Score & Info */}
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center mt-2 pointer-events-none">
        <div className="flex items-baseline justify-center space-x-1">
          <span className="text-4xl lg:text-5xl font-extrabold tracking-tight text-white font-mono">
            {typeof displayScore === 'number' ? displayScore.toFixed(displayScore % 1 !== 0 ? 1 : 0) : displayScore}
          </span>
          <span className="text-sm font-semibold text-slate-400">/ 100</span>
        </div>

        <div className={`text-xs font-bold tracking-wider mt-1 uppercase ${config.text}`}>
          {config.label}
        </div>

        {showDelta && delta !== undefined && (
          <div className="flex items-center space-x-1 mt-1 text-[11px] text-slate-400 font-mono">
            {delta > 0 ? (
              <span className="text-risk-high flex items-center">
                <TrendingUp className="w-3 h-3 mr-0.5" /> +{delta}
              </span>
            ) : delta < 0 ? (
              <span className="text-risk-low flex items-center">
                <TrendingDown className="w-3 h-3 mr-0.5" /> {delta}
              </span>
            ) : (
              <span className="text-slate-400 flex items-center">
                <Minus className="w-3 h-3 mr-0.5" /> 0.0
              </span>
            )}
            <span className="text-slate-500">vs baseline</span>
          </div>
        )}

        {subtext && <div className="text-[10px] text-slate-500 mt-1 uppercase tracking-wider">{subtext}</div>}
      </div>
    </div>
  );
};
