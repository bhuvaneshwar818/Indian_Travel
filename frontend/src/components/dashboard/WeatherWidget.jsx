import React, { useEffect } from 'react'
import { GlassCard } from '../ui/GlassCard'
import { useTripStore } from '../../store/useTripStore'
import { CloudRain, Sun, Thermometer, Droplets } from 'lucide-react'

export default function WeatherWidget({ destinations = [] }) {
  const { weatherData, fetchWeather } = useTripStore();

  useEffect(() => {
    // Fetch weather details for all destinations
    destinations.forEach((dest) => {
      const city = dest.placeName || dest.name;
      if (city && !weatherData[city.toLowerCase()]) {
        fetchWeather(city);
      }
    });
  }, [destinations, fetchWeather, weatherData]);

  if (destinations.length === 0) {
    return (
      <GlassCard className="p-6 text-center text-xs text-white/40">
        Add destinations to your wishlist to compile local weather forecasts.
      </GlassCard>
    );
  }

  return (
    <div className="space-y-3 text-left">
      <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
        <Sun className="w-4 h-4 text-violet-400" />
        <span>Destination Weather Forecasts</span>
      </h3>
      
      <div className="flex gap-4 overflow-x-auto pb-2 custom-scrollbar">
        {destinations.map((dest) => {
          const city = dest.placeName || dest.name;
          const info = weatherData[city.toLowerCase()];

          return (
            <GlassCard key={dest.id} className="p-4 min-w-[200px] flex-shrink-0 relative overflow-hidden bg-white/[0.04]">
              {info ? (
                <div className="space-y-3 relative z-10">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-bold text-xs text-white truncate max-w-[120px]">{city}</h4>
                      <p className="text-[9px] text-white/50">{dest.state || "India"}</p>
                    </div>
                    {/* Weather Icon representation */}
                    <span className="text-xl">
                      {info.temp > 25 ? "☀️" : "☁️"}
                    </span>
                  </div>

                  <div className="flex items-center gap-4 text-xs font-bold">
                    <div className="flex items-center gap-1 text-orange-400">
                      <Thermometer className="w-3.5 h-3.5" />
                      <span>{Math.round(info.temp)}°C</span>
                    </div>
                    <div className="flex items-center gap-1 text-sky-400">
                      <Droplets className="w-3.5 h-3.5" />
                      <span>{info.humidity}%</span>
                    </div>
                  </div>

                  <p className="text-[10px] text-white/70 capitalize font-medium italic">
                    "{info.description}"
                  </p>

                  <div className="pt-2 border-t border-white/5 flex justify-between items-center text-[9px]">
                    <span className="text-white/40">Best visit:</span>
                    <span className="px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-bold">
                      {info.bestTimeToVisit || "Oct - Mar"}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="py-8 text-center text-[10px] text-white/30 animate-pulse">
                  Querying forecast...
                </div>
              )}
            </GlassCard>
          );
        })}
      </div>
    </div>
  )
}
