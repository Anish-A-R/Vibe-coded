'use client'

import { useEffect, useRef, useCallback, useState } from 'react'
import { useJarvisStore } from './useJarvisStore'

interface SpeechRecognitionEvent {
  results: SpeechRecognitionResultList
  resultIndex: number
}

interface SpeechRecognitionErrorEvent {
  error: string
  message: string
}

// Extend window for SpeechRecognition API
interface SpeechRecognitionInstance extends EventTarget {
  continuous: boolean
  interimResults: boolean
  lang: string
  start: () => void
  stop: () => void
  abort: () => void
  onresult: ((event: SpeechRecognitionEvent) => void) | null
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null
  onend: (() => void) | null
  onstart: (() => void) | null
}

declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognitionInstance
    webkitSpeechRecognition: new () => SpeechRecognitionInstance
  }
}

/**
 * Hook for Web Speech API voice recognition
 * Supports wake word detection and command input
 */
export function useVoiceRecognition() {
  const { isListening, setIsListening, aiStatus, setAIStatus, addMessage, wakeWordEnabled } = useJarvisStore()
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null)
  const [transcript, setTranscript] = useState('')
  const [isSupported, setIsSupported] = useState(() => {
    if (typeof window === 'undefined') return false
    return !!(window.SpeechRecognition || window.webkitSpeechRecognition)
  })
  const [wakeWordDetected, setWakeWordDetected] = useState(false)

  // Initialize speech recognition
  useEffect(() => {
    if (typeof window === 'undefined') return

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SpeechRecognition) {
      return
    }
    const recognition = new SpeechRecognition()
    recognition.continuous = true
    recognition.interimResults = true
    recognition.lang = 'en-US'

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      const results = event.results
      const lastResult = results[results.length - 1]
      const text = lastResult[0].transcript.toLowerCase().trim()

      setTranscript(text)

      // Check for wake word
      if (wakeWordEnabled && !wakeWordDetected) {
        if (text.includes('hey jarvis') || text.includes('ok jarvis') || text.includes('jarvis')) {
          setWakeWordDetected(true)
          setAIStatus('listening')
          // Play activation sound handled by component
        }
      }

      // If wake word was detected or listening mode, process final result
      if (wakeWordDetected && lastResult.isFinal) {
        const cleanText = text
          .replace(/hey jarvis/gi, '')
          .replace(/ok jarvis/gi, '')
          .replace(/jarvis/gi, '')
          .trim()

        if (cleanText) {
          addMessage({ role: 'user', content: cleanText, isVoice: true })
          setWakeWordDetected(false)
          setAIStatus('thinking')
        }
      }

      // Direct listening mode (no wake word required)
      if (!wakeWordEnabled && lastResult.isFinal && text) {
        addMessage({ role: 'user', content: text, isVoice: true })
        setAIStatus('thinking')
      }
    }

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      console.error('Speech recognition error:', event.error)
      if (event.error !== 'no-speech' && event.error !== 'aborted') {
        setIsListening(false)
      }
    }

    recognition.onend = () => {
      // Auto-restart if still supposed to be listening
      if (isListening && recognitionRef.current) {
        try {
          recognitionRef.current.start()
        } catch {
          // Already started, ignore
        }
      }
    }

    recognitionRef.current = recognition

    return () => {
      recognition.abort()
    }
  }, [wakeWordEnabled, wakeWordDetected, isListening, addMessage, setAIStatus, setIsListening])

  const startListening = useCallback(() => {
    if (recognitionRef.current && isSupported) {
      try {
        recognitionRef.current.start()
        setIsListening(true)
        setAIStatus('listening')
      } catch {
        // Already started
      }
    }
  }, [isSupported, setIsListening, setAIStatus])

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop()
      setIsListening(false)
      if (aiStatus === 'listening') {
        setAIStatus('idle')
      }
    }
  }, [setIsListening, aiStatus, setAIStatus])

  const toggleListening = useCallback(() => {
    if (isListening) {
      stopListening()
    } else {
      startListening()
    }
  }, [isListening, startListening, stopListening])

  return {
    isSupported,
    isListening,
    transcript,
    wakeWordDetected,
    startListening,
    stopListening,
    toggleListening,
  }
}
