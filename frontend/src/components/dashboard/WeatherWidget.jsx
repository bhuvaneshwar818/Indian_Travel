import React, { useState, useEffect } from 'react'
import { GlassCard } from '../ui/GlassCard'
import { useTripStore } from '../../store/useTripStore'
import { Sun, Thermometer, Droplets, Calendar, CloudSun, Info } from 'lucide-react'

// Popular Indian destinations list for dropdown selection
const POPULAR_CITIES = [
  "Goa", "Jaipur", "Kerala", "Munnar", "Leh", "Ladakh", "Varanasi", 
  "Ooty", "Mumbai", "Delhi", "Bengaluru", "Hyderabad", "Srinagar", "Shimla", "Udaipur"
];

export default function WeatherWidget({ destinations = [], initialSelectedCity = null }) {
  const { weatherData, fetchWeather } = useTripStore();
  
  // Extract wishlist city names
  const wishlistCities = destinations.map(d => d.placeName || d.name).filter(Boolean);
  
  // Default selected city
  const [selectedCity, setSelectedCity] = useState("Goa");

  // Sync selectedCity when initialSelectedCity changes or wishlist loads
  useEffect(() => {
    if (initialSelectedCity) {
      setSelectedCity(initialSelectedCity);
    } else if (wishlistCities.length > 0) {
      setSelectedCity(wishlistCities[0]);
    }
  }, [initialSelectedCity, destinations]);

  // Fetch weather for all wishlist items + selected city
  useEffect(() => {
    destinations.forEach((dest) => {
      const city = dest.placeName || dest.name;
      if (city && !weatherData[city.toLowerCase()]) {
        fetchWeather(city, dest.lat, dest.lng);
      }
    });

    // Find if selectedCity is a wishlist item to get its lat/lng
    const matchingDest = destinations.find(
      d => (d.placeName || d.name || "").toLowerCase() === selectedCity.toLowerCase()
    );

    if (selectedCity && !weatherData[selectedCity.toLowerCase()]) {
      if (matchingDest) {
        fetchWeather(selectedCity, matchingDest.lat, matchingDest.lng);
      } else {
        fetchWeather(selectedCity);
      }
    }
  }, [destinations, selectedCity, fetchWeather, weatherData]);

  const activeInfo = weatherData[selectedCity.toLowerCase()];

  // Helper for weather icons based on temp/description
  const getWeatherIconStr = (temp, desc = "") => {
    const d = desc.toLowerCase();
    if (d.includes("rain") || d.includes("drizzle") || d.includes("shower")) return "🌧️";
    if (d.includes("cloud") || d.includes("overcast") || d.includes("mist") || d.includes("fog")) return "☁️";
    if (temp > 25) return "☀️";
    return "🌤️";
  };

  return (
    <div className="space-y-6 text-left">
      {/* City Dropdown Selector */}
      <GlassCard className="p-4 bg-white/[0.03] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
            <Sun className="w-4 h-4 text-violet-400" />
            <span>Weather Forecast Hub</span>
          </h3>
          <p className="text-[10px] text-white/50">Select a location from your route or search list to view historical & upcoming forecast</p>
        </div>
        
        <div className="min-w-[200px]">
          <select
            value={selectedCity}
            onChange={(e) => setSelectedCity(e.target.value)}
            className="w-full bg-slate-900/80 border border-white/10 rounded-xl px-3 py-2 text-xs font-bold text-white focus:outline-none focus:border-violet-500"
          >
            {wishlistCities.length > 0 && (
              <optgroup label="Your Planned Route Stopovers" className="text-white/60 bg-slate-950">
                {wishlistCities.map(c => (
                  <option key={`wish-${c}`} value={c} className="text-white bg-slate-900">{c}</option>
                ))}
              </optgroup>
            )}
            <optgroup label="Other Popular Regions" className="text-white/60 bg-slate-950">
              {POPULAR_CITIES.filter(c => !wishlistCities.includes(c)).map(c => (
                <option key={`pop-${c}`} value={c} className="text-white bg-slate-900">{c}</option>
              ))}
            </optgroup>
          </select>
        </div>
      </GlassCard>

      {/* Main Selected City Forecast */}
      {activeInfo ? (
        <div className="space-y-6 animate-fadeIn">
          
          {/* Current Day Snapshot Card */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
            <GlassCard className="p-6 md:col-span-7 flex flex-col justify-between relative overflow-hidden bg-gradient-to-br from-violet-600/10 to-violet-900/5 border border-violet-500/15">
              <div className="absolute top-0 right-0 p-8 text-7xl opacity-20 pointer-events-none select-none">
                {getWeatherIconStr(activeInfo.temp, activeInfo.description)}
              </div>
              
              <div className="space-y-3 relative z-10">
                <span className="px-2 py-0.5 rounded bg-violet-500/20 text-violet-300 text-[9px] font-black uppercase tracking-wider">
                  Current Conditions
                </span>
                
                <div>
                  <h2 className="text-2xl font-black text-white leading-none">{activeInfo.city}</h2>
                  <p className="text-[10px] text-white/50 capitalize font-medium italic mt-1">
                    "{activeInfo.description}"
                  </p>
                </div>

                <div className="flex items-center gap-6 mt-2">
                  <div className="flex items-center gap-1.5 text-orange-400 text-3xl font-black">
                    <Thermometer className="w-7 h-7" />
                    <span>{Math.round(activeInfo.temp)}°C</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-sky-400 text-lg font-bold">
                    <Droplets className="w-5 h-5" />
                    <span>{activeInfo.humidity}% Humidity</span>
                  </div>
                </div>
              </div>

              <div className="pt-4 mt-4 border-t border-white/5 flex justify-between items-center text-[10px] text-white/60 relative z-10">
                <span className="flex items-center gap-1">
                  <Info className="w-3.5 h-3.5 text-violet-400" />
                  <span>Optimal visiting window:</span>
                </span>
                <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-extrabold">
                  {activeInfo.bestTimeToVisit || "Oct - Mar"}
                </span>
              </div>
            </GlassCard>

            {/* Past 2 Days Sidebar Card */}
            <GlassCard className="p-5 md:col-span-5 flex flex-col justify-between bg-white/[0.02]">
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-white/60 uppercase tracking-wider flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  <span>Historical Trend (Past 2 Days)</span>
                </h4>
                
                <div className="grid grid-cols-2 gap-3 mt-1">
                  {activeInfo.pastForecast && activeInfo.pastForecast.map((day, idx) => (
                    <div key={`past-${idx}`} className="p-3 rounded-xl bg-white/[0.02] border border-white/5 space-y-1.5">
                      <p className="text-[9px] font-bold text-white/40">{day.date}</p>
                      <div className="text-lg font-black text-white leading-none">
                        {Math.round(day.temp)}°C
                      </div>
                      <p className="text-[9px] text-white/60 truncate capitalize">{day.description}</p>
                      <p className="text-[8px] text-sky-400/80 font-semibold">{day.humidity}% Hum.</p>
                    </div>
                  ))}
                </div>
              </div>
              <p className="text-[8px] text-white/30 italic mt-3">Note: Past reports are simulated based on seasonal parameters.</p>
            </GlassCard>
          </div>

          {/* 7 Day Outlook Forecast List */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
              <CloudSun className="w-4 h-4 text-sky-400" />
              <span>7-Day Outlook Forecast</span>
            </h4>
            
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-3">
              {activeInfo.futureForecast && activeInfo.futureForecast.map((day, idx) => (
                <GlassCard key={`fut-${idx}`} className="p-3 bg-white/[0.02] border border-white/5 flex flex-col justify-between gap-2 text-center">
                  <div>
                    <span className="text-[9px] font-bold text-white/40 block mb-0.5">{day.date}</span>
                    <span className="text-lg font-black text-white block">
                      {Math.round(day.temp)}°C
                    </span>
                  </div>
                  
                  <div className="text-xl my-0.5 select-none">
                    {getWeatherIconStr(day.temp, day.description)}
                  </div>
                  
                  <div>
                    <p className="text-[8px] text-white/70 line-clamp-1 capitalize italic">"{day.description}"</p>
                    <div className="text-[8px] text-sky-400 font-bold mt-1">
                      💧{day.humidity}%
                    </div>
                  </div>
                </GlassCard>
              ))}
            </div>
          </div>

        </div>
      ) : (
        <GlassCard className="py-24 text-center text-xs text-white/30 animate-pulse bg-white/[0.02]">
          Analyzing regional atmospheric forecasts for {selectedCity}...
        </GlassCard>
      )}

      {/* Wishlist Overview Footer Capsules */}
      {destinations.length > 1 && (
        <div className="pt-4 border-t border-white/5 space-y-2">
          <h4 className="text-[10px] font-bold text-white/50 uppercase tracking-wider">
            All Route Stopover Climates
          </h4>
          <div className="flex flex-wrap gap-2">
            {destinations.map((dest) => {
              const city = dest.placeName || dest.name;
              const info = weatherData[city.toLowerCase()];
              return (
                <button
                  key={`footer-${dest.id}`}
                  onClick={() => setSelectedCity(city)}
                  className={`px-3 py-1.5 rounded-xl border text-[10px] font-semibold transition-all flex items-center gap-2 ${
                    selectedCity.toLowerCase() === city.toLowerCase()
                      ? 'bg-violet-500/20 border-violet-500 text-white'
                      : 'bg-white/5 border-white/5 text-white/60 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <span>{city}</span>
                  {info ? (
                    <span className="text-orange-400 font-bold">{Math.round(info.temp)}°C</span>
                  ) : (
                    <span className="text-white/20 animate-pulse">...</span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  )
}
