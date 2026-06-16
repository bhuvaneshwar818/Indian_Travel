import React, { useState, useEffect } from 'react'
import { useTripStore } from '../store/tripStore'
import { useAuthStore } from '../store/authStore'
import { Star, MessageSquare, PlusCircle, Sparkles, MapPin, User } from 'lucide-react'
import { apiClient } from '../store/authStore'
import { motion, AnimatePresence } from 'framer-motion'

export default function Reviews() {
  const { fetchDestinations } = useTripStore()
  const { isAuthenticated } = useAuthStore()

  // Reviews local list state
  const [reviewsList, setReviewsList] = useState([])
  const [loading, setLoading] = useState(false)

  // Review Form state
  const [showForm, setShowForm] = useState(false)
  const [name, setName] = useState('')
  const [location, setLocation] = useState('')
  const [rating, setRating] = useState(5)
  const [comment, setComment] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const loadReviews = async () => {
    setLoading(true)
    try {
      const response = await apiClient.get('/reviews')
      setReviewsList(response.data)
    } catch (err) {
      console.error("Failed to load reviews", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadReviews()
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!name.trim() || !comment.trim()) {
      alert("Please fill in your name and comments!")
      return
    }

    setSubmitting(true)
    try {
      await apiClient.post('/reviews', {
        userName: name,
        location: location || 'India',
        rating,
        comment
      })
      alert("Thank you for your feedback! Review submitted.")
      setName('')
      setLocation('')
      setRating(5)
      setComment('')
      setShowForm(false)
      // Reload reviews
      loadReviews()
    } catch (err) {
      console.error(err)
      alert("Failed to submit review.")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <section id="reviews" className="py-24 bg-white dark:bg-[#06020E] relative overflow-hidden">
      
      {/* Background neon orbs */}
      <div className="neon-glow-circle w-[350px] h-[350px] bg-primary/10 bottom-10 left-10"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6 mb-16">
          <div className="text-left max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-purple-50 text-primary border border-purple-100 mb-4 dark:bg-purple-950/20 dark:text-purple-300 dark:border-purple-900/30">
              <MessageSquare className="w-4.5 h-4.5 text-primary" />
              <span className="text-xs font-bold uppercase tracking-wider">User Testimonials</span>
            </div>
            <h2 className="text-3xl sm:text-5xl font-display font-extrabold text-slate-900 dark:text-white leading-tight">
              What Our <span className="bg-gradient-to-r from-primary to-purple-500 bg-clip-text text-transparent">Travelers Say</span>
            </h2>
          </div>
          
          <button
            onClick={() => setShowForm(!showForm)}
            className="clay-btn-primary px-6 py-3 text-xs flex items-center gap-2"
          >
            <PlusCircle className="w-4.5 h-4.5" />
            <span>Leave a Review</span>
          </button>
        </div>

        {/* Leave Review collapsible form */}
        <AnimatePresence>
          {showForm && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="clay-card p-6 md:p-8 bg-slate-50 dark:bg-slate-900/50 border border-slate-200/60 dark:border-slate-800/40 mb-12 max-w-2xl mx-auto text-left overflow-hidden"
            >
              <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                <Sparkles className="w-4.5 h-4.5 text-primary" />
                <span>Share Your Experience</span>
              </h3>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Full Name</label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Aravind Sharma"
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Location</label>
                    <input
                      type="text"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      placeholder="e.g. Mumbai"
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Star Rating</label>
                    <select
                      value={rating}
                      onChange={(e) => setRating(Number(e.target.value))}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100"
                    >
                      <option value={5}>⭐⭐⭐⭐⭐ (5 Stars)</option>
                      <option value={4}>⭐⭐⭐⭐ (4 Stars)</option>
                      <option value={3}>⭐⭐⭐ (3 Stars)</option>
                      <option value={2}>⭐⭐ (2 Stars)</option>
                      <option value={1}>⭐ (1 Star)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Comment</label>
                    <textarea
                      rows={3}
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      placeholder="Write your review comments here..."
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="clay-btn-primary w-full py-3 text-xs"
                >
                  {submitting ? 'Submitting...' : 'Submit Review'}
                </button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Carousel of Reviews */}
        {loading ? (
          <div className="py-12 flex justify-center">
            <div className="w-8 h-8 rounded-full border-4 border-primary border-t-transparent animate-spin"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
            {reviewsList.map((rev) => (
              <div 
                key={rev.id}
                className="clay-card p-6 md:p-8 bg-white/80 dark:bg-slate-900/60 flex flex-col justify-between hover:-translate-y-1 transition-transform duration-300"
              >
                <div>
                  {/* Star row */}
                  <div className="flex items-center gap-1 text-amber-400 mb-4">
                    {Array.from({ length: rev.rating }).map((_, i) => (
                      <Star key={i} className="w-4.5 h-4.5 fill-amber-400 stroke-amber-400 animate-pulse-glow" />
                    ))}
                  </div>

                  <p className="text-sm text-slate-655 dark:text-slate-300 leading-relaxed font-medium italic mb-6">
                    "{rev.comment}"
                  </p>
                </div>

                {/* User Info footer */}
                <div className="flex items-center gap-3 pt-4 border-t border-slate-200/50 dark:border-slate-800/40">
                  <div className="w-10 h-10 rounded-full overflow-hidden bg-slate-100 flex items-center justify-center text-slate-400 shadow-inner">
                    {rev.userAvatar ? (
                      <img src={rev.userAvatar} alt={rev.userName} className="w-full h-full object-cover" />
                    ) : (
                      <User className="w-5 h-5 text-slate-400" />
                    )}
                  </div>
                  <div>
                    <h4 className="text-sm font-extrabold text-slate-900 dark:text-white leading-none">{rev.userName}</h4>
                    <p className="text-[10px] font-bold text-slate-400 flex items-center gap-0.5 mt-1">
                      <MapPin className="w-3 h-3 text-primary" />
                      <span>{rev.location}</span>
                    </p>
                  </div>
                </div>

              </div>
            ))}
          </div>
        )}

      </div>
    </section>
  )
}
