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

// Max consecutive restarts on same instance before creating a fresh one
const MAX_RESTARTS_BEFORE_FRESH = 3
// Max retries with backoff
const MAX_RETRIES = 10

/**
 * Robust Voice Recognition Hook
 * 
 * Key fixes for "stops after 2-3 conversations":
 * 1. Creates a FRESH SpeechRecognition instance after every few restart cycles (fixes Chrome corruption)
 * 2. Tracks restart cycle count and forces fresh instance after MAX_RESTARTS_BEFORE_FRESH cycles
 * 3. Moves sessionWakeWordFound to a ref (persists across instance recreations)
 * 4. Explicitly restarts recognition after AI finishes speaking
 * 5. Simplified onend handler: always restart if shouldListen is true
 * 6. More aggressive watchdog (8s instead of 12s)
 * 7. Health check: if recognition state is "active" but no results for 15s, force fresh instance
 * 8. Uses refs for callback functions to avoid circular dependency issues
 */
export function useVoiceRecognition() {
  const { isListening, setIsListening, aiStatus, setAIStatus, wakeWordEnabled, voiceLanguage } = useJarvisStore()
  
  // ===== Persistent refs (survive across recognition instance recreations) =====
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null)
  const isListeningRef = useRef(isListening)
  const onFinalTranscriptRef = useRef<OnFinalTranscript | null>(null)
  const shouldListenRef = useRef(false)
  const activeListeningRef = useRef(false)
  
  // Session-level state (persists across instance recreations)
  const sessionWakeWordFoundRef = useRef(false)
  const lastProcessedIndexRef = useRef(-1)
  
  // Restart tracking
  const restartCycleCountRef = useRef(0)
  const retryCountRef = useRef(0)
  const isStoppingRef = useRef(false)
  
  // Timers
  const watchdogTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const forceRestartTimerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const restartDelayTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const lastActivityRef = useRef<number>(Date.now())
  const lastResultTimeRef = useRef<number>(Date.now())
  
  // Recording buffer refs
  const recordingBufferRef = useRef<string[]>([])
  const isRecordingBufferRef = useRef(false)
  const recordingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const silenceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const countdownIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const lastSpeechTimeRef = useRef<number>(0)

  // Function refs to break circular dependencies
  const startFreshInstanceRef = useRef<() => void>(() => {})
  const setupHandlersRef = useRef<(recognition: SpeechRecognitionInstance) => void>(() => {})
  const resetWatchdogRef = useRef<() => void>(() => {})
  const processBufferedTextRef = useRef<() => void>(() => {})
  const startRecordingWindowRef = useRef<() => void>(() => {})
  const resetRecordingWindowRef = useRef<() => void>(() => {})
  
  // Browser info
  const browserInfo = useRef(detectBrowser())

  // ===== React state (for UI rendering) =====
  const [transcript, setTranscript] = useState('')
  const [isSupported] = useState(() => {
    if (typeof window === 'undefined') return false
    return !!(window.SpeechRecognition || window.webkitSpeechRecognition)
  })
  const [wakeWordDetected, setWakeWordDetected] = useState(false)
  const [micPermission, setMicPermission] = useState<'granted' | 'denied' | 'prompt' | 'unknown'>('unknown')
  const [recognitionState, setRecognitionState] = useState<'inactive' | 'starting' | 'active' | 'error' | 'restarting'>('inactive')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [recordingCountdown, setRecordingCountdown] = useState(0)
  const [isRecordingBuffer, setIsRecordingBuffer] = useState(false)

  // Keep isListening ref in sync
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
        setMicPermission('unknown')
      }
    }
    checkPermission()
  }, [])

  // ===== Clear all timers =====
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
    // Recording buffer timers
    if (recordingTimerRef.current) {
      clearTimeout(recordingTimerRef.current)
      recordingTimerRef.current = null
    }
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current)
      silenceTimerRef.current = null
    }
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current)
      countdownIntervalRef.current = null
    }
  }, [])

  // ===== Watchdog: Check if recognition is actually alive =====
  const resetWatchdog = useCallback(() => {
    lastActivityRef.current = Date.now()
    if (watchdogTimerRef.current) {
      clearTimeout(watchdogTimerRef.current)
    }
    watchdogTimerRef.current = setTimeout(() => {
      const elapsed = Date.now() - lastActivityRef.current
      const resultElapsed = Date.now() - lastResultTimeRef.current
      
      if (elapsed > 8000 && shouldListenRef.current) {
        console.warn(`[VoiceRecognition] Watchdog: no activity for ${Math.round(elapsed/1000)}s, forcing fresh instance`)
        restartCycleCountRef.current = MAX_RESTARTS_BEFORE_FRESH
        setRecognitionState('restarting')
        try { recognitionRef.current?.abort() } catch { /* onend will handle restart */ }
      } else if (resultElapsed > 15000 && shouldListenRef.current) {
        console.warn(`[VoiceRecognition] Watchdog: no results for ${Math.round(resultElapsed/1000)}s, forcing fresh instance`)
        restartCycleCountRef.current = MAX_RESTARTS_BEFORE_FRESH
        try { recognitionRef.current?.abort() } catch { /* onend will handle restart */ }
      }
    }, 4000)
  }, [])

  // Keep ref updated
  useEffect(() => {
    resetWatchdogRef.current = resetWatchdog
  }, [resetWatchdog])

  // ===== Create a fresh SpeechRecognition instance =====
  const createRecognitionInstance = useCallback((): SpeechRecognitionInstance | null => {
    if (typeof window === 'undefined') return null
    const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SpeechRecognitionAPI) return null

    const recognition = new SpeechRecognitionAPI()
    recognition.continuous = true
    recognition.interimResults = true
    recognition.lang = voiceLanguage || 'en-US'
    recognition.maxAlternatives = 1
    return recognition
  }, [voiceLanguage])

  // ===== Start a recognition instance =====
  const startRecognition = useCallback((recognition: SpeechRecognitionInstance) => {
    if (!shouldListenRef.current) return

    try {
      setRecognitionState('starting')
      recognition.start()
      retryCountRef.current = 0
    } catch (e: unknown) {
      const errMsg = e instanceof Error ? e.message : String(e)
      if (!errMsg.includes('already started') && !errMsg.includes('started')) {
        console.warn('[VoiceRecognition] Start error:', errMsg)
        setRecognitionState('error')
        setErrorMessage(`Failed to start recognition: ${errMsg}`)

        if (retryCountRef.current < MAX_RETRIES) {
          retryCountRef.current++
          const delay = Math.min(500 * Math.pow(1.5, retryCountRef.current - 1), 5000)
          console.log(`[VoiceRecognition] Retrying start in ${delay}ms (attempt ${retryCountRef.current}/${MAX_RETRIES})`)
          restartDelayTimerRef.current = setTimeout(() => {
            if (shouldListenRef.current) {
              startFreshInstanceRef.current()
            }
          }, delay)
        }
      } else {
        setRecognitionState('active')
      }
    }
  }, [])

  // ===== Create and start a completely fresh instance =====
  const startFreshInstance = useCallback(() => {
    if (!shouldListenRef.current) return
    if (typeof window === 'undefined') return

    // Abort and discard old instance
    if (recognitionRef.current) {
      isStoppingRef.current = true
      try { recognitionRef.current.abort() } catch { /* ignore */ }
      recognitionRef.current = null
    }

    const freshRecognition = createRecognitionInstance()
    if (!freshRecognition) {
      setRecognitionState('error')
      setErrorMessage('Speech recognition not supported in this browser.')
      return
    }

    setupHandlersRef.current(freshRecognition)
    recognitionRef.current = freshRecognition
    lastProcessedIndexRef.current = -1
    isStoppingRef.current = false

    startRecognition(freshRecognition)
  }, [createRecognitionInstance, startRecognition])

  // Keep ref updated
  useEffect(() => {
    startFreshInstanceRef.current = startFreshInstance
  }, [startFreshInstance])

  // ===== Recording Buffer: Process buffered text =====
  const processBufferedText = useCallback(() => {
    if (!isRecordingBufferRef.current) return

    // Clean up all recording timers
    if (recordingTimerRef.current) {
      clearTimeout(recordingTimerRef.current)
      recordingTimerRef.current = null
    }
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current)
      silenceTimerRef.current = null
    }
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current)
      countdownIntervalRef.current = null
    }

    // Combine buffered text
    const combinedText = recordingBufferRef.current.join(' ').trim()

    // Reset recording state
    isRecordingBufferRef.current = false
    recordingBufferRef.current = []
    setRecordingCountdown(0)
    setIsRecordingBuffer(false)

    // Process the combined text
    if (combinedText && onFinalTranscriptRef.current) {
      onFinalTranscriptRef.current(combinedText)
    }

    // Reset wake word state so system goes back to wake-word detection
    sessionWakeWordFoundRef.current = false
    setWakeWordDetected(false)
  }, [])

  // Keep ref updated
  useEffect(() => {
    processBufferedTextRef.current = processBufferedText
  }, [processBufferedText])

  // ===== Recording Buffer: Reset without processing =====
  const resetRecordingWindow = useCallback(() => {
    // Clean up all recording timers
    if (recordingTimerRef.current) {
      clearTimeout(recordingTimerRef.current)
      recordingTimerRef.current = null
    }
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current)
      silenceTimerRef.current = null
    }
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current)
      countdownIntervalRef.current = null
    }

    // Reset recording state without processing
    isRecordingBufferRef.current = false
    recordingBufferRef.current = []
    setRecordingCountdown(0)
    setIsRecordingBuffer(false)
  }, [])

  // Keep ref updated
  useEffect(() => {
    resetRecordingWindowRef.current = resetRecordingWindow
  }, [resetRecordingWindow])

  // ===== Recording Buffer: Start recording window =====
  const startRecordingWindow = useCallback(() => {
    if (isRecordingBufferRef.current) return // Already recording

    isRecordingBufferRef.current = true
    recordingBufferRef.current = []
    lastSpeechTimeRef.current = Date.now()
    setIsRecordingBuffer(true)
    setRecordingCountdown(5)

    console.log('[VoiceRecognition] Recording window started (5s)')

    // Start countdown interval - decrements every second
    countdownIntervalRef.current = setInterval(() => {
      setRecordingCountdown(prev => {
        if (prev <= 1) {
          // 5 seconds elapsed - process the buffer
          if (countdownIntervalRef.current) {
            clearInterval(countdownIntervalRef.current)
            countdownIntervalRef.current = null
          }
          // Use setTimeout to avoid state update during render
          setTimeout(() => processBufferedTextRef.current(), 0)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    // 5.5-second safety timer (slightly longer than countdown to avoid race)
    recordingTimerRef.current = setTimeout(() => {
      if (isRecordingBufferRef.current) {
        console.log('[VoiceRecognition] Recording safety timer fired')
        processBufferedTextRef.current()
      }
    }, 5500)
  }, [])

  // Keep ref updated
  useEffect(() => {
    startRecordingWindowRef.current = startRecordingWindow
  }, [startRecordingWindow])

  // ===== Recording Buffer: Reset silence timer =====
  const resetSilenceTimer = useCallback(() => {
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current)
      silenceTimerRef.current = null
    }

    lastSpeechTimeRef.current = Date.now()

    // Only set silence timer if we're in a recording window
    if (isRecordingBufferRef.current) {
      silenceTimerRef.current = setTimeout(() => {
        if (isRecordingBufferRef.current) {
          const elapsed = Date.now() - lastSpeechTimeRef.current
          if (elapsed >= 1800) { // Slightly less than 2s to account for timer drift
            console.log('[VoiceRecognition] Silence detected, processing buffer early')
            processBufferedTextRef.current()
          }
        }
      }, 2000)
    }
  }, [])

  // ===== Setup event handlers on a recognition instance =====
  // NOTE: Defined AFTER startFreshInstance and startRecognition to satisfy declaration order
  // NOTE: This function uses refs (resetWatchdogRef, startFreshInstanceRef) to avoid
  // circular dependency issues with useCallback ordering
  const setupRecognitionHandlers = useCallback((recognition: SpeechRecognitionInstance) => {
    // ===== onresult handler =====
    recognition.onresult = (event: SpeechRecognitionEvent) => {
      lastActivityRef.current = Date.now()
      lastResultTimeRef.current = Date.now()

      // Reset watchdog
      resetWatchdogRef.current()

      let interimTranscript = ''
      let finalTranscript = ''

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i]
        const text = result[0].transcript.trim()

        if (result.isFinal) {
          if (i > lastProcessedIndexRef.current) {
            finalTranscript += text
            lastProcessedIndexRef.current = i
          }
        } else {
          interimTranscript = text
        }
      }

      if (interimTranscript) {
        setTranscript(interimTranscript)
      }

      if (finalTranscript) {
        const lowerText = finalTranscript.toLowerCase()
        const wakeWords = getWakeWords(voiceLanguage)
        const hasWakeWord = wakeWords.some(w => lowerText.includes(w))

        if (hasWakeWord && !sessionWakeWordFoundRef.current) {
          sessionWakeWordFoundRef.current = true
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

        if (cleanText && (sessionWakeWordFoundRef.current || activeListeningRef.current)) {
          // NEW: Buffer the text instead of processing immediately
          // Start recording window if not already active
          if (!isRecordingBufferRef.current) {
            startRecordingWindowRef.current()
          }
          recordingBufferRef.current.push(cleanText)
          console.log(`[VoiceRecognition] Buffered: "${cleanText}" (buffer: ${recordingBufferRef.current.length} items)`)
          // Reset silence timer on each speech activity
          resetSilenceTimer()
        }

        setTranscript(finalTranscript)
      } else if (interimTranscript) {
        const lowerInterim = interimTranscript.toLowerCase()
        const wakeWords = getWakeWords(voiceLanguage)
        if (wakeWords.some(w => lowerInterim.includes(w)) && !sessionWakeWordFoundRef.current) {
          sessionWakeWordFoundRef.current = true
          setWakeWordDetected(true)
          if (!activeListeningRef.current) {
            setIsListening(true)
            setAIStatus('listening')
          }
        }
        // Reset silence timer on interim results (user is still speaking)
        if (isRecordingBufferRef.current) {
          resetSilenceTimer()
        }
      }
    }

    // ===== onerror handler =====
    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      lastActivityRef.current = Date.now()

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
        if (isStoppingRef.current) return
        return
      }

      if (event.error === 'network') {
        console.warn('[VoiceRecognition] Network error - speech service unreachable')
        setRecognitionState('error')
        setErrorMessage('Network error - speech recognition service unreachable.')
        retryCountRef.current = Math.min(retryCountRef.current + 1, MAX_RETRIES)
        return
      }

      if (event.error === 'audio-capture') {
        console.warn('[VoiceRecognition] No microphone found')
        setRecognitionState('error')
        setErrorMessage('No microphone detected. Please connect a microphone.')
        shouldListenRef.current = false
        setIsListening(false)
        activeListeningRef.current = false
        clearAllTimers()
        return
      }

      if (event.error === 'service-not-allowed') {
        console.warn('[VoiceRecognition] Speech service not allowed')
        setRecognitionState('error')
        setErrorMessage('Speech recognition not allowed in this browser.')
        shouldListenRef.current = false
        setIsListening(false)
        activeListeningRef.current = false
        clearAllTimers()
        return
      }

      console.warn('[VoiceRecognition] Error:', event.error, event.message)
      retryCountRef.current = Math.min(retryCountRef.current + 1, MAX_RETRIES)
    }

    // ===== onend handler - CRITICAL: Always restart if we should be listening =====
    recognition.onend = () => {
      if (isStoppingRef.current) {
        isStoppingRef.current = false
        setRecognitionState('inactive')
        return
      }

      if (!shouldListenRef.current) {
        setRecognitionState('inactive')
        return
      }

      restartCycleCountRef.current++
      console.log(`[VoiceRecognition] onend fired. Restart cycle: ${restartCycleCountRef.current}`)

      // After MAX_RESTARTS_BEFORE_FRESH cycles on the same instance, force a completely fresh one
      // This is the KEY FIX for Chrome's recognition corruption bug
      if (restartCycleCountRef.current >= MAX_RESTARTS_BEFORE_FRESH) {
        console.log('[VoiceRecognition] Max restart cycles reached, creating fresh instance')
        restartCycleCountRef.current = 0
        lastProcessedIndexRef.current = -1

        try { recognition.abort() } catch { /* ignore */ }
        recognitionRef.current = null

        setRecognitionState('restarting')
        restartDelayTimerRef.current = setTimeout(() => {
          if (shouldListenRef.current) {
            startFreshInstanceRef.current()
          } else {
            setRecognitionState('inactive')
          }
        }, 500)
        return
      }

      // Normal restart with exponential backoff
      const baseDelay = 200
      const backoffDelay = retryCountRef.current > 0
        ? Math.min(baseDelay * Math.pow(1.5, retryCountRef.current - 1), 3000)
        : baseDelay

      setRecognitionState('restarting')

      restartDelayTimerRef.current = setTimeout(() => {
        if (!shouldListenRef.current) {
          setRecognitionState('inactive')
          return
        }

        // Always restart - no conditional logic based on activeListening or wakeWordEnabled
        try {
          if (recognitionRef.current === recognition) {
            startRecognition(recognition)
          } else if (recognitionRef.current) {
            startRecognition(recognitionRef.current)
          } else {
            startFreshInstanceRef.current()
          }
        } catch {
          console.warn('[VoiceRecognition] Restart failed, creating fresh instance')
          startFreshInstanceRef.current()
        }
      }, backoffDelay)
    }

    // ===== onstart handler =====
    recognition.onstart = () => {
      lastActivityRef.current = Date.now()
      lastResultTimeRef.current = Date.now()
      setRecognitionState('active')
      setErrorMessage(null)
      retryCountRef.current = 0
      isStoppingRef.current = false
      resetWatchdogRef.current()
    }

    // ===== Audio event handlers =====
    recognition.onaudiostart = () => { lastActivityRef.current = Date.now() }
    recognition.onaudioend = () => { lastActivityRef.current = Date.now() }
    recognition.onspeechstart = () => { lastActivityRef.current = Date.now() }
    recognition.onspeechend = () => { lastActivityRef.current = Date.now() }
    recognition.onnomatch = () => { lastActivityRef.current = Date.now() }
  }, [voiceLanguage, wakeWordEnabled, clearAllTimers, setIsListening, setAIStatus, startRecognition, startFreshInstance])

  // Keep handler ref updated
  useEffect(() => {
    setupHandlersRef.current = setupRecognitionHandlers
  }, [setupRecognitionHandlers])

  // ===== Main initialization effect =====
  useEffect(() => {
    if (!isSupported || typeof window === 'undefined') return

    // Don't start if mic permission was denied
    if (micPermission === 'denied') return

    if (isListeningRef.current || wakeWordEnabled) {
      shouldListenRef.current = true
    }

    if (shouldListenRef.current) {
      startFreshInstance()
    }

    // Periodic health check for Chrome
    if (browserInfo.current.isChromeBased) {
      forceRestartTimerRef.current = setInterval(() => {
        if (shouldListenRef.current) {
          const resultElapsed = Date.now() - lastResultTimeRef.current
          const activityElapsed = Date.now() - lastActivityRef.current
          
          if (resultElapsed > 20000 && activityElapsed > 5000) {
            console.log('[VoiceRecognition] Periodic health check: forcing fresh instance')
            restartCycleCountRef.current = MAX_RESTARTS_BEFORE_FRESH
            if (recognitionRef.current) {
              try { recognitionRef.current.abort() } catch { /* ignore */ }
            }
          }
        }
      }, 15000)
    }

    return () => {
      shouldListenRef.current = false
      isStoppingRef.current = true
      clearAllTimers()
      if (recognitionRef.current) {
        try { recognitionRef.current.abort() } catch { /* ignore */ }
      }
      recognitionRef.current = null
      setRecognitionState('inactive')
    }
  }, [isSupported, voiceLanguage, wakeWordEnabled, micPermission, clearAllTimers, startFreshInstance])

  // ===== Handle isListening changes =====
  useEffect(() => {
    if (isListening) {
      // Don't start if mic permission was denied
      if (micPermission === 'denied') return
      activeListeningRef.current = true
      shouldListenRef.current = true
      setAIStatus('listening')
      
      if (recognitionState === 'inactive' || recognitionState === 'error') {
        startFreshInstance()
      }
    } else {
      activeListeningRef.current = false
      if (aiStatus === 'listening') {
        setAIStatus('idle')
      }
    }
  }, [isListening, aiStatus, setAIStatus, recognitionState, micPermission, startFreshInstance])

  // ===== CRITICAL FIX: Restart recognition after AI finishes speaking =====
  useEffect(() => {
    if (aiStatus === 'idle' && shouldListenRef.current) {
      const checkDelay = setTimeout(() => {
        if (!shouldListenRef.current) return
        
        const resultElapsed = Date.now() - lastResultTimeRef.current
        const currentState = recognitionState
        
        if (currentState === 'inactive' || currentState === 'error') {
          console.log('[VoiceRecognition] AI finished speaking, recognition not active - restarting')
          startFreshInstance()
        } else if (currentState === 'active' && resultElapsed > 20000) {
          console.log('[VoiceRecognition] AI finished speaking, recognition stale - forcing fresh instance')
          restartCycleCountRef.current = MAX_RESTARTS_BEFORE_FRESH
          try { recognitionRef.current?.abort() } catch { /* ignore */ }
        }
      }, 800)
      
      return () => clearTimeout(checkDelay)
    }
  }, [aiStatus, recognitionState, startFreshInstance])

  // ===== Handle wakeWordEnabled changes =====
  useEffect(() => {
    if (wakeWordEnabled && !shouldListenRef.current && !isListening && micPermission !== 'denied') {
      shouldListenRef.current = true
      if (recognitionState === 'inactive') {
        startFreshInstance()
      }
    }
  }, [wakeWordEnabled, isListening, recognitionState, micPermission, startFreshInstance])

  // ===== Public API =====
  const startListening = useCallback(() => {
    if (isSupported) {
      setErrorMessage(null)
      setIsListening(true)
    }
  }, [isSupported, setIsListening])

  const stopListening = useCallback(() => {
    isStoppingRef.current = true
    shouldListenRef.current = false
    setIsListening(false)
    setTranscript('')
    setWakeWordDetected(false)
    sessionWakeWordFoundRef.current = false

    // Reset recording window (discard any buffered text)
    resetRecordingWindowRef.current()

    if (recognitionRef.current) {
      try { recognitionRef.current.abort() } catch { /* ignore */ }
    }
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
    recordingCountdown,
    isRecordingBuffer,
  }
}
