import React, { useEffect, useRef, useState } from 'react'
import { GlassCard } from '../ui/GlassCard'
import { Navigation, Search, Map, Layers, RefreshCw } from 'lucide-react'

export default function GoogleMapPanel({ wishlist = [], activeRoute = null }) {
  const mapRef = useRef(null);
  const [apiKey] = useState(() => {
    return import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';
  });
  const [mapLoaded, setMapLoaded] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [mapInstance, setMapInstance] = useState(null);
  const markersRef = useRef([]);
  const polylineRef = useRef(null);

  const hasRealKey = apiKey && apiKey !== 'your_key_here' && apiKey.trim() !== '';

  // Dual-Mode Script Loader
  useEffect(() => {
    if (!hasRealKey) return;

    if (window.google && window.google.maps) {
      setMapLoaded(true);
      return;
    }

    const scriptId = 'google-maps-script';
    let script = document.getElementById(scriptId);

    if (!script) {
      script = document.createElement('script');
      script.id = scriptId;
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
      script.async = true;
      script.defer = true;
      script.onload = () => setMapLoaded(true);
      script.onerror = () => console.error("Failed to load Google Maps script");
      document.head.appendChild(script);
    } else {
      setMapLoaded(true);
    }
  }, [apiKey, hasRealKey]);

  // Map Initialization & Update Loop
  useEffect(() => {
    if (!mapLoaded || !mapRef.current || !window.google || !window.google.maps) return;

    // Create Map Instance if not exists
    let map = mapInstance;
    if (!map) {
      map = new window.google.maps.Map(mapRef.current, {
        center: { lat: 20.5937, lng: 78.9629 }, // Center of India
        zoom: 5,
        styles: [
          { elementType: 'geometry', stylers: [{ color: '#1d2c4d' }] },
          { elementType: 'labels.text.string', stylers: [{ color: '#ffffff' }] },
          { elementType: 'labels.text.fill', stylers: [{ color: '#8ec3b9' }] },
          { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#0e1626' }] }
        ]
      });
      setMapInstance(map);
    }

    // Clear old markers
    markersRef.current.forEach(m => m.setMap(null));
    markersRef.current = [];

    // Clear old polyline
    if (polylineRef.current) {
      polylineRef.current.setMap(null);
      polylineRef.current = null;
    }

    // Render Wishlist Markers
    const bounds = new window.google.maps.LatLngBounds();
    wishlist.forEach((place) => {
      if (place.lat && place.lng) {
        const marker = new window.google.maps.Marker({
          position: { lat: place.lat, lng: place.lng },
          map: map,
          title: place.placeName,
          animation: window.google.maps.Animation.DROP
        });
        markersRef.current.push(marker);
        bounds.extend(marker.getPosition());
      }
    });

    // Render Active Polyline Route
    if (activeRoute && activeRoute.polyline) {
      try {
        const path = window.google.maps.geometry.encoding.decodePath(activeRoute.polyline);
        const poly = new window.google.maps.Polyline({
          path: path,
          geodesic: true,
          strokeColor: activeRoute.isScenic ? '#14b8a6' : '#7c3aed',
          strokeOpacity: 1.0,
          strokeWeight: 4
        });
        poly.setMap(map);
        polylineRef.current = poly;

        path.forEach(pt => bounds.extend(pt));
      } catch (err) {
        console.error("Failed to decode active route path", err);
      }
    }

    // Auto Zoom/Center Fit
    if (wishlist.length > 0) {
      map.fitBounds(bounds);
    }

  }, [mapLoaded, wishlist, activeRoute, mapInstance]);

  // Handler for custom search
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    if (mapInstance && window.google && window.google.maps) {
      const geocoder = new window.google.maps.Geocoder();
      geocoder.geocode({ address: searchQuery }, (results, status) => {
        if (status === 'OK' && results[0]) {
          mapInstance.setCenter(results[0].geometry.location);
          mapInstance.setZoom(10);
          new window.google.maps.Marker({
            map: mapInstance,
            position: results[0].geometry.location,
            title: searchQuery
          });
        }
      });
    }
  };

  return (
    <GlassCard className="p-4 bg-white/[0.04] space-y-4">
      {/* Top Map Controls */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-white">
          <Map className="w-4.5 h-4.5 text-violet-400" />
          <span className="text-xs font-bold uppercase tracking-wider">Travel Route Workspace</span>
        </div>

        {/* Search Bar */}
        <form onSubmit={handleSearchSubmit} className="relative w-full sm:max-w-xs">
          <input
            type="text"
            placeholder="Search address / place..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            disabled={!hasRealKey}
            className="w-full glass-input pl-10 pr-4 py-1.5 text-xs placeholder-white/30"
          />
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
        </form>
      </div>

      {/* Map Container */}
      {hasRealKey ? (
        <div 
          ref={mapRef} 
          className="w-full h-[320px] rounded-xl overflow-hidden border border-white/5 shadow-inner bg-slate-900/60"
        />
      ) : (
        /* GORGEOUS HIGH-FIDELITY SIMULATED MAP INTERFACE */
        <div className="w-full h-[320px] rounded-xl overflow-hidden border border-white/5 bg-[#0b0f19] relative flex flex-col justify-between p-5">
          {/* Compass grid line background */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(124,58,237,0.1)_0%,transparent_70%)] pointer-events-none" />
          <div className="absolute inset-0 opacity-[0.05] bg-[linear-gradient(rgba(255,255,255,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.1)_1px,transparent_1px)] bg-[size:20px_20px] pointer-events-none" />

          {/* Simulated Active Path Polyline */}
          {wishlist.length >= 2 && (
            <svg className="absolute inset-0 w-full h-full pointer-events-none">
              <path 
                d={`M 100 160 Q 200 80 300 200 T 400 120`} 
                fill="none" 
                stroke={activeRoute?.isScenic ? '#14b8a6' : '#7c3aed'} 
                strokeWidth="3.5" 
                strokeDasharray="8 4"
                className="animate-[dash_2s_linear_infinite]"
              />
            </svg>
          )}

          {/* Top Panel Indicators */}
          <div className="flex justify-between items-start z-10">
            <span className="px-2.5 py-1 rounded-lg bg-violet-600/20 border border-violet-500/30 text-[9px] font-black text-violet-300 uppercase tracking-wide">
              🤖 Map Simulation Mode
            </span>
            <div className="flex items-center gap-1.5 text-white/50 text-[10px] font-bold">
              <Layers className="w-3.5 h-3.5" />
              <span>Vector Terrain Layer</span>
            </div>
          </div>

          {/* Active Wishlist Markers */}
          <div className="flex-1 flex items-center justify-around z-10">
            {wishlist.length === 0 ? (
              <div className="text-center text-xs text-white/35 max-w-xs mx-auto space-y-2">
                <Navigation className="w-8 h-8 text-violet-400 mx-auto animate-bounce" />
                <p>Google Map will display your route path polylines, navigation pins, and transit checkpoints here once places are added.</p>
              </div>
            ) : (
              <div className="flex flex-wrap gap-4 justify-center items-center">
                {wishlist.map((place, i) => (
                  <div key={place.id} className="flex flex-col items-center gap-1 text-[10px] font-bold animate-dashboard-fade">
                    <div className="w-7 h-7 rounded-full bg-violet-600/30 border border-violet-500 text-violet-300 flex items-center justify-center relative shadow-[0_0_12px_rgba(124,58,237,0.3)]">
                      📍
                      <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-violet-500 text-white text-[8px] flex items-center justify-center">
                        {i + 1}
                      </span>
                    </div>
                    <span className="text-white bg-slate-950/80 px-2 py-0.5 rounded border border-white/5 max-w-[80px] truncate">
                      {place.placeName}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Lower controls block */}
          <div className="flex justify-between items-center z-10 text-[9px] text-white/40 border-t border-white/5 pt-3">
            <span>Center Point: India (20.5937° N, 78.9629° E)</span>
            {activeRoute && (
              <span className="text-emerald-400 font-bold">
                ✓ Route active: {activeRoute.totalDistance} | {activeRoute.totalDuration}
              </span>
            )}
          </div>
        </div>
      )}
    </GlassCard>
  )
}
