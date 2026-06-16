import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { HelpCircle, ChevronDown, ChevronUp } from 'lucide-react'

const FAQ_LIST = [
  {
    question: "How does the AI trip planning work?",
    answer: "Our advanced travel planner uses smart heuristic location models matching your selected state, category, budget level, and duration. It queries our backend Spring Boot engine to output a complete daily schedule, packing guides, recommended local dishes, and specific hotels tailored exactly to your criteria in seconds!"
  },
  {
    question: "Is this platform completely free to use?",
    answer: "Yes, exploring destinations, using the interactive SVG map, and generating active AI itineraries is completely free! You simply need to create a secure account to save itineraries to your custom dashboard."
  },
  {
    question: "Can I customize the generated itineraries?",
    answer: "Absolutely! Every itinerary generated is saved to your account. You can generate multiple variations with different budget levels or categories (e.g. Beaches vs Food) to mix, match, and construct your perfect dream vacation."
  },
  {
    question: "How does the Interactive Map search work?",
    answer: "Our interactive SVG India map contains built-in coordinates for high-traffic tourism states. Simply hover over Ladakh, Goa, Kerala, Rajasthan, Varanasi, Hampi, or Ooty to outline them in glowing neon highlights, click on them to slide out local guides, and press 'Create AI Itinerary' to auto-load them into the planner wizard!"
  }
]

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState(null)

  const toggleAccordion = (index) => {
    setOpenIndex(openIndex === index ? null : index)
  }

  return (
    <section id="reviews-faq" className="py-24 bg-slate-50 dark:bg-[#0A0516] relative overflow-hidden">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-left">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-purple-50 text-primary border border-purple-100 mb-4 dark:bg-purple-950/20 dark:text-purple-300 dark:border-purple-900/30">
            <HelpCircle className="w-4.5 h-4.5 text-primary" />
            <span className="text-xs font-bold uppercase tracking-wider">Common Questions</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-display font-extrabold text-slate-900 dark:text-white text-center">
            Frequently Asked <span className="bg-gradient-to-r from-primary to-purple-500 bg-clip-text text-transparent">Questions</span>
          </h2>
        </div>

        {/* Accordions */}
        <div className="space-y-4">
          {FAQ_LIST.map((faq, index) => {
            const isOpen = openIndex === index
            return (
              <div 
                key={index} 
                className="clay-card border bg-white/80 dark:bg-slate-900/60 overflow-hidden transition-all duration-300"
              >
                {/* Header click */}
                <button
                  onClick={() => toggleAccordion(index)}
                  className="w-full px-6 py-5 flex justify-between items-center text-left focus:outline-none"
                >
                  <span className="font-display font-extrabold text-slate-900 dark:text-white sm:text-lg pr-4">
                    {faq.question}
                  </span>
                  <div className={`w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center text-primary flex-shrink-0 transition-transform duration-300 dark:bg-purple-950/40 dark:text-purple-300 ${
                    isOpen ? 'rotate-180' : ''
                  }`}>
                    <ChevronDown className="w-4 h-4" />
                  </div>
                </button>

                {/* Body text collapsible */}
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25, ease: 'easeInOut' }}
                    >
                      <div className="px-6 pb-6 text-sm text-slate-655 dark:text-slate-350 leading-relaxed font-medium border-t border-slate-100/50 pt-4 dark:border-slate-800/40">
                        {faq.answer}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )
          })}
        </div>

      </div>
    </section>
  )
}
