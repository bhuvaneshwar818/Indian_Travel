import React, { useState } from 'react'
import { GlassCard } from '../ui/GlassCard'
import { useTripStore } from '../../store/useTripStore'
import { Languages, Copy, Check, Sparkles } from 'lucide-react'

export default function LanguageTranslator() {
  const { translationResult, translateText, loading } = useTripStore();
  const [text, setText] = useState('');
  const [targetLang, setTargetLang] = useState('Hindi');
  const [copied, setCopied] = useState(false);

  const handleTranslate = () => {
    if (!text.trim()) return;
    translateText(text, targetLang);
  };

  const handleCopy = () => {
    if (!translationResult) return;
    navigator.clipboard.writeText(translationResult);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const languages = [
    "Hindi", "Telugu", "Tamil", "Kannada", "Malayalam", 
    "Bengali", "Marathi", "Gujarati", "Punjabi", "English"
  ];

  return (
    <GlassCard className="p-5 text-left bg-white/[0.04] space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
          <Languages className="w-4 h-4 text-violet-400" />
          <span>Regional Language Translator</span>
        </h3>
        
        {/* Language selector */}
        <select
          value={targetLang}
          onChange={(e) => setTargetLang(e.target.value)}
          className="glass-input py-1 px-3 text-[10px] bg-slate-900"
        >
          {languages.map((lang) => (
            <option key={lang} value={lang} className="bg-slate-950 text-white">
              {lang}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-3">
        <textarea
          rows="3"
          placeholder="Enter text to translate (e.g. Hello, how much does this cost?)"
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="w-full glass-input text-xs resize-none"
        />

        <button
          onClick={handleTranslate}
          disabled={loading || !text.trim()}
          className="w-full py-2.5 rounded-xl bg-violet-650 hover:bg-violet-750 text-xs font-bold text-white transition-all disabled:opacity-50 flex items-center justify-center gap-1.5 shadow-md"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>{loading ? "Translating phrase..." : "Translate"}</span>
        </button>

        {translationResult && (
          <div className="p-4 rounded-xl bg-white/5 border border-white/5 space-y-2 animate-dashboard-fade relative">
            <p className="text-[9px] font-bold text-white/40 uppercase tracking-wider">Translation ({targetLang})</p>
            <p className="text-sm font-black text-violet-300 pr-8">{translationResult}</p>
            
            <button
              onClick={handleCopy}
              className="absolute right-3 bottom-3 p-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-all"
              title="Copy translation"
            >
              {copied ? (
                <Check className="w-3.5 h-3.5 text-emerald-400" />
              ) : (
                <Copy className="w-3.5 h-3.5" />
              )}
            </button>
          </div>
        )}
      </div>
    </GlassCard>
  )
}
