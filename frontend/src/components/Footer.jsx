import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Compass, Mail, Heart, Sparkles, Send, MapPin } from 'lucide-react'

export default function Footer() {
  const [email, setEmail] = useState('')
  const [subscribed, setSubscribed] = useState(false)
  const navigate = useNavigate()

  const handleSubscribe = (e) => {
    e.preventDefault()
    if (!email.trim() || !email.includes('@')) {
      alert("Please enter a valid email address!")
      return
    }
    setSubscribed(true)
    setEmail('')
    alert("Thank you! You are now subscribed to our newsletter.")
  }

  const handleScrollToSection = (sectionId) => {
    navigate('/')
    setTimeout(() => {
      const el = document.getElementById(sectionId)
      if (el) el.scrollIntoView({ behavior: 'smooth' })
    }, 100)
  }

  return (
    <footer className="relative pt-20 pb-10 bg-slate-50 border-t border-slate-200/60 dark:bg-[#06020E] dark:border-slate-800/40 overflow-hidden">
      
      {/* Decorative Orbs */}
      <div className="neon-glow-circle w-[350px] h-[350px] bg-primary/5 -bottom-20 -right-20"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-left">
        
        {/* Main 4-column layout */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 pb-12 border-b border-slate-200/60 dark:border-slate-800/40">
          
          {/* Logo & Desc (4 cols) */}
          <div className="md:col-span-4 space-y-5">
            <Link to="/" className="flex items-center gap-2 group w-fit">
              <div className="w-9 h-9 rounded-lg bg-gradient-to-tr from-primary to-primary-light flex items-center justify-center shadow-md">
                <Compass className="w-4.5 h-4.5 text-white" />
              </div>
              <span className="font-display font-extrabold text-lg tracking-tight bg-gradient-to-r from-primary to-primary-light bg-clip-text text-transparent dark:from-purple-300 dark:to-white">
                Indian Travel <span className="text-primary dark:text-purple-400">AI</span>
              </span>
            </Link>
            <p className="text-sm text-slate-500 dark:text-slate-450 leading-relaxed font-medium">
              We leverage state-of-the-art AI systems to formulate rich, hyper-personalized, E2E-cost-calculated daily itineraries to discover the ancient magic, scenic peaks, and beaches of India.
            </p>
          </div>

          {/* Quick Links (2 cols) */}
          <div className="md:col-span-2 space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Quick Links</h4>
            <div className="flex flex-col gap-2.5">
              <button onClick={() => handleScrollToSection('ai-planner')} className="text-sm font-semibold text-slate-600 hover:text-primary dark:text-slate-400 dark:hover:text-purple-400 w-fit">AI Planner</button>
              <button onClick={() => handleScrollToSection('explore')} className="text-sm font-semibold text-slate-600 hover:text-primary dark:text-slate-400 dark:hover:text-purple-400 w-fit">Interactive Map</button>
              <button onClick={() => handleScrollToSection('destinations')} className="text-sm font-semibold text-slate-600 hover:text-primary dark:text-slate-400 dark:hover:text-purple-400 w-fit">Explore Spots</button>
              <button onClick={() => handleScrollToSection('reviews')} className="text-sm font-semibold text-slate-600 hover:text-primary dark:text-slate-400 dark:hover:text-purple-400 w-fit">Reviews</button>
              <button onClick={() => handleScrollToSection('contact')} className="text-sm font-semibold text-slate-600 hover:text-primary dark:text-slate-400 dark:hover:text-purple-400 w-fit">Contact Support</button>
            </div>
          </div>

          {/* Travel categories (3 cols) */}
          <div className="md:col-span-3 space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Travel Categories</h4>
            <div className="flex flex-col gap-2.5">
              <button onClick={() => handleScrollToSection('destinations')} className="text-sm font-semibold text-slate-600 hover:text-primary dark:text-slate-400 dark:hover:text-purple-400 w-fit">Beach Escapes</button>
              <button onClick={() => handleScrollToSection('destinations')} className="text-sm font-semibold text-slate-600 hover:text-primary dark:text-slate-400 dark:hover:text-purple-400 w-fit">Spiritual Temples</button>
              <button onClick={() => handleScrollToSection('explore')} className="text-sm font-semibold text-slate-600 hover:text-primary dark:text-slate-400 dark:hover:text-purple-400 w-fit">Eco Adventures</button>
              <button onClick={() => handleScrollToSection('destinations')} className="text-sm font-semibold text-slate-600 hover:text-primary dark:text-slate-400 dark:hover:text-purple-400 w-fit">Culinary Food Tours</button>
              <button onClick={() => handleScrollToSection('destinations')} className="text-sm font-semibold text-slate-600 hover:text-primary dark:text-slate-400 dark:hover:text-purple-400 w-fit">Heritage Fort Ruins</button>
            </div>
          </div>

          {/* Newsletter (3 cols) */}
          <div className="md:col-span-3 space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-primary" />
              <span>Newsletter Signup</span>
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-450 leading-relaxed font-semibold">
              Subscribe to unlock weekly curated travel itineraries, local food insights, and seasonal deal notifications.
            </p>
            
            <form onSubmit={handleSubscribe} className="flex gap-2">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="email@address.com"
                className="flex-grow px-3 py-2 rounded-xl text-xs border border-slate-200 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100"
              />
              <button
                type="submit"
                className="w-10 h-10 rounded-xl bg-primary hover:bg-primary-dark text-white flex items-center justify-center shadow-md transition-transform active:scale-95 flex-shrink-0"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>

        </div>

        {/* Footer bottom metadata */}
        <div className="pt-8 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs font-semibold text-slate-405 dark:text-slate-500">
          <p>© 2026 Indian Travel AI. Developed for travelers globally.</p>
          <p className="flex items-center gap-1.5">
            <span>Made with</span>
            <Heart className="w-3.5 h-3.5 text-red-500 fill-red-500 animate-pulse" />
            <span>for Incredible India</span>
          </p>
        </div>

      </div>
    </footer>
  )
}
