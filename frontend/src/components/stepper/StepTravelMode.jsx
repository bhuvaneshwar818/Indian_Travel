import React from 'react'
import { GlassCard } from '../ui/GlassCard'
import { User, Users } from 'lucide-react'

export default function StepTravelMode({ travelMode, setTravelMode, groupSize, setGroupSize }) {
  return (
    <div className="space-y-6 text-left">
      <h3 className="text-lg font-bold text-white text-center sm:text-left">Choose Your Travel Mode</h3>
      <p className="text-xs text-white/60 text-center sm:text-left">Are you exploring India solo, or planning a group getaway?</p>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Solo Option */}
        <div 
          onClick={() => {
            setTravelMode('SOLO');
            setGroupSize(1);
          }}
          className={`cursor-pointer transition-all duration-300 p-6 rounded-2xl border text-center ${
            travelMode === 'SOLO'
              ? 'bg-violet-600/25 border-violet-500 ring-2 ring-violet-500 scale-[1.03]'
              : 'bg-white/5 border-white/10 hover:bg-white/10'
          }`}
        >
          <div className="w-12 h-12 rounded-full bg-violet-500/10 flex items-center justify-center mx-auto mb-4 text-violet-400">
            <User className="w-6 h-6" />
          </div>
          <h4 className="font-bold text-sm text-white">🧍 Solo Backpacker</h4>
          <p className="text-[11px] text-white/55 mt-2 leading-relaxed">
            Independent routing, hostels, budget travels, and personal translations.
          </p>
        </div>

        {/* Group Option */}
        <div 
          onClick={() => {
            setTravelMode('GROUP');
            if (groupSize <= 1) setGroupSize(2);
          }}
          className={`cursor-pointer transition-all duration-300 p-6 rounded-2xl border text-center ${
            travelMode === 'GROUP'
              ? 'bg-violet-600/25 border-violet-500 ring-2 ring-violet-500 scale-[1.03]'
              : 'bg-white/5 border-white/10 hover:bg-white/10'
          }`}
        >
          <div className="w-12 h-12 rounded-full bg-violet-500/10 flex items-center justify-center mx-auto mb-4 text-violet-400">
            <Users className="w-6 h-6" />
          </div>
          <h4 className="font-bold text-sm text-white">👥 Group Getaway</h4>
          <p className="text-[11px] text-white/55 mt-2 leading-relaxed">
            Coordinated chat rooms, expenses split equally, and multi-person scheduling.
          </p>
        </div>
      </div>

      {travelMode === 'GROUP' && (
        <div className="p-4 rounded-xl bg-white/5 border border-white/10 max-w-xs mx-auto animate-dashboard-fade">
          <label className="block text-[11px] font-bold text-white/70 mb-2 uppercase tracking-wide">
            How many people in your group?
          </label>
          <input
            type="number"
            min="2"
            max="100"
            value={groupSize}
            onChange={(e) => setGroupSize(Math.max(2, parseInt(e.target.value) || 2))}
            className="w-full glass-input text-center text-sm font-bold text-violet-400"
          />
        </div>
      )}
    </div>
  )
}
