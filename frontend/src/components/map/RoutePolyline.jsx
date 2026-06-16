import React from 'react'

export default function RoutePolyline({ isScenic = false }) {
  return (
    <div className="flex items-center gap-2 text-[10px] font-bold text-white/60">
      <div className={`w-6 h-1 rounded-full ${isScenic ? 'bg-teal-500 shadow-teal-500/50 shadow' : 'bg-violet-600 shadow-violet-500/50 shadow'}`} />
      <span>{isScenic ? "Scenic extended leg" : "Shortest path leg"}</span>
    </div>
  )
}
