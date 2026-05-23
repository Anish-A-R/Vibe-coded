'use client'

import { useEffect, useRef, useCallback, useState } from 'react'
import { useJarvisStore } from './useJarvisStore'

// ===== Speech Recognition Type Declarations =====
interface SpeechRecognitionResultList {
  length: number
  item(index: number): SpeechRecognitionResult
  [index: number]: SpeechRecognitionResult
}

interface SpeechRecognitionResult {
  isFinal: boolean
  length: number
  item(index: number): SpeechRecognitionAlternative
  [index: number]: SpeechRecognitionAlternative
}

interface SpeechRecognitionAlternative {
  transcript: string
  confidence: number
}

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
  maxAlternatives: number
  start: () => void
  stop: () => void
  abort: () => void
  onresult: ((event: SpeechRecognitionEvent) => void) | null
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null
  onend: (() => void) | null
  onstart: (() => void) | null
  onaudiostart: (() => void) | null
  onaudioend: (() => void) | null
  onsoundstart: (() => void) | null
  onsoundend: (() => void) | null
  onspeechstart: (() => void) | null
  onspeechend: (() => void) | null
  onnomatch: (() => void) | null
}

declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognitionInstance
    webkitSpeechRecognition: new () => SpeechRecognitionInstance
  }
}

// ===== Constants =====
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

// ===== Browser Detection =====
function detectBrowser(): { name: string; isChromeBased: boolean; isFirefox: boolean; isSafari: boolean } {
  if (typeof window === 'undefined') return { name: 'unknown', isChromeBased: false, isFirefox: false, isSafari: false }
  const ua = navigator.userAgent.toLowerCase()
  const isFirefox = ua.includes('firefox')
  const isSafari = ua.includes('safari') && !ua.includes('chrom') && !ua.includes('edge')
  const isChromeBased = ua.includes('chrom') || ua.includes('edge')
  let name = 'unknown'
  if (isFirefox) name = 'firefox'
  else if (isSafari) name = 'safari'
  else if (ua.includes('edg')) name = 'edge'
  else if (ua.includes('opr') || ua.includes('opera')) name = 'opera'
  else if (ua.includes('chrome')) name = 'chrome'
  return { name, isChromeBased, isFirefox, isSafari }
}

