import React from 'react'

export function GlassButton({ children, className = '', active = false, ...props }) {
  return (
    <button
      className={`px-5 py-2.5 rounded-xl border text-xs font-semibold tracking-wide transition-all ${
        active 
          ? 'bg-violet-600/35 border-violet-500 text-white shadow-[0_0_15px_rgba(124,58,237,0.4)] scale-[1.02]' 
          : 'bg-white/[0.05] border-white/10 text-white/80 hover:bg-white/[0.1] hover:text-white'
      } ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}
