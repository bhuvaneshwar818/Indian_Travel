import React, { useEffect, useState } from 'react'
import { GlassCard } from '../ui/GlassCard'
import { useTripStore } from '../../store/useTripStore'
import { Bus, Train, Plane, Clock, Landmark, Loader } from 'lucide-react'

export default function TransportTimings({ wishlist = [] }) {
  const { transportData, fetchTransportTimings } = useTripStore();
  const [loading, setLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);

  // Derive consecutive legs from wishlist
  const legs = [];
  for (let i = 0; i < wishlist.length - 1; i++) {
    legs.push({
      from: wishlist[i].placeName,
      to: wishlist[i+1].placeName
    });
  }

  useEffect(() => {
    if (legs.length > 0 && selectedIndex < legs.length) {
      const leg = legs[selectedIndex];
      setLoading(true);
      fetchTransportTimings(leg.from, leg.to).finally(() => setLoading(false));
    }
  }, [selectedIndex, wishlist.length, fetchTransportTimings]);

  if (wishlist.length < 2) {
    return (
      <GlassCard className="p-6 text-center text-xs text-white/40">
        Add at least 2 places to your wishlist to calculate route transit schedules.
      </GlassCard>
    );
  }

  const activeLeg = legs[selectedIndex];

  return (
    <div className="space-y-4 text-left">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
          <Clock className="w-4 h-4 text-violet-400" />
          <span>Transit Schedules & Timing Guides</span>
        </h3>

        {/* Leg selector dropdown */}
        <select
          value={selectedIndex}
          onChange={(e) => setSelectedIndex(parseInt(e.target.value))}
          className="glass-input py-1 px-3 text-[10px] bg-slate-900"
        >
          {legs.map((leg, i) => (
            <option key={i} value={i} className="bg-slate-950 text-white">
              Leg {i + 1}: {leg.from} ➔ {leg.to}
            </option>
          ))}
        </select>
      </div>

      <GlassCard className="p-5 bg-white/[0.04] overflow-hidden">
        {loading ? (
          <div className="py-12 flex flex-col items-center justify-center gap-2 text-xs text-white/50">
            <Loader className="w-6 h-6 animate-spin text-violet-500" />
            <span>Scanning regional schedules...</span>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex justify-between items-center text-xs border-b border-white/5 pb-3">
              <span className="text-white/40">Routing from:</span>
              <span className="font-black text-white">{activeLeg?.from}</span>
              <span className="text-violet-400">➔</span>
              <span className="text-white/40">To:</span>
              <span className="font-black text-white">{activeLeg?.to}</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="text-white/40 border-b border-white/5 text-[10px] uppercase tracking-wider font-bold">
                    <th className="pb-2">Mode</th>
                    <th className="pb-2">Operator Name</th>
                    <th className="pb-2">Daily Slots</th>
                    <th className="pb-2 text-center">Duration</th>
                    <th className="pb-2 text-right">Fare (Est.)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {transportData && transportData.map((item, i) => {
                    const isTrain = item.mode === 'Train';
                    const isFlight = item.mode === 'Flight';

                    return (
                      <tr key={i} className="hover:bg-white/[0.02]">
                        <td className="py-3 pr-2 font-bold flex items-center gap-1.5 text-violet-300">
                          {isTrain ? (
                            <Train className="w-3.5 h-3.5" />
                          ) : isFlight ? (
                            <Plane className="w-3.5 h-3.5" />
                          ) : (
                            <Bus className="w-3.5 h-3.5" />
                          )}
                          <span>{item.mode}</span>
                        </td>
                        <td className="py-3 text-white/80 font-medium">{item.name}</td>
                        <td className="py-3">
                          <div className="flex flex-wrap gap-1">
                            {item.departureSlots && item.departureSlots.map((slot) => (
                              <span key={slot} className="px-1.5 py-0.5 rounded bg-white/5 border border-white/5 text-[9px] text-white/60">
                                {slot}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="py-3 text-center text-white/70 font-semibold">{item.duration}</td>
                        <td className="py-3 text-right font-black text-emerald-400">₹{item.fare}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="pt-2 text-center">
              <p className="text-[10px] text-white/30 italic">
                Schedules reflect real-time service catalogs. Ticket bookings link out to external IRCTC / RedBus portals.
              </p>
            </div>
          </div>
        )}
      </GlassCard>
    </div>
  )
}
