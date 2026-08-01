import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Mail, Phone, MapPin, Send, AlertCircle, Compass, Instagram, Facebook, Twitter, Youtube } from 'lucide-react'
import { apiClient } from '../store/authStore'

export default function Contact() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [subject, setSubject] = useState('')
  const [message, setMessage] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [successMsg, setSuccessMsg] = useState('')
  const [errorMsg, setErrorMsg] = useState('')

  const handleContactSubmit = async (e) => {
    e.preventDefault()
    if (!name.trim() || !email.trim() || !message.trim()) {
      setErrorMsg("Please fill in your Name, Email, and Message!")
      return
    }

    setSubmitting(true)
    setErrorMsg('')
    setSuccessMsg('')

    try {
      const response = await apiClient.post('/contact', {
        name,
        email,
        subject: subject || 'General Query',
        message
      })
      
      setSuccessMsg(response.data.message || "Thank you! We will reach out to your email shortly.")
      setName('')
      setEmail('')
      setSubject('')
      setMessage('')
    } catch (err) {
      setErrorMsg("Failed to send message. Please verify network connectivity.")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <section id="contact" className="py-24 bg-white dark:bg-[#06020E] relative overflow-hidden">
      
      {/* Decorative Orbs */}
      <div className="neon-glow-circle w-[400px] h-[400px] bg-primary/10 top-1/4 -left-1/4"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl sm:text-5xl font-display font-extrabold text-slate-900 dark:text-white">
            Connect <span className="bg-gradient-to-r from-primary to-purple-500 bg-clip-text text-transparent">With Our Team</span>
          </h2>
          <p className="mt-4 text-slate-600 dark:text-slate-350 font-medium">
            Have questions regarding itineraries or local transport? Drop us a query. Our AI guides and support team are available 24/7.
          </p>
        </div>

        <div className="max-w-4xl mx-auto text-left items-stretch">
          
          {/* Contact Form Panel */}
          <div className="clay-card clay-card-hover p-6 md:p-8 bg-white/80 dark:bg-slate-900/60 h-full flex flex-col justify-between">
            
            <form onSubmit={handleContactSubmit} className="space-y-6">
              
              <h3 className="text-xl font-bold font-display text-slate-950 dark:text-white">
                Submit a Message
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {/* Name */}
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Aravind Sharma"
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100"
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Email Address</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. name@domain.com"
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100"
                  />
                </div>
              </div>

              {/* Subject */}
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Subject</label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="e.g. Custom Corporate Trip Planning"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100"
                />
              </div>

              {/* Message */}
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Message</label>
                <textarea
                  rows={4}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Describe your inquiry..."
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100"
                />
              </div>

              {errorMsg && (
                <p className="text-xs font-semibold text-red-500 bg-red-50 p-3 rounded-xl border border-red-100 flex items-center gap-1.5 dark:bg-red-950/20 dark:border-red-900/30 dark:text-red-400">
                  <AlertCircle className="w-4 h-4" />
                  <span>{errorMsg}</span>
                </p>
              )}

              {successMsg && (
                <p className="text-xs font-semibold text-emerald-600 bg-emerald-50 p-3 rounded-xl border border-emerald-100 flex items-center gap-1.5 dark:bg-emerald-950/20 dark:border-emerald-900/30 dark:text-emerald-400">
                  <Compass className="w-4 h-4 animate-spin text-emerald-500" />
                  <span>{successMsg}</span>
                </p>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="clay-btn-primary w-full py-4 text-sm flex items-center justify-center gap-2"
              >
                <Send className="w-4.5 h-4.5" />
                <span>{submitting ? 'Sending query...' : 'Submit inquiry'}</span>
              </button>

            </form>

          </div>

        </div>

      </div>
    </section>
  )
}
