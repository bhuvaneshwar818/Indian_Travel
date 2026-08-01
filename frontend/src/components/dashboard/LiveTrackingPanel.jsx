import React, { useState, useEffect, useRef } from 'react'
import { GlassCard } from '../ui/GlassCard'
import { useAuthStore, apiClient, API_BASE } from '../../store/authStore'
import { useToastStore } from '../../store/useToastStore'
import { NativeStompClient } from './GroupChat'
import { Send, Users, ShieldAlert, Compass, Play, Square, MapPin, RefreshCw, Check, X, UserPlus, Layers, Maximize2 } from 'lucide-react'

const MAP_STYLES = [
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
    stylers: [{ color: "#f3c17a" }]
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

// Helper to calculate Haversine distance in kilometers
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // radius of Earth in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  const d = R * c;
  return d;
}

// Helper to construct custom RippleOverlay class dynamically using loaded window.google instance
const createRippleOverlayClass = (google, currentUsername) => {
  return class RippleOverlay extends google.maps.OverlayView {
    constructor(position, map, color, name) {
      super();
      this.position = position;
      this.map = map;
      this.color = color;
      this.name = name;
      this.div = null;
      this.setMap(map);
    }

    onAdd() {
      const div = document.createElement('div');
      div.style.position = 'absolute';
      
      const isSelf = (this.name || '').toLowerCase() === (currentUsername || '').toLowerCase();
      div.className = isSelf ? 'ripple-marker-container self' : 'ripple-marker-container';
      div.style.color = this.color;
      
      const ripple = document.createElement('div');
      ripple.className = 'ripple-wave';
      
      const dot = document.createElement('div');
      dot.className = 'ripple-dot';
      dot.style.backgroundColor = isSelf ? '#1A73E8' : this.color;

      const label = document.createElement('div');
      label.className = 'ripple-label bg-slate-950/90 text-white border border-white/10 px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider shadow-lg';
      label.innerText = isSelf ? 'You' : (this.name || '');

      div.appendChild(ripple);
      div.appendChild(dot);
      div.appendChild(label);
      
      this.div = div;
      const panes = this.getPanes();
      panes.overlayMouseTarget.appendChild(div);
    }

    draw() {
      const overlayProjection = this.getProjection();
      const position = overlayProjection.fromLatLngToDivPixel(this.position);
      if (this.div && position) {
        this.div.style.left = (position.x - 16) + 'px';
        this.div.style.top = (position.y - 16) + 'px';
      }
    }

    onRemove() {
      if (this.div) {
        this.div.parentNode.removeChild(this.div);
        this.div = null;
      }
    }

    setPosition(position) {
      this.position = position;
      this.draw();
    }
  };
};

