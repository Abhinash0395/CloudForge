import React, { useEffect } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  ShieldAlert,
  LineChart,
  Target,
  History,
  Sparkles,
  Camera,
  FileText,
  Settings,
  X,
  ChevronDown,
  Compass,
  RotateCcw,
} from 'lucide-react';
import { useLocationContext } from '../context/LocationContext';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenSettings: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose, onOpenSettings }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { resetToStartScreen, startRiskLens } = useLocationContext();

  // Close drawer on ESC key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const primaryNavItems = [
    {
      label: 'Start Screen',
      path: '/start',
      isStartScreen: true,
      aliases: ['/start'],
      icon: RotateCcw,
      emoji: '✨',
    },
    {
      label: 'Overview Dashboard',
      path: '/overview',
      aliases: ['/', '/overview'],
      icon: LayoutDashboard,
      emoji: '🏠',
    },
    {
      label: 'Location Intelligence',
      path: '/location-intelligence',
      aliases: ['/location-intelligence', '/location'],
      icon: Compass,
      emoji: '📍',
    },
    {
      label: 'Risk Analysis',
      path: '/risk-analysis',
      aliases: ['/risk-analysis', '/analysis', '/analysis/natural-language'],
      icon: ShieldAlert,
      emoji: '🛡️',
    },
    {
      label: 'Predictions',
      path: '/predictions',
      aliases: ['/predictions'],
      icon: LineChart,
      emoji: '📈',
    },
    {
      label: 'Decision Center',
      path: '/decision-center',
      aliases: ['/decision-center', '/decisions'],
      icon: Target,
      emoji: '🎯',
    },
    {
      label: 'AI Insights',
      path: '/ai-insights',
      aliases: ['/ai-insights', '/insights'],
      icon: Sparkles,
      emoji: '✨',
    },
    {
      label: 'Image Analysis',
      path: '/image-analysis',
      aliases: ['/image-analysis', '/analysis/image'],
      icon: Camera,
      emoji: '🖼️',
    },
    {
      label: 'History',
      path: '/history',
      aliases: ['/history'],
      icon: History,
      emoji: '🕘',
    },
    {
      label: 'Reports',
      path: '/reports',
      aliases: ['/reports'],
      icon: FileText,
      emoji: '📄',
    },
    {
      label: 'Settings',
      path: '/settings',
      aliases: ['/settings'],
      icon: Settings,
      emoji: '⚙️',
    },
  ];

  // Helper to check if item is currently active
  const isItemActive = (aliases: string[]) => {
    const current = location.pathname.toLowerCase();
    return aliases.some((a) => a.toLowerCase() === current);
  };

  const handleItemClick = (path: string, isStart?: boolean) => {
    if (isStart || path === '/start') {
      resetToStartScreen();
      navigate('/overview');
    } else {
      startRiskLens();
      navigate(path);
    }
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Subtle Dark Background Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
          />

          {/* Sliding Navigation Drawer from Left */}
          <motion.aside
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'tween', duration: 0.25, ease: [0.25, 1, 0.5, 1] }}
            className="fixed top-0 bottom-0 left-0 z-50 w-72 max-w-[85vw] bg-[#06111F] border-r border-[#1E3A5F]/50 shadow-2xl flex flex-col overflow-hidden"
          >
            {/* Top Brand Header */}
            <div className="h-20 px-6 border-b border-white/10 flex items-center justify-between bg-[#081B30]/50">
              <button
                onClick={() => handleItemClick('/')}
                className="flex items-center gap-3 group text-left"
              >
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-primary to-brand-purple p-0.5 flex items-center justify-center shadow-glow-primary flex-shrink-0">
                  <div className="w-full h-full bg-dark-950 rounded-[10px] flex items-center justify-center">
                    <ShieldAlert className="w-5 h-5 text-brand-accent" />
                  </div>
                </div>
                <div>
                  <div className="text-base font-extrabold tracking-tight text-white flex items-center gap-1">
                    RiskLens <span className="text-brand-purple">AI</span>
                  </div>
                  <div className="text-[10px] uppercase tracking-wider text-slate-400 font-mono">
                    Predict. Understand. Decide.
                  </div>
                </div>
              </button>

              {/* Close Button (✕) */}
              <button
                onClick={onClose}
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
                aria-label="Close navigation drawer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Navigation List */}
            <nav className="flex-1 overflow-y-auto px-4 py-4 space-y-1.5 custom-scrollbar">
              {primaryNavItems.map((item) => {
                const Icon = item.icon;
                const active = isItemActive(item.aliases);

                return (
                  <button
                    key={item.path}
                    onClick={() => handleItemClick(item.path, item.isStartScreen)}
                    className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-xs font-bold transition-all text-left group cursor-pointer ${
                      active
                        ? 'bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white shadow-glow-primary'
                        : 'text-slate-300 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      <Icon
                        className={`w-4 h-4 flex-shrink-0 transition-transform duration-200 group-hover:scale-110 ${
                          active ? 'text-white' : 'text-slate-400 group-hover:text-brand-accent'
                        }`}
                      />
                      <span className="truncate">{item.label}</span>
                    </div>

                    {active && (
                      <span className="w-1.5 h-1.5 rounded-full bg-white shadow-sm flex-shrink-0" />
                    )}
                  </button>
                );
              })}
            </nav>

            {/* Bottom Footer Section with Profile & System Status */}
            <div className="relative p-4 border-t border-white/10 space-y-3 bg-[#081B30]/60 overflow-hidden">
              {/* Mountain Silhouette subtle background */}
              <div
                className="absolute inset-0 opacity-15 pointer-events-none bg-cover bg-bottom mix-blend-screen"
                style={{ backgroundImage: `url('/images/sidebar_mountains.jpg')` }}
              />

              {/* System Online Pill */}
              <div className="relative z-10 px-3.5 py-2 rounded-xl bg-[#06111F]/80 border border-white/10 flex items-center gap-2.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-glow-low animate-pulse" />
                <div>
                  <div className="text-xs font-bold text-white leading-none">System Online</div>
                  <div className="text-[10px] text-slate-400 font-mono mt-0.5">All services running</div>
                </div>
              </div>

              {/* User Profile Card */}
              <button
                onClick={() => {
                  onOpenSettings();
                  onClose();
                }}
                className="relative z-10 w-full flex items-center justify-between p-2 rounded-xl hover:bg-white/5 transition-all text-left group"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <img
                    src="/images/avatar_abhinash.jpg"
                    alt="Abhinash Rai"
                    className="w-8 h-8 rounded-full object-cover border border-brand-primary/40 flex-shrink-0"
                  />
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-white truncate">Abhinash Rai</div>
                    <div className="text-[10px] text-slate-400 truncate">abhinash@example.com</div>
                  </div>
                </div>
                <ChevronDown className="w-4 h-4 text-slate-400 group-hover:text-white flex-shrink-0 ml-1" />
              </button>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
};
