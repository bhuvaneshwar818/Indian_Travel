import React from 'react'

export function GlassCard({ children, className = '', ...props }) {
  return (
    <div 
      className={`clay-card ${className}`}
      {...props}
    >
      {children}
    </div>
  )
}