/**
 * Enhanced Voice Recognition Hook
 * 
 * Windows/Chrome fixes:
 * 1. Watchdog timer - restarts recognition if no events received for 12s (Chrome silent death bug)
 * 2. Periodic force-restart every 25s to prevent Chrome's continuous mode from silently failing
 * 3. Delayed restart on onend (300ms) to avoid race conditions
 * 4. Proper result index tracking using event.resultIndex
 * 5. Better error recovery with retry backoff
 * 6. Microphone permission detection
 * 7. Browser compatibility detection
 */
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
  const [micPermission, setMicPermission] = useState<'granted' | 'denied' | 'prompt' | 'unknown'>('unknown')
  const [recognitionState, setRecognitionState] = useState<'inactive' | 'starting' | 'active' | 'error' | 'restarting'>('inactive')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  // Track whether we're in active listening mode (user-initiated) vs passive wake-word listening
  const activeListeningRef = useRef(false)

  // Watchdog timer refs
  const watchdogTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const forceRestartTimerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const restartDelayTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const lastActivityRef = useRef<number>(Date.now())

  // Retry backoff
  const retryCountRef = useRef(0)
  const maxRetries = 5

  // Track if we're currently in the process of creating/starting recognition
  const isCreatingRef = useRef(false)

  // Browser info
  const browserInfo = useRef(detectBrowser())

  // Keep ref in sync
  useEffect(() => {
    isListeningRef.current = isListening
    activeListeningRef.current = isListening
  }, [isListening])

  // ===== Check Microphone Permission =====
  useEffect(() => {
    if (typeof window === 'undefined' || !navigator.permissions) return

    const checkPermission = async () => {
      try {
        const result = await navigator.permissions.query({ name: 'microphone' as PermissionName })
        setMicPermission(result.state as 'granted' | 'denied' | 'prompt')
        result.onchange = () => {
          setMicPermission(result.state as 'granted' | 'denied' | 'prompt')
        }
      } catch {
        // permissions.query not supported for microphone in all browsers
        setMicPermission('unknown')
      }
    }

    checkPermission()
  }, [])

  // ===== Watchdog: Restart recognition if no activity for 12 seconds =====
  const resetWatchdog = useCallback(() => {
    lastActivityRef.current = Date.now()
    if (watchdogTimerRef.current) {
      clearTimeout(watchdogTimerRef.current)
    }
    // Check every 3 seconds if recognition is still alive
    watchdogTimerRef.current = setTimeout(() => {
      const elapsed = Date.now() - lastActivityRef.current
      if (elapsed > 12000 && shouldListenRef.current && recognitionRef.current) {
        console.warn('[VoiceRecognition] Watchdog triggered - no activity for 12s, restarting recognition')
        setRecognitionState('restarting')
        try {
          recognitionRef.current.abort()
        } catch { /* ignore */ }
        // The onend handler will restart it
      }
    }, 15000)
  }, [])

  // ===== Stop all timers =====
  const clearAllTimers = useCallback(() => {
    if (watchdogTimerRef.current) {
      clearTimeout(watchdogTimerRef.current)
      watchdogTimerRef.current = null
    }
    if (forceRestartTimerRef.current) {
      clearInterval(forceRestartTimerRef.current)
      forceRestartTimerRef.current = null
    }
    if (restartDelayTimerRef.current) {
      clearTimeout(restartDelayTimerRef.current)
      restartDelayTimerRef.current = null
    }
  }, [])

  // ===== Create recognition instance =====
  // NOTE: startRecognition is defined inline here to avoid circular dependency
  useEffect(() => {
    if (!isSupported || typeof window === 'undefined') return

    const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SpeechRecognitionAPI) return

    // Prevent double-creation
    if (isCreatingRef.current) return
    isCreatingRef.current = true

    // Stop existing
    if (recognitionRef.current) {
      try { recognitionRef.current.abort() } catch { /* ignore */ }
    }

    const recognition = new SpeechRecognitionAPI()
    
    // IMPORTANT: Chrome on Windows has a bug where continuous mode silently dies.
    // We use continuous = true but implement our own watchdog and periodic restart.
    recognition.continuous = true
    recognition.interimResults = true
    recognition.lang = voiceLanguage || 'en-US'
    recognition.maxAlternatives = 1

    // Session tracking
    let sessionWakeWordFound = false
    let lastProcessedIndex = -1

    // ===== Local startRecognition function (avoids circular dep) =====
    const startRecognition = (rec: SpeechRecognitionInstance) => {
      if (!shouldListenRef.current) return

      try {
        setRecognitionState('starting')
        rec.start()
        retryCountRef.current = 0
      } catch (e: unknown) {
        const errMsg = e instanceof Error ? e.message : String(e)
        if (!errMsg.includes('already started') && !errMsg.includes('started')) {
          console.warn('[VoiceRecognition] Start error:', errMsg)
          setRecognitionState('error')
          setErrorMessage(`Failed to start recognition: ${errMsg}`)

          // Retry with backoff
          if (retryCountRef.current < maxRetries) {
            retryCountRef.current++
            const delay = Math.min(1000 * Math.pow(2, retryCountRef.current - 1), 8000)
            console.log(`[VoiceRecognition] Retrying start in ${delay}ms (attempt ${retryCountRef.current}/${maxRetries})`)
            restartDelayTimerRef.current = setTimeout(() => {
              if (shouldListenRef.current) {
                startRecognition(rec)
              }
            }, delay)
          }
        } else {
          setRecognitionState('active')
        }
      }
    }

    // ===== onresult handler =====
    recognition.onresult = (event: SpeechRecognitionEvent) => {
      // Reset watchdog on any activity
      if (watchdogTimerRef.current) {
        clearTimeout(watchdogTimerRef.current)
      }
      lastActivityRef.current = Date.now()
      // Set up next watchdog check
      watchdogTimerRef.current = setTimeout(() => {
        const elapsed = Date.now() - lastActivityRef.current
        if (elapsed > 12000 && shouldListenRef.current && recognitionRef.current) {
          console.warn('[VoiceRecognition] Watchdog triggered - no activity for 12s')
          setRecognitionState('restarting')
          try { recognitionRef.current.abort() } catch { /* ignore */ }
        }
      }, 15000)

      // Process ALL new results since last processed index
      let interimTranscript = ''
      let finalTranscript = ''

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i]
        const text = result[0].transcript.trim()

        if (result.isFinal) {
          if (i > lastProcessedIndex) {
            finalTranscript += text
            lastProcessedIndex = i
          }
        } else {
          interimTranscript = text
        }
      }

      // Update the displayed transcript with interim results for real-time feedback
      if (interimTranscript) {
        setTranscript(interimTranscript)
      }

      // Process final transcript
      if (finalTranscript) {
        const lowerText = finalTranscript.toLowerCase()
        const wakeWords = getWakeWords(voiceLanguage)
        const hasWakeWord = wakeWords.some(w => lowerText.includes(w))

        if (hasWakeWord && !sessionWakeWordFound) {
          sessionWakeWordFound = true
          setWakeWordDetected(true)

          if (!activeListeningRef.current) {
            setIsListening(true)
            setAIStatus('listening')
          }
        }

        let cleanText = finalTranscript
        for (const w of wakeWords) {
          cleanText = cleanText.replace(new RegExp(w, 'gi'), '')
        }
        cleanText = cleanText.trim()

        if (cleanText && (sessionWakeWordFound || activeListeningRef.current)) {
          if (onFinalTranscriptRef.current) {
            onFinalTranscriptRef.current(cleanText)
          }
          sessionWakeWordFound = false
          setWakeWordDetected(false)
        }

        setTranscript(finalTranscript)
      } else if (interimTranscript) {
        const lowerInterim = interimTranscript.toLowerCase()
        const wakeWords = getWakeWords(voiceLanguage)
        if (wakeWords.some(w => lowerInterim.includes(w)) && !sessionWakeWordFound) {
          sessionWakeWordFound = true
          setWakeWordDetected(true)
          if (!activeListeningRef.current) {
            setIsListening(true)
            setAIStatus('listening')
          }
        }
      }
    }

    // ===== onerror handler =====
    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      // Reset watchdog
      if (watchdogTimerRef.current) {
        clearTimeout(watchdogTimerRef.current)
      }

      if (event.error === 'not-allowed') {
        console.warn('[VoiceRecognition] Microphone permission denied.')
        shouldListenRef.current = false
        setIsListening(false)
        activeListeningRef.current = false
        setRecognitionState('error')
        setErrorMessage('Microphone permission denied. Please allow microphone access in your browser settings.')
        setMicPermission('denied')
        try { recognition.abort() } catch { /* ignore */ }
        clearAllTimers()
        return
      }

      if (event.error === 'no-speech') {
        return
      }

      if (event.error === 'aborted') {
        return
      }

      if (event.error === 'network') {
        console.warn('[VoiceRecognition] Network error - speech service unreachable')
        setRecognitionState('error')
        setErrorMessage('Network error - speech recognition service unreachable. Check your internet connection.')
        retryCountRef.current = Math.min(retryCountRef.current + 1, maxRetries)
        return
      }

      if (event.error === 'audio-capture') {
        console.warn('[VoiceRecognition] No microphone found')
        setRecognitionState('error')
        setErrorMessage('No microphone detected. Please connect a microphone and try again.')
        shouldListenRef.current = false
        setIsListening(false)
        activeListeningRef.current = false
        clearAllTimers()
        return
      }

      if (event.error === 'service-not-allowed') {
        console.warn('[VoiceRecognition] Speech service not allowed')
        setRecognitionState('error')
        setErrorMessage('Speech recognition service not allowed in this browser/environment.')
        shouldListenRef.current = false
        setIsListening(false)
        activeListeningRef.current = false
        clearAllTimers()
        return
      }

      console.warn('[VoiceRecognition] Error:', event.error, event.message)
      retryCountRef.current = Math.min(retryCountRef.current + 1, maxRetries)
    }

    // ===== onend handler - auto-restart with delay =====
    recognition.onend = () => {
      if (!shouldListenRef.current) {
        setRecognitionState('inactive')
        return
      }

      // Calculate restart delay with exponential backoff for repeated failures
      const baseDelay = 300
      const backoffDelay = retryCountRef.current > 0
        ? Math.min(baseDelay * Math.pow(2, retryCountRef.current - 1), 5000)
        : baseDelay

      setRecognitionState('restarting')

      restartDelayTimerRef.current = setTimeout(() => {
        if (!shouldListenRef.current) {
          setRecognitionState('inactive')
          return
        }

        if (activeListeningRef.current && recognitionRef.current) {
          startRecognition(recognitionRef.current)
        } else if (wakeWordEnabled && !activeListeningRef.current) {
          startRecognition(recognitionRef.current)
        } else {
          setRecognitionState('inactive')
        }
      }, backoffDelay)
    }

    // ===== onstart handler =====
    recognition.onstart = () => {
      lastActivityRef.current = Date.now()
      setRecognitionState('active')
      setErrorMessage(null)
      retryCountRef.current = 0

      // Set up watchdog
      if (watchdogTimerRef.current) {
        clearTimeout(watchdogTimerRef.current)
      }
      watchdogTimerRef.current = setTimeout(() => {
        const elapsed = Date.now() - lastActivityRef.current
        if (elapsed > 12000 && shouldListenRef.current && recognitionRef.current) {
          console.warn('[VoiceRecognition] Watchdog triggered after start')
          try { recognitionRef.current.abort() } catch { /* ignore */ }
        }
      }, 15000)
    }

    // ===== Audio event handlers for better activity tracking =====
    recognition.onaudiostart = () => {
      lastActivityRef.current = Date.now()
    }
    recognition.onaudioend = () => {
      lastActivityRef.current = Date.now()
    }
    recognition.onspeechstart = () => {
      lastActivityRef.current = Date.now()
    }
    recognition.onspeechend = () => {
      lastActivityRef.current = Date.now()
    }
    recognition.onnomatch = () => {
      lastActivityRef.current = Date.now()
    }

    recognitionRef.current = recognition

    // ===== Start listening based on current state =====
    shouldListenRef.current = true

    if (isListeningRef.current) {
      startRecognition(recognition)
    } else if (wakeWordEnabled) {
      startRecognition(recognition)
    }

    // ===== Periodic force-restart for Chrome on Windows =====
    if (browserInfo.current.isChromeBased) {
      forceRestartTimerRef.current = setInterval(() => {
        if (shouldListenRef.current && recognitionRef.current && activeListeningRef.current) {
          const elapsed = Date.now() - lastActivityRef.current
          if (elapsed > 5000) {
            console.log('[VoiceRecognition] Periodic force-restart (Chrome/Windows workaround)')
            try {
              recognitionRef.current.stop()
            } catch {
              try {
                recognitionRef.current.abort()
              } catch { /* ignore */ }
            }
          }
        }
      }, 25000)
    }

    isCreatingRef.current = false

    // ===== Cleanup =====
    return () => {
      shouldListenRef.current = false
      isCreatingRef.current = false
      clearAllTimers()

      if (recognitionRef.current) {
        try { recognitionRef.current.abort() } catch { /* ignore */ }
      }
      recognitionRef.current = null
      setRecognitionState('inactive')
    }
  }, [isSupported, voiceLanguage, wakeWordEnabled, clearAllTimers, setIsListening, setAIStatus])

  // ===== Handle isListening changes separately =====
  useEffect(() => {
    const recognition = recognitionRef.current
    if (!recognition) return

    if (isListening) {
      activeListeningRef.current = true
      shouldListenRef.current = true
      try {
        setRecognitionState('starting')
        recognition.start()
        retryCountRef.current = 0
        setAIStatus('listening')
      } catch (e: unknown) {
        const errMsg = e instanceof Error ? e.message : String(e)
        if (!errMsg.includes('already started') && !errMsg.includes('started')) {
          console.warn('[VoiceRecognition] Start error on isListening change:', errMsg)
        } else {
          setRecognitionState('active')
        }
      }
    } else {
      activeListeningRef.current = false
      if (aiStatus === 'listening') {
        setAIStatus('idle')
      }
    }
  }, [isListening, aiStatus, setAIStatus])

  // ===== Public API =====
  const startListening = useCallback(() => {
    if (isSupported) {
      setErrorMessage(null)
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

  const onFinalTranscript = useCallback((callback: OnFinalTranscript) => {
    onFinalTranscriptRef.current = callback
  }, [])

  const requestMicPermission = useCallback(async () => {
    if (typeof window === 'undefined') return

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      stream.getTracks().forEach(track => track.stop())
      setMicPermission('granted')
      setErrorMessage(null)
    } catch (err) {
      console.warn('[VoiceRecognition] Mic permission request denied:', err)
      setMicPermission('denied')
      setErrorMessage('Microphone access was denied. Please enable it in your browser settings.')
    }
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
    micPermission,
    recognitionState,
    errorMessage,
    requestMicPermission,
    browserInfo: browserInfo.current,
  }
}
