import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { Compass, Mail, Lock, Eye, EyeOff, LogIn, AlertCircle, Chrome, ArrowLeft } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

export default function Login() {
  const { login, signInWithGoogle, loading, error } = useAuthStore()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const [clientError, setClientError] = useState('')
  
  const navigate = useNavigate()

  const handleLoginSubmit = async (e) => {
    e.preventDefault()
    if (!username.trim() || !password.trim()) {
      setClientError("Please enter both Username and Password!")
      return
    }

    setClientError('')
    try {
      await login(username, password)
      alert("Welcome back! Login successful.")
      navigate('/dashboard')
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <div className="min-h-screen bg-white dark:bg-[#06020E] relative overflow-hidden flex flex-col justify-between">
      
      {/* Back to Home Button */}
      <Link 
        to="/" 
        className="absolute top-6 left-6 z-30 flex items-center gap-2 px-4.5 py-2.5 rounded-xl border border-slate-200/60 bg-white/70 backdrop-blur-md hover:bg-slate-50 text-xs font-bold text-slate-700 shadow-sm transition-all duration-300 dark:border-slate-800/60 dark:bg-slate-950/70 dark:text-slate-200 dark:hover:bg-slate-900 group"
      >
        <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
        <span>Back to Home</span>
      </Link>

      {/* Glow Orbs */}
      <div className="neon-glow-circle w-[400px] h-[400px] bg-primary/20 -top-40 -left-40"></div>

      <div className="grid grid-cols-1 lg:grid-cols-12 min-h-screen w-full">
        
        {/* Left Side: Form Container (6 cols) */}
        <div className="lg:col-span-6 flex flex-col justify-center px-4 sm:px-6 lg:px-16 py-12 relative z-10">
          <div className="max-w-md w-full mx-auto pt-10 lg:pt-0">
            
            {/* Logo home link */}
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
              <h2 className="text-2xl font-display font-extrabold text-slate-950 dark:text-white mb-2">Welcome Back</h2>
              <p className="text-xs text-slate-400 mb-6 font-semibold">Enter your credentials to unlock your AI itineraries.</p>

              <form onSubmit={handleLoginSubmit} className="space-y-5">
                
                {/* Username */}
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Username or Email</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Mail className="w-4 h-4" />
                    </div>
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="e.g. testuser"
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 bg-white text-sm font-semibold text-slate-855 focus:outline-none focus:ring-2 focus:ring-primary dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100"
                    />
                  </div>
                </div>

                {/* Password */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider">Password</label>
                    <Link to="/forgot-password" className="text-xs font-bold text-primary hover:underline">Forgot password?</Link>
                  </div>
                  
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Lock className="w-4 h-4" />
                    </div>
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-10 pr-10 py-3 rounded-xl border border-slate-200 bg-white text-sm font-semibold text-slate-855 focus:outline-none focus:ring-2 focus:ring-primary dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-655"
                    >
                      {showPassword ? <EyeOff className="w-4.5 h-4.5" /> : <Eye className="w-4.5 h-4.5" />}
                    </button>
                  </div>
                </div>

                {/* Remember Me / Forgot username */}
                <div className="flex justify-between items-center text-xs">
                  <label className="flex items-center gap-2 font-semibold text-slate-600 dark:text-slate-350 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="w-4 h-4 rounded text-primary focus:ring-primary cursor-pointer accent-primary"
                    />
                    <span>Remember me</span>
                  </label>
                  <Link to="/forgot-username" className="font-bold text-primary hover:underline">Forgot username?</Link>
                </div>

                {clientError && (
                  <p className="text-xs font-semibold text-red-500 bg-red-50 p-3 rounded-xl border border-red-100 flex items-center gap-1.5 dark:bg-red-950/20 dark:border-red-900/30 dark:text-red-450">
                    <AlertCircle className="w-4 h-4" />
                    <span>{clientError}</span>
                  </p>
                )}

                {error && (
                  <p className="text-xs font-semibold text-red-500 bg-red-50 p-3 rounded-xl border border-red-100 flex items-center gap-1.5 dark:bg-red-950/20 dark:border-red-900/30 dark:text-red-455">
                    <AlertCircle className="w-4 h-4" />
                    <span>{error}</span>
                  </p>
                )}

                {/* Action buttons */}
                <button
                  type="submit"
                  disabled={loading}
                  className="clay-btn-primary w-full py-3.5 text-sm flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <div className="w-5 h-5 rounded-full border-2 border-white border-t-transparent animate-spin"></div>
                  ) : (
                    <>
                      <LogIn className="w-4.5 h-4.5" />
                      <span>Log In</span>
                    </>
                  )}
                </button>

                {/* Google OAuth visual */}
                <button
                  type="button"
                  onClick={async () => {
                    try {
                      await signInWithGoogle();
                    } catch (err) {
                      console.error("Google SSO error:", err);
                    }
                  }}
                  className="w-full py-3 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-bold text-slate-700 flex items-center justify-center gap-2 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300 dark:hover:bg-slate-900"
                >
                  <Chrome className="w-4.5 h-4.5 text-primary" />
                  <span>Login with Google</span>
                </button>

              </form>

              {/* Signup anchor */}
              <p className="mt-8 text-center text-xs font-semibold text-slate-400">
                Don't have a travel account?{' '}
                <Link to="/signup" className="font-extrabold text-primary hover:underline">Sign Up</Link>
              </p>

            </div>

          </div>
        </div>

        {/* Right Side: Image Container (6 cols) - Symmetrical Curly Wave divider (NO solid border) */}
        <div className="hidden lg:flex lg:col-span-6 items-center justify-center relative overflow-hidden bg-[#FAFAFA] dark:bg-[#0C071A] select-none">
          
          {/* Beautiful Curly Wave SVG Divider on the left edge */}
          <svg 
            className="absolute top-0 bottom-0 left-0 w-24 h-full text-white dark:text-[#06020E] fill-current z-20 pointer-events-none transform -translate-x-[1px]" 
            viewBox="0 0 100 100" 
            preserveAspectRatio="none"
          >
            <path d="M0,0 L100,0 C75,5 75,15 100,20 C75,25 75,35 100,40 C75,45 75,55 100,60 C75,65 75,75 100,80 C75,85 75,95 100,100 L0,100 Z" />
          </svg>

          {/* High clarity GIF centered without stretch distortion */}
          <div className="relative z-10 max-w-[85%] max-h-[85%] flex items-center justify-center">
            <img 
              src="/assets/images/login.gif" 
              alt="Login Animation" 
              className="w-full h-auto object-contain rounded-2xl drop-shadow-2xl pointer-events-none"
            />
          </div>

        </div>

      </div>
    </div>
  )
}
