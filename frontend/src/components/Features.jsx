import React from 'react'
import { Sparkles, Compass, Wallet, CloudSun, Target, ShieldCheck, Languages } from 'lucide-react'

const FEATURE_LIST = [
  {
    title: "AI Travel Architect",
    desc: "Generate hyper-detailed, day-by-day travel plans built around your specific pacing, duration, and thematic desires.",
    icon: <Sparkles className="w-6 h-6 text-purple-500" />,
    bg: "bg-purple-100 dark:bg-purple-950/20"
  },
  {
    title: "Interactive State Explorer",
    desc: "Hover and click on our custom visual SVG India map to extract regional sights, climate info, and local delicacies.",
    icon: <Compass className="w-6 h-6 text-emerald-500" />,
    bg: "bg-emerald-100 dark:bg-emerald-950/20"
  },
  {
    title: "Budget Optimizer",
    desc: "Select a financial tier (Budget, Moderate, Luxury) and watch our AI compute costs, suggesting exact local hotels.",
    icon: <Wallet className="w-6 h-6 text-amber-500" />,
    bg: "bg-amber-100 dark:bg-amber-950/20"
  },
  {
    title: "Real-time Weather Engine",
    desc: "Receive immediate climatic snapshots and temperature ranges for selected states to optimize packing lists.",
    icon: <CloudSun className="w-6 h-6 text-sky-500" />,
    bg: "bg-sky-100 dark:bg-sky-950/20"
  },
  {
    title: "Smart Heuristics",
    desc: "Access localized expert advice, scooter rental values, and travel tips tailored for solo hikers or groups.",
    icon: <Target className="w-6 h-6 text-red-500" />,
    bg: "bg-red-100 dark:bg-red-950/20"
  },
  {
    title: "Multi-Language Maps",
    desc: "Supports translation structures across major regional Indian languages for local taxi instructions.",
    icon: <Languages className="w-6 h-6 text-indigo-500" />,
    bg: "bg-indigo-100 dark:bg-indigo-950/20"
  }
]

export default function Features() {
  return (
    <section className="py-24 bg-slate-50 dark:bg-[#0A0516] relative overflow-hidden">
      
      {/* Glow overlays */}
      <div className="neon-glow-circle w-[400px] h-[400px] bg-primary/10 top-1/3 -right-20"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
        
        {/* Title */}
        <div className="max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl sm:text-5xl font-display font-extrabold text-slate-900 dark:text-white">
            Personalized <span className="bg-gradient-to-r from-primary to-purple-500 bg-clip-text text-transparent">AI Assistant Features</span>
          </h2>
          <p className="mt-4 text-slate-605 dark:text-slate-350 font-medium">
            Discover a comprehensive suite of travel features engineered to streamline exploration in Incredible India.
          </p>
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {FEATURE_LIST.map((feat) => (
            <div 
              key={feat.title}
              className="clay-card p-6 md:p-8 bg-white/80 dark:bg-slate-900/60 text-left hover:-translate-y-1.5 transition-transform duration-300 group"
            >
              <div className={`w-12 h-12 rounded-2xl ${feat.bg} flex items-center justify-center shadow-sm mb-6 group-hover:scale-105 transition-transform`}>
                {feat.icon}
              </div>
              <h3 className="text-xl font-display font-extrabold text-slate-900 dark:text-white mb-3">
                {feat.title}
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-350 leading-relaxed font-medium">
                {feat.desc}
              </p>
            </div>
          ))}
        </div>

      </div>
    </section>
  )
}
