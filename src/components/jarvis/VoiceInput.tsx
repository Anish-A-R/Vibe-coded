'use client'

import { useEffect, useCallback, useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Mic, MicOff, Radio, Languages, Loader2, AlertTriangle, Volume2, ShieldAlert } from 'lucide-react'
import { useVoiceRecognition } from '@/hooks/useVoiceRecognition'
import { useJarvisStore } from '@/hooks/useJarvisStore'
import { playActivationSound, playDeactivationSound } from '@/lib/sounds'

interface VoiceInputProps {
  className?: string
  onFinalTranscript?: (text: string) => void
  onWakeWord?: () => void
}

export function VoiceInput({ className = '', onFinalTranscript, onWakeWord }: VoiceInputProps) {
  const { soundEnabled, voiceLanguage, setPendingVoiceInput, setVoiceTranscript } = useJarvisStore()
  const {
    isSupported,
    isListening,
    transcript,
    toggleListening,
    wakeWordDetected,
    onFinalTranscript: registerOnFinalTranscript,
    micPermission,
    recognitionState,
    errorMessage,
    requestMicPermission,
    browserInfo,
  } = useVoiceRecognition()
  const [lastSentText, setLastSentText] = useState('')
  const [isTranslating, setIsTranslating] = useState(false)
  const [translatedText, setTranslatedText] = useState<string | null>(null)
  const prevWakeWordRef = useRef(false)

  // Determine if we're in multilingual mode
  const isMultilingual = voiceLanguage.split('-')[0] !== 'en'

  // Determine mic status for display
  const micStatus = (() => {
    if (!isSupported) return 'unsupported'
    if (micPermission === 'denied') return 'denied'
    if (recognitionState === 'error') return 'error'
    if (recognitionState === 'restarting') return 'restarting'
    if (recognitionState === 'starting') return 'starting'
    if (isListening) return 'listening'
    if (wakeWordDetected) return 'wake'
    return 'idle'
  })()

  // Trigger onWakeWord callback when wake word is detected
  useEffect(() => {
    if (wakeWordDetected && !prevWakeWordRef.current && onWakeWord) {
      onWakeWord()
    }
    prevWakeWordRef.current = wakeWordDetected
  }, [wakeWordDetected, onWakeWord])

  // Sync interim transcript to store so ChatPanel can display it
  useEffect(() => {
    setVoiceTranscript(transcript)
  }, [transcript, setVoiceTranscript])

  // ALWAYS register the final transcript callback
  useEffect(() => {
    registerOnFinalTranscript((text) => {
      setLastSentText(text)
      setTranslatedText(null)
      setPendingVoiceInput(text)
      if (onFinalTranscript) {
        onFinalTranscript(text)
      }
      if (onWakeWord) {
        onWakeWord()
      }
      setTimeout(() => {
        setLastSentText('')
        setTranslatedText(null)
      }, 3000)
    })
  }, [registerOnFinalTranscript, onFinalTranscript, onWakeWord, setPendingVoiceInput])

  // Keyboard shortcut: Ctrl+Space
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.code === 'Space') {
        e.preventDefault()
        if (isSupported) {
          toggleListening()
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isSupported, toggleListening])

  const handleToggle = useCallback(() => {
    if (!isSupported) return
    
    // If permission is denied, request it again
    if (micPermission === 'denied') {
      requestMicPermission()
      return
    }

    if (soundEnabled) {
      if (!isListening) {
        playActivationSound()
      } else {
        playDeactivationSound()
      }
    }
    toggleListening()
  }, [isSupported, isListening, soundEnabled, toggleListening, micPermission, requestMicPermission])

  // Determine button color based on state
  const buttonStyle = (() => {
    if (micPermission === 'denied') {
      return 'bg-red-500/20 border-2 border-red-500/50 shadow-[0_0_15px_rgba(255,0,0,0.2)]'
    }
    if (recognitionState === 'error') {
      return 'bg-orange-500/20 border-2 border-orange-500/50 shadow-[0_0_15px_rgba(255,165,0,0.2)]'
    }
    if (isListening) {
      return 'bg-neon-cyan/20 border-2 border-neon-cyan shadow-[0_0_20px_rgba(0,240,255,0.3)]'
    }
    if (wakeWordDetected) {
      return 'bg-neon-cyan/10 border-2 border-neon-cyan/50 shadow-[0_0_10px_rgba(0,240,255,0.15)]'
    }
    return 'bg-white/5 border border-white/20 hover:border-neon-cyan/40 hover:bg-neon-cyan/10'
  })()

  return (
    <div className={`flex flex-col items-center gap-3 ${className}`}>
      {/* Microphone button */}
      <div className="relative">
        {/* Pulsing ring when listening */}
        <AnimatePresence>
          {isListening && (
            <>
              <motion.div
                initial={{ scale: 0.8, opacity: 0.8 }}
                animate={{ scale: 1.6, opacity: 0 }}
                exit={{ scale: 0.8, opacity: 0 }}
                transition={{ duration: 1.5, repeat: Infinity, ease: 'easeOut' }}
                className="absolute inset-0 rounded-full border-2 border-neon-cyan"
              />
              <motion.div
                initial={{ scale: 0.9, opacity: 0.6 }}
                animate={{ scale: 1.3, opacity: 0 }}
                exit={{ scale: 0.9, opacity: 0 }}
                transition={{ duration: 1.5, repeat: Infinity, ease: 'easeOut', delay: 0.3 }}
                className="absolute inset-0 rounded-full border border-neon-cyan/50"
              />
            </>
          )}
        </AnimatePresence>

        {/* Error ring when mic denied */}
        {micPermission === 'denied' && (
          <motion.div
            initial={{ scale: 0.9, opacity: 0.5 }}
            animate={{ scale: 1.2, opacity: 0 }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeOut' }}
            className="absolute inset-0 rounded-full border-2 border-red-500/50"
          />
        )}

        {/* Wake word indicator */}
        {wakeWordDetected && !isListening && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-neon-cyan flex items-center justify-center z-10"
          >
            <Radio className="w-2.5 h-2.5 text-black" />
          </motion.div>
        )}

        {/* Multilingual indicator */}
        {isMultilingual && isListening && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-1 -left-1 w-4 h-4 rounded-full bg-purple-500/80 flex items-center justify-center z-10"
          >
            <Languages className="w-2.5 h-2.5 text-white" />
          </motion.div>
        )}

        {/* Recognition state indicator */}
        {recognitionState === 'restarting' && isListening && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-yellow-500/80 flex items-center justify-center z-10"
          >
            <Loader2 className="w-2.5 h-2.5 text-black animate-spin" />
          </motion.div>
        )}

        {/* Main button */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleToggle}
          disabled={!isSupported && micPermission !== 'denied'}
          className={`
            relative w-14 h-14 rounded-full flex items-center justify-center
            transition-colors duration-300
            ${buttonStyle}
            ${!isSupported ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}
          `}
          aria-label={micPermission === 'denied' ? 'Request microphone permission' : isListening ? 'Stop voice input' : 'Start voice input'}
          title={errorMessage || undefined}
        >
          <AnimatePresence mode="wait">
            {micPermission === 'denied' ? (
              <motion.div
                key="denied"
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                exit={{ scale: 0, rotate: 180 }}
                transition={{ duration: 0.2 }}
              >
                <ShieldAlert className="w-6 h-6 text-red-400" />
              </motion.div>
            ) : recognitionState === 'error' ? (
              <motion.div
                key="error"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
                transition={{ duration: 0.2 }}
              >
                <AlertTriangle className="w-6 h-6 text-orange-400" />
              </motion.div>
            ) : recognitionState === 'restarting' || recognitionState === 'starting' ? (
              <motion.div
                key="starting"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
                transition={{ duration: 0.2 }}
              >
                <Loader2 className="w-6 h-6 text-neon-cyan/70 animate-spin" />
              </motion.div>
            ) : isListening ? (
              <motion.div
                key="listening"
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                exit={{ scale: 0, rotate: 180 }}
                transition={{ duration: 0.2 }}
              >
                <Mic className="w-6 h-6 text-neon-cyan" />
              </motion.div>
            ) : wakeWordDetected ? (
              <motion.div
                key="wake"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
                transition={{ duration: 0.2 }}
              >
                <Radio className="w-6 h-6 text-neon-cyan/70 animate-pulse" />
              </motion.div>
            ) : (
              <motion.div
                key="idle"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
                transition={{ duration: 0.2 }}
              >
                <MicOff className="w-6 h-6 text-white/40" />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.button>
      </div>

      {/* Transcript / Status text */}
      <AnimatePresence>
        {(isListening || wakeWordDetected || errorMessage) && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="text-center max-w-[240px]"
          >
            {/* Error message */}
            {errorMessage && micPermission !== 'denied' && (
              <div className="space-y-1 mb-2">
                <div className="flex items-center justify-center gap-1.5">
                  <AlertTriangle className="w-3 h-3 text-orange-400/60" />
                  <p className="text-xs text-orange-400/60 font-mono uppercase">Recognition Issue</p>
                </div>
                <p className="text-[10px] text-orange-400/40 font-mono max-w-[240px] break-words">
                  {errorMessage}
                </p>
                <button
                  onClick={() => {
                    toggleListening()
                    setTimeout(() => toggleListening(), 500)
                  }}
                  className="mt-1 px-3 py-1 text-[10px] font-mono uppercase tracking-wider
                    border border-neon-cyan/20 bg-neon-cyan/5 text-neon-cyan/60
                    hover:bg-neon-cyan/10 hover:border-neon-cyan/40 transition-all rounded"
                >
                  Retry
                </button>
              </div>
            )}

            {/* Mic denied message */}
            {micPermission === 'denied' && (
              <div className="space-y-2">
                <div className="flex items-center justify-center gap-1.5">
                  <ShieldAlert className="w-3 h-3 text-red-400/60" />
                  <p className="text-xs text-red-400/60 font-mono uppercase">Mic Denied</p>
                </div>
                <p className="text-[10px] text-red-400/40 font-mono max-w-[240px]">
                  Microphone access was denied. Click the mic button to request permission again, or allow it in your browser settings.
                </p>
                <button
                  onClick={requestMicPermission}
                  className="px-3 py-1 text-[10px] font-mono uppercase tracking-wider
                    border border-red-400/20 bg-red-500/5 text-red-400/60
                    hover:bg-red-500/10 hover:border-red-400/40 transition-all rounded"
                >
                  Allow Mic
                </button>
              </div>
            )}

            {/* Sent text feedback */}
            {lastSentText && !errorMessage && micPermission !== 'denied' && (
              <div className="space-y-1">
                <p className="text-xs text-neon-cyan/40 font-mono uppercase">Sent</p>
                <p className="text-sm text-neon-cyan/80 font-mono max-w-[240px] truncate">
                  &ldquo;{lastSentText}&rdquo;
                </p>
                {translatedText && translatedText !== lastSentText && (
                  <p className="text-[10px] text-purple-400/60 font-mono">
                    → &ldquo;{translatedText}&rdquo;
                  </p>
                )}
              </div>
            )}

            {/* Translating indicator */}
            {isTranslating && !errorMessage && (
              <div className="space-y-1">
                <div className="flex items-center justify-center gap-1.5">
                  <Loader2 className="w-3 h-3 text-purple-400/60 animate-spin" />
                  <p className="text-xs text-purple-400/60 font-mono uppercase">Translating</p>
                </div>
              </div>
            )}

            {/* Real-time transcript */}
            {transcript && !lastSentText && !errorMessage && micPermission !== 'denied' && (
              <div className="space-y-1">
                <p className="text-xs text-neon-cyan/30 font-mono uppercase">Hearing</p>
                <p className="text-sm text-neon-cyan/80 font-mono line-clamp-2 break-words">
                  &ldquo;{transcript}&rdquo;
                </p>
              </div>
            )}

            {/* Listening status */}
            {!transcript && !lastSentText && !errorMessage && micPermission !== 'denied' && (
              <p className="text-xs text-neon-cyan/50 font-mono animate-pulse">
                {recognitionState === 'restarting'
                  ? 'Reconnecting...'
                  : recognitionState === 'starting'
                  ? 'Connecting...'
                  : wakeWordDetected
                  ? 'Wake word detected — speak now...'
                  : 'Listening...'}
              </p>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Not supported message with browser info */}
      {!isSupported && (
        <div className="flex flex-col items-center gap-1.5">
          <p className="text-[10px] text-white/30 font-mono text-center">
            Voice recognition not supported in {browserInfo.name}
          </p>
          {browserInfo.isFirefox && (
            <p className="text-[9px] text-white/20 font-mono text-center max-w-[200px]">
              Try Chrome, Edge, or Brave for voice features
            </p>
          )}
        </div>
      )}

      {/* Wake word hint */}
      {isSupported && !isListening && micPermission !== 'denied' && (
        <div className="flex flex-col items-center gap-1">
          <p className="text-[9px] text-white/15 font-mono text-center">
            Say &ldquo;Hey Jarvis&rdquo; to activate
          </p>
          {isMultilingual && (
            <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-purple-500/5 border border-purple-500/10">
              <Languages className="w-2 h-2 text-purple-400/40" />
              <span className="text-[8px] font-mono text-purple-400/40">
                Multilingual mode
              </span>
            </div>
          )}
          {/* Show recognition state for debugging on Windows */}
          {recognitionState === 'active' && !isListening && (
            <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-green-500/5 border border-green-500/10">
              <Volume2 className="w-2 h-2 text-green-400/40" />
              <span className="text-[8px] font-mono text-green-400/40">
                Wake word listening
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
