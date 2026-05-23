'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import {
  Send,
  X,
  Mic,
  MicOff,
  Bot,
  User,
  Volume2,
  VolumeX,
  RotateCcw,
  Loader2,
  Sparkles,
} from 'lucide-react'
import { useJarvisStore } from '@/hooks/useJarvisStore'
import { useTTS } from '@/hooks/useTTS'
import { useJarvisToast } from '@/hooks/useJarvisToast'
import { parseCommand } from '@/lib/commands'
import { playMessageSound, playThinkingSound } from '@/lib/sounds'

// ─── Props ────────────────────────────────────────────────────────────
interface VoiceChatOverlayProps {
  open: boolean
  onClose: () => void
}

// ─── Overlay Component ────────────────────────────────────────────────
export function VoiceChatOverlay({ open, onClose }: VoiceChatOverlayProps) {
  const {
    messages,
    addMessage,
    clearMessages,
    aiStatus,
    setAIStatus,
    voiceTranscript,
    isListening,
    pendingVoiceInput,
    setPendingVoiceInput,
    voiceLanguage,
    personalityMode,
    soundEnabled,
    incrementCommandCount,
    addNotification,
  } = useJarvisStore()

  const { speak, stop, isSpeaking } = useTTS()
  const { addToast } = useJarvisToast()

  // ── Local state ──
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [streamingText, setStreamingText] = useState('')
  const [isStreaming, setIsStreaming] = useState(false)
  const [isSpeakingNow, setIsSpeakingNow] = useState(false)
  const [streamingMsgId, setStreamingMsgId] = useState<string | null>(null)
  const [completedStreamMsg, setCompletedStreamMsg] = useState<string | null>(null)

  // ── Refs ──
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const abortControllerRef = useRef<AbortController | null>(null)
  const isLoadingRef = useRef(false)
  const hasSentRef = useRef('')
  const panelRef = useRef<HTMLDivElement>(null)

  // ── Auto-scroll ──
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, streamingText, streamingMsgId])

  // ── Track speaking state ──
  useEffect(() => {
    const check = setInterval(() => {
      setIsSpeakingNow(isSpeaking())
    }, 500)
    return () => clearInterval(check)
  }, [isSpeaking])

  // ── Keyboard: Escape to close, focus input on open ──
  useEffect(() => {
    if (!open) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        onClose()
      }
    }

    // Focus input when panel opens
    const timer = setTimeout(() => inputRef.current?.focus(), 350)

    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      clearTimeout(timer)
    }
  }, [open, onClose])

  // ── Cleanup on unmount ──
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
    }
  }, [])

  // ── Handle sending a message ──
  const handleSend = useCallback(
    async (text?: string) => {
      const messageText = (text || input).trim()
      if (!messageText || isLoadingRef.current) return

      // Prevent duplicate sends
      if (hasSentRef.current === messageText) return
      hasSentRef.current = messageText
      setTimeout(() => {
        hasSentRef.current = ''
      }, 2000)

      isLoadingRef.current = true
      setInput('')
      setStreamingMsgId(null)
      setCompletedStreamMsg(null)
      incrementCommandCount()

      // Parse command
      const commandResult = parseCommand(messageText)

      // Add user message
      addMessage({ role: 'user', content: messageText, isVoice: !!text })

      // Handle non-chat commands locally
      if (commandResult.type !== 'chat') {
        switch (commandResult.type) {
          case 'url': {
            if (commandResult.url) {
              const newWindow = window.open(commandResult.url, '_blank', 'noopener,noreferrer')
              if (!newWindow || newWindow.closed) {
                addMessage({
                  role: 'assistant',
                  content: `${commandResult.message || `Opening ${commandResult.url}`}\n\n[Click here to open: ${commandResult.url}](${commandResult.url})`,
                })
              } else {
                addMessage({
                  role: 'assistant',
                  content: `${commandResult.message || `Opening ${commandResult.url}`}\n\n[Open again: ${commandResult.url}](${commandResult.url})`,
                })
              }
              addToast('info', 'Opening URL', commandResult.message || `Opening ${commandResult.url}`)
            }
            if (commandResult.message && !commandResult.url) {
              addMessage({ role: 'assistant', content: commandResult.message })
            }
            if (soundEnabled) playMessageSound()
            isLoadingRef.current = false
            return
          }
          case 'system': {
            if (commandResult.action === 'clear') {
              clearMessages()
              addToast('info', 'Chat Cleared', 'Conversation history has been cleared.')
              if (soundEnabled) playMessageSound()
              isLoadingRef.current = false
              return
            }
            if (commandResult.message) {
              addMessage({ role: 'assistant', content: commandResult.message })
              if (soundEnabled) playMessageSound()
            }
            isLoadingRef.current = false
            return
          }
          case 'search': {
            if (commandResult.url) {
              const newWindow = window.open(commandResult.url, '_blank', 'noopener,noreferrer')
              if (!newWindow || newWindow.closed) {
                addMessage({
                  role: 'assistant',
                  content: `${commandResult.message || `Searching for: ${commandResult.query}`}\n\n[Click here to view search results](${commandResult.url})`,
                })
              } else {
                addMessage({
                  role: 'assistant',
                  content: `${commandResult.message || `Searching for: ${commandResult.query}`}\n\n[View search results](${commandResult.url})`,
                })
              }
              addToast('info', 'Search Initiated', commandResult.message || `Searching for: ${commandResult.query}`)
            } else if (commandResult.message) {
              addMessage({ role: 'assistant', content: commandResult.message })
            }
            if (soundEnabled) playMessageSound()
            isLoadingRef.current = false
            return
          }
          case 'generate':
          case 'websearch':
          case 'joke':
          case 'command':
          case 'error':
          default: {
            if (commandResult.message) {
              addMessage({ role: 'assistant', content: commandResult.message })
              if (soundEnabled) playMessageSound()
            }
            isLoadingRef.current = false
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

      const abortController = new AbortController()
      abortControllerRef.current = abortController

      try {
        const currentMessages = useJarvisStore.getState().messages
        const history = currentMessages.map((m) => ({
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
          const reader = response.body?.getReader()
          if (!reader) throw new Error('No readable stream available')

          const decoder = new TextDecoder()
          let fullText = ''
          let firstChunkReceived = false
          let buffer = ''

          setIsStreaming(true)

          while (true) {
            const { done, value } = await reader.read()
            if (done) break

            buffer += decoder.decode(value, { stream: true })

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
                if (parsed.content) {
                  fullText += parsed.content
                  setStreamingText(fullText)

                  if (!firstChunkReceived) {
                    firstChunkReceived = true
                    setAIStatus('speaking')
                  }
                }
              } catch {
                // Skip malformed JSON
              }
            }
          }

          // Process remaining buffer
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
            // Add message to store and track its ID for streaming display
            const state = useJarvisStore.getState()
            const beforeIds = new Set(state.messages.map((m) => m.id))
            addMessage({ role: 'assistant', content: fullText })
            // Find the new message ID by comparing before/after
            const afterState = useJarvisStore.getState()
            const newMsg = afterState.messages.find((m) => !beforeIds.has(m.id))
            if (newMsg) {
              setStreamingMsgId(newMsg.id)
            }
            if (soundEnabled) playMessageSound()

            if (soundEnabled) {
              setAIStatus('speaking')
              const speakText = fullText.length > 500 ? fullText.slice(0, 500) + '...' : fullText
              setTimeout(() => speak(speakText), 100)
            }

            addNotification({
              type: 'info',
              title: 'JARVIS Responded',
              message: fullText.slice(0, 80) + (fullText.length > 80 ? '...' : ''),
              icon: 'message-circle',
            })
          }

          // Clear streaming state after a short delay to allow the message to render
          setCompletedStreamMsg(fullText)
          setTimeout(() => {
            setIsStreaming(false)
            setStreamingText('')
            setStreamingMsgId(null)
            setCompletedStreamMsg(null)
          }, 150)
        } else {
          // Non-streaming JSON fallback
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
            addMessage({ role: 'assistant', content: data.response })
            if (soundEnabled) playMessageSound()

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

            // Clear streaming state after a short delay
            setCompletedStreamMsg(data.response)
            setTimeout(() => {
              setIsStreaming(false)
              setStreamingText('')
              setCompletedStreamMsg(null)
            }, 150)
          }
        }
      } catch (error) {
        if ((error as Error).name === 'AbortError') {
          // User cancelled
        } else {
          console.error('Chat error:', error)
          addToast('error', 'Connection Error', 'Unable to reach AI systems. Please try again.')
          addMessage({
            role: 'assistant',
            content: 'I seem to be experiencing a connectivity issue, sir. My systems are working to restore the connection.',
          })
          if (soundEnabled) playMessageSound()
        }
      } finally {
        isLoadingRef.current = false
        setIsLoading(false)
        if (!soundEnabled || !isSpeaking()) {
          setAIStatus('idle')
        }
        abortControllerRef.current = null
      }
    },
    [
      input,
      personalityMode,
      soundEnabled,
      addMessage,
      clearMessages,
      incrementCommandCount,
      setAIStatus,
      addToast,
      speak,
      addNotification,
      voiceLanguage,
      isSpeaking,
    ]
  )

  // ── Handle key press ──
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault()
        handleSend()
      }
    },
    [handleSend]
  )

  // ── Watch for pending voice input ──
  useEffect(() => {
    if (pendingVoiceInput && !isLoadingRef.current) {
      handleSend(pendingVoiceInput)
      setPendingVoiceInput(null)
    }
  }, [pendingVoiceInput, handleSend, setPendingVoiceInput])

  // ── Show interim transcript in input while speaking ──
  useEffect(() => {
    if (isListening && voiceTranscript) {
      setInput(voiceTranscript)
    }
  }, [isListening, voiceTranscript])

  // ── Stop TTS and cancel request on close ──
  const handleClose = useCallback(() => {
    stop()
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }
    onClose()
  }, [onClose, stop])

  // ── Clear chat handler ──
  const handleClearChat = useCallback(() => {
    clearMessages()
    stop()
    addToast('info', 'Chat Cleared', 'Conversation history has been cleared.')
    if (soundEnabled) playMessageSound()
  }, [clearMessages, stop, addToast, soundEnabled])

  // ── Count visible messages ──
  const visibleMessageCount = messages.filter((m) => m.role !== 'system').length

  // ── Render ──
  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop — subtle, click to close on mobile */}
          <motion.div
            key="voice-chat-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm lg:hidden"
            onClick={handleClose}
          />

          {/* Chat panel */}
          <motion.div
            key="voice-chat-panel"
            ref={panelRef}
            initial={{ x: '100%', opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: '100%', opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30, mass: 0.8 }}
            className="fixed top-0 right-0 z-50 h-full w-full sm:w-[420px] flex flex-col glass-panel-strong overflow-hidden"
            style={{
              borderLeft: '1px solid rgba(0,240,255,0.15)',
              borderRadius: 0,
              borderTopLeftRadius: '0px',
              borderBottomLeftRadius: '0px',
            }}
          >
            {/* ── Animated border glow ── */}
            <div className="absolute top-0 left-0 right-0 h-[1px] overflow-hidden z-10">
              <motion.div
                className="h-full w-[200%]"
                style={{
                  background:
                    'linear-gradient(90deg, transparent, rgba(0,240,255,0.6), rgba(0,240,255,0.1), rgba(255,165,0,0.4), transparent, rgba(0,240,255,0.6), transparent)',
                  backgroundSize: '200% 100%',
                }}
                animate={{ backgroundPosition: ['0% 0%', '200% 0%'] }}
                transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
              />
            </div>
            {/* Left edge animated border */}
            <div className="absolute top-0 left-0 bottom-0 w-[1px] overflow-hidden z-10">
              <motion.div
                className="w-full h-[200%]"
                style={{
                  background:
                    'linear-gradient(180deg, transparent, rgba(0,240,255,0.5), rgba(0,240,255,0.1), transparent, rgba(0,240,255,0.5), transparent)',
                  backgroundSize: '100% 200%',
                }}
                animate={{ backgroundPosition: ['0% 0%', '0% 200%'] }}
                transition={{ duration: 6, repeat: Infinity, ease: 'linear' }}
              />
            </div>

            {/* ── Header ── */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-neon-cyan/10 flex-shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-2 h-2 rounded-full bg-neon-cyan animate-pulse" />
                <h2 className="text-xs font-mono text-neon-cyan/80 uppercase tracking-[0.15em]">
                  Voice Chat
                </h2>
                {visibleMessageCount > 0 && (
                  <span className="text-[9px] font-mono text-white/20 ml-0.5">
                    {visibleMessageCount}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1.5">
                {/* AI status pill */}
                {aiStatus !== 'idle' && (
                  <motion.span
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-[9px] font-mono text-neon-cyan/50 uppercase px-1.5 py-0.5 rounded-full bg-neon-cyan/5 border border-neon-cyan/10"
                  >
                    {aiStatus}
                  </motion.span>
                )}

                {/* Stop speaking */}
                {isSpeakingNow && (
                  <button
                    onClick={stop}
                    className="p-1.5 rounded-md hover:bg-white/5 text-neon-orange/60 hover:text-neon-orange transition-colors"
                    aria-label="Stop speaking"
                  >
                    <VolumeX className="w-3.5 h-3.5" />
                  </button>
                )}

                {/* Clear chat — subtle */}
                {messages.length > 0 && (
                  <button
                    onClick={handleClearChat}
                    className="p-1.5 rounded-md hover:bg-white/5 text-white/20 hover:text-neon-cyan/60 transition-colors"
                    aria-label="Clear chat"
                    title="Clear Chat"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                  </button>
                )}

                {/* Close button */}
                <button
                  onClick={handleClose}
                  className="p-1.5 rounded-md hover:bg-white/5 text-white/30 hover:text-neon-cyan/70 transition-colors"
                  aria-label="Close voice chat"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* ── Messages area ── */}
            <div className="flex-1 overflow-y-auto jarvis-scrollbar py-3">
              {/* Empty state */}
              {messages.length === 0 && !isStreaming && (
                <div className="flex flex-col items-center justify-center h-full gap-3 px-4">
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5 }}
                    className="w-14 h-14 rounded-full bg-neon-cyan/5 border border-neon-cyan/20 flex items-center justify-center"
                  >
                    <Sparkles className="w-5 h-5 text-neon-cyan/40" />
                  </motion.div>
                  <p className="text-xs text-white/25 font-mono text-center">
                    J.A.R.V.I.S. Voice Chat
                  </p>
                  <p className="text-[10px] text-white/15 font-mono text-center max-w-[200px]">
                    Say &ldquo;open chat&rdquo; or type a message
                  </p>
                </div>
              )}

              {/* Message list */}
              {messages.map((msg) => (
                <OverlayMessage key={msg.id} message={msg} />
              ))}

              {/* Streaming text with cursor */}
              {isStreaming && streamingText && !completedStreamMsg && (
                <div className="px-3 py-1.5">
                  <div className="flex gap-2.5">
                    <div className="flex-shrink-0 w-7 h-7 rounded-full bg-neon-cyan/10 border border-neon-cyan/25 flex items-center justify-center mt-0.5">
                      <Bot className="w-3.5 h-3.5 text-neon-cyan/60" />
                    </div>
                    <div className="relative flex-1 px-3 py-2.5 rounded-lg rounded-tl-sm bg-neon-cyan/5 border border-neon-cyan/15 text-xs text-white/90 hud-scanline-h overflow-hidden">
                      <div
                        className="absolute top-0 left-0 w-[2px] h-full"
                        style={{
                          background:
                            'linear-gradient(to bottom, transparent, rgba(0,240,255,0.4), rgba(0,240,255,0.15), transparent)',
                        }}
                      />
                      <span>{streamingText}</span>
                      <motion.span
                        className="inline-block w-[6px] h-[13px] bg-neon-cyan/90 ml-0.5 align-middle rounded-[1px]"
                        animate={{ opacity: [1, 1, 0, 0] }}
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
                    </div>
                  </div>
                </div>
              )}

              {/* Thinking indicator */}
              {aiStatus === 'thinking' && !isStreaming && (
                <div className="px-3 py-2">
                  <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-neon-cyan/5 border border-neon-cyan/10">
                    <motion.div
                      className="relative w-4 h-4 flex-shrink-0"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                    >
                      <div className="absolute inset-0 rounded-full border border-neon-cyan/40" />
                      <div className="absolute inset-1 rounded-full bg-neon-cyan/30" />
                    </motion.div>
                    <span className="text-[10px] font-mono text-neon-cyan/40 uppercase tracking-wider">
                      Processing...
                    </span>
                  </div>
                </div>
              )}

              {/* Voice transcript — live preview */}
              {isListening && voiceTranscript && (
                <div className="px-3 py-1.5">
                  <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-neon-cyan/5 border border-neon-cyan/10">
                    <Mic className="w-3 h-3 text-neon-cyan/50 animate-pulse" />
                    <span className="text-[11px] font-mono text-neon-cyan/40 truncate">
                      {voiceTranscript}
                    </span>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* ── Input area ── */}
            <div className="border-t border-neon-cyan/10 p-3 flex-shrink-0">
              {/* JARVIS label with status dot */}
              <div className="flex items-center gap-2 mb-2">
                <span className="text-[8px] font-mono text-neon-cyan/25 tracking-[0.2em]">
                  JARVIS
                </span>
                <div className="h-[1px] flex-1 bg-neon-cyan/5" />
                <div
                  className={`w-1.5 h-1.5 rounded-full ${
                    aiStatus === 'idle'
                      ? 'bg-neon-cyan/30'
                      : aiStatus === 'thinking'
                      ? 'bg-neon-cyan animate-pulse'
                      : 'bg-neon-orange animate-pulse'
                  }`}
                />
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
                    placeholder={
                      isListening ? 'Listening...' : 'Type a message...'
                    }
                    disabled={isLoading}
                    className="w-full bg-white/[0.03] border border-neon-cyan/15 rounded-lg px-3 py-2.5 text-xs text-white/90 placeholder-white/20 font-mono
                      focus:outline-none focus:border-neon-cyan/40 focus:ring-1 focus:ring-neon-cyan/15
                      disabled:opacity-40 transition-all"
                  />
                  {/* Listening indicator inside input */}
                  {isListening && (
                    <div className="absolute right-2.5 top-1/2 -translate-y-1/2">
                      <div className="flex items-center gap-0.5">
                        {[0, 1, 2, 3].map((i) => (
                          <motion.div
                            key={i}
                            className="w-[3px] bg-neon-cyan/60 rounded-full"
                            animate={{
                              height: [4, 12, 4],
                            }}
                            transition={{
                              duration: 0.5,
                              repeat: Infinity,
                              delay: i * 0.1,
                              ease: 'easeInOut',
                            }}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Send / loading button */}
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleSend()}
                  disabled={isLoading || !input.trim()}
                  className="p-2.5 rounded-lg bg-neon-cyan/10 border border-neon-cyan/25 text-neon-cyan/70
                    hover:bg-neon-cyan/20 hover:text-neon-cyan hover:border-neon-cyan/40
                    disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                  aria-label="Send message"
                >
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                </motion.button>
              </div>

              {/* Hint text */}
              <div className="flex items-center justify-between mt-1.5">
                <span className="text-[8px] font-mono text-white/10">
                  {isListening ? 'Voice active — speak naturally' : 'Ctrl+K to toggle · Esc to close'}
                </span>
                {isSpeakingNow && (
                  <button
                    onClick={stop}
                    className="flex items-center gap-1 text-[8px] font-mono text-neon-orange/40 hover:text-neon-orange/70 transition-colors"
                  >
                    <VolumeX className="w-2.5 h-2.5" />
                    Stop
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

// ─── Inline Message Component ─────────────────────────────────────────
function OverlayMessage({
  message,
}: {
  message: { id: string; role: string; content: string; timestamp: number; isVoice?: boolean }
}) {
  const isUser = message.role === 'user'
  const isSystem = message.role === 'system'
  const timeStr = new Date(message.timestamp).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  })

  if (isSystem) {
    return (
      <div className="flex justify-center py-1.5">
        <div className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-white/30 text-[9px] font-mono">
          {message.content}
        </div>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      className={`flex gap-2.5 px-3 py-1.5 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
    >
      {/* Role avatar */}
      <div
        className={`flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center mt-0.5 ${
          isUser
            ? 'bg-neon-orange/10 border border-neon-orange/25'
            : 'bg-neon-cyan/10 border border-neon-cyan/25'
        }`}
      >
        {isUser ? (
          <User className="w-3.5 h-3.5 text-neon-orange" />
        ) : (
          <Bot className="w-3.5 h-3.5 text-neon-cyan" />
        )}
      </div>

      {/* Message content */}
      <div className={`max-w-[82%] ${isUser ? 'items-end' : 'items-start'}`}>
        <div
          className={`relative px-3 py-2.5 rounded-lg text-xs leading-relaxed overflow-hidden ${
            isUser
              ? 'bg-neon-orange/8 border border-neon-orange/20 text-white/90 rounded-tr-sm'
              : 'bg-neon-cyan/5 border border-neon-cyan/12 text-white/90 rounded-tl-sm'
          }`}
        >
          {/* Holographic border for AI */}
          {!isUser && (
            <div
              className="absolute top-0 left-0 w-[2px] h-full"
              style={{
                background:
                  'linear-gradient(to bottom, transparent, rgba(0,240,255,0.35), rgba(0,240,255,0.1), transparent)',
              }}
            />
          )}
          {/* Holographic border for user */}
          {isUser && (
            <div
              className="absolute top-0 right-0 w-[2px] h-full"
              style={{
                background:
                  'linear-gradient(to bottom, transparent, rgba(255,106,0,0.35), rgba(255,106,0,0.1), transparent)',
              }}
            />
          )}

          {/* Voice indicator */}
          {message.isVoice && (
            <div className="flex items-center gap-1 mb-1">
              <Mic className={`w-2.5 h-2.5 ${isUser ? 'text-neon-orange/50' : 'text-neon-cyan/50'}`} />
              <span className={`text-[8px] font-mono ${isUser ? 'text-neon-orange/50' : 'text-neon-cyan/50'}`}>
                Voice
              </span>
            </div>
          )}

          {/* Markdown for assistant, plain for user */}
          {isUser ? (
            <p className="whitespace-pre-wrap break-words">{message.content}</p>
          ) : (
            <div className="markdown-content prose prose-invert prose-xs max-w-none [&_p]:mb-1.5 [&_p:last-child]:mb-0">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  h1: ({ children }) => (
                    <h1 className="text-sm font-bold neon-text-cyan mt-2 mb-1 first:mt-0">{children}</h1>
                  ),
                  h2: ({ children }) => (
                    <h2 className="text-xs font-bold neon-text-cyan mt-2 mb-1 first:mt-0">{children}</h2>
                  ),
                  h3: ({ children }) => (
                    <h3 className="text-xs font-semibold neon-text-cyan mt-1.5 mb-0.5 first:mt-0">{children}</h3>
                  ),
                  strong: ({ children }) => (
                    <strong className="text-neon-cyan font-semibold">{children}</strong>
                  ),
                  code: ({ className, children, ...props }) => {
                    const isBlock = className?.includes('language-')
                    if (isBlock) {
                      return (
                        <code className={`${className || ''} text-[10px] font-mono`} {...props}>
                          {children}
                        </code>
                      )
                    }
                    return (
                      <code
                        className="bg-neon-cyan/10 text-neon-cyan px-1 py-0.5 rounded text-[10px] font-mono border border-neon-cyan/10"
                        {...props}
                      >
                        {children}
                      </code>
                    )
                  },
                  pre: ({ children }) => (
                    <div className="my-1.5 rounded-md overflow-hidden border border-neon-cyan/15 bg-black/50">
                      <pre className="p-2 text-[10px] font-mono overflow-x-auto">{children}</pre>
                    </div>
                  ),
                  ul: ({ children }) => (
                    <ul className="list-none space-y-0.5 my-1 pl-3">{children}</ul>
                  ),
                  ol: ({ children }) => (
                    <ol className="list-none space-y-0.5 my-1 pl-3">{children}</ol>
                  ),
                  li: ({ children, ordered, index }) => (
                    <li className="relative pl-3.5">
                      <span className="absolute left-0 text-neon-cyan/50 font-mono text-[10px]">
                        {ordered ? `${(index ?? 0) + 1}.` : '▸'}
                      </span>
                      {children}
                    </li>
                  ),
                  a: ({ href, children }) => (
                    <a
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-neon-cyan hover:text-neon-cyan/80 underline underline-offset-2 transition-all"
                    >
                      {children}
                    </a>
                  ),
                  p: ({ children }) => <p className="mb-1.5 last:mb-0">{children}</p>,
                  blockquote: ({ children }) => (
                    <blockquote className="border-l-2 border-neon-cyan/25 pl-2 my-1 text-white/50 italic">
                      {children}
                    </blockquote>
                  ),
                  hr: () => <hr className="my-2 border-neon-cyan/10" />,
                }}
              >
                {message.content}
              </ReactMarkdown>
            </div>
          )}
        </div>

        {/* Timestamp */}
        <div
          className={`mt-0.5 text-[8px] font-mono text-white/10 ${
            isUser ? 'text-right' : 'text-left'
          }`}
        >
          {timeStr}
        </div>
      </div>
    </motion.div>
  )
}
