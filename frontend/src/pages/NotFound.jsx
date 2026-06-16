import React from 'react'
import { Link } from 'react-router-dom'
import { Compass, HelpCircle, ArrowLeft } from 'lucide-react'
import { motion } from 'framer-motion'

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-[#F3EEFF] to-white dark:from-[#0A0516] dark:to-[#06020E] relative overflow-hidden">
      
      {/* Glow Orbs */}
      <div className="neon-glow-circle w-[400px] h-[400px] bg-primary/20 -top-20 -left-20"></div>

      <div className="max-w-md w-full relative z-10 text-center space-y-6">
        
        {/* Logo home */}
        <div className="flex justify-center mb-4">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-primary to-primary-light flex items-center justify-center shadow-md shadow-primary/20">
              <Compass className="w-5 h-5 text-white" />
            </div>
            <span className="font-display font-extrabold text-xl tracking-tight bg-gradient-to-r from-primary to-primary-light bg-clip-text text-transparent dark:from-purple-300 dark:to-white">
              Indian Travel <span className="text-primary dark:text-purple-400">AI</span>
            </span>
          </Link>
        </div>

        {/* Card */}
        <div className="clay-card p-8 md:p-10 bg-white/80 dark:bg-slate-900/60 shadow-xl border border-slate-200/50 dark:border-slate-800/40">
          
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 15, repeat: Infinity, ease: 'linear' }}
            className="w-16 h-16 rounded-full bg-purple-50 text-primary flex items-center justify-center mx-auto mb-6 dark:bg-purple-950/40 dark:text-purple-300"
          >
            <Compass className="w-8 h-8" />
          </motion.div>

          <h2 className="text-4xl font-display font-extrabold text-slate-950 dark:text-white leading-tight">404</h2>
          <h3 className="text-xl font-display font-extrabold text-primary-dark dark:text-purple-300 mt-2">Lost in India? 🗺️</h3>
          <p className="mt-4 text-xs text-slate-500 leading-relaxed font-semibold max-w-xs mx-auto">
            It seems the travel path you are exploring does not exist in our AI database. Let's redirect you to the main route!
          </p>

          <div className="pt-8">
            <Link
              to="/"
              className="clay-btn-primary py-3.5 px-6 text-xs flex items-center justify-center gap-2"
            >
              <ArrowLeft className="w-4.5 h-4.5" />
              <span>Back to Home Route</span>
            </Link>
          </div>

        </div>

      </div>
    </div>
  )
}
