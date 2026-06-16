import React from 'react'
import { GripVertical } from 'lucide-react'

export default function DragHandle({ className = '', ...props }) {
  return (
    <div 
      className={`cursor-grab active:cursor-grabbing text-white/30 hover:text-white/60 p-1 transition-colors ${className}`}
      title="Drag to reorder"
      {...props}
    >
      <GripVertical className="w-4 h-4" />
    </div>
  )
}
