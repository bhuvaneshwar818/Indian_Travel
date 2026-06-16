import React from 'react'
import { GlassCard } from '../ui/GlassCard'
import { User, Users, Car, Bus, MapPin, Edit2 } from 'lucide-react'

export default function TravelSummaryCard({ preferences, onEdit }) {
  const isSolo = preferences?.travelMode === 'SOLO';
  const isPublic = preferences?.transportMode === 'PUBLIC';

  return (
    <GlassCard className="p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 w-full text-left bg-gradient-to-r from-violet-950/15 via-white/[0.03] to-indigo-950/15 border-white/[0.08]">
      <div className="flex flex-wrap items-center gap-6 md:gap-10">
        
        {/* Travel Mode Info */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-violet-650/20 text-violet-400 flex items-center justify-center border border-violet-900/30">
            {isSolo ? <User className="w-5 h-5" /> : <Users className="w-5 h-5" />}
          </div>
          <div>
            <p className="text-[9px] font-bold text-white/40 uppercase tracking-wider">Travel Mode</p>
            <p className="text-xs font-black text-white mt-0.5">
              {isSolo ? "Solo Traveler" : `Group (${preferences?.groupSize || 2} Pax)`}
            </p>
          </div>
        </div>

        {/* Transport Mode Info */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-violet-650/20 text-violet-400 flex items-center justify-center border border-violet-900/30">
            {!isPublic ? <Car className="w-5 h-5" /> : <Bus className="w-5 h-5" />}
          </div>
          <div>
            <p className="text-[9px] font-bold text-white/40 uppercase tracking-wider">Transport Mode</p>
            <p className="text-xs font-black text-white mt-0.5">
              {!isPublic ? "Own / Rental Car" : "Public Transit (Bus/Train)"}
            </p>
          </div>
        </div>

        {/* Start Location Info */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-violet-650/20 text-violet-400 flex items-center justify-center border border-violet-900/30">
            <MapPin className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[9px] font-bold text-white/40 uppercase tracking-wider">Starting Hub</p>
            <p className="text-xs font-black text-white mt-0.5 truncate max-w-[200px]" title={preferences?.startLocation}>
              {preferences?.startLocation || "Mumbai, India"}
            </p>
          </div>
        </div>

      </div>

      <button
        onClick={onEdit}
        className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-[10px] font-bold text-white transition-all self-end md:self-center"
      >
        <Edit2 className="w-3.5 h-3.5" />
        <span>Modify Plans</span>
      </button>
    </GlassCard>
  )
}
