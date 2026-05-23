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

// Type for the onFinalTranscript callback
type OnFinalTranscript = (text: string) => void

export function useVoiceRecognition() {
  const { isListening, setIsListening, aiStatus, setAIStatus, wakeWordEnabled, voiceLanguage } = useJarvisStore()
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null)
  const isListeningRef = useRef(isListening)
  const onFinalTranscriptRef = useRef<OnFinalTranscript | null>(null)
  const [transcript, setTranscript] = useState('')
  const [isSupported] = useState(() => {
    if (typeof window === 'undefined') return false
    return !!(window.SpeechRecognition || window.webkitSpeechRecognition)
  })
  const [wakeWordDetected, setWakeWordDetected] = useState(false)

  // Keep ref in sync (must be in effect to avoid render-time ref access)
  useEffect(() => {
    isListeningRef.current = isListening
  }, [isListening])

  // Create/update recognition instance
  useEffect(() => {
    if (!isSupported || typeof window === 'undefined') return

    const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SpeechRecognitionAPI) return

    // Stop existing
    if (recognitionRef.current) {
      try { recognitionRef.current.abort() } catch { /* ignore */ }
    }

    const recognition = new SpeechRecognitionAPI()
    recognition.continuous = true
    recognition.interimResults = true
    recognition.lang = voiceLanguage || 'en-US'

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      const results = event.results
      const lastResult = results[results.length - 1]
      const text = lastResult[0].transcript.trim()

      setTranscript(text)

      // Check for wake word "Jarvis" (case insensitive, multiple languages)
      const lowerText = text.toLowerCase()
      const wakeWords = ['jarvis', 'hey jarvis', 'ok jarvis', 'jarvas', 'jarves']
      const hasWakeWord = wakeWords.some(w => lowerText.includes(w))

      if (hasWakeWord) {
        setWakeWordDetected(true)
        if (aiStatus === 'idle') {
          setAIStatus('listening')
        }
      }

      // When we get a final result, process it
      if (lastResult.isFinal && text) {
        // Remove wake word from the text
        let cleanText = text
        for (const w of wakeWords) {
          cleanText = cleanText.replace(new RegExp(w, 'gi'), '')
        }
        cleanText = cleanText.trim()

        // If wake word was detected or we're in listening mode, send the message
        if (cleanText && (wakeWordDetected || hasWakeWord || isListeningRef.current)) {
          // Call the final transcript callback if set
          if (onFinalTranscriptRef.current) {
            onFinalTranscriptRef.current(cleanText)
          }
          setWakeWordDetected(false)
        }
      }
    }

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      console.warn('Speech recognition error:', event.error)
      if (event.error === 'not-allowed') {
        setIsListening(false)
      }
      // Don't stop listening for transient errors
      if (event.error !== 'no-speech' && event.error !== 'aborted' && event.error !== 'network') {
        setIsListening(false)
      }
    }

    recognition.onend = () => {
      // Auto-restart if still supposed to be listening (use ref for current value)
      if (isListeningRef.current && recognitionRef.current) {
        try {
          recognitionRef.current.start()
        } catch {
          // Already started, ignore
        }
      }
    }

    recognitionRef.current = recognition

    // If wake word is enabled, start listening in background
    if (wakeWordEnabled && !isListeningRef.current) {
      try {
        recognition.start()
        // Don't set isListening to true for background wake word detection
        // The user doesn't need to see "listening" state for wake word
      } catch {
        // Already started
      }
    }

    // If currently listening, start
    if (isListeningRef.current) {
      try {
        recognition.start()
      } catch {
        // Already started
      }
    }

    return () => {
      try { recognition.abort() } catch { /* ignore */ }
    }
  }, [isSupported, voiceLanguage, wakeWordEnabled, aiStatus, setAIStatus, setIsListening])

  // Start/stop listening when isListening changes
  useEffect(() => {
    const recognition = recognitionRef.current
    if (!recognition) return

    if (isListening) {
      try {
        recognition.start()
        setAIStatus('listening')
      } catch {
        // Already started
      }
    } else {
      try {
        recognition.stop()
        if (aiStatus === 'listening') {
          setAIStatus('idle')
        }
      } catch {
        // Not started
      }
    }
  }, [isListening, aiStatus, setAIStatus])

  const startListening = useCallback(() => {
    if (isSupported) {
      setIsListening(true)
    }
  }, [isSupported, setIsListening])

  const stopListening = useCallback(() => {
    setIsListening(false)
    setTranscript('')
  }, [setIsListening])

  const toggleListening = useCallback(() => {
    if (isListening) {
      stopListening()
    } else {
      startListening()
    }
  }, [isListening, startListening, stopListening])

  // Register callback for when final transcript is ready
  const onFinalTranscript = useCallback((callback: OnFinalTranscript) => {
    onFinalTranscriptRef.current = callback
  }, [])

  return {
    isSupported,
    isListening,
    transcript,
    wakeWordDetected,
    startListening,
    stopListening,
    toggleListening,
    onFinalTranscript,
  }
}
