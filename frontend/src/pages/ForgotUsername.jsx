import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { Compass, Mail, Info, AlertCircle, ShieldAlert } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

export default function ForgotUsername() {
  const { forgotUsername, loading, error } = useAuthStore()
  const [email, setEmail] = useState('')
  const [clientError, setClientError] = useState('')
  const [success, setSuccess] = useState(false)
  
  const navigate = useNavigate()

  const handleForgotUsernameSubmit = async (e) => {
    e.preventDefault()
    if (!email.trim() || !email.includes('@')) {
      setClientError("Please enter a valid email address!")
      return
    }

    setClientError('')
    try {
      const msg = await forgotUsername(email)
      alert(msg)
      setSuccess(true)
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <div className="min-h-screen bg-white dark:bg-[#06020E] relative overflow-hidden flex flex-col justify-between text-left">
      
      {/* Background Orbs */}
      <div className="neon-glow-circle w-[400px] h-[400px] bg-primary/20 -top-40 -left-40"></div>

      <div className="grid grid-cols-1 lg:grid-cols-12 min-h-screen w-full">
        
        {/* Left Side: Image Container (6 cols) - Curly wave and crisp GIF centering (NO solid border) */}
        <div className="hidden lg:flex lg:col-span-6 items-center justify-center relative overflow-hidden bg-[#FAFAFA] dark:bg-[#0C071A] select-none">
          
          {/* Beautiful Curly Wave SVG Divider on the right edge */}
          <svg 
            className="absolute top-0 bottom-0 right-0 w-24 h-full text-white dark:text-[#06020E] fill-current z-20 pointer-events-none transform translate-x-[1px]" 
            viewBox="0 0 100 100" 
            preserveAspectRatio="none"
          >
            <path d="M100,0 L0,0 C25,5 25,15 0,20 C25,25 25,35 0,40 C25,45 25,55 0,60 C25,65 25,75 0,80 C25,85 25,95 0,100 L100,100 Z" />
          </svg>

          {/* Centered crisp image without stretch blur */}
          <div className="relative z-10 max-w-[85%] max-h-[85%] flex items-center justify-center">
            <img 
              src="/assets/images/Forgot_username.gif" 
              alt="Forgot Username Illustration" 
              className="w-full h-auto object-contain rounded-2xl drop-shadow-2xl pointer-events-none"
            />
          </div>
        </div>

        {/* Right Side: Form Container (6 cols) */}
        <div className="lg:col-span-6 flex flex-col justify-center px-4 sm:px-6 lg:px-16 py-12 relative z-10">
          <div className="max-w-md w-full mx-auto">
            
            {/* Logo home Link */}
            <div className="flex justify-start mb-6">
              <Link to="/" className="flex items-center gap-2 group">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-primary to-primary-light flex items-center justify-center shadow-md shadow-primary/20">
                  <Compass className="w-5 h-5 text-white" />
                </div>
                <span className="font-display font-extrabold text-xl tracking-tight bg-gradient-to-r from-primary to-primary-light bg-clip-text text-transparent dark:from-purple-300 dark:to-white">
                  Indian Travel <span className="text-primary dark:text-purple-400">AI</span>
                </span>
              </Link>
            </div>

            {/* Card Form */}
            <div className="clay-card p-6 sm:p-8 bg-white/80 dark:bg-slate-900/60 shadow-xl border border-slate-200/50 dark:border-slate-800/40">
              
              <AnimatePresence mode="wait">
                {!success ? (
                  <motion.div
                    key="forgot-username-form"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3 }}
                  >
                    <h2 className="text-2xl font-display font-extrabold text-slate-950 dark:text-white mb-2">Recover Username</h2>
                    <p className="text-xs text-slate-400 mb-6 font-semibold">Enter registered email to discover your username.</p>

                    <form onSubmit={handleForgotUsernameSubmit} className="space-y-5">
                      <div>
                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Email Address</label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                            <Mail className="w-4.5 h-4.5" />
                          </div>
                          <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="name@domain.com"
                            className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 bg-white text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100"
                          />
                        </div>
                      </div>

                      {clientError && (
                        <p className="text-xs font-semibold text-red-500 bg-red-50 p-3 rounded-xl border border-red-100 flex items-center gap-1.5 dark:bg-red-950/20 dark:border-red-900/30 dark:text-red-405">
                          <AlertCircle className="w-4.5 h-4.5" />
                          <span>{clientError}</span>
                        </p>
                      )}

                      {error && (
                        <p className="text-xs font-semibold text-red-500 bg-red-50 p-3 rounded-xl border border-red-100 flex items-center gap-1.5 dark:bg-red-950/20 dark:border-red-900/30 dark:text-red-405">
                          <AlertCircle className="w-4.5 h-4.5" />
                          <span>{error}</span>
                        </p>
                      )}

                      <button
                        type="submit"
                        disabled={loading}
                        className="clay-btn-primary w-full py-3.5 text-sm flex items-center justify-center gap-2"
                      >
                        {loading ? (
                          <div className="w-5 h-5 rounded-full border-2 border-white border-t-transparent animate-spin"></div>
                        ) : (
                          <>
                            <ShieldAlert className="w-4.5 h-4.5" />
                            <span>Request Username Recovery</span>
                          </>
                        )}
                      </button>

                    </form>
                  </motion.div>
                ) : (
                  <motion.div
                    key="forgot-username-success"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-6"
                  >
                    <h2 className="text-2xl font-display font-extrabold text-slate-950 dark:text-white">Request Dispatched</h2>
                    <p className="text-sm text-slate-600 dark:text-slate-350 leading-relaxed font-semibold">
                      An email carrying your registered username has been dispatched to <strong className="text-primary">{email}</strong>.
                    </p>
                    
                    <div className="p-4 rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-755 text-xs dark:bg-indigo-950/20 dark:border-indigo-900/30 dark:text-indigo-200">
                      <span className="font-bold flex items-center gap-1 mb-1.5 uppercase text-[10px]">
                        <Info className="w-3.5 h-3.5 text-primary" />
                        <span>Check your inbox</span>
                      </span>
                      We sent your registered username details directly to your email address!
                    </div>

                    <button
                      onClick={() => navigate('/login')}
                      className="clay-btn-primary w-full py-3 text-xs"
                    >
                      Go to Log In
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>

              <p className="mt-8 text-center text-xs font-semibold text-slate-400">
                Back to{' '}
                <Link to="/login" className="font-extrabold text-primary hover:underline">Log In</Link>
              </p>

            </div>

          </div>
        </div>

      </div>
    </div>
  )
}