export default function LiveTrackingPanel({ tripId }) {
  const { user, token } = useAuthStore()
  const { addToast } = useToastStore()

  // Navigation Sub Tab
  const [activeSubTab, setActiveSubTab] = useState('map')

  // Map Filter Options
  const [mapType, setMapType] = useState('roadmap')

  // Invites & Team States
  const [inviteUsername, setInviteUsername] = useState('')
  const [sentInvites, setSentInvites] = useState([])
  const [receivedInvites, setReceivedInvites] = useState([])
  const [teamMembers, setTeamMembers] = useState([])
  const [loadingMembers, setLoadingMembers] = useState(false)
  const [loadingInvites, setLoadingInvites] = useState(false)
  const [submittingInvite, setSubmittingInvite] = useState(false)

  // Tracking States
  const [isSharing, setIsSharing] = useState(false)
  const [myCoords, setMyCoords] = useState(null)
  const [memberLocations, setMemberLocations] = useState({}) // username -> locationDetails
  const [wsConnected, setWsConnected] = useState(false)
  const [showRoster, setShowRoster] = useState(true)
  const [mapError, setMapError] = useState(null)

  // Google Maps Refs
  const mapContainerRef = useRef(null)
  const mapInstanceRef = useRef(null)
  const markersRef = useRef({}) // username -> RippleOverlay
  const watchIdRef = useRef(null)
  const stompClientRef = useRef(null)
  const RippleOverlayClassRef = useRef(null)
  const isFirstFitBoundsRef = useRef(true)

  // Inject Custom Ripple Styles dynamically on mount (Google Maps Live Blue Dot wave style)
  useEffect(() => {
    const styleId = 'map-ripple-styles';
    if (!document.getElementById(styleId)) {
      const style = document.createElement('style');
      style.id = styleId;
      style.textContent = `
        @keyframes ripple-animation {
          0% { transform: scale(0.4); opacity: 1; }
          100% { transform: scale(2.8); opacity: 0; }
        }
        .ripple-marker-container {
          position: relative;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          width: 32px;
          height: 32px;
        }
        .ripple-wave {
          position: absolute;
          width: 32px;
          height: 32px;
          border: 3px solid currentColor;
          border-radius: 50%;
          animation: ripple-animation 1.6s infinite ease-out;
          pointer-events: none;
        }
        .ripple-dot {
          width: 13px;
          height: 13px;
          border-radius: 50%;
          border: 2px solid white;
          box-shadow: 0 0 8px rgba(0,0,0,0.6);
          z-index: 2;
        }
        .ripple-label {
          z-index: 3;
          margin-top: 5px;
          white-space: nowrap;
          pointer-events: none;
        }
        /* Google Maps Signature Live Blue Dot styles */
        .ripple-marker-container.self {
          color: #1A73E8 !important;
        }
        .ripple-marker-container.self .ripple-wave {
          border: 3.5px solid #1A73E8;
          background-color: rgba(26, 115, 232, 0.18);
        }
      `;
      document.head.appendChild(style);
    }
  }, []);

  // Fetch Sent/Received Invites & Members
  const fetchInvitations = async () => {
    setLoadingInvites(true)
    try {
      const response = await apiClient.get('/trips/invitations')
      setSentInvites(response.data.sent || [])
      setReceivedInvites(response.data.received || [])
    } catch (err) {
      console.error("Failed to fetch invitations", err)
    } finally {
      setLoadingInvites(false)
    }
  }
  const fetchMembers = async () => {
    if (!tripId) return
    setLoadingMembers(true)
    try {
      const response = await apiClient.get(`/trips/${tripId}/members`)
      setTeamMembers(response.data || [])
    } catch (err) {
      console.error("Failed to fetch team members", err)
    } finally {
      setLoadingMembers(false)
    }
  }

  const fetchActiveTracking = async () => {
    if (!tripId) return
    try {
      const response = await apiClient.get(`/trips/${tripId}/tracking`)
      setMemberLocations(response.data || {})
    } catch (err) {
      console.error("Failed to fetch active tracking details", err)
    }
  }

  useEffect(() => {
    fetchInvitations()
    fetchMembers()
    fetchActiveTracking()
  }, [tripId])

  // Get current user's local location on mount (so they can see themselves even if not sharing)
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const coords = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          }
          setMyCoords(coords)
          if (mapInstanceRef.current) {
            mapInstanceRef.current.setCenter(coords)
            mapInstanceRef.current.setZoom(13)
          }
        },
        (err) => {
          console.warn("Failed to fetch initial local location", err)
        }
      )
    }
  }, [])

  // Handle Invitation Sending
  const handleSendInvite = async (e) => {
    e.preventDefault()
    if (!inviteUsername.trim()) return

    setSubmittingInvite(true)
    try {
      const res = await apiClient.post('/trips/invite', { inviteeUsername: inviteUsername.trim() })
      if (res.data && res.data.error) {
        throw new Error(res.data.error)
      }
      
      // Handle different response statuses
      const status = res.data?.status
      if (status === 'EMAIL_SENT') {
        addToast(`Invitation email sent to ${inviteUsername}! They'll sign up and join your trip.`, 'success')
      } else if (status === 'IN_APP') {
        addToast(`Invitation sent to ${inviteUsername}! They'll see it in their requests.`, 'success')
      } else {
        addToast(`Invitation sent to ${inviteUsername}!`, 'success')
      }
      
      setInviteUsername('')
      fetchInvitations()
    } catch (err) {
      const errMsg = err.message || err.response?.data?.error || `Failed to invite ${inviteUsername}`
      addToast(errMsg, 'error')
    } finally {
      setSubmittingInvite(false)
    }
  }

  // Handle Invitation Actions
  const handleAcceptInvite = async (inviteId) => {
    try {
      await apiClient.post(`/trips/invitations/${inviteId}/accept`)
      addToast('Invitation accepted!', 'success')
      fetchInvitations()
      fetchMembers()
      setTimeout(() => window.location.reload(), 1000)
    } catch (err) {
      addToast('Failed to accept invitation.', 'error')
    }
  }

  const handleRejectInvite = async (inviteId) => {
    try {
      await apiClient.post(`/trips/invitations/${inviteId}/reject`)
      addToast('Invitation rejected.', 'success')
      fetchInvitations()
    } catch (err) {
      addToast('Failed to reject invitation.', 'error')
    }
  }

  const handleUpdateRole = async (targetUsername, newRole) => {
    try {
      await apiClient.post(`/trips/${tripId}/members/${targetUsername}/role`, { role: newRole })
      addToast(`Access updated to ${newRole === 'CO_OWNER' ? 'Co-Owner' : 'Member'}.`, 'success')
      fetchMembers()
    } catch (err) {
      const errMsg = err.response?.data?.error || 'Failed to update member role.'
      addToast(errMsg, 'error')
    }
  }

  const handleRemoveMember = async (targetUsername) => {
    if (!window.confirm(`Are you sure you want to remove @${targetUsername} from this trip?`)) return
    try {
      await apiClient.delete(`/trips/${tripId}/members/${targetUsername}`)
      addToast('Member removed from trip.', 'success')
      fetchMembers()
    } catch (err) {
      const errMsg = err.response?.data?.error || 'Failed to remove member.'
      addToast(errMsg, 'error')
    }
  }

  // STOMP WebSocket Connection for Live Location Streams
  useEffect(() => {
    if (!tripId) return

    // Derive WebSocket URL from API_BASE to support local IP & production URLs
    let wsUrl = "ws://localhost:8082/ws";
    try {
      const url = new URL(API_BASE);
      const wsProtocol = url.protocol === 'https:' ? 'wss:' : 'ws:';
      wsUrl = `${wsProtocol}//${url.host}/ws`;
    } catch (e) {
      console.warn("Failed to parse API_BASE for WebSocket URL, using fallback", e);
    }
    const client = new NativeStompClient(wsUrl, token)
    stompClientRef.current = client

    client.onConnect = () => {
      setWsConnected(true)
      
      // Initialize dynamic overlay class once google instance is ready
      if (window.google && window.google.maps && !RippleOverlayClassRef.current) {
        RippleOverlayClassRef.current = createRippleOverlayClass(window.google, user?.username)
      }

      // 1. Subscribe to location updates
      client.subscribe(`/topic/location/${tripId}`, (msgBody) => {
        try {
          const parsed = JSON.parse(msgBody)
          setMemberLocations(parsed || {})
        } catch (e) {
          console.error("Failed to parse location broadcast payload", e)
        }
      })

      // 2. Fetch current active tracking list immediately
      fetchActiveTracking()

      // 3. Send initial presence announcement (online status, no coordinates by default)
      client.send(`/app/location/${tripId}`, {
        username: user.username,
        fullName: user.fullName || user.username,
        lat: null,
        lng: null,
        isActive: true
      })
    }

    client.activate()

    return () => {
      if (stompClientRef.current) {
        stompClientRef.current.deactivate()
      }
    }
  }, [tripId])

  // Initialize Google Maps instance with click listener to mock coordinates
  useEffect(() => {
    if (activeSubTab !== 'map') {
      mapInstanceRef.current = null
      markersRef.current = {}
      return
    }

    const initMap = () => {
      if (window.google && window.google.maps && mapContainerRef.current && !mapInstanceRef.current) {
        const initialCenter = myCoords || { lat: 20.5937, lng: 78.9629 }
        const map = new window.google.maps.Map(mapContainerRef.current, {
          center: initialCenter,
          zoom: myCoords ? 13 : 5,
          styles: MAP_STYLES,
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: false
        })
        mapInstanceRef.current = map

        // Create class reference if window.google is ready
        if (!RippleOverlayClassRef.current) {
          RippleOverlayClassRef.current = createRippleOverlayClass(window.google, user?.username)
        }
      }
    }

    if (window.google && window.google.maps) {
      initMap()
    } else {
      // Load Google Maps script if not already loaded
      const existingScript = document.getElementById('google-maps-script')
      if (!existingScript) {
        const script = document.createElement('script')
        script.id = 'google-maps-script'
        const apiKey = localStorage.getItem('google_maps_api_key') || 'AIzaSyDhYQ6CF0IECov4xy4KuVaGf0asW7O1XwM'
        script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`
        script.async = true
        script.defer = true
        script.onload = () => {
          initMap()
        }
        script.onerror = () => {
          setMapError('Failed to load Google Maps. Please check your API key.')
        }
        document.head.appendChild(script)
      } else {
        existingScript.addEventListener('load', initMap)
        return () => existingScript.removeEventListener('load', initMap)
      }
    }
  }, [myCoords, activeSubTab, user?.username])

  // Recenter/Fit Bounds manually or on initial load
  const recenterMap = () => {
    if (!mapInstanceRef.current || !window.google || !window.google.maps) return
    const bounds = new window.google.maps.LatLngBounds()

    // Add local user coordinates
    if (myCoords && typeof myCoords.lat === 'number' && typeof myCoords.lng === 'number') {
      bounds.extend(myCoords)
    }

    // Add buddy coordinates
    Object.values(memberLocations).forEach((loc) => {
      if (loc && typeof loc.lat === 'number' && typeof loc.lng === 'number') {
        bounds.extend({ lat: loc.lat, lng: loc.lng })
      }
    })

    if (!bounds.isEmpty()) {
      mapInstanceRef.current.fitBounds(bounds)
    }
  }

  // Update Markers dynamically when memberLocations or myCoords updates
  useEffect(() => {
    if (!mapInstanceRef.current || !window.google || !window.google.maps || !RippleOverlayClassRef.current) return

    // 1. Construct the list of users we need to display on the map
    const activeTrackingData = {}

    Object.keys(memberLocations).forEach((usrName) => {
      const loc = memberLocations[usrName]
      if (loc && typeof loc.lat === 'number' && typeof loc.lng === 'number') {
        activeTrackingData[usrName] = loc
      }
    })

    // Always include local current location if available
    if (myCoords && typeof myCoords.lat === 'number' && typeof myCoords.lng === 'number' && user?.username) {
      activeTrackingData[user.username] = {
        username: user.username,
        fullName: user.fullName || user.username,
        lat: myCoords.lat,
        lng: myCoords.lng,
        isActive: true
      }
    }

    const trackedUsers = Object.keys(activeTrackingData)

    // Detect coordinate duplicates and group them (Ludo token spiderfying)
    const coordGroups = {}
    trackedUsers.forEach((usrName) => {
      const loc = activeTrackingData[usrName]
      const key = `${loc.lat.toFixed(6)},${loc.lng.toFixed(6)}`
      if (!coordGroups[key]) {
        coordGroups[key] = []
      }
      coordGroups[key].push(usrName)
    })

    const adjustedPositions = {}
    Object.keys(coordGroups).forEach((key) => {
      const usersInGroup = coordGroups[key]
      const count = usersInGroup.length

      if (count === 1) {
        const usrName = usersInGroup[0]
        const loc = activeTrackingData[usrName]
        adjustedPositions[usrName] = { lat: loc.lat, lng: loc.lng }
      } else {
        // Multi-marker group (Ludo offset layout)
        usersInGroup.forEach((usrName, index) => {
          const loc = activeTrackingData[usrName]
          const offsetRadius = 0.00008 // approx 8-9 meters offset to separate visually
          const angle = (index * 2 * Math.PI) / count
          const offsetLat = loc.lat + offsetRadius * Math.sin(angle)
          const offsetLng = loc.lng + offsetRadius * Math.cos(angle)
          adjustedPositions[usrName] = { lat: offsetLat, lng: offsetLng }
        })
      }
    })

    // 2. Remove markers for users no longer active or available
    Object.keys(markersRef.current).forEach((usrName) => {
      if (!trackedUsers.includes(usrName)) {
        markersRef.current[usrName].setMap(null)
        delete markersRef.current[usrName]
      }
    })

    // 3. Render or update Ripple overlays
    trackedUsers.forEach((usrName) => {
      const loc = activeTrackingData[usrName]
      const pos = adjustedPositions[usrName]
      const position = new window.google.maps.LatLng(pos.lat, pos.lng)
      const isSelf = usrName.toLowerCase() === user?.username?.toLowerCase()
      const pinColor = isSelf ? '#1A73E8' : '#8B5CF6' // Google Blue for self, Violet for buddies

      if (markersRef.current[usrName]) {
        // Just update position (Preserves user zoom levels perfectly!)
        markersRef.current[usrName].setPosition(position)
      } else {
        // Create custom RippleOverlay marker
        const RippleOverlay = RippleOverlayClassRef.current
        const overlay = new RippleOverlay(position, mapInstanceRef.current, pinColor, loc.fullName || usrName)
        markersRef.current[usrName] = overlay
      }
    })

    // 4. Autofit bounds ONCE during initial load to prevent resetting user zoom
    if (trackedUsers.length > 0 && isFirstFitBoundsRef.current) {
      recenterMap()
      isFirstFitBoundsRef.current = false
    }
  }, [memberLocations, myCoords, wsConnected])

  // Watch Geolocation and Broadcast our Position
  const startSharingLocation = () => {
    if (!navigator.geolocation) {
      addToast('Geolocation is not supported by your browser.', 'warning')
      return
    }

    setIsSharing(true)
    addToast('Live location sharing activated!', 'success')

    // 1. Immediately request location once and broadcast
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const coords = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        }
        setMyCoords(coords)

        if (stompClientRef.current && wsConnected) {
          stompClientRef.current.send(`/app/location/${tripId}`, {
            username: user.username,
            fullName: user.fullName || user.username,
            lat: coords.lat,
            lng: coords.lng,
            isActive: true
          })
        }
      },
      (err) => {
        console.warn("Initial share location query failed", err)
      },
      { enableHighAccuracy: true, timeout: 8000 }
    )

    // 2. Start watching position for continuous updates
    watchIdRef.current = navigator.geolocation.watchPosition(
      (position) => {
        const coords = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        }
        setMyCoords(coords)

        // Publish coordinates to WebSocket gateway
        if (stompClientRef.current && wsConnected) {
          stompClientRef.current.send(`/app/location/${tripId}`, {
            username: user.username,
            fullName: user.fullName || user.username,
            lat: coords.lat,
            lng: coords.lng,
            isActive: true
          })
        }
      },
      (err) => {
        console.error("Location tracking error", err)
        addToast('Failed to retrieve location updates.', 'error')
        stopSharingLocation()
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    )
  }

  const stopSharingLocation = () => {
    setIsSharing(false)
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current)
      watchIdRef.current = null
    }

    // Publish inactive state to clear from buddies' maps
    if (stompClientRef.current && wsConnected) {
      stompClientRef.current.send(`/app/location/${tripId}`, {
        username: user?.username,
        isActive: false
      })
    }

    addToast('Stopped location sharing.', 'info')
  }

  const handleMapTypeToggle = (type) => {
    setMapType(type)
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setMapTypeId(type)
    }
  }

  // Clean up watchers on unmount
  useEffect(() => {
    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current)
      }
    }
  }, [])

  const onlineCount = teamMembers.filter(member => {
    const isSelf = member.username?.toLowerCase() === user?.username?.toLowerCase()
    return !!memberLocations[member.username] || (isSelf && !!myCoords)
  }).length

  const onMapCount = teamMembers.filter(member => {
    const isSelf = member.username?.toLowerCase() === user?.username?.toLowerCase()
    if (isSelf) return !!myCoords
    const loc = memberLocations[member.username]
    return loc && loc.lat !== null && loc.lng !== null
  }).length

  return (
    <div className="space-y-6 text-left max-w-4xl mx-auto">

      {/* SUB TABS SELECTOR */}
      <div className="flex gap-2">
        <button
          onClick={() => setActiveSubTab('map')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeSubTab === 'map'
              ? 'bg-violet-600/25 border border-violet-500/35 text-white'
              : 'text-white/60 hover:bg-white/5'
          }`}
        >
          Real-Time Map
        </button>
        <button
          onClick={() => setActiveSubTab('members')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeSubTab === 'members'
              ? 'bg-violet-600/25 border border-violet-500/35 text-white'
              : 'text-white/60 hover:bg-white/5'
          }`}
        >
          Manage Team ({teamMembers.length})
        </button>
      </div>

      {/* MAP VIEW CONTAINER - Only rendered when Map tab is active */}
      {activeSubTab === 'map' && (
        <div className="relative rounded-2xl overflow-hidden border border-white/10 shadow-2xl h-[460px] bg-slate-950/40 backdrop-blur-md">
          
          {/* Google Map Mount Node or Error */}
          {mapError ? (
            <div className="w-full h-full flex flex-col items-center justify-center gap-4 p-6 text-center">
              <div className="w-16 h-16 rounded-full bg-rose-500/20 flex items-center justify-center">
                <MapPin className="w-8 h-8 text-rose-400" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white mb-2">Map Unavailable</h3>
                <p className="text-xs text-white/50 max-w-xs">{mapError}</p>
              </div>
              <button
                onClick={() => {
                  setMapError(null)
                  // Retry loading
                  const script = document.getElementById('google-maps-script')
                  if (script) script.remove()
                  window.location.reload()
                }}
                className="px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-xs font-bold cursor-pointer"
              >
                Retry
              </button>
            </div>
          ) : (
            <div ref={mapContainerRef} className="w-full h-full" />
          )}

          {/* Floating Roster Toggle Control */}
          <button
            onClick={() => setShowRoster(!showRoster)}
            className="absolute top-4 left-4 z-20 px-3 py-2 rounded-xl bg-slate-900/95 hover:bg-slate-800 border border-white/10 text-white shadow-lg backdrop-blur-md flex items-center gap-1.5 cursor-pointer transition-all active:scale-95 text-[10px] font-bold uppercase tracking-wider"
          >
            <Users className="w-3.5 h-3.5 text-violet-400" />
            <span>{showRoster ? 'Hide Roster' : 'Show Roster'}</span>
            <span className={`w-1.5 h-1.5 rounded-full ${wsConnected ? 'bg-emerald-400 animate-pulse' : 'bg-rose-400'}`} />
          </button>

          {/* Collapsible Roster Panel Overlay */}
          {showRoster && (
            <div className="absolute top-16 left-4 z-10 w-72 max-h-[75%] overflow-y-auto bg-slate-950/90 backdrop-blur-md border border-white/10 rounded-2xl p-4 shadow-2xl flex flex-col gap-4 text-left">
              <div className="flex justify-between items-center pb-2 border-b border-white/5">
                <div>
                  <h3 className="text-xs font-black uppercase tracking-wider text-white flex items-center gap-1.5">
                    <span>Live Roster</span>
                    <span className={`w-1.5 h-1.5 rounded-full ${wsConnected ? 'bg-emerald-400 animate-pulse' : 'bg-rose-400'}`} />
                  </h3>
                  <p className="text-[9px] font-bold text-white/40 uppercase mt-0.5">
                    Online: {onlineCount} • Map: {onMapCount}
                  </p>
                </div>
                
                {/* Share Location Button */}
                {tripId && (
                  <button
                    onClick={isSharing ? stopSharingLocation : startSharingLocation}
                    className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-wider shadow-md transition-all active:scale-95 cursor-pointer ${
                      isSharing 
                        ? 'bg-rose-500/20 text-rose-450 border border-rose-500/20 hover:bg-rose-500/35' 
                        : 'bg-emerald-500/20 text-emerald-450 border border-emerald-500/20 hover:bg-emerald-500/35'
                    }`}
                  >
                    {isSharing ? (
                      <>
                        <Square className="w-2.5 h-2.5 fill-rose-400 stroke-none" />
                        <span>Stop</span>
                      </>
                    ) : (
                      <>
                        <Play className="w-2.5 h-2.5 fill-emerald-400 stroke-none" />
                        <span>Share</span>
                      </>
                    )}
                  </button>
                )}
              </div>

              {/* Buddies list with status */}
              <div className="space-y-2 overflow-y-auto pr-1">
                {teamMembers.map((member) => {
                  const isSelf = member.username?.toLowerCase() === user?.username?.toLowerCase()
                  const isOnline = !!memberLocations[member.username] || (isSelf && !!myCoords)

                  let distanceText = "";
                  if (!isSelf && myCoords) {
                    const buddyLoc = memberLocations[member.username];
                    if (buddyLoc && typeof buddyLoc.lat === 'number' && typeof buddyLoc.lng === 'number') {
                      const dist = calculateDistance(myCoords.lat, myCoords.lng, buddyLoc.lat, buddyLoc.lng);
                      distanceText = `${dist.toFixed(2)} km`;
                    }
                  }

                  return (
                    <div key={member.username} className="flex justify-between items-center gap-2 p-2 rounded-xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] transition-all">
                      <div className="min-w-0">
                        <div className="flex items-center gap-1">
                          <p className="text-[11px] font-bold text-white truncate">{member.fullName || member.username}</p>
                          {isSelf && <span className="px-1 py-0.2 rounded text-[7px] font-black uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/15">You</span>}
                        </div>
                        <p className="text-[8px] font-bold text-white/35 uppercase tracking-wider truncate">
                          @{member.username} • {member.role}
                        </p>
                      </div>

                      <div className="flex flex-col items-end shrink-0">
                        <div className="flex items-center gap-1">
                          <span className={`w-1.5 h-1.5 rounded-full ${isOnline ? 'bg-emerald-400 animate-pulse' : 'bg-white/20'}`} />
                          <span className="text-[8px] font-black uppercase tracking-wider text-white/60">
                            {isOnline ? 'Online' : 'Offline'}
                          </span>
                        </div>
                        {distanceText && (
                          <span className="text-[8px] font-black text-violet-400 uppercase tracking-wider mt-0.5">{distanceText}</span>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Dynamic Map Filters floating Overlay */}
          <div className="absolute top-4 right-4 flex gap-2">
            
            {/* Recenter Button */}
            <button
              onClick={recenterMap}
              className="p-2 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-white/10 text-white shadow-lg backdrop-blur-md flex items-center gap-1 cursor-pointer transition-all active:scale-95"
              title="Recenter"
            >
              <Maximize2 className="w-3.5 h-3.5 text-violet-400" />
              <span className="text-[10px] font-bold px-0.5 hidden sm:inline">Recenter</span>
            </button>

            {/* Map Type Filters */}
            <div className="bg-slate-900/90 border border-white/10 rounded-xl p-1 shadow-lg backdrop-blur-md flex gap-1">
              {[
                { id: 'roadmap', label: 'Default' },
                { id: 'satellite', label: 'Satellite' },
                { id: 'terrain', label: 'Terrain' },
                { id: 'hybrid', label: 'Hybrid' }
              ].map((type) => (
                <button
                  key={type.id}
                  onClick={() => handleMapTypeToggle(type.id)}
                  className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider cursor-pointer transition-all ${
                    mapType === type.id
                      ? 'bg-violet-650 text-white'
                      : 'text-white/60 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {type.label}
                </button>
              ))}
            </div>

          </div>

          {/* Offline Overlay indicator */}
          {!wsConnected && (
            <div className="absolute inset-0 bg-slate-950/80 flex flex-col justify-center items-center gap-3">
              <div className="w-8 h-8 rounded-full border-2 border-violet-400 border-t-transparent animate-spin" />
              <p className="text-xs font-bold text-white/40">Connecting to gateway...</p>
            </div>
          )}
        </div>
      )}

      {/* MEMBERS TAB CONTENT - Renders Buddies, Invites, and Status Panels */}
      {activeSubTab === 'members' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-fadeIn">
          
          {/* Left Column (8 Cols): Active Travel Buddies */}
          <div className="lg:col-span-8">
            <GlassCard className="p-6 bg-white/[0.02] border-white/5 space-y-4 min-h-[440px]">
              <div className="flex justify-between items-center border-b border-white/5 pb-3">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <Users className="w-4 h-4 text-violet-400" />
                  <span>Travel Buddies</span>
                </h3>
                <button
                  onClick={fetchMembers}
                  className="p-1.5 rounded-lg hover:bg-white/5 text-white/60 hover:text-white"
                  title="Reload Members"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${loadingMembers ? 'animate-spin' : ''}`} />
                </button>
              </div>

              {loadingMembers ? (
                <div className="flex flex-col items-center justify-center py-20 gap-3">
                  <div className="w-8 h-8 rounded-full border-2 border-violet-400 border-t-transparent animate-spin" />
                  <p className="text-[10px] font-bold text-white/40">Loading buddies...</p>
                </div>
              ) : teamMembers.length === 0 ? (
                <div className="text-center py-20 text-xs text-white/40">
                  No travel buddies joined.
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {(() => {
                    const myRole = teamMembers.find(m => m.username?.toLowerCase() === user?.username?.toLowerCase())?.role || 'MEMBER';
                    const ownerCount = teamMembers.filter(m => m.role === 'OWNER' || m.role === 'CO_OWNER').length;

                    return teamMembers.map((member) => {
                      const isSelf = member.username?.toLowerCase() === user?.username?.toLowerCase()
                      const isOnline = !!memberLocations[member.username] || (isSelf && !!myCoords)

                      let distanceText = "";
                      if (!isSelf && myCoords) {
                        const buddyLoc = memberLocations[member.username];
                        if (buddyLoc && buddyLoc.lat && buddyLoc.lng) {
                          const dist = calculateDistance(myCoords.lat, myCoords.lng, buddyLoc.lat, buddyLoc.lng);
                          distanceText = ` • ${dist.toFixed(2)} km away`;
                        }
                      }

                      // Determine management actions
                      const showRemoveAction = 
                        (!isSelf) && 
                        (myRole === 'OWNER' || 
                        (myRole === 'CO_OWNER' && member.role === 'MEMBER'));

                      const showRoleAction = 
                        (!isSelf) && 
                        (myRole === 'OWNER');

                      return (
                        <div
                          key={member.username}
                          className="p-3.5 rounded-xl border border-white/5 bg-white/[0.01] hover:bg-white/[0.03] transition-all flex justify-between items-center gap-3"
                        >
                          <div className="min-w-0 text-left">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <p className="text-xs font-bold text-white truncate">
                                {member.fullName || member.username}
                              </p>
                              {isSelf && (
                                <span className="px-1 py-0.2 rounded text-[7px] font-black uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/15">
                                  You
                                </span>
                              )}
                              {member.role === 'OWNER' && (
                                <span className="px-1 py-0.2 rounded text-[7px] font-black uppercase bg-amber-500/10 text-amber-400 border border-amber-500/15">
                                  Owner
                                </span>
                              )}
                              {member.role === 'CO_OWNER' && (
                                <span className="px-1 py-0.2 rounded text-[7px] font-black uppercase bg-violet-500/10 text-violet-400 border border-violet-500/15">
                                  Co-Owner
                                </span>
                              )}
                            </div>
                            <p className="text-[10px] text-white/40 truncate font-semibold mt-0.5">
                              @{member.username}{distanceText}
                            </p>
                          </div>

                          {/* Member management actions / status */}
                          <div className="flex items-center gap-2 shrink-0">
                            {/* Role promote/demote button */}
                            {showRoleAction && (
                              member.role === 'CO_OWNER' ? (
                                <button
                                  onClick={() => handleUpdateRole(member.username, 'MEMBER')}
                                  className="px-2 py-1 rounded bg-white/5 hover:bg-white/10 text-[9px] font-black uppercase text-white/60 transition-all cursor-pointer"
                                  title="Revoke Co-ownership"
                                >
                                  Demote
                                </button>
                              ) : (
                                member.role === 'MEMBER' && (
                                  <button
                                    onClick={() => handleUpdateRole(member.username, 'CO_OWNER')}
                                    disabled={ownerCount >= 3}
                                    className={`px-2 py-1 rounded text-[9px] font-black uppercase transition-all cursor-pointer ${
                                      ownerCount >= 3
                                        ? 'opacity-40 bg-white/5 text-white/30 cursor-not-allowed'
                                        : 'bg-violet-600/25 border border-violet-500/35 hover:bg-violet-600/40 text-violet-300'
                                    }`}
                                    title={ownerCount >= 3 ? 'Max 3 owners reached' : 'Make Co-Owner'}
                                  >
                                    Promote
                                  </button>
                                )
                              )
                            )}

                            {/* Remove member button */}
                            {showRemoveAction && (
                              <button
                                onClick={() => handleRemoveMember(member.username)}
                                className="p-1.5 rounded-lg hover:bg-rose-500/10 text-white/40 hover:text-rose-400 transition-all cursor-pointer"
                                title="Remove Buddy"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            )}

                            {/* Status indicator dot if no action shown */}
                            {!showRemoveAction && !showRoleAction && (
                              <div className="flex items-center gap-1.5">
                                <span className={`w-1.5 h-1.5 rounded-full ${isOnline ? 'bg-emerald-400 animate-pulse' : 'bg-white/20'}`} />
                                <span className="text-[8px] font-black uppercase text-white/40">
                                  {isOnline ? 'Online' : 'Offline'}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      )
                    });
                  })()}
                </div>
              )}
            </GlassCard>
          </div>

          {/* Right Column (4 Cols): Status, Invite Form, Requests */}
          <div className="lg:col-span-4 space-y-6">

            {/* INVITE FORM */}
            <GlassCard className="p-5 bg-white/[0.02] border-white/5 space-y-4">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <UserPlus className="w-4 h-4 text-violet-400" />
                <span>Invite Travel Buddy</span>
              </h3>
              
              <form onSubmit={handleSendInvite} className="flex gap-2">
                <input
                  type="email"
                  value={inviteUsername}
                  onChange={(e) => setInviteUsername(e.target.value)}
                  placeholder="Email address"
                  className="flex-grow glass-input text-xs"
                />
                <button
                  type="submit"
                  disabled={submittingInvite || !inviteUsername.trim() || !inviteUsername.includes('@')}
                  className="px-3 rounded-xl bg-violet-650 hover:bg-violet-750 text-white flex items-center justify-center disabled:opacity-50 cursor-pointer"
                >
                  {submittingInvite ? (
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Send className="w-3.5 h-3.5" />
                  )}
                </button>
              </form>
            </GlassCard>

            {/* INCOMING INVITES LIST */}
            <GlassCard className="p-5 bg-white/[0.02] border-white/5 space-y-4">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <span>Incoming Requests</span>
                {receivedInvites.length > 0 && (
                  <span className="px-1.5 py-0.2 rounded-full bg-rose-500 text-white text-[9px] font-extrabold">
                    {receivedInvites.length}
                  </span>
                )}
              </h3>

              {loadingInvites ? (
                <div className="flex justify-center py-6">
                  <div className="w-5 h-5 border-2 border-violet-400 border-t-transparent rounded-full animate-spin" />
                </div>
              ) : receivedInvites.length === 0 ? (
                <p className="text-[11px] text-white/30 italic py-2 text-center">No incoming requests.</p>
              ) : (
                <div className="space-y-2">
                  {receivedInvites.map((invite) => (
                    <div
                      key={invite.id}
                      className="p-2.5 rounded-xl border border-white/5 bg-slate-900/35 flex justify-between items-center gap-2"
                    >
                      <div className="min-w-0 text-left">
                        <p className="text-xs font-bold text-white truncate">@{invite.inviterUsername}</p>
                        <p className="text-[9px] text-white/40">invited you</p>
                      </div>

                      <div className="flex gap-1.5">
                        <button
                          onClick={() => handleAcceptInvite(invite.id)}
                          className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/35 cursor-pointer"
                          title="Accept"
                        >
                          <Check className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleRejectInvite(invite.id)}
                          className="p-1.5 rounded-lg bg-rose-500/20 text-rose-450 border border-rose-500/20 hover:bg-rose-500/35 cursor-pointer"
                          title="Reject"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </GlassCard>

            {/* OUTGOING SENT INVITES LIST */}
            <GlassCard className="p-5 bg-white/[0.02] border-white/5 space-y-4">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                Sent Invitations
              </h3>

              {loadingInvites ? (
                <div className="flex justify-center py-6">
                  <div className="w-5 h-5 border-2 border-violet-400 border-t-transparent rounded-full animate-spin" />
                </div>
              ) : sentInvites.length === 0 ? (
                <p className="text-[11px] text-white/30 italic py-2 text-center">No invitations sent.</p>
              ) : (
                <div className="space-y-2 max-h-40 overflow-y-auto custom-scrollbar">
                  {sentInvites.map((invite) => {
                    const statusColors = {
                      PENDING: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
                      ACCEPTED: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
                      REJECTED: 'text-rose-400 bg-rose-500/10 border-rose-500/20'
                    }

                    return (
                      <div
                        key={invite.id}
                        className="p-2.5 rounded-xl border border-white/5 bg-slate-900/15 flex justify-between items-center gap-2"
                      >
                        <div className="min-w-0 text-left">
                          <p className="text-xs font-bold text-white truncate">@{invite.inviteeUsername}</p>
                          <p className="text-[8px] text-white/35">Invited: {new Date(invite.createdAt).toLocaleDateString()}</p>
                        </div>

                        <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase border ${statusColors[invite.status] || 'text-white/40'}`}>
                          {invite.status}
                        </span>
                      </div>
                    )
                  })}
                </div>
              )}
            </GlassCard>

          </div>
        </div>
      )}

    </div>
  )
}
