import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  LayoutDashboard,
  ShieldAlert,
  LineChart,
  Target,
  Sparkles,
  Camera,
  History,
  FileText,
  Settings,
  SlidersHorizontal,
  Compass,
  Zap,
  ArrowRight,
  X,
  Radio,
  Activity,
  Bot
} from 'lucide-react';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
}

interface CommandItem {
  title: string;
  path: string;
  icon: React.ElementType;
  category: string;
  keywords?: string;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement | null>(null);
  const itemRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const navigationItems: CommandItem[] = [
    {
      title: 'Overview Dashboard & Live Meteorological Radar',
      path: '/overview',
      icon: LayoutDashboard,
      category: 'Core Platform',
      keywords: 'home weather open-meteo telemetry live radar map'
    },
    {
      title: 'New Risk Analysis (Structured & Multi-modal)',
      path: '/analysis',
      icon: ShieldAlert,
      category: 'Workbenches',
      keywords: 'create new evaluate calculate formula metrics'
    },
    {
      title: 'Natural Language AI Risk Assessment',
      path: '/analysis/natural-language',
      icon: Sparkles,
      category: 'Workbenches',
      keywords: 'nlp text narrative report document unstructured'
    },
    {
      title: 'Computer Vision & Edge Sensor Scan',
      path: '/analysis/image',
      icon: Camera,
      category: 'Workbenches',
      keywords: 'cv vision satellite aerial flood image upload'
    },
    {
      title: 'Pre-configured Scenarios Center (5 Domain Scenarios)',
      path: '/scenarios',
      icon: Compass,
      category: 'Simulations',
      keywords: 'flood power grid supply chain aviation wind turbine preset'
    },
    {
      title: 'What-If Monte Carlo Scenario Simulator',
      path: '/simulator',
      icon: SlidersHorizontal,
      category: 'Intelligence',
      keywords: 'what-if monte carlo perturbation sliders sensitivity delta'
    },
    {
      title: 'Decision Center & Action Prioritization Queue',
      path: '/decisions',
      icon: Target,
      category: 'Decision Support',
      keywords: 'mitigation actions priority 1 2 3 emergency protocols'
    },
    {
      title: 'Explainable AI & Factor Contribution Breakdown',
      path: '/explainability',
      icon: Activity,
      category: 'Explainable AI',
      keywords: 'shap weights formula explain why drivers factors'
    },
    {
      title: 'Prediction & Multi-Horizon Forecasting Engine',
      path: '/predictions',
      icon: LineChart,
      category: 'Forecasting',
      keywords: 'forecast 24h 72h 7day trajectory projection trend'
    },
    {
      title: 'Real-Time AI Anomaly Feed & Early Warnings',
      path: '/insights',
      icon: Zap,
      category: 'Intelligence',
      keywords: 'anomalies signals alerts notifications feed'
    },
    {
      title: 'Analysis History & Scenario Comparison',
      path: '/history',
      icon: History,
      category: 'Historical Intelligence',
      keywords: 'runs logs past records compare delta benchmark'
    },
    {
      title: 'Certified Audit Reports & PDF Generator',
      path: '/reports',
      icon: FileText,
      category: 'Documentation',
      keywords: 'pdf executive report compliance provenance export'
    },
    {
      title: 'Data Source Registry & System Configuration',
      path: '/settings',
      icon: Settings,
      category: 'Configuration',
      keywords: 'providers api status open-meteo copernicus latency keys'
    }
  ];

  const filteredItems = navigationItems.filter((item) => {
    const q = query.toLowerCase().trim();
    if (!q) return true;
    return (
      item.title.toLowerCase().includes(q) ||
      item.category.toLowerCase().includes(q) ||
      (item.keywords && item.keywords.toLowerCase().includes(q))
    );
  });

  // Focus input when opened & reset state
  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  // Reset selectedIndex when query changes
  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  // Scroll active item into view
  useEffect(() => {
    if (itemRefs.current[selectedIndex]) {
      itemRefs.current[selectedIndex]?.scrollIntoView({
        block: 'nearest',
        behavior: 'smooth'
      });
    }
  }, [selectedIndex]);

