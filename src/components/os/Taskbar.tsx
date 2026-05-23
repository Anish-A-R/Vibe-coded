'use client'

import { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutGrid,
  Wifi,
  Volume2,
  Battery,
  Bell,
  Settings,
  MessageSquare,
  Terminal,
  Brain,
  LayoutDashboard,
  Shield,
  Database,
  CheckSquare,
  Code,
  Puzzle,
  type LucideIcon,
} from 'lucide-react'
import { useJarvisStore, type AppDefinition } from '@/hooks/useJarvisStore'

// Map icon name string to actual Lucide component for taskbar
const ICON_MAP: Record<string, LucideIcon> = {
  MessageSquare,
  Terminal,
  Brain,
  LayoutDashboard,
  Shield,
  Database,
  CheckSquare,
  Code,
  Puzzle,
  Settings,
}

export default function Taskbar() {
  const openWindows = useJarvisStore((s) => s.openWindows)
  const activeWindowId = useJarvisStore((s) => s.activeWindowId)
  const toggleWindowMinimize = useJarvisStore((s) => s.toggleWindowMinimize)
  const setShowAppLauncher = useJarvisStore((s) => s.setShowAppLauncher)
  const showAppLauncher = useJarvisStore((s) => s.showAppLauncher)
  const openApp = useJarvisStore((s) => s.openApp)
  const availableApps = useJarvisStore((s) => s.availableApps)
  const xp = useJarvisStore((s) => s.xp)
  const level = useJarvisStore((s) => s.level)
  const systemStats = useJarvisStore((s) => s.systemStats)

  // Current time with seconds
  const [time, setTime] = useState('')
  const [date, setDate] = useState('')

  useEffect(() => {
    const update = () => {
      const now = new Date()
      setTime(now.toLocaleTimeString('en-US', { hour12: false }))
      setDate(now.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }))
    }
    update()
    const interval = setInterval(update, 1000)
    return () => clearInterval(interval)
  }, [])

  // XP progress for current level (each level requires level * 100 XP)
  const xpForCurrentLevel = useMemo(() => level * 100, [level])
  const xpProgress = useMemo(() => {
    if (xpForCurrentLevel === 0) return 0
    return Math.min((xp / xpForCurrentLevel) * 100, 100)
  }, [xp, xpForCurrentLevel])

  // Get app definition for a window
  const getAppDef = (appId: string): AppDefinition | undefined =>
    availableApps.find((a) => a.id === appId)

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[90] h-12">
      {/* Neon cyan top line */}
      <div
        className="absolute top-0 left-0 right-0 h-px"
        style={{
          background: 'linear-gradient(90deg, transparent 5%, rgba(0,240,255,0.4) 20%, rgba(0,240,255,0.6) 50%, rgba(0,240,255,0.4) 80%, transparent 95%)',
          boxShadow: '0 0 8px rgba(0,240,255,0.2)',
        }}
      />

      {/* Glass background */}
      <div className="absolute inset-0 bg-jarvis-darker/90 backdrop-blur-xl border-t border-neon-cyan/10" />

      {/* Content */}
      <div className="relative h-full flex items-center px-2 sm:px-4">
        {/* Left section: App launcher + Running apps */}
        <div className="flex items-center gap-1 flex-1 min-w-0">
          {/* App Launcher button */}
          <motion.button
            onClick={() => setShowAppLauncher(!showAppLauncher)}
            className={`
              w-9 h-9 rounded-lg flex items-center justify-center transition-all duration-200
              ${showAppLauncher
                ? 'bg-neon-cyan/15 border border-neon-cyan/30 text-neon-cyan'
                : 'bg-white/[0.03] border border-white/[0.06] text-white/40 hover:text-neon-cyan/70 hover:border-neon-cyan/20 hover:bg-white/5'
              }
            `}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            aria-label="App Launcher"
            title="App Launcher"
          >
            <LayoutGrid className="w-4 h-4" />
          </motion.button>

          {/* Separator */}
          <div className="w-px h-6 bg-white/5 mx-1" />

          {/* Running app buttons */}
          <div className="flex items-center gap-1 overflow-x-auto jarvis-scrollbar">
            <AnimatePresence>
              {openWindows.map((win) => {
                const appDef = getAppDef(win.appId)
                if (!appDef) return null
                const IconComp = ICON_MAP[appDef.icon]
                const isActive = activeWindowId === win.id && !win.isMinimized
                const isMinimized = win.isMinimized

                return (
                  <motion.button
                    key={win.id}
                    initial={{ scale: 0, opacity: 0, width: 0 }}
                    animate={{ scale: 1, opacity: 1, width: 'auto' }}
                    exit={{ scale: 0, opacity: 0, width: 0 }}
                    transition={{ duration: 0.2 }}
                    onClick={() => toggleWindowMinimize(win.id)}
                    className={`
                      relative h-8 px-2.5 rounded-md flex items-center gap-1.5 font-mono text-[10px]
                      transition-all duration-200 flex-shrink-0 max-w-[120px]
                      ${isActive
                        ? 'bg-neon-cyan/10 border border-neon-cyan/30 text-neon-cyan'
                        : isMinimized
                        ? 'bg-white/[0.02] border border-white/[0.04] text-white/25 hover:text-white/50 hover:bg-white/5'
                        : 'bg-white/[0.03] border border-white/[0.06] text-white/40 hover:text-neon-cyan/60 hover:border-neon-cyan/15'
                      }
                    `}
                    title={appDef.name}
                  >
                    {IconComp && <IconComp className="w-3.5 h-3.5 flex-shrink-0" />}
                    <span className="truncate hidden sm:inline">{appDef.name}</span>

                    {/* Active dot indicator */}
                    <div
                      className={`
                        absolute bottom-0.5 left-1/2 -translate-x-1/2 rounded-full transition-all duration-200
                        ${isActive
                          ? 'w-3 h-1 bg-neon-cyan shadow-[0_0_6px_rgba(0,240,255,0.5)]'
                          : isMinimized
                          ? 'w-1 h-1 bg-white/20'
                          : 'w-1.5 h-1 bg-neon-cyan/40'
                        }
                      `}
                    />
                  </motion.button>
                )
              })}
            </AnimatePresence>
          </div>
        </div>

        {/* Center section: Time and Date */}
        <div className="flex items-center gap-3 px-4">
          <div className="flex flex-col items-center">
            <span className="font-mono text-xs text-neon-cyan/80 tracking-wider leading-tight neon-text-cyan">
              {time}
            </span>
            <span className="font-mono text-[9px] text-white/30 tracking-wider leading-tight">
              {date}
            </span>
          </div>
        </div>

        {/* Right section: System tray */}
        <div className="flex items-center gap-1 sm:gap-2 flex-1 justify-end min-w-0">
          {/* WiFi */}
          <div className="hidden sm:flex items-center justify-center w-7 h-7 rounded text-white/25 hover:text-neon-cyan/50 hover:bg-white/5 transition-colors" title="Network Online">
            <Wifi className="w-3.5 h-3.5" />
          </div>

          {/* Volume */}
          <div className="hidden sm:flex items-center justify-center w-7 h-7 rounded text-white/25 hover:text-neon-cyan/50 hover:bg-white/5 transition-colors" title="Volume">
            <Volume2 className="w-3.5 h-3.5" />
          </div>

          {/* Battery */}
          <div className="hidden sm:flex items-center gap-1 px-1.5 py-1 rounded text-white/25 hover:text-neon-cyan/50 hover:bg-white/5 transition-colors" title="Battery 87%">
            <Battery className="w-3.5 h-3.5" />
            <span className="font-mono text-[9px]">87%</span>
          </div>

          {/* Notification bell */}
          <button
            className="flex items-center justify-center w-7 h-7 rounded text-white/25 hover:text-neon-cyan/50 hover:bg-white/5 transition-colors relative"
            title="Notifications"
          >
            <Bell className="w-3.5 h-3.5" />
            <div className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-neon-orange shadow-[0_0_4px_rgba(255,106,0,0.5)]" />
          </button>

          {/* Settings gear */}
          <button
            onClick={() => openApp('settings')}
            className="flex items-center justify-center w-7 h-7 rounded text-white/25 hover:text-neon-cyan/50 hover:bg-white/5 transition-colors"
            title="Settings"
          >
            <Settings className="w-3.5 h-3.5" />
          </button>

          {/* Separator */}
          <div className="w-px h-5 bg-white/5 mx-0.5 hidden sm:block" />

          {/* XP / Level indicator */}
          <div className="hidden sm:flex items-center gap-2 px-2">
            <div className="flex items-center gap-1">
              <Shield className="w-3 h-3 text-neon-cyan/50" />
              <span className="font-mono text-[9px] text-neon-cyan/50">LV{level}</span>
            </div>
            {/* XP bar */}
            <div className="w-12 h-1.5 rounded-full bg-white/5 overflow-hidden">
              <motion.div
                className="h-full rounded-full bg-neon-cyan/50"
                style={{ boxShadow: '0 0 4px rgba(0,240,255,0.3)' }}
                initial={{ width: 0 }}
                animate={{ width: `${xpProgress}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
