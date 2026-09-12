import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Settings, User, Cpu, Bell, CheckCircle2, Shield } from 'lucide-react';
import { useToast } from '../context/ToastContext';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const [confidenceThreshold, setConfidenceThreshold] = useState(80);
  const [emailAlerts, setEmailAlerts] = useState(true);
  const toast = useToast();

  if (!isOpen) return null;

  const handleSave = () => {
    toast.success('Settings Saved', 'AI parameters and profile preferences updated.');
    onClose();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="w-full max-w-lg bg-dark-850 border border-white/10 rounded-2xl shadow-2xl p-6 space-y-5"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-white/10 pb-3.5">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-brand-primary/20 text-brand-accent">
                <Settings className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">System Settings</h3>
                <p className="text-xs text-slate-400">RiskLens AI Engine Configuration</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-all"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* User Profile */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
              <User className="w-4 h-4 text-brand-accent" />
              <span>Operator Profile</span>
            </label>
            <div className="p-3 rounded-xl bg-dark-800 border border-white/5 flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-brand-primary to-brand-purple flex items-center justify-center text-white text-xs font-bold font-mono">
                AR
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-xs font-bold text-white">Abhinash Rai</div>
                <div className="text-[11px] text-slate-400 font-mono">abhinash@example.com • Lead Architect</div>
              </div>
            </div>
          </div>

          {/* AI Settings */}
          <div className="space-y-2.5">
            <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
              <Cpu className="w-4 h-4 text-brand-purple" />
              <span>AI Engine & Thresholds</span>
            </label>
            <div className="p-3.5 rounded-xl bg-dark-800 border border-white/5 space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-slate-300">Confidence Threshold</span>
                <span className="font-mono font-bold text-brand-accent">{confidenceThreshold}%</span>
              </div>
              <input
                type="range"
                min={60}
                max={95}
                value={confidenceThreshold}
                onChange={(e) => setConfidenceThreshold(Number(e.target.value))}
                className="w-full accent-brand-primary cursor-pointer"
              />
              <div className="text-[10px] text-slate-400">
                Mode: <strong>Auto (Google Gemini + MFAE-v4 Fallback)</strong>
              </div>
            </div>
          </div>

          {/* Notifications */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
              <Bell className="w-4 h-4 text-amber-400" />
              <span>Notifications & Alerts</span>
            </label>
            <div className="p-3 rounded-xl bg-dark-800 border border-white/5 flex items-center justify-between">
              <span className="text-xs text-slate-300">Critical Risk Push Alerts</span>
              <input
                type="checkbox"
                checked={emailAlerts}
                onChange={(e) => setEmailAlerts(e.target.checked)}
                className="w-4 h-4 accent-brand-primary cursor-pointer"
              />
            </div>
          </div>

          {/* Buttons */}
          <div className="flex items-center gap-3 pt-2">
            <button
              onClick={onClose}
              className="flex-1 py-2 rounded-xl bg-dark-800 hover:bg-dark-750 text-slate-300 text-xs font-semibold transition-all"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="flex-1 py-2 rounded-xl bg-brand-primary hover:bg-brand-primary/90 text-white text-xs font-bold transition-all"
            >
              Save Changes
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
