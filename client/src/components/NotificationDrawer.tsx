import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ShieldAlert, Sparkles, CheckCircle2, Bell, Check } from 'lucide-react';
import { NotificationItem } from '../types';

interface NotificationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: NotificationItem[];
  onMarkAllRead: () => void;
}

export const NotificationDrawer: React.FC<NotificationDrawerProps> = ({
  isOpen,
  onClose,
  notifications,
  onMarkAllRead,
}) => {
  const getIcon = (type: string, severity: string) => {
    if (severity === 'CRITICAL') return <ShieldAlert className="w-5 h-5 text-risk-critical" />;
    if (severity === 'WARNING') return <ShieldAlert className="w-5 h-5 text-risk-moderate" />;
    if (severity === 'SUCCESS') return <CheckCircle2 className="w-5 h-5 text-risk-low" />;
    return <Sparkles className="w-5 h-5 text-brand-accent" />;
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
          />

          {/* Drawer Flyout */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 bottom-0 w-full max-w-md z-50 glass-panel bg-dark-900/95 border-l border-white/10 shadow-2xl flex flex-col"
          >
            {/* Header */}
            <div className="p-5 border-b border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-brand-primary/20 text-brand-primary">
                  <Bell className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">System Alerts & Feeds</h3>
                  <div className="text-xs text-slate-400">
                    {notifications.filter((n) => !n.isRead).length} unread updates
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={onMarkAllRead}
                  className="px-2.5 py-1 text-xs font-semibold text-brand-accent hover:text-white bg-brand-primary/10 hover:bg-brand-primary/20 rounded-lg border border-brand-accent/20 transition-all flex items-center gap-1"
                >
                  <Check className="w-3.5 h-3.5" />
                  Mark Read
                </button>
                <button
                  onClick={onClose}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-all"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Notification Stream */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {notifications.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center text-slate-400 p-8">
                  <Bell className="w-10 h-10 text-slate-600 mb-3" />
                  <p className="text-sm font-medium">No alerts at this moment</p>
                  <p className="text-xs text-slate-500 mt-1">All telemetry sensors and decision engines normal.</p>
                </div>
              ) : (
                notifications.map((item) => (
                  <div
                    key={item.id}
                    className={`p-4 rounded-xl border transition-all ${
                      item.isRead
                        ? 'bg-dark-850/40 border-white/5 opacity-75'
                        : 'bg-dark-800/80 border-brand-primary/30 shadow-sm'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5 flex-shrink-0">
                        {getIcon(item.type, item.severity)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-semibold text-white tracking-tight">
                            {item.title}
                          </span>
                          {!item.isRead && (
                            <span className="w-2 h-2 rounded-full bg-brand-accent animate-pulse" />
                          )}
                        </div>
                        <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                          {item.message}
                        </p>
                        <div className="mt-2 text-[10px] text-slate-500 font-mono">
                          {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • System Autonomous Dispatch
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Footer */}
            <div className="p-4 bg-dark-950/80 border-t border-white/5 text-center text-xs text-slate-400">
              RiskLens Real-Time Intelligence Event Stream
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
