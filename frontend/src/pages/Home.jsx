import React from 'react'
import Navbar from '../components/Navbar'
import Hero from '../components/Hero'
import SearchDropdowns from '../components/SearchDropdowns'
import PopularDestinations from '../components/PopularDestinations'
import InteractiveMap from '../components/InteractiveMap'
import AITravelPlanner from '../components/AITravelPlanner'
import Features from '../components/Features'
import Reviews from '../components/Reviews'
import FAQ from '../components/FAQ'
import Contact from '../components/Contact'
import Footer from '../components/Footer'

export default function Home() {
  return (
    <div className="relative min-h-screen overflow-x-hidden">
      {/* Sticky Header Navbar */}
      <Navbar />

      {/* Hero Visual Welcome */}
      <Hero />

      {/* Top vacations carousel scroll (Popular Destinations) */}
      <PopularDestinations />

      {/* Interactive SVG India Map */}
      <InteractiveMap />

      {/* Combined Dropdowns + India SVG Map side-by-side split explorer panel */}
      <SearchDropdowns />

      {/* Main AI Travel planning Assistant chatbot */}
      <AITravelPlanner />

      {/* 3D claymorphic Feature items (Personalized AI Feature Assistant Grid) */}
      <Features />

      {/* Infinite scrolling feedback reviews & user form submissions */}
      <Reviews />

      {/* Accordions styled FAQs */}
      <FAQ />

      {/* E2E validated inquiry support form */}
      <Contact />

      {/* Bottom responsive links Footer */}
      <Footer />
    </div>
  )
}
