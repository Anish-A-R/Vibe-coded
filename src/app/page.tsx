'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useJarvisStore } from '@/hooks/useJarvisStore'
import { useHydrated } from '@/hooks/useHydrated'
import { useVoiceRecognition } from '@/hooks/useVoiceRecognition'
import { useTTS } from '@/hooks/useTTS'
import { playBootSound, playStartupCompleteSound, playActivationSound, playDeactivationSound } from '@/lib/sounds'
import { getGreeting } from '@/lib/personalities'
import BootSequence from '@/components/jarvis/BootSequence'
import JarvisOrb from '@/components/jarvis/JarvisOrb'
import { VoiceChatOverlay } from '@/components/jarvis/VoiceChatOverlay'
import { ThemeSwitcher } from '@/components/jarvis/ThemeSwitcher'
import type { ColorTheme } from '@/hooks/useJarvisStore'

export default function Home() {
  const {
    booted,
    setBooted,
    aiStatus,
    setAIStatus,
    soundEnabled,
    voiceLanguage,
    personalityMode,
    wakeWordEnabled,
    isListening,
    setIsListening,
    showChat,
    setShowChat,
    addMessage,
    messages,
    pendingVoiceInput,
    setPendingVoiceInput,
    setVoiceTranscript,
    crtOverlayEnabled,
    addEvent,
    addNotification,
    clearMessages,
  } = useJarvisStore()

  const hydrated = useHydrated()
  const showBoot = hydrated && !booted

  const [greetingShown, setGreetingShown] = useState(false)
  const [greetingText, setGreetingText] = useState('')
  const [lastProcessedVoice, setLastProcessedVoice] = useState('')
  const [showThemeSwitcher, setShowThemeSwitcher] = useState(false)

  const { speak, stop: stopSpeaking } = useTTS()
  const {
    transcript,
    wakeWordDetected,
    onFinalTranscript,
    toggleListening,
    isSupported,
    micPermission,
    recognitionState,
    requestMicPermission,
    errorMessage: voiceError,
    recordingCountdown,
    isRecordingBuffer,
  } = useVoiceRecognition()

  // Process voice input -> send to chat or execute command
  const processVoiceInput = useCallback(async (text: string) => {
    if (!text || text === lastProcessedVoice) return
    setLastProcessedVoice(text)
    setTimeout(() => setLastProcessedVoice(''), 3000)

    const lowerText = text.toLowerCase().trim()

    // Voice commands for UI control
    if (lowerText.includes('open chat') || lowerText.includes('show chat') || lowerText.includes('open messages')) {
      setShowChat(true)
      return
    }
    if (lowerText.includes('close chat') || lowerText.includes('hide chat') || lowerText.includes('close messages')) {
      setShowChat(false)
      return
    }

    // Voice commands to stop AI speaking
    if (
      lowerText === 'stop' ||
      lowerText === 'stop speaking' ||
      lowerText === 'stop talking' ||
      lowerText === 'be quiet' ||
      lowerText === 'shut up' ||
      lowerText === 'quiet' ||
      lowerText === 'silence'
    ) {
      stopSpeaking()
      setAIStatus('idle')
      if (soundEnabled) {
        speak('Right away, sir.')
      }
      return
    }

    // Voice command to clear chat
    if (lowerText === 'clear chat' || lowerText === 'clear history' || lowerText === 'clear conversation' || lowerText === 'new chat') {
      clearMessages()
      stopSpeaking()
      setAIStatus('idle')
      if (soundEnabled) {
        speak('Chat history cleared, sir.')
      }
      return
    }

    // Voice commands for theme switching
    const colorThemeMap: Record<string, ColorTheme> = {
      'cyan': 'cyan', 'blue': 'arctic', 'arctic': 'arctic', 'ice': 'arctic',
      'red': 'red', 'alert': 'red', 'boss': 'red',
      'green': 'green', 'matrix': 'green', 'hacker': 'green',
      'purple': 'purple', 'nebula': 'purple', 'violet': 'purple',
      'orange': 'orange', 'flame': 'orange', 'fire': 'orange',
    }
    const themeMatch = Object.entries(colorThemeMap).find(([keyword]) => lowerText.includes(keyword))
    if (lowerText.includes('theme') || lowerText.includes('color') || lowerText.includes('colour') || lowerText.includes('mode')) {
      if (themeMatch) {
        const newTheme = themeMatch[1]
        const { setColorTheme } = useJarvisStore.getState()
        setColorTheme(newTheme)
        if (soundEnabled) speak(`Theme changed to ${newTheme}, sir.`)
        return
      }
      // Just said 'change theme' without specifying - open the theme picker
      setShowThemeSwitcher(true)
      if (soundEnabled) speak('Opening theme selector, sir.')
      return
    }
    // Direct color name without 'theme' keyword
    if (themeMatch && (lowerText.includes('change') || lowerText.includes('switch') || lowerText.includes('set'))) {
      const newTheme = themeMatch[1]
      const { setColorTheme } = useJarvisStore.getState()
      setColorTheme(newTheme)
      if (soundEnabled) speak(`Theme changed to ${newTheme}, sir.`)
      return
    }

    // All other voice input goes to the chat system via pendingVoiceInput
    // Auto-open chat so the user can see the response
    if (!showChat) {
      setShowChat(true)
    }
    setPendingVoiceInput(text)
  }, [lastProcessedVoice, setShowChat, setPendingVoiceInput, showChat, stopSpeaking, setAIStatus, soundEnabled, speak, clearMessages, setShowThemeSwitcher])

  // Register voice transcript callback
  useEffect(() => {
    onFinalTranscript((text) => {
      processVoiceInput(text)
    })
  }, [onFinalTranscript, processVoiceInput])

  // Sync transcript to store
  useEffect(() => {
    setVoiceTranscript(transcript)
  }, [transcript, setVoiceTranscript])

  // Boot sequence handlers
  const handleBootComplete = useCallback(() => {
    setBooted(true)
    if (soundEnabled) playStartupCompleteSound()
    addEvent({ type: 'boot', severity: 'success', message: 'System boot complete', details: 'Voice agent online' })

    const greeting = getGreeting(personalityMode, voiceLanguage)
    setGreetingText(greeting)
    setGreetingShown(true)

    // Speak the greeting
    if (soundEnabled) {
      setTimeout(() => speak(greeting), 500)
    }

    setTimeout(() => setGreetingShown(false), 6000)
  }, [setBooted, soundEnabled, personalityMode, voiceLanguage, addEvent, speak])

  const handleBootPhase = useCallback(
    (phase: number) => {
      if (soundEnabled && phase === 1) playBootSound()
    },
    [soundEnabled]
  )

  // Auto-start wake word listening after boot
  useEffect(() => {
    if (!booted || !isSupported) return

    if (!isListening && wakeWordEnabled) {
      const timer = setTimeout(() => {
        setIsListening(true)
      }, 2000)
      return () => clearTimeout(timer)
    }
  }, [booted, isSupported, isListening, wakeWordEnabled, setIsListening])

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+K: Toggle chat
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault()
        setShowChat(!showChat)
      }
      // Ctrl+Space: Toggle voice
      if ((e.ctrlKey || e.metaKey) && e.key === ' ') {
        e.preventDefault()
        if (isSupported) {
          if (soundEnabled) {
            if (!isListening) playActivationSound()
            else playDeactivationSound()
          }
          toggleListening()
        }
      }
      // Escape: Close chat
      if (e.key === 'Escape') {
        setShowChat(false)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [showChat, setShowChat, isSupported, isListening, soundEnabled, toggleListening])

  // Hydration guard
  if (!hydrated) {
    return (
      <div className="min-h-screen bg-jarvis-darker flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-neon-cyan/30 border-t-neon-cyan animate-spin" />
      </div>
    )
  }

  // Boot sequence
  if (showBoot) {
    return <BootSequence onComplete={handleBootComplete} onPhase={handleBootPhase} />
  }

  // Main voice-first interface
  return (
    <div className="relative min-h-screen bg-jarvis-darker overflow-hidden hud-grid-bg">
      {/* CRT Scanline Overlay */}
      {crtOverlayEnabled && <div className="crt-overlay pointer-events-none" />}

      {/* Ambient background particles (subtle) */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] rounded-full bg-neon-cyan/[0.02] blur-[120px]" />
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] rounded-full bg-neon-blue/[0.02] blur-[100px]" />
      </div>

      {/* ===== TOP AMBIENT INFO BAR ===== */}
      <AmbientBar greetingText={greetingText} greetingShown={greetingShown} />

      {/* ===== CENTRAL ORB ===== */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <JarvisOrb />
      </div>

      {/* ===== VOICE STATUS BAR (bottom) ===== */}
      <VoiceStatusBar
        isListening={isListening}
        wakeWordDetected={wakeWordDetected}
        aiStatus={aiStatus}
        transcript={transcript}
        recognitionState={recognitionState}
        micPermission={micPermission}
        isSupported={isSupported}
        voiceError={voiceError}
        recordingCountdown={recordingCountdown}
        isRecordingBuffer={isRecordingBuffer}
        onToggleMic={() => {
          if (soundEnabled) {
            if (!isListening) playActivationSound()
            else playDeactivationSound()
          }
          toggleListening()
        }}
        onRequestMic={requestMicPermission}
      />

      {/* ===== THEME SWITCHER BUTTON (top-right, below JARVIS label) ===== */}
      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
        onClick={() => setShowThemeSwitcher(true)}
        className="fixed top-4 right-6 z-30 pointer-events-auto group"
        aria-label="Change theme"
      >
        <div className="relative w-8 h-8 flex items-center justify-center">
          <div className="w-5 h-5 transition-all duration-300 group-hover:scale-110" style={{ clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)', background: 'var(--theme-primary)' }} />
          <div className="absolute inset-0 w-8 h-8 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{ boxShadow: '0 0 12px var(--theme-primary)' }} />
        </div>
      </motion.button>

      {/* ===== CHAT POPUP (centered, auto-shows when talking) ===== */}
      <VoiceChatOverlay open={showChat} onClose={() => setShowChat(false)} />

      {/* ===== THEME SWITCHER PANEL ===== */}
      <ThemeSwitcher open={showThemeSwitcher} onClose={() => setShowThemeSwitcher(false)} />
    </div>
  )
}

