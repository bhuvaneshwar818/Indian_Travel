import React, { useEffect } from 'react'
import { Trash2 } from 'lucide-react'
import DragHandle from './DragHandle'
import { useTripStore } from '../../store/useTripStore'

export default function WishlistItem({ 
  item, 
  index, 
  color = '#7c3aed',
  onRemove, 
  onDragStart, 
  onDragOver, 
  onDragEnd, 
  onDrop 
}) {
  const { weatherData, fetchWeather } = useTripStore();
  const cityKey = (item.placeName || "").toLowerCase();
  const info = weatherData[cityKey];

  useEffect(() => {
    if (item.placeName && !info) {
      fetchWeather(item.placeName, item.lat, item.lng);
    }
  }, [item.placeName, item.lat, item.lng, info, fetchWeather]);

  const getWeatherIcon = (temp, desc = "") => {
    const d = desc.toLowerCase();
    if (d.includes("rain") || d.includes("drizzle") || d.includes("shower")) return "🌧️";
    if (d.includes("cloud") || d.includes("overcast") || d.includes("mist") || d.includes("fog")) return "☁️";
    if (temp > 25) return "☀️";
    return "🌤️";
  };
  return (
    <div
      draggable="true"
      onDragStart={(e) => onDragStart(e, index)}
      onDragOver={(e) => onDragOver(e, index)}
      onDragEnd={onDragEnd}
      onDrop={(e) => onDrop(e, index)}
      className="flex items-center gap-3 p-3.5 rounded-xl bg-white/[0.04] border border-white/5 hover:border-white/10 transition-all select-none group"
    >
      {/* Grab handle */}
      <DragHandle />

      {/* Rank Badge */}
      <span className="w-5.5 h-5.5 rounded-lg bg-violet-650/30 text-violet-300 border border-violet-900/35 flex items-center justify-center text-[9px] font-black flex-shrink-0">
        #{index + 1}
      </span>

      {/* Role circle dot color */}
      <span 
        className="w-2.5 h-2.5 rounded-full flex-shrink-0 border border-white/20 shadow-sm"
        style={{
          backgroundColor: color
        }}
        title={`Stop #${index + 1}`}
      />

      {/* Content */}
      <div className="flex-1 text-left min-w-0">
        <h4 className="font-bold text-xs text-white truncate" title={item.placeName}>
          {item.placeName}
        </h4>
        <p className="text-[9px] text-white/40 uppercase tracking-wide truncate">
          {item.state} • {item.category}
        </p>
      </div>

      {/* Small Weather Badge */}
      {info && (
        <div 
          className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-white/[0.04] border border-white/5 text-[9px] font-black text-sky-400 select-none cursor-help hover:bg-white/[0.08] transition-colors flex-shrink-0"
          title={`${info.description} • Click the Weather tab for full details`}
        >
          <span>{getWeatherIcon(info.temp, info.description)}</span>
          <span>{Math.round(info.temp)}°C</span>
        </div>
      )}

      {/* Remove trigger */}
      <button
        onClick={() => onRemove(item.id)}
        className="w-7 h-7 rounded-lg bg-red-950/20 text-red-400 hover:bg-red-655 hover:text-white border border-red-900/30 flex items-center justify-center shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"
        title="Remove Stop"
      >
        <Trash2 className="w-3.5 h-3.5" />
      </button>
    </div>
  )
}
