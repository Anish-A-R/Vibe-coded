'use client'

import { useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Mic, MicOff, Loader2 } from 'lucide-react'
import { useVoiceRecognition } from '@/hooks/useVoiceRecognition'
import { useJarvisStore } from '@/hooks/useJarvisStore'
import { playActivationSound, playDeactivationSound } from '@/lib/sounds'

interface VoiceInputProps {
  className?: string
}

export function VoiceInput({ className = '' }: VoiceInputProps) {
  const { soundEnabled } = useJarvisStore()
  const { isSupported, isListening, transcript, toggleListening } = useVoiceRecognition()

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
        {isListening && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="text-center"
          >
            {transcript ? (
              <p className="text-sm text-neon-cyan/80 font-mono max-w-[200px] truncate">
                &ldquo;{transcript}&rdquo;
              </p>
            ) : (
              <p className="text-xs text-neon-cyan/50 font-mono animate-pulse">
                Listening...
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
