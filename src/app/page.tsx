'use client'

import { useState, useEffect, useCallback, useRef, lazy, Suspense, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Shield } from 'lucide-react'
import { useJarvisStore } from '@/hooks/useJarvisStore'
import { useSystemStats } from '@/hooks/useSystemStats'
import { useHydrated } from '@/hooks/useHydrated'
import { playBootSound, playStartupCompleteSound } from '@/lib/sounds'
import { getGreeting } from '@/lib/personalities'
import BootSequence from '@/components/jarvis/BootSequence'
import { useJarvisToast } from '@/hooks/useJarvisToast'
import { JarvisToastContainer } from '@/components/jarvis/JarvisToast'
import NotificationCenter from '@/components/jarvis/NotificationCenter'
import Desktop from '@/components/os/Desktop'
import Taskbar from '@/components/os/Taskbar'
import AppLauncher from '@/components/os/AppLauncher'
import WindowManager from '@/components/os/WindowManager'

// Lazy load overlays
const CommandPalette = lazy(() => import('@/components/jarvis/CommandPalette'))
const KeyboardShortcutsOverlay = lazy(() => import('@/components/jarvis/KeyboardShortcutsOverlay'))
const KonamiEffect = lazy(() => import('@/components/jarvis/KonamiEffect'))
const EventLog = lazy(() => import('@/components/jarvis/EventLog'))

