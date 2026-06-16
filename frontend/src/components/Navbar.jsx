import React, { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useThemeStore } from '../store/themeStore'
import { useAuthStore } from '../store/authStore'
import { Menu, X, Sun, Moon, Compass, LogOut, User as UserIcon } from 'lucide-react'

export default function Navbar() {
  const { isDarkMode, toggleTheme, initTheme } = useThemeStore()
  const { user, isAuthenticated, logout } = useAuthStore()
  const [isOpen, setIsOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    initTheme()
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setScrolled(true)
      } else {
        setScrolled(false)
      }
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [initTheme])

  const handleLogout = () => {
    logout()
    navigate('/')
    setIsOpen(false)
  }

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Explore', path: '/#explore' },
    { name: 'Destinations', path: '/#destinations' },
    { name: 'AI Planner', path: '/#ai-planner' },
    { name: 'Reviews', path: '/#reviews' },
    { name: 'Contact', path: '/#contact' },
  ]

  const isActive = (path) => {
    if (path.startsWith('/#')) {
      return location.hash === path.substring(1)
    }
    return location.pathname === path && !location.hash
  }

  const handleScrollToSection = (hash) => {
    setIsOpen(false)
    if (hash.startsWith('/#')) {
      const elementId = hash.substring(2)
      if (location.pathname !== '/') {
        navigate('/')
        setTimeout(() => {
          const el = document.getElementById(elementId)
          if (el) el.scrollIntoView({ behavior: 'smooth' })
        }, 100)
      } else {
        const el = document.getElementById(elementId)
        if (el) el.scrollIntoView({ behavior: 'smooth' })
      }
    } else {
      navigate(hash)
    }
  }

  return (
    <nav className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${
      scrolled 
        ? 'glass-navbar py-3 shadow-md' 
        : 'bg-transparent py-5 border-b border-transparent'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-12">
          
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-primary to-primary-light flex items-center justify-center shadow-md shadow-primary/20 transform group-hover:rotate-12 transition-transform duration-300">
              <Compass className="w-5 h-5 text-white" />
            </div>
            <span className="font-display font-extrabold text-xl tracking-tight bg-gradient-to-r from-primary to-primary-light bg-clip-text text-transparent dark:from-purple-300 dark:to-white">
              Indian Travel <span className="text-primary dark:text-purple-400">AI</span>
            </span>
          </Link>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => (
              <button
                key={link.name}
                onClick={() => handleScrollToSection(link.path)}
                className={`font-medium text-sm transition-colors duration-200 hover:text-primary dark:hover:text-purple-400 ${
                  isActive(link.path) 
                    ? 'text-primary dark:text-purple-400 font-semibold' 
                    : 'text-slate-600 dark:text-slate-300'
                }`}
              >
                {link.name}
              </button>
            ))}
          </div>

          {/* Right Action buttons */}
          <div className="hidden md:flex items-center gap-4">
            
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="w-10 h-10 rounded-xl flex items-center justify-center border border-slate-200 bg-white/60 text-slate-700 shadow-sm transition-colors hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-900/50 dark:text-slate-200 dark:hover:bg-slate-850"
              aria-label="Toggle Theme"
            >
              {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-650" />}
            </button>

            {isAuthenticated ? (
              <div className="flex items-center gap-3">
                <Link
                  to="/dashboard"
                  className="clay-btn-secondary py-2 px-4 text-sm flex items-center gap-1.5"
                >
                  <UserIcon className="w-4 h-4" />
                  <span>Dashboard</span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="w-10 h-10 rounded-xl flex items-center justify-center bg-red-50 border border-red-100 text-red-600 shadow-sm transition-transform hover:-translate-y-0.5 active:translate-y-0 dark:bg-red-950/20 dark:border-red-900/30 dark:text-red-400"
                  title="Logout"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-4 py-2 text-sm font-semibold text-slate-700 hover:text-primary dark:text-slate-200 dark:hover:text-purple-400"
                >
                  Log In
                </Link>
                <Link
                  to="/signup"
                  className="clay-btn-primary py-2 px-5 text-sm"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>

          {/* Mobile hamburger button */}
          <div className="md:hidden flex items-center gap-3">
            {/* Theme Toggle Mobile */}
            <button
              onClick={toggleTheme}
              className="w-9 h-9 rounded-lg flex items-center justify-center border border-slate-200 bg-white/60 text-slate-700 dark:border-slate-800 dark:bg-slate-900/50 dark:text-slate-200"
            >
              {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
            </button>

            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-slate-700 dark:text-slate-200 focus:outline-none"
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Drawer */}
      {isOpen && (
        <div className="md:hidden glass-navbar absolute top-full left-0 w-full px-4 py-6 shadow-xl border-t border-slate-250/20 dark:border-slate-800/40 animate-fadeIn">
          <div className="flex flex-col gap-4">
            {navLinks.map((link) => (
              <button
                key={link.name}
                onClick={() => handleScrollToSection(link.path)}
                className={`text-left py-2 font-medium border-b border-slate-100 dark:border-slate-800/40 text-sm ${
                  isActive(link.path) 
                    ? 'text-primary dark:text-purple-400' 
                    : 'text-slate-600 dark:text-slate-350'
                }`}
              >
                {link.name}
              </button>
            ))}

            {isAuthenticated ? (
              <div className="flex flex-col gap-3 pt-2">
                <Link
                  to="/dashboard"
                  onClick={() => setIsOpen(false)}
                  className="clay-btn-secondary py-2.5 px-4 text-center text-sm flex justify-center items-center gap-1.5"
                >
                  <UserIcon className="w-4 h-4" />
                  <span>Dashboard</span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="w-full py-2.5 rounded-xl bg-red-500 text-white font-semibold text-sm flex justify-center items-center gap-2 shadow-md shadow-red-500/10"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Log Out</span>
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-2 pt-2">
                <Link
                  to="/login"
                  onClick={() => setIsOpen(false)}
                  className="w-full text-center py-2.5 text-slate-700 font-semibold text-sm dark:text-slate-200"
                >
                  Log In
                </Link>
                <Link
                  to="/signup"
                  onClick={() => setIsOpen(false)}
                  className="clay-btn-primary w-full py-2.5 text-center text-sm"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  )
}
