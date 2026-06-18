import React, { useState } from 'react'
import { GlassCard } from '../ui/GlassCard'
import WishlistItem from './WishlistItem'
import { Heart, Compass, Map, Sparkles, Loader, X } from 'lucide-react'

const middleColors = [
  '#f59e0b', // Amber/Orange
  '#3b82f6', // Blue
  '#ec4899', // Pink
  '#06b6d4', // Cyan
  '#d946ef', // Magenta
  '#14b8a6', // Teal
  '#8b5cf6', // Violet/Purple
  '#f43f5e'  // Rose/Light Red
];

function getStopColor(role, index) {
  if (role === 'start') return '#10b981'; // Green
  if (role === 'end') return '#ef4444'; // Red
  return middleColors[index % middleColors.length];
}

// Haversine formula to calculate straight-line distance
function calculateHaversineDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Frontend Nearest Neighbor TSP solver starting from a specific coordinate
function optimizeNearestNeighbor(startCoords, items) {
  const sorted = [];
  const unvisited = [...items];
  let current = startCoords;

  while (unvisited.length > 0) {
    let nearest = null;
    let minDist = Infinity;
    let nearestIdx = -1;

    for (let i = 0; i < unvisited.length; i++) {
      const candidate = unvisited[i];
      if (candidate.lat && candidate.lng) {
        const dist = calculateHaversineDistance(
          current.lat, current.lng,
          candidate.lat, candidate.lng
        );
        if (dist < minDist) {
          minDist = dist;
          nearest = candidate;
          nearestIdx = i;
        }
      }
    }

    if (nearest !== null) {
      unvisited.splice(nearestIdx, 1);
      sorted.push(nearest);
      current = nearest;
    } else {
      // If any items lack coordinates, append them
      sorted.push(...unvisited);
      break;
    }
  }
  return sorted;
}

