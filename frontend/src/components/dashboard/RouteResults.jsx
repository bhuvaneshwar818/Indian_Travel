import React from 'react'
import { GlassCard } from '../ui/GlassCard'
import { MapPin, Navigation, Compass, Sparkles } from 'lucide-react'

export default function RouteResults({ routeData, onDrawRoute }) {
  if (!routeData) return null;

  const isScenic = routeData.stops.some(stop => stop.includes("✨"));

  return (
    <GlassCard className={`p-5 text-left border-t-4 border-white/[0.12] animate-dashboard-fade ${
      isScenic ? 'border-t-teal-500' : 'border-t-violet-500'
    }`}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-4 mb-4">
        <div>
          <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider ${
            isScenic ? 'bg-teal-500/10 text-teal-400 border border-teal-500/20' : 'bg-violet-500/10 text-violet-400 border border-violet-500/20'
          }`}>
            {isScenic ? "Scenic Extended Route" : "Optimized Shortest Path"}
          </span>
          <h3 className="text-base font-black text-white mt-2 flex items-center gap-1.5">
            <Compass className="w-4.5 h-4.5 text-violet-400" />
            <span>Path Routing Results</span>
          </h3>
        </div>

        <div className="flex items-center gap-4 text-xs font-bold bg-white/[0.03] px-4 py-2 rounded-xl border border-white/5">
          <div>
            <p className="text-[9px] text-white/40 uppercase">Total Distance</p>
            <p className="text-sm font-black text-white">{routeData.totalDistance}</p>
          </div>
          <div className="h-6 w-px bg-white/10" />
          <div>
            <p className="text-[9px] text-white/40 uppercase">Est. Duration</p>
            <p className="text-sm font-black text-violet-400">{routeData.totalDuration}</p>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <p className="text-xs text-white/60 font-semibold uppercase tracking-wider">
          Itinerary Routing Stops:
        </p>

        <div className="relative pl-6 space-y-4">
          {/* Vertical joining line */}
          <div className="absolute left-2.5 top-2 bottom-2 w-0.5 bg-white/10" />

          {routeData.stops.map((stop, i) => {
            const isMidway = stop.includes("✨");
            return (
              <div key={i} className="relative flex items-start gap-3">
                {/* Node bubble */}
                <div className={`absolute -left-[20px] w-4.5 h-4.5 rounded-full flex items-center justify-center border font-bold text-[8px] ${
                  isMidway 
                    ? 'bg-teal-500 border-teal-400 text-slate-950 scale-90' 
                    : 'bg-violet-600 border-violet-500 text-white'
                }`}>
                  {isMidway ? "★" : i + 1}
                </div>

                <div className="text-xs font-semibold">
                  <p className={`font-black ${isMidway ? 'text-teal-400 font-bold' : 'text-white'}`}>
                    {stop}
                  </p>
                  {isMidway ? (
                    <p className="text-[10px] text-teal-300/60 mt-0.5">Bonus local attraction & photo hotspot suggested by AI.</p>
                  ) : (
                    <p className="text-[10px] text-white/40 mt-0.5">Stop {i + 1} in travel sequence.</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <div className="pt-4 border-t border-white/5 flex justify-end gap-3">
          <button
            onClick={() => onDrawRoute(routeData.polyline, isScenic, routeData.totalDistance, routeData.totalDuration, routeData.stops)}
            className={`flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-xs font-bold text-white transition-all shadow-md ${
              isScenic 
                ? 'bg-teal-650 hover:bg-teal-700 shadow-teal-500/10' 
                : 'bg-violet-650 hover:bg-violet-750 shadow-violet-500/10'
            }`}
          >
            <Navigation className="w-3.5 h-3.5" />
            <span>Draw Path on Google Map</span>
          </button>
        </div>
      </div>
    </GlassCard>
  )
}