export default function Home() {
  const {
    booted,
    setBooted,
    aiStatus,
    personalityMode,
    soundEnabled,
    showAppLauncher,
    setShowAppLauncher,
    addEvent,
    setEasterEggActivated,
    addNotification,
    colorTheme,
    crtOverlayEnabled,
    voiceLanguage,
    openApp,
    showSettings,
    setShowSettings,
    showHistory,
    setShowHistory,
    showDiagnostics,
    setShowDiagnostics,
  } = useJarvisStore()

  const hydrated = useHydrated()
  const showBoot = hydrated && !booted

  const [showCommandPalette, setShowCommandPalette] = useState(false)
  const [showShortcuts, setShowShortcuts] = useState(false)
  const [showEventLog, setShowEventLog] = useState(false)
  const [konamiActive, setKonamiActive] = useState(false)
  const [greetingShown, setGreetingShown] = useState(false)
  const [greetingText, setGreetingText] = useState('')

  const stats = useSystemStats()
  const { addToast } = useJarvisToast()

  // Theme classes
  const personalityClass = useMemo(() =>
    personalityMode === 'boss' ? 'personality-boss' : personalityMode === 'funny' ? 'personality-funny' : '',
    [personalityMode]
  )
  const colorThemeClass = useMemo(() =>
    colorTheme !== 'cyan' ? `theme-${colorTheme}` : '',
    [colorTheme]
  )
  const advancedTheme = useJarvisStore((s) => s.advancedTheme)
  const advancedThemeClass = useMemo(() =>
    advancedTheme !== 'cyberpunk' ? `theme-advanced-${advancedTheme}` : '',
    [advancedTheme]
  )

  // Konami code tracking
  const konamiSequence = useRef<string[]>([])
  const KONAMI_CODE = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'KeyB', 'KeyA']

  // Boot sequence handlers
  const handleBootComplete = useCallback(() => {
    setBooted(true)
    if (soundEnabled) playStartupCompleteSound()
    addToast('success', 'System Online', 'J.A.R.V.I.S. AI Operating System ready.')
    addEvent({ type: 'boot', severity: 'success', message: 'System boot complete', details: 'All subsystems initialized and operational' })

    // Show greeting
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
      const target = e.target as HTMLElement
      const isInput = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable

      // Konami code tracking
      const konamiKey = e.code || e.key
      const expectedIdx = konamiSequence.current.length
      if (expectedIdx < KONAMI_CODE.length && konamiKey === KONAMI_CODE[expectedIdx]) {
        konamiSequence.current.push(konamiKey)
        if (konamiSequence.current.length === KONAMI_CODE.length) {
          konamiSequence.current = []
          setKonamiActive(true)
          setEasterEggActivated(true)
          addToast('success', 'KONAMI CODE ACTIVATED!', 'Tony Stark would be proud.')
          addEvent({ type: 'system', severity: 'success', message: 'Konami code activated', details: '↑↑↓↓←→←→BA — I am Iron Man' })
          addNotification({ type: 'success', title: 'Easter Egg Found!', message: 'Konami code activated — I am Iron Man', icon: 'sparkles' })
          setTimeout(() => setKonamiActive(false), 5000)
        }
      } else if (
        !e.ctrlKey && !e.metaKey && !e.altKey &&
        konamiSequence.current.length > 0 &&
        konamiKey !== KONAMI_CODE[expectedIdx]
      ) {
        konamiSequence.current = []
      }

      // Ctrl+K: Open chat app
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault()
        openApp('chat')
        addEvent({ type: 'command', severity: 'info', message: 'Chat opened' })
      }
      // Escape: Close overlays
      if (e.key === 'Escape') {
        setShowAppLauncher(false)
        setShowSettings(false)
        setShowHistory(false)
        setShowDiagnostics(false)
        setShowCommandPalette(false)
        setShowShortcuts(false)
        setShowEventLog(false)
      }
      // Ctrl+D: Open diagnostics
      if ((e.ctrlKey || e.metaKey) && e.key === 'd') {
        e.preventDefault()
        openApp('dashboard')
        addEvent({ type: 'command', severity: 'info', message: 'Dashboard opened' })
      }
      // Ctrl+,: Open settings
      if ((e.ctrlKey || e.metaKey) && e.key === ',') {
        e.preventDefault()
        openApp('settings')
        addEvent({ type: 'command', severity: 'info', message: 'Settings opened' })
      }
      // Ctrl+P: Command Palette
      if ((e.ctrlKey || e.metaKey) && e.key === 'p') {
        e.preventDefault()
        setShowCommandPalette((prev) => !prev)
        addEvent({ type: 'command', severity: 'info', message: 'Command palette toggled' })
      }
      // Ctrl+Space: Open terminal
      if ((e.ctrlKey || e.metaKey) && e.key === ' ') {
        e.preventDefault()
        openApp('terminal')
        addEvent({ type: 'command', severity: 'info', message: 'Terminal opened' })
      }
      // ?: Show shortcuts
      if (!isInput && e.key === '?' && !e.ctrlKey && !e.metaKey) {
        e.preventDefault()
        setShowShortcuts((prev) => !prev)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [setShowAppLauncher, setShowSettings, setShowHistory, setShowDiagnostics, openApp, addEvent, setEasterEggActivated, addToast, soundEnabled, addNotification])

  // ===== Notification Triggers =====
  const prevPersonalityRef = useRef(personalityMode)
  useEffect(() => {
    if (prevPersonalityRef.current !== personalityMode && booted) {
      addNotification({ type: 'info', title: 'Personality Mode Changed', message: `Switched to ${personalityMode} mode`, icon: 'brain' })
      prevPersonalityRef.current = personalityMode
    }
  }, [personalityMode, booted, addNotification])

  // Monitor CPU
  const lastCpuWarningRef = useRef(0)
  useEffect(() => {
    if (stats.cpu > 80 && Date.now() - lastCpuWarningRef.current > 60000) {
      lastCpuWarningRef.current = Date.now()
      addNotification({ type: 'warning', title: 'High CPU Usage', message: `CPU at ${stats.cpu}% — consider closing unused processes`, icon: 'cpu' })
    }
  }, [stats.cpu, addNotification])

  // ===== HYDRATION GUARD =====
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

  // ===== AI OPERATING SYSTEM =====
  return (
    <div className={`relative min-h-screen bg-jarvis-darker overflow-hidden hud-grid-bg theme-transition ${personalityClass} ${colorThemeClass}`}>
      {/* CRT Scanline Overlay */}
      {crtOverlayEnabled && <div className="crt-overlay pointer-events-none" />}

      {/* Toast Notification Container */}
      <JarvisToastContainer soundEnabled={soundEnabled} />

      {/* ===== DESKTOP BACKGROUND ===== */}
      <Desktop />

      {/* ===== TOP HEADER BAR ===== */}
      <header className="relative z-20 flex items-center justify-between px-4 sm:px-6 py-2.5 border-b border-neon-cyan/5 bg-jarvis-darker/80 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="flex items-center gap-3"
          >
            <div className="hidden sm:flex items-center justify-center w-8 h-8 rounded border border-neon-cyan/20 bg-neon-cyan/5">
              <Shield className="w-4 h-4 text-neon-cyan/60" />
            </div>
            <div>
              <h1 className="font-mono text-sm sm:text-base tracking-[0.3em] text-neon-cyan/80 neon-text-cyan font-semibold">
                J.A.R.V.I.S.
              </h1>
              <p className="font-mono text-[8px] sm:text-[9px] tracking-[0.2em] text-neon-cyan/25 mt-0.5">
                AI OPERATING SYSTEM v2.0
              </p>
            </div>
          </motion.div>
        </div>

        {/* Greeting text */}
        <AnimatePresence>
          {greetingShown && greetingText && (
            <motion.div
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              transition={{ duration: 0.5 }}
              className="hidden md:block font-mono text-xs text-neon-cyan/50 text-center max-w-md neon-text-cyan"
            >
              {greetingText}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Right actions */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="flex items-center gap-2"
        >
          {/* OS Mode indicator */}
          <OSModeIndicator />

          {/* XP / Level badge */}
          <XPBadge />

          {/* Notification Center */}
          <NotificationCenter />
        </motion.div>
      </header>

      {/* ===== WINDOW MANAGER ===== */}
      <WindowManager />

      {/* ===== APP LAUNCHER ===== */}
      <AnimatePresence>
        {showAppLauncher && <AppLauncher />}
      </AnimatePresence>

      {/* ===== TASKBAR ===== */}
      <Taskbar />

      {/* ===== OVERLAY PANELS ===== */}
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
          <KonamiEffect active={konamiActive} onComplete={() => setKonamiActive(false)} />
        </Suspense>
      )}
      {showEventLog && (
        <Suspense fallback={null}>
          <EventLog open={showEventLog} onClose={() => setShowEventLog(false)} />
        </Suspense>
      )}
    </div>
  )
}

