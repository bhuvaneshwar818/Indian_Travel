import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTripStore } from '../store/tripStore'
import { useAuthStore } from '../store/authStore'
import { Sparkles, Calendar, Wallet, Compass, Loader, CheckCircle2, CloudSun, Utensils, Hotel, Luggage, ArrowRight, UserPlus, Info, Check, AlertCircle } from 'lucide-react'
import confetti from 'canvas-confetti'

const STATES = ["Goa", "Kerala", "Rajasthan", "Ladakh", "Uttar Pradesh", "Karnataka", "Tamil Nadu", "Telangana"]
const CATEGORIES = [
  { id: "Beaches", label: "Beaches & Relaxation", icon: "🏖️" },
  { id: "Historical", label: "Heritage & Forts", icon: "🏰" },
  { id: "Temples", label: "Temples & Spiritual", icon: "🕉️" },
  { id: "Adventure", label: "Trekking & Outdoors", icon: "🧗" },
  { id: "Food", label: "Culinary & Dining", icon: "🍲" }
]
const BUDGETS = [
  { id: "Budget", title: "Budget Friendly", desc: "Local travel, street food, homestays", icon: "🪙" },
  { id: "Moderate", title: "Moderate Comfort", desc: "Mid-tier hotels, private taxis, nice diners", icon: "💵" },
  { id: "Luxury", title: "Royal Luxury", desc: "5-star palaces, premium cruises, fine dining", icon: "💎" }
]

