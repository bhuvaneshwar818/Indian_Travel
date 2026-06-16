import React, { useRef } from 'react'
import { ChevronLeft, ChevronRight, Star, Plus, Check, MapPin, Sparkles } from 'lucide-react'
import { useTripStore } from '../store/tripStore'
import { useAuthStore } from '../store/authStore'

const POPULAR_LIST = [
  { id: 1, name: "Goa Beaches", state: "Goa", rating: 4.8, img: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=500", tag: "Beaches", desc: "Tropical shores and glowing shacks." },
  { id: 2, name: "Leh Ladakh", state: "Ladakh", rating: 4.9, img: "https://images.unsplash.com/photo-1581793745862-99f57567af25?w=500", tag: "Adventure", desc: "High alpine lakes and cold passes." },
  { id: 3, name: "Pink City Jaipur", state: "Rajasthan", rating: 4.8, img: "https://images.unsplash.com/photo-1477584322811-591f423758b7?w=500", tag: "Historical", desc: "Royal fortresses and palaces." },
  { id: 4, name: "Varanasi Ganges", state: "Uttar Pradesh", rating: 4.9, img: "https://images.unsplash.com/photo-1561361513-2d000a50f0db?w=500", tag: "Temples", desc: "Sacred ghats and evening aarti." },
  { id: 5, name: "Alleppey Houseboats", state: "Kerala", rating: 4.9, img: "https://images.unsplash.com/photo-1593693397690-362cb9666fc2?w=500", tag: "Beaches", desc: "Houseboat cruises and canals." },
  { id: 6, name: "Hampi Ruins", state: "Karnataka", rating: 4.7, img: "https://images.unsplash.com/photo-1600100397608-f010f423b971?w=500", tag: "Historical", desc: " UNESCO Vijayanagara ruins." },
  { id: 7, name: "Kashmir Valley", state: "Kashmir", rating: 5.0, img: "https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?w=500", tag: "Adventure", desc: "Shikara rides and snowy hills." },
  { id: 8, name: "Rishikesh Hills", state: "Uttarakhand", rating: 4.8, img: "https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=500", tag: "Adventure", desc: "Yoga retreats and river rafting." },
  { id: 9, name: "Ooty Gardens", state: "Tamil Nadu", rating: 4.7, img: "https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?w=500", tag: "Adventure", desc: "Tea valleys and toy trains." },
  { id: 10, name: "Biryani Tour", state: "Hyderabad", rating: 4.8, img: "https://images.unsplash.com/photo-1608957541552-87052c3d80d2?w=500", tag: "Food", desc: "Charminar tours and Nizami kebabs." }
]

export default function PopularDestinations() {
  const scrollRef = useRef(null)
  const { bookmarks, addBookmark, removeBookmark } = useTripStore()
  const { isAuthenticated } = useAuthStore()

  const scroll = (direction) => {
    if (scrollRef.current) {
      const { scrollLeft, clientWidth } = scrollRef.current
      const scrollTo = direction === 'left' 
        ? scrollLeft - clientWidth * 0.7 
        : scrollLeft + clientWidth * 0.7
      scrollRef.current.scrollTo({ left: scrollTo, behavior: 'smooth' })
    }
  }

  const isBookmarked = (name) => {
    return bookmarks.some((b) => b.name === name || b.destination?.name === name)
  }

  const handleBookmark = (item) => {
    if (!isAuthenticated) {
      alert("Please log in to save destinations to your wishlist!")
      return
    }
    // Toggle simulated favorite bookmark
    if (isBookmarked(item.name)) {
      alert(`Removed "${item.name}" from your travel wishlist!`)
    } else {
      alert(`Added "${item.name}" to your travel wishlist!`)
    }
  }

  const triggerStateSelection = (stateName) => {
    const mapSection = document.getElementById('destinations')
    if (mapSection) {
      mapSection.scrollIntoView({ behavior: 'smooth' })
      setTimeout(() => {
        const stateSelect = document.getElementById('state-selector-input')
        if (stateSelect) {
          stateSelect.value = stateName
          stateSelect.dispatchEvent(new Event('change', { bubbles: true }))
        }
      }, 300)
    }
  }

  return (
    <section id="destinations-carousel" className="py-24 bg-white dark:bg-[#06020E] relative overflow-hidden">
      
      {/* Background neon orbs */}
      <div className="neon-glow-circle w-[400px] h-[400px] bg-primary/10 bottom-0 left-0"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Carousel Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6 mb-12">
          <div className="text-left max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-purple-50 text-primary border border-purple-100 mb-4 dark:bg-purple-950/20 dark:text-purple-300 dark:border-purple-900/30">
              <Sparkles className="w-4 h-4 text-primary animate-pulse-glow" />
              <span className="text-xs font-bold uppercase tracking-wider">Top Rated Vacations</span>
            </div>
            <h2 className="text-3xl sm:text-5xl font-display font-extrabold text-slate-900 dark:text-white leading-tight">
              Popular <span className="bg-gradient-to-r from-primary to-purple-500 bg-clip-text text-transparent">Destinations</span>
            </h2>
          </div>
          
          {/* Scroll Nav buttons */}
          <div className="flex gap-3">
            <button
              onClick={() => scroll('left')}
              className="w-12 h-12 rounded-2xl flex items-center justify-center border border-slate-200 bg-white/70 text-slate-700 shadow-sm transition-transform hover:-translate-y-0.5 active:translate-y-0 dark:border-slate-800 dark:bg-slate-900/50 dark:text-slate-200"
              aria-label="Scroll Left"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={() => scroll('right')}
              className="w-12 h-12 rounded-2xl flex items-center justify-center border border-slate-200 bg-white/70 text-slate-700 shadow-sm transition-transform hover:-translate-y-0.5 active:translate-y-0 dark:border-slate-800 dark:bg-slate-900/50 dark:text-slate-200"
              aria-label="Scroll Right"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Horizontal Scroll Box */}
        <div 
          ref={scrollRef}
          className="flex gap-8 overflow-x-auto pb-10 scrollbar-none snap-x snap-mandatory touch-pan-x"
          style={{ scrollbarWidth: 'none' }}
        >
          {POPULAR_LIST.map((item) => (
            <div 
              key={item.id}
              className="flex-shrink-0 w-[290px] sm:w-[320px] snap-start"
            >
              <div className="clay-card overflow-hidden h-[420px] flex flex-col justify-between group bg-white/80 hover:-translate-y-1.5 transition-transform duration-300 dark:bg-slate-900/60">
                
                {/* Image */}
                <div className="relative h-56 w-full overflow-hidden shadow-inner">
                  <img 
                    src={item.img} 
                    alt={item.name} 
                    className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/55 to-transparent"></div>
                  
                  {/* Category badge & wishlist circular Plus icon top right */}
                  <div className="absolute top-4 left-4 right-4 flex justify-between items-center">
                    <span className="px-3 py-1 rounded-lg bg-primary text-white text-xs font-bold uppercase shadow-sm">
                      {item.tag}
                    </span>
                    <button
                      onClick={() => handleBookmark(item)}
                      className={`w-9 h-9 rounded-full flex items-center justify-center shadow-md transition-all active:scale-90 ${
                        isBookmarked(item.name)
                          ? 'bg-emerald-500 border border-emerald-400 text-white'
                          : 'bg-white/95 border border-slate-200/80 text-slate-850 hover:bg-slate-50 dark:bg-slate-900/95 dark:border-slate-800 dark:text-slate-200 dark:hover:bg-slate-800'
                      }`}
                      title={isBookmarked(item.name) ? "Remove from Wishlist" : "Add to Wishlist"}
                    >
                      {isBookmarked(item.name) ? <Check className="w-4 h-4 stroke-[2.5]" /> : <Plus className="w-4 h-4 stroke-[2.5]" />}
                    </button>
                  </div>

                  <div className="absolute bottom-4 left-4 flex items-center gap-1 bg-white/95 px-2 py-1 rounded-lg text-slate-850 text-xs font-extrabold shadow-sm">
                    <Star className="w-3.5 h-3.5 fill-amber-400 stroke-amber-400" />
                    <span>{item.rating}</span>
                  </div>
                </div>

                {/* Body Details */}
                <div className="p-5 flex-grow text-left flex flex-col justify-between">
                  <div>
                    <h3 className="text-lg font-display font-extrabold text-slate-900 dark:text-white flex items-center gap-1">
                      <MapPin className="w-4 h-4 text-primary" />
                      <span>{item.name}</span>
                    </h3>
                    <p className="text-[10px] font-bold text-slate-400 mt-0.5 tracking-wider uppercase">{item.state}, India</p>
                    <p className="mt-2 text-xs font-semibold text-slate-500 dark:text-slate-400">{item.desc}</p>
                  </div>

                  <button
                    onClick={() => triggerStateSelection(item.state)}
                    className="w-full py-2.5 mt-4 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-bold text-primary flex items-center justify-center gap-1.5 dark:border-slate-800 dark:bg-slate-950 dark:hover:bg-slate-900"
                  >
                    <span>Explore State details</span>
                  </button>
                </div>

              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  )
}