export default function WishlistPanel({ 
  wishlist = [], 
  onRemove, 
  reorder, 
  onFindShortestRoute, 
  onFindScenicRoute,
  activeRoute = null,
  onClearRoute,
  onDrawRoute
}) {
  const [draggedIndex, setDraggedIndex] = useState(null);
  const [routingShortest, setRoutingShortest] = useState(false);
  const [routingScenic, setRoutingScenic] = useState(false);
  const [routingOrder, setRoutingOrder] = useState(false);
  const [startFromCurrent, setStartFromCurrent] = useState(false);

  const isOrderActive = activeRoute && activeRoute.routingMode === 'order';
  const isOptimizeActive = activeRoute && activeRoute.routingMode === 'optimize';

  const getUserCoordinates = () => {
    return new Promise((resolve) => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            resolve({
              lat: position.coords.latitude,
              lng: position.coords.longitude
            });
          },
          (err) => {
            console.warn("Wishlist geolocation failed:", err);
            resolve(null);
          },
          { timeout: 5000 }
        );
      } else {
        resolve(null);
      }
    });
  };

  const handleShowRouteByOrder = async () => {
    if (isOrderActive) {
      if (onClearRoute) onClearRoute();
      return;
    }
    const minStops = startFromCurrent ? 1 : 2;
    if (wishlist.length < minStops) {
      alert(startFromCurrent ? "Please add at least 1 stop to draw a route." : "Please add at least 2 stops to draw a route.");
      return;
    }

    setRoutingOrder(true);
    setTimeout(async () => {
      try {
        let placeNames = wishlist.map(p => p.placeName);
        if (startFromCurrent) {
          const coords = await getUserCoordinates();
          if (!coords) {
            alert("Could not access your location. Please check browser location permissions.");
            setRoutingOrder(false);
            return;
          }
          placeNames = ["Current Location", ...placeNames];
        }

        if (onDrawRoute) {
          onDrawRoute("", false, "", "", placeNames, 'order');
        }
      } catch (err) {
        console.error("Failed to show route by order", err);
      } finally {
        setRoutingOrder(false);
      }
    }, 600);
  };

  const handleRouteToggle = async () => {
    if (isOptimizeActive) {
      if (onClearRoute) onClearRoute();
      return;
    }
    const minStops = startFromCurrent ? 1 : 2;
    if (wishlist.length < minStops) {
      alert(startFromCurrent ? "Please add at least 1 stop to find a route." : "Please add at least 2 stops to find a route.");
      return;
    }
    setRoutingShortest(true);
    try {
      if (startFromCurrent) {
        const coords = await getUserCoordinates();
        if (!coords) {
          alert("Could not access your location. Please check browser location permissions.");
          return;
        }
        // Run Nearest Neighbor optimization in frontend starting from current coords
        const sortedItems = optimizeNearestNeighbor(coords, wishlist);
        const stopsList = ["Current Location", ...sortedItems.map(p => p.placeName)];
        if (onDrawRoute) {
          onDrawRoute("", false, "", "", stopsList, 'optimize');
        }
      } else {
        // Standard backend TSP solver starting from first waypoint
        const result = await onFindShortestRoute(wishlist.map(p => p.id));
        if (result && result.polyline && onDrawRoute) {
          onDrawRoute(result.polyline, false, result.totalDistance, result.totalDuration, result.stops, 'optimize');
        }
      }
    } catch (err) {
      console.error("Failed to find shortest route", err);
    } finally {
      setRoutingShortest(false);
    }
  };

  const handleDragStart = (e, index) => {
    setDraggedIndex(index);
    if (e.dataTransfer) {
      e.dataTransfer.effectAllowed = 'move';
      e.dataTransfer.setData('text/plain', String(index));
    }
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
      <div className="pr-1 custom-scrollbar max-h-[380px] overflow-y-auto mb-4 flex flex-col gap-1.5">
        {wishlist.length === 0 ? (
          <div className="py-16 text-center text-xs text-white/35 flex flex-col items-center justify-center gap-2">
            <Compass className="w-8 h-8 text-white/20 animate-spin-slow" />
            <span>Wishlist is empty. Search state sights on the left and add them!</span>
          </div>
        ) : (
          wishlist.map((item, index) => {
            let role = 'middle';
            if (activeRoute && activeRoute.stops && activeRoute.stops.length > 0) {
              const cleanName = item.placeName.trim().toLowerCase();
              const routeIndex = activeRoute.stops.findIndex(stop => stop.trim().toLowerCase() === cleanName);
              if (routeIndex !== -1) {
                if (routeIndex === 0) {
                  role = 'start';
                } else if (routeIndex === activeRoute.stops.length - 1) {
                  role = 'end';
                } else {
                  role = 'middle';
                }
              }
            } else {
              if (index === 0) {
                role = 'start';
              } else if (index === wishlist.length - 1) {
                role = 'end';
              } else {
                role = 'middle';
              }
            }

            const itemColor = getStopColor(role, index);
            const nextItem = wishlist[index + 1];
            let distanceText = '';
            if (nextItem && item.lat && item.lng && nextItem.lat && nextItem.lng) {
              const dist = calculateHaversineDistance(item.lat, item.lng, nextItem.lat, nextItem.lng);
              distanceText = `${dist.toFixed(1)} km`;
            }

            return (
              <React.Fragment key={item.id}>
                <WishlistItem
                  item={item}
                  index={index}
                  color={itemColor}
                  onRemove={onRemove}
                  onDragStart={handleDragStart}
                  onDragOver={handleDragOver}
                  onDragEnd={handleDragEnd}
                  onDrop={handleDrop}
                />
                {index < wishlist.length - 1 && (
                  <div className="flex flex-col items-center justify-center my-0.5 relative select-none">
                    <div className="w-[1.5px] h-6 border-l border-dashed border-white/20" />
                    {distanceText && (
                      <div 
                        className="absolute bg-slate-950/90 backdrop-blur-sm border border-white/10 px-2 py-0.5 rounded-full text-[8px] font-black text-violet-300 tracking-wider shadow-sm flex items-center gap-1"
                        style={{ textShadow: '0 0 4px rgba(139, 92, 246, 0.4)' }}
                        title={`Distance from ${item.placeName} to ${nextItem?.placeName}`}
                      >
                        <span>📍</span>
                        <span>{distanceText}</span>
                      </div>
                    )}
                  </div>
                )}
              </React.Fragment>
            );
          })
        )}
      </div>

      {/* Reorder instructions & Routing CTAs */}
      {wishlist.length > 0 && (
        <div className="pt-3 border-t border-white/5 space-y-3">
          <p className="text-[9px] text-white/30 text-center italic">
            💡 Tip: Drag and drop stops to change their rank and plan your route.
          </p>

          <div className="flex items-center gap-2 px-1 py-0.5">
            <input
              id="gmap-checkbox-start-current"
              type="checkbox"
              checked={startFromCurrent}
              onChange={(e) => setStartFromCurrent(e.target.checked)}
              className="w-3.5 h-3.5 rounded border-white/20 bg-white/5 text-violet-650 focus:ring-violet-500 focus:ring-offset-slate-950 cursor-pointer"
            />
            <label htmlFor="gmap-checkbox-start-current" className="text-[10px] text-white/70 font-semibold cursor-pointer select-none">
              Start route from my current location 🎯
            </label>
          </div>

          <div className="flex flex-row gap-2 w-full">
            <button
              onClick={handleShowRouteByOrder}
              disabled={routingOrder}
              className={`flex-1 flex items-center justify-center gap-1 py-2 px-1.5 rounded-lg text-[10px] font-bold transition-all cursor-pointer disabled:opacity-50 ${
                isOrderActive
                  ? "bg-teal-600 text-white shadow-md shadow-teal-500/20 border border-teal-500/30 font-black"
                  : activeRoute
                    ? "bg-white/5 border border-white/10 text-white/40 hover:bg-white/10 hover:text-white"
                    : "bg-teal-650 hover:bg-teal-700 text-white shadow-sm border border-teal-600/20"
              }`}
            >
              {routingOrder ? (
                <Loader className="w-3 h-3 animate-spin flex-shrink-0" />
              ) : (
                <Map className="w-3 h-3 flex-shrink-0" />
              )}
              <span className="truncate">{isOrderActive ? "✓ Active Order" : "Route by Order"}</span>
            </button>

            <button
              onClick={handleRouteToggle}
              disabled={routingShortest}
              className={`flex-1 flex items-center justify-center gap-1 py-2 px-1.5 rounded-lg text-[10px] font-bold transition-all cursor-pointer disabled:opacity-50 ${
                isOptimizeActive
                  ? "bg-violet-600 text-white shadow-md shadow-violet-500/20 border border-violet-500/30 font-black"
                  : activeRoute
                    ? "bg-white/5 border border-white/10 text-white/40 hover:bg-white/10 hover:text-white"
                    : "bg-violet-650 hover:bg-violet-750 text-white shadow-sm border border-violet-600/20"
              }`}
            >
              {routingShortest ? (
                <Loader className="w-3 h-3 animate-spin flex-shrink-0" />
              ) : (
                <Sparkles className="w-3 h-3 flex-shrink-0" />
              )}
              <span className="truncate">{isOptimizeActive ? "✓ Optimized" : "Optimize Path"}</span>
            </button>
          </div>
        </div>
      )}
    </GlassCard>
  )
}