// ===== Sub-components =====

function AmbientBar({ greetingText, greetingShown }: { greetingText: string; greetingShown: boolean }) {
  const [time, setTime] = useState('')
  const [date, setDate] = useState('')

  useEffect(() => {
    const update = () => {
      const now = new Date()
      setTime(now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }))
      setDate(now.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }))
    }
    update()
    const interval = setInterval(update, 1000)
    return () => clearInterval(interval)
  }, [])

  return (
    <header className="relative z-10 flex items-center justify-between px-6 py-3 pointer-events-none">
      {/* Left: Time & Date */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.3 }}
        className="flex items-center gap-4"
      >
        <div className="text-right">
          <p className="font-mono text-2xl text-neon-cyan/60 neon-text-cyan tracking-wider">{time}</p>
          <p className="font-mono text-[10px] text-neon-cyan/25 tracking-wider uppercase">{date}</p>
        </div>
      </motion.div>

      {/* Center: Greeting */}
      <AnimatePresence>
        {greetingShown && greetingText && (
          <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            transition={{ duration: 0.5 }}
            className="hidden md:block font-mono text-xs text-neon-cyan/40 text-center max-w-md"
          >
            {greetingText}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Right: JARVIS label */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.5 }}
        className="flex items-center gap-2"
      >
        <div className="w-1.5 h-1.5 rounded-full bg-neon-cyan/60 animate-pulse" />
        <div>
          <p className="font-mono text-[10px] tracking-[0.3em] text-neon-cyan/50 uppercase">J.A.R.V.I.S.</p>
          <p className="font-mono text-[8px] tracking-[0.15em] text-neon-cyan/20 uppercase">Voice Agent</p>
        </div>
      </motion.div>
    </header>
  )
}

