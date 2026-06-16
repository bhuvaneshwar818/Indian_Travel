import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { useWishlistStore } from '../store/useWishlistStore'
import { useTripStore } from '../store/useTripStore'
import { useTripStore as useLegacyTripStore } from '../store/tripStore'
import { GlassCard } from '../components/ui/GlassCard'
import OnboardingStepper from '../components/stepper/OnboardingStepper'
import TravelSummaryCard from '../components/dashboard/TravelSummaryCard'
import WeatherWidget from '../components/dashboard/WeatherWidget'
import TransportTimings from '../components/dashboard/TransportTimings'
import RouteResults from '../components/dashboard/RouteResults'
import BudgetTracker from '../components/dashboard/BudgetTracker'
import LanguageTranslator from '../components/dashboard/LanguageTranslator'
import GroupChat from '../components/dashboard/GroupChat'
import IndiaInteractiveMap from '../components/map/IndiaInteractiveMap'
import GoogleMapPanel from '../components/map/GoogleMapPanel'
import WishlistPanel from '../components/wishlist/WishlistPanel'
import { 
  Home, Map, Heart, Compass, MessageSquare, Wallet, Sun, Languages, 
  Settings, LogOut, Bell, Menu, X, ArrowLeft, Star, Plus, CheckCircle2, ChevronRight 
} from 'lucide-react'
import { AnimatePresence } from 'framer-motion'
import '../styles/dashboard.css'