export default function AITravelPlanner() {
  const { activeItinerary, generateTrip, generating, error, clearActiveItinerary } = useTripStore()
  const { isAuthenticated, user } = useAuthStore()

  // Wizard State
  const [step, setStep] = useState(1)
  const [selectedState, setSelectedState] = useState("Goa")
  const [selectedCategory, setSelectedCategory] = useState("Beaches")
  const [selectedBudget, setSelectedBudget] = useState("Moderate")
  const [selectedDuration, setSelectedDuration] = useState(3)

  // Timeline UI State
  const [activeDay, setActiveDay] = useState(1)

  // Listen to external map click events to automatically select a state in the AI Travel Wizard
  React.useEffect(() => {
    const handleSetPlannerState = (e) => {
      if (e.detail && e.detail.state) {
        setSelectedState(e.detail.state);
        setStep(1); // Show step 1 to confirm selection
      }
    };
    window.addEventListener('set-planner-state', handleSetPlannerState);
    return () => window.removeEventListener('set-planner-state', handleSetPlannerState);
  }, []);

  const handleNextStep = () => {
    if (step < 4) setStep(step + 1)
  }

  const handlePrevStep = () => {
    if (step > 1) setStep(step - 1)
  }

  const handleGenerate = async () => {
    if (!isAuthenticated) {
      alert("Please log in to generate and save your AI travel itinerary!")
      return
    }

    try {
      const result = await generateTrip(selectedState, selectedCategory, selectedBudget, selectedDuration)
      if (result) {
        // Trigger high-fidelity confetti burst!
        confetti({
          particleCount: 150,
          spread: 80,
          origin: { y: 0.6 },
          colors: ['#7C3AED', '#A78BFA', '#F472B6', '#34D399', '#60A5FA']
        })
      }
    } catch (err) {
      console.error(err)
    }
  }

  const handleReset = () => {
    clearActiveItinerary()
    setStep(1)
    setActiveDay(1)
  }

  return (
    <section id="ai-planner" className="py-24 bg-[#0A0516] text-white relative overflow-hidden">
      
      {/* Dynamic Purple Neon Glow Circles */}
      <div className="neon-glow-circle w-[500px] h-[500px] bg-primary/20 top-10 left-10"></div>
      <div className="neon-glow-circle w-[500px] h-[500px] bg-purple-500/10 bottom-10 right-10"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Header Section */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-purple-950/40 text-purple-300 border border-purple-900/30 mb-4 animate-pulse-glow">
            <Sparkles className="w-4.5 h-4.5 text-primary" />
            <span className="text-xs font-bold uppercase tracking-wider">AI Travel Architect</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-display font-extrabold text-white">
            AI Travel <span className="bg-gradient-to-r from-primary via-purple-400 to-indigo-400 bg-clip-text text-transparent">Planner Assistant</span>
          </h2>
          <p className="mt-4 text-slate-350 font-medium">
            Formulate bespoke travel plans across India, optimize your expenditures, and get rich daily itineraries in a few taps.
          </p>
        </div>

        {/* Lock Screen if Logged Out */}
        {!isAuthenticated ? (
          <div className="clay-card clay-card-hover max-w-2xl mx-auto p-8 md:p-12 text-center bg-slate-900/40 border border-slate-800">
            <Compass className="w-16 h-16 text-primary-light mx-auto mb-6 animate-spin-slow" />
            <h3 className="text-2xl font-extrabold font-display">Secure AI Planner Gate</h3>
            <p className="mt-3 text-slate-350 text-sm leading-relaxed max-w-md mx-auto">
              Our advanced itinerary architect integrates E2E user security. Sign up or log in to generate and save your travel routes.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row justify-center items-center gap-4">
              <a 
                href="/login" 
                className="clay-btn-primary px-8 py-3.5 text-sm flex items-center justify-center gap-2 w-full sm:w-auto"
              >
                <span>Login to Account</span>
                <ArrowRight className="w-4 h-4" />
              </a>
              <a 
                href="/signup" 
                className="clay-btn-secondary px-8 py-3.5 text-sm w-full sm:w-auto text-center"
              >
                Create Account
              </a>
            </div>
          </div>
        ) : (
          <div className="max-w-5xl mx-auto">
            
            {/* If NO active itinerary exists, show the multi-step wizard */}
            {!activeItinerary ? (
              <div className="clay-card clay-card-hover p-6 md:p-10 bg-slate-900/50 border border-slate-850">
                
                {/* Steps indicator bar */}
                <div className="flex justify-between items-center mb-10 max-w-md mx-auto relative">
                  <div className="absolute left-0 right-0 h-1 bg-slate-800 z-0"></div>
                  <div 
                    className="absolute left-0 h-1 bg-primary z-0 transition-all duration-300"
                    style={{ width: `${((step - 1) / 3) * 100}%` }}
                  ></div>

                  {[1, 2, 3, 4].map((s) => (
                    <div 
                      key={s} 
                      className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs z-10 transition-colors duration-300 ${
                        s <= step ? 'bg-primary text-white shadow-md' : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {s < step ? <Check className="w-4 h-4" /> : s}
                    </div>
                  ))}
                </div>

                {/* Step Body */}
                <div className="min-h-[250px] flex items-center justify-center mb-8">
                  <AnimatePresence mode="wait">
                    
                    {/* STEP 1: State Selection */}
                    {step === 1 && (
                      <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="w-full text-left"
                      >
                        <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                          <Compass className="w-5 h-5 text-primary" />
                          <span>1. Select Destination State</span>
                        </h3>
                        <p className="text-xs text-slate-400 mb-6">Choose from major travel states, or search details below first.</p>
                        
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                          {STATES.map((st) => (
                            <button
                              key={st}
                              onClick={() => setSelectedState(st)}
                              className={`p-4 rounded-2xl border text-center transition-all duration-200 font-bold text-sm ${
                                selectedState === st 
                                  ? 'bg-primary/20 border-primary text-white shadow-md' 
                                  : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 text-slate-350'
                              }`}
                            >
                              📍 {st}
                            </button>
                          ))}
                        </div>
                      </motion.div>
                    )}

                    {/* STEP 2: Category selection */}
                    {step === 2 && (
                      <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="w-full text-left"
                      >
                        <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                          <Calendar className="w-5 h-5 text-primary" />
                          <span>2. Select Travel Theme</span>
                        </h3>
                        <p className="text-xs text-slate-400 mb-6">What style of trip are you looking for?</p>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {CATEGORIES.map((cat) => (
                            <button
                              key={cat.id}
                              onClick={() => setSelectedCategory(cat.id)}
                              className={`p-5 rounded-2xl border text-left flex items-center gap-4 transition-all duration-200 ${
                                selectedCategory === cat.id 
                                  ? 'bg-primary/20 border-primary text-white shadow-md' 
                                  : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 text-slate-350'
                              }`}
                            >
                              <span className="text-2xl">{cat.icon}</span>
                              <div>
                                <p className="font-bold text-sm text-white">{cat.label}</p>
                                <p className="text-xs text-slate-450 mt-0.5">Custom procedures indexed.</p>
                              </div>
                            </button>
                          ))}
                        </div>
                      </motion.div>
                    )}

                    {/* STEP 3: Budget Selection */}
                    {step === 3 && (
                      <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="w-full text-left"
                      >
                        <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                          <Wallet className="w-5 h-5 text-primary" />
                          <span>3. Select Budget Preferences</span>
                        </h3>
                        <p className="text-xs text-slate-400 mb-6">Select a financial tier. AI will auto-calculate costs.</p>
                        
                        <div className="grid grid-cols-1 gap-4">
                          {BUDGETS.map((bud) => (
                            <button
                              key={bud.id}
                              onClick={() => setSelectedBudget(bud.id)}
                              className={`p-5 rounded-2xl border text-left flex items-center justify-between gap-4 transition-all duration-200 ${
                                selectedBudget === bud.id 
                                  ? 'bg-primary/20 border-primary text-white shadow-md' 
                                  : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 text-slate-350'
                              }`}
                            >
                              <div className="flex items-center gap-4">
                                <span className="text-2xl">{bud.icon}</span>
                                <div>
                                  <p className="font-bold text-sm text-white">{bud.title}</p>
                                  <p className="text-xs text-slate-400 mt-1">{bud.desc}</p>
                                </div>
                              </div>
                              {selectedBudget === bud.id && <span className="w-2.5 h-2.5 rounded-full bg-primary animate-ping"></span>}
                            </button>
                          ))}
                        </div>
                      </motion.div>
                    )}

                    {/* STEP 4: Duration Selection */}
                    {step === 4 && (
                      <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="w-full text-left"
                      >
                        <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                          <Sparkles className="w-5 h-5 text-primary" />
                          <span>4. Select Trip Duration</span>
                        </h3>
                        <p className="text-xs text-slate-400 mb-6">How long do you want to explore? (1 to 10 Days)</p>
                        
                        <div className="grid grid-cols-4 sm:grid-cols-7 gap-3 mb-6">
                          {[1, 2, 3, 4, 5, 7, 10].map((d) => (
                            <button
                              key={d}
                              onClick={() => setSelectedDuration(d)}
                              className={`p-4 rounded-xl border text-center font-bold text-sm transition-all duration-200 ${
                                selectedDuration === d 
                                  ? 'bg-primary/20 border-primary text-white shadow-md' 
                                  : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 text-slate-350'
                              }`}
                            >
                              {d} {d === 1 ? 'Day' : 'Days'}
                            </button>
                          ))}
                        </div>

                        {/* Summary Block */}
                        <div className="p-4 rounded-2xl bg-slate-950/40 border border-slate-850 flex flex-wrap gap-x-6 gap-y-2 text-xs">
                          <div><span className="text-slate-400">Selected Destination:</span> <strong className="text-white">{selectedState}</strong></div>
                          <div><span className="text-slate-400">Theme:</span> <strong className="text-white">{selectedCategory}</strong></div>
                          <div><span className="text-slate-400">Budget:</span> <strong className="text-white">{selectedBudget}</strong></div>
                          <div><span className="text-slate-400">Duration:</span> <strong className="text-white">{selectedDuration} Days</strong></div>
                        </div>

                      </motion.div>
                    )}

                  </AnimatePresence>
                </div>

                {/* Wizard Footer controls */}
                <div className="flex justify-between items-center pt-5 border-t border-slate-800">
                  <button
                    onClick={handlePrevStep}
                    disabled={step === 1 || generating}
                    className={`px-6 py-2.5 rounded-xl text-xs font-bold transition-all ${
                      step === 1 
                        ? 'opacity-40 text-slate-600 cursor-not-allowed' 
                        : 'bg-slate-850 text-white hover:bg-slate-800'
                    }`}
                  >
                    Back
                  </button>

                  {step < 4 ? (
                    <button
                      onClick={handleNextStep}
                      className="clay-btn-primary px-6 py-2.5 text-xs"
                    >
                      Next Step
                    </button>
                  ) : (
                    <button
                      onClick={handleGenerate}
                      disabled={generating}
                      className="clay-btn-primary px-8 py-3 text-xs flex items-center gap-2"
                    >
                      {generating ? (
                        <>
                          <Loader className="w-4 h-4 animate-spin text-white" />
                          <span>AI Architecting...</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4 animate-pulse-glow" />
                          <span>Generate AI Itinerary</span>
                        </>
                      )}
                    </button>
                  )}
                </div>

                {error && (
                  <p className="mt-4 text-xs font-semibold text-red-400 text-center flex items-center justify-center gap-1.5 bg-red-950/20 py-2 rounded-lg border border-red-900/35">
                    <AlertCircle className="w-4 h-4" />
                    <span>{error}</span>
                  </p>
                )}

              </div>
            ) : (
              
              /* RENDER GENERATED TRAVEL ITINERARY */
              <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="space-y-8"
              >
                
                {/* Result Hero Header */}
                <div className="clay-card clay-card-hover p-6 md:p-8 bg-gradient-to-r from-primary/10 via-purple-950/20 to-indigo-950/20 border border-purple-900/25 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 text-left">
                  <div>
                    <span className="px-3 py-1 rounded-lg bg-green-500 text-white text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 w-fit mb-3">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Saved successfully</span>
                    </span>
                    <h3 className="text-2xl md:text-3xl font-display font-extrabold text-white leading-tight">
                      {activeItinerary.title || `${activeItinerary.state} Explorer`}
                    </h3>
                    <p className="text-slate-400 text-xs mt-1 font-semibold flex items-center gap-4">
                      <span>Budget: {activeItinerary.budget}</span>
                      <span>•</span>
                      <span>Duration: {activeItinerary.duration} Days</span>
                      <span>•</span>
                      <span>Cost: ₹{activeItinerary.totalBudgetEstimate?.toLocaleString('en-IN')}</span>
                    </p>
                  </div>
                  
                  <button
                    onClick={handleReset}
                    className="clay-btn-secondary py-2.5 px-6 text-xs w-full md:w-auto text-center"
                  >
                    Plan Another Trip
                  </button>
                </div>

                {/* Main Split Layout: Timeline VS Side widgets */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 text-left">
                  
                  {/* Left Column: Timeline details (Day by Day) */}
                  <div className="lg:col-span-7 space-y-6">
                    
                    {/* Day selector tabs */}
                    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none" style={{ scrollbarWidth: 'none' }}>
                      {activeItinerary.itinerary.map((day) => (
                        <button
                          key={day.dayNumber}
                          onClick={() => setActiveDay(day.dayNumber)}
                          className={`px-5 py-3 rounded-xl font-bold text-xs flex-shrink-0 transition-all ${
                            activeDay === day.dayNumber
                              ? 'bg-primary text-white shadow-md'
                              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-850'
                          }`}
                        >
                          Day {day.dayNumber}
                        </button>
                      ))}
                    </div>

                    {/* Active Day detailed timeline card */}
                    <div className="clay-card clay-card-hover p-6 md:p-8 bg-slate-900/60 border border-slate-850">
                      
                      <div className="flex items-center gap-2 mb-6">
                        <span className="w-8 h-8 rounded-lg bg-primary/20 text-primary-light flex items-center justify-center font-extrabold text-sm">
                          {activeDay}
                        </span>
                        <h4 className="text-lg font-bold text-white">
                          {activeItinerary.itinerary[activeDay - 1].theme}
                        </h4>
                      </div>

                      {/* Timeline schedule */}
                      <div className="space-y-6 relative before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-800 z-0">
                        
                        {/* Morning */}
                        <div className="relative pl-8 z-10 text-slate-300">
                          <div className="absolute left-1.5 top-1 w-3.5 h-3.5 rounded-full bg-primary border-4 border-slate-900"></div>
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Morning Activities</span>
                          <p className="text-sm mt-1 leading-relaxed">{activeItinerary.itinerary[activeDay - 1].morning}</p>
                        </div>

                        {/* Afternoon */}
                        <div className="relative pl-8 z-10 text-slate-300">
                          <div className="absolute left-1.5 top-1 w-3.5 h-3.5 rounded-full bg-primary border-4 border-slate-900"></div>
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Afternoon Exploration</span>
                          <p className="text-sm mt-1 leading-relaxed">{activeItinerary.itinerary[activeDay - 1].afternoon}</p>
                        </div>

                        {/* Evening */}
                        <div className="relative pl-8 z-10 text-slate-300">
                          <div className="absolute left-1.5 top-1 w-3.5 h-3.5 rounded-full bg-primary border-4 border-slate-900"></div>
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Evening Relaxation</span>
                          <p className="text-sm mt-1 leading-relaxed">{activeItinerary.itinerary[activeDay - 1].evening}</p>
                        </div>

                      </div>

                      {/* Meals segment */}
                      <div className="mt-8 pt-6 border-t border-slate-800 flex items-start gap-3">
                        <div className="w-9 h-9 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-500 flex-shrink-0">
                          <Utensils className="w-4.5 h-4.5" />
                        </div>
                        <div>
                          <span className="text-[10px] font-bold text-amber-500 uppercase tracking-wide">Day Meals Menu</span>
                          <p className="text-xs text-slate-300 font-bold mt-0.5">{activeItinerary.itinerary[activeDay - 1].meals}</p>
                        </div>
                      </div>

                    </div>

                  </div>

                  {/* Right Column: Widgets */}
                  <div className="lg:col-span-5 space-y-6">
                    
                    {/* Weather card */}
                    <div className="clay-card clay-card-hover p-5 bg-slate-900/60 border border-slate-850 flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-sky-500/15 text-sky-400 flex items-center justify-center text-xl">
                        <CloudSun className="w-6 h-6 animate-pulse" />
                      </div>
                      <div>
                        <span className="text-[10px] font-bold text-sky-400 uppercase tracking-wide">Weather overview</span>
                        <p className="text-xs text-slate-300 font-semibold mt-0.5 leading-snug">{activeItinerary.weather}</p>
                      </div>
                    </div>

                    {/* Hotel Recommendations */}
                    <div className="clay-card clay-card-hover p-6 bg-slate-900/60 border border-slate-850">
                      <h4 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-4 flex items-center gap-1.5">
                        <Hotel className="w-4 h-4 text-primary" />
                        <span>Recommended Hotels</span>
                      </h4>
                      
                      <div className="space-y-4">
                        {activeItinerary.hotels.map((hotel) => (
                          <div 
                            key={hotel.name}
                            className="p-3.5 rounded-2xl bg-slate-950/50 border border-slate-850 flex justify-between items-center gap-4"
                          >
                            <div>
                              <p className="text-xs font-extrabold text-white">{hotel.name}</p>
                              <div className="flex items-center gap-1 text-[10px] text-amber-400 mt-1">
                                <Sparkles className="w-3 h-3 fill-amber-400" />
                                <span>{hotel.rating} stars</span>
                              </div>
                            </div>
                            <span className="text-xs font-bold text-primary-light">{hotel.price}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Packing suggestions */}
                    <div className="clay-card clay-card-hover p-6 bg-slate-900/60 border border-slate-850">
                      <h4 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-4 flex items-center gap-1.5">
                        <Luggage className="w-4 h-4 text-primary" />
                        <span>Packing Suggestions</span>
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {activeItinerary.packing.map((pack) => (
                          <span 
                            key={pack}
                            className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-primary/10 border border-primary/20 text-primary-light"
                          >
                            🎒 {pack}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Expert Tips info box */}
                    <div className="p-4.5 rounded-2xl bg-indigo-950/15 border border-indigo-900/30 text-xs leading-relaxed text-indigo-200">
                      <span className="font-bold text-indigo-300 block mb-1">💡 Smart AI Expert Tips:</span>
                      {activeItinerary.tips}
                    </div>

                  </div>

                </div>

              </motion.div>
            )}

          </div>
        )}

      </div>
    </section>
  )
}
