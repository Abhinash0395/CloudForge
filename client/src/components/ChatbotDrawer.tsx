import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import {
  Sparkles,
  X,
  Send,
  RotateCcw,
  Copy,
  Check,
  ExternalLink,
  ShieldCheck,
  Database,
  ArrowRight,
  Info,
  Clock,
  Layers,
  Cpu,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  MapPin,
} from 'lucide-react';
import { api } from '../services/api';
import { ChatSource, ChatResponse } from '../types';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  sources?: ChatSource[];
  suggestedActions?: string[];
  meta?: {
    isLive?: boolean;
    confidence?: number;
    model?: string;
    location?: string;
  };
}

const PAGE_SUGGESTIONS: Record<string, string[]> = {
  '/': [
    'How does RiskLens calculate composite risk?',
    'What live meteorological feeds are connected?',
    'Explain the Gorakhpur scenario risk score',
    'How does RiskLens eliminate AI hallucinations?'
  ],
  '/overview': [
    'How does RiskLens calculate composite risk?',
    'What live meteorological feeds are connected?',
    'Explain the Gorakhpur scenario risk score',
    'How does RiskLens eliminate AI hallucinations?'
  ],
  '/analysis': [
    'Why is the composite risk score high?',
    'What physical factor had the largest weight?',
    'What if 24h rainfall increases by 30%?',
    'What mitigation actions should be prioritized?'
  ],
  '/predictions': [
    'Explain the 72-hour forecast projection',
    'How is the confidence score calculated?',
    'What is the difference between baseline & forecast?',
    'What if peak hourly rainfall doubles?'
  ],
  '/decisions': [
    'What is the impact of executing Priority 1 actions?',
    'How do mitigation actions reduce risk score?',
    'Who are the designated emergency contacts?',
    'What happens if we dismiss non-urgent alerts?'
  ],
  '/live-monitor': [
    'What is the data freshness of Open-Meteo feeds?',
    'How are Copernicus CAMS air quality metrics mapped?',
    'What is the fallback mechanism if an API drops?',
    'How does location geocoding validation work?'
  ],
  '/history': [
    'Compare the current analysis with previous runs',
    'Which scenario showed the highest historical risk?',
    'How is risk trajectory evaluated over time?'
  ],
  '/reports': [
    'What deterministic models are cited in the report?',
    'Is this report certified for enterprise compliance?',
    'How are citation timestamps verified?'
  ]
};

const DEFAULT_SUGGESTIONS = [
  'How does RiskLens calculate composite risk?',
  'What live data providers are connected?',
  'What if rainfall increases by 30%?',
  'Explain the 4-tier risk threshold scale'
];

import { useLocationContext } from '../context/LocationContext';