  // Handle keyboard shortcuts when command palette is open
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
        return;
      }

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => (filteredItems.length > 0 ? (prev + 1) % filteredItems.length : 0));
        return;
      }

      if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) =>
          filteredItems.length > 0 ? (prev - 1 + filteredItems.length) % filteredItems.length : 0
        );
        return;
      }

      if (e.key === 'Enter') {
        e.preventDefault();
        if (filteredItems.length > 0 && filteredItems[selectedIndex]) {
          handleSelect(filteredItems[selectedIndex].path);
        }
        return;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, filteredItems, selectedIndex, onClose]);

  const handleSelect = (path: string) => {
    navigate(path);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          onClick={(e) => {
            if (e.target === e.currentTarget) onClose();
          }}
          className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-150"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: -15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -15 }}
            transition={{ duration: 0.15 }}
            className="w-full max-w-2xl bg-[#081B30] rounded-2xl border border-cyan-500/40 shadow-[0_0_50px_rgba(6,182,212,0.25)] overflow-hidden flex flex-col"
          >
            {/* Search Input Bar */}
            <div className="flex items-center px-4 py-3.5 border-b border-cyan-500/20 bg-[#06111F]/90 gap-3">
              <Search className="w-5 h-5 text-cyan-400 flex-shrink-0" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search commands, views, preset scenarios (e.g. 'flood', 'simulate', 'radar')..."
                className="w-full bg-transparent text-sm text-white placeholder-slate-400 focus:outline-none"
              />
              {query && (
                <button
                  onClick={() => setQuery('')}
                  className="text-slate-400 hover:text-white p-1 rounded hover:bg-white/10 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
              <kbd className="hidden sm:inline-block px-2 py-0.5 text-[10px] font-mono text-cyan-300 bg-[#0B2544] rounded border border-cyan-500/30">
                ESC
              </kbd>
            </div>

            {/* Results list */}
            <div className="max-h-96 overflow-y-auto p-2 space-y-1 custom-scrollbar">
              {filteredItems.length === 0 ? (
                <div className="p-8 text-center text-slate-400 text-sm">
                  <div className="w-10 h-10 mx-auto mb-2 rounded-full bg-cyan-950/60 flex items-center justify-center text-cyan-400 border border-cyan-500/30">
                    <Search className="w-5 h-5" />
                  </div>
                  No matching platform commands found for "{query}".
                </div>
              ) : (
                filteredItems.map((item, idx) => {
                  const Icon = item.icon;
                  const isSelected = idx === selectedIndex;

                  return (
                    <button
                      key={item.title}
                      ref={(el) => (itemRefs.current[idx] = el)}
                      onClick={() => handleSelect(item.path)}
                      onMouseEnter={() => setSelectedIndex(idx)}
                      className={`w-full flex items-center justify-between p-3 rounded-xl text-left transition-all group cursor-pointer ${
                        isSelected
                          ? 'bg-cyan-500/15 border border-cyan-500/40 shadow-sm text-white'
                          : 'hover:bg-cyan-500/10 border border-transparent text-slate-200'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`p-2 rounded-lg transition-colors ${
                            isSelected
                              ? 'bg-cyan-500/30 text-cyan-300 shadow-[0_0_12px_rgba(6,182,212,0.4)]'
                              : 'bg-[#0B2544] text-cyan-400 group-hover:bg-cyan-500/20'
                          }`}
                        >
                          <Icon className="w-4 h-4" />
                        </div>
                        <div>
                          <div
                            className={`text-sm font-semibold transition-colors ${
                              isSelected ? 'text-white' : 'text-slate-200 group-hover:text-white'
                            }`}
                          >
                            {item.title}
                          </div>
                          <div className="text-[11px] text-cyan-400/80 font-mono flex items-center gap-1.5 mt-0.5">
                            <span>{item.category}</span>
                            <span>•</span>
                            <span className="text-slate-400 text-[10px]">{item.path}</span>
                          </div>
                        </div>
                      </div>
                      <ArrowRight
                        className={`w-4 h-4 transition-all ${
                          isSelected
                            ? 'text-cyan-400 translate-x-1'
                            : 'text-slate-500 group-hover:text-cyan-400 group-hover:translate-x-1'
                        }`}
                      />
                    </button>
                  );
                })
              )}
            </div>

            {/* Command palette footer */}
            <div className="px-4 py-2.5 bg-[#06111F] border-t border-cyan-500/20 flex items-center justify-between text-[11px] text-slate-400">
              <span className="flex items-center gap-2 font-mono">
                <kbd className="px-1.5 py-0.5 rounded bg-[#0B2544] text-[10px] text-cyan-300 border border-cyan-500/30">
                  ↑
                </kbd>
                <kbd className="px-1.5 py-0.5 rounded bg-[#0B2544] text-[10px] text-cyan-300 border border-cyan-500/30">
                  ↓
                </kbd>
                <span>Navigate</span>
              </span>
              <span className="flex items-center gap-1.5 font-mono">
                <kbd className="px-1.5 py-0.5 rounded bg-[#0B2544] text-[10px] text-cyan-300 border border-cyan-500/30">
                  ↵
                </kbd>
                <span>Select</span>
              </span>
              <span className="flex items-center gap-1.5 font-mono text-[10px] text-cyan-400">
                <span>Ctrl + K to Toggle</span>
              </span>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
