import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useToastStore } from '../../store/useToastStore'
import { Check, AlertCircle, Compass, X } from 'lucide-react'

export default function ToastContainer() {
  const { toasts, removeToast } = useToastStore();

  return (
    <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-2.5 max-w-[280px] w-full pointer-events-none">
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, y: 15, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.15 } }}
            className={`pointer-events-auto py-2.5 px-3 rounded-xl shadow-lg border flex items-center justify-between gap-2 text-[11px] font-bold relative overflow-hidden transition-all duration-300 ${
              toast.type === 'success'
                ? 'bg-emerald-600 border-emerald-700 text-white'
                : toast.type === 'error'
                ? 'bg-rose-600 border-rose-700 text-white'
                : toast.type === 'warning'
                ? 'bg-amber-500 border-amber-600 text-white'
                : 'bg-violet-600 border-violet-700 text-white'
            }`}
            style={{
              boxShadow: '0 4px 20px 0 rgba(0, 0, 0, 0.2)',
            }}
          >
            <div className="flex items-center gap-2 mb-0.5">
              {toast.type === 'success' && <Check className="w-4 h-4 text-white" />}
              {toast.type === 'error' && <AlertCircle className="w-4 h-4 text-white" />}
              {toast.type === 'warning' && <AlertCircle className="w-4 h-4 text-white" />}
              {toast.type === 'info' && <Compass className="w-4 h-4 text-white animate-spin" />}
              <span className="leading-tight">{toast.message}</span>
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-white/60 hover:text-white transition-colors flex-shrink-0 mb-0.5 z-10"
            >
              <X className="w-3.5 h-3.5" />
            </button>

            {/* 2-second linear loading progress bar */}
            <motion.div
              initial={{ width: "100%" }}
              animate={{ width: "0%" }}
              transition={{ duration: 2, ease: "linear" }}
              className="absolute bottom-0 left-0 h-0.5 bg-white/40"
            />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
