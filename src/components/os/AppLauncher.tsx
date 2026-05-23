'use client'

import { useState, useCallback, useEffect, useMemo, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
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
  Search,
  X,
  type LucideIcon,
} from 'lucide-react'
import { useJarvisStore, APP_CATEGORIES, type AppDefinition } from '@/hooks/useJarvisStore'

// Map icon name string to actual Lucide component
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

export default function AppLauncher() {
  const showAppLauncher = useJarvisStore((s) => s.showAppLauncher)
  const setShowAppLauncher = useJarvisStore((s) => s.setShowAppLauncher)
  const openApp = useJarvisStore((s) => s.openApp)
  const availableApps = useJarvisStore((s) => s.availableApps)
  const [search, setSearch] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  // Focus input when launcher opens + reset search on close
  useEffect(() => {
    if (showAppLauncher && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }, [showAppLauncher])

  // Reset search when launcher closes (derived, not in same effect)
  const effectiveSearch = showAppLauncher ? search : ''

  // Escape to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && showAppLauncher) {
        setShowAppLauncher(false)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [showAppLauncher, setShowAppLauncher])

  // Filter apps by search
  const filteredApps = useMemo(() => {
    if (!effectiveSearch.trim()) return availableApps
    const q = effectiveSearch.toLowerCase()
    return availableApps.filter(
      (app) =>
        app.name.toLowerCase().includes(q) ||
        app.description.toLowerCase().includes(q) ||
        app.category.toLowerCase().includes(q)
    )
  }, [effectiveSearch, availableApps])

  // Group by category
  const groupedApps = useMemo(() => {
    const groups: Record<string, AppDefinition[]> = {}
    for (const category of APP_CATEGORIES) {
      const apps = filteredApps.filter((app) => app.category === category)
      if (apps.length > 0) {
        groups[category] = apps
      }
    }
    return groups
  }, [filteredApps])

  const handleAppClick = useCallback(
    (appId: string) => {
      openApp(appId)
      setShowAppLauncher(false)
    },
    [openApp, setShowAppLauncher]
  )

  return (
    <AnimatePresence>
      {showAppLauncher && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-black/60 backdrop-blur-md"
            onClick={() => setShowAppLauncher(false)}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />

          {/* Center card */}
          <motion.div
            className="relative z-10 w-full max-w-2xl mx-4 glass-panel p-0 overflow-hidden"
            initial={{ scale: 0.8, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Top gradient line */}
            <div
              className="h-[2px] w-full"
              style={{
                background: 'linear-gradient(90deg, transparent, rgba(0,240,255,0.6), rgba(0,240,255,0.8), rgba(0,240,255,0.6), transparent)',
              }}
            />

            {/* Search input area */}
            <div className="flex items-center gap-3 px-5 py-4 border-b border-neon-cyan/10">
              <Search className="w-5 h-5 text-neon-cyan/50 flex-shrink-0" />
              <input
                ref={inputRef}
                type="text"
                value={effectiveSearch}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search applications..."
                className="flex-1 bg-transparent font-mono text-sm text-white/90 placeholder:text-white/20 outline-none"
              />
              {search && (
                <button
                  onClick={() => setSearch('')}
                  className="p-1 rounded hover:bg-white/5 text-white/30 hover:text-white/60 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
              <kbd className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded bg-white/5 border border-white/10 font-mono text-[10px] text-white/30">
                ESC
              </kbd>
            </div>

            {/* App grid - scrollable */}
            <div className="max-h-[60vh] overflow-y-auto jarvis-scrollbar px-5 py-4">
              {Object.keys(groupedApps).length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <Search className="w-8 h-8 text-white/10 mb-3" />
                  <p className="font-mono text-sm text-white/30">No applications found</p>
                </div>
              ) : (
                Object.entries(groupedApps).map(([category, apps]) => (
                  <div key={category} className="mb-5 last:mb-0">
                    {/* Category header */}
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-1 h-1 rounded-full bg-neon-cyan/50" />
                      <span className="font-mono text-[10px] tracking-[0.15em] uppercase text-neon-cyan/40">
                        {category}
                      </span>
                      <div className="flex-1 h-px bg-gradient-to-r from-neon-cyan/10 to-transparent" />
                    </div>

                    {/* App grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {apps.map((app) => {
                        const IconComp = ICON_MAP[app.icon]
                        return (
                          <motion.button
                            key={app.id}
                            onClick={() => handleAppClick(app.id)}
                            className="flex items-center gap-3 p-3 rounded-lg
                              bg-white/[0.02] border border-white/[0.04]
                              hover:bg-neon-cyan/[0.06] hover:border-neon-cyan/20
                              transition-all duration-200 text-left group"
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                          >
                            {/* Icon */}
                            <div className="w-9 h-9 rounded-lg bg-neon-cyan/[0.06] border border-neon-cyan/10
                              flex items-center justify-center flex-shrink-0
                              group-hover:border-neon-cyan/30 group-hover:bg-neon-cyan/10
                              transition-all duration-200"
                            >
                              {IconComp && (
                                <IconComp className="w-4 h-4 text-neon-cyan/50 group-hover:text-neon-cyan/80 transition-colors" />
                              )}
                            </div>
                            {/* Text */}
                            <div className="min-w-0 flex-1">
                              <div className="font-mono text-xs text-white/70 group-hover:text-white/90 truncate transition-colors">
                                {app.name}
                              </div>
                              <div className="font-mono text-[9px] text-white/25 group-hover:text-white/40 truncate transition-colors">
                                {app.description}
                              </div>
                            </div>
                          </motion.button>
                        )
                      })}
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Bottom bar */}
            <div className="flex items-center justify-between px-5 py-3 border-t border-neon-cyan/10">
              <span className="font-mono text-[9px] text-white/20">
                {filteredApps.length} APPS AVAILABLE
              </span>
              <span className="font-mono text-[9px] text-white/15">
                JARVIS OS v2.0
              </span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
