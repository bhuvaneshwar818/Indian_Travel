import React, { useEffect } from 'react'
import { Trash2 } from 'lucide-react'
import DragHandle from './DragHandle'
import { useTripStore } from '../../store/useTripStore'

export default function WishlistItem({ 
  item, 
  index, 
  displayIndex,
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
      className="flex items-center gap-3 p-3.5 rounded-xl bg-white/40 dark:bg-white/[0.04] border border-slate-200 dark:border-white/5 hover:border-slate-300 dark:hover:border-white/10 transition-all select-none group"
    >
      {/* Grab handle */}
      <DragHandle />

      {/* Circle Badge showing the displayIndex (replacing both rank badge and color dot) */}
      <span 
        className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black text-white shadow-lg flex-shrink-0"
        style={{
          backgroundColor: color
        }}
        title={`Stop #${displayIndex || (index + 1)}`}
      >
        {displayIndex || (index + 1)}
      </span>

      {/* Content */}
      <div className="flex-1 text-left min-w-0">
        <h4 className="font-bold text-xs text-slate-800 dark:text-white truncate" title={item.placeName}>
          {item.placeName}
        </h4>
        <p className="text-[9px] text-slate-500 dark:text-white/40 uppercase tracking-wide truncate">
          {item.state} • {item.category}
        </p>
        {info && (
          <p className="text-[10px] font-black text-sky-655 dark:text-sky-400 mt-0.5 flex items-center gap-1 select-none">
            <span>{getWeatherIcon(info.temp, info.description)}</span>
            <span>{Math.round(info.temp)}°C</span>
          </p>
        )}
      </div>

      {/* Remove trigger */}
      <button
        onClick={() => onRemove(item.id)}
        className="w-7 h-7 rounded-lg bg-red-100 dark:bg-red-950/20 text-red-650 dark:text-red-400 hover:bg-red-650 dark:hover:bg-red-600 hover:text-white border border-red-200 dark:border-red-900/30 flex items-center justify-center shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"
        title="Remove Stop"
      >
        <Trash2 className="w-3.5 h-3.5" />
      </button>
    </div>
  )
}
