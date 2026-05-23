'use client'

import { useState, useEffect, useCallback, useRef, lazy, Suspense, useMemo, memo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  MessageCircle,
  X,
  Settings,
  History,
  Activity,
  ChevronRight,
  Shield,
  Zap,
  ScrollText,
  Home as HomeIcon,
  MessageSquare,
  BarChart3,
} from 'lucide-react'
import { useJarvisStore } from '@/hooks/useJarvisStore'
import { useSystemStats } from '@/hooks/useSystemStats'
import { useHydrated } from '@/hooks/useHydrated'
import { playBootSound, playStartupCompleteSound } from '@/lib/sounds'
import { getGreeting } from '@/lib/personalities'
import ParticleField from '@/components/jarvis/ParticleField'
import CircularOrb from '@/components/jarvis/CircularOrb'
import RadarScanner from '@/components/jarvis/RadarScanner'
import VoiceEqualizer from '@/components/jarvis/VoiceEqualizer'
import BootSequence from '@/components/jarvis/BootSequence'
import StatusBar from '@/components/jarvis/StatusBar'
import { ChatPanel } from '@/components/jarvis/ChatPanel'
import { VoiceInput } from '@/components/jarvis/VoiceInput'
import SystemWidgets from '@/components/jarvis/SystemWidgets'
import { HUDFrame, DataReadout, CornerBrackets, ScanLine } from '@/components/jarvis/HUDDecorations'
import { useJarvisToast } from '@/hooks/useJarvisToast'
import { JarvisToastContainer } from '@/components/jarvis/JarvisToast'
import type { AIStatus, EventType } from '@/hooks/useJarvisStore'
import NotificationCenter from '@/components/jarvis/NotificationCenter'
import DataTicker from '@/components/jarvis/DataTicker'

// Lazy load panels that aren't visible by default
const SettingsPanel = lazy(() => import('@/components/jarvis/SettingsPanel'))
const ConversationHistory = lazy(() => import('@/components/jarvis/ConversationHistory'))
const SystemDiagnostics = lazy(() => import('@/components/jarvis/SystemDiagnostics'))
const CommandPalette = lazy(() => import('@/components/jarvis/CommandPalette'))
const KeyboardShortcutsOverlay = lazy(() => import('@/components/jarvis/KeyboardShortcutsOverlay'))
const KonamiEffect = lazy(() => import('@/components/jarvis/KonamiEffect'))
const EventLog = lazy(() => import('@/components/jarvis/EventLog'))
const WorldClockWidget = lazy(() => import('@/components/jarvis/WorldClockWidget'))
const FocusTimerWidget = lazy(() => import('@/components/jarvis/FocusTimerWidget'))
const QuickNotesWidget = lazy(() => import('@/components/jarvis/QuickNotesWidget'))
const AmbientSoundWidget = lazy(() => import('@/components/jarvis/AmbientSoundWidget'))
const SystemHealthWidget = lazy(() => import('@/components/jarvis/SystemHealthWidget'))

