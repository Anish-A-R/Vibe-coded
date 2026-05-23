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

// Multi-lingual wake words
const WAKE_WORDS_BY_LANG: Record<string, string[]> = {
  'en': ['jarvis', 'hey jarvis', 'ok jarvis', 'jarvas', 'jarves'],
  'es': ['jarvis', 'hey jarvis', 'oye jarvis'],
  'fr': ['jarvis', 'hey jarvis', 'bonjour jarvis'],
  'de': ['jarvis', 'hey jarvis', 'hallo jarvis'],
  'hi': ['jarvis', 'hey jarvis', 'जार्विस'],
  'ja': ['jarvis', 'hey jarvis', 'ジャーヴィス'],
  'zh': ['jarvis', 'hey jarvis', '贾维斯'],
  'pt': ['jarvis', 'hey jarvis', 'oi jarvis'],
  'ko': ['jarvis', 'hey jarvis', '자비스'],
  'ar': ['jarvis', 'hey jarvis', 'جارفيس'],
  'it': ['jarvis', 'hey jarvis', 'ciao jarvis'],
  'ru': ['jarvis', 'hey jarvis', 'джарвис'],
}

function getWakeWords(lang: string): string[] {
  const prefix = lang.split('-')[0]
  return WAKE_WORDS_BY_LANG[prefix] || WAKE_WORDS_BY_LANG['en']
}

export function useVoiceRecognition() {
  const { isListening, setIsListening, aiStatus, setAIStatus, wakeWordEnabled, voiceLanguage } = useJarvisStore()
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null)
  const isListeningRef = useRef(isListening)
  const onFinalTranscriptRef = useRef<OnFinalTranscript | null>(null)
  const shouldListenRef = useRef(false)
  const [transcript, setTranscript] = useState('')
  const [isSupported] = useState(() => {
    if (typeof window === 'undefined') return false
    return !!(window.SpeechRecognition || window.webkitSpeechRecognition)
  })
  const [wakeWordDetected, setWakeWordDetected] = useState(false)

  // Track whether we're in active listening mode (user-initiated)
  // vs passive wake-word listening mode
  const activeListeningRef = useRef(false)

  // Keep ref in sync
  useEffect(() => {
    isListeningRef.current = isListening
    activeListeningRef.current = isListening
  }, [isListening])

  // Create recognition instance - only recreate when language changes
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

    // Track accumulated transcript for the current session
    let accumulatedTranscript = ''
    let wakeWordFoundInSession = false

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      const results = event.results
      const lastResult = results[results.length - 1]
      const text = lastResult[0].transcript.trim()

      // Show interim results in the transcript display
      setTranscript(text)

      // Check for wake word
      const lowerText = text.toLowerCase()
      const wakeWords = getWakeWords(voiceLanguage)
      const hasWakeWord = wakeWords.some(w => lowerText.includes(w))

      if (hasWakeWord && !wakeWordFoundInSession) {
        wakeWordFoundInSession = true
        setWakeWordDetected(true)

        // If we're in passive wake-word mode (not actively listening),
        // switch to active listening mode
        if (!activeListeningRef.current) {
          setIsListening(true)
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

        // If wake word was detected in this session or we're actively listening, send the message
        if (cleanText && (wakeWordFoundInSession || activeListeningRef.current)) {
          // Call the final transcript callback
          if (onFinalTranscriptRef.current) {
            onFinalTranscriptRef.current(cleanText)
          }
          // Reset wake word state for next utterance
          wakeWordFoundInSession = false
          setWakeWordDetected(false)
        }

        // Reset for next utterance
        accumulatedTranscript = ''
      }
    }

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      // Critical error: permission denied - stop all voice recognition attempts
      if (event.error === 'not-allowed') {
        console.warn('Speech recognition: microphone permission denied. Stopping all voice recognition.')
        shouldListenRef.current = false
        setIsListening(false)
        activeListeningRef.current = false
        // Abort and don't restart
        try { recognition.abort() } catch { /* ignore */ }
        return
      }

      // For transient errors, just let onend handler restart silently
      if (event.error === 'no-speech' || event.error === 'aborted' || event.error === 'network') {
        // Don't log - these are normal and happen frequently
        return
      }

      // Other errors - log once and stop active listening but keep wake word
      console.warn('Speech recognition error:', event.error)
      if (activeListeningRef.current) {
        setIsListening(false)
        activeListeningRef.current = false
      }
    }

    recognition.onend = () => {
      // Don't restart if permission was denied
      if (!shouldListenRef.current) return

      // Auto-restart if we should still be listening
      // This handles the browser's automatic session end
      if (activeListeningRef.current && recognitionRef.current) {
        try {
          recognitionRef.current.start()
        } catch {
          // Already started, ignore
        }
      } else if (wakeWordEnabled && !activeListeningRef.current) {
        // Restart in passive wake-word mode
        try {
          recognitionRef.current?.start()
        } catch {
          // Already started
        }
      }
    }

    recognition.onstart = () => {
      // Reset session state on each start
      accumulatedTranscript = ''
      wakeWordFoundInSession = false
    }

    recognitionRef.current = recognition

    // Start listening based on current state
    shouldListenRef.current = true

    if (isListeningRef.current) {
      try {
        recognition.start()
      } catch {
        // Already started
      }
    } else if (wakeWordEnabled) {
      // Start in passive wake-word detection mode
      try {
        recognition.start()
      } catch {
        // Already started
      }
    }

    return () => {
      shouldListenRef.current = false
      try { recognition.abort() } catch { /* ignore */ }
      recognitionRef.current = null
    }
  }, [isSupported, voiceLanguage, wakeWordEnabled]) // NOT aiStatus or setIsListening - those cause restarts

  // Handle isListening changes separately - start/stop without recreating
  useEffect(() => {
    const recognition = recognitionRef.current
    if (!recognition) return

    if (isListening) {
      activeListeningRef.current = true
      shouldListenRef.current = true
      try {
        recognition.start()
        setAIStatus('listening')
      } catch {
        // Already started
      }
    } else {
      activeListeningRef.current = false
      // Don't set shouldListenRef to false here if wake word is enabled
      // The onend handler will restart in passive mode
      if (aiStatus === 'listening') {
        setAIStatus('idle')
      }
    }
  }, [isListening]) // Minimal deps - only react to isListening changes

  const startListening = useCallback(() => {
    if (isSupported) {
      setIsListening(true)
    }
  }, [isSupported, setIsListening])

  const stopListening = useCallback(() => {
    setIsListening(false)
    setTranscript('')
    setWakeWordDetected(false)
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
