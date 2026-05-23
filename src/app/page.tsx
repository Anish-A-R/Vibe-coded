'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  MessageCircle,
  X,
  Settings,
  History,
  Activity,
  ChevronRight,
} from 'lucide-react'
import { useJarvisStore } from '@/hooks/useJarvisStore'
import { useSystemStats } from '@/hooks/useSystemStats'
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
import SettingsPanel from '@/components/jarvis/SettingsPanel'
import ConversationHistory from '@/components/jarvis/ConversationHistory'
import SystemDiagnostics from '@/components/jarvis/SystemDiagnostics'
import type { AIStatus } from '@/hooks/useJarvisStore'

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
  } = useJarvisStore()

  const [showBoot, setShowBoot] = useState(!booted)
  const [showChat, setShowChat] = useState(false)
  const [greetingShown, setGreetingShown] = useState(false)
  const [greetingText, setGreetingText] = useState('')
  const stats = useSystemStats()

  // Boot sequence handlers
  const handleBootComplete = useCallback(() => {
    setBooted(true)
    setShowBoot(false)
    if (soundEnabled) playStartupCompleteSound()

    // Show greeting after boot
    const greeting = getGreeting(personalityMode)
    setGreetingText(greeting)
    setGreetingShown(true)
    setTimeout(() => setGreetingShown(false), 5000)
  }, [setBooted, soundEnabled, personalityMode])

  const handleBootPhase = useCallback(
    (phase: number) => {
      if (soundEnabled && phase === 1) playBootSound()
    },
    [soundEnabled]
  )

  // Global keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+K: Toggle chat
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault()
        setShowChat((prev) => !prev)
      }
      // Escape: Close all panels
      if (e.key === 'Escape') {
        setShowChat(false)
        setShowSettings(false)
        setShowHistory(false)
        setShowDiagnostics(false)
      }
      // Ctrl+D: Diagnostics
      if ((e.ctrlKey || e.metaKey) && e.key === 'd') {
        e.preventDefault()
        setShowDiagnostics(true)
      }
      // Ctrl+,: Settings
      if ((e.ctrlKey || e.metaKey) && e.key === ',') {
        e.preventDefault()
        setShowSettings(true)
      }
      // Ctrl+H: History
      if ((e.ctrlKey || e.metaKey) && e.key === 'h') {
        e.preventDefault()
        setShowHistory(true)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [setShowSettings, setShowHistory, setShowDiagnostics])

  // ===== BOOT SEQUENCE =====
  if (showBoot) {
    return (
      <BootSequence onComplete={handleBootComplete} onPhase={handleBootPhase} />
    )
  }

  // ===== MAIN DASHBOARD =====
  return (
    <div className="relative min-h-screen bg-jarvis-darker overflow-hidden hud-grid-bg">
      {/* Particle background */}
      <ParticleField enabled={particlesEnabled} />

      {/* Main content layer */}
      <div className="relative z-10 flex flex-col min-h-screen">
        {/* ===== TOP NAV BAR ===== */}
        <header className="flex items-center justify-between px-4 sm:px-6 py-3 border-b border-neon-cyan/5">
          {/* Logo / Title */}
          <div className="flex items-center gap-3">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <h1 className="font-mono text-sm sm:text-base tracking-[0.3em] text-neon-cyan/80 neon-text-cyan font-semibold">
                J.A.R.V.I.S.
              </h1>
              <p className="font-mono text-[8px] sm:text-[9px] tracking-[0.2em] text-neon-cyan/25 mt-0.5">
                JUST A RATHER VERY INTELLIGENT SYSTEM
              </p>
            </motion.div>
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

            {/* Chat button */}
            <button
              onClick={() => setShowChat(!showChat)}
              className={`
                px-3 py-2 rounded-lg font-mono text-[10px] sm:text-xs tracking-wider uppercase
                flex items-center gap-1.5 transition-all duration-300
                ${
                  showChat
                    ? 'text-neon-cyan border border-neon-cyan/40 bg-neon-cyan/10'
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

        {/* ===== MAIN CONTENT AREA ===== */}
        <main className="flex-1 flex flex-col items-center justify-center px-4 py-4 sm:py-6">
          <div className="w-full max-w-7xl flex flex-col lg:flex-row items-center lg:items-start gap-6 lg:gap-8">
            {/* ===== LEFT COLUMN: System Widgets ===== */}
            <motion.div
              initial={{ opacity: 0, x: -40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="hidden lg:block w-72 flex-shrink-0 order-1"
            >
              <SystemWidgets className="space-y-3" />
            </motion.div>

            {/* ===== CENTER: HUD Orb ===== */}
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

              {/* Central Orb */}
              <CircularOrb status={aiStatus} />

              {/* Voice Equalizer */}
              <VoiceEqualizer status={aiStatus} />

              {/* Status label */}
              <div className="flex items-center gap-3">
                <motion.div
                  className="font-mono text-sm sm:text-base tracking-[0.2em] uppercase"
                  style={{ color: 'var(--color-neon-cyan)' }}
                  animate={{
                    opacity: aiStatus === 'idle' ? [0.5, 1, 0.5] : 1,
                  }}
                  transition={{
                    duration: 2,
                    repeat: aiStatus === 'idle' ? Infinity : 0,
                    ease: 'easeInOut',
                  }}
                >
                  {aiStatus === 'idle'
                    ? 'Awaiting Command'
                    : aiStatus === 'listening'
                    ? 'Listening'
                    : aiStatus === 'thinking'
                    ? 'Processing'
                    : 'Speaking'}
                </motion.div>
              </div>

              {/* Voice Input + Quick Actions */}
              <div className="flex flex-col items-center gap-4">
                <VoiceInput />

                {/* Quick action hints */}
                <div className="flex flex-wrap items-center justify-center gap-2 mt-1">
                  <span className="text-[9px] font-mono text-white/15 px-2 py-1 rounded border border-white/5">
                    Ctrl+K Chat
                  </span>
                  <span className="text-[9px] font-mono text-white/15 px-2 py-1 rounded border border-white/5">
                    Ctrl+Space Voice
                  </span>
                  <span className="text-[9px] font-mono text-white/15 px-2 py-1 rounded border border-white/5">
                    Ctrl+D Diag
                  </span>
                </div>
              </div>

              {/* Mobile system widgets (shown only on small screens) */}
              <div className="lg:hidden w-full max-w-sm mt-4">
                <SystemWidgets />
              </div>
            </div>

            {/* ===== RIGHT COLUMN: Radar + Mini widgets ===== */}
            <motion.div
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="hidden lg:flex flex-col items-center gap-4 w-72 flex-shrink-0 order-3"
            >
              {/* Radar Scanner */}
              <RadarScanner />

              {/* Mini system status */}
              <div className="w-full glass-panel p-3 space-y-2">
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

              {/* Open Chat prompt */}
              {!showChat && (
                <motion.button
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1 }}
                  onClick={() => setShowChat(true)}
                  className="w-full glass-panel p-3 flex items-center justify-between group hover:border-neon-cyan/30 transition-colors cursor-pointer"
                >
                  <span className="text-[10px] font-mono text-white/30 group-hover:text-neon-cyan/60 transition-colors">
                    OPEN COMMUNICATION
                  </span>
                  <ChevronRight className="w-3 h-3 text-white/20 group-hover:text-neon-cyan/60 transition-colors" />
                </motion.button>
              )}
            </motion.div>
          </div>
        </main>

        {/* ===== STATUS BAR ===== */}
        <StatusBar
          status={aiStatus}
          networkStatus={systemStats.network}
          commandCount={commandCount}
        />
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
          className="fixed bottom-20 right-4 sm:bottom-24 sm:right-6 z-30
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

      {/* ===== SETTINGS PANEL ===== */}
      <SettingsPanel open={showSettings} onClose={() => setShowSettings(false)} />

      {/* ===== CONVERSATION HISTORY PANEL ===== */}
      <ConversationHistory
        open={showHistory}
        onClose={() => setShowHistory(false)}
      />

      {/* ===== SYSTEM DIAGNOSTICS PANEL ===== */}
      <SystemDiagnostics
        open={showDiagnostics}
        onClose={() => setShowDiagnostics(false)}
      />
    </div>
  )
}