function VoiceStatusBar({
  isListening,
  wakeWordDetected,
  aiStatus,
  transcript,
  recognitionState,
  micPermission,
  isSupported,
  voiceError,
  recordingCountdown,
  isRecordingBuffer,
  onToggleMic,
  onRequestMic,
}: {
  isListening: boolean
  wakeWordDetected: boolean
  aiStatus: string
  transcript: string
  recognitionState: string
  micPermission: string
  isSupported: boolean
  voiceError: string | null
  recordingCountdown: number
  isRecordingBuffer: boolean
  onToggleMic: () => void
  onRequestMic: () => void
}) {
  // Show voice error if present
  const showError = voiceError !== null

  const statusLabel = (() => {
    if (micPermission === 'denied') return 'MIC DENIED'
    if (recognitionState === 'error') return 'VOICE ERROR'
    if (recognitionState === 'restarting') return 'RECONNECTING'
    if (aiStatus === 'thinking') return 'PROCESSING'
    if (aiStatus === 'speaking') return 'SPEAKING'
    if (isRecordingBuffer) return `RECORDING ${recordingCountdown}s`
    if (isListening && transcript) return 'HEARING'
    if (isListening) return 'LISTENING'
    if (wakeWordDetected) return 'WAKE WORD'
    return 'SAY "JARVIS"'
  })()

  const statusColor = (() => {
    if (micPermission === 'denied' || recognitionState === 'error') return 'text-neon-red/70'
    if (aiStatus === 'thinking') return 'text-neon-orange/70'
    if (aiStatus === 'speaking') return 'text-neon-blue/70'
    if (isRecordingBuffer) return 'text-neon-green/80'
    if (isListening) return 'text-neon-cyan/80'
    return 'text-white/30'
  })()

  // Circular progress for recording countdown
  const countdownProgress = recordingCountdown > 0 ? ((5 - recordingCountdown) / 5) * 100 : 0
  const progressCircumference = 2 * Math.PI * 28 // matches SVG circle r=28
  const strokeDashoffset = progressCircumference - (countdownProgress / 100) * progressCircumference

  return (
    <footer className="fixed bottom-0 left-0 right-0 z-20 pointer-events-auto">
      <div className="flex flex-col items-center gap-2 px-6 py-4">
        {/* Status label */}
        <div className="flex flex-col items-center gap-1">
          <AnimatePresence mode="wait">
            <motion.p
              key={statusLabel}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              transition={{ duration: 0.2 }}
              className={`font-mono text-[11px] tracking-[0.25em] uppercase ${statusColor}`}
            >
              {statusLabel}
            </motion.p>
          </AnimatePresence>

          {/* Say JARVIS prompt with subtle animation */}
          {!isListening && aiStatus === 'idle' && micPermission !== 'denied' && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: [0.2, 0.5, 0.2] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
              className="font-mono text-[9px] text-neon-cyan/30 tracking-wider"
            >
              Say &ldquo;Jarvis&rdquo; or click the mic
            </motion.p>
          )}
        </div>

        {/* Mic button - larger and more prominent */}
        <div className="relative">
          <AnimatePresence>
            {isListening && !isRecordingBuffer && (
              <>
                <motion.div
                  initial={{ scale: 0.8, opacity: 0.5 }}
                  animate={{ scale: 2.5, opacity: 0 }}
                  exit={{ scale: 0.8, opacity: 0 }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: 'easeOut' }}
                  className="absolute inset-0 rounded-full border border-neon-cyan/30"
                />
                <motion.div
                  initial={{ scale: 0.9, opacity: 0.4 }}
                  animate={{ scale: 1.8, opacity: 0 }}
                  exit={{ scale: 0.9, opacity: 0 }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: 'easeOut', delay: 0.3 }}
                  className="absolute inset-0 rounded-full border border-neon-cyan/20"
                />
                <motion.div
                  initial={{ scale: 0.95, opacity: 0.3 }}
                  animate={{ scale: 1.4, opacity: 0 }}
                  exit={{ scale: 0.95, opacity: 0 }}
                  transition={{ duration: 1.2, repeat: Infinity, ease: 'easeOut', delay: 0.5 }}
                  className="absolute inset-0 rounded-full border border-neon-cyan/15"
                />
              </>
            )}
          </AnimatePresence>

          {/* Circular countdown progress indicator */}
          <AnimatePresence>
            {isRecordingBuffer && recordingCountdown > 0 && (
              <motion.svg
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.3 }}
                className="absolute inset-0 w-16 h-16 -rotate-90 pointer-events-none"
                style={{ zIndex: 10 }}
              >
                {/* Background circle */}
                <circle
                  cx="32"
                  cy="32"
                  r="28"
                  fill="none"
                  stroke="rgba(0, 240, 255, 0.1)"
                  strokeWidth="2"
                />
                {/* Progress arc */}
                <motion.circle
                  cx="32"
                  cy="32"
                  r="28"
                  fill="none"
                  stroke="rgba(0, 255, 136, 0.6)"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeDasharray={2 * Math.PI * 28}
                  initial={{ strokeDashoffset: 2 * Math.PI * 28 }}
                  animate={{ strokeDashoffset }}
                  transition={{ duration: 1, ease: 'linear' }}
                />
              </motion.svg>
            )}
          </AnimatePresence>

          {/* Recording pulse ring */}
          <AnimatePresence>
            {isRecordingBuffer && (
              <motion.div
                initial={{ scale: 1, opacity: 0.5 }}
                animate={{ scale: 1.6, opacity: 0 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'easeOut' }}
                className="absolute inset-0 rounded-full border-2 border-neon-green/40"
              />
            )}
          </AnimatePresence>

          <motion.button
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.92 }}
            onClick={micPermission === 'denied' ? onRequestMic : onToggleMic}
            disabled={!isSupported && micPermission !== 'denied'}
            className={`
              relative w-16 h-16 rounded-full flex items-center justify-center
              transition-all duration-300
              ${micPermission === 'denied'
                ? 'bg-neon-red/10 border-2 border-neon-red/30'
                : isRecordingBuffer
                ? 'bg-neon-green/15 border-2 border-neon-green/60 shadow-[0_0_30px_rgba(0,255,136,0.25)]'
                : isListening
                ? 'bg-neon-cyan/15 border-2 border-neon-cyan/60 shadow-[0_0_30px_rgba(0,240,255,0.25)]'
                : 'bg-white/5 border-2 border-white/15 hover:border-neon-cyan/30 hover:bg-neon-cyan/5'
              }
              ${!isSupported ? 'opacity-30 cursor-not-allowed' : 'cursor-pointer'}
            `}
            aria-label={isListening ? 'Stop listening' : 'Start listening'}
          >
            {isRecordingBuffer ? (
              <div className="flex items-center justify-center">
                <span className="font-mono text-lg font-bold text-neon-green/90">
                  {recordingCountdown}
                </span>
              </div>
            ) : isListening ? (
              <div className="flex items-center justify-center gap-[3px]">
                {[0, 1, 2, 3, 4].map((i) => (
                  <motion.div
                    key={i}
                    className="w-[3px] rounded-full bg-neon-cyan"
                    animate={{
                      height: [6, 18, 10, 20, 8, 15, 6],
                    }}
                    transition={{
                      duration: 0.8,
                      repeat: Infinity,
                      delay: i * 0.1,
                      ease: 'easeInOut',
                    }}
                  />
                ))}
              </div>
            ) : (
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={micPermission === 'denied' ? 'text-neon-red/60' : 'text-white/30'}>
                <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
                <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                <line x1="12" x2="12" y1="19" y2="22" />
              </svg>
            )}
          </motion.button>
        </div>
      </div>

      {/* Error message display */}
      <AnimatePresence>
        {showError && voiceError && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute bottom-28 left-1/2 -translate-x-1/2 px-4 py-2 rounded-lg bg-neon-red/10 border border-neon-red/20 max-w-[300px]"
          >
            <p className="font-mono text-[10px] text-neon-red/70 text-center">{voiceError}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bottom hint */}
      <div className="flex justify-center pb-2">
        <p className="font-mono text-[8px] text-white/10 tracking-wider">
          CTRL+SPACE voice &bull; CTRL+K chat &bull; Say &ldquo;Jarvis&rdquo; to activate
        </p>
      </div>
    </footer>
  )
}