export const ChatbotDrawer: React.FC = () => {
  const { selectedLocation, locationData } = useLocationContext();
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [expandedSources, setExpandedSources] = useState<Record<string, boolean>>({});
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content:
        '**Welcome to RiskLens AI Copilot.**\n\nI am your decision-intelligence copilot grounded in **live physical telemetry**, **deterministic calculation engines**, and verified database records.\n\nAsk me about risk calculations, what-if simulations, live data sources, or recommended mitigation actions.',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      sources: [
        {
          name: 'RiskLens Deterministic Core & Open-Meteo',
          type: 'GROUNDED_ENGINE',
          endpoint: 'Live Context + /knowledge RAG'
        }
      ]
    }
  ]);

  const location = useLocation();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Dynamic suggestions including current location questions
  const locationSuggestions = [
    `What is the weather in ${selectedLocation.name}?`,
    `Why is the risk score evaluated at ${locationData?.risk?.compositeRiskScore ?? 42}/100?`,
    `Compare ${selectedLocation.name} with Delhi`,
    'What data sources were used for this calculation?'
  ];

  // Determine suggestions based on current path
  const currentPath = location.pathname.toLowerCase();
  const suggestions = locationSuggestions;

  // Auto scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
      setTimeout(() => inputRef.current?.focus(), 200);
    }
  }, [isOpen, messages]);

  const handleSend = async (textToSend?: string) => {
    const query = (textToSend || input).trim();
    if (!query || loading) return;

    const userMessageId = `user-${Date.now()}`;
    const newUserMsg: Message = {
      id: userMessageId,
      role: 'user',
      content: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, newUserMsg]);
    setInput('');
    setLoading(true);

    try {
      // Build conversation history for context
      const historyPayload = messages
        .filter((m) => m.id !== 'welcome')
        .slice(-6)
        .map((m) => ({ role: m.role, content: m.content }));

      const response: ChatResponse = await api.sendChatMessage({
        message: query,
        currentPage: location.pathname,
        currentLocation: selectedLocation.formattedName || selectedLocation.name,
        history: historyPayload
      });

      const assistantMsg: Message = {
        id: `asst-${Date.now()}`,
        role: 'assistant',
        content: response.answer,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        sources: response.sources,
        suggestedActions: response.suggestedActions,
        meta: {
          isLive: response.meta?.isLive,
          confidence: response.meta?.confidence,
          model: response.meta?.model,
          location: response.meta?.location
        }
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err: any) {
      const errorMsg: Message = {
        id: `err-${Date.now()}`,
        role: 'assistant',
        content: `⚠️ **Unable to process query.** ${err?.message || 'Please check your connection and try again.'}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleClearChat = () => {
    setMessages([
      {
        id: 'welcome-reset',
        role: 'assistant',
        content:
          '**Chat session reset.**\n\nI am ready to answer grounded questions about active risk analyses, physical parameters, live telemetry, and decisions.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        sources: [
          {
            name: 'RiskLens Deterministic Core',
            type: 'SYSTEM'
          }
        ]
      }
    ]);
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const toggleSources = (msgId: string) => {
    setExpandedSources((prev) => ({
      ...prev,
      [msgId]: !prev[msgId]
    }));
  };

  // Render markdown formatting
  const renderFormattedContent = (content: string) => {
    const lines = content.split('\n');
    return (
      <div className="space-y-2 text-[13px] leading-relaxed break-words">
        {lines.map((line, idx) => {
          const trimmed = line.trim();
          if (!trimmed) {
            return <div key={idx} className="h-1" />;
          }

          // Headers
          if (trimmed.startsWith('### ')) {
            return (
              <h5 key={idx} className="font-bold text-cyan-300 text-xs tracking-wider uppercase mt-2 mb-1">
                {trimmed.replace('### ', '')}
              </h5>
            );
          }
          if (trimmed.startsWith('## ')) {
            return (
              <h4 key={idx} className="font-bold text-white text-sm mt-2 mb-1 border-b border-cyan-500/20 pb-0.5">
                {trimmed.replace('## ', '')}
              </h4>
            );
          }
          if (trimmed.startsWith('# ')) {
            return (
              <h3 key={idx} className="font-bold text-cyan-400 text-base mt-2 mb-1">
                {trimmed.replace('# ', '')}
              </h3>
            );
          }

          // Bullet points
          if (trimmed.startsWith('- ') || trimmed.startsWith('* ') || trimmed.startsWith('• ')) {
            const rawText = trimmed.replace(/^[-*•]\s*/, '');
            return (
              <div key={idx} className="flex items-start gap-2 pl-1">
                <span className="text-cyan-400 font-bold text-xs mt-1">•</span>
                <span className="flex-1">{formatInline(rawText)}</span>
              </div>
            );
          }

          // Numbered lists
          const numMatch = trimmed.match(/^(\d+)\.\s*(.*)/);
          if (numMatch) {
            return (
              <div key={idx} className="flex items-start gap-2 pl-1">
                <span className="text-cyan-400 font-mono text-xs font-semibold mt-0.5">{numMatch[1]}.</span>
                <span className="flex-1">{formatInline(numMatch[2])}</span>
              </div>
            );
          }

          // Regular paragraph
          return <p key={idx}>{formatInline(trimmed)}</p>;
        })}
      </div>
    );
  };

  // Helper for inline bold, code, and links
  const formatInline = (text: string) => {
    const parts = text.split(/(\*\*.*?\*\*|`.*?`)/g);
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return (
          <strong key={i} className="font-semibold text-white">
            {part.slice(2, -2)}
          </strong>
        );
      }
      if (part.startsWith('`') && part.endsWith('`')) {
        return (
          <code key={i} className="px-1.5 py-0.5 rounded bg-cyan-950/70 border border-cyan-500/30 text-cyan-300 font-mono text-xs">
            {part.slice(1, -1)}
          </code>
        );
      }
      return part;
    });
  };

  return (
    <>
      {/* 1. Floating Action Trigger Button (Bottom Right) */}
      <button
        onClick={() => setIsOpen(true)}
        aria-label="Open RiskLens AI Copilot"
        className={`fixed bottom-6 right-6 z-40 group flex items-center gap-2.5 px-4 py-3 rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-medium shadow-[0_0_25px_rgba(6,182,212,0.45)] hover:shadow-[0_0_35px_rgba(6,182,212,0.7)] transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer ${
          isOpen ? 'opacity-0 pointer-events-none' : 'opacity-100'
        }`}
      >
        <div className="relative">
          <Sparkles className="w-5 h-5 text-cyan-100 group-hover:rotate-12 transition-transform duration-300" />
          <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-400 rounded-full ring-2 ring-[#081B30] animate-pulse" />
        </div>
        <span className="text-sm font-semibold tracking-wide">RiskLens Copilot</span>
        <span className="hidden md:inline-block text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-black/30 border border-white/20 text-cyan-200">
          Grounded RAG
        </span>
      </button>

      {/* 2. Slide-Over Backdrop */}
      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 transition-opacity animate-in fade-in duration-200"
        />
      )}

      {/* 3. Slide-Over Copilot Drawer */}
      <div
        className={`fixed top-0 right-0 h-full w-full sm:w-[440px] max-w-[95vw] bg-[#081B30] border-l border-cyan-500/30 z-50 shadow-2xl flex flex-col transition-transform duration-300 ease-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="p-4 border-b border-cyan-500/20 bg-[#06111F]/95 backdrop-blur-md flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="relative p-2 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-600/20 border border-cyan-500/40 text-cyan-400">
              <Sparkles className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-emerald-400 rounded-full animate-ping" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-white tracking-wide">RiskLens AI Copilot</h3>
                <span className="flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full font-medium bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Live Grounded
                </span>
              </div>
              <p className="text-[11px] text-slate-400">Ask about your risk, data & decisions</p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={handleClearChat}
              title="Reset conversation"
              className="p-1.5 rounded-lg text-slate-400 hover:text-cyan-400 hover:bg-cyan-500/10 transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
            <button
              onClick={() => setIsOpen(false)}
              title="Close Copilot"
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Active Location Anchoring Context Bar */}
        <div className="px-4 py-2 bg-white/5 border-b border-white/10 flex items-center justify-between text-xs shrink-0">
          <div className="flex items-center gap-1.5 text-slate-300 truncate">
            <MapPin className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0" />
            <span className="truncate">
              Grounded Location: <strong className="text-white">{selectedLocation.name}</strong>
            </span>
          </div>
          {locationData?.risk && (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 flex-shrink-0">
              Score: {locationData.risk.compositeRiskScore}/100
            </span>
          )}
        </div>

        {/* Message Stream */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar text-slate-200">
          {messages.map((msg) => {
            const isUser = msg.role === 'user';
            const isExpanded = !!expandedSources[msg.id];

            return (
              <div
                key={msg.id}
                className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} space-y-1.5 animate-in fade-in slide-in-from-bottom-2 duration-200`}
              >
                {/* Sender Identity & Time */}
                <div className="flex items-center gap-1.5 text-[10px] text-slate-400 px-1 font-mono">
                  <span>{isUser ? 'You' : 'RiskLens Copilot'}</span>
                  <span>•</span>
                  <span>{msg.timestamp}</span>
                </div>

                {/* Bubble Container */}
                <div
                  className={`relative p-3.5 rounded-2xl max-w-[92%] ${
                    isUser
                      ? 'bg-gradient-to-br from-cyan-600/90 to-blue-700/90 text-white rounded-tr-none shadow-md border border-cyan-400/30'
                      : 'bg-[#06111F]/90 border border-cyan-500/25 text-slate-200 rounded-tl-none shadow-lg'
                  }`}
                >
                  {/* Content */}
                  {isUser ? (
                    <p className="text-[13px] leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                  ) : (
                    renderFormattedContent(msg.content)
                  )}

                  {/* Sources Attribution Badge (If Assistant and Sources present) */}
                  {!isUser && msg.sources && msg.sources.length > 0 && (
                    <div className="mt-3 pt-2.5 border-t border-cyan-500/15">
                      <button
                        onClick={() => toggleSources(msg.id)}
                        className="flex items-center justify-between w-full text-[11px] text-cyan-400 hover:text-cyan-300 font-medium py-1 px-2 rounded bg-cyan-950/40 border border-cyan-500/20 transition-colors"
                      >
                        <span className="flex items-center gap-1.5">
                          <Database className="w-3.5 h-3.5" />
                          Grounded in {msg.sources.length} Data Source{msg.sources.length > 1 ? 's' : ''}
                        </span>
                        {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                      </button>

                      {/* Expanded Source Details */}
                      {isExpanded && (
                        <div className="mt-2 space-y-1.5 text-[11px] bg-black/40 p-2 rounded-lg border border-cyan-500/20 animate-in fade-in">
                          {msg.sources.map((src, sIdx) => (
                            <div key={sIdx} className="flex items-start justify-between gap-2 border-b border-white/5 pb-1 last:border-0 last:pb-0">
                              <div>
                                <span className="font-semibold text-white">{src.name}</span>
                                {src.endpoint && <p className="text-[10px] text-slate-400 font-mono">{src.endpoint}</p>}
                                {src.section && <p className="text-[10px] text-cyan-400">Section: {src.section}</p>}
                              </div>
                              {src.confidence && (
                                <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                                  {Math.round(src.confidence * 100)}% Match
                                </span>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Follow-up Suggested Action Pills */}
                  {!isUser && msg.suggestedActions && msg.suggestedActions.length > 0 && (
                    <div className="mt-3 pt-2 border-t border-cyan-500/15">
                      <p className="text-[10px] uppercase font-mono text-cyan-400 font-semibold mb-1.5">
                        Suggested Actions:
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {msg.suggestedActions.map((action: any, aIdx: number) => {
                          const label = typeof action === 'object' && action !== null ? (action.label || action.prompt) : String(action);
                          const prompt = typeof action === 'object' && action !== null ? (action.prompt || action.label) : String(action);
                          return (
                            <button
                              key={aIdx}
                              onClick={() => handleSend(prompt)}
                              className="text-[11px] text-left px-2.5 py-1 rounded-lg bg-[#0B2544] hover:bg-cyan-600/30 text-cyan-200 border border-cyan-500/30 transition-all flex items-center gap-1 group cursor-pointer"
                            >
                              <span>{label}</span>
                              <ArrowRight className="w-3 h-3 text-cyan-400 group-hover:translate-x-0.5 transition-transform" />
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Message Action Utilities (Copy) */}
                  {!isUser && (
                    <div className="mt-2.5 flex items-center justify-end gap-2 text-[11px] text-slate-400">
                      <button
                        onClick={() => handleCopy(msg.content, msg.id)}
                        className="flex items-center gap-1 hover:text-white transition-colors"
                        title="Copy message"
                      >
                        {copiedId === msg.id ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                            <span className="text-[10px] text-emerald-400">Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span className="text-[10px]">Copy</span>
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {/* Typing / Loading Indicator */}
          {loading && (
            <div className="flex flex-col items-start space-y-1.5 animate-in fade-in">
              <div className="text-[10px] text-slate-400 px-1 font-mono">RiskLens Copilot • Processing</div>
              <div className="p-3.5 rounded-2xl rounded-tl-none bg-[#06111F] border border-cyan-500/30 text-cyan-300 flex items-center gap-3">
                <div className="flex space-x-1.5">
                  <div className="w-2 h-2 rounded-full bg-cyan-400 animate-bounce [animation-delay:-0.3s]" />
                  <div className="w-2 h-2 rounded-full bg-cyan-400 animate-bounce [animation-delay:-0.15s]" />
                  <div className="w-2 h-2 rounded-full bg-cyan-400 animate-bounce" />
                </div>
                <span className="text-xs text-slate-300 font-medium">
                  Grounded reasoning via deterministic models & live context...
                </span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Dynamic Contextual Suggestions Bar */}
        <div className="p-3 bg-[#06111F]/90 border-t border-cyan-500/20 shrink-0">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] uppercase tracking-wider font-semibold text-slate-400 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-cyan-400" />
              Suggested on this page
            </span>
          </div>
          <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar">
            {suggestions.map((sug, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(sug)}
                disabled={loading}
                className="whitespace-nowrap shrink-0 text-[11px] px-2.5 py-1 rounded-full bg-[#0B2544]/80 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 hover:border-cyan-400 transition-colors disabled:opacity-50"
              >
                {sug}
              </button>
            ))}
          </div>
        </div>

        {/* Input Bar */}
        <div className="p-3 bg-[#06111F] border-t border-cyan-500/20 shrink-0">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-2"
          >
            <div className="relative flex-1">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about risk, live data, or what-if..."
                disabled={loading}
                className="w-full bg-[#0B2544]/60 border border-cyan-500/30 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all disabled:opacity-50"
              />
            </div>
            <button
              type="submit"
              disabled={!input.trim() || loading}
              aria-label="Send message"
              className="p-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white disabled:opacity-40 hover:shadow-[0_0_15px_rgba(6,182,212,0.4)] transition-all shrink-0 cursor-pointer disabled:cursor-not-allowed"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
          <div className="mt-2 flex items-center justify-between text-[10px] text-slate-500 px-1 font-mono">
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3 h-3 text-cyan-400" />
              Zero fabrication policy
            </span>
            <span>Deterministic RAG</span>
          </div>
        </div>
      </div>
    </>
  );
};
