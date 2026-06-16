import React, { useState } from 'react'
import { MapPin, Navigation, Loader } from 'lucide-react'
import { useGeolocation } from '../../hooks/useGeolocation'

export default function StepStartLocation({ startLocation, setStartLocation }) {
  const { loading, error, getPosition } = useGeolocation();
  const [geoStatus, setGeoStatus] = useState('');

  const handleUseMyLocation = async () => {
    try {
      setGeoStatus('Locating...');
      const coords = await getPosition();
      const locStr = `Coordinates: ${coords.lat.toFixed(4)}, ${coords.lng.toFixed(4)}`;
      setStartLocation(locStr);
      setGeoStatus('Location acquired!');
    } catch (err) {
      setGeoStatus('Permission denied or timeout');
    }
  };

  const hubs = ["Mumbai", "Delhi", "Bengaluru", "Chennai", "Kolkata", "Hyderabad", "Kochi"];

  return (
    <div className="space-y-6 text-left">
      <h3 className="text-lg font-bold text-white text-center sm:text-left">Configure Your Start Location</h3>
      <p className="text-xs text-white/60 text-center sm:text-left">Where will your journey begin? Enter a city or use your GPS location.</p>

      <div className="space-y-4">
        <div className="relative">
          <input
            type="text"
            value={startLocation}
            onChange={(e) => {
              setStartLocation(e.target.value);
              setGeoStatus('');
            }}
            placeholder="Search starting city (e.g. Mumbai)"
            className="w-full glass-input pl-11 text-xs"
          />
          <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-violet-400" />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={handleUseMyLocation}
            disabled={loading}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-700 text-[10px] font-bold text-white transition-all disabled:opacity-50"
          >
            {loading ? (
              <Loader className="w-3 h-3 animate-spin" />
            ) : (
              <Navigation className="w-3 h-3" />
            )}
            <span>{geoStatus || "Use My Location"}</span>
          </button>
        </div>

        {error && (
          <p className="text-[10px] text-red-400 font-semibold">{error}</p>
        )}

        <div className="space-y-2">
          <label className="block text-[10px] font-bold text-white/50 uppercase tracking-wider">
            Popular Travel Hubs:
          </label>
          <div className="flex flex-wrap gap-2">
            {hubs.map((hub) => (
              <button
                key={hub}
                type="button"
                onClick={() => {
                  setStartLocation(hub);
                  setGeoStatus('');
                }}
                className={`px-3 py-1.5 rounded-lg border text-[10px] font-semibold transition-all ${
                  startLocation === hub
                    ? 'bg-violet-500/20 border-violet-500 text-white'
                    : 'bg-white/5 border-white/5 text-white/60 hover:bg-white/10 hover:text-white'
                }`}
              >
                {hub}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
