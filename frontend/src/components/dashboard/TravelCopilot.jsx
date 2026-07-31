import React, { useState, useEffect, useRef } from 'react'
import { MessageSquare, Sparkles, Send, X, Bot, User, ChevronRight, HelpCircle } from 'lucide-react'
import { GlassCard } from '../ui/GlassCard'
import { useAuthStore } from '../../store/authStore'
import { useToastStore } from '../../store/useToastStore'

export default function TravelCopilot({
  activeSection,
  setActiveSection,
  addPlaceToWishlist,
  addExpense,
  fetchExpenses,
  fetchExpenseSummary
}) {
  const { user } = useAuthStore()
  const { addToast } = useToastStore()
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      sender: 'bot',
      text: `Namaste ${user?.fullName || user?.username || 'Traveler'}! I am your AI Travel Copilot. I can automate actions on this website and guide your planning.`,
      chips: [
        '📍 Add Jaipur to wishlist',
        '💵 Add expense 500 for Dinner',
        '🗺️ Go to Real-Time Map',
        '💱 Open Translator'
      ]
    }
  ])
  const [inputValue, setInputValue] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef(null)

  // Auto-scroll chats
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages, isTyping])

  const handleChipClick = (chipText) => {
    // Strip emojis for parsing
    const cleanText = chipText.replace(/[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDD10-\uDDFF]/g, "").trim();
    handleSend(cleanText)
  }

  const handleSend = async (textToSend) => {
    const prompt = (textToSend || inputValue).trim()
    if (!prompt) return

    if (!textToSend) {
      setInputValue('')
    }

    // Add user message
    const userMsgId = 'user-' + Date.now()
    setMessages((prev) => [...prev, { id: userMsgId, sender: 'user', text: prompt }])
    setIsTyping(true)

    // Simulate natural intelligence latency
    setTimeout(async () => {
      let botResponse = ""
      let actionExecuted = false

      const lowerPrompt = prompt.toLowerCase()

      // COMMAND PARSING LOGIC:
      // 1. Switch Active Section / Navigation
      if (lowerPrompt.includes('go to') || lowerPrompt.includes('open') || lowerPrompt.includes('show')) {
        let section = ""
        if (lowerPrompt.includes('map') || lowerPrompt.includes('tracking')) {
          section = 'tracking'
        } else if (lowerPrompt.includes('budget') || lowerPrompt.includes('expense')) {
          section = 'budget'
        } else if (lowerPrompt.includes('weather') || lowerPrompt.includes('temperature')) {
          section = 'weather'
        } else if (lowerPrompt.includes('translate') || lowerPrompt.includes('language')) {
          section = 'translator'
        } else if (lowerPrompt.includes('dashboard') || lowerPrompt.includes('home')) {
          section = 'dashboard'
        }

        if (section) {
          setActiveSection(section)
          botResponse = `Switched your dashboard panel to **${section.toUpperCase()}** view!`
          actionExecuted = true
          addToast(`Navigated to ${section}`, 'success')
        }
      }

      // 2. Add Place to Wishlist
      if (!actionExecuted && (lowerPrompt.includes('add') && (lowerPrompt.includes('wishlist') || lowerPrompt.includes('place') || lowerPrompt.includes('destination')))) {
        // Regex to match: add [place] to wishlist OR add [place]
        const match = prompt.match(/(?:add\s+)(.*?)(?:\s+to\s+wishlist|\s+wishlist|\s+to\s+my\s+wishlist|$)/i)
        if (match && match[1]) {
          const place = match[1].trim()
          try {
            await addPlaceToWishlist({ name: place })
            botResponse = `Successfully added **${place}** to your travel wishlist! You can see it in your wishlist sidebar.`
            actionExecuted = true
            addToast(`Added ${place} to wishlist`, 'success')
          } catch (err) {
            botResponse = `I tried adding **${place}** to your wishlist, but encountered an error. Make sure your active trip is loaded.`
          }
        }
      }

      // Fallback add place if they just type "add Paris"
      if (!actionExecuted && lowerPrompt.startsWith('add ') && !lowerPrompt.includes('expense')) {
        const place = prompt.substring(4).trim()
        if (place) {
          try {
            await addPlaceToWishlist({ name: place })
            botResponse = `Successfully added **${place}** to your travel wishlist!`
            actionExecuted = true
            addToast(`Added ${place} to wishlist`, 'success')
          } catch (err) {
            botResponse = `Could not add ${place} to wishlist.`
          }
        }
      }

      // 3. Add Expense to budget
      if (!actionExecuted && (lowerPrompt.includes('expense') || lowerPrompt.includes('spend') || lowerPrompt.includes('budget'))) {
        // Regex to parse: add expense [amount] for [title]
        const amountMatch = prompt.match(/(\d+)/)
        if (amountMatch) {
          const amount = parseFloat(amountMatch[1])
          // Try to extract category/title
          let title = "Miscellaneous"
          const forMatch = prompt.match(/(?:for|on|dinner|hotel|flight|food|cabs)\s+(.*)/i)
          if (forMatch && forMatch[1]) {
            title = forMatch[1].trim()
          } else {
            // Check for keywords
            const keywords = ['dinner', 'hotel', 'flight', 'food', 'cab', 'shopping', 'train', 'gift']
            const foundKeyword = keywords.find(kw => lowerPrompt.includes(kw))
            if (foundKeyword) {
              title = foundKeyword.charAt(0).toUpperCase() + foundKeyword.slice(1)
            }
          }

          try {
            await addExpense({
              title: title,
              amount: amount,
              category: title.toLowerCase().includes('food') || title.toLowerCase().includes('dinner') ? 'Food' : 
                        title.toLowerCase().includes('hotel') || title.toLowerCase().includes('stay') ? 'Accommodation' :
                        title.toLowerCase().includes('flight') || title.toLowerCase().includes('cab') || title.toLowerCase().includes('train') ? 'Transportation' : 'Entertainment',
              date: new Date().toISOString().split('T')[0]
            })
            // Refresh budget stats
            if (fetchExpenses) fetchExpenses()
            if (fetchExpenseSummary) fetchExpenseSummary()

            botResponse = `Recorded an expense of **₹${amount}** under **${title}** in your Budget Tracker!`
            actionExecuted = true
            addToast(`Recorded expense of ₹${amount}`, 'success')
          } catch (err) {
            botResponse = `Failed to add expense. Make sure you are logged in and have an active trip.`
          }
        }
      }

      // 4. Fallback Knowledge Base Suggestions
      if (!actionExecuted) {
        if (lowerPrompt.includes('hello') || lowerPrompt.includes('hi') || lowerPrompt.includes('hey')) {
          botResponse = `Namaste! How can I assist you with your travels today? You can ask me to:
          
* *'Add Goa to wishlist'*
* *'Show weather updates'*
* *'Record expense of 1200 for hotel'*`
        } else if (lowerPrompt.includes('weather')) {
          botResponse = `I can help you check weather conditions! I'm switching your view to the Weather widget right now.`
          setActiveSection('weather')
          addToast('Navigated to Weather widget', 'info')
        } else if (lowerPrompt.includes('translate')) {
          botResponse = `Sure! I'm loading the Language Translator so you can convert phrases easily.`
          setActiveSection('translator')
          addToast('Navigated to Language Translator', 'info')
        } else if (lowerPrompt.includes('route') || lowerPrompt.includes('direction')) {
          botResponse = `I recommend checking our Route Optimization panel! Click **Optimize Routes** on your dashboard sidebar to draw the scenic or shortest paths.`
        } else if (lowerPrompt.includes('india') || lowerPrompt.includes('delhi') || lowerPrompt.includes('jaipur') || lowerPrompt.includes('agra')) {
          botResponse = `India is filled with magical travel spots! 
          
* **Agra:** Visit the spectacular Taj Mahal.
* **Jaipur:** Explore the Pink City, Hawa Mahal, and Amber Fort.
* **Delhi:** Indulge in rich history and street food at Chandni Chowk.
* **Goa:** Relax by pristine beaches and historic churches.`
        } else {
          botResponse = `I've analyzed your request! As your Copilot, I'm ready to assist you. 

* To add destinations, type: **"Add [Location] to wishlist"**
* To track expenses, type: **"Add expense [Amount] for [Title]"**
* To switch view, type: **"Go to [map/weather/translator/budget]"**`
        }
      }

      setMessages((prev) => [...prev, {
        id: 'bot-' + Date.now(),
        sender: 'bot',
        text: botResponse
      }])
      setIsTyping(false)
    }, 900)
  }

  return (
    <>
      {/* Floating Action Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-50 p-4 rounded-full bg-gradient-to-tr from-violet-650 to-indigo-650 hover:from-violet-750 hover:to-indigo-750 text-white shadow-2xl transition-all duration-300 hover:scale-110 active:scale-95 flex items-center justify-center border border-white/20 group cursor-pointer"
        title="AI Travel Copilot"
      >
        {isOpen ? (
          <X className="w-6 h-6 animate-fadeIn" />
        ) : (
          <div className="relative">
            <Bot className="w-6 h-6 animate-pulse" />
            <span className="absolute -top-1.5 -right-1.5 w-2.5 h-2.5 rounded-full bg-emerald-400 border border-slate-900 group-hover:scale-125 transition-all" />
          </div>
        )}
      </button>

      {/* Floating Chat Window */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 z-50 w-[350px] sm:w-[380px] h-[500px] flex flex-col animate-slideUp">
          <GlassCard className="flex-grow flex flex-col overflow-hidden border border-white/10 shadow-2xl bg-slate-950/90 backdrop-blur-lg rounded-2xl">
            
            {/* Header */}
            <div className="p-4 bg-white/[0.03] border-b border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-violet-650 to-indigo-650 flex items-center justify-center border border-white/15">
                  <Sparkles className="w-4 h-4 text-white animate-spin" style={{ animationDuration: '6s' }} />
                </div>
                <div className="text-left">
                  <h4 className="text-xs font-black uppercase tracking-wider text-white">AI Travel Copilot</h4>
                  <div className="flex items-center gap-1 mt-0.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-[8px] font-bold text-white/40 uppercase tracking-widest">Active Assistant</span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-lg hover:bg-white/5 text-white/40 hover:text-white transition-all cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Conversation Log */}
            <div className="flex-grow overflow-y-auto p-4 space-y-4 text-left">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex gap-2.5 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {msg.sender === 'bot' && (
                    <div className="w-6 h-6 rounded-full bg-violet-600/25 border border-violet-500/35 flex items-center justify-center shrink-0 mt-1">
                      <Bot className="w-3.5 h-3.5 text-violet-400" />
                    </div>
                  )}

                  <div className="max-w-[75%] space-y-2">
                    <div
                      className={`p-3 rounded-2xl text-xs leading-relaxed ${
                        msg.sender === 'user'
                          ? 'bg-violet-650 text-white rounded-tr-none'
                          : 'bg-white/[0.03] border border-white/5 text-white/90 rounded-tl-none font-semibold'
                      }`}
                      style={{ whiteSpace: 'pre-wrap' }}
                    >
                      {msg.text}
                    </div>

                    {/* Quick suggestion chips */}
                    {msg.chips && msg.chips.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {msg.chips.map((chip, i) => (
                          <button
                            key={i}
                            onClick={() => handleChipClick(chip)}
                            className="px-2.5 py-1 rounded-lg bg-white/5 border border-white/5 text-[9px] font-bold text-white/70 hover:bg-white/10 hover:text-white transition-all cursor-pointer flex items-center gap-1 active:scale-95"
                          >
                            <span>{chip}</span>
                            <ChevronRight className="w-2.5 h-2.5 opacity-55" />
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {msg.sender === 'user' && (
                    <div className="w-6 h-6 rounded-full bg-indigo-600/25 border border-indigo-500/35 flex items-center justify-center shrink-0 mt-1">
                      <User className="w-3.5 h-3.5 text-indigo-400" />
                    </div>
                  )}
                </div>
              ))}

              {/* Bot typing simulation */}
              {isTyping && (
                <div className="flex gap-2.5 justify-start">
                  <div className="w-6 h-6 rounded-full bg-violet-600/25 border border-violet-500/35 flex items-center justify-center shrink-0 mt-1">
                    <Bot className="w-3.5 h-3.5 text-violet-400" />
                  </div>
                  <div className="p-3 rounded-2xl text-xs bg-white/[0.03] border border-white/5 text-white/40 rounded-tl-none font-semibold flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-white/40 animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-1.5 h-1.5 rounded-full bg-white/40 animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-1.5 h-1.5 rounded-full bg-white/40 animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input Bar */}
            <div className="p-4 bg-white/[0.02] border-t border-white/5">
              <form
                onSubmit={(e) => {
                  e.preventDefault()
                  handleSend()
                }}
                className="flex gap-2"
              >
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="Ask Travel Copilot..."
                  className="flex-grow glass-input text-xs"
                />
                <button
                  type="submit"
                  disabled={!inputValue.trim()}
                  className="p-2.5 rounded-xl bg-violet-650 hover:bg-violet-750 text-white disabled:opacity-50 cursor-pointer flex items-center justify-center transition-all active:scale-95"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </form>
            </div>

          </GlassCard>
        </div>
      )}
    </>
  )
}
