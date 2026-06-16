import React, { useState } from 'react'
import India from '@svg-maps/india'
import { GlassCard } from '../ui/GlassCard'

const ID_STATE_MAP = {
  "an": "Andaman and Nicobar Islands",
  "ap": "Andhra Pradesh",
  "ar": "Arunachal Pradesh",
  "as": "Assam",
  "br": "Bihar",
  "ch": "Chandigarh",
  "ct": "Chhattisgarh",
  "dn": "Dadra and Nagar Haveli",
  "dd": "Daman and Diu",
  "dl": "Delhi",
  "ga": "Goa",
  "gj": "Gujarat",
  "hr": "Haryana",
  "hp": "Himachal Pradesh",
  "jk": "Jammu & Kashmir",
  "jh": "Jharkhand",
  "ka": "Karnataka",
  "kl": "Kerala",
  "ld": "Lakshadweep",
  "mp": "Madhya Pradesh",
  "mh": "Maharashtra",
  "mn": "Manipur",
  "ml": "Meghalaya",
  "mz": "Mizoram",
  "nl": "Nagaland",
  "or": "Odisha",
  "py": "Puducherry",
  "pb": "Punjab",
  "rj": "Rajasthan",
  "sk": "Sikkim",
  "tn": "Tamil Nadu",
  "tg": "Telangana",
  "tr": "Tripura",
  "up": "Uttar Pradesh",
  "ut": "Uttarakhand",
  "wb": "West Bengal"
};

export default function IndiaInteractiveMap({ selectedState, onSelectState }) {
  const [hoveredState, setHoveredState] = useState('');
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e) => {
    // Relative position inside the SVG container
    const rect = e.currentTarget.getBoundingClientRect();
    setTooltipPos({
      x: e.clientX - rect.left + 15,
      y: e.clientY - rect.top + 15
    });
  };

  return (
    <div 
      className="relative w-full max-w-[400px] mx-auto select-none aspect-square"
      onMouseMove={handleMouseMove}
      onMouseLeave={() => setHoveredState('')}
    >
      {/* Tooltip */}
      {hoveredState && (
        <div 
          className="absolute z-50 pointer-events-none px-2.5 py-1.5 rounded-lg bg-slate-950/90 border border-violet-500/35 text-[10px] font-bold text-white shadow-md animate-dashboard-fade"
          style={{ left: tooltipPos.x, top: tooltipPos.y }}
        >
          📍 {hoveredState}
        </div>
      )}

      <svg 
        viewBox={India.viewBox} 
        className="w-full h-full z-10 transition-all select-none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <g className="india-map-grid">
          {India.locations.map((loc) => {
            const dbStateName = ID_STATE_MAP[loc.id] || loc.name;
            const isSelected = selectedState === dbStateName;
            const isHovered = hoveredState === dbStateName;

            let pathClass = "transition-all duration-300 outline-none select-none cursor-pointer ";
            if (isSelected) {
              pathClass += "fill-violet-500/40 stroke-violet-400 stroke-[2px] filter drop-shadow-[0_0_8px_rgba(124,58,237,0.5)]";
            } else if (isHovered) {
              pathClass += "fill-violet-500/20 stroke-violet-400 stroke-[1.5px]";
            } else {
              pathClass += "fill-white/[0.04] stroke-white/20 hover:fill-white/[0.08]";
            }

            return (
              <path
                key={loc.id}
                id={loc.id}
                d={loc.path}
                className={pathClass}
                onMouseEnter={() => setHoveredState(dbStateName)}
                onClick={() => onSelectState(dbStateName)}
              />
            );
          })}
        </g>
      </svg>
    </div>
  )
}
