import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { GlassCard } from '../ui/GlassCard'
import { StepperProgress } from '../ui/StepperProgress'
import StepTravelMode from './StepTravelMode'
import StepTransportMode from './StepTransportMode'
import StepStartLocation from './StepStartLocation'
import { useTripStore } from '../../store/useTripStore'
import { ArrowLeft, ArrowRight, Sparkles } from 'lucide-react'

export default function OnboardingStepper({ onComplete }) {
  const { savePreferences } = useTripStore();
  const [stepIndex, setStepIndex] = useState(0);

  // Prefs local states
  const [travelMode, setTravelMode] = useState('SOLO');
  const [groupSize, setGroupSize] = useState(1);
  const [transportMode, setTransportMode] = useState('PUBLIC');
  const [startLocation, setStartLocation] = useState('Mumbai');
  const [saving, setSaving] = useState(false);

  const steps = ["Travel Mode", "Transport Mode", "Start Location"];

  const handleNext = () => {
    if (stepIndex < 2) {
      setStepIndex(stepIndex + 1);
    }
  };

  const handleBack = () => {
    if (stepIndex > 0) {
      setStepIndex(stepIndex - 1);
    }
  };

  const handleFinish = async () => {
    if (!startLocation.trim()) {
      alert("Please configure a starting location!");
      return;
    }
    setSaving(true);
    try {
      await savePreferences({
        travelMode,
        groupSize,
        transportMode,
        startLocation
      });
      localStorage.setItem('trip_preferences_saved', 'true');
      onComplete();
    } catch (err) {
      alert("Failed to save trip preferences. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/85 backdrop-blur-md p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: -15 }}
        className="w-full max-w-2xl"
      >
        <GlassCard className="p-6 md:p-8 space-y-6 border border-white/20 shadow-2xl relative overflow-hidden">
          {/* Neon gradient orb */}
          <div className="absolute -top-12 -left-12 w-48 h-48 bg-violet-600/10 blur-[60px] rounded-full pointer-events-none" />
          <div className="absolute -bottom-12 -right-12 w-48 h-48 bg-indigo-600/10 blur-[60px] rounded-full pointer-events-none" />

          {/* Stepper Header */}
          <div className="text-center relative z-10 space-y-2">
            <h2 className="text-xl md:text-2xl font-display font-black tracking-tight text-white flex items-center justify-center gap-2">
              <Sparkles className="w-5 h-5 text-violet-400 animate-pulse" />
              <span>Configure Your India Itinerary</span>
            </h2>
            <p className="text-xs text-white/50">Personalize your journey planner in just a few quick choices</p>
          </div>

          {/* Progress Tracker */}
          <div className="relative z-10 border-y border-white/5 py-1">
            <StepperProgress steps={steps} current={stepIndex} />
          </div>

          {/* Step Body */}
          <div className="relative z-10 py-4 min-h-[220px]">
            {stepIndex === 0 && (
              <StepTravelMode
                travelMode={travelMode}
                setTravelMode={setTravelMode}
                groupSize={groupSize}
                setGroupSize={setGroupSize}
              />
            )}
            {stepIndex === 1 && (
              <StepTransportMode
                transportMode={transportMode}
                setTransportMode={setTransportMode}
              />
            )}
            {stepIndex === 2 && (
              <StepStartLocation
                startLocation={startLocation}
                setStartLocation={setStartLocation}
              />
            )}
          </div>

          {/* Footer Controls */}
          <div className="relative z-10 flex items-center justify-between border-t border-white/5 pt-6">
            <button
              type="button"
              onClick={handleBack}
              disabled={stepIndex === 0}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                stepIndex === 0
                  ? 'opacity-0 pointer-events-none'
                  : 'bg-white/5 text-white/60 hover:bg-white/10 hover:text-white'
              }`}
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>

            {stepIndex < 2 ? (
              <button
                type="button"
                onClick={handleNext}
                className="flex items-center gap-1.5 px-6 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-700 text-xs font-bold text-white shadow-[0_0_15px_rgba(124,58,237,0.3)] transition-all"
              >
                <span>Next</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleFinish}
                disabled={saving}
                className="flex items-center gap-1.5 px-7 py-3 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-xs font-black text-white shadow-[0_0_20px_rgba(124,58,237,0.45)] hover:shadow-[0_0_25px_rgba(124,58,237,0.6)] transition-all disabled:opacity-50"
              >
                <span>{saving ? "Creating workspace..." : "Let's Go →"}</span>
              </button>
            )}
          </div>
        </GlassCard>
      </motion.div>
    </div>
  )
}
