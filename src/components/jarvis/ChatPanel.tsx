'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Send, Mic, Trash2 } from 'lucide-react'
import { useJarvisStore } from '@/hooks/useJarvisStore'
import { useVoiceRecognition } from '@/hooks/useVoiceRecognition'
import { parseCommand } from '@/lib/commands'
import { playMessageSound, playThinkingSound } from '@/lib/sounds'
import { MessageBubble } from './MessageBubble'
import { TypingIndicator } from './TypingIndicator'
import { QuickCommands } from './QuickCommands'

export function ChatPanel() {
  const {
    messages,
    addMessage,
    clearMessages,
    aiStatus,
    setAIStatus,
    personalityMode,
    soundEnabled,
    incrementCommandCount,
  } = useJarvisStore()

  const { transcript, isListening: voiceIsListening } = useVoiceRecognition()

  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [typingText, setTypingText] = useState('')
  const [isTypingEffect, setIsTypingEffect] = useState(false)

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const typingIntervalRef = useRef<NodeJS.Timeout | null>(null)

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, typingText])

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  // Typing effect for AI responses
  const typeResponse = useCallback((text: string) => {
    setIsTypingEffect(true)
    setTypingText('')
    let index = 0

    if (typingIntervalRef.current) {
      clearInterval(typingIntervalRef.current)
    }

    typingIntervalRef.current = setInterval(() => {
      if (index < text.length) {
        setTypingText(text.slice(0, index + 1))
        index++
      } else {
        if (typingIntervalRef.current) {
          clearInterval(typingIntervalRef.current)
        }
        setIsTypingEffect(false)
        addMessage({ role: 'assistant', content: text })
        setTypingText('')
        setAIStatus('idle')
        if (soundEnabled) playMessageSound()
      }
    }, 20)

    return () => {
      if (typingIntervalRef.current) {
        clearInterval(typingIntervalRef.current)
      }
    }
  }, [addMessage, setAIStatus, soundEnabled])

  // Handle sending a message
  const handleSend = useCallback(async (text?: string) => {
    const messageText = (text || input).trim()
    if (!messageText || isLoading) return

    setInput('')
    incrementCommandCount()

    // Parse command
    const commandResult = parseCommand(messageText)

    // Add user message
    addMessage({ role: 'user', content: messageText })

    // Handle non-chat commands locally
    if (commandResult.type !== 'chat') {
      switch (commandResult.type) {
        case 'url': {
          if (commandResult.url) {
            window.open(commandResult.url, '_blank', 'noopener,noreferrer')
          }
          if (commandResult.message) {
            addMessage({ role: 'assistant', content: commandResult.message })
            if (soundEnabled) playMessageSound()
          }
          return
        }
        case 'system': {
          if (commandResult.action === 'clear') {
            clearMessages()
            if (soundEnabled) playMessageSound()
            return
          }
          if (commandResult.message) {
            addMessage({ role: 'assistant', content: commandResult.message })
            if (soundEnabled) playMessageSound()
          }
          return
        }
        case 'search': {
          if (commandResult.url) {
            window.open(commandResult.url, '_blank', 'noopener,noreferrer')
          }
          if (commandResult.message) {
            addMessage({ role: 'assistant', content: commandResult.message })
            if (soundEnabled) playMessageSound()
          }
          return
        }
        case 'joke':
        case 'command':
        case 'error': {
          if (commandResult.message) {
            addMessage({ role: 'assistant', content: commandResult.message })
            if (soundEnabled) playMessageSound()
          }
          return
        }
      }
    }

    // Chat: Send to AI API
    setIsLoading(true)
    setAIStatus('thinking')
    if (soundEnabled) playThinkingSound()

    try {
      const history = messages.map((m) => ({
        role: m.role,
        content: m.content,
      }))

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: messageText,
          personality: personalityMode,
          history,
        }),
      })

      const data = await response.json()

      if (!response.ok || data.error) {
        addMessage({
          role: 'assistant',
          content: `I encountered an error: ${data.error || 'Unknown error'}. Please try again.`,
        })
        if (soundEnabled) playMessageSound()
        return
      }

      if (data.response) {
        typeResponse(data.response)
      }
    } catch (error) {
      console.error('Chat error:', error)
      addMessage({
        role: 'assistant',
        content: 'I seem to be experiencing a connectivity issue, sir. My systems are working to restore the connection. Please try again in a moment.',
      })
      if (soundEnabled) playMessageSound()
    } finally {
      setIsLoading(false)
    }
  }, [input, isLoading, messages, personalityMode, soundEnabled, addMessage, clearMessages, incrementCommandCount, setAIStatus, typeResponse])

  // Handle quick command
  const handleQuickCommand = useCallback((cmd: string) => {
    handleSend(cmd)
  }, [handleSend])

  // Handle key press
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }, [handleSend])

  // Handle voice transcript
  useEffect(() => {
    if (voiceIsListening && transcript) {
      // Show transcript as preview in input
      setInput(transcript)
    }
  }, [voiceIsListening, transcript])

  // Cleanup typing interval on unmount
  useEffect(() => {
    return () => {
      if (typingIntervalRef.current) {
        clearInterval(typingIntervalRef.current)
      }
    }
  }, [])

  const showQuickCommands = messages.length <= 1

  return (
    <div className="flex flex-col h-full glass-panel overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-neon-cyan/10">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-neon-cyan animate-pulse" />
          <h2 className="text-sm font-mono text-neon-cyan/80 uppercase tracking-wider">
            Communication
          </h2>
        </div>
        <div className="flex items-center gap-2">
          {aiStatus !== 'idle' && (
            <motion.span
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-[10px] font-mono text-neon-cyan/50 uppercase"
            >
              {aiStatus}
            </motion.span>
          )}
          {messages.length > 0 && (
            <button
              onClick={() => {
                clearMessages()
                if (soundEnabled) playMessageSound()
              }}
              className="p-1.5 rounded-md hover:bg-white/5 text-white/30 hover:text-white/60 transition-colors"
              aria-label="Clear chat"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto jarvis-scrollbar py-4">
        {messages.length === 0 && !isTypingEffect && (
          <div className="flex flex-col items-center justify-center h-full gap-4 px-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="w-16 h-16 rounded-full bg-neon-cyan/5 border border-neon-cyan/20 flex items-center justify-center"
            >
              <div className="w-6 h-6 rounded-full bg-neon-cyan/30 animate-pulse" />
            </motion.div>
            <p className="text-sm text-white/30 font-mono text-center">
              J.A.R.V.I.S. Online
            </p>
          </div>
        )}

        {/* Message list */}
        <AnimatePresence>
          {messages.map((msg) => (
            <MessageBubble key={msg.id} message={msg} />
          ))}
        </AnimatePresence>

        {/* Typing effect text */}
        {isTypingEffect && typingText && (
          <div className="px-4 py-2">
            <div className="flex gap-3">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-neon-cyan/10 border border-neon-cyan/30 flex items-center justify-center mt-1">
                <div className="w-3 h-3 rounded-full bg-neon-cyan/60" />
              </div>
              <div className="px-4 py-3 rounded-xl rounded-tl-sm bg-neon-cyan/5 border border-neon-cyan/15 text-sm text-white/90">
                {typingText}
                <span className="typing-cursor ml-0.5" />
              </div>
            </div>
          </div>
        )}

        {/* Typing indicator */}
        {aiStatus === 'thinking' && !isTypingEffect && <TypingIndicator />}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick commands (only when few messages) */}
      <AnimatePresence>
        {showQuickCommands && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
          >
            <QuickCommands onCommand={handleQuickCommand} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Input area */}
      <div className="border-t border-neon-cyan/10 p-3">
        <div className="flex items-center gap-2">
          {/* Text input */}
          <div className="flex-1 relative">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask JARVIS anything..."
              disabled={isLoading}
              className="
                w-full px-4 py-2.5 rounded-lg text-sm font-mono
                bg-white/5 border border-neon-cyan/20
                text-white/90 placeholder:text-white/20
                focus:border-neon-cyan/50 focus:outline-none
                focus:shadow-[0_0_10px_rgba(0,240,255,0.15)]
                disabled:opacity-40 disabled:cursor-not-allowed
                transition-all duration-200
              "
            />
          </div>

          {/* Send button */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => handleSend()}
            disabled={!input.trim() || isLoading}
            className="
              p-2.5 rounded-lg
              bg-neon-cyan/20 border border-neon-cyan/30
              text-neon-cyan
              hover:bg-neon-cyan/30 hover:border-neon-cyan/50
              disabled:opacity-30 disabled:cursor-not-allowed
              transition-all duration-200
            "
            aria-label="Send message"
          >
            <Send className="w-4 h-4" />
          </motion.button>

          {/* Mic button */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              // VoiceInput handles its own toggle, but we provide a trigger here
              const event = new KeyboardEvent('keydown', {
                ctrlKey: true,
                code: 'Space',
                bubbles: true,
              })
              window.dispatchEvent(event)
            }}
            className={`
              p-2.5 rounded-lg
              border transition-all duration-200
              ${voiceIsListening
                ? 'bg-neon-orange/20 border-neon-orange/40 text-neon-orange animate-pulse'
                : 'bg-white/5 border-white/10 text-white/30 hover:border-neon-orange/30 hover:text-neon-orange/60'
              }
            `}
            aria-label="Toggle voice input"
          >
            <Mic className="w-4 h-4" />
          </motion.button>
        </div>

        {/* Keyboard hint */}
        <div className="flex items-center justify-center gap-3 mt-2">
          <span className="text-[10px] font-mono text-white/20">
            Enter to send
          </span>
          <span className="text-[10px] font-mono text-white/10">|</span>
          <span className="text-[10px] font-mono text-white/20">
            Ctrl+Space for voice
          </span>
        </div>
      </div>
    </div>
  )
}
