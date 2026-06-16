import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { apiClient, useAuthStore } from '../store/authStore'
import { Compass, User, Mail, Lock, Eye, EyeOff, ShieldCheck, AlertCircle, KeySquare, Check, ArrowLeft, Clock, Calendar, RefreshCw, Chrome } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

export default function Signup() {
  const navigate = useNavigate()
  const { signInWithGoogle } = useAuthStore()

  // Form Step
  const [step, setStep] = useState(1) // 1: Personal Info, 2: Account Setup

  // Form Fields - Step 1
  const [fullName, setFullName] = useState('')
  const [age, setAge] = useState('')
  const [gender, setGender] = useState('')
  const [email, setEmail] = useState('')

  // Form Fields - Step 2
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  // OTP Verification States
  const [otpCode, setOtpCode] = useState('')
  const [isSendingOtp, setIsSendingOtp] = useState(false)
  const [isOtpSent, setIsOtpSent] = useState(false)
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false)
  const [isEmailVerified, setIsEmailVerified] = useState(false)
  const [resendTimer, setResendTimer] = useState(0)
  const [expiryTimer, setExpiryTimer] = useState(0)

  // Real-time Username Checking States
  const [isCheckingUsername, setIsCheckingUsername] = useState(false)
  const [usernameAvailable, setUsernameAvailable] = useState(null) // null, true, false

  // Global Toast System State
  const [toasts, setToasts] = useState([])
  const [isRegistering, setIsRegistering] = useState(false)

  const addToast = (type, message) => {
    const id = Date.now()
    setToasts((prev) => [...prev, { id, type, message }])
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
    }, 4000)
  }

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }

  // Countdowns Effect
  useEffect(() => {
    let interval = null
    if (resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((prev) => prev - 1)
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [resendTimer])

  useEffect(() => {
    let interval = null
    if (expiryTimer > 0) {
      interval = setInterval(() => {
        setExpiryTimer((prev) => prev - 1)
      }, 1000)
    } else if (expiryTimer === 0 && isOtpSent && !isEmailVerified) {
      addToast('error', 'OTP code expired! Please request a new one.')
    }
    return () => clearInterval(interval)
  }, [expiryTimer, isOtpSent, isEmailVerified])

  // Debounced Username Availability Checking
  useEffect(() => {
    if (!username.trim()) {
      setUsernameAvailable(null)
      return
    }

    const delayDebounce = setTimeout(async () => {
      setIsCheckingUsername(true)
      try {
        const response = await apiClient.get(`/auth/signup/username/check?username=${username}`)
        setUsernameAvailable(response.data.available)
        if (response.data.available) {
          addToast('success', 'Username available')
        } else {
          addToast('error', 'Username already exists')
        }
      } catch (err) {
        console.error(err)
      } finally {
        setIsCheckingUsername(false)
      }
    }, 500)

    return () => clearTimeout(delayDebounce)
  }, [username])

  // Send OTP handler
  const handleSendOtp = async () => {
    if (!email.trim() || !email.includes('@')) {
      addToast('warning', 'Please enter a valid email address!')
      return
    }
    setIsSendingOtp(true)
    addToast('info', 'Sending OTP to email...')
    try {
      const response = await apiClient.post('/auth/signup/otp/send', { email })
      setIsOtpSent(true)
      setResendTimer(60)
      setExpiryTimer(300) // 5 minutes
      addToast('success', response.data.message || 'OTP sent successfully!')
    } catch (err) {
      const errMsg = err.response?.data?.error || 'Failed to send OTP.'
      addToast('error', errMsg)
    } finally {
      setIsSendingOtp(false)
    }
  }

  // Verify OTP handler
  const handleVerifyOtp = async () => {
    if (!otpCode.trim() || otpCode.length < 6) {
      addToast('warning', 'Please enter a 6-digit OTP code.')
      return
    }
    setIsVerifyingOtp(true)
    try {
      const response = await apiClient.post('/auth/signup/otp/verify', { email, code: otpCode })
      setIsEmailVerified(true)
      addToast('success', 'OTP verified successfully!')
      // Auto-advance to step 2 after success
      setTimeout(() => {
        setStep(2)
      }, 1000)
    } catch (err) {
      const errMsg = err.response?.data?.error || 'Invalid OTP code.'
      addToast('error', errMsg)
    } finally {
      setIsVerifyingOtp(false)
    }
  }

  // Password Requirements Evaluation
  const requirements = [
    { label: 'Minimum 8 characters', met: password.length >= 8 },
    { label: 'One uppercase letter', met: /[A-Z]/.test(password) },
    { label: 'One lowercase letter', met: /[a-z]/.test(password) },
    { label: 'One number', met: /[0-9]/.test(password) },
    { label: 'One special character', met: /[!@#$%^&*(),.?":{}|<>]/.test(password) },
  ]
  const metCount = requirements.filter((req) => req.met).length

  let strengthLabel = 'Empty'
  let strengthColor = 'bg-slate-200'
  if (password.length > 0) {
    if (metCount <= 2) {
      strengthLabel = 'Weak 🛑'
      strengthColor = 'bg-red-500'
    } else if (metCount <= 4) {
      strengthLabel = 'Medium ⚠️'
      strengthColor = 'bg-amber-400'
    } else {
      strengthLabel = 'Strong 💪'
      strengthColor = 'bg-green-500'
    }
  }

  const passwordsMatch = confirmPassword.length > 0 && password === confirmPassword

  // Register Form Submit
  const handleRegisterSubmit = async (e) => {
    e.preventDefault()
    if (!fullName.trim() || !age.trim() || !gender.trim() || !email.trim()) {
      addToast('warning', 'Please complete the first step details.')
      setStep(1)
      return
    }
    if (!isEmailVerified) {
      addToast('warning', 'Please verify your email address to proceed.')
      setStep(1)
      return
    }
    if (!username.trim() || !password.trim() || !confirmPassword.trim()) {
      addToast('warning', 'Please fill in all the details in Step 2.')
      return
    }
    if (password !== confirmPassword) {
      addToast('error', 'Passwords do not match')
      return
    }
    if (metCount < 5) {
      addToast('error', 'Password does not meet all complexity requirements!')
      return
    }
    if (usernameAvailable === false) {
      addToast('error', 'Username is already taken!')
      return
    }

    setIsRegistering(true)
    addToast('info', 'Creating account...')
    try {
      await apiClient.post('/auth/signup/register', {
        fullName,
        age: parseInt(age),
        gender,
        email,
        username,
        password
      })
      addToast('success', 'Account created successfully!')
      // Clear State
      setFullName('')
      setAge('')
      setGender('')
      setEmail('')
      setUsername('')
      setPassword('')
      setConfirmPassword('')
      setTimeout(() => {
        navigate('/login')
      }, 1500)
    } catch (err) {
      const errMsg = err.response?.data?.error || 'Registration failed.'
      addToast('error', errMsg)
    } finally {
      setIsRegistering(false)
    }
  }

  // Timer format utility
  const formatTime = (secs) => {
    const mins = Math.floor(secs / 60)
    const s = secs % 60
    return `${mins}:${s < 10 ? '0' : ''}${s}`
  }

  return (
    <div className="min-h-screen bg-white dark:bg-[#06020E] relative overflow-hidden flex flex-col justify-between text-left">
      
      {/* Back to Home Button */}
      <Link 
        to="/" 
        className="absolute top-6 left-6 z-30 flex items-center gap-2 px-4.5 py-2.5 rounded-xl border border-slate-200/60 bg-white/70 backdrop-blur-md hover:bg-slate-50 text-xs font-bold text-slate-700 shadow-sm transition-all duration-300 dark:border-slate-800/60 dark:bg-slate-950/70 dark:text-slate-200 dark:hover:bg-slate-900 group"
      >
        <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
        <span>Back to Home</span>
      </Link>

      {/* Background Orbs */}
      <div className="neon-glow-circle w-[400px] h-[400px] bg-primary/20 -top-40 -left-40"></div>

      {/* Global Toast Container */}
      <div className="fixed top-6 right-6 z-50 flex flex-col gap-3 max-w-sm w-full pointer-events-none">
        <AnimatePresence>
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
              className={`pointer-events-auto p-4 rounded-2xl shadow-lg border flex items-center justify-between gap-3 text-xs font-bold ${
                toast.type === 'success'
                  ? 'bg-emerald-50 border-emerald-100 text-emerald-800 dark:bg-emerald-950/90 dark:border-emerald-900/40 dark:text-emerald-250'
                  : toast.type === 'error'
                  ? 'bg-rose-50 border-rose-100 text-rose-800 dark:bg-rose-950/90 dark:border-rose-900/40 dark:text-rose-250'
                  : toast.type === 'warning'
                  ? 'bg-amber-50 border-amber-100 text-amber-800 dark:bg-amber-950/90 dark:border-amber-900/40 dark:text-amber-250'
                  : 'bg-indigo-50 border-indigo-100 text-indigo-800 dark:bg-indigo-950/90 dark:border-indigo-900/40 dark:text-indigo-250'
              }`}
            >
              <div className="flex items-center gap-2">
                {toast.type === 'success' && <Check className="w-4.5 h-4.5 text-emerald-500" />}
                {toast.type === 'error' && <AlertCircle className="w-4.5 h-4.5 text-rose-500" />}
                {toast.type === 'warning' && <AlertCircle className="w-4.5 h-4.5 text-amber-500" />}
                {toast.type === 'info' && <Compass className="w-4.5 h-4.5 text-indigo-500 animate-spin" />}
                <span>{toast.message}</span>
              </div>
              <button
                onClick={() => removeToast(toast.id)}
                className="text-slate-400 hover:text-slate-655 dark:hover:text-slate-200 transition-colors"
              >
                &times;
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 min-h-screen w-full">
        
        {/* Left Side: Image Container (6 cols) */}
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
              src="/assets/images/Sign_up.gif" 
              alt="Signup Illustration" 
              className="w-full h-auto object-contain rounded-2xl drop-shadow-2xl pointer-events-none"
            />
          </div>
        </div>

        {/* Right Side: Form Container (6 cols) */}
        <div className="lg:col-span-6 flex flex-col justify-center px-4 sm:px-6 lg:px-16 py-12 relative z-10">
          <div className="max-w-md w-full mx-auto pt-10 lg:pt-0">
            
            {/* Logo Home Link */}
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

            {/* Outer Premium Card container */}
            <div className="p-6 sm:p-8 bg-white/80 dark:bg-slate-900/60 shadow-xl border border-slate-200/50 dark:border-slate-800/40 rounded-3xl transition-all duration-300 hover:shadow-2xl hover:border-slate-250 dark:hover:border-slate-700/60 backdrop-blur-md">
              
              {/* Premium Stepper UI */}
              <div className="mb-8 flex items-center justify-between px-2 text-xs font-semibold relative select-none">
                {/* Connecting Line */}
                <div className="absolute top-4 left-10 right-10 h-[2px] bg-slate-200 dark:bg-slate-800 z-0"></div>
                <div 
                  className="absolute top-4 left-10 h-[2px] bg-primary z-0 transition-all duration-500"
                  style={{ width: step === 1 ? '0%' : 'calc(100% - 130px)' }}
                ></div>

                {/* Step 1: Personal Info */}
                <div className="flex items-center gap-2 z-10 bg-white/95 dark:bg-slate-900 pr-3 rounded-r-lg">
                  <div 
                    className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs border transition-all duration-300 ${
                      isEmailVerified 
                        ? 'bg-emerald-500 border-emerald-500 text-white shadow-md shadow-emerald-500/20' 
                        : step === 1 
                        ? 'bg-primary border-primary text-white shadow-md shadow-primary/20' 
                        : 'bg-white border-slate-350 text-slate-400 dark:bg-slate-950 dark:border-slate-800'
                    }`}
                  >
                    {isEmailVerified ? (
                      <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}>
                        <Check className="w-3.5 h-3.5" />
                      </motion.div>
                    ) : '1'}
                  </div>
                  <span className={`transition-colors duration-305 ${
                    step === 1 ? 'text-slate-850 dark:text-white font-extrabold' : 'text-slate-400 dark:text-slate-500'
                  }`}>
                    Personal Info
                  </span>
                </div>

                {/* Step 2: Account Setup */}
                <div className="flex items-center gap-2 z-10 bg-white/95 dark:bg-slate-900 pl-3 rounded-l-lg">
                  <div 
                    className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs border transition-all duration-300 ${
                      step === 2 
                        ? 'bg-primary border-primary text-white shadow-md shadow-primary/20' 
                        : 'bg-white border-slate-305 text-slate-400 dark:bg-slate-950 dark:border-slate-800'
                    }`}
                  >
                    2
                  </div>
                  <span className={`transition-colors duration-305 ${
                    step === 2 ? 'text-slate-850 dark:text-white font-extrabold' : 'text-slate-400 dark:text-slate-500'
                  }`}>
                    Account Setup
                  </span>
                </div>
              </div>

              <AnimatePresence mode="wait">
                
                {/* STEP 1: Personal Information */}
                {step === 1 && (
                  <motion.div
                    key="signup-step-1"
                    initial={{ opacity: 0, x: -15 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 15 }}
                    transition={{ duration: 0.2 }}
                  >
                    <h2 className="text-xl font-display font-extrabold text-slate-950 dark:text-white mb-4">Personal Info</h2>

                    <div className="space-y-4">
                      
                      {/* Full name */}
                      <div>
                        <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-1.5">Full Name</label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                            <User className="w-4 h-4" />
                          </div>
                          <input
                            type="text"
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            placeholder="e.g. Aravind Sharma"
                            disabled={isEmailVerified}
                            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-855 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/25 transition-all duration-200 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100 disabled:opacity-60"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        {/* Age */}
                        <div>
                          <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-1.5">Age</label>
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                              <Calendar className="w-4 h-4" />
                            </div>
                            <input
                              type="number"
                              min="1"
                              max="120"
                              value={age}
                              onChange={(e) => setAge(e.target.value)}
                              placeholder="25"
                              disabled={isEmailVerified}
                              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-855 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/25 transition-all duration-200 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100 disabled:opacity-60"
                            />
                          </div>
                        </div>

                        {/* Gender */}
                        <div>
                          <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-1.5">Gender</label>
                          <select
                            value={gender}
                            onChange={(e) => setGender(e.target.value)}
                            disabled={isEmailVerified}
                            className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-855 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/25 transition-all duration-200 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100 disabled:opacity-60 cursor-pointer"
                          >
                            <option value="">Select Gender</option>
                            <option value="Male">Male</option>
                            <option value="Female">Female</option>
                            <option value="Other">Other</option>
                          </select>
                        </div>
                      </div>

                      {/* Email Address */}
                      <div>
                        <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-1.5">Email Address</label>
                        <div className="flex gap-2">
                          <div className="relative flex-grow">
                            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                              <Mail className="w-4 h-4" />
                            </div>
                            <input
                              type="email"
                              value={email}
                              onChange={(e) => setEmail(e.target.value)}
                              placeholder="name@domain.com"
                              disabled={isEmailVerified || isOtpSent}
                              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-855 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/25 transition-all duration-200 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100 disabled:opacity-60"
                            />
                          </div>
                          {!isEmailVerified && (
                            <motion.button
                              whileHover={{ scale: 1.03 }}
                              whileTap={{ scale: 0.97 }}
                              type="button"
                              onClick={handleSendOtp}
                              disabled={isSendingOtp || isOtpSent || !email.includes('@')}
                              className="px-4 py-2.5 rounded-xl bg-primary hover:bg-primary-dark text-white font-bold text-xs shadow-md shadow-primary/20 transition-all disabled:opacity-50"
                            >
                              {isSendingOtp ? (
                                <RefreshCw className="w-4 h-4 animate-spin" />
                              ) : (
                                'Send OTP'
                              )}
                            </motion.button>
                          )}
                        </div>
                      </div>

                      {/* OTP Verification Fields */}
                      {isOtpSent && !isEmailVerified && (
                        <motion.div
                          initial={{ opacity: 0, y: -8 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-3"
                        >
                          <div className="flex justify-between items-center text-[10px] font-bold text-slate-400">
                            <span className="flex items-center gap-1.5">
                              <Clock className="w-3.5 h-3.5" />
                              <span>Expires in: {formatTime(expiryTimer)}</span>
                            </span>
                            {resendTimer > 0 ? (
                              <span>Resend in {resendTimer}s</span>
                            ) : (
                              <button
                                type="button"
                                onClick={handleSendOtp}
                                className="text-primary hover:underline"
                              >
                                Resend OTP
                              </button>
                            )}
                          </div>

                          <div className="flex gap-2">
                            <div className="relative flex-grow">
                              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                                <KeySquare className="w-4.5 h-4.5" />
                              </div>
                              <input
                                type="text"
                                maxLength="6"
                                value={otpCode}
                                onChange={(e) => setOtpCode(e.target.value.replace(/[^0-9]/g, ''))}
                                placeholder="6-digit OTP code"
                                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-855 tracking-wider focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/25 transition-all duration-200 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100"
                              />
                            </div>
                            <motion.button
                              whileHover={{ scale: 1.03 }}
                              whileTap={{ scale: 0.97 }}
                              type="button"
                              onClick={handleVerifyOtp}
                              disabled={isVerifyingOtp || otpCode.length < 6 || expiryTimer === 0}
                              className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs shadow-md shadow-emerald-500/20 transition-all disabled:opacity-50"
                            >
                              {isVerifyingOtp ? (
                                <RefreshCw className="w-4 h-4 animate-spin" />
                              ) : (
                                'Verify OTP'
                              )}
                            </motion.button>
                          </div>
                        </motion.div>
                      )}

                      {/* Email verified success badge */}
                      {isEmailVerified && (
                        <motion.div 
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="p-3 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/40 rounded-xl text-emerald-800 dark:text-emerald-350 text-xs font-bold flex items-center gap-2"
                        >
                          <Check className="w-4 h-4 text-emerald-500" />
                          <span>Email verified successfully!</span>
                        </motion.div>
                      )}

                      {/* Next Step Button */}
                      {isEmailVerified && (
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          type="button"
                          onClick={() => setStep(2)}
                          className="clay-btn-primary w-full py-3 text-xs flex items-center justify-center gap-2 mt-4"
                        >
                          <span>Next: Account Setup</span>
                          <ArrowLeft className="w-4 h-4 rotate-180" />
                        </motion.button>
                      )}

                      {/* Or Divider */}
                      {!isEmailVerified && (
                        <div className="relative flex py-3 items-center">
                          <div className="flex-grow border-t border-slate-200/60 dark:border-slate-800/40"></div>
                          <span className="flex-shrink mx-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Or</span>
                          <div className="flex-grow border-t border-slate-200/60 dark:border-slate-800/40"></div>
                        </div>
                      )}

                      {/* Google Sign-up Button */}
                      {!isEmailVerified && (
                        <button
                          type="button"
                          onClick={async () => {
                            try {
                              await signInWithGoogle();
                            } catch (err) {
                              console.error("Google SSO error:", err);
                            }
                          }}
                          className="w-full py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-bold text-slate-700 flex items-center justify-center gap-2 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300 dark:hover:bg-slate-900 transition-all"
                        >
                          <Chrome className="w-4 h-4 text-primary" />
                          <span>Sign up with Google</span>
                        </button>
                      )}

                    </div>
                  </motion.div>
                )}

                {/* STEP 2: Account Setup */}
                {step === 2 && (
                  <motion.div
                    key="signup-step-2"
                    initial={{ opacity: 0, x: 15 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -15 }}
                    transition={{ duration: 0.2 }}
                  >
                    <h2 className="text-xl font-display font-extrabold text-slate-950 dark:text-white mb-4">Account Setup</h2>

                    <form onSubmit={handleRegisterSubmit} className="space-y-4">
                      
                      {/* Username and Check */}
                      <div>
                        <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-1.5">Username</label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                            <Compass className="w-4 h-4" />
                          </div>
                          <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                            placeholder="e.g. travelguru"
                            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-855 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/25 transition-all duration-200 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100"
                          />
                          {isCheckingUsername && (
                            <div className="absolute inset-y-0 right-3 flex items-center">
                              <RefreshCw className="w-3.5 h-3.5 text-slate-400 animate-spin" />
                            </div>
                          )}
                        </div>
                        {usernameAvailable !== null && (
                          <div className={`text-[10px] font-bold mt-1.5 ${usernameAvailable ? 'text-emerald-500' : 'text-rose-500'}`}>
                            {usernameAvailable ? '✓ Username available' : '✗ Username already taken'}
                          </div>
                        )}
                      </div>

                      {/* Password */}
                      <div>
                        <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-1.5">Password</label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                            <Lock className="w-4 h-4" />
                          </div>
                          <input
                            type={showPassword ? "text" : "password"}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                            className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-855 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/25 transition-all duration-200 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400"
                          >
                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>

                      {/* Confirm Password */}
                      <div>
                        <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-1.5">Confirm Password</label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                            <Lock className="w-4 h-4" />
                          </div>
                          <input
                            type={showPassword ? "text" : "password"}
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="••••••••"
                            className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-855 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/25 transition-all duration-200 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100"
                          />
                        </div>
                        {confirmPassword.length > 0 && (
                          <div className={`text-[10px] font-bold mt-1.5 ${passwordsMatch ? 'text-emerald-500' : 'text-rose-500'}`}>
                            {passwordsMatch ? '✓ Passwords match' : '✗ Passwords do not match'}
                          </div>
                        )}
                      </div>

                      {/* Password Checklist & Strength Checker */}
                      <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2">
                        <div className="flex justify-between items-center text-[10px] font-bold text-slate-400">
                          <span>Password Strength:</span>
                          <span className="text-primary-light font-extrabold">{strengthLabel}</span>
                        </div>
                        {/* Progress Strength Bar */}
                        <div className="w-full h-1 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden flex gap-0.5">
                          {[1, 2, 3, 4, 5].map((idx) => (
                            <div 
                              key={idx}
                              className={`h-full flex-grow transition-all duration-300 ${
                                idx <= metCount ? strengthColor : 'bg-transparent'
                              }`}
                            ></div>
                          ))}
                        </div>
                        
                        {/* Live Checklist */}
                        <div className="grid grid-cols-2 gap-x-3 gap-y-1.5 pt-1.5">
                          {requirements.map((req, index) => (
                            <div key={index} className="flex items-center gap-1.5 text-[9px] font-bold">
                              <div className={`w-3.5 h-3.5 rounded-full flex items-center justify-center border transition-all ${
                                req.met 
                                  ? 'bg-emerald-500 border-emerald-500 text-white' 
                                  : 'border-slate-300 dark:border-slate-800 text-slate-400'
                              }`}>
                                {req.met ? <Check className="w-2.5 h-2.5" /> : <div className="w-0.5 h-0.5 rounded-full bg-slate-400"></div>}
                              </div>
                              <span className={req.met ? 'text-slate-700 dark:text-slate-300' : 'text-slate-400'}>{req.label}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Buttons (Back & Submit) */}
                      <div className="flex gap-3 mt-5">
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          type="button"
                          onClick={() => setStep(1)}
                          className="w-1/3 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-bold text-slate-700 flex items-center justify-center gap-2 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300 dark:hover:bg-slate-900 transition-all"
                        >
                          <ArrowLeft className="w-4 h-4" />
                          <span>Back</span>
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          type="submit"
                          disabled={isRegistering || metCount < 5 || !passwordsMatch || usernameAvailable !== true}
                          className="clay-btn-primary flex-grow py-2.5 text-xs flex items-center justify-center gap-2"
                        >
                          {isRegistering ? (
                            <RefreshCw className="w-4 h-4 animate-spin" />
                          ) : (
                            <>
                              <ShieldCheck className="w-4.5 h-4.5" />
                              <span>Create Account</span>
                            </>
                          )}
                        </motion.button>
                      </div>

                    </form>
                  </motion.div>
                )}

              </AnimatePresence>

              {/* Login anchor */}
              <p className="mt-6 text-center text-xs font-semibold text-slate-400">
                Already have an account?{' '}
                <Link to="/login" className="font-extrabold text-primary hover:underline">Log In</Link>
              </p>

            </div>

          </div>
        </div>

      </div>
    </div>
  )
}
