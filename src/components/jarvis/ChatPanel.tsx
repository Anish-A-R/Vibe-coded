'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Send, Mic, Trash2, VolumeX, Plus, ChevronDown, MessageSquare, Bot, Globe, Languages, Loader2 } from 'lucide-react'
import { useJarvisStore } from '@/hooks/useJarvisStore'
import { useTTS } from '@/hooks/useTTS'
import { parseCommand } from '@/lib/commands'
import { playMessageSound, playThinkingSound, playActivationSound, playDeactivationSound } from '@/lib/sounds'
import { useJarvisToast } from '@/hooks/useJarvisToast'
import { MessageBubble } from './MessageBubble'
import { QuickCommands } from './QuickCommands'
import { ErrorBoundary } from './ErrorBoundary'

// Helper: detect if text likely contains non-English characters
function isLikelyNonEnglish(text: string): boolean {
  // Check for non-ASCII characters that are common in non-English languages
  const nonAscii = text.match(/[^\x00-\x7F]/g)
  if (nonAscii && nonAscii.length > text.length * 0.2) return true
  return false
}

// Helper: translate text using the API
async function translateText(text: string, sourceLang: string): Promise<string> {
  const langPrefix = sourceLang.split('-')[0]
  if (langPrefix === 'en') return text // No translation needed for English

  try {
    const response = await fetch('/api/translate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, sourceLanguage: sourceLang, targetLanguage: 'en' }),
    })

    if (!response.ok) return text // Return original on failure

    const data = await response.json()
    return data.translated || text
  } catch {
    return text // Return original on failure
  }
}

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
    conversations,
    activeConversationId,
    addConversation,
    switchConversation,
    deleteConversation,
    addNotification,
    voiceLanguage,
    isListening: voiceIsListening,
    setIsListening: setVoiceIsListening,
    pendingVoiceInput,
    setPendingVoiceInput,
    voiceTranscript,
  } = useJarvisStore()
  const { addToast } = useJarvisToast()
  const { speak, stop, isSpeaking } = useTTS()

  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [streamingText, setStreamingText] = useState('')
  const [isStreaming, setIsStreaming] = useState(false)
  const [showConvDropdown, setShowConvDropdown] = useState(false)
  const [isSpeakingNow, setIsSpeakingNow] = useState(false)
  const [completedStreamMsg, setCompletedStreamMsg] = useState<string | null>(null)
  const [isTranslating, setIsTranslating] = useState(false)
  const [translatedInput, setTranslatedInput] = useState<string | null>(null)
  const [showOriginalText, setShowOriginalText] = useState<string | null>(null)

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const abortControllerRef = useRef<AbortController | null>(null)
  const hasSentRef = useRef<string>('') // Track last sent text to avoid duplicates

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, streamingText])

  // Track speaking state with interval
  useEffect(() => {
    const check = setInterval(() => {
      setIsSpeakingNow(isSpeaking())
    }, 500)
    return () => clearInterval(check)
  }, [isSpeaking])

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  // Close dropdown when clicking outside
  useEffect(() => {
    if (!showConvDropdown) return
    const handleClick = () => setShowConvDropdown(false)
    const timer = setTimeout(() => {
      document.addEventListener('click', handleClick, { once: true })
    }, 0)
    return () => {
      clearTimeout(timer)
      document.removeEventListener('click', handleClick)
    }
  }, [showConvDropdown])

  // Cleanup abort controller on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
    }
  }, [])

  // Handle sending a message with translation support
  const handleSend = useCallback(async (text?: string, preTranslated?: string) => {
    const messageText = (text || input).trim()
    if (!messageText || isLoading) return

    // Prevent duplicate sends of the same text within 2 seconds
    if (hasSentRef.current === messageText) return
    hasSentRef.current = messageText
    setTimeout(() => { hasSentRef.current = '' }, 2000)

    setInput('')
    setCompletedStreamMsg(null)
    setTranslatedInput(null)
    setShowOriginalText(null)
    incrementCommandCount()

    // Determine if translation is needed
    let englishMessage = preTranslated || messageText
    const langPrefix = voiceLanguage.split('-')[0]

    if (!preTranslated && langPrefix !== 'en' && isLikelyNonEnglish(messageText)) {
      // Translate non-English input before processing
      setIsTranslating(true)
      setAIStatus('thinking')

      try {
        englishMessage = await translateText(messageText, voiceLanguage)
        setTranslatedInput(englishMessage)
        setShowOriginalText(messageText)
      } catch {
        // Translation failed, use original
        englishMessage = messageText
      } finally {
        setIsTranslating(false)
      }
    }

    // Parse command using the English translation
    const commandResult = parseCommand(englishMessage)

    // Add user message (show original text in the user's language)
    addMessage({ role: 'user', content: messageText })

    // Handle non-chat commands locally
    if (commandResult.type !== 'chat') {
      switch (commandResult.type) {
        case 'url': {
          if (commandResult.url) {
            window.open(commandResult.url, '_blank', 'noopener,noreferrer')
            addToast('info', 'Opening URL', commandResult.message || `Opening ${commandResult.url}`)
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
            addToast('info', 'Chat Cleared', 'Conversation history has been cleared.')
            if (soundEnabled) playMessageSound()
            return
          }
          if (commandResult.action === 'diagnostics') {
            addToast('info', 'Diagnostics', 'Opening diagnostics panel...')
          }
          if (commandResult.action === 'scan') {
            addToast('success', 'System Scan', 'All systems operational.')
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
            addToast('info', 'Search Initiated', commandResult.message || `Searching for: ${commandResult.query}`)
          }
          if (commandResult.message) {
            addMessage({ role: 'assistant', content: commandResult.message })
            if (soundEnabled) playMessageSound()
          }
          return
        }
        case 'generate': {
          if (commandResult.prompt) {
            handleImageGeneration(commandResult.prompt)
          }
          return
        }
        case 'websearch': {
          if (commandResult.query) {
            handleWebSearch(commandResult.query)
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

    // Chat: Send to AI API with streaming
    setIsLoading(true)
    setAIStatus('thinking')
    setStreamingText('')
    setIsStreaming(false)
    if (soundEnabled) playThinkingSound()

    // Create abort controller for this request
    const abortController = new AbortController()
    abortControllerRef.current = abortController

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
          stream: true,
          language: voiceLanguage,
          translatedMessage: englishMessage !== messageText ? englishMessage : undefined,
        }),
        signal: abortController.signal,
      })

      if (!response.ok) {
        const data = await response.json().catch(() => ({ error: 'Unknown error' }))
        addMessage({
          role: 'assistant',
          content: `I encountered an error: ${data.error || 'Unknown error'}. Please try again.`,
        })
        if (soundEnabled) playMessageSound()
        return
      }

      // Check if response is SSE stream
      const contentType = response.headers.get('content-type') || ''
      if (contentType.includes('text/event-stream')) {
        // Consume SSE stream
        const reader = response.body?.getReader()
        if (!reader) {
          throw new Error('No readable stream available')
        }

        const decoder = new TextDecoder()
        let fullText = ''
        let firstChunkReceived = false
        let buffer = ''

        setIsStreaming(true)

        while (true) {
          const { done, value } = await reader.read()
          if (done) break

          buffer += decoder.decode(value, { stream: true })

          // Process complete SSE messages from buffer
          const lines = buffer.split('\n')
          buffer = lines.pop() || ''

          for (const line of lines) {
            const trimmed = line.trim()
            if (!trimmed || !trimmed.startsWith('data: ')) continue

            const data = trimmed.slice(6)
            if (data === '[DONE]') continue

            try {
              const parsed = JSON.parse(data)
              if (parsed.error) {
                addMessage({
                  role: 'assistant',
                  content: `I encountered an error: ${parsed.error}. Please try again.`,
                })
                if (soundEnabled) playMessageSound()
                return
              }
              // Handle translation info from server
              if (parsed.translatedInput && !translatedInput) {
                setTranslatedInput(parsed.translatedInput)
                setShowOriginalText(parsed.originalInput)
              }
              if (parsed.content) {
                fullText += parsed.content
                setStreamingText(fullText)

                if (!firstChunkReceived) {
                  firstChunkReceived = true
                  setAIStatus('speaking')
                }
              }
            } catch {
              // Skip malformed JSON lines
            }
          }
        }

        // Process any remaining buffer
        if (buffer.trim()) {
          const trimmed = buffer.trim()
          if (trimmed.startsWith('data: ') && trimmed.slice(6) !== '[DONE]') {
            try {
              const parsed = JSON.parse(trimmed.slice(6))
              if (parsed.content) {
                fullText += parsed.content
                setStreamingText(fullText)
              }
            } catch {
              // Skip
            }
          }
        }

        // Streaming complete
        if (fullText) {
          setCompletedStreamMsg(fullText)
          addMessage({ role: 'assistant', content: fullText })
          if (soundEnabled) playMessageSound()

          // TTS - speak the response
          if (soundEnabled) {
            const speakText = fullText.length > 500 ? fullText.slice(0, 500) + '...' : fullText
            setTimeout(() => speak(speakText), 100)
          }

          // Notification
          addNotification({
            type: 'info',
            title: 'JARVIS Responded',
            message: fullText.slice(0, 80) + (fullText.length > 80 ? '...' : ''),
            icon: 'message-circle',
          })
        }
      } else {
        // Non-streaming JSON response (fallback)
        const data = await response.json()
        if (data.error) {
          addMessage({
            role: 'assistant',
            content: `I encountered an error: ${data.error}. Please try again.`,
          })
          if (soundEnabled) playMessageSound()
          return
        }
        if (data.response) {
          setIsStreaming(true)
          setStreamingText(data.response)
          setAIStatus('speaking')
          setCompletedStreamMsg(data.response)
          addMessage({ role: 'assistant', content: data.response })
          if (soundEnabled) playMessageSound()

          if (data.translatedInput) {
            setTranslatedInput(data.translatedInput)
            setShowOriginalText(data.originalInput || messageText)
          }

          if (soundEnabled) {
            const speakText = data.response.length > 500 ? data.response.slice(0, 500) + '...' : data.response
            setTimeout(() => speak(speakText), 100)
          }

          addNotification({
            type: 'info',
            title: 'JARVIS Responded',
            message: data.response.slice(0, 80) + (data.response.length > 80 ? '...' : ''),
            icon: 'message-circle',
          })
        }
      }
    } catch (error) {
      if ((error as Error).name === 'AbortError') {
        // User cancelled the request
      } else {
        console.error('Chat error:', error)
        addToast('error', 'Connection Error', 'Unable to reach AI systems. Please try again.')
        addMessage({
          role: 'assistant',
          content: 'I seem to be experiencing a connectivity issue, sir. My systems are working to restore the connection. Please try again in a moment.',
        })
        if (soundEnabled) playMessageSound()
      }
    } finally {
      setIsLoading(false)
      setAIStatus('idle')
      // Clear streaming state after a small delay to prevent flash
      setTimeout(() => {
        setStreamingText('')
        setIsStreaming(false)
        setCompletedStreamMsg(null)
      }, 100)
      abortControllerRef.current = null
    }
  }, [input, isLoading, messages, personalityMode, soundEnabled, addMessage, clearMessages, incrementCommandCount, setAIStatus, stop, addToast, speak, addNotification, voiceLanguage, translatedInput])

  // Handle image generation
  const handleImageGeneration = useCallback(async (prompt: string) => {
    setIsLoading(true)
    setAIStatus('thinking')
    addMessage({ role: 'assistant', content: `Generating image: "${prompt}"...\n\nThis may take a moment, sir.` })

    try {
      const response = await fetch('/api/image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
      })

      const data = await response.json()

      if (data.imageUrl) {
        addMessage({
          role: 'assistant',
          content: `Here's what I generated for "${prompt}":\n\n![${prompt}](${data.imageUrl})`,
        })
        if (soundEnabled) playMessageSound()
      } else {
        addMessage({
          role: 'assistant',
          content: `I wasn't able to generate that image, sir. ${data.error || 'Please try a different description.'}`,
        })
      }
    } catch {
      addMessage({
        role: 'assistant',
        content: 'Image generation failed, sir. The creative subsystems may be offline. Please try again.',
      })
    } finally {
      setIsLoading(false)
      setAIStatus('idle')
    }
  }, [addMessage, setAIStatus, soundEnabled])

  // Handle web search
  const handleWebSearch = useCallback(async (query: string) => {
    setIsLoading(true)
    setAIStatus('thinking')

    try {
      const response = await fetch('/api/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query }),
      })

      const data = await response.json()

      if (data.results) {
        addMessage({
          role: 'assistant',
          content: data.results,
        })
        if (soundEnabled) playMessageSound()
      } else {
        addMessage({
          role: 'assistant',
          content: `I couldn't find results for "${query}", sir. ${data.error || 'Please try a different query.'}`,
        })
      }
    } catch {
      addMessage({
        role: 'assistant',
        content: 'Web search failed, sir. The search subsystems may be experiencing issues. Please try again.',
      })
    } finally {
      setIsLoading(false)
      setAIStatus('idle')
    }
  }, [addMessage, setAIStatus, soundEnabled])

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

  // Watch for pending voice input from VoiceInput component (via store)
  // When a voice transcript arrives, auto-send it and clear the pending state
  useEffect(() => {
    if (pendingVoiceInput && !isLoading) {
      handleSend(pendingVoiceInput)
      setPendingVoiceInput(null)
    }
  }, [pendingVoiceInput, handleSend, setPendingVoiceInput, isLoading])

  // Show interim transcript in input while speaking (using store's voiceTranscript)
  useEffect(() => {
    if (voiceIsListening && voiceTranscript) {
      setInput(voiceTranscript)
    }
  }, [voiceIsListening, voiceTranscript])

  const showQuickCommands = messages.length <= 1

  // Count non-system messages
  const visibleMessageCount = messages.filter((m) => m.role !== 'system').length

  // Get active conversation title
  const activeConv = conversations.find((c) => c.id === activeConversationId)
  const convTitle = activeConv?.title || 'New Conversation'

  // Get language display name
  const langNames: Record<string, string> = {
    'en-US': 'EN', 'en-GB': 'EN', 'es-ES': 'ES', 'fr-FR': 'FR',
    'de-DE': 'DE', 'hi-IN': 'HI', 'ja-JP': 'JA', 'zh-CN': 'ZH',
    'pt-BR': 'PT', 'ko-KR': 'KO', 'ar-SA': 'AR', 'it-IT': 'IT', 'ru-RU': 'RU',
  }
  const langCode = langNames[voiceLanguage] || 'EN'

  return (
    <div className="flex flex-col h-full glass-panel overflow-hidden relative">
      {/* Animated gradient border at top */}
      <div className="absolute top-0 left-0 right-0 h-[1px] overflow-hidden">
        <motion.div
          className="h-full w-[200%]"
          style={{
            background: 'linear-gradient(90deg, transparent, rgba(0,240,255,0.6), rgba(0,240,255,0.1), rgba(255,165,0,0.4), transparent, rgba(0,240,255,0.6), transparent)',
            backgroundSize: '200% 100%',
          }}
          animate={{
            backgroundPosition: ['0% 0%', '200% 0%'],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: 'linear',
          }}
        />
      </div>

      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-neon-cyan/10">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-neon-cyan animate-pulse" />
          <h2 className="text-sm font-mono text-neon-cyan/80 uppercase tracking-wider">
            Communication
          </h2>
          {visibleMessageCount > 0 && (
            <span className="text-[10px] font-mono text-white/25 ml-1">
              {visibleMessageCount} msg{visibleMessageCount !== 1 ? 's' : ''}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {/* Language indicator */}
          <div className="flex items-center gap-1 px-1.5 py-0.5 rounded border border-neon-cyan/10 bg-neon-cyan/5">
            <Globe className="w-2.5 h-2.5 text-neon-cyan/40" />
            <span className="text-[9px] font-mono text-neon-cyan/50">{langCode}</span>
          </div>
          {aiStatus !== 'idle' && (
            <motion.span
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-[10px] font-mono text-neon-cyan/50 uppercase"
            >
              {isTranslating ? 'translating' : aiStatus}
            </motion.span>
          )}
          {isSpeakingNow && (
            <button
              onClick={stop}
              className="p-1.5 rounded-md hover:bg-white/5 text-neon-orange/60 hover:text-neon-orange transition-colors"
              aria-label="Stop speaking"
            >
              <VolumeX className="w-3.5 h-3.5" />
            </button>
          )}
          {messages.length > 0 && (
            <button
              onClick={() => {
                clearMessages()
                stop()
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

      {/* Conversation Selector */}
      <div className="relative border-b border-neon-cyan/10">
        <div className="flex items-center gap-2 px-4 py-2">
          {/* New conversation button */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              addConversation()
              if (soundEnabled) playMessageSound()
              addNotification({
                type: 'info',
                title: 'New Conversation',
                message: 'Started a new chat session',
                icon: 'plus',
              })
            }}
            className="flex-shrink-0 p-1.5 rounded-md text-white/30 hover:text-neon-cyan/70 bg-white/[0.02] border border-white/5 hover:border-neon-cyan/20 transition-all"
            aria-label="New conversation"
            title="New Chat"
          >
            <Plus className="w-3.5 h-3.5" />
          </motion.button>

          {/* Conversation dropdown */}
          <button
            onClick={(e) => {
              e.stopPropagation()
              setShowConvDropdown(!showConvDropdown)
            }}
            className="flex-1 flex items-center gap-2 px-2 py-1.5 rounded-md text-[11px] font-mono text-white/40 hover:text-white/60 bg-white/[0.02] border border-white/5 hover:border-neon-cyan/15 transition-all min-w-0"
          >
            <MessageSquare className="w-3 h-3 flex-shrink-0 text-neon-cyan/40" />
            <span className="truncate flex-1 text-left">{convTitle}</span>
            <ChevronDown className={`w-3 h-3 flex-shrink-0 transition-transform ${showConvDropdown ? 'rotate-180' : ''}`} />
          </button>
        </div>

        {/* Dropdown */}
        <AnimatePresence>
          {showConvDropdown && (
            <motion.div
              initial={{ opacity: 0, y: -5, height: 0 }}
              animate={{ opacity: 1, y: 0, height: 'auto' }}
              exit={{ opacity: 0, y: -5, height: 0 }}
              transition={{ duration: 0.15 }}
              className="absolute left-4 right-4 top-full z-20 overflow-hidden rounded-md border border-neon-cyan/15 bg-black/95 backdrop-blur-xl shadow-lg shadow-black/50"
            >
              <div className="max-h-48 overflow-y-auto jarvis-scrollbar py-1">
                {conversations.length === 0 ? (
                  <div className="px-3 py-2 text-[10px] font-mono text-white/20 text-center">
                    No conversations yet
                  </div>
                ) : (
                  conversations.map((conv) => (
                    <div
                      key={conv.id}
                      className={`group flex items-center gap-2 px-3 py-2 cursor-pointer transition-colors ${
                        conv.id === activeConversationId
                          ? 'bg-neon-cyan/10 text-neon-cyan/70'
                          : 'text-white/40 hover:bg-white/5 hover:text-white/60'
                      }`}
                      onClick={(e) => {
                        e.stopPropagation()
                        switchConversation(conv.id)
                        setShowConvDropdown(false)
                      }}
                    >
                      <MessageSquare className="w-3 h-3 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="text-[11px] font-mono truncate">{conv.title}</div>
                        <div className="text-[9px] font-mono text-white/20">
                          {conv.messages.length} msg{conv.messages.length !== 1 ? 's' : ''}
                        </div>
                      </div>
                      {conversations.length > 1 && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            deleteConversation(conv.id)
                          }}
                          className="opacity-0 group-hover:opacity-100 p-1 rounded text-white/20 hover:text-red-400 transition-all"
                          aria-label="Delete conversation"
                        >
                          <Trash2 className="w-2.5 h-2.5" />
                        </button>
                      )}
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto jarvis-scrollbar py-4">
        {messages.length === 0 && !isStreaming && (
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
            <p className="text-xs text-white/15 font-mono text-center max-w-[250px]">
              Say &ldquo;Hey Jarvis&rdquo; or type a message to start
            </p>
            {/* Multilingual hint */}
            {voiceLanguage.split('-')[0] !== 'en' && (
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-neon-cyan/5 border border-neon-cyan/10 mt-1">
                <Languages className="w-3 h-3 text-neon-cyan/40" />
                <span className="text-[10px] font-mono text-neon-cyan/40">
                  Multilingual mode active — speak in any language
                </span>
              </div>
            )}
          </div>
        )}

        {/* Translation indicator - show when a translation happened */}
        <AnimatePresence>
          {translatedInput && showOriginalText && (
            <motion.div
              initial={{ opacity: 0, y: -5, height: 0 }}
              animate={{ opacity: 1, y: 0, height: 'auto' }}
              exit={{ opacity: 0, y: -5, height: 0 }}
              className="mx-4 mb-2 px-3 py-2 rounded-lg bg-neon-cyan/5 border border-neon-cyan/10 flex items-center gap-2"
            >
              <Languages className="w-3 h-3 text-neon-cyan/40 flex-shrink-0" />
              <span className="text-[10px] font-mono text-neon-cyan/40">
                Translated: &ldquo;{showOriginalText}&rdquo; → &ldquo;{translatedInput}&rdquo;
              </span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Message list */}
        <ErrorBoundary>
          {messages.map((msg) => (
            <MessageBubble key={msg.id} message={msg} />
          ))}
        </ErrorBoundary>

        {/* Translating indicator */}
        {isTranslating && (
          <div className="px-4 py-2">
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-neon-cyan/5 border border-neon-cyan/10">
              <div className="relative w-5 h-5 flex-shrink-0">
                <Languages className="w-4 h-4 text-neon-cyan/60" />
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-mono text-neon-cyan/50 uppercase tracking-wider">
                  Translating
                </span>
                <span className="text-xs font-mono text-white/30">
                  Converting to English for processing...
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Streaming text with dramatic cursor */}
        {isStreaming && streamingText && !completedStreamMsg && (
          <div className="px-4 py-2">
            <div className="flex gap-3">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-neon-cyan/10 border border-neon-cyan/30 flex items-center justify-center mt-1">
                <Bot className="w-4 h-4 text-neon-cyan/60" />
              </div>
              <div className="relative px-4 py-3 rounded-xl rounded-tl-sm bg-neon-cyan/5 border border-neon-cyan/15 text-sm text-white/90 hud-scanline-h overflow-hidden">
                {/* Holographic left border */}
                <div
                  className="absolute top-0 left-0 w-[2px] h-full"
                  style={{
                    background: 'linear-gradient(to bottom, transparent, rgba(0,240,255,0.4), rgba(0,240,255,0.15), transparent)',
                  }}
                />
                <span>{streamingText}</span>
                {/* Dramatic blinking cyan rectangle cursor */}
                <motion.span
                  className="inline-block w-[7px] h-[15px] bg-neon-cyan/90 ml-0.5 align-middle rounded-[1px]"
                  animate={{
                    opacity: [1, 1, 0, 0],
                  }}
                  transition={{
                    duration: 0.8,
                    repeat: Infinity,
                    times: [0, 0.5, 0.5, 1],
                    ease: 'linear',
                  }}
                  style={{
                    boxShadow: '0 0 6px rgba(0,240,255,0.6), 0 0 12px rgba(0,240,255,0.3)',
                  }}
                />
                {/* Processing indicator below streaming text */}
                <div className="flex items-center gap-2 mt-2 pt-1.5 border-t border-neon-cyan/10">
                  <motion.div
                    className="flex gap-[2px]"
                    animate={{ opacity: [0.3, 1, 0.3] }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
                  >
                    {[0, 1, 2].map((i) => (
                      <motion.div
                        key={i}
                        className="w-[3px] h-[3px] rounded-full bg-neon-cyan/60"
                        animate={{
                          opacity: [0.2, 1, 0.2],
                          scale: [0.8, 1.2, 0.8],
                        }}
                        transition={{
                          duration: 1,
                          repeat: Infinity,
                          delay: i * 0.2,
                          ease: 'easeInOut',
                        }}
                      />
                    ))}
                  </motion.div>
                  <span className="text-[9px] font-mono text-neon-cyan/30 uppercase tracking-wider">
                    Processing...
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Thinking indicator with spinning orb */}
        {aiStatus === 'thinking' && !isStreaming && !isTranslating && (
          <div className="px-2 py-2">
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-neon-cyan/5 border border-neon-cyan/10">
              <div className="relative w-5 h-5 flex-shrink-0">
                <motion.div
                  className="absolute inset-0 rounded-full border border-neon-cyan/40"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                />
                <motion.div
                  className="absolute inset-1 rounded-full bg-neon-cyan/30"
                  animate={{
                    scale: [1, 1.3, 1],
                    opacity: [0.4, 0.8, 0.4],
                  }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
                />
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-mono text-neon-cyan/50 uppercase tracking-wider">
                  Processing
                </span>
                <span className="text-xs font-mono text-white/30">
                  Analyzing your request...
                </span>
              </div>
            </div>
          </div>
        )}

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
        {/* JARVIS label and status */}
        <div className="flex items-center gap-2 mb-2">
          <span className="text-[9px] font-mono text-neon-cyan/30 tracking-[0.2em]">
            JARVIS
          </span>
          <div className="h-[1px] flex-1 bg-neon-cyan/5" />
          {/* Pulsing dot indicator for AI status */}
          <div className="flex items-center gap-1.5">
            <motion.div
              className={`w-1.5 h-1.5 rounded-full ${
                isTranslating
                  ? 'bg-purple-400'
                  : aiStatus === 'idle'
                  ? 'bg-neon-cyan/40'
                  : aiStatus === 'thinking'
                  ? 'bg-neon-cyan'
                  : aiStatus === 'speaking'
                  ? 'bg-neon-orange'
                  : 'bg-neon-orange/60'
              }`}
              animate={{
                scale: isTranslating || aiStatus === 'idle' ? [1, 1, 1] : [1, 1.5, 1],
                opacity: isTranslating ? [0.5, 1, 0.5] : aiStatus === 'idle' ? [0.4, 0.4, 0.4] : [0.5, 1, 0.5],
              }}
              transition={{
                duration: isTranslating ? 0.8 : aiStatus === 'idle' ? 2 : 1,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            />
            <span className="text-[9px] font-mono text-white/15 uppercase">
              {isTranslating ? 'translating' : aiStatus}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Text input */}
          <div className="flex-1 relative">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={voiceLanguage.split('-')[0] !== 'en' ? "Ask JARVIS in any language..." : "Ask JARVIS anything..."}
              disabled={isLoading || isTranslating}
              className="
                w-full px-4 py-3 rounded-lg text-sm font-mono
                bg-white/5 border border-neon-cyan/20
                text-white/90 placeholder:text-white/20
                focus:border-neon-cyan/50 focus:outline-none
                focus:shadow-[0_0_10px_rgba(0,240,255,0.15)]
                disabled:opacity-40 disabled:cursor-not-allowed
                transition-all duration-200
              "
            />
            {/* Translation spinner */}
            {isTranslating && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                <Loader2 className="w-4 h-4 text-neon-cyan/40 animate-spin" />
              </div>
            )}
          </div>

          {/* Send button */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => handleSend()}
            disabled={!input.trim() || isLoading || isTranslating}
            className="
              p-3 rounded-lg
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
              if (soundEnabled) {
                if (!voiceIsListening) {
                  playActivationSound()
                } else {
                  playDeactivationSound()
                }
              }
              setVoiceIsListening(!voiceIsListening)
            }}
            className={`
              p-3 rounded-lg
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
        <div className="flex items-center justify-center gap-3 mt-2 flex-wrap">
          <span className="text-[10px] font-mono text-white/20">
            Enter to send
          </span>
          <span className="text-[10px] font-mono text-white/10">|</span>
          <span className="text-[10px] font-mono text-white/20">
            Ctrl+Space for voice
          </span>
          <span className="text-[10px] font-mono text-white/10">|</span>
          <span className="text-[10px] font-mono text-white/20">
            Say &ldquo;Hey Jarvis&rdquo;
          </span>
          {voiceLanguage.split('-')[0] !== 'en' && (
            <>
              <span className="text-[10px] font-mono text-white/10">|</span>
              <span className="text-[10px] font-mono text-neon-cyan/30 flex items-center gap-1">
                <Languages className="w-2.5 h-2.5" />
                Auto-translate on
              </span>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
