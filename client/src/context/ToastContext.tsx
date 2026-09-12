import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, AlertTriangle, AlertCircle, Info, X } from 'lucide-react';

export interface Toast {
  id: string;
  title: string;
  message?: string;
  type: 'success' | 'warning' | 'error' | 'info';
  duration?: number;
}

interface ToastContextType {
  addToast: (toast: Omit<Toast, 'id'>) => void;
  success: (title: string, message?: string) => void;
  error: (title: string, message?: string) => void;
  warning: (title: string, message?: string) => void;
  info: (title: string, message?: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback(
    ({ title, message, type = 'info', duration = 4000 }: Omit<Toast, 'id'>) => {
      const id = Math.random().toString(36).substring(2, 9);
      setToasts((prev) => [...prev, { id, title, message, type, duration }]);

      setTimeout(() => {
        removeToast(id);
      }, duration);
    },
    [removeToast]
  );

  const success = useCallback((title: string, message?: string) => addToast({ title, message, type: 'success' }), [addToast]);
  const error = useCallback((title: string, message?: string) => addToast({ title, message, type: 'error' }), [addToast]);
  const warning = useCallback((title: string, message?: string) => addToast({ title, message, type: 'warning' }), [addToast]);
  const info = useCallback((title: string, message?: string) => addToast({ title, message, type: 'info' }), [addToast]);

  const value = useMemo(
    () => ({ addToast, success, error, warning, info }),
    [addToast, success, error, warning, info]
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col space-y-3 max-w-md w-full pointer-events-none">
        <AnimatePresence>
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.15 } }}
              className={`pointer-events-auto p-4 rounded-xl border glass-panel shadow-2xl flex items-start space-x-3 backdrop-blur-xl ${
                toast.type === 'success'
                  ? 'border-risk-low/40 bg-risk-low/10 text-slate-100'
                  : toast.type === 'error'
                  ? 'border-risk-critical/40 bg-risk-critical/10 text-slate-100'
                  : toast.type === 'warning'
                  ? 'border-risk-moderate/40 bg-risk-moderate/10 text-slate-100'
                  : 'border-brand-primary/40 bg-brand-primary/10 text-slate-100'
              }`}
            >
              <div className="flex-shrink-0 mt-0.5">
                {toast.type === 'success' && <CheckCircle2 className="w-5 h-5 text-risk-low" />}
                {toast.type === 'error' && <AlertCircle className="w-5 h-5 text-risk-critical" />}
                {toast.type === 'warning' && <AlertTriangle className="w-5 h-5 text-risk-moderate" />}
                {toast.type === 'info' && <Info className="w-5 h-5 text-brand-accent" />}
              </div>
              <div className="flex-1 min-w-0 pr-2">
                <div className="text-sm font-semibold tracking-tight">{toast.title}</div>
                {toast.message && <div className="text-xs text-slate-300 mt-0.5 leading-relaxed">{toast.message}</div>}
              </div>
              <button
                onClick={() => removeToast(toast.id)}
                className="text-slate-400 hover:text-white transition-colors p-1"
                aria-label="Close notification"
              >
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};
