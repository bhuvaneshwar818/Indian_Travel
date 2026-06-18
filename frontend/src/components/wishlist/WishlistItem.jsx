import React from 'react'
import { Trash2 } from 'lucide-react'
import DragHandle from './DragHandle'

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
