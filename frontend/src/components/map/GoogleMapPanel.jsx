import React, { useEffect, useRef, useState } from 'react'
import { GlassCard } from '../ui/GlassCard'
import { Navigation, Search, Map, Layers, RefreshCw, Plus, Minus } from 'lucide-react'
import { API_BASE } from '../../store/authStore'
import { useThemeStore } from '../../store/themeStore'

const DARK_MAP_STYLES = [
  { elementType: "geometry", stylers: [{ color: "#242f3e" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#242f3e" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#746855" }] },
  {
    featureType: "administrative.locality",
    elementType: "labels.text.fill",
    stylers: [{ color: "#d59563" }]
  },
  {
    featureType: "poi",
    elementType: "labels.text.fill",
    stylers: [{ color: "#d59563" }]
  },
  {
    featureType: "poi.park",
    elementType: "geometry",
    stylers: [{ color: "#263c3f" }]
  },
  {
    featureType: "poi.park",
    elementType: "labels.text.fill",
    stylers: [{ color: "#6b9a76" }]
  },
  {
    featureType: "road",
    elementType: "geometry",
    stylers: [{ color: "#38414e" }]
  },
  {
    featureType: "road",
    elementType: "geometry.stroke",
    stylers: [{ color: "#212a37" }]
  },
  {
    featureType: "road",
    elementType: "labels.text.fill",
    stylers: [{ color: "#9ca5b3" }]
  },
  {
    featureType: "road.highway",
    elementType: "geometry",
    stylers: [{ color: "#746855" }]
  },
  {
    featureType: "road.highway",
    elementType: "geometry.stroke",
    stylers: [{ color: "#1f2835" }]
  },
  {
    featureType: "road.highway",
    elementType: "labels.text.fill",
    stylers: [{ color: "#f3d19c" }]
  },
  {
    featureType: "transit",
    elementType: "geometry",
    stylers: [{ color: "#2f3948" }]
  },
  {
    featureType: "transit.station",
    elementType: "labels.text.fill",
    stylers: [{ color: "#d59563" }]
  },
  {
    featureType: "water",
    elementType: "geometry",
    stylers: [{ color: "#17263c" }]
  },
  {
    featureType: "water",
    elementType: "labels.text.fill",
    stylers: [{ color: "#515c6d" }]
  },
  {
    featureType: "water",
    elementType: "labels.text.stroke",
    stylers: [{ color: "#17263c" }]
  }
];

// Helper to decode Google's encoded polyline algorithm format
function decodePolyline(encoded) {
  if (!encoded) return [];
  var points = [];
  var index = 0, len = encoded.length;
  var lat = 0, lng = 0;
  while (index < len) {
    var b, shift = 0, result = 0;
    do {
      b = encoded.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);
    var dlat = ((result & 1) ? ~(result >> 1) : (result >> 1));
    lat += dlat;
    shift = 0;
    result = 0;
    do {
      b = encoded.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);
    var dlng = ((result & 1) ? ~(result >> 1) : (result >> 1));
    lng += dlng;
    points.push([lat / 1e5, lng / 1e5]);
  }
  return points;
}

// Helpers to format distance and duration
function formatDistance(meters) {
  if (!meters) return '';
  return (meters / 1000).toFixed(1) + " km";
}

function formatDuration(seconds) {
  if (!seconds) return '';
  const h = Math.floor(seconds / 3600);
  const m = Math.round((seconds % 3600) / 60);
  if (h > 0) {
    return `${h} hr ${m} min`;
  }
  return `${m} min`;
}

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

// Shifts polyline coordinates slightly to the right of the direction of travel to show side-by-side overlap pathing
function offsetPath(path, offsetDegrees = 0.00012) {
  if (!path || path.length < 2) return path;
  
  const offsetPoints = [];
  
  for (let i = 0; i < path.length; i++) {
    const curr = path[i];
    let dx = 0;
    let dy = 0;
    
    if (i === 0) {
      const next = path[i + 1];
      dx = next.lng - curr.lng;
      dy = next.lat - curr.lat;
    } else if (i === path.length - 1) {
      const prev = path[i - 1];
      dx = curr.lng - prev.lng;
      dy = curr.lat - prev.lat;
    } else {
      const prev = path[i - 1];
      const next = path[i + 1];
      dx = next.lng - prev.lng;
      dy = next.lat - prev.lat;
    }
    
    const len = Math.sqrt(dx * dx + dy * dy);
    if (len > 0) {
      const px = dy / len;
      const py = -dx / len;
      
      offsetPoints.push({
        lat: curr.lat + py * offsetDegrees,
        lng: curr.lng + px * offsetDegrees
      });
    } else {
      offsetPoints.push(curr);
    }
  }
  
  return offsetPoints;
}


const GLOWING_DOT_SVG = `
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 36 36" width="36" height="36">
    <!-- Outer glowing halo -->
    <circle cx="18" cy="18" r="10" fill="#3b82f6" opacity="0.3">
      <animate attributeName="r" values="8;18;8" dur="2.5s" repeatCount="indefinite" />
      <animate attributeName="opacity" values="0.4;0;0.4" dur="2.5s" repeatCount="indefinite" />
    </circle>
    <!-- Middle soft glow -->
    <circle cx="18" cy="18" r="8" fill="#60a5fa" opacity="0.5">
      <animate attributeName="r" values="6;12;6" dur="2.5s" repeatCount="indefinite" />
    </circle>
    <!-- Core pulsing blue dot -->
    <circle cx="18" cy="18" r="5.5" fill="#2563eb" stroke="#ffffff" stroke-width="2.5" />
  </svg>
`;

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

export default function GoogleMapPanel({ 
  wishlist = [], 
  destinations = [], 
  activeRoute = null, 
  onAddWishlist, 
  onUpdatePlaceName, 
  onShowWeather,
  userCoords: propUserCoords = null,
  onUpdateUserCoords = null
}) {
  const mapRef = useRef(null);
  
  // API Key state: automatically resolves from env or localStorage
  const [apiKey, setApiKey] = useState(() => {
    return import.meta.env.VITE_GOOGLE_MAPS_API_KEY || localStorage.getItem('gmaps_api_key') || '';
  });
  const [inputKey, setInputKey] = useState('');

  const [googleMapsLoaded, setGoogleMapsLoaded] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeLayer, setActiveLayer] = useState('street'); // street or satellite
  const [isSearching, setIsSearching] = useState(false);
  const [routeInfo, setRouteInfo] = useState({ distance: '', duration: '' });
  
  const { isDarkMode } = useThemeStore();
  const [localUserCoords, setLocalUserCoords] = useState(null);
  const userCoords = propUserCoords || localUserCoords;
  const setUserCoords = (coords) => {
    setLocalUserCoords(coords);
    if (onUpdateUserCoords) {
      onUpdateUserCoords(coords);
    }
  };
  const [predictions, setPredictions] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [hoverTooltip, setHoverTooltip] = useState({
    visible: false,
    x: 0,
    y: 0,
    startName: '',
    endName: '',
    distance: ''
  });

  const mapInstanceRef = useRef(null);
  const markersRef = useRef([]);
  const polylineRef = useRef(null); // legacy single polyline
  const glowPolylineRef = useRef(null); // legacy single glow
  const routePolylinesRef = useRef([]); // array of segment polylines
  const tempMarkerRef = useRef(null);
  const infoWindowRef = useRef(null);
  const directionsRendererRef = useRef(null);
  const myLocationMarkerRef = useRef(null);
  const autocompleteServiceRef = useRef(null);
  const searchContainerRef = useRef(null);

  // Close search suggestions dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);


  // Load Google Maps script dynamically when key is present
  useEffect(() => {
    if (!apiKey) {
      setGoogleMapsLoaded(false);
      return;
    }

    if (window.google && window.google.maps && window.google.maps.Map) {
      setGoogleMapsLoaded(true);
      return;
    }

    const scriptId = 'google-maps-js';
    let script = document.getElementById(scriptId);
    
    // If key changes, force script reload
    if (script && script.dataset.key !== apiKey) {
      script.remove();
      script = null;
      setGoogleMapsLoaded(false);
      if (mapInstanceRef.current) mapInstanceRef.current = null;
    }

    if (!script) {
      script = document.createElement('script');
      script.id = scriptId;
      script.dataset.key = apiKey;
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
      script.async = true;
      script.defer = true;
      script.onload = () => {
        const checkMap = () => {
          if (window.google && window.google.maps && window.google.maps.Map) {
            setGoogleMapsLoaded(true);
          } else {
            setTimeout(checkMap, 50);
          }
        };
        checkMap();
      };
      script.onerror = () => console.error("Failed to load Google Maps script");
      document.head.appendChild(script);
    } else {
      const checkMap = () => {
        if (window.google && window.google.maps && window.google.maps.Map) {
          setGoogleMapsLoaded(true);
        } else {
          setTimeout(checkMap, 50);
        }
      };
      checkMap();
    }
  }, [apiKey]);

  // Map Instance Initialization
  useEffect(() => {
    if (!googleMapsLoaded || !mapRef.current || !window.google || !window.google.maps) return;

    if (!mapInstanceRef.current) {
      try {
        // Create google map centered on India (disable default UI controls to use custom styled ones)
        const map = new window.google.maps.Map(mapRef.current, {
          center: { lat: 20.5937, lng: 78.9629 },
          zoom: 5,
          disableDefaultUI: true,
          clickableIcons: true,
          mapTypeId: activeLayer === 'satellite' ? 'hybrid' : 'roadmap',
          gestureHandling: 'cooperative',
          rotateControl: true,
          tiltControl: true,
          mapId: 'DEMO_MAP_ID',
          renderingType: 'VECTOR',
          styles: isDarkMode ? DARK_MAP_STYLES : []
        });
        
        mapInstanceRef.current = map;
        infoWindowRef.current = new window.google.maps.InfoWindow();

        // Auto-locate user on map load to show blue dot and center
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            (position) => {
              const { latitude, longitude } = position.coords;
              map.setCenter({ lat: latitude, lng: longitude });
              map.setZoom(13);

              if (myLocationMarkerRef.current) {
                myLocationMarkerRef.current.setMap(null);
              }

              const myLocationMarker = new window.google.maps.Marker({
                position: { lat: latitude, lng: longitude },
                map: map,
                title: "My Location",
                optimized: false, // Force HTML DOM marker rendering for SVG animation
                icon: {
                  url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(GLOWING_DOT_SVG),
                  size: new window.google.maps.Size(36, 36),
                  anchor: new window.google.maps.Point(18, 18)
                }
              });
              myLocationMarkerRef.current = myLocationMarker;
              setUserCoords({ lat: latitude, lng: longitude });
            },
            (err) => {
              console.log("Auto-location onload failed/declined:", err);
            },
            { timeout: 8000 }
          );
        }

        // Handle map clicks to create custom stops
        map.addListener('click', (e) => {
          // Prevent Google's default POI info card/redirection behavior
          if (e.placeId && typeof e.stop === 'function') {
            e.stop();
          }

          const lat = e.latLng.lat();
          const lng = e.latLng.lng();

          if (tempMarkerRef.current) {
            tempMarkerRef.current.setMap(null);
          }

          const tempMarker = new window.google.maps.Marker({
            position: { lat, lng },
            map: map
          });
          tempMarkerRef.current = tempMarker;

          // Immediately display loading indicator in the custom styled InfoWindow
          const loadingDiv = document.createElement('div');
          loadingDiv.className = 'p-4 flex flex-col items-center justify-center space-y-3 text-center min-w-[180px]';
          loadingDiv.innerHTML = `
            <div class="w-6 h-6 border-2 border-violet-600 border-t-transparent rounded-full animate-spin"></div>
            <p class="text-[10px] font-bold text-violet-700 animate-pulse">Verifying location...</p>
          `;
          if (infoWindowRef.current) infoWindowRef.current.close();
          infoWindowRef.current.setContent(loadingDiv);
          infoWindowRef.current.open(map, tempMarker);

          const processGeocodeResult = (placeName, state) => {
            // Check if placeName is a generic coordinate, zip code, street number, or unnamed road
            const isValidPlaceName = (name) => {
              if (!name) return false;
              const lowercase = name.toLowerCase();
              if (lowercase.includes("point on map")) return false;
              if (lowercase.includes("unnamed road")) return false;
              if (/^[0-9.-]+\s*,\s*[0-9.-]+$/.test(name)) return false; // coordinate format
              if (/^[a-z0-9]{4,8}\+[a-z0-9]{2,4}/i.test(name)) return false; // plus code format
              if (/^\d+$/.test(name.trim())) return false; // pure digits (e.g. street number or zip code)
              return true;
            };

            const isNameValid = isValidPlaceName(placeName);
            const displayValue = isNameValid ? placeName : "";
            const inputPlaceholder = isNameValid ? "Edit place name..." : "Enter place name...";

            const popupDiv = document.createElement('div');
            popupDiv.className = 'p-3 space-y-2 text-slate-800 dark:text-white text-left min-w-[180px]';
            popupDiv.innerHTML = `
              <div class="space-y-1">
                <label class="text-[9px] font-black uppercase text-gray-400 dark:text-gray-300">Place Name</label>
                <input id="gmap-input-place-name" type="text" value="${displayValue}" placeholder="${inputPlaceholder}" class="w-full px-2 py-1 border border-gray-300 dark:border-violet-850 rounded text-xs focus:ring-1 focus:ring-violet-500 font-semibold text-slate-800 dark:text-white bg-white dark:bg-slate-900" />
              </div>
              <p class="text-[9px] text-gray-500 dark:text-gray-400 font-semibold">State: ${state}</p>
              <button id="gmap-btn-add-click" class="w-full px-2 py-1.5 bg-violet-650 hover:bg-violet-750 text-white font-extrabold text-[10px] rounded-lg cursor-pointer transition-all shadow-sm">
                + Add to Wishlist
              </button>
              <button id="gmap-btn-weather-click" class="w-full px-2 py-1.5 mt-1 bg-sky-500 hover:bg-sky-600 text-white font-extrabold text-[10px] rounded-lg cursor-pointer transition-all shadow-sm">
                Show the current weather
              </button>
              <div id="gmap-weather-display" class="hidden text-xs font-black text-sky-600 dark:text-sky-400 text-center py-1 mt-1"></div>
            `;

            // Update content directly (InfoWindow is already open)
            infoWindowRef.current.setContent(popupDiv);

            setTimeout(() => {
              const btn = document.getElementById('gmap-btn-add-click');
              const input = document.getElementById('gmap-input-place-name');
              const weatherBtn = document.getElementById('gmap-btn-weather-click');
              const weatherDisplay = document.getElementById('gmap-weather-display');
              if (input) {
                input.focus();
              }
              if (btn && onAddWishlist) {
                btn.onclick = async () => {
                  const finalPlaceName = input ? input.value.trim() : "";
                  if (!finalPlaceName) {
                    alert("Please enter a name for this location.");
                    return;
                  }
                  try {
                    await onAddWishlist({
                      placeName: finalPlaceName,
                      state,
                      category: 'Map Location',
                      lat,
                      lng
                    });
                    tempMarker.setMap(null);
                    tempMarkerRef.current = null;
                    infoWindowRef.current.close();
                  } catch (err) {
                    console.error("Failed to add stop to wishlist", err);
                  }
                };
              }
              if (weatherBtn) {
                weatherBtn.onclick = async () => {
                  weatherBtn.disabled = true;
                  weatherBtn.innerText = "Loading...";
                  try {
                    const openWeatherKey = import.meta.env.VITE_OPENWEATHER_API_KEY;
                    const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lng}&units=metric&appid=${openWeatherKey}`);
                    if (response.ok) {
                      const data = await response.json();
                      if (data && data.main) {
                        const tempC = Math.round(data.main.temp);
                        weatherDisplay.innerText = `${tempC}°C`;
                        weatherDisplay.classList.remove('hidden');
                        weatherBtn.classList.add('hidden');
                      } else {
                        weatherBtn.innerText = "Weather unavailable";
                        weatherBtn.disabled = false;
                      }
                    } else {
                      weatherBtn.innerText = "Weather unavailable";
                      weatherBtn.disabled = false;
                    }
                  } catch (err) {
                    console.error("Failed to fetch weather in InfoWindow", err);
                    weatherBtn.innerText = "Weather unavailable";
                    weatherBtn.disabled = false;
                  }
                };
              }
            }, 200);
          };

          const runNominatimFallback = () => {
            let placeName = `Point on Map (${lat.toFixed(4)}, ${lng.toFixed(4)})`;
            let state = 'Unknown';
            
            console.warn("Trying Nominatim fallback via backend proxy...");
            fetch(`${API_BASE}/destinations/reverse-geocode?lat=${lat}&lng=${lng}`)
              .then(res => res.json())
              .then(data => {
                let foundName = '';
                let foundState = 'Unknown';
                
                if (data) {
                  if (data.name) {
                    foundName = data.name;
                  }
                  if (!foundName && data.address) {
                    const addr = data.address;
                    const poiKeys = [
                      'stadium', 'amenity', 'shop', 'tourism', 'historic', 
                      'attraction', 'park', 'leisure', 'aeroway', 'railway', 
                      'building', 'natural', 'house_name', 'suburb', 'neighbourhood',
                      'locality', 'city', 'town', 'village', 'road'
                    ];
                    for (const key of poiKeys) {
                      if (addr[key]) {
                        foundName = addr[key];
                        break;
                      }
                    }
                  }
                  if (!foundName && data.display_name) {
                    foundName = data.display_name.split(',')[0];
                  }
                  if (data.address && data.address.state) {
                    foundState = data.address.state;
                  }
                }

                if (foundName) {
                  placeName = foundName;
                }
                if (foundState) {
                  state = foundState;
                }

                processGeocodeResult(placeName, state);
              })
              .catch(err => {
                console.error("Nominatim reverse geocoding fallback failed:", err);
                processGeocodeResult(placeName, state);
              });
          };

          const runGeocoderFallback = () => {
            const geocoder = new window.google.maps.Geocoder();
            geocoder.geocode({ location: { lat, lng } }, (results, status) => {
              let placeName = `Point on Map (${lat.toFixed(4)}, ${lng.toFixed(4)})`;
              let state = 'Unknown';

              if (status === 'OK' && results && results.length > 0) {
                let foundName = '';
                const preferredTypes = [
                  'establishment', 'point_of_interest', 'natural_feature', 
                  'airport', 'park', 'neighborhood', 'sublocality_level_1', 
                  'sublocality', 'locality'
                ];
                
                for (const res of results) {
                  for (const comp of res.address_components) {
                    if (comp.types.some(t => preferredTypes.includes(t))) {
                      foundName = comp.long_name;
                      break;
                    }
                  }
                  if (foundName) break;
                }

                if (!foundName && results[0].formatted_address) {
                  foundName = results[0].formatted_address.split(',')[0];
                }

                if (foundName) {
                  placeName = foundName;
                }

                for (const res of results) {
                  for (const comp of res.address_components) {
                    if (comp.types.includes('administrative_area_level_1')) {
                      state = comp.long_name;
                      break;
                    }
                  }
                  if (state !== 'Unknown') break;
                }

                processGeocodeResult(placeName, state);
              } else {
                runNominatimFallback();
              }
            });
          };

          // Try PlacesService first if placeId is present, otherwise fallback to Geocoder, then Nominatim
          if (e.placeId && window.google && window.google.maps && window.google.maps.places) {
            try {
              const service = new window.google.maps.places.PlacesService(map);
              service.getDetails({
                placeId: e.placeId,
                fields: ['name', 'address_components']
              }, (place, status) => {
                if (status === window.google.maps.places.PlacesServiceStatus.OK && place) {
                  let foundName = place.name || '';
                  let foundState = 'Unknown';
                  if (place.address_components) {
                    for (const comp of place.address_components) {
                      if (comp.types.includes('administrative_area_level_1')) {
                        foundState = comp.long_name;
                        break;
                      }
                    }
                  }
                  processGeocodeResult(foundName, foundState);
                } else {
                  runGeocoderFallback();
                }
              });
            } catch (err) {
              console.warn("PlacesService query failed, trying geocoder:", err);
              runGeocoderFallback();
            }
          } else {
            runGeocoderFallback();
          }
        });
      } catch (err) {
        console.error("Failed to initialize Google Maps instance:", err);
      }
    }

  }, [googleMapsLoaded, onAddWishlist]);

  // Dynamic Map Theme Style updates
  useEffect(() => {
    if (mapInstanceRef.current && window.google && window.google.maps) {
      mapInstanceRef.current.setOptions({
        styles: isDarkMode ? DARK_MAP_STYLES : []
      });
    }
  }, [isDarkMode, googleMapsLoaded]);

  // Autocomplete service initialization
  useEffect(() => {
    if (!googleMapsLoaded || !window.google || !window.google.maps || !window.google.maps.places) return;
    if (!autocompleteServiceRef.current) {
      autocompleteServiceRef.current = new window.google.maps.places.AutocompleteService();
    }
  }, [googleMapsLoaded]);

  // Autocomplete prediction search trigger
  useEffect(() => {
    if (!searchQuery.trim() || !autocompleteServiceRef.current) {
      setPredictions([]);
      setShowDropdown(false);
      return;
    }

    const delayDebounce = setTimeout(() => {
      autocompleteServiceRef.current.getPlacePredictions(
        { input: searchQuery },
        (results, status) => {
          if (status === window.google.maps.places.PlacesServiceStatus.OK && results) {
            setPredictions(results);
            setShowDropdown(true);
          } else {
            setPredictions([]);
          }
        }
      );
    }, 250);

    return () => clearTimeout(delayDebounce);
  }, [searchQuery]);

  const handleSelectPrediction = (prediction) => {
    if (prediction.isLocal && prediction.lat && prediction.lng) {
      setSearchQuery(prediction.description);
      setPredictions([]);
      setShowDropdown(false);

      if (!window.google || !mapInstanceRef.current) return;
      const lat = prediction.lat;
      const lng = prediction.lng;
      const placeName = prediction.name;
      const state = prediction.state || "Unknown";
      const displayName = `${placeName}, ${state}, India`;

      const map = mapInstanceRef.current;
      map.setCenter({ lat, lng });
      setTimeout(() => {
        map.setZoom(14); // zoom in closer for perfect fit!
      }, 150);

      if (tempMarkerRef.current) {
        tempMarkerRef.current.setMap(null);
      }

      const tempMarker = new window.google.maps.Marker({
        position: { lat, lng },
        map: map,
        title: placeName
      });
      tempMarkerRef.current = tempMarker;

      const popupDiv = document.createElement('div');
      popupDiv.className = 'p-3 space-y-2 text-slate-800 dark:text-white text-left min-w-[180px]';
      popupDiv.innerHTML = `
        <div class="space-y-1">
          <label class="text-[9px] font-black uppercase text-gray-400 dark:text-gray-300">Place Name</label>
          <input id="gmap-input-search-name" type="text" value="${placeName}" class="w-full px-2 py-1 border border-gray-300 dark:border-violet-850 rounded text-xs focus:ring-1 focus:ring-violet-500 font-semibold text-slate-800 dark:text-white bg-white dark:bg-slate-900" />
        </div>
        <p class="text-[9px] text-gray-500 dark:text-gray-400 font-medium">${state}</p>
        <button id="gmap-btn-add-search" class="w-full px-2 py-1.5 bg-violet-650 hover:bg-violet-750 text-white font-extrabold text-[10px] rounded-lg cursor-pointer transition-all shadow-sm">
          + Add to Wishlist
        </button>
        <button id="gmap-btn-weather-search" class="w-full px-2 py-1.5 mt-1 bg-sky-500 hover:bg-sky-600 text-white font-extrabold text-[10px] rounded-lg cursor-pointer transition-all shadow-sm">
          Show the current weather
        </button>
        <div id="gmap-weather-search-display" class="hidden text-xs font-black text-sky-600 dark:text-sky-400 text-center py-1 mt-1"></div>
      `;

      if (infoWindowRef.current) infoWindowRef.current.close();
      infoWindowRef.current.setContent(popupDiv);
      infoWindowRef.current.open(map, tempMarker);

      setTimeout(() => {
        const btn = document.getElementById('gmap-btn-add-search');
        const input = document.getElementById('gmap-input-search-name');
        const weatherBtn = document.getElementById('gmap-btn-weather-search');
        const weatherDisplay = document.getElementById('gmap-weather-search-display');
        if (btn && onAddWishlist) {
          btn.onclick = async () => {
            const finalPlaceName = input ? input.value.trim() : placeName;
            await onAddWishlist({
              placeName: finalPlaceName,
              state,
              category: prediction.category || 'Sight',
              lat,
              lng
            });
            tempMarker.setMap(null);
            tempMarkerRef.current = null;
            infoWindowRef.current.close();
          };
        }
        if (weatherBtn) {
          weatherBtn.onclick = async () => {
            weatherBtn.disabled = true;
            weatherBtn.innerText = "Loading...";
            try {
              const openWeatherKey = import.meta.env.VITE_OPENWEATHER_API_KEY;
              const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lng}&units=metric&appid=${openWeatherKey}`);
              if (response.ok) {
                const data = await response.json();
                if (data && data.main) {
                  const tempC = Math.round(data.main.temp);
                  weatherDisplay.innerText = `${tempC}°C`;
                  weatherDisplay.classList.remove('hidden');
                  weatherBtn.classList.add('hidden');
                } else {
                  weatherBtn.innerText = "Weather unavailable";
                  weatherBtn.disabled = false;
                }
              } else {
                weatherBtn.innerText = "Weather unavailable";
                weatherBtn.disabled = false;
              }
            } catch (err) {
              console.error("Failed to fetch weather in InfoWindow", err);
              weatherBtn.innerText = "Weather unavailable";
              weatherBtn.disabled = false;
            }
          };
        }
      }, 200);
      return;
    }

    setSearchQuery(prediction.description);
    setPredictions([]);
    setShowDropdown(false);

    if (!window.google || !mapInstanceRef.current) return;
    setIsSearching(true);

    const geocoder = new window.google.maps.Geocoder();
    geocoder.geocode({ placeId: prediction.place_id }, (results, status) => {
      setIsSearching(false);
      if (status === 'OK' && results[0]) {
        const result = results[0];
        const lat = typeof result.geometry.location.lat === 'function' ? result.geometry.location.lat() : result.geometry.location.lat;
        const lng = typeof result.geometry.location.lng === 'function' ? result.geometry.location.lng() : result.geometry.location.lng;
        const displayName = result.formatted_address;
        const placeName = result.address_components && result.address_components[0] 
          ? result.address_components[0].long_name 
          : displayName.split(',')[0];

        let state = 'Unknown';
        if (result.address_components) {
          for (const comp of result.address_components) {
            if (comp.types.includes('administrative_area_level_1')) {
              state = comp.long_name;
              break;
            }
          }
        }

        const map = mapInstanceRef.current;
        map.setCenter({ lat, lng });
        map.setZoom(13);

        if (tempMarkerRef.current) {
          tempMarkerRef.current.setMap(null);
        }

        const tempMarker = new window.google.maps.Marker({
          position: { lat, lng },
          map: map,
          title: placeName
        });
        tempMarkerRef.current = tempMarker;

        const popupDiv = document.createElement('div');
        popupDiv.className = 'p-3 space-y-2 text-slate-800 dark:text-white text-left min-w-[180px]';
        popupDiv.innerHTML = `
          <div class="space-y-1">
            <label class="text-[9px] font-black uppercase text-gray-400 dark:text-gray-300">Place Name</label>
            <input id="gmap-input-search-name" type="text" value="${placeName}" class="w-full px-2 py-1 border border-gray-300 dark:border-violet-850 rounded text-xs focus:ring-1 focus:ring-violet-500 font-semibold text-slate-800 dark:text-white bg-white dark:bg-slate-900" />
          </div>
          <p class="text-[9px] text-gray-500 dark:text-gray-400 font-medium">${displayName.split(',').slice(1, 4).join(',')}</p>
          <button id="gmap-btn-add-search" class="w-full px-2 py-1.5 bg-violet-650 hover:bg-violet-750 text-white font-extrabold text-[10px] rounded-lg cursor-pointer transition-all shadow-sm">
            + Add to Wishlist
          </button>
          <button id="gmap-btn-weather-search" class="w-full px-2 py-1.5 mt-1 bg-sky-500 hover:bg-sky-600 text-white font-extrabold text-[10px] rounded-lg cursor-pointer transition-all shadow-sm">
            Show the current weather
          </button>
          <div id="gmap-weather-search-display" class="hidden text-xs font-black text-sky-600 dark:text-sky-400 text-center py-1 mt-1"></div>
        `;

        if (infoWindowRef.current) infoWindowRef.current.close();
        infoWindowRef.current.setContent(popupDiv);
        infoWindowRef.current.open(map, tempMarker);

        setTimeout(() => {
          const btn = document.getElementById('gmap-btn-add-search');
          const input = document.getElementById('gmap-input-search-name');
          const weatherBtn = document.getElementById('gmap-btn-weather-search');
          const weatherDisplay = document.getElementById('gmap-weather-search-display');
          if (btn && onAddWishlist) {
            btn.onclick = async () => {
              const finalPlaceName = input ? input.value.trim() : placeName;
              if (!finalPlaceName) {
                alert("Please enter a name for this location.");
                return;
              }
              try {
                await onAddWishlist({
                  placeName: finalPlaceName,
                  state,
                  category: 'Searched Destination',
                  lat,
                  lng
                });
                tempMarker.setMap(null);
                tempMarkerRef.current = null;
                infoWindowRef.current.close();
              } catch (err) {
                console.error("Failed to add search result to wishlist", err);
              }
            };
          }
          if (weatherBtn) {
            weatherBtn.onclick = async () => {
              weatherBtn.disabled = true;
              weatherBtn.innerText = "Loading...";
              try {
                const openWeatherKey = import.meta.env.VITE_OPENWEATHER_API_KEY;
                const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lng}&units=metric&appid=${openWeatherKey}`);
                if (response.ok) {
                  const data = await response.json();
                  if (data && data.main) {
                    const tempC = Math.round(data.main.temp);
                    weatherDisplay.innerText = `${tempC}°C`;
                    weatherDisplay.classList.remove('hidden');
                    weatherBtn.classList.add('hidden');
                  } else {
                    weatherBtn.innerText = "Weather unavailable";
                    weatherBtn.disabled = false;
                  }
                } else {
                  weatherBtn.innerText = "Weather unavailable";
                  weatherBtn.disabled = false;
                }
              } catch (err) {
                console.error("Failed to fetch weather in InfoWindow", err);
                weatherBtn.innerText = "Weather unavailable";
                weatherBtn.disabled = false;
              }
            };
          }
        }, 150);
      } else {
        alert("Could not load details for this location.");
      }
    });
  };


  // Tile Layer Manager (Toggles map views dynamically)
  useEffect(() => {
    if (!googleMapsLoaded || !mapInstanceRef.current) return;
    const map = mapInstanceRef.current;
    let mapTypeId = 'roadmap';
    if (activeLayer === 'satellite') mapTypeId = 'hybrid';
    else if (activeLayer === 'terrain') mapTypeId = 'terrain';
    map.setMapTypeId(mapTypeId);
  }, [googleMapsLoaded, activeLayer]);



  // Handle markers & polyline path updates
  useEffect(() => {
    if (!googleMapsLoaded || !mapInstanceRef.current) return;
    const map = mapInstanceRef.current;

    // Reset markers
    markersRef.current.forEach(m => m.setMap(null));
    markersRef.current = [];

    // Reset segment polylines
    routePolylinesRef.current.forEach(p => p.setMap(null));
    routePolylinesRef.current = [];

    // Reset legacy single polylines
    if (polylineRef.current) {
      polylineRef.current.setMap(null);
      polylineRef.current = null;
    }
    if (glowPolylineRef.current) {
      glowPolylineRef.current.setMap(null);
      glowPolylineRef.current = null;
    }

    // Reset directions renderer if it exists
    if (directionsRendererRef.current) {
      directionsRendererRef.current.setMap(null);
      directionsRendererRef.current = null;
    }

    const bounds = new window.google.maps.LatLngBounds();
    let hasValidBounds = false;

    // Helper: calculate hover segment details for a marker
    const getMarkerHoverInfo = (idx) => {
      let startName = '';
      let endName = '';
      let distance = 0;
      
      if (activeRoute && activeRoute.stops && activeRoute.stops.length > 0) {
        const item = wishlist[idx];
        if (!item) return null;
        const cleanName = item.placeName.trim().toLowerCase();
        const routeIndex = activeRoute.stops.findIndex(stop => stop.trim().toLowerCase() === cleanName);
        
        if (routeIndex > 0) {
          startName = activeRoute.stops[routeIndex - 1];
          endName = activeRoute.stops[routeIndex];
          
          const prevStopName = activeRoute.stops[routeIndex - 1];
          let prevPt = null;
          if (prevStopName === "Current Location") {
            prevPt = userCoords;
          } else {
            const match = wishlist.find(p => p.placeName.trim().toLowerCase() === prevStopName.trim().toLowerCase());
            if (match) prevPt = { lat: match.lat, lng: match.lng };
          }
          
          if (prevPt && item.lat && item.lng) {
            distance = calculateHaversineDistance(prevPt.lat, prevPt.lng, item.lat, item.lng);
          }
        } else {
          startName = activeRoute.stops[0];
          endName = activeRoute.stops[0];
          distance = 0;
        }
      } else {
        if (idx > 0) {
          startName = wishlist[idx - 1].placeName;
          endName = wishlist[idx].placeName;
          distance = calculateHaversineDistance(
            wishlist[idx - 1].lat, wishlist[idx - 1].lng,
            wishlist[idx].lat, wishlist[idx].lng
          );
        } else {
          startName = wishlist[0].placeName;
          endName = wishlist[0].placeName;
          distance = 0;
        }
      }
      
      return { startName, endName, distanceText: `${distance.toFixed(1)} km` };
    };

    const findClosestCoordinateIndex = (point, coords) => {
      let minDistance = Infinity;
      let closestIndex = 0;
      for (let i = 0; i < coords.length; i++) {
        const dist = Math.pow(coords[i].lat - point.lat, 2) + Math.pow(coords[i].lng - point.lng, 2);
        if (dist < minDistance) {
          minDistance = dist;
          closestIndex = i;
        }
      }
      return closestIndex;
    };

    const drawRouteSegments = (fullPathCoords, pointsList) => {
      routePolylinesRef.current.forEach(p => p.setMap(null));
      routePolylinesRef.current = [];

      if (fullPathCoords.length === 0 || pointsList.length < 2) return;

      const splitIndices = pointsList.map(pt => findClosestCoordinateIndex(pt, fullPathCoords));

      const segments = [];
      for (let i = 0; i < pointsList.length - 1; i++) {
        const startIndex = splitIndices[i];
        const endIndex = splitIndices[i + 1];
        
        const segmentCoords = fullPathCoords.slice(startIndex, Math.max(endIndex + 1, startIndex + 2));
        const offsetSegmentCoords = offsetPath(segmentCoords);

        let startName = activeRoute?.stops?.[i] || `Stop #${i + 1}`;
        let endName = activeRoute?.stops?.[i + 1] || `Stop #${i + 2}`;
        
        const startPt = pointsList[i];
        const endPt = pointsList[i + 1];
        
        const startMatch = wishlist.find(p => p.lat === startPt.lat && p.lng === startPt.lng);
        if (startMatch) startName = startMatch.placeName;
        const endMatch = wishlist.find(p => p.lat === endPt.lat && p.lng === endPt.lng);
        if (endMatch) endName = endMatch.placeName;

        if (startPt.lat === userCoords?.lat && startPt.lng === userCoords?.lng) {
          startName = "Current Location";
        }
        if (endPt.lat === userCoords?.lat && endPt.lng === userCoords?.lng) {
          endName = "Current Location";
        }

        let startRole = 'middle';
        let wishIndex = -1;
        if (startPt.lat === userCoords?.lat && startPt.lng === userCoords?.lng) {
          startRole = 'start';
        } else if (startMatch) {
          wishIndex = wishlist.findIndex(p => p.id === startMatch.id);
          if (wishIndex !== -1) {
            if (activeRoute && activeRoute.stops && activeRoute.stops.length > 0) {
              const cleanName = startMatch.placeName.trim().toLowerCase();
              const routeIndex = activeRoute.stops.findIndex(stop => stop.trim().toLowerCase() === cleanName);
              if (routeIndex !== -1) {
                if (routeIndex === 0) {
                  startRole = 'start';
                } else if (routeIndex === activeRoute.stops.length - 1) {
                  startRole = 'end';
                } else {
                  startRole = 'middle';
                }
              }
            } else {
              if (wishIndex === 0) {
                startRole = 'start';
              } else if (wishIndex === wishlist.length - 1) {
                startRole = 'end';
              } else {
                startRole = 'middle';
              }
            }
          }
        }
        const segmentColor = getStopColor(startRole, wishIndex !== -1 ? wishIndex : i);

        let segDist = 0;
        for (let j = 0; j < segmentCoords.length - 1; j++) {
          segDist += calculateHaversineDistance(
            segmentCoords[j].lat, segmentCoords[j].lng,
            segmentCoords[j+1].lat, segmentCoords[j+1].lng
          );
        }

        segments.push({
          startName,
          endName,
          coords: offsetSegmentCoords,
          distance: `${segDist.toFixed(1)} km`,
          color: segmentColor
        });
      }

      segments.forEach(seg => {
        const glowPoly = new window.google.maps.Polyline({
          path: seg.coords,
          geodesic: true,
          strokeColor: seg.color,
          strokeOpacity: 0.35,
          strokeWeight: 10,
          map: map
        });
        routePolylinesRef.current.push(glowPoly);

        const mainPoly = new window.google.maps.Polyline({
          path: seg.coords,
          geodesic: true,
          strokeColor: seg.color,
          strokeOpacity: 0.9,
          strokeWeight: 4.5,
          map: map,
          icons: [{
            icon: {
              path: window.google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
              scale: 2,
              strokeColor: seg.color,
              fillColor: '#ffffff',
              fillOpacity: 1,
              strokeWeight: 1
            },
            offset: '50%',
            repeat: '100px'
          }]
        });
        routePolylinesRef.current.push(mainPoly);

        mainPoly.addListener('mouseover', (e) => {
          if (e.domEvent && mapRef.current) {
            const rect = mapRef.current.getBoundingClientRect();
            setHoverTooltip({
              visible: true,
              x: e.domEvent.clientX - rect.left,
              y: e.domEvent.clientY - rect.top,
              startName: seg.startName,
              endName: seg.endName,
              distance: seg.distance
            });
          }
        });

        mainPoly.addListener('mousemove', (e) => {
          if (e.domEvent && mapRef.current) {
            const rect = mapRef.current.getBoundingClientRect();
            setHoverTooltip(prev => ({
              ...prev,
              visible: true,
              x: e.domEvent.clientX - rect.left,
              y: e.domEvent.clientY - rect.top
            }));
          }
        });

        mainPoly.addListener('mouseout', () => {
          setHoverTooltip(prev => ({ ...prev, visible: false }));
        });
      });
    };

    const updateMarkerDisplacements = () => {
      if (!mapInstanceRef.current || markersRef.current.length !== wishlist.length) return;
      const zoom = map.getZoom();
      const threshold = 33.75 / Math.pow(2, zoom);
      
      const groups = [];
      const visited = new Set();
      
      for (let i = 0; i < wishlist.length; i++) {
        if (visited.has(i)) continue;
        const group = [i];
        visited.add(i);
        
        const p1 = wishlist[i];
        if (!p1.lat || !p1.lng) continue;
        
        for (let j = i + 1; j < wishlist.length; j++) {
          if (visited.has(j)) continue;
          const p2 = wishlist[j];
          if (p2.lat && p2.lng) {
            const dist = Math.sqrt(Math.pow(p1.lat - p2.lat, 2) + Math.pow(p1.lng - p2.lng, 2));
            if (dist < threshold) {
              group.push(j);
              visited.add(j);
            }
          }
        }
        groups.push(group);
      }
      
      groups.forEach(group => {
        if (group.length === 1) {
          const idx = group[0];
          const original = wishlist[idx];
          if (markersRef.current[idx]) {
            markersRef.current[idx].setPosition({ lat: original.lat, lng: original.lng });
          }
        } else {
          const centroidLat = group.reduce((sum, idx) => sum + wishlist[idx].lat, 0) / group.length;
          const centroidLng = group.reduce((sum, idx) => sum + wishlist[idx].lng, 0) / group.length;
          
          const radius = 18 / Math.pow(2, zoom);
          
          group.forEach((idx, i) => {
            const angle = (2 * Math.PI * i) / group.length;
            const offsetLat = radius * Math.sin(angle);
            const offsetLng = (radius * Math.cos(angle)) / Math.cos((centroidLat * Math.PI) / 180);
            
            if (markersRef.current[idx]) {
              markersRef.current[idx].setPosition({
                lat: centroidLat + offsetLat,
                lng: centroidLng + offsetLng
              });
            }
          });
        }
      });
    };

    const sortedWishlistPoints = [];
    if (activeRoute && activeRoute.stops && activeRoute.stops.length > 0) {
      activeRoute.stops.forEach(stopName => {
        if (stopName === "Current Location") {
          if (userCoords) {
            sortedWishlistPoints.push(userCoords);
          }
          return;
        }
        if (stopName.includes("✨ Scenic Overlook")) return;
        const cleanStopName = stopName.trim().toLowerCase();
        const match = wishlist.find(p => p.placeName.trim().toLowerCase() === cleanStopName);
        if (match && match.lat && match.lng) {
          sortedWishlistPoints.push({ lat: match.lat, lng: match.lng });
        }
      });
    } else {
      wishlist.forEach(item => {
        if (item.lat && item.lng) sortedWishlistPoints.push({ lat: item.lat, lng: item.lng });
      });
    }

    // Draw Wishlist markers
    wishlist.forEach((place, index) => {
      if (place.lat && place.lng) {
        let role = 'middle'; // 'start', 'end', or 'middle'
        let displayIndex = index + 1;
        
        if (activeRoute && activeRoute.stops && activeRoute.stops.length > 0) {
          const cleanName = place.placeName.trim().toLowerCase();
          const routeIndex = activeRoute.stops.findIndex(stop => stop.trim().toLowerCase() === cleanName);
          if (routeIndex !== -1) {
            displayIndex = routeIndex + 1;
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
        
        let roleLabel = 'Middle Point';
        if (role === 'start') {
          roleLabel = 'Starting Point';
        } else if (role === 'end') {
          roleLabel = 'Ending Point';
        }
        const fillColor = getStopColor(role, index);

        const marker = new window.google.maps.Marker({
          position: { lat: place.lat, lng: place.lng },
          map: map,
          title: place.placeName,
          label: {
            text: String(displayIndex),
            color: 'white',
            fontWeight: 'bold',
            fontSize: '11px'
          },
          icon: {
            path: "M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z", // solid inverted water drop
            scale: 1.5,
            fillColor: fillColor,
            fillOpacity: 1,
            strokeWeight: 1.5,
            strokeColor: '#ffffff',
            anchor: new window.google.maps.Point(12, 22),
            labelOrigin: new window.google.maps.Point(12, 9)
          }
        });

        marker.addListener('click', () => {
          if (infoWindowRef.current) infoWindowRef.current.close();
          const infoDiv = document.createElement('div');
          infoDiv.className = 'p-1 text-slate-800 text-left min-w-[200px] flex flex-col gap-2';

          const headerRow = document.createElement('div');
          headerRow.className = 'flex items-center justify-between gap-2 border-b border-violet-100 pb-1.5';
          
          const roleSpan = document.createElement('span');
          roleSpan.className = `text-[9px] px-2 py-0.5 rounded font-black uppercase text-white ${
            role === 'start' ? 'bg-emerald-600' : role === 'end' ? 'bg-red-500' : 'bg-violet-600'
          }`;
          roleSpan.innerText = roleLabel;
          
          const stopNumSpan = document.createElement('span');
          stopNumSpan.className = 'text-[9px] text-violet-400 font-bold';
          stopNumSpan.innerText = `Stop #${displayIndex}`;
          
          headerRow.appendChild(roleSpan);
          headerRow.appendChild(stopNumSpan);
          infoDiv.appendChild(headerRow);

          const label = document.createElement('label');
          label.className = 'text-[9px] font-bold text-violet-500 uppercase tracking-wide mt-1';
          label.innerText = 'Edit Place Name:';
          infoDiv.appendChild(label);

          const input = document.createElement('input');
          input.type = 'text';
          input.value = place.placeName;
          input.className = 'w-full text-xs font-semibold px-2 py-1.5 rounded border border-violet-200 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 text-slate-800 bg-white';
          input.style.minWidth = '180px';
          infoDiv.appendChild(input);

          const stateDetail = document.createElement('p');
          stateDetail.className = 'text-[9px] text-slate-500 italic px-0.5';
          stateDetail.innerText = `Region: ${place.state} • ${place.category}`;
          infoDiv.appendChild(stateDetail);

           const btnContainer = document.createElement('div');
          btnContainer.className = 'flex justify-end gap-1.5 mt-1 pt-1.5 border-t border-violet-100';

          const cancelBtn = document.createElement('button');
          cancelBtn.innerText = 'Close';
          cancelBtn.className = 'px-2.5 py-1 rounded bg-violet-100 hover:bg-violet-200 text-violet-750 text-[10px] font-bold cursor-pointer transition-colors';
          cancelBtn.onclick = () => {
            if (infoWindowRef.current) infoWindowRef.current.close();
          };

          const weatherBtn = document.createElement('button');
          weatherBtn.innerText = '🌤️ Weather';
          weatherBtn.className = 'px-2.5 py-1 rounded bg-sky-500 hover:bg-sky-600 text-white text-[10px] font-bold cursor-pointer transition-colors';
          weatherBtn.onclick = () => {
            if (onShowWeather) {
              onShowWeather(place.placeName || place.name);
            }
            if (infoWindowRef.current) infoWindowRef.current.close();
          };

          const saveBtn = document.createElement('button');
          saveBtn.innerText = 'Save';
          saveBtn.className = 'px-3 py-1 rounded bg-violet-600 hover:bg-violet-700 text-white text-[10px] font-bold cursor-pointer transition-colors';
          
          saveBtn.onclick = async () => {
            const newName = input.value.trim();
            if (!newName) {
              alert('Name cannot be empty.');
              return;
            }
            saveBtn.disabled = true;
            saveBtn.innerText = 'Saving...';
            try {
              if (onUpdatePlaceName) {
                await onUpdatePlaceName(place.id, newName);
              }
              if (infoWindowRef.current) infoWindowRef.current.close();
            } catch (err) {
              console.error('Failed to update place name:', err);
              alert('Failed to update place name.');
              saveBtn.disabled = false;
              saveBtn.innerText = 'Save';
            }
          };

          input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
              saveBtn.click();
            }
          });

          btnContainer.appendChild(cancelBtn);
          btnContainer.appendChild(weatherBtn);
          btnContainer.appendChild(saveBtn);
          infoDiv.appendChild(btnContainer);

          setTimeout(() => {
            input.focus();
            input.select();
          }, 100);

          infoWindowRef.current.setContent(infoDiv);
          infoWindowRef.current.open(map, marker);
        });

        marker.addListener('mouseover', (e) => {
          const hoverInfo = getMarkerHoverInfo(index);
          if (hoverInfo && e.domEvent && mapRef.current) {
            const rect = mapRef.current.getBoundingClientRect();
            setHoverTooltip({
              visible: true,
              x: e.domEvent.clientX - rect.left,
              y: e.domEvent.clientY - rect.top,
              startName: hoverInfo.startName,
              endName: hoverInfo.endName,
              distance: hoverInfo.distanceText
            });
          }
        });

        marker.addListener('mousemove', (e) => {
          if (e.domEvent && mapRef.current) {
            const rect = mapRef.current.getBoundingClientRect();
            setHoverTooltip(prev => ({
              ...prev,
              visible: true,
              x: e.domEvent.clientX - rect.left,
              y: e.domEvent.clientY - rect.top
            }));
          }
        });

        marker.addListener('mouseout', () => {
          setHoverTooltip(prev => ({ ...prev, visible: false }));
        });

        markersRef.current.push(marker);
        bounds.extend({ lat: place.lat, lng: place.lng });
        hasValidBounds = true;
      }
    });

    const drawFallbackStraightPolyline = () => {
      let pathCoords = [];
      const decodedPath = decodePolyline(activeRoute.polyline);
      if (decodedPath.length > 0) {
        pathCoords = decodedPath.map(pt => ({ lat: pt[0], lng: pt[1] }));
      } else if (sortedWishlistPoints.length >= 2) {
        pathCoords = sortedWishlistPoints;
      }

      if (pathCoords.length > 0) {
        drawRouteSegments(pathCoords, sortedWishlistPoints);
        
        const polyBounds = new window.google.maps.LatLngBounds();
        pathCoords.forEach(coord => polyBounds.extend(coord));
        setTimeout(() => {
          map.fitBounds(polyBounds, 50);
        }, 150);

        // Calculate distance and duration if not already set by backend
        if (!activeRoute.totalDistance || !activeRoute.totalDuration) {
          let totalKm = 0;
          for (let i = 0; i < pathCoords.length - 1; i++) {
            totalKm += calculateHaversineDistance(
              pathCoords[i].lat || pathCoords[i][0], pathCoords[i].lng || pathCoords[i][1],
              pathCoords[i+1].lat || pathCoords[i+1][0], pathCoords[i+1].lng || pathCoords[i+1][1]
            );
          }
          const estMins = Math.round(totalKm * 1.2);
          setRouteInfo({
            distance: totalKm.toFixed(1) + " km",
            duration: formatDuration(estMins * 60)
          });
        }
      }
    };

    // Draw active polyline
    if (activeRoute && (activeRoute.polyline || (activeRoute.stops && activeRoute.stops.length >= 2))) {
      if (activeRoute.totalDistance && activeRoute.totalDuration) {
        setRouteInfo({
          distance: activeRoute.totalDistance,
          duration: activeRoute.totalDuration
        });
      }

      if (sortedWishlistPoints.length >= 2) {
        const coordsQuery = sortedWishlistPoints.map(p => `${p.lng},${p.lat}`).join(';');
        const osrmUrl = `https://router.project-osrm.org/route/v1/driving/${coordsQuery}?overview=full&geometries=geojson`;

        fetch(osrmUrl)
          .then(res => res.json())
          .then(data => {
            if (data.routes && data.routes[0] && data.routes[0].geometry && data.routes[0].geometry.coordinates) {
              const roadCoords = data.routes[0].geometry.coordinates.map(coord => ({
                lat: coord[1],
                lng: coord[0]
              }));

              drawRouteSegments(roadCoords, sortedWishlistPoints);

              const polyBounds = new window.google.maps.LatLngBounds();
              roadCoords.forEach(coord => polyBounds.extend(coord));
              setTimeout(() => {
                map.fitBounds(polyBounds, 50);
              }, 150);

              const osrmDistance = data.routes[0].distance;
              const osrmDuration = data.routes[0].duration;
              setRouteInfo({
                distance: formatDistance(osrmDistance),
                duration: formatDuration(osrmDuration)
              });
            } else {
              throw new Error("Invalid OSRM response geometry");
            }
          })
          .catch(err => {
            console.warn("OSRM routing failed, falling back to Google DirectionsService:", err);

            const origin = sortedWishlistPoints[0];
            const destination = sortedWishlistPoints[sortedWishlistPoints.length - 1];
            const waypoints = sortedWishlistPoints.slice(1, sortedWishlistPoints.length - 1).map(pt => ({
              location: new window.google.maps.LatLng(pt.lat, pt.lng),
              stopover: true
            }));

            const directionsService = new window.google.maps.DirectionsService();
            directionsService.route({
              origin: new window.google.maps.LatLng(origin.lat, origin.lng),
              destination: new window.google.maps.LatLng(destination.lat, destination.lng),
              waypoints: waypoints,
              travelMode: window.google.maps.TravelMode.DRIVING
            }, (result, status) => {
              if (status === window.google.maps.DirectionsStatus.OK) {
                const googleCoords = [];
                if (result.routes && result.routes[0] && result.routes[0].overview_path) {
                  result.routes[0].overview_path.forEach(pt => {
                    googleCoords.push({ lat: pt.lat(), lng: pt.lng() });
                  });
                }

                drawRouteSegments(googleCoords, sortedWishlistPoints);

                const polyBounds = new window.google.maps.LatLngBounds();
                googleCoords.forEach(coord => polyBounds.extend(coord));
                setTimeout(() => {
                  map.fitBounds(polyBounds, 50);
                }, 150);

                let totalDistMeters = 0;
                let totalDurSeconds = 0;
                if (result.routes && result.routes[0] && result.routes[0].legs) {
                  result.routes[0].legs.forEach(leg => {
                    totalDistMeters += leg.distance.value;
                    totalDurSeconds += leg.duration.value;
                  });
                }
                setRouteInfo({
                  distance: formatDistance(totalDistMeters),
                  duration: formatDuration(totalDurSeconds)
                });
              } else {
                console.warn("Google Directions Service failed: " + status + ". Falling back to straight lines.");
                drawFallbackStraightPolyline();
              }
            });
          });
      } else {
        drawFallbackStraightPolyline();
      }
    } else {
      setRouteInfo({ distance: '', duration: '' });
      if (hasValidBounds) {
        setTimeout(() => {
          if (wishlist.length === 1) {
            map.setCenter(bounds.getCenter());
            map.setZoom(14);
          } else {
            map.fitBounds(bounds, 50);
          }
        }, 150);
      }
    }

    // Run marker displacement algorithm on zoom/load
    updateMarkerDisplacements();

    const zoomListener = map.addListener('zoom_changed', () => {
      updateMarkerDisplacements();
    });

    return () => {
      window.google.maps.event.removeListener(zoomListener);
      routePolylinesRef.current.forEach(p => p.setMap(null));
      routePolylinesRef.current = [];
    };

  }, [googleMapsLoaded, wishlist, activeRoute, userCoords]);

  const handleSearchSubmit = async (e) => {
    e.preventDefault();
    console.log("handleSearchSubmit called. query:", searchQuery, "mapInstance:", !!mapInstanceRef.current);
    if (!searchQuery.trim() || !window.google || !mapInstanceRef.current) {
      console.warn("Search early exit. query:", searchQuery, "google:", !!window.google, "mapInstance:", !!mapInstanceRef.current);
      return;
    }

    setIsSearching(true);
    
    const handleGeocodeResult = async (result) => {
      const lat = typeof result.geometry.location.lat === 'function' ? result.geometry.location.lat() : result.geometry.location.lat;
      const lng = typeof result.geometry.location.lng === 'function' ? result.geometry.location.lng() : result.geometry.location.lng;
      const displayName = result.formatted_address;
      const placeName = result.address_components && result.address_components[0] 
        ? result.address_components[0].long_name 
        : displayName.split(',')[0];

      let state = 'Unknown';
      if (result.address_components) {
        for (const comp of result.address_components) {
          if (comp.types.includes('administrative_area_level_1')) {
            state = comp.long_name;
            break;
          }
        }
      }

      const map = mapInstanceRef.current;
      map.setCenter({ lat, lng });
      map.setZoom(12);

      if (tempMarkerRef.current) {
        tempMarkerRef.current.setMap(null);
      }

      // Asynchronous fetch call to OWM using coordinates
      let temp = null;
      let stationName = placeName;
      let humidity = null;
      let description = 'Clear sky';
      
      const openWeatherKey = import.meta.env.VITE_OPENWEATHER_API_KEY;
      try {
        const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lng}&units=metric&appid=${openWeatherKey}`);
        if (response.ok) {
          const data = await response.json();
          if (data && data.main) {
            temp = data.main.temp;
            humidity = data.main.humidity;
          }
          if (data && data.name) {
            stationName = data.name;
          }
          if (data && data.weather && data.weather[0]) {
            description = data.weather[0].description;
          }
        }
      } catch (err) {
        console.error("Direct OWM coordinates fetch failed:", err);
      }

      // Create marker using AdvancedMarkerElement
      let tempMarker;
      if (window.google && window.google.maps && window.google.maps.marker && window.google.maps.marker.AdvancedMarkerElement) {
        tempMarker = new window.google.maps.marker.AdvancedMarkerElement({
          position: { lat, lng },
          map: map,
          title: placeName
        });
      } else {
        tempMarker = new window.google.maps.Marker({
          position: { lat, lng },
          map: map,
          title: placeName
        });
      }
      tempMarkerRef.current = tempMarker;

      const popupDiv = document.createElement('div');
      popupDiv.className = 'p-3 space-y-2 text-slate-800 text-left min-w-[180px]';
      
      let weatherHtml = '';
      if (temp !== null) {
        weatherHtml = `
          <div class="p-2 rounded bg-sky-50 border border-sky-100 space-y-0.5 my-1">
            <p class="text-[9px] font-black uppercase text-sky-655 tracking-wide">🌤️ Local Climate Snapshot</p>
            <div class="flex justify-between items-center text-xs">
              <span class="font-bold text-slate-700 truncate max-w-[100px]">${stationName}</span>
              <span class="font-black text-orange-600">${Math.round(temp)}°C</span>
            </div>
            <p class="text-[9px] text-slate-500 capitalize italic leading-none">"${description}"</p>
            <p class="text-[8px] text-slate-400">Humidity: ${humidity}%</p>
          </div>
        `;
      }

      popupDiv.innerHTML = `
        <div class="space-y-1">
          <label class="text-[9px] font-black uppercase text-gray-400">Place Name</label>
          <input id="gmap-input-search-name" type="text" value="${placeName}" class="w-full px-2 py-1 border border-gray-300 rounded text-xs focus:ring-1 focus:ring-violet-500 font-semibold" />
        </div>
        <p class="text-[9px] text-gray-500 font-medium">${displayName.split(',').slice(1, 4).join(',')}</p>
        ${weatherHtml}
        <button id="gmap-btn-add-search" class="w-full px-2 py-1.5 bg-violet-600 hover:bg-violet-700 text-white font-extrabold text-[10px] rounded-lg cursor-pointer transition-all shadow-sm">
          + Add to Wishlist
        </button>
        <button id="gmap-btn-weather-search" class="w-full px-2 py-1.5 mt-1 bg-sky-500 hover:bg-sky-600 text-white font-extrabold text-[10px] rounded-lg cursor-pointer transition-all shadow-sm">
          🌤️ View Weather
        </button>
      `;

      if (infoWindowRef.current) infoWindowRef.current.close();
      infoWindowRef.current.setContent(popupDiv);
      infoWindowRef.current.open(map, tempMarker);

      setTimeout(() => {
        const btn = document.getElementById('gmap-btn-add-search');
        const input = document.getElementById('gmap-input-search-name');
        const weatherBtn = document.getElementById('gmap-btn-weather-search');
        if (btn && onAddWishlist) {
          btn.onclick = async () => {
            const finalPlaceName = input ? input.value.trim() : placeName;
            if (!finalPlaceName) {
              alert("Please enter a name for this location.");
              return;
            }
            try {
              await onAddWishlist({
                placeName: finalPlaceName,
                state,
                category: 'Searched Destination',
                lat,
                lng
              });
              tempMarker.setMap(null);
              tempMarkerRef.current = null;
              infoWindowRef.current.close();
            } catch (err) {
              console.error("Failed to add search result to wishlist", err);
            }
          };
        }
        if (weatherBtn && onShowWeather) {
          weatherBtn.onclick = () => {
            const finalPlaceName = input ? input.value.trim() : placeName;
            onShowWeather(finalPlaceName);
            if (infoWindowRef.current) infoWindowRef.current.close();
          };
        }
      }, 150);
    };

    const geocoder = new window.google.maps.Geocoder();
    geocoder.geocode({ address: searchQuery }, (results, status) => {
      setIsSearching(false);
      if (status === 'OK' && results[0]) {
        handleGeocodeResult(results[0]);
      } else {
        console.warn("Google Geocoder failed, trying Nominatim API fallback...");
        fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}`)
          .then(res => res.json())
          .then(data => {
            if (data && data[0]) {
              const res = data[0];
              const lat = parseFloat(res.lat);
              const lng = parseFloat(res.lon);
              const displayName = res.display_name;
              const placeName = displayName.split(',')[0];
              
              const simulatedResult = {
                geometry: {
                  location: {
                    lat: () => lat,
                    lng: () => lng
                  }
                },
                formatted_address: displayName,
                address_components: [
                  { long_name: placeName, types: ['locality'] },
                  { long_name: 'Unknown', types: ['administrative_area_level_1'] }
                ]
              };
              handleGeocodeResult(simulatedResult);
            } else {
              alert(`Could not find "${searchQuery}". Please check the spelling.`);
            }
          })
          .catch(err => {
            console.error("Nominatim search failed:", err);
            alert(`Could not find "${searchQuery}". Please check the spelling.`);
          });
      }
    });
  };

  // Custom Controls Action Handlers
  const handleZoomIn = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setZoom(mapInstanceRef.current.getZoom() + 1);
    }
  };

  const handleZoomOut = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setZoom(mapInstanceRef.current.getZoom() - 1);
    }
  };

  const handleLocateMe = () => {
    if (mapInstanceRef.current && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          const map = mapInstanceRef.current;
          map.setCenter({ lat: latitude, lng: longitude });
          map.setZoom(14);

          if (myLocationMarkerRef.current) {
            myLocationMarkerRef.current.setMap(null);
          }

          const myLocationMarker = new window.google.maps.Marker({
            position: { lat: latitude, lng: longitude },
            map: map,
            title: "Your Location",
            optimized: false, // Force HTML DOM marker rendering for SVG animation
            icon: {
              url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(GLOWING_DOT_SVG),
              size: new window.google.maps.Size(36, 36),
              anchor: new window.google.maps.Point(18, 18)
            }
          });
          myLocationMarkerRef.current = myLocationMarker;
          setUserCoords({ lat: latitude, lng: longitude });

          const geocoder = new window.google.maps.Geocoder();
          geocoder.geocode({ location: { lat: latitude, lng: longitude } }, (results, status) => {
            let placeName = "Your GPS Location";
            let state = "Unknown";

            if (status === 'OK' && results[0]) {
              const res = results[0];
              placeName = res.address_components[0].long_name || res.formatted_address.split(',')[0];
              for (const comp of res.address_components) {
                if (comp.types.includes('administrative_area_level_1')) {
                  state = comp.long_name;
                  break;
                }
              }
            }

            const popupDiv = document.createElement('div');
            popupDiv.className = 'p-3 space-y-2 text-slate-800 text-left min-w-[180px]';
            popupDiv.innerHTML = `
              <div class="space-y-1">
                <label class="text-[9px] font-black uppercase text-gray-400">Place Name</label>
                <input id="gmap-input-locate-name" type="text" value="${placeName}" class="w-full px-2 py-1 border border-gray-300 rounded text-xs focus:ring-1 focus:ring-violet-500 font-semibold" />
              </div>
              <p class="text-[9px] text-gray-500 font-semibold">State: ${state}</p>
              <button id="gmap-btn-locate-add" class="w-full px-2 py-1.5 bg-violet-600 hover:bg-violet-700 text-white font-extrabold text-[10px] rounded-lg cursor-pointer transition-all shadow-sm">
                + Add to Wishlist
              </button>
              <button id="gmap-btn-weather-locate" class="w-full px-2 py-1.5 mt-1 bg-sky-500 hover:bg-sky-600 text-white font-extrabold text-[10px] rounded-lg cursor-pointer transition-all shadow-sm">
                🌤️ View Weather
              </button>
            `;

            if (infoWindowRef.current) infoWindowRef.current.close();
            infoWindowRef.current.setContent(popupDiv);
            infoWindowRef.current.open(map, myLocationMarker);

            setTimeout(() => {
              const btn = document.getElementById('gmap-btn-locate-add');
              const input = document.getElementById('gmap-input-locate-name');
              const weatherBtn = document.getElementById('gmap-btn-weather-locate');
              if (btn && onAddWishlist) {
                btn.onclick = async () => {
                  const finalPlaceName = input ? input.value.trim() : placeName;
                  if (!finalPlaceName) {
                    alert("Please enter a name for this location.");
                    return;
                  }
                  try {
                    await onAddWishlist({
                      placeName: finalPlaceName,
                      state,
                      category: 'Current GPS Location',
                      lat: latitude,
                      lng: longitude
                    });
                    infoWindowRef.current.close();
                  } catch (err) {
                    console.error(err);
                  }
                };
              }
              if (weatherBtn && onShowWeather) {
                weatherBtn.onclick = () => {
                  const finalPlaceName = input ? input.value.trim() : placeName;
                  onShowWeather(finalPlaceName);
                  if (infoWindowRef.current) infoWindowRef.current.close();
                };
              }
            }, 150);
          });
        },
        (err) => {
          console.error("GPS Geolocation failed", err);
          alert("Could not access your location. Verify your browser location permissions.");
        }
      );
    } else {
      alert("Geolocation is not supported by your browser.");
    }
  };

  const handleRotateMap = () => {
    if (mapInstanceRef.current) {
      const heading = mapInstanceRef.current.getHeading() || 0;
      mapInstanceRef.current.setHeading((heading + 90) % 360);
    }
  };

  const handleTiltMap = () => {
    if (mapInstanceRef.current) {
      const tilt = mapInstanceRef.current.getTilt() || 0;
      mapInstanceRef.current.setTilt(tilt === 45 ? 0 : 45);
    }
  };

  // Save key to local storage and update hook state
  const handleSaveKeySubmit = (e) => {
    e.preventDefault();
    if (!inputKey.trim()) return;
    localStorage.setItem('gmaps_api_key', inputKey.trim());
    setApiKey(inputKey.trim());
  };

  // Clear key from storage and trigger reload
  const handleClearKey = () => {
    localStorage.removeItem('gmaps_api_key');
    setApiKey('');
    setGoogleMapsLoaded(false);
    if (mapInstanceRef.current) mapInstanceRef.current = null;
    const script = document.getElementById('google-maps-js');
    if (script) script.remove();
    window.location.reload();
  };

  // Match suggestions from local seed destinations
  const localMatches = searchQuery.trim() 
    ? destinations.filter(d => 
        (d.name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        (d.city || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        (d.state || "").toLowerCase().includes(searchQuery.toLowerCase())
      ).slice(0, 5)
    : [];

  const combinedSuggestions = [
    ...localMatches.map(m => ({
      place_id: `local-${m.id || m.name}`,
      description: `${m.name}, ${m.state}`,
      isLocal: true,
      name: m.name,
      state: m.state,
      category: m.category,
      lat: m.lat,
      lng: m.lng,
      mainText: m.name,
      secondaryText: `${m.city ? m.city + ', ' : ''}${m.state}`
    })),
    ...predictions.map(p => ({
      place_id: p.place_id,
      description: p.description,
      isLocal: false,
      mainText: p.structured_formatting.main_text,
      secondaryText: p.structured_formatting.secondary_text
    }))
  ];

  return (
    <GlassCard className="p-4 bg-white/[0.04] space-y-4 border-white/[0.08] relative">
      {/* Top Map Controls */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-white">
          <Map className="w-4.5 h-4.5 text-violet-400" />
          <span className="text-xs font-bold uppercase tracking-wider">Travel Route Workspace</span>
        </div>

        {activeRoute && routeInfo.distance && (
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 text-[10px] font-black uppercase tracking-wider shadow-sm select-none">
            <span className="animate-pulse">🏁</span>
            <span>Total Route Distance:</span>
            <span className="text-white font-black">{routeInfo.distance}</span>
            {routeInfo.duration && (
              <>
                <span className="text-white/20">•</span>
                <span className="text-emerald-400 font-medium lowercase">🕒 {routeInfo.duration}</span>
              </>
            )}
          </div>
        )}

        {/* Search Bar (Visible only when map loaded) */}
        {apiKey && (
          <form 
            ref={searchContainerRef}
            onSubmit={handleSearchSubmit} 
            className="relative w-full sm:max-w-xs z-50"
          >
            <input
              type="text"
              placeholder="Search city / landmark..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setShowDropdown(true)}
              disabled={!googleMapsLoaded || isSearching}
              className="w-full glass-input pl-10 pr-10 py-1.5 text-xs placeholder-white/30 text-white"
            />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
            {isSearching && (
              <RefreshCw className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-violet-400 animate-spin" />
            )}

            {/* Autocomplete Predictions Dropdown */}
            {showDropdown && combinedSuggestions.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-slate-950/95 border border-white/10 rounded-lg shadow-2xl max-h-60 overflow-y-auto z-[999] text-left text-xs divide-y divide-white/5 backdrop-blur-md">
                {combinedSuggestions.map((s) => (
                  <button
                    key={s.place_id}
                    type="button"
                    onClick={() => handleSelectPrediction(s)}
                    className="w-full px-3 py-2 text-white/80 hover:bg-violet-950/45 text-left font-medium transition-all focus:outline-none"
                  >
                    <p className="font-semibold text-white flex items-center justify-between gap-1.5">
                      <span>{s.mainText}</span>
                      {s.isLocal && (
                        <span className="text-[7.5px] px-1 py-0.2 rounded bg-violet-500/20 text-violet-300 font-black uppercase tracking-wider scale-90">Sight</span>
                      )}
                    </p>
                    <p className="text-[10px] text-white/40 truncate">{s.secondaryText}</p>
                  </button>
                ))}
              </div>
            )}
          </form>
        )}
      </div>

      {/* Map Display / Key Input Workspace Wrapper */}
      <div 
        id="google-map-container"
        className="w-full h-[350px] md:h-[calc(100vh-240px)] md:min-h-[550px] rounded-xl overflow-hidden border border-slate-200 dark:border-white/10 shadow-inner bg-slate-100/60 dark:bg-slate-900/60 relative z-10 flex items-center justify-center"
      >
        {/* Map Canvas Div - Google Maps will replace contents of this div only */}
        {apiKey && (
          <div ref={mapRef} className="w-full h-full absolute inset-0 z-0" />
        )}

        {/* Floating segment hover tooltip */}
        {hoverTooltip.visible && (
          <div 
            className="absolute pointer-events-none bg-slate-950/90 backdrop-blur-md border border-violet-500/35 p-3.5 rounded-xl shadow-2xl text-left select-none max-w-xs animate-fade-in"
            style={{
              left: `${hoverTooltip.x + 15}px`,
              top: `${hoverTooltip.y + 15}px`,
              zIndex: 99999
            }}
          >
            <div className="space-y-1.5">
              <span className="text-[8px] px-1.5 py-0.5 rounded font-black uppercase text-violet-300 bg-violet-950/50 border border-violet-900/30 tracking-wider">
                🗺️ Route Leg details
              </span>
              <div className="text-[11px] text-white font-bold flex flex-col gap-0.5 mt-1">
                <span className="text-emerald-400 truncate max-w-[180px]">🏁 {hoverTooltip.startName}</span>
                <span className="text-slate-500 text-[8px] pl-3">➔</span>
                <span className="text-red-400 truncate max-w-[180px]">🚩 {hoverTooltip.endName}</span>
              </div>
              <p className="text-[9px] text-violet-300 font-extrabold mt-1 border-t border-white/5 pt-1 flex items-center gap-1">
                <span>📏</span>
                <span>Distance: {hoverTooltip.distance}</span>
              </p>
            </div>
          </div>
        )}

        {/* overlays (z-20) rendered on top of the Map Canvas */}
        {!apiKey ? (
          /* Glassmorphic Key Setup Form Overlay */
          <div className="max-w-md w-full p-6 sm:p-8 rounded-2xl bg-slate-950/70 border border-white/10 backdrop-blur-md text-center space-y-6 shadow-2xl animate-dashboard-fade relative z-30">
            <div className="w-16 h-16 rounded-full bg-violet-650/10 border border-violet-500/25 flex items-center justify-center mx-auto text-violet-400">
              <Map className="w-8 h-8 animate-pulse" />
            </div>
            
            <div className="space-y-2">
              <h3 className="text-lg font-bold text-white tracking-tight">Activate Route Workspace Map</h3>
              <p className="text-[11px] text-white/50 leading-relaxed">
                Please enter your Google Maps API Key or **Demo Key** to enable interactive route plotting, geocoding search, and custom stops.
              </p>
            </div>

            <form onSubmit={handleSaveKeySubmit} className="space-y-4">
              <input
                type="text"
                value={inputKey}
                onChange={(e) => setInputKey(e.target.value)}
                placeholder="Paste key (starts with AIzaSy...)"
                className="w-full glass-input px-4 py-3 text-xs text-white text-center focus:ring-2 focus:ring-violet-500 placeholder-white/20"
                required
              />
              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-violet-650 hover:bg-violet-750 text-white font-extrabold text-xs shadow-md transition-all active:scale-95 cursor-pointer"
              >
                Activate Workspace Map
              </button>
            </form>
          </div>
        ) : !googleMapsLoaded ? (
          /* Loading script spinner */
          <div className="absolute inset-0 flex items-center justify-center bg-slate-950/80 text-white font-bold text-xs gap-2 relative z-30">
            <RefreshCw className="w-4 h-4 animate-spin text-violet-400" />
            <span>Loading Workspace Map...</span>
          </div>
        ) : (
          /* Interactive Controls overlays rendered on top of the initialized map */
          <>
            {googleMapsLoaded && (
              <div 
                className="absolute top-4 right-4 z-[1000] flex gap-1 bg-slate-950/85 border border-white/10 p-1.5 rounded-xl shadow-2xl backdrop-blur-md items-center"
                style={{ zIndex: 1000 }}
              >
                <button
                  type="button"
                  onClick={() => setActiveLayer('street')}
                  className={`px-2 py-1.5 text-[9px] font-black uppercase rounded-lg transition-all cursor-pointer flex items-center gap-1 ${
                    activeLayer === 'street' 
                      ? 'bg-violet-600 text-white shadow-md' 
                      : 'text-white/60 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <span>🗺️</span>
                  <span className="hidden sm:inline">Street</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveLayer('satellite')}
                  className={`px-2 py-1.5 text-[9px] font-black uppercase rounded-lg transition-all cursor-pointer flex items-center gap-1 ${
                    activeLayer === 'satellite' 
                      ? 'bg-violet-600 text-white shadow-md' 
                      : 'text-white/60 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <span>🛰️</span>
                  <span className="hidden sm:inline">Satellite</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveLayer('terrain')}
                  className={`px-2 py-1.5 text-[9px] font-black uppercase rounded-lg transition-all cursor-pointer flex items-center gap-1 ${
                    activeLayer === 'terrain' 
                      ? 'bg-violet-600 text-white shadow-md' 
                      : 'text-white/60 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <span>⛰️</span>
                  <span className="hidden sm:inline">Terrain</span>
                </button>
                <div className="w-px h-4 bg-white/10" />
                <button
                  type="button"
                  onClick={handleClearKey}
                  title="Reset API Key"
                  className="px-2 py-1.5 rounded-lg text-white/50 hover:text-white hover:bg-white/5 transition-all cursor-pointer text-[9px] font-black uppercase flex items-center gap-1"
                >
                  <span>⚙️</span>
                  <span className="hidden sm:inline">Reset Key</span>
                </button>
              </div>
            )}

            {/* Custom Zoom, Rotate, & Locate Me Dock Overlay (Positioned vertically on the right side) */}
            {googleMapsLoaded && (
              <div 
                className="absolute right-4 top-1/2 -translate-y-1/2 z-[1000] flex flex-col gap-1.5 bg-slate-950/85 border border-white/10 p-1.5 rounded-xl shadow-2xl backdrop-blur-md"
                style={{ zIndex: 1000 }}
              >
                {/* Zoom In */}
                <button
                  type="button"
                  onClick={handleZoomIn}
                  title="Zoom In"
                  className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 text-white flex items-center justify-center hover:bg-white/10 hover:text-white transition-all cursor-pointer font-bold"
                >
                  <Plus className="w-4 h-4" />
                </button>

                {/* Zoom Out */}
                <button
                  type="button"
                  onClick={handleZoomOut}
                  title="Zoom Out"
                  className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 text-white flex items-center justify-center hover:bg-white/10 hover:text-white transition-all cursor-pointer font-bold"
                >
                  <Minus className="w-4 h-4" />
                </button>

                <div className="h-px bg-white/10 my-0.5" />

                {/* Locate Me (Current Location) */}
                <button
                  type="button"
                  onClick={handleLocateMe}
                  title="Find My Location"
                  className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 text-violet-400 flex items-center justify-center hover:bg-white/10 hover:text-violet-300 transition-all cursor-pointer font-bold"
                >
                  <Navigation className="w-4 h-4 rotate-[45deg]" />
                </button>

                {/* Rotate Map */}
                <button
                  type="button"
                  onClick={handleRotateMap}
                  title="Rotate Map (90°)"
                  className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 text-white flex items-center justify-center hover:bg-white/10 hover:text-white transition-all cursor-pointer text-xs font-bold"
                >
                  🔄
                </button>
              </div>
            )}
          </>
        )}
      </div>

      <div className="flex justify-between items-center text-[9px] text-white/40">
        <span className="flex items-center gap-1">
          💡 Click anywhere on the map to drop custom stops directly into your wishlist
        </span>
      </div>
    </GlassCard>
  )
}
