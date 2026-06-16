import React, { useState } from 'react'
import { GlassCard } from '../ui/GlassCard'
import WishlistItem from './WishlistItem'
import { Heart, Compass, Map, Sparkles, Loader } from 'lucide-react'

export default function WishlistPanel({ 
  wishlist = [], 
  onRemove, 
  reorder, 
  onFindShortestRoute, 
  onFindScenicRoute 
}) {
  const [draggedIndex, setDraggedIndex] = useState(null);
  const [routingShortest, setRoutingShortest] = useState(false);
  const [routingScenic, setRoutingScenic] = useState(false);

  const handleDragStart = (e, index) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e, index) => {
    e.preventDefault();
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  const handleDrop = (e, index) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;

    // Create a reordered duplicate of the wishlist
    const reordered = [...wishlist];
    const target = reordered[draggedIndex];
    reordered.splice(draggedIndex, 1);
    reordered.splice(index, 0, target);

    // Call store reorder handler
    reorder(reordered);
    setDraggedIndex(null);
  };

  const handleRouteShortest = async () => {
    if (wishlist.length === 0) return;
    setRoutingShortest(true);
    try {
      await onFindShortestRoute(wishlist.map(p => p.id));
    } finally {
      setRoutingShortest(false);
    }
  };

  const handleRouteScenic = async () => {
    if (wishlist.length === 0) return;
    setRoutingScenic(true);
    try {
      await onFindScenicRoute(wishlist.map(p => p.id));
    } finally {
      setRoutingScenic(false);
    }
  };

  return (
    <GlassCard className="p-5 flex flex-col h-full bg-white/[0.04] text-left border-white/[0.08]">
      {/* Title Header */}
      <div className="flex items-center justify-between border-b border-white/5 pb-3 mb-4 flex-shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-rose-500/10 text-rose-400 flex items-center justify-center border border-rose-500/20">
            <Heart className="w-4 h-4 fill-rose-500" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">🎯 Your Wishlist stops</h3>
            <p className="text-[9px] text-white/50">Sequence and order of trip highlights</p>
          </div>
        </div>
        <span className="px-2.5 py-0.5 rounded bg-white/5 border border-white/5 text-[10px] font-black text-white">
          {wishlist.length} Stops
        </span>
      </div>

      {/* Draggable Stop list */}
      <div className="flex-1 overflow-y-auto space-y-2.5 pr-1 custom-scrollbar min-h-[160px]">
        {wishlist.length === 0 ? (
          <div className="py-16 text-center text-xs text-white/35 flex flex-col items-center justify-center gap-2">
            <Compass className="w-8 h-8 text-white/20 animate-spin-slow" />
            <span>Wishlist is empty. Search state sights on the left and add them!</span>
          </div>
        ) : (
          wishlist.map((item, index) => (
            <WishlistItem
              key={item.id}
              item={item}
              index={index}
              onRemove={onRemove}
              onDragStart={handleDragStart}
              onDragOver={handleDragOver}
              onDragEnd={handleDragEnd}
              onDrop={handleDrop}
            />
          ))
        )}
      </div>

      {/* Reorder instructions & Routing CTAs */}
      {wishlist.length > 0 && (
        <div className="mt-5 pt-4 border-t border-white/5 space-y-3 flex-shrink-0">
          <p className="text-[9px] text-white/30 text-center italic">
            💡 Tip: Drag and drop stops to change their rank and plan your route.
          </p>

          <div className="grid grid-cols-2 gap-2.5">
            <button
              onClick={handleRouteShortest}
              disabled={routingShortest || routingScenic}
              className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-violet-650 hover:bg-violet-700 text-[10px] font-bold text-white shadow-md disabled:opacity-50 transition-all"
            >
              {routingShortest ? (
                <Loader className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Map className="w-3.5 h-3.5" />
              )}
              <span>Shortest Path</span>
            </button>

            <button
              onClick={handleRouteScenic}
              disabled={routingShortest || routingScenic}
              className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-teal-650 hover:bg-teal-700 text-[10px] font-bold text-white shadow-md disabled:opacity-50 transition-all"
            >
              {routingScenic ? (
                <Loader className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Sparkles className="w-3.5 h-3.5" />
              )}
              <span>Scenic Route</span>
            </button>
          </div>
        </div>
      )}
    </GlassCard>
  )
}
