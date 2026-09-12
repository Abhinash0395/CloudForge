import React from 'react';
import { motion } from 'framer-motion';
import {
  ShieldAlert,
  ArrowRight,
  Compass,
  MapPin,
  Crosshair,
  Sparkles,
  Activity,
  Globe2,
} from 'lucide-react';
import { useLocationContext } from '../context/LocationContext';

interface StartScreenProps {
  onStart?: () => void;
}

export const StartScreen: React.FC<StartScreenProps> = ({ onStart }) => {
  const { startRiskLens, requestCurrentLocation, selectLocation, isLoading } = useLocationContext();

  const handleStart = () => {
    startRiskLens();
    if (onStart) onStart();
  };

  const handleUseLocation = async () => {
    startRiskLens();
    if (onStart) onStart();
    await requestCurrentLocation();
  };

  const quickLocations = [
    { name: 'Gorakhpur', latitude: 26.7606, longitude: 83.3732, country: 'India', formattedName: 'Gorakhpur, Uttar Pradesh, India' },
    { name: 'Delhi', latitude: 28.6139, longitude: 77.209, country: 'India', formattedName: 'Delhi, India' },
    { name: 'Mumbai', latitude: 19.076, longitude: 72.8777, country: 'India', formattedName: 'Mumbai, Maharashtra, India' },
    { name: 'Tokyo', latitude: 35.6762, longitude: 139.6503, country: 'Japan', formattedName: 'Tokyo, Japan' },
  ];

  const handleQuickSelect = async (loc: any) => {
    startRiskLens();
    if (onStart) onStart();
    await selectLocation(loc);
  };

  return (
    <div className="relative min-h-[88vh] flex flex-col items-center justify-center text-center px-4 py-12 select-none">
      {/* Background Soft Glow Center */}
      <div className="absolute w-[360px] sm:w-[500px] h-[360px] sm:h-[500px] rounded-full bg-cyan-500/10 blur-[130px] pointer-events-none -z-10" />

      {/* Main Content Container with Smooth Fade-in */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
        className="max-w-2xl mx-auto flex flex-col items-center"
      >
        {/* Logo Badge & Radar Glow */}
        <div className="relative mb-6">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-cyan-500 to-indigo-600 p-0.5 shadow-[0_0_40px_rgba(6,182,212,0.35)] flex items-center justify-center">
            <div className="w-full h-full bg-[#06111F] rounded-[14px] flex items-center justify-center">
              <ShieldAlert className="w-8 h-8 text-cyan-400" />
            </div>
          </div>
          <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-emerald-400 border-2 border-[#06111F] animate-pulse" />
        </div>

        {/* Brand Heading */}
        <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-white flex items-center justify-center gap-2">
          <span>RISKLENS</span>
          <span className="bg-gradient-to-r from-cyan-400 to-indigo-400 bg-clip-text text-transparent">AI</span>
        </h1>

        {/* Concise Value Proposition */}
        <p className="text-base sm:text-xl font-medium text-slate-200 mt-3 max-w-lg leading-relaxed">
          "Real data. Clear risks. Simple decisions."
        </p>

        {/* Subtitle explanation */}
        <p className="text-xs sm:text-sm text-slate-400 mt-2 max-w-md leading-normal">
          Understand the risks around any location using real-world data.
          See the risk, understand the reason.
        </p>

        {/* Primary Action Button */}
        <div className="mt-8 flex flex-col items-center gap-4 w-full max-w-xs">
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={handleStart}
            className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-cyan-500 via-indigo-600 to-blue-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-bold text-sm sm:text-base shadow-[0_0_30px_rgba(6,182,212,0.35)] hover:shadow-[0_0_45px_rgba(6,182,212,0.5)] transition-all flex items-center justify-center gap-3 cursor-pointer group"
          >
            <span>START RISK LENS</span>
            <ArrowRight className="w-5 h-5 text-cyan-200 group-hover:translate-x-1 transition-transform" />
          </motion.button>

          {/* Secondary Options */}
          <div className="flex items-center gap-3 text-xs text-slate-400">
            <button
              onClick={handleUseLocation}
              disabled={isLoading}
              className="hover:text-cyan-300 transition-colors flex items-center gap-1.5 py-1 px-2 rounded-lg hover:bg-white/5 cursor-pointer"
            >
              <Crosshair className="w-3.5 h-3.5 text-cyan-400" />
              <span>Use my location</span>
            </button>
            <span>•</span>
            <button
              onClick={handleStart}
              className="hover:text-cyan-300 transition-colors py-1 px-2 rounded-lg hover:bg-white/5 cursor-pointer"
            >
              Explore a location
            </button>
          </div>
        </div>

        {/* Quick Location Pills */}
        <div className="mt-10 pt-6 border-t border-white/10 w-full max-w-md">
          <div className="text-[11px] font-mono text-slate-400 uppercase tracking-wider mb-2.5">
            Or quick analyze verified centroids
          </div>
          <div className="flex flex-wrap items-center justify-center gap-2">
            {quickLocations.map((loc) => (
              <button
                key={loc.name}
                onClick={() => handleQuickSelect(loc)}
                className="px-3 py-1.5 rounded-full bg-white/5 hover:bg-cyan-500/15 border border-white/10 hover:border-cyan-500/40 text-slate-300 hover:text-cyan-200 text-xs font-medium transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <MapPin className="w-3 h-3 text-cyan-400" />
                <span>{loc.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Real-Data Verification Footnote */}
        <div className="mt-8 flex items-center gap-2 text-[11px] text-slate-400 font-mono">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
          <span>Real Telemetry from Open-Meteo & Copernicus CAMS (No Fabricated Data)</span>
        </div>
      </motion.div>
    </div>
  );
};
