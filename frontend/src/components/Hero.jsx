import React from 'react'
import { motion } from 'framer-motion'
import { Sparkles, ArrowRight, MapPin, Compass, Globe } from 'lucide-react'

export default function Hero() {
  const handleScrollToSection = (sectionId) => {
    const el = document.getElementById(sectionId)
    if (el) el.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <section className="relative min-h-screen flex items-center justify-center pt-24 overflow-hidden bg-gradient-to-b from-[#F3EEFF] via-white to-white dark:from-[#110A24] dark:via-[#06020E] dark:to-[#06020E]">
      
      {/* Decorative Blur Orbs */}
      <div className="neon-glow-circle w-[450px] h-[450px] bg-primary/20 top-1/4 -left-1/4"></div>
      <div className="neon-glow-circle w-[400px] h-[400px] bg-purple-500/10 bottom-10 -right-20"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full text-center">
        
        {/* Animated Badge */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-white/80 border border-purple-100 shadow-sm mb-6 dark:bg-slate-900/60 dark:border-slate-800"
        >
          <Sparkles className="w-4 h-4 text-primary animate-pulse-glow" />
          <span className="text-sm font-semibold tracking-wide text-primary-dark dark:text-purple-300">
            Next-Gen AI Travel Assistant
          </span>
        </motion.div>

        {/* Hero Title */}
        <motion.h1 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1 }}
          className="text-4xl sm:text-6xl lg:text-7xl font-display font-extrabold tracking-tight text-slate-950 dark:text-white leading-[1.1] max-w-5xl mx-auto"
        >
          Explore <span className="bg-gradient-to-r from-primary via-purple-500 to-indigo-500 bg-clip-text text-transparent dark:from-purple-300 dark:to-white">Incredible India</span> With AI-Powered Travel Planning
        </motion.h1>

        {/* Hero Subtext */}
        <motion.p 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="mt-6 text-lg sm:text-xl text-slate-600 dark:text-slate-350 max-w-3xl mx-auto font-medium"
        >
          Discover hidden gems, auto-optimize your budget, and generate rich daily itineraries customized exactly to your tastes in seconds.
        </motion.p>

        {/* Search Bar / CTAs */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="mt-10 flex flex-col sm:flex-row justify-center items-center gap-4"
        >
          <button
            onClick={() => handleScrollToSection('ai-planner')}
            className="clay-btn-primary px-8 py-4 text-base flex items-center gap-2 group w-full sm:w-auto"
          >
            <span>Plan with AI Now</span>
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
          
          <button
            onClick={() => handleScrollToSection('explore')}
            className="clay-btn-secondary px-8 py-4 text-base flex items-center gap-2 w-full sm:w-auto justify-center"
          >
            <Compass className="w-5 h-5" />
            <span>Interactive Map</span>
          </button>
        </motion.div>

        {/* Trust Badges */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="mt-16 pt-8 border-t border-slate-200/60 dark:border-slate-800/40 max-w-4xl mx-auto flex flex-wrap justify-center items-center gap-x-12 gap-y-6"
        >
          <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
            <Globe className="w-5 h-5 text-primary" />
            <span className="font-semibold text-sm">28 States & UTs Catalogued</span>
          </div>
          <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
            <MapPin className="w-5 h-5 text-primary" />
            <span className="font-semibold text-sm">Over 1,000+ Local Spots Indexed</span>
          </div>
        </motion.div>

        {/* 3D Bobbing Floating elements */}
        {/* Compass bottom-left */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          className="hidden lg:block absolute left-20 bottom-24 opacity-60 text-primary-light dark:opacity-30"
        >
          <Compass className="w-20 h-20" />
        </motion.div>

      </div>
    </section>
  )
}