export default function Dashboard() {
  const { user, logout } = useAuthStore();
  const { wishlist, fetchWishlist, addPlaceToWishlist, removePlaceFromWishlist, reorderWishlist } = useWishlistStore();
  const { 
    preferences, fetchPreferences, routeData, fetchShortestRoute, 
    fetchScenicRoute, clearRouteData, weatherData, fetchWeather, 
    expenses, fetchExpenses, fetchExpenseSummary 
  } = useTripStore();
  
  // Legacy store to search destinations
  const { destinations, fetchDestinations, addBookmark, bookmarks, fetchBookmarks } = useLegacyTripStore();

  const navigate = useNavigate();
  
  // Layout states
  const [activeSection, setActiveSection] = useState('dashboard'); // dashboard, map, wishlist, route, chat, budget, weather, translator
  const [showStepper, setShowStepper] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [rightPanelOpen, setRightPanelOpen] = useState(true);
  const [activeRoutePolyline, setActiveRoutePolyline] = useState(null);

  // Map Filter states
  const [selectedState, setSelectedState] = useState('Goa');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Auto Onboarding trigger
  useEffect(() => {
    const preferencesSaved = localStorage.getItem('trip_preferences_saved');
    if (!preferencesSaved) {
      setShowStepper(true);
    } else {
      fetchPreferences();
    }
    fetchWishlist();
    fetchExpenses();
    fetchExpenseSummary();
    fetchBookmarks();
  }, [fetchPreferences, fetchWishlist, fetchExpenses, fetchExpenseSummary, fetchBookmarks]);

  // Load state destinations on change
  useEffect(() => {
    fetchDestinations(selectedState, selectedCategory === 'all' ? '' : selectedCategory);
  }, [selectedState, selectedCategory, fetchDestinations]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleAddWishlist = async (dest) => {
    try {
      await addPlaceToWishlist(
        dest.name || dest.placeName,
        dest.state,
        dest.category,
        dest.lat || 20.5937,
        dest.lng || 78.9629
      );
    } catch (e) {
      console.error("Failed to add to wishlist", e);
    }
  };

  const handleDrawRoute = (polyline, isScenic) => {
    setActiveRoutePolyline({
      polyline,
      isScenic
    });
    setActiveSection('dashboard'); // go back to main dashboard to see drawn path
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const filteredPlaces = destinations.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const categories = [
    { id: "all", label: "All Sights" },
    { id: "Beaches", label: "Beaches" },
    { id: "Historical", label: "Heritage" },
    { id: "Temples", label: "Spiritual" },
    { id: "Adventure", label: "Adventure" },
    { id: "Food", label: "Culinary" }
  ];

  const indianStatesList = [
    "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", 
    "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jammu & Kashmir", 
    "Jharkhand", "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra", 
    "Manipur", "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab", 
    "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura", 
    "Uttar Pradesh", "Uttarakhand", "West Bengal"
  ];

  return (
    <div className="dashboard-root flex flex-col relative overflow-x-hidden">
      
      {/* ONBOARDING STEPPER MODAL */}
      <AnimatePresence>
        {showStepper && (
          <OnboardingStepper 
            onComplete={() => {
              setShowStepper(false);
              fetchPreferences();
            }} 
          />
        )}
      </AnimatePresence>

      {/* STICKY INTERNAL HEADER NAVBAR */}
      <header className="fixed top-0 left-0 w-full z-40 bg-white/[0.04] backdrop-blur-md border-b border-white/10 px-6 py-4 flex items-center justify-between shadow-lg">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-1.5 rounded-lg bg-white/5 border border-white/10 text-white/80 hover:text-white"
          >
            <Menu className="w-4 h-4" />
          </button>
          
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-violet-650 to-indigo-650 flex items-center justify-center shadow-md">
              <Compass className="w-4 h-4 text-white" />
            </div>
            <span className="font-display font-black text-sm tracking-tight text-white hidden sm:inline">
              IndianTravel<span className="text-violet-400">AI</span>
            </span>
          </Link>
        </div>

        {/* Dynamic header info */}
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setRightPanelOpen(!rightPanelOpen)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-violet-600/20 border border-violet-500/35 text-[10px] font-bold text-violet-300 transition-all hover:bg-violet-600/30"
          >
            <Heart className="w-3.5 h-3.5 fill-violet-400" />
            <span>Wishlist Panel</span>
          </button>

          <Link to="/" className="flex items-center gap-1 text-[10px] font-bold text-white/50 hover:text-white">
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Home</span>
          </Link>

          <div className="h-4 w-px bg-white/10" />

          {/* User Account Avatar bubble */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-violet-650/20 border border-violet-900/35 text-violet-300 font-bold text-xs flex items-center justify-center">
              {user?.fullName?.charAt(0) || 'T'}
            </div>
            <span className="text-xs font-bold text-white/80 hidden md:inline">{user?.fullName || "Traveler"}</span>
          </div>
        </div>
      </header>

      {/* CORE CONTENT LAYOUT */}
      <div className="flex-1 flex pt-[72px] min-h-screen">
        
        {/* LEFT COLLAPSIBLE SIDEBAR */}
        <aside className={`sidebar-transition shrink-0 border-r border-white/5 bg-slate-950/40 relative z-30 ${
          sidebarOpen ? 'w-60' : 'w-0 overflow-hidden border-r-0'
        }`}>
          <div className="p-4 space-y-2 mt-4">
            {[
              { id: 'dashboard', label: 'Dashboard', icon: <Home className="w-4 h-4" /> },
              { id: 'map', label: 'Interactive Map', icon: <Map className="w-4 h-4" /> },
              { id: 'route', label: 'Find Route', icon: <Compass className="w-4 h-4" /> },
              { id: 'chat', label: 'Group Chat', icon: <MessageSquare className="w-4 h-4" />, visible: preferences?.travelMode === 'GROUP' },
              { id: 'budget', label: 'Budget Tracker', icon: <Wallet className="w-4 h-4" /> },
              { id: 'weather', label: 'Weather Forecast', icon: <Sun className="w-4 h-4" /> },
              { id: 'translator', label: 'Translator', icon: <Languages className="w-4 h-4" /> }
            ].map((tab) => {
              if (tab.visible === false) return null;
              const isActive = activeSection === tab.id;

              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveSection(tab.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold tracking-wide transition-all text-left ${
                    isActive 
                      ? 'bg-violet-600/20 border-l-2 border-violet-500 text-white font-extrabold shadow-sm' 
                      : 'text-white/60 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  {tab.icon}
                  <span>{tab.label}</span>
                </button>
              );
            })}

            <div className="h-px bg-white/5 my-6" />

            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold text-red-400 hover:bg-red-950/20 text-left transition-all"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out</span>
            </button>
          </div>
        </aside>

        {/* CENTER MAIN CONTENT WORKSPACE */}
        <main className="flex-1 p-6 md:p-8 space-y-8 overflow-y-auto animate-dashboard-fade">
          
          {/* Active Summary Panel */}
          <TravelSummaryCard 
            preferences={preferences} 
            onEdit={() => setShowStepper(true)} 
          />

          {/* DYNAMIC SUBSECTION RENDERING */}
          {activeSection === 'dashboard' && (
            <div className="space-y-8">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Left Column: Interactive Google Map */}
                <div className="lg:col-span-8 space-y-6">
                  <GoogleMapPanel 
                    wishlist={wishlist} 
                    activeRoute={activeRoutePolyline} 
                  />
                  {preferences?.transportMode === 'PUBLIC' && (
                    <TransportTimings wishlist={wishlist} />
                  )}
                </div>

                {/* Right Column: Local weather widgets & Translator tools */}
                <div className="lg:col-span-4 space-y-6">
                  <WeatherWidget destinations={wishlist} />
                  <LanguageTranslator />
                </div>
              </div>
            </div>
          )}

          {activeSection === 'map' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              
              {/* Map & Selection Tools */}
              <div className="lg:col-span-5 space-y-6">
                <GlassCard className="p-5 space-y-4 bg-white/[0.04]">
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                    Search Regional Highlights
                  </h3>
                  
                  <div className="space-y-3">
                    {/* State Selector */}
                    <div>
                      <label className="block text-[10px] font-bold text-white/50 uppercase tracking-wide mb-1.5">
                        Select Indian State
                      </label>
                      <select
                        value={selectedState}
                        onChange={(e) => setSelectedState(e.target.value)}
                        className="w-full glass-input text-xs bg-slate-900"
                      >
                        {indianStatesList.map((st) => (
                          <option key={st} value={st}>{st}</option>
                        ))}
                      </select>
                    </div>

                    {/* Category Selector */}
                    <div>
                      <label className="block text-[10px] font-bold text-white/50 uppercase tracking-wide mb-1.5">
                        Filter Category
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {categories.map((c) => (
                          <button
                            key={c.id}
                            onClick={() => setSelectedCategory(c.id)}
                            className={`px-3 py-1.5 rounded-lg border text-[10px] font-semibold transition-all ${
                              selectedCategory === c.id
                                ? 'bg-violet-500/20 border-violet-500 text-white'
                                : 'bg-white/5 border-white/5 text-white/60 hover:bg-white/10 hover:text-white'
                            }`}
                          >
                            {c.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </GlassCard>

                {/* SVG India Vector Map */}
                <GlassCard className="p-5 flex items-center justify-center bg-white/[0.04]">
                  <IndiaInteractiveMap 
                    selectedState={selectedState} 
                    onSelectState={(st) => setSelectedState(st)} 
                  />
                </GlassCard>
              </div>

              {/* State Search Cards catalog */}
              <div className="lg:col-span-7 space-y-4">
                <div className="flex justify-between items-center text-xs font-bold text-white/50 border-b border-white/5 pb-2">
                  <span>Matched Destinations in {selectedState}</span>
                  <span>{filteredPlaces.length} Sights</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-[580px] overflow-y-auto pr-1 custom-scrollbar">
                  {filteredPlaces.length === 0 ? (
                    <div className="col-span-full py-16 text-center text-xs text-white/35">
                      No matching destinations found. Expand your category filters!
                    </div>
                  ) : (
                    filteredPlaces.map((dest) => (
                      <GlassCard key={dest.id} className="overflow-hidden flex flex-col justify-between bg-white/[0.04]">
                        <div className="relative h-32 w-full overflow-hidden">
                          <img
                            src={dest.imageUrl}
                            alt={dest.name}
                            className="w-full h-full object-cover"
                          />
                          <span className="absolute top-3 left-3 px-2 py-0.5 rounded bg-violet-600 text-white text-[8px] font-black uppercase">
                            {dest.category}
                          </span>
                        </div>

                        <div className="p-4 space-y-2 flex-grow flex flex-col justify-between text-left">
                          <div>
                            <h4 className="font-bold text-xs text-white flex items-center justify-between">
                              <span>{dest.name}</span>
                              <span className="text-amber-400 font-extrabold flex items-center gap-0.5 text-[10px]">
                                ★ {dest.rating}
                              </span>
                            </h4>
                            <p className="text-[9px] text-white/40">{dest.city}, {dest.state}</p>
                            <p className="text-[10px] text-white/60 line-clamp-3 leading-relaxed mt-2">
                              {dest.description}
                            </p>
                          </div>

                          <button
                            onClick={() => handleAddWishlist(dest)}
                            className="w-full py-2 rounded-xl bg-violet-600/10 hover:bg-violet-600/20 border border-violet-500/20 text-[10px] font-bold text-violet-300 mt-4 transition-all"
                          >
                            + Add to Wishlist
                          </button>
                        </div>
                      </GlassCard>
                    ))
                  )}
                </div>
              </div>

            </div>
          )}

          {activeSection === 'wishlist' && (
            <div className="max-w-xl mx-auto">
              <WishlistPanel
                wishlist={wishlist}
                onRemove={removePlaceFromWishlist}
                reorder={reorderWishlist}
                onFindShortestRoute={fetchShortestRoute}
                onFindScenicRoute={fetchScenicRoute}
              />
            </div>
          )}

          {activeSection === 'route' && (
            <div className="space-y-6">
              <div className="max-w-xl mx-auto space-y-6">
                <GlassCard className="p-5 text-left bg-white/[0.04] space-y-4">
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider">Calculate Route Sequence</h3>
                  <p className="text-xs text-white/60">
                    We will parse your wishlist coordinates, run the Traveling Salesperson (TSP) pathfinding optimizer, and output the ideal journey.
                  </p>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => fetchShortestRoute(wishlist.map(p => p.id))}
                      disabled={wishlist.length === 0}
                      className="py-2.5 rounded-xl bg-violet-650 hover:bg-violet-750 text-xs font-bold text-white shadow-md disabled:opacity-50 transition-all"
                    >
                      Optimize Shortest Route
                    </button>
                    <button
                      onClick={() => fetchScenicRoute(wishlist.map(p => p.id))}
                      disabled={wishlist.length === 0}
                      className="py-2.5 rounded-xl bg-teal-650 hover:bg-teal-700 text-xs font-bold text-white shadow-md disabled:opacity-50 transition-all"
                    >
                      Calculate Scenic Path
                    </button>
                  </div>
                </GlassCard>

                {routeData && (
                  <RouteResults 
                    routeData={routeData} 
                    onDrawRoute={handleDrawRoute} 
                  />
                )}
              </div>
            </div>
          )}

          {activeSection === 'chat' && (
            <div className="max-w-lg mx-auto">
              {wishlist.length > 0 ? (
                <GroupChat tripId={wishlist[0].tripId} />
              ) : (
                <GlassCard className="p-6 text-center text-xs text-white/40">
                  Create a wishlist to open your group chat workspace.
                </GlassCard>
              )}
            </div>
          )}

          {activeSection === 'budget' && (
            <BudgetTracker />
          )}

          {activeSection === 'weather' && (
            <div className="max-w-4xl mx-auto">
              <WeatherWidget destinations={wishlist} />
            </div>
          )}

          {activeSection === 'translator' && (
            <div className="max-w-lg mx-auto">
              <LanguageTranslator />
            </div>
          )}

        </main>

        {/* RIGHT DRAWER WISHLIST SIDEBAR */}
        <aside className={`sidebar-transition shrink-0 border-l border-white/5 bg-slate-950/40 relative z-30 ${
          rightPanelOpen ? 'w-80' : 'w-0 overflow-hidden border-l-0'
        }`}>
          <div className="p-4 h-full">
            <WishlistPanel
              wishlist={wishlist}
              onRemove={removePlaceFromWishlist}
              reorder={reorderWishlist}
              onFindShortestRoute={fetchShortestRoute}
              onFindScenicRoute={fetchScenicRoute}
            />
          </div>
        </aside>

      </div>
    </div>
  )
}
