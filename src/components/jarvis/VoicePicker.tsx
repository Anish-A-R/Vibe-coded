'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Volume2, ChevronDown, Sliders, Play, X } from 'lucide-react'
import { useJarvisStore } from '@/hooks/useJarvisStore'
import { useThemeColors } from '@/hooks/useThemeColors'
import { useTTS } from '@/hooks/useTTS'

// ─── Voice Category Labels ──────────────────────────────────────────────
const langLabels: Record<string, string> = {
  en: 'English',
  fr: 'Français',
  de: 'Deutsch',
  es: 'Español',
  it: 'Italiano',
  pt: 'Português',
  ja: '日本語',
  ko: '한국어',
  zh: '中文',
  ru: 'Русский',
  nl: 'Nederlands',
  pl: 'Polski',
  sv: 'Svenska',
  da: 'Dansk',
  fi: 'Suomi',
  nb: 'Norsk',
  tr: 'Türkçe',
  ar: 'العربية',
  hi: 'हिन्दी',
  th: 'ไทย',
  vi: 'Tiếng Việt',
  id: 'Bahasa Indonesia',
  cs: 'Čeština',
  el: 'Ελληνικά',
  he: 'עברית',
  ro: 'Română',
  hu: 'Magyar',
  uk: 'Українська',
}

// ─── Voice Preview Button ───────────────────────────────────────────────
function VoicePreviewButton({ voiceName }: { voiceName: string }) {
  const { speak, stop, isSpeaking } = useTTS()
  const tc = useThemeColors()
  const [playing, setPlaying] = useState(false)

  const handlePreview = useCallback(() => {
    if (playing) {
      stop()
      setPlaying(false)
      return
    }

    setPlaying(true)
    // Save current voice, speak with the preview voice, then restore
    const currentVoice = useJarvisStore.getState().selectedVoice
    useJarvisStore.getState().setSelectedVoice(voiceName)

    const checkDone = setInterval(() => {
      if (!isSpeaking()) {
        clearInterval(checkDone)
        setPlaying(false)
        // Restore previous voice if different
        if (currentVoice !== voiceName) {
          useJarvisStore.getState().setSelectedVoice(currentVoice)
        }
      }
    }, 200)

    speak('Hello, I am JARVIS, your personal AI assistant.')
  }, [voiceName, speak, stop, isSpeaking, playing])

  return (
    <motion.button
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      onClick={handlePreview}
      className="w-6 h-6 rounded-full flex items-center justify-center transition-colors"
      style={{
        background: playing ? tc.rgba(0.2) : tc.rgba(0.05),
        border: `1px solid ${playing ? tc.rgba(0.4) : tc.rgba(0.1)}`,
      }}
      aria-label={`Preview voice: ${voiceName}`}
    >
      <Volume2 className="w-3 h-3" style={{ color: playing ? tc.hex : tc.rgba(0.5) }} />
    </motion.button>
  )
}

