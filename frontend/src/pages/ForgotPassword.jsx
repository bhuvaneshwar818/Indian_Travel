import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { Compass, Mail, ShieldAlert, KeySquare, Lock, Eye, EyeOff, AlertCircle } from 'lucide-react'

export default function ForgotPassword() {
  const { forgotPassword, resetPassword, loading, error } = useAuthStore()
  
  const [email, setEmail] = useState('')
  const [token, setToken] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  
  const [step, setStep] = useState(1) // Step 1: Send Email, Step 2: Reset Form
  const [clientError, setClientError] = useState('')
  const [successMsg, setSuccessMsg] = useState('')
  
  const navigate = useNavigate()

  const handleRequestReset = async (e) => {
    e.preventDefault()
    if (!email.trim() || !email.includes('@')) {
      setClientError("Please enter a valid email address!")
      return
    }

    setClientError('')
    try {
      const msg = await forgotPassword(email)
      alert(msg)
      setSuccessMsg(msg)
      setStep(2) // proceed to reset form
    } catch (err) {
      console.error(err)
    }
  }

  const handleResetPassword = async (e) => {
    e.preventDefault()
    if (!token.trim() || !newPassword.trim()) {
      setClientError("Please enter both the Token and your New Password!")
      return
    }
    if (newPassword.length < 6) {
      setClientError("Password must be at least 6 characters long!")
      return
    }

    setClientError('')
    try {
      const msg = await resetPassword(token, newPassword)
      alert(msg)
      navigate('/login')
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <div className="min-h-screen bg-white dark:bg-[#06020E] relative overflow-hidden flex flex-col justify-between text-left">
      
      {/* Background Orbs */}
      <div className="neon-glow-circle w-[400px] h-[400px] bg-primary/20 -top-40 -left-40"></div>

      <div className="grid grid-cols-1 lg:grid-cols-12 min-h-screen w-full">
        
        {/* Left Side: Form Container (6 cols) */}
        <div className="lg:col-span-6 flex flex-col justify-center px-4 sm:px-6 lg:px-16 py-12 relative z-10">
          <div className="max-w-md w-full mx-auto">
            
            {/* Logo home */}
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
              
              {step === 1 ? (
                <div>
                  <h2 className="text-2xl font-display font-extrabold text-slate-950 dark:text-white mb-2">Forgot Password</h2>
                  <p className="text-xs text-slate-400 mb-6 font-semibold">Enter email to request a simulated recovery reset token.</p>

                  <form onSubmit={handleRequestReset} className="space-y-5">
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
                          className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 bg-white text-sm font-semibold text-slate-850 focus:outline-none focus:ring-2 focus:ring-primary dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100"
                        />
                      </div>
                    </div>

                    {clientError && (
                      <p className="text-xs font-semibold text-red-500 bg-red-50 p-3 rounded-xl border border-red-100 flex items-center gap-1.5 dark:bg-red-950/20 dark:border-red-900/30 dark:text-red-400">
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
                          <span>Send Recovery Token</span>
                        </>
                      )}
                    </button>

                  </form>
                </div>
              ) : (
                <div>
                  <h2 className="text-2xl font-display font-extrabold text-slate-950 dark:text-white mb-2">Reset Password</h2>
                  <p className="text-xs text-slate-400 mb-6 font-semibold">Verify reset token to establish a new password.</p>

                  <div className="p-4 rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-755 text-xs mb-6 dark:bg-indigo-950/20 dark:border-indigo-900/30 dark:text-indigo-200">
                    Check your **email inbox** to copy the 8-character password reset token key!
                  </div>

                  <form onSubmit={handleResetPassword} className="space-y-5">
                    
                    {/* Reset token */}
                    <div>
                      <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Reset Token</label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                          <KeySquare className="w-4.5 h-4.5" />
                        </div>
                        <input
                          type="text"
                          value={token}
                          onChange={(e) => setToken(e.target.value)}
                          placeholder="e.g. F84D2B1E"
                          className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 bg-white text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100"
                        />
                      </div>
                    </div>

                    {/* New Password */}
                    <div>
                      <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">New Password</label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                          <Lock className="w-4.5 h-4.5" />
                        </div>
                        <input
                          type={showPassword ? "text" : "password"}
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
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

                    {clientError && (
                      <p className="text-xs font-semibold text-red-500 bg-red-50 p-3 rounded-xl border border-red-100 flex items-center gap-1.5 dark:bg-red-950/20 dark:border-red-900/30 dark:text-red-400">
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
                          <KeySquare className="w-4.5 h-4.5" />
                          <span>Establish Password</span>
                        </>
                      )}
                    </button>

                  </form>
                </div>
              )}

              <p className="mt-8 text-center text-xs font-semibold text-slate-400">
                Back to{' '}
                <Link to="/login" className="font-extrabold text-primary hover:underline">Log In</Link>
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
              src="/assets/images/Forgot_password.gif" 
              alt="Forgot Password Illustration" 
              className="w-full h-auto object-contain rounded-2xl drop-shadow-2xl pointer-events-none"
            />
          </div>

        </div>

      </div>
    </div>
  )
}
