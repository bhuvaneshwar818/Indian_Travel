import React from 'react'

export function GlassCard({ children, className = '', ...props }) {
  return (
    <div 
      className={`bg-white/[0.08] backdrop-blur-[16px] border border-white/[0.18] rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.18)] ${className}`}
      {...props}
    >
      {children}
    </div>
  )
}