// ─── Main Component ─────────────────────────────────────────────────────
export function VoicePicker() {
  const selectedVoice = useJarvisStore((s) => s.selectedVoice)
  const setSelectedVoice = useJarvisStore((s) => s.setSelectedVoice)
  const voicePitch = useJarvisStore((s) => s.voicePitch)
  const setVoicePitch = useJarvisStore((s) => s.setVoicePitch)
  const voiceRate = useJarvisStore((s) => s.voiceRate)
  const setVoiceRate = useJarvisStore((s) => s.setVoiceRate)
  const voiceLanguage = useJarvisStore((s) => s.voiceLanguage)
  const tc = useThemeColors()

  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([])
  const [expandedLang, setExpandedLang] = useState<string | null>(null)
  const [showSettings, setShowSettings] = useState(false)
  const [voicesTimeout, setVoicesTimeout] = useState(false)

  // Load voices (async in some browsers)
  useEffect(() => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return

    const loadVoices = () => {
      const v = window.speechSynthesis.getVoices()
      if (v.length > 0) {
        setVoices(v)
        setVoicesTimeout(false)
      }
    }

    loadVoices()
    window.speechSynthesis.onvoiceschanged = loadVoices

    // Set a timeout - if voices don't load in 5 seconds, mark as timed out
    const timer = setTimeout(() => {
      const v = window.speechSynthesis.getVoices()
      if (v.length === 0) {
        setVoicesTimeout(true)
      }
    }, 5000)

    return () => {
      window.speechSynthesis.onvoiceschanged = null
      clearTimeout(timer)
    }
  }, [])

  // Group voices by language prefix
  const groupedVoices: Record<string, SpeechSynthesisVoice[]> = {}
  for (const voice of voices) {
    const lang = voice.lang.split('-')[0]
    if (!groupedVoices[lang]) groupedVoices[lang] = []
    groupedVoices[lang].push(voice)
  }

  // Sort language groups: current language first, then alphabetical
  const currentLangPrefix = voiceLanguage.split('-')[0]
  const sortedLangs = Object.keys(groupedVoices).sort((a, b) => {
    if (a === currentLangPrefix) return -1
    if (b === currentLangPrefix) return 1
    const labelA = langLabels[a] || a
    const labelB = langLabels[b] || b
    return labelA.localeCompare(labelB)
  })

  // Find the selected voice's display name
  const selectedVoiceObj = voices.find(v => v.name === selectedVoice)
  const selectedVoiceLabel = selectedVoiceObj
    ? selectedVoiceObj.name.split(/[-(]/)[0].trim()
    : 'Default'

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Volume2 className="w-3.5 h-3.5" style={{ color: tc.rgba(0.6) }} />
          <h3 className="text-[10px] font-mono uppercase tracking-[0.15em]" style={{ color: tc.rgba(0.6) }}>
            Voice
          </h3>
        </div>
        <div className="flex items-center gap-2">
          {/* Current voice pill */}
          <span
            className="text-[8px] font-mono px-2 py-0.5 rounded-full"
            style={{
              background: tc.rgba(0.08),
              border: `1px solid ${tc.rgba(0.15)}`,
              color: tc.rgba(0.5),
            }}
          >
            {selectedVoiceLabel}
          </span>
          {/* Settings toggle */}
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setShowSettings(!showSettings)}
            className="w-6 h-6 rounded-full flex items-center justify-center transition-colors"
            style={{
              background: showSettings ? tc.rgba(0.15) : tc.rgba(0.05),
              border: `1px solid ${showSettings ? tc.rgba(0.3) : tc.rgba(0.1)}`,
            }}
            aria-label="Voice settings"
          >
            <Sliders className="w-3 h-3" style={{ color: showSettings ? tc.hex : tc.rgba(0.4) }} />
          </motion.button>
        </div>
      </div>

      {/* Voice settings (pitch, rate) */}
      <AnimatePresence>
        {showSettings && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div
              className="p-3 rounded-lg space-y-3"
              style={{
                background: tc.rgba(0.03),
                border: `1px solid ${tc.rgba(0.08)}`,
              }}
            >
              {/* Pitch slider */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[9px] font-mono uppercase tracking-wider" style={{ color: tc.rgba(0.4) }}>
                    Pitch
                  </span>
                  <span className="text-[9px] font-mono" style={{ color: tc.rgba(0.5) }}>
                    {voicePitch.toFixed(1)}
                  </span>
                </div>
                <input
                  type="range"
                  min="0.1"
                  max="2"
                  step="0.1"
                  value={voicePitch}
                  onChange={(e) => setVoicePitch(parseFloat(e.target.value))}
                  className="w-full h-1 rounded-full appearance-none cursor-pointer"
                  style={{
                    background: `linear-gradient(to right, ${tc.rgba(0.3)} ${((voicePitch - 0.1) / 1.9) * 100}%, ${tc.rgba(0.1)} ${((voicePitch - 0.1) / 1.9) * 100}%)`,
                  }}
                />
              </div>

              {/* Rate slider */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[9px] font-mono uppercase tracking-wider" style={{ color: tc.rgba(0.4) }}>
                    Speed
                  </span>
                  <span className="text-[9px] font-mono" style={{ color: tc.rgba(0.5) }}>
                    {voiceRate.toFixed(1)}x
                  </span>
                </div>
                <input
                  type="range"
                  min="0.5"
                  max="2"
                  step="0.1"
                  value={voiceRate}
                  onChange={(e) => setVoiceRate(parseFloat(e.target.value))}
                  className="w-full h-1 rounded-full appearance-none cursor-pointer"
                  style={{
                    background: `linear-gradient(to right, ${tc.rgba(0.3)} ${((voiceRate - 0.5) / 1.5) * 100}%, ${tc.rgba(0.1)} ${((voiceRate - 0.5) / 1.5) * 100}%)`,
                  }}
                />
              </div>

              {/* Reset button */}
              <button
                onClick={() => {
                  setVoicePitch(0.9)
                  setVoiceRate(1.0)
                }}
                className="text-[8px] font-mono uppercase tracking-wider w-full py-1 rounded"
                style={{
                  color: tc.rgba(0.4),
                  border: `1px solid ${tc.rgba(0.1)}`,
                  background: tc.rgba(0.03),
                }}
              >
                Reset to Default
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Voice list by language */}
      <div className="max-h-48 overflow-y-auto jarvis-scrollbar space-y-1">
        {sortedLangs.map((lang) => {
          const langVoices = groupedVoices[lang]
          const isExpanded = expandedLang === lang
          const hasSelected = langVoices.some(v => v.name === selectedVoice)

          return (
            <div key={lang}>
              {/* Language group header */}
              <motion.button
                whileHover={{ x: 2 }}
                onClick={() => setExpandedLang(isExpanded ? null : lang)}
                className="w-full flex items-center justify-between px-2 py-1.5 rounded-md transition-colors"
                style={{
                  background: hasSelected ? tc.rgba(0.06) : 'transparent',
                }}
              >
                <div className="flex items-center gap-2">
                  <ChevronDown
                    className="w-3 h-3 transition-transform"
                    style={{
                      color: tc.rgba(0.3),
                      transform: isExpanded ? 'rotate(0deg)' : 'rotate(-90deg)',
                    }}
                  />
                  <span
                    className="text-[9px] font-mono uppercase tracking-wider"
                    style={{ color: hasSelected ? tc.rgba(0.7) : tc.rgba(0.4) }}
                  >
                    {langLabels[lang] || lang}
                  </span>
                  <span className="text-[8px] font-mono" style={{ color: tc.rgba(0.2) }}>
                    {langVoices.length}
                  </span>
                </div>
                {hasSelected && (
                  <div
                    className="w-1.5 h-1.5 rounded-full"
                    style={{ background: tc.hex, boxShadow: `0 0 6px ${tc.rgba(0.5)}` }}
                  />
                )}
              </motion.button>

              {/* Voice list for this language */}
              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.15 }}
                    className="overflow-hidden"
                  >
                    {langVoices.map((voice) => {
                      const isSelected = voice.name === selectedVoice
                      // Shorten voice name for display
                      const shortName = voice.name
                        .replace(/Microsoft |Google |Apple |Natural /g, '')
                        .split(/[-(]/)[0]
                        .trim()

                      return (
                        <motion.button
                          key={voice.name}
                          whileHover={{ x: 4 }}
                          onClick={() => setSelectedVoice(isSelected ? null : voice.name)}
                          className="w-full flex items-center justify-between px-3 py-1.5 rounded-md transition-colors group"
                          style={{
                            background: isSelected ? tc.rgba(0.1) : 'transparent',
                          }}
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            {/* Selection indicator */}
                            <div
                              className="w-1.5 h-1.5 rounded-full flex-shrink-0 transition-all"
                              style={{
                                background: isSelected ? tc.hex : tc.rgba(0.15),
                                boxShadow: isSelected ? `0 0 6px ${tc.rgba(0.5)}` : 'none',
                              }}
                            />
                            <span
                              className="text-[9px] font-mono truncate"
                              style={{ color: isSelected ? tc.rgba(0.8) : tc.rgba(0.4) }}
                            >
                              {shortName}
                            </span>
                            <span className="text-[7px] font-mono" style={{ color: tc.rgba(0.15) }}>
                              {voice.lang}
                            </span>
                            {voice.localService && (
                              <span className="text-[7px] font-mono" style={{ color: tc.rgba(0.15) }}>
                                ●
                              </span>
                            )}
                          </div>
                          <VoicePreviewButton voiceName={voice.name} />
                        </motion.button>
                      )
                    })}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )
        })}

        {voices.length === 0 && (
          <div className="py-4 text-center">
            <p className="text-[9px] font-mono" style={{ color: tc.rgba(0.3) }}>
              {voicesTimeout
                ? 'No voices available. Try a different browser for voice options.'
                : 'Loading voices...'
              }
            </p>
            {voicesTimeout && (
              <p className="text-[8px] font-mono mt-1" style={{ color: tc.rgba(0.2) }}>
                You can still adjust pitch and speed settings above
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
