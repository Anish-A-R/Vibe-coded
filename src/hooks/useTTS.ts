'use client'

import { useCallback, useRef } from 'react'
import { useJarvisStore } from './useJarvisStore'

/**
 * Text-to-Speech hook using Web Speech Synthesis API
 * Allows JARVIS to speak responses aloud with multilingual support
 */
export function useTTS() {
  const { soundEnabled, volume, setAIStatus, voiceLanguage } = useJarvisStore()
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null)

  const speak = useCallback((text: string) => {
    if (!soundEnabled || typeof window === 'undefined' || !window.speechSynthesis) return

    // Cancel any ongoing speech
    window.speechSynthesis.cancel()

    // Clean text: remove markdown formatting
    const cleanText = text
      .replace(/\*\*(.*?)\*\*/g, '$1') // bold
      .replace(/\*(.*?)\*/g, '$1')     // italic
      .replace(/`{1,3}(.*?)`{1,3}/g, '$1') // code
      .replace(/\[(.*?)\]\(.*?\)/g, '$1')  // links
      .replace(/#{1,6}\s/g, '')         // headers
      .replace(/[-*+]\s/g, '')          // list items
      .replace(/^\d+\.\s/gm, '')        // numbered lists

    const utterance = new SpeechSynthesisUtterance(cleanText)
    utterance.rate = 1.0
    utterance.pitch = 0.9  // Slightly deeper for JARVIS feel
    utterance.volume = volume
    utterance.lang = voiceLanguage || 'en-US'

    // Try to find a voice matching the selected language
    const voices = window.speechSynthesis.getVoices()

    // Priority: language-specific male voice > any voice in that language > default
    const langPrefix = (voiceLanguage || 'en-US').split('-')[0]

    const preferred = voices.find(v =>
      v.lang === (voiceLanguage || 'en-US') && (v.name.toLowerCase().includes('male') || v.name.includes('Daniel') || v.name.includes('Google UK English Male'))
    ) || voices.find(v => v.lang === (voiceLanguage || 'en-US'))
      || voices.find(v => v.lang.startsWith(langPrefix) && (v.name.toLowerCase().includes('male') || v.name.includes('Daniel')))
      || voices.find(v => v.lang.startsWith(langPrefix))

    if (preferred) utterance.voice = preferred

    utterance.onstart = () => setAIStatus('speaking')
    utterance.onend = () => setAIStatus('idle')
    utterance.onerror = () => setAIStatus('idle')

    utteranceRef.current = utterance
    window.speechSynthesis.speak(utterance)
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
