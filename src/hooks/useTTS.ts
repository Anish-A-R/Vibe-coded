'use client'

import { useCallback, useRef, useEffect } from 'react'
import { useJarvisStore } from './useJarvisStore'

/**
 * Text-to-Speech hook using Web Speech Synthesis API
 * Allows JARVIS to speak responses aloud with multilingual support
 * 
 * Windows/Chrome fixes:
 * - Handles Chrome bug where speechSynthesis.speak() silently fails after ~15 seconds
 * - Uses resume() workaround for Chrome's speechSynthesis pausing bug
 * - Better voice selection for Windows (prioritizes system voices)
 * - Chrome utterance length limit workaround (splits long text into chunks)
 */
export function useTTS() {
  const { soundEnabled, volume, setAIStatus, voiceLanguage } = useJarvisStore()
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null)
  const voicesLoadedRef = useRef(false)
  const chromeResumeIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // Preload voices (they load asynchronously in some browsers)
  useEffect(() => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return

    const loadVoices = () => {
      const voices = window.speechSynthesis.getVoices()
      if (voices.length > 0) {
        voicesLoadedRef.current = true
      }
    }

    loadVoices()
    window.speechSynthesis.onvoiceschanged = loadVoices

    // Chrome bug workaround: speechSynthesis can get stuck in a "paused" state
    // Calling resume() periodically keeps it alive
    const isChrome = typeof navigator !== 'undefined' && /Chrome/.test(navigator.userAgent) && !/Edge/.test(navigator.userAgent)
    if (isChrome) {
      chromeResumeIntervalRef.current = setInterval(() => {
        if (window.speechSynthesis.speaking && window.speechSynthesis.paused) {
          window.speechSynthesis.resume()
        }
      }, 5000)
    }

    return () => {
      window.speechSynthesis.onvoiceschanged = null
      if (chromeResumeIntervalRef.current) {
        clearInterval(chromeResumeIntervalRef.current)
        chromeResumeIntervalRef.current = null
      }
    }
  }, [])

  const speak = useCallback((text: string) => {
    if (!soundEnabled || typeof window === 'undefined' || !window.speechSynthesis) return

    // Cancel any ongoing speech
    window.speechSynthesis.cancel()

    // Clean text: remove markdown formatting
    const cleanText = text
      .replace(/!\[.*?\]\(.*?\)/g, '[Image]')
      .replace(/\*\*(.*?)\*\*/g, '$1')
      .replace(/\*(.*?)\*/g, '$1')
      .replace(/`{1,3}(.*?)`{1,3}/g, '$1')
      .replace(/\[(.*?)\]\(.*?\)/g, '$1')
      .replace(/#{1,6}\s/g, '')
      .replace(/[-*+]\s/g, '')
      .replace(/^\d+\.\s/gm, '')
      .replace(/<[^>]*>/g, '')
      .replace(/\|/g, ' ')
      .replace(/---+/g, '')
      .trim()

    if (!cleanText) return

    // Chrome has a bug where utterances longer than ~200 characters can silently fail
    // Split long text into sentences for more reliable playback
    const MAX_CHUNK_LENGTH = 180
    const chunks = splitIntoChunks(cleanText, MAX_CHUNK_LENGTH)

    const langCode = voiceLanguage || 'en-US'
    const langPrefix = langCode.split('-')[0]
    const voices = window.speechSynthesis.getVoices()

    // Try to find a voice matching the selected language
    const preferred = voices.find(v =>
      v.lang === langCode && (v.name.toLowerCase().includes('male') || v.name.includes('Daniel') || v.name.includes('Google UK English Male'))
    ) || voices.find(v => v.lang === langCode)
      || voices.find(v => v.lang.startsWith(langPrefix) && (v.name.toLowerCase().includes('male') || v.name.includes('Daniel')))
      || voices.find(v => v.lang.startsWith(langPrefix))
      || voices.find(v => v.default)
      || voices[0]

    let chunkIndex = 0

    const speakNextChunk = () => {
      if (chunkIndex >= chunks.length) {
        setAIStatus('idle')
        return
      }

      const chunk = chunks[chunkIndex]
      const utterance = new SpeechSynthesisUtterance(chunk)
      utterance.rate = 1.0
      utterance.pitch = 0.9
      utterance.volume = volume
      utterance.lang = voiceLanguage || 'en-US'

      if (preferred) utterance.voice = preferred

      utterance.onstart = () => {
        if (chunkIndex === 0) setAIStatus('speaking')
      }

      utterance.onend = () => {
        chunkIndex++
        if (chunkIndex < chunks.length) {
          // Small delay between chunks for Chrome stability
          setTimeout(speakNextChunk, 50)
        } else {
          setAIStatus('idle')
        }
      }

      utterance.onerror = (event) => {
        // Don't set idle on "interrupted" or "canceled" errors (these are from our cancel() calls)
        if (event.error !== 'interrupted' && event.error !== 'canceled') {
          console.warn('[TTS] Speech error:', event.error)
        }
        chunkIndex++
        if (chunkIndex < chunks.length) {
          setTimeout(speakNextChunk, 50)
        } else {
          setAIStatus('idle')
        }
      }

      utteranceRef.current = utterance
      window.speechSynthesis.speak(utterance)

      // Chrome bug workaround: resume speech synthesis if it gets stuck
      // This happens frequently on Windows Chrome
      setTimeout(() => {
        if (window.speechSynthesis.speaking && window.speechSynthesis.paused) {
          window.speechSynthesis.resume()
        }
      }, 1000)
    }

    speakNextChunk()
  }, [soundEnabled, volume, setAIStatus, voiceLanguage])

  const stop = useCallback(() => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel()
      setAIStatus('idle')
    }
  }, [setAIStatus])

  const isSpeaking = useCallback(() => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return false
    return window.speechSynthesis.speaking
  }, [])

  return { speak, stop, isSpeaking }
}

/**
 * Split text into chunks at sentence boundaries for Chrome TTS reliability
 */
function splitIntoChunks(text: string, maxLength: number): string[] {
  if (text.length <= maxLength) return [text]

  const chunks: string[] = []
  let remaining = text

  while (remaining.length > 0) {
    if (remaining.length <= maxLength) {
      chunks.push(remaining)
      break
    }

    // Try to split at sentence boundaries
    let splitIndex = -1
    const searchRange = Math.min(remaining.length, maxLength)

    // Look for sentence-ending punctuation
    for (let i = searchRange - 1; i >= searchRange * 0.5; i--) {
      const char = remaining[i]
      if (char === '.' || char === '!' || char === '?' || char === '。' || char === '।') {
        splitIndex = i + 1
        break
      }
    }

    // If no sentence boundary found, try comma/semicolon
    if (splitIndex === -1) {
      for (let i = searchRange - 1; i >= searchRange * 0.5; i--) {
        const char = remaining[i]
        if (char === ',' || char === ';' || char === ':' || char === '—' || char === '…') {
          splitIndex = i + 1
          break
        }
      }
    }

    // If still no boundary, just split at maxLength
    if (splitIndex === -1) {
      splitIndex = maxLength
    }

    chunks.push(remaining.slice(0, splitIndex).trim())
    remaining = remaining.slice(splitIndex).trim()
  }

  return chunks.filter(c => c.length > 0)
}
