'use client'

import { useEffect, useCallback, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Mic, MicOff, Radio } from 'lucide-react'
import { useVoiceRecognition } from '@/hooks/useVoiceRecognition'
import { useJarvisStore } from '@/hooks/useJarvisStore'
import { playActivationSound, playDeactivationSound } from '@/lib/sounds'

interface VoiceInputProps {
  className?: string
  onFinalTranscript?: (text: string) => void
}

export function VoiceInput({ className = '', onFinalTranscript }: VoiceInputProps) {
  const { soundEnabled } = useJarvisStore()
  const { isSupported, isListening, transcript, toggleListening, wakeWordDetected, onFinalTranscript: registerOnFinalTranscript } = useVoiceRecognition()
  const [lastSentText, setLastSentText] = useState('')

  // Register the final transcript callback
  useEffect(() => {
    if (onFinalTranscript) {
      registerOnFinalTranscript((text) => {
        setLastSentText(text)
        onFinalTranscript(text)
        // Clear after 3 seconds
        setTimeout(() => setLastSentText(''), 3000)
      })
    }
  }, [onFinalTranscript, registerOnFinalTranscript])

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
    if (soundEnabled) {
      if (!isListening) {
        playActivationSound()
      } else {
        playDeactivationSound()
      }
    }
    toggleListening()
  }, [isSupported, isListening, soundEnabled, toggleListening])

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

        {/* Main button */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleToggle}
          disabled={!isSupported}
          className={`
            relative w-14 h-14 rounded-full flex items-center justify-center
            transition-colors duration-300
            ${isListening
              ? 'bg-neon-cyan/20 border-2 border-neon-cyan shadow-[0_0_20px_rgba(0,240,255,0.3)]'
              : wakeWordDetected
              ? 'bg-neon-cyan/10 border-2 border-neon-cyan/50 shadow-[0_0_10px_rgba(0,240,255,0.15)]'
              : 'bg-white/5 border border-white/20 hover:border-neon-cyan/40 hover:bg-neon-cyan/10'
            }
            ${!isSupported ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}
          `}
          aria-label={isListening ? 'Stop voice input' : 'Start voice input'}
        >
          <AnimatePresence mode="wait">
            {isListening ? (
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
        {(isListening || wakeWordDetected) && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="text-center"
          >
            {lastSentText ? (
              <div className="space-y-1">
                <p className="text-xs text-neon-cyan/40 font-mono uppercase">Sent</p>
                <p className="text-sm text-neon-cyan/80 font-mono max-w-[200px] truncate">
                  &ldquo;{lastSentText}&rdquo;
                </p>
              </div>
            ) : transcript ? (
              <p className="text-sm text-neon-cyan/80 font-mono max-w-[200px] truncate">
                &ldquo;{transcript}&rdquo;
              </p>
            ) : (
              <p className="text-xs text-neon-cyan/50 font-mono animate-pulse">
                {wakeWordDetected ? 'Wake word detected...' : 'Listening...'}
              </p>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Not supported message */}
      {!isSupported && (
        <p className="text-[10px] text-white/30 font-mono">
          Voice not supported
        </p>
      )}
    </div>
  )
}
