'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, AlertCircle, X, Info } from 'lucide-react';
import clsx from 'clsx';

type ToastType = 'success' | 'error' | 'info';

interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextType {
  toast: (message: string, type?: ToastType) => void;
  success: (message: string) => void;
  error: (message: string) => void;
  info: (message: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const addToast = useCallback((message: string, type: ToastType = 'info') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);

    // Auto-dismiss
    setTimeout(() => {
      removeToast(id);
    }, 5000);
  }, [removeToast]);

  const success = (message: string) => addToast(message, 'success');
  const error = (message: string) => addToast(message, 'error');
  const info = (message: string) => addToast(message, 'info');

  return (
    <ToastContext.Provider value={{ toast: addToast, success, error, info }}>
      {children}
      <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 pointer-events-none">
        <AnimatePresence mode="popLayout">
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              layout
              initial={{ opacity: 0, y: 50, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
              className="pointer-events-auto"
            >
              <div
                className={clsx(
                  "min-w-[300px] max-w-md p-4 rounded-2xl shadow-2xl backdrop-blur-xl border flex items-center gap-3",
                  toast.type === 'success' && "bg-green-500/10 border-green-500/20 text-green-500",
                  toast.type === 'error' && "bg-red-500/10 border-red-500/20 text-red-500",
                  toast.type === 'info' && "bg-blue-500/10 border-blue-500/20 text-blue-500",
                  "bg-card/90" // Fallback/Mix
                )}
              >
                <div className={clsx(
                  "p-2 rounded-full",
                  toast.type === 'success' && "bg-green-500/20",
                  toast.type === 'error' && "bg-red-500/20",
                  toast.type === 'info' && "bg-blue-500/20"
                )}>
                    {toast.type === 'success' && <CheckCircle2 className="w-5 h-5" />}
                    {toast.type === 'error' && <AlertCircle className="w-5 h-5" />}
                    {toast.type === 'info' && <Info className="w-5 h-5" />}
                </div>
                
                <p className="flex-1 font-medium text-sm text-txt-primary">{toast.message}</p>

                <button 
                    onClick={() => removeToast(toast.id)}
                    className="p-1 hover:bg-white/10 rounded-full transition-colors text-txt-tertiary hover:text-txt-primary"
                >
                    <X className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}