// ===== Sub-components =====

function OSModeIndicator() {
  const osMode = useJarvisStore((s) => s.osMode)
  const modeColors: Record<string, string> = {
    normal: 'text-neon-cyan/50 border-neon-cyan/20',
    focus: 'text-neon-green/50 border-neon-green/20',
    coding: 'text-neon-purple/50 border-neon-purple/20',
    security: 'text-neon-red/50 border-neon-red/20',
    presentation: 'text-neon-orange/50 border-neon-orange/20',
    stealth: 'text-white/30 border-white/10',
  }

  return (
    <div className={`hidden sm:flex items-center gap-1.5 px-2 py-1 rounded border ${modeColors[osMode] || modeColors.normal} bg-white/[0.02]`}>
      <div className={`w-1.5 h-1.5 rounded-full ${osMode === 'normal' ? 'bg-neon-cyan/50' : osMode === 'focus' ? 'bg-neon-green/50' : osMode === 'coding' ? 'bg-neon-purple/50' : osMode === 'security' ? 'bg-neon-red/50' : 'bg-white/20'} animate-pulse`} />
      <span className="text-[9px] font-mono uppercase tracking-wider">{osMode}</span>
    </div>
  )
}

function XPBadge() {
  const xp = useJarvisStore((s) => s.xp)
  const level = useJarvisStore((s) => s.level)
  const xpForNext = level * 100
  const xpProgress = Math.min((xp / xpForNext) * 100, 100)

  return (
    <div className="hidden sm:flex items-center gap-2 px-2">
      <div className="flex items-center gap-1.5">
        <div className="w-5 h-5 rounded-full border border-neon-cyan/30 bg-neon-cyan/5 flex items-center justify-center">
          <span className="text-[8px] font-mono text-neon-cyan/70 font-bold">{level}</span>
        </div>
        <div className="flex flex-col">
          <span className="text-[8px] font-mono text-white/30">LV.{level}</span>
          <span className="text-[7px] font-mono text-white/15">{xp}/{xpForNext} XP</span>
        </div>
      </div>
      {/* XP bar */}
      <div className="w-16 h-1.5 rounded-full bg-white/5 overflow-hidden">
        <motion.div
          className="h-full rounded-full bg-gradient-to-r from-neon-cyan/60 to-neon-cyan/30"
          style={{ boxShadow: '0 0 4px rgba(0,240,255,0.3)' }}
          initial={{ width: 0 }}
          animate={{ width: `${xpProgress}%` }}
          transition={{ duration: 0.5 }}
        />
      </div>
    </div>
  )
}
