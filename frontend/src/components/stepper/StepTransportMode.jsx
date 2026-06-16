import React from 'react'
import { Car, Bus } from 'lucide-react'

export default function StepTransportMode({ transportMode, setTransportMode }) {
  return (
    <div className="space-y-6 text-left">
      <h3 className="text-lg font-bold text-white text-center sm:text-left">Select Transport Mode</h3>
      <p className="text-xs text-white/60 text-center sm:text-left">How will you navigate between destinations in India?</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Own Vehicle Option */}
        <div 
          onClick={() => setTransportMode('OWN_VEHICLE')}
          className={`cursor-pointer transition-all duration-300 p-6 rounded-2xl border text-center ${
            transportMode === 'OWN_VEHICLE'
              ? 'bg-violet-600/25 border-violet-500 ring-2 ring-violet-500 scale-[1.03]'
              : 'bg-white/5 border-white/10 hover:bg-white/10'
          }`}
        >
          <div className="w-12 h-12 rounded-full bg-violet-500/10 flex items-center justify-center mx-auto mb-4 text-violet-400">
            <Car className="w-6 h-6" />
          </div>
          <h4 className="font-bold text-sm text-white">🚗 Own / Rental Vehicle</h4>
          <p className="text-[11px] text-white/55 mt-2 leading-relaxed">
            Personal car/bike road trip. We will show direct driving routes on the Google Map panel.
          </p>
        </div>

        {/* Public Transport Option */}
        <div 
          onClick={() => setTransportMode('PUBLIC')}
          className={`cursor-pointer transition-all duration-300 p-6 rounded-2xl border text-center ${
            transportMode === 'PUBLIC'
              ? 'bg-violet-600/25 border-violet-500 ring-2 ring-violet-500 scale-[1.03]'
              : 'bg-white/5 border-white/10 hover:bg-white/10'
          }`}
        >
          <div className="w-12 h-12 rounded-full bg-violet-500/10 flex items-center justify-center mx-auto mb-4 text-violet-400">
            <Bus className="w-6 h-6" />
          </div>
          <h4 className="font-bold text-sm text-white">🚌 Public Transit</h4>
          <p className="text-[11px] text-white/55 mt-2 leading-relaxed">
            Buses, trains, and flights. We will pull live timings, durations, and estimated ticket fares.
          </p>
        </div>
      </div>

      {transportMode === 'PUBLIC' && (
        <div className="p-3.5 rounded-xl bg-violet-950/20 border border-violet-900/35 text-center text-[10px] text-violet-300 font-semibold animate-dashboard-fade">
          💡 Info: We will show transport routes, schedules, and ticket pricing between each of your stops!
        </div>
      )}
    </div>
  )
}
