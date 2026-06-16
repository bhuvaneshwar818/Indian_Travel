import React from 'react'

export function StepperProgress({ steps, current }) {
  return (
    <div className="flex items-center justify-between w-full max-w-lg mx-auto py-4">
      {steps.map((label, i) => (
        <React.Fragment key={i}>
          <div className="flex items-center">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-all ${
              i <= current 
                ? 'bg-violet-600 text-white shadow-[0_0_12px_rgba(124,58,237,0.5)]' 
                : 'bg-white/10 text-white/40 border border-white/5'
            }`}>
              {i < current ? '✓' : i + 1}
            </div>
            <span className={`ml-2 text-xs font-semibold hidden sm:inline ${
              i <= current ? 'text-white' : 'text-white/40'
            }`}>
              {label}
            </span>
          </div>
          {i < steps.length - 1 && (
            <div className={`flex-1 mx-4 h-0.5 transition-all duration-300 ${
              i < current ? 'bg-violet-600' : 'bg-white/10'
            }`} />
          )}
        </React.Fragment>
      ))}
    </div>
  )
}
