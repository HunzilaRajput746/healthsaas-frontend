'use client'
import { useState, useRef, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MessageCircle, X, Send, Bot, User, Loader2, Stethoscope } from 'lucide-react'
import { chatAPI } from '@/lib/api'
import { format } from 'date-fns'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
  isBooking?: boolean
}

interface ChatWidgetProps {
  clinicId: string
  clinicName?: string
  accentColor?: 'blue' | 'purple' | 'green'
  triggerMessage?: string | null   // ← new prop for quick buttons
}

const ACCENT = {
  blue:   { border: '#00d4ff', glow: 'rgba(0,212,255,0.3)',   text: 'text-[#00d4ff]' },
  purple: { border: '#9b59ff', glow: 'rgba(155,89,255,0.3)',  text: 'text-[#9b59ff]' },
  green:  { border: '#00ff88', glow: 'rgba(0,255,136,0.3)',   text: 'text-[#00ff88]' },
}

export default function ChatWidget({
  clinicId,
  clinicName = 'HealthBot',
  accentColor = 'blue',
  triggerMessage,
}: ChatWidgetProps) {
  const [isOpen, setIsOpen]   = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '0',
      role: 'assistant',
      content: `Hello! I'm HealthBot, your AI assistant for ${clinicName}. 👋\n\nI can help you with:\n• Doctor information & timings\n• Lab test details & fees\n• Book appointments instantly\n\nHow can I assist you today?`,
      timestamp: new Date(),
    },
  ])
  const [input, setInput]   = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [sessionId]         = useState(() => crypto.randomUUID())
  const scrollRef           = useRef<HTMLDivElement>(null)
  const inputRef            = useRef<HTMLInputElement>(null)
  const accent              = ACCENT[accentColor]

  // Auto-scroll
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages, isTyping])

  // Focus input when opened
  useEffect(() => {
    if (isOpen) setTimeout(() => inputRef.current?.focus(), 300)
  }, [isOpen])

  // ── Handle triggerMessage from quick buttons ──────────────────────────────
  useEffect(() => {
    if (!triggerMessage) return
    // Open the chat and send the message automatically
    setIsOpen(true)
    // Small delay so widget opens first
    setTimeout(() => {
      sendMessageText(triggerMessage)
    }, 400)
  }, [triggerMessage])  // eslint-disable-line

  const sendMessageText = useCallback(async (text: string) => {
    if (!text.trim() || isTyping) return

    const userMsg: Message = {
      id: crypto.randomUUID(),
      role: 'user',
      content: text,
      timestamp: new Date(),
    }
    setMessages(prev => [...prev, userMsg])
    setInput('')
    setIsTyping(true)

    try {
      const res = await chatAPI.sendMessage(clinicId, text, sessionId)
      const { reply, booking_confirmed } = res.data
      setMessages(prev => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: 'assistant',
          content: reply,
          timestamp: new Date(),
          isBooking: !!booking_confirmed,
        },
      ])
    } catch {
      setMessages(prev => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: 'assistant',
          content: "I'm having trouble connecting right now. Please try again or call the clinic directly.",
          timestamp: new Date(),
        },
      ])
    } finally {
      setIsTyping(false)
    }
  }, [isTyping, clinicId, sessionId])

  const sendMessage = useCallback(() => {
    sendMessageText(input.trim())
  }, [input, sendMessageText])

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  return (
    <>
      {/* ── Floating toggle button ───────────────────────────────────────── */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-50 w-16 h-16 rounded-full flex items-center justify-center"
        style={{
          background: `linear-gradient(135deg, ${accent.border}22, ${accent.border}44)`,
          border: `2px solid ${accent.border}`,
          boxShadow: `0 0 20px ${accent.glow}, 0 0 40px ${accent.glow}40`,
        }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        animate={{
          boxShadow: isOpen
            ? `0 0 30px ${accent.glow}`
            : [
                `0 0 20px ${accent.glow}`,
                `0 0 35px ${accent.glow}`,
                `0 0 20px ${accent.glow}`,
              ],
        }}
        transition={{ duration: 2, repeat: isOpen ? 0 : Infinity }}
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div key="x" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }}>
              <X size={24} color={accent.border} />
            </motion.div>
          ) : (
            <motion.div key="chat" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }}>
              <MessageCircle size={24} color={accent.border} />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>

      {/* ── Chat panel ───────────────────────────────────────────────────── */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: 'spring', damping: 25, stiffness: 400 }}
            className="fixed bottom-28 right-6 z-50 w-[380px] max-h-[600px] flex flex-col rounded-2xl overflow-hidden"
            style={{
              background: 'rgba(10, 15, 30, 0.97)',
              border: `1px solid ${accent.border}30`,
              boxShadow: `0 0 0 1px ${accent.border}10, 0 20px 60px rgba(0,0,0,0.8), 0 0 80px ${accent.glow}20`,
            }}
          >
            {/* Header */}
            <div
              className="flex items-center gap-3 px-4 py-3 border-b"
              style={{
                borderColor: `${accent.border}20`,
                background: `linear-gradient(90deg, ${accent.border}10, transparent)`,
              }}
            >
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                style={{ background: `${accent.border}15`, border: `1px solid ${accent.border}40` }}
              >
                <Stethoscope size={18} color={accent.border} />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-white text-sm font-display">HealthBot</h3>
                <div className="flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-xs text-slate-400">AI Receptionist • Online</span>
                </div>
              </div>
              <div
                className="text-xs px-2 py-1 rounded-full font-mono"
                style={{
                  background: `${accent.border}15`,
                  color: accent.border,
                  border: `1px solid ${accent.border}30`,
                }}
              >
                {clinicName}
              </div>
            </div>

            {/* Messages */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3" style={{ maxHeight: '420px' }}>
              {messages.map(msg => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex gap-2 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
                >
                  <div
                    className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                    style={{
                      background: msg.role === 'assistant' ? `${accent.border}15` : '#9b59ff15',
                      border: `1px solid ${msg.role === 'assistant' ? `${accent.border}40` : '#9b59ff40'}`,
                    }}
                  >
                    {msg.role === 'assistant'
                      ? <Bot size={14} color={accent.border} />
                      : <User size={14} color="#9b59ff" />}
                  </div>

                  <div
                    className={`max-w-[78%] rounded-2xl px-3 py-2.5 text-sm leading-relaxed ${
                      msg.role === 'user' ? 'rounded-tr-sm' : 'rounded-tl-sm'
                    }`}
                    style={{
                      background:
                        msg.role === 'user'
                          ? 'linear-gradient(135deg, #9b59ff30, #9b59ff20)'
                          : msg.isBooking
                          ? `linear-gradient(135deg, ${accent.border}20, ${accent.border}10)`
                          : '#0d1527',
                      border: `1px solid ${
                        msg.role === 'user'
                          ? '#9b59ff30'
                          : msg.isBooking
                          ? `${accent.border}40`
                          : '#ffffff08'
                      }`,
                      color: '#e2e8f0',
                    }}
                  >
                    <p style={{ whiteSpace: 'pre-line' }}>{msg.content}</p>
                    <p className="text-xs text-slate-500 mt-1">{format(msg.timestamp, 'HH:mm')}</p>
                  </div>
                </motion.div>
              ))}

              {/* Typing indicator */}
              <AnimatePresence>
                {isTyping && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="flex gap-2 items-end"
                  >
                    <div
                      className="w-7 h-7 rounded-full flex items-center justify-center"
                      style={{ background: `${accent.border}15`, border: `1px solid ${accent.border}40` }}
                    >
                      <Bot size={14} color={accent.border} />
                    </div>
                    <div className="rounded-2xl rounded-tl-sm px-4 py-3" style={{ background: '#0d1527', border: '1px solid #ffffff08' }}>
                      <div className="flex gap-1 items-center">
                        {[0, 1, 2].map(i => (
                          <motion.div
                            key={i}
                            className="w-1.5 h-1.5 rounded-full"
                            style={{ background: accent.border }}
                            animate={{ y: [0, -4, 0] }}
                            transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }}
                          />
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Input */}
            <div className="px-3 py-3 border-t" style={{ borderColor: `${accent.border}15` }}>
              <div
                className="flex items-center gap-2 rounded-xl px-3 py-2"
                style={{ background: '#0d1527', border: `1px solid ${accent.border}20` }}
              >
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={handleKey}
                  placeholder="Type your message..."
                  disabled={isTyping}
                  className="flex-1 bg-transparent text-sm text-slate-200 placeholder-slate-600 outline-none"
                />
                <motion.button
                  onClick={sendMessage}
                  disabled={!input.trim() || isTyping}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="w-8 h-8 rounded-lg flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                  style={{
                    background: input.trim() && !isTyping ? accent.border : 'transparent',
                    border: `1px solid ${accent.border}40`,
                  }}
                >
                  {isTyping
                    ? <Loader2 size={14} color={accent.border} className="animate-spin" />
                    : <Send size={14} color={input.trim() ? '#030712' : accent.border} />}
                </motion.button>
              </div>
              <p className="text-center text-xs text-slate-600 mt-2">
                Powered by <span style={{ color: accent.border }}>HealthSaaS AI</span>
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