export default function Home() {
  const {
    booted,
    setBooted,
    aiStatus,
    setAIStatus,
    particlesEnabled,
    commandCount,
    systemStats,
    personalityMode,
    soundEnabled,
    showSettings,
    setShowSettings,
    showHistory,
    setShowHistory,
    showDiagnostics,
    setShowDiagnostics,
    messages,
    addEvent,
    easterEggActivated,
    setEasterEggActivated,
    addNotification,
    colorTheme,
    crtOverlayEnabled,
    voiceLanguage,
  } = useJarvisStore()

  const [showChat, setShowChat] = useState(false)
  const hydrated = useHydrated()

  // Compute showBoot directly from hydration state and booted flag
  // No need for separate state - avoids setState-in-effect lint warning
  const showBoot = hydrated && !booted
  const [showCommandPalette, setShowCommandPalette] = useState(false)
  const [showShortcuts, setShowShortcuts] = useState(false)
  const [showEventLog, setShowEventLog] = useState(false)
  const [konamiActive, setKonamiActive] = useState(false)
  const [orbGlow, setOrbGlow] = useState(false)
  const [greetingShown, setGreetingShown] = useState(false)
  const [greetingText, setGreetingText] = useState('')
  const [currentTime, setCurrentTime] = useState('')
  const stats = useSystemStats()
  const { addToast } = useJarvisToast()

  // Memoize personality-based classes and colors
  const personalityClass = useMemo(() => personalityMode === 'boss' ? 'personality-boss' : personalityMode === 'funny' ? 'personality-funny' : '', [personalityMode])
  const colorThemeClass = useMemo(() => colorTheme !== 'cyan' ? `theme-${colorTheme}` : '', [colorTheme])
  const ambientColor = useMemo(() =>
    personalityMode === 'boss' ? { r: 255, g: 51, b: 102 }
    : personalityMode === 'funny' ? { r: 255, g: 106, b: 0 }
    : { r: 0, g: 240, b: 255 },
    [personalityMode]
  )
  const statusLabel = useMemo(() =>
    aiStatus === 'idle' ? 'Awaiting Command'
    : aiStatus === 'listening' ? 'Listening'
    : aiStatus === 'thinking' ? 'Processing'
    : 'Speaking',
    [aiStatus]
  )
  const statusColor = useMemo(() =>
    aiStatus === 'idle' ? 'var(--color-neon-cyan)'
    : aiStatus === 'listening' ? 'var(--color-neon-cyan)'
    : aiStatus === 'thinking' ? 'var(--color-neon-orange)'
    : 'var(--color-neon-blue)',
    [aiStatus]
  )

  // Konami code tracking
  const konamiSequence = useRef<string[]>([])
  const KONAMI_CODE = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'KeyB', 'KeyA']

  // Update time string for data readouts
  useEffect(() => {
    const update = () => {
      setCurrentTime(new Date().toLocaleTimeString('en-US', { hour12: false }))
    }
    update()
    const interval = setInterval(update, 1000)
    return () => clearInterval(interval)
  }, [])

  // Boot sequence handlers
  const handleBootComplete = useCallback(() => {
    setBooted(true)
    // showBoot is computed as hydrated && !booted, so setting booted=true hides boot
    if (soundEnabled) playStartupCompleteSound()

    // Show toast notification on boot complete
    addToast('success', 'System Online', 'All systems operational. J.A.R.V.I.S. ready.')

    // Log boot event
    addEvent({ type: 'boot', severity: 'success', message: 'System boot complete', details: 'All subsystems initialized and operational' })

    // Show greeting after boot (multilingual)
    const greeting = getGreeting(personalityMode, voiceLanguage)
    setGreetingText(greeting)
    setGreetingShown(true)
    setTimeout(() => setGreetingShown(false), 5000)
  }, [setBooted, soundEnabled, personalityMode, voiceLanguage, addToast, addEvent])

  const handleBootPhase = useCallback(
    (phase: number) => {
      if (soundEnabled && phase === 1) playBootSound()
    },
    [soundEnabled]
  )

  // Global keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Skip if typing in an input field (except for Escape and modifier combos)
      const target = e.target as HTMLElement
      const isInput = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable

      // Konami code tracking (always active)
      const konamiKey = e.code || e.key
      const expectedIdx = konamiSequence.current.length
      if (expectedIdx < KONAMI_CODE.length && konamiKey === KONAMI_CODE[expectedIdx]) {
        konamiSequence.current.push(konamiKey)
        if (konamiSequence.current.length === KONAMI_CODE.length) {
          // Konami code activated!
          konamiSequence.current = []
          setKonamiActive(true)
          setEasterEggActivated(true)
          setOrbGlow(true)
          addToast('success', 'KONAMI CODE ACTIVATED!', 'Tony Stark would be proud.')
          addEvent({ type: 'system', severity: 'success', message: 'Konami code activated', details: '↑↑↓↓←→←→BA — I am Iron Man' })
          addNotification({ type: 'success', title: 'Easter Egg Found!', message: 'Konami code activated — I am Iron Man', icon: 'sparkles' })
          // Remove orb glow after 5 seconds
          setTimeout(() => setOrbGlow(false), 5000)
          // Play special sound
          if (soundEnabled) {
            try {
              const ctx = new AudioContext()
              const osc = ctx.createOscillator()
              const gain = ctx.createGain()
              osc.connect(gain)
              gain.connect(ctx.destination)
              osc.type = 'sine'
              osc.frequency.setValueAtTime(523, ctx.currentTime)
              osc.frequency.setValueAtTime(659, ctx.currentTime + 0.15)
              osc.frequency.setValueAtTime(784, ctx.currentTime + 0.3)
              osc.frequency.setValueAtTime(1047, ctx.currentTime + 0.45)
              gain.gain.setValueAtTime(0.1, ctx.currentTime)
              gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.7)
              osc.start(ctx.currentTime)
              osc.stop(ctx.currentTime + 0.7)
            } catch { /* Audio not available */ }
          }
        }
      } else if (
        // Reset if wrong key pressed (not a modifier key)
        !e.ctrlKey && !e.metaKey && !e.altKey &&
        konamiSequence.current.length > 0 &&
        konamiKey !== KONAMI_CODE[expectedIdx]
      ) {
        konamiSequence.current = []
      }

      // Ctrl+K: Toggle chat
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault()
        setShowChat((prev) => !prev)
        addEvent({ type: 'command', severity: 'info', message: 'Chat panel toggled' })
      }
      // Escape: Close all panels
      if (e.key === 'Escape') {
        setShowChat(false)
        setShowSettings(false)
        setShowHistory(false)
        setShowDiagnostics(false)
        setShowCommandPalette(false)
        setShowShortcuts(false)
        setShowEventLog(false)
      }
      // Ctrl+D: Diagnostics
      if ((e.ctrlKey || e.metaKey) && e.key === 'd') {
        e.preventDefault()
        setShowDiagnostics(true)
        addEvent({ type: 'command', severity: 'info', message: 'Diagnostics opened' })
      }
      // Ctrl+,: Settings
      if ((e.ctrlKey || e.metaKey) && e.key === ',') {
        e.preventDefault()
        setShowSettings(true)
        addEvent({ type: 'command', severity: 'info', message: 'Settings opened' })
      }
      // Ctrl+H: History
      if ((e.ctrlKey || e.metaKey) && e.key === 'h') {
        e.preventDefault()
        setShowHistory(true)
        addEvent({ type: 'command', severity: 'info', message: 'History opened' })
      }
      // Ctrl+P: Command Palette
      if ((e.ctrlKey || e.metaKey) && e.key === 'p') {
        e.preventDefault()
        setShowCommandPalette((prev) => !prev)
        addEvent({ type: 'command', severity: 'info', message: 'Command palette toggled' })
      }
      // ?: Show shortcuts (only when not in an input)
      if (!isInput && e.key === '?' && !e.ctrlKey && !e.metaKey) {
        e.preventDefault()
        setShowShortcuts((prev) => !prev)
      }
      // Ctrl+Space: Toggle voice (handled by VoiceInput component, just log)
      if ((e.ctrlKey || e.metaKey) && e.key === ' ') {
        e.preventDefault()
        addEvent({ type: 'voice', severity: 'info', message: 'Voice input toggled' })
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [setShowSettings, setShowHistory, setShowDiagnostics, showCommandPalette, addEvent, setEasterEggActivated, addToast, soundEnabled, addNotification])

  // Konami code complete handler
  const handleKonamiComplete = useCallback(() => {
    setKonamiActive(false)
  }, [])

  // ===== Notification Triggers =====
  // Track previous personality mode to detect changes
  const prevPersonalityRef = useRef(personalityMode)
  useEffect(() => {
    if (prevPersonalityRef.current !== personalityMode && booted) {
      addNotification({
        type: 'info',
        title: 'Personality Mode Changed',
        message: `Switched to ${personalityMode} mode`,
        icon: 'brain',
      })
      prevPersonalityRef.current = personalityMode
    }
  }, [personalityMode, booted, addNotification])

  // Monitor CPU for high usage warnings
  const lastCpuWarningRef = useRef(0)
  useEffect(() => {
    if (stats.cpu > 80 && Date.now() - lastCpuWarningRef.current > 60000) {
      lastCpuWarningRef.current = Date.now()
      addNotification({
        type: 'warning',
        title: 'High CPU Usage',
        message: `CPU at ${stats.cpu}% — consider closing unused processes`,
        icon: 'cpu',
      })
    }
  }, [stats.cpu, addNotification])

  // Weather alerts for extreme temperatures - use shallow comparison to prevent re-renders
  const lastWeatherAlertRef = useRef(0)
  const weatherTemp = useJarvisStore((s) => s.weather?.temp)
  const weatherLocation = useJarvisStore((s) => s.weather?.location)
  useEffect(() => {
    if (weatherTemp !== undefined && weatherLocation && Date.now() - lastWeatherAlertRef.current > 300000) {
      if (weatherTemp > 35) {
        lastWeatherAlertRef.current = Date.now()
        addNotification({
          type: 'warning',
          title: 'Heat Alert',
          message: `Temperature in ${weatherLocation} is ${weatherTemp}°C — stay hydrated`,
          icon: 'thermometer-sun',
        })
      } else if (weatherTemp < 0) {
        lastWeatherAlertRef.current = Date.now()
        addNotification({
          type: 'warning',
          title: 'Freeze Alert',
          message: `Temperature in ${weatherLocation} is ${weatherTemp}°C — freezing conditions`,
          icon: 'snowflake',
        })
      }
    }
  }, [weatherTemp, weatherLocation, addNotification])

  // ===== WAIT FOR CLIENT HYDRATION =====
  // Avoid hydration mismatch by not rendering until client-side
  if (!hydrated) {
    return (
      <div className="min-h-screen bg-jarvis-darker flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-neon-cyan/30 border-t-neon-cyan animate-spin" />
      </div>
    )
  }

  // ===== BOOT SEQUENCE =====
  if (showBoot) {
    return (
      <>
        <BootSequence onComplete={handleBootComplete} onPhase={handleBootPhase} />
        <JarvisToastContainer soundEnabled={soundEnabled} />
      </>
    )
  }

  // ===== MAIN DASHBOARD =====
  // Personality-based theme class + color theme (memoized above)
  const finalPersonalityClass = personalityClass
  const finalColorThemeClass = colorThemeClass

  return (
    <div className={`relative min-h-screen bg-jarvis-darker overflow-hidden hud-grid-bg theme-transition ${finalPersonalityClass} ${finalColorThemeClass}`}>
      {/* CRT Scanline Overlay */}
      {crtOverlayEnabled && <div className="crt-overlay pointer-events-none" />}
      {/* Toast Notification Container */}
      <JarvisToastContainer soundEnabled={soundEnabled} />
      {/* Particle background */}
      <ParticleField enabled={particlesEnabled} />

      {/* ===== AMBIENT GLOW EFFECTS ===== */}
      <div className="absolute inset-0 pointer-events-none z-0">
        {/* Top-left primary glow */}
        <div
          className={`absolute top-0 left-0 w-[600px] h-[600px] rounded-full blur-[120px] ${personalityMode === 'boss' ? 'boss-ambient-pulse' : ''}`}
          style={{ backgroundColor: `rgba(${ambientColor.r}, ${ambientColor.g}, ${ambientColor.b}, 0.03)` }}
        />
        {/* Bottom-right secondary glow */}
        <div
          className="absolute bottom-0 right-0 w-[400px] h-[400px] rounded-full blur-[100px]"
          style={{ backgroundColor: `rgba(${ambientColor.r}, ${ambientColor.g}, ${ambientColor.b}, 0.02)` }}
        />
        {/* Center orb glow reflection */}
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full blur-[80px] transition-opacity duration-1000"
          style={{
            background: `radial-gradient(circle, rgba(${ambientColor.r}, ${ambientColor.g}, ${ambientColor.b}, ${aiStatus === 'idle' ? 0.03 : 0.06}) 0%, transparent 70%)`,
          }}
        />
      </div>

      {/* Main content layer */}
      <div className="relative z-10 flex flex-col min-h-screen">
        {/* ===== TOP NAV BAR ===== */}
        <header className="relative flex items-center justify-between px-4 sm:px-6 py-3 border-b border-neon-cyan/5">
          <CornerBrackets size={14} color="cyan" />

          {/* Logo / Title */}
          <div className="flex items-center gap-3">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              className="flex items-center gap-3"
            >
              {/* Shield icon */}
              <div className="hidden sm:flex items-center justify-center w-8 h-8 rounded border border-neon-cyan/20 bg-neon-cyan/5">
                <Shield className="w-4 h-4 text-neon-cyan/60" />
              </div>
              <div>
                <h1 className="font-mono text-sm sm:text-base tracking-[0.3em] text-neon-cyan/80 neon-text-cyan font-semibold">
                  J.A.R.V.I.S.
                </h1>
                <p className="font-mono text-[8px] sm:text-[9px] tracking-[0.2em] text-neon-cyan/25 mt-0.5">
                  JUST A RATHER VERY INTELLIGENT SYSTEM
                </p>
              </div>
            </motion.div>
          </div>

          {/* Center data readout (desktop only) */}
          <div className="hidden xl:flex items-center gap-6">
            <DataReadout label="SYS" value={currentTime} />
            <DataReadout label="STATUS" value={aiStatus.toUpperCase()} />
            <DataReadout label="CMD" value={String(commandCount)} />
          </div>

          {/* Nav actions */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="flex items-center gap-1 sm:gap-2"
          >
            {/* History button */}
            <button
              onClick={() => setShowHistory(true)}
              className="p-2 rounded-lg text-white/30 hover:text-neon-cyan/70 hover:bg-white/5 transition-all duration-200"
              aria-label="Conversation History"
              title="History (Ctrl+H)"
            >
              <History className="w-4 h-4" />
            </button>

            {/* Diagnostics button */}
            <button
              onClick={() => setShowDiagnostics(true)}
              className="p-2 rounded-lg text-white/30 hover:text-neon-cyan/70 hover:bg-white/5 transition-all duration-200"
              aria-label="System Diagnostics"
              title="Diagnostics (Ctrl+D)"
            >
              <Activity className="w-4 h-4" />
            </button>

            {/* Settings button */}
            <button
              onClick={() => setShowSettings(true)}
              className="p-2 rounded-lg text-white/30 hover:text-neon-cyan/70 hover:bg-white/5 transition-all duration-200"
              aria-label="Settings"
              title="Settings (Ctrl+,)"
            >
              <Settings className="w-4 h-4" />
            </button>

            {/* Notification Center */}
            <NotificationCenter />

            {/* Divider */}
            <div className="w-px h-5 bg-white/10 mx-1 hidden sm:block" />

            {/* Chat button */}
            <button
              onClick={() => setShowChat(!showChat)}
              className={`
                px-3 py-2 rounded-lg font-mono text-[10px] sm:text-xs tracking-wider uppercase
                flex items-center gap-1.5 transition-all duration-300
                ${
                  showChat
                    ? 'text-neon-cyan border border-neon-cyan/40 bg-neon-cyan/10 shadow-[0_0_10px_rgba(0,240,255,0.1)]'
                    : 'text-white/40 border border-white/5 hover:border-neon-cyan/30 hover:text-neon-cyan/70 hover:bg-white/5'
                }
              `}
              aria-label="Toggle Chat"
              title="Chat (Ctrl+K)"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Chat</span>
            </button>
          </motion.div>
        </header>

        {/* ===== DATA TICKER ===== */}
        <div className="hidden lg:block border-b border-neon-cyan/5">
          <div className="max-w-7xl mx-auto px-6 py-1">
            <DataTicker />
          </div>
        </div>

        {/* ===== MAIN CONTENT AREA ===== */}
        <main className="flex-1 flex flex-col items-center justify-center px-4 py-4 sm:py-6">
          <div className="w-full max-w-7xl flex flex-col lg:flex-row items-center lg:items-start gap-6 lg:gap-8">

            {/* ===== LEFT COLUMN: System Widgets ===== */}
            <div
              className="hidden lg:block w-72 flex-shrink-0 order-1"
              style={{ animation: 'slide-in-left 0.6s ease-out 0.2s both' }}
            >
              <HUDFrame
                title="System Monitor"
                readouts={[
                  { label: 'UPTIME', value: `${Math.floor(stats.uptime / 3600)}h ${Math.floor((stats.uptime % 3600) / 60)}m` },
                  { label: 'PROCESSES', value: String(Math.floor(120 + stats.cpu * 0.5)) },
                ]}
              >
                <SystemWidgets className="space-y-3" staggerDirection="left" />
              </HUDFrame>
            </div>

            {/* ===== CENTER: HUD Orb (power-on sequence) ===== */}
            <div className="flex flex-col items-center gap-4 sm:gap-6 order-1 lg:order-2 flex-1 min-w-0">
              {/* Greeting text */}
              <AnimatePresence>
                {greetingShown && greetingText && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.5 }}
                    className="font-mono text-sm sm:text-base text-neon-cyan/70 text-center max-w-md neon-text-cyan px-4"
                  >
                    {greetingText}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Central Orb with HUD frame on desktop */}
              <div className="relative">
                {/* Decorative rings - CSS animated for performance */}
                <div
                  className="absolute inset-0 flex items-center justify-center pointer-events-none"
                  style={{ animation: 'orb-fade-in 0.6s ease-out 0.3s both' }}
                >
                  <div
                    className="w-[320px] h-[320px] sm:w-[380px] sm:h-[380px] rounded-full border border-neon-cyan/[0.06]"
                    style={{ animation: 'orb-rotate-cw 60s linear infinite' }}
                  />
                </div>
                <div
                  className="absolute inset-0 flex items-center justify-center pointer-events-none"
                  style={{ animation: 'orb-fade-in 0.6s ease-out 0.45s both' }}
                >
                  <div
                    className="w-[360px] h-[360px] sm:w-[420px] sm:h-[420px] rounded-full border border-dashed border-neon-cyan/[0.04]"
                    style={{ animation: 'orb-rotate-ccw 90s linear infinite' }}
                  />
                </div>

                {/* Orb scales up with bounce */}
                <motion.div
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.8, delay: 0.5, type: 'spring', stiffness: 150, damping: 12 }}
                >
                  <CircularOrb status={aiStatus} />
                </motion.div>

                {/* Konami orb glow effect */}
                {orbGlow && (
                  <motion.div
                    className="absolute inset-0 flex items-center justify-center pointer-events-none"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <div
                      className="w-[280px] h-[280px] rounded-full"
                      style={{
                        background: 'radial-gradient(circle, rgba(0,240,255,0.3) 0%, rgba(0,240,255,0.1) 40%, transparent 70%)',
                        boxShadow: '0 0 60px rgba(0,240,255,0.4), 0 0 120px rgba(0,240,255,0.2)',
                      }}
                    />
                  </motion.div>
                )}
              </div>

              {/* Voice Equalizer */}
              <VoiceEqualizer status={aiStatus} />

              {/* Status label with animated dots - fades in after orb - CSS animations for performance */}
              <motion.div
                className="flex items-center gap-3"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 1.0 }}
              >
                {aiStatus !== 'idle' && (
                  <div className="flex gap-1">
                    {[0, 1, 2].map((i) => (
                      <div
                        key={i}
                        className="w-1 h-1 rounded-full bg-neon-cyan animate-pulse"
                        style={{ animationDelay: `${i * 0.2}s` }}
                      />
                    ))}
                  </div>
                )}
                <div
                  className="font-mono text-sm sm:text-base tracking-[0.2em] uppercase"
                  style={{
                    color: statusColor,
                    animation: aiStatus === 'idle' ? 'pulse 2s ease-in-out infinite' : 'none',
                  }}
                >
                  {statusLabel}
                </div>
                {aiStatus !== 'idle' && (
                  <div className="flex gap-1">
                    {[0, 1, 2].map((i) => (
                      <div
                        key={i}
                        className="w-1 h-1 rounded-full bg-neon-cyan animate-pulse"
                        style={{ animationDelay: `${(2 - i) * 0.2}s` }}
                      />
                    ))}
                  </div>
                )}
              </motion.div>

              {/* Voice Input + Quick Actions */}
              <div className="flex flex-col items-center gap-4">
                <VoiceInput onWakeWord={() => setShowChat(true)} />

                {/* Quick action hints - appear one by one */}
                <div className="flex flex-wrap items-center justify-center gap-2 mt-1">
                  {[
                    { key: 'Ctrl+K', label: 'Chat' },
                    { key: 'Ctrl+P', label: 'Commands' },
                    { key: 'Ctrl+Space', label: 'Voice' },
                    { key: 'Ctrl+D', label: 'Diag' },
                    { key: '?', label: 'Shortcuts' },
                  ].map((hint, index) => (
                    <motion.button
                      key={hint.key}
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: 1.2 + index * 0.1 }}
                      onClick={() => {
                        if (hint.key === '?') setShowShortcuts(true)
                      }}
                      className="text-[9px] font-mono text-white/15 px-2 py-1 rounded border border-white/5 hover:border-neon-cyan/20 hover:text-neon-cyan/30 transition-colors"
                    >
                      {hint.key} {hint.label}
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Mobile system widgets (shown only on small screens) */}
              <div className="lg:hidden w-full max-w-sm mt-4">
                <HUDFrame
                  title="System Status"
                  readouts={[
                    { label: 'NET', value: stats.network.toUpperCase() },
                    { label: 'CPU', value: `${stats.cpu}%` },
                  ]}
                >
                  <SystemWidgets />
                </HUDFrame>
              </div>
            </div>

            {/* ===== RIGHT COLUMN: Radar + Mini widgets ===== */}
            <div
              className="hidden lg:flex flex-col items-center gap-4 w-72 flex-shrink-0 order-3 max-h-[calc(100vh-5rem)] overflow-y-auto jarvis-scrollbar pr-1"
              style={{ animation: 'orb-fade-in 0.6s ease-out 0.2s both' }}
            >
              {/* Radar Scanner with HUD frame */}
              <div>
                <HUDFrame title="Scanner">
                  <RadarScanner />
                </HUDFrame>
              </div>

              {/* Mini system status panel */}
              <div className="w-full glass-panel p-3 space-y-2 relative">
                <CornerBrackets size={10} color="cyan" />
                <div className="flex items-center gap-2">
                  <div
                    className={`w-2 h-2 rounded-full ${
                      stats.network === 'online'
                        ? 'bg-green-400 shadow-[0_0_6px_rgba(74,222,128,0.5)]'
                        : stats.network === 'weak'
                        ? 'bg-yellow-400 shadow-[0_0_6px_rgba(250,204,21,0.5)]'
                        : 'bg-red-400 shadow-[0_0_6px_rgba(248,113,113,0.5)]'
                    }`}
                  />
                  <span className="text-[10px] font-mono text-white/40">
                    NETWORK: {stats.network.toUpperCase()}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-neon-cyan/60 shadow-[0_0_6px_rgba(0,240,255,0.3)]" />
                  <span className="text-[10px] font-mono text-white/40">
                    CPU: {stats.cpu}% | RAM: {stats.ram}%
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-neon-orange/60 shadow-[0_0_6px_rgba(255,106,0,0.3)]" />
                  <span className="text-[10px] font-mono text-white/40">
                    TEMP: {stats.temperature}°C | CMD: {commandCount}
                  </span>
                </div>
              </div>

              {/* AI Intelligence panel */}
              <div className="w-full glass-panel p-3 relative">
                <CornerBrackets size={10} color="orange" />
                <div className="flex items-center gap-2 mb-2">
                  <Zap className="w-3 h-3 text-neon-orange/60" />
                  <span className="text-[10px] font-mono text-neon-orange/60 uppercase tracking-wider">
                    AI Engine
                  </span>
                </div>
                <DataReadout label="MODE" value={personalityMode.toUpperCase()} />
                <DataReadout label="MSGS" value={String(messages.length)} />
                <DataReadout label="STATUS" value="ONLINE" />
              </div>

              {/* Lazy-loaded widgets */}
              <Suspense fallback={<div className="w-full h-24 glass-panel animate-pulse" />}>
                <WorldClockWidget />
              </Suspense>
              <Suspense fallback={<div className="w-full h-32 glass-panel animate-pulse" />}>
                <FocusTimerWidget />
              </Suspense>
              <Suspense fallback={<div className="w-full h-24 glass-panel animate-pulse" />}>
                <SystemHealthWidget />
              </Suspense>
              <Suspense fallback={<div className="w-full h-24 glass-panel animate-pulse" />}>
                <AmbientSoundWidget />
              </Suspense>
              <Suspense fallback={<div className="w-full h-32 glass-panel animate-pulse" />}>
                <QuickNotesWidget />
              </Suspense>

              {/* Open Chat prompt */}
              {!showChat && (
                <div className="w-full">
                  <button
                    onClick={() => setShowChat(true)}
                    className="w-full glass-panel p-3 flex items-center justify-between group hover:border-neon-cyan/30 transition-colors cursor-pointer relative"
                  >
                    <CornerBrackets size={10} color="cyan" />
                    <span className="text-[10px] font-mono text-white/30 group-hover:text-neon-cyan/60 transition-colors">
                      OPEN COMMUNICATION
                    </span>
                    <ChevronRight className="w-3 h-3 text-white/20 group-hover:text-neon-cyan/60 transition-colors" />
                  </button>
                </div>
              )}
            </div>
          </div>
        </main>

        {/* ===== STATUS BAR ===== */}
        <div className="relative">
          <StatusBar
            status={aiStatus}
            networkStatus={systemStats.network}
            commandCount={commandCount}
          />
          {/* Event log button in status bar */}
          <button
            onClick={() => setShowEventLog(true)}
            className="absolute right-12 sm:right-16 top-1/2 -translate-y-1/2
              p-1.5 rounded text-white/20 hover:text-neon-cyan/60 hover:bg-white/5 transition-colors"
            aria-label="Event Log"
            title="Event Log"
          >
            <ScrollText className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* ===== CHAT PANEL (Slide-in from right) ===== */}
      <AnimatePresence>
        {showChat && (
          <motion.div
            initial={{ x: '100%', opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: '100%', opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 z-40 h-full w-full sm:w-[420px] shadow-2xl shadow-black/50"
          >
            {/* Close button */}
            <button
              onClick={() => setShowChat(false)}
              className="absolute top-3 right-3 z-10 p-2 rounded-full bg-black/40 border border-white/10
                text-white/40 hover:text-white/80 hover:border-white/30 transition-colors backdrop-blur-sm"
              aria-label="Close chat"
            >
              <X className="w-4 h-4" />
            </button>

            <ChatPanel />
          </motion.div>
        )}
      </AnimatePresence>

      {/* ===== FLOATING CHAT BUTTON (when chat is hidden) ===== */}
      {!showChat && (
        <motion.button
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.8, type: 'spring' }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setShowChat(true)}
          className="fixed bottom-20 right-4 sm:bottom-24 sm:right-6 z-30 lg:bottom-24
            w-12 h-12 rounded-full
            bg-neon-cyan/10 border border-neon-cyan/30
            text-neon-cyan flex items-center justify-center
            hover:bg-neon-cyan/20 hover:border-neon-cyan/50
            transition-colors duration-300
            shadow-[0_0_15px_rgba(0,240,255,0.2)]"
          aria-label="Open chat"
        >
          <MessageCircle className="w-5 h-5" />
        </motion.button>
      )}

      {/* ===== LAZY-LOADED PANELS ===== */}
      {showSettings && (
        <Suspense fallback={null}>
          <SettingsPanel open={showSettings} onClose={() => setShowSettings(false)} />
        </Suspense>
      )}
      {showHistory && (
        <Suspense fallback={null}>
          <ConversationHistory open={showHistory} onClose={() => setShowHistory(false)} />
        </Suspense>
      )}
      {showDiagnostics && (
        <Suspense fallback={null}>
          <SystemDiagnostics open={showDiagnostics} onClose={() => setShowDiagnostics(false)} />
        </Suspense>
      )}
      {showCommandPalette && (
        <Suspense fallback={null}>
          <CommandPalette open={showCommandPalette} onClose={() => setShowCommandPalette(false)} />
        </Suspense>
      )}
      {showShortcuts && (
        <Suspense fallback={null}>
          <KeyboardShortcutsOverlay open={showShortcuts} onClose={() => setShowShortcuts(false)} />
        </Suspense>
      )}
      {konamiActive && (
        <Suspense fallback={null}>
          <KonamiEffect active={konamiActive} onComplete={handleKonamiComplete} />
        </Suspense>
      )}

      {/* ===== MOBILE BOTTOM NAV ===== */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-30 border-t border-neon-cyan/10 bg-black/90 backdrop-blur-xl">
        <div className="flex items-center justify-around py-2 px-4">
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => { setShowChat(false); setShowSettings(false); setShowHistory(false); setShowDiagnostics(false) }}
            className="flex flex-col items-center gap-0.5 p-2 rounded-lg text-neon-cyan/60 hover:text-neon-cyan transition-colors"
          >
            <HomeIcon className="w-4 h-4" />
            <span className="text-[8px] font-mono">HOME</span>
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => setShowChat(!showChat)}
            className={`flex flex-col items-center gap-0.5 p-2 rounded-lg transition-colors ${showChat ? 'text-neon-cyan' : 'text-white/30 hover:text-neon-cyan/60'}`}
          >
            <MessageSquare className="w-4 h-4" />
            <span className="text-[8px] font-mono">CHAT</span>
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => setShowDiagnostics(true)}
            className="flex flex-col items-center gap-0.5 p-2 rounded-lg text-white/30 hover:text-neon-cyan/60 transition-colors"
          >
            <BarChart3 className="w-4 h-4" />
            <span className="text-[8px] font-mono">DIAG</span>
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => setShowHistory(true)}
            className="flex flex-col items-center gap-0.5 p-2 rounded-lg text-white/30 hover:text-neon-cyan/60 transition-colors"
          >
            <History className="w-4 h-4" />
            <span className="text-[8px] font-mono">HIST</span>
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => setShowSettings(true)}
            className="flex flex-col items-center gap-0.5 p-2 rounded-lg text-white/30 hover:text-neon-cyan/60 transition-colors"
          >
            <Settings className="w-4 h-4" />
            <span className="text-[8px] font-mono">CONFIG</span>
          </motion.button>
        </div>
      </div>

      {/* ===== EVENT LOG (lazy) ===== */}
      {showEventLog && (
        <Suspense fallback={null}>
          <EventLog open={showEventLog} onClose={() => setShowEventLog(false)} />
        </Suspense>
      )}
    </div>
  )
}
