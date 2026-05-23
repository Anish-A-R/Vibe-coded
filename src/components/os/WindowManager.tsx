'use client'

import { useRef, useCallback, useEffect, lazy, Suspense, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Minus, Square, X, Maximize2, Minimize2, MessageSquare, Terminal, Brain, LayoutDashboard, Shield, Database, CheckSquare, Code, Puzzle, Settings, type LucideIcon } from 'lucide-react'
import { useJarvisStore, type OSWindow } from '@/hooks/useJarvisStore'

// Lazy load app components
const ChatApp = lazy(() => import('@/components/apps/ChatApp').then(m => ({ default: m.ChatApp })))
const TerminalApp = lazy(() => import('@/components/apps/TerminalApp').then(m => ({ default: m.TerminalApp })))
const AgentHub = lazy(() => import('@/components/apps/AgentHub').then(m => ({ default: m.AgentHub })))
const DashboardApp = lazy(() => import('@/components/apps/DashboardApp').then(m => ({ default: m.DashboardApp })))
const SecurityApp = lazy(() => import('@/components/apps/SecurityApp').then(m => ({ default: m.SecurityApp })))
const MemoryApp = lazy(() => import('@/components/apps/MemoryApp').then(m => ({ default: m.MemoryApp })))
const ProductivityApp = lazy(() => import('@/components/apps/ProductivityApp').then(m => ({ default: m.ProductivityApp })))
const DeveloperApp = lazy(() => import('@/components/apps/DeveloperApp').then(m => ({ default: m.DeveloperApp })))
const PluginStore = lazy(() => import('@/components/apps/PluginStore').then(m => ({ default: m.PluginStore })))
const SettingsPanel = lazy(() => import('@/components/jarvis/SettingsPanel'))

// Icon map for window title bars
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

// App component map
const APP_COMPONENTS: Record<string, React.ComponentType<{ windowId?: string }>> = {
  chat: ChatApp as React.ComponentType<{ windowId?: string }>,
  terminal: TerminalApp as React.ComponentType<{ windowId?: string }>,
  agents: AgentHub as React.ComponentType<{ windowId?: string }>,
  dashboard: DashboardApp as React.ComponentType<{ windowId?: string }>,
  security: SecurityApp as React.ComponentType<{ windowId?: string }>,
  memory: MemoryApp as React.ComponentType<{ windowId?: string }>,
  productivity: ProductivityApp as React.ComponentType<{ windowId?: string }>,
  developer: DeveloperApp as React.ComponentType<{ windowId?: string }>,
  plugins: PluginStore as React.ComponentType<{ windowId?: string }>,
  settings: SettingsPanel as unknown as React.ComponentType<{ windowId?: string }>,
}

// Loading fallback
function AppLoadingFallback() {
  return (
    <div className="flex items-center justify-center h-full">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 rounded-full border-2 border-neon-cyan/30 border-t-neon-cyan animate-spin" />
        <span className="font-mono text-[10px] text-white/30 uppercase tracking-wider">Loading...</span>
      </div>
    </div>
  )
}

// Single window component with drag support
function WindowFrame({ win, isActive }: { win: OSWindow; isActive: boolean }) {
  const focusWindow = useJarvisStore((s) => s.focusWindow)
  const closeWindow = useJarvisStore((s) => s.closeWindow)
  const minimizeWindow = useJarvisStore((s) => s.minimizeWindow)
  const maximizeWindow = useJarvisStore((s) => s.maximizeWindow)
  const restoreWindow = useJarvisStore((s) => s.restoreWindow)
  const moveWindow = useJarvisStore((s) => s.moveWindow)
  const availableApps = useJarvisStore((s) => s.availableApps)

  const [isMobile, setIsMobile] = useState(false)
  const dragRef = useRef<{ startX: number; startY: number; winX: number; winY: number } | null>(null)
  const posRef = useRef<{ x: number; y: number }>({ x: win.x, y: win.y })

  const appDef = availableApps.find((a) => a.id === win.appId)
  const AppComponent = APP_COMPONENTS[win.appId]
  const IconComp = ICON_MAP[win.icon]

  // Check mobile
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 640)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  // Update position ref when window position changes from outside
  useEffect(() => {
    posRef.current = { x: win.x, y: win.y }
  }, [win.x, win.y])

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (win.isMaximized || isMobile) return
    e.preventDefault()
    focusWindow(win.id)
    dragRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      winX: win.x,
      winY: win.y,
    }
    posRef.current = { x: win.x, y: win.y }

    const handleMouseMove = (e: MouseEvent) => {
      if (!dragRef.current) return
      const dx = e.clientX - dragRef.current.startX
      const dy = e.clientY - dragRef.current.startY
      const newX = dragRef.current.winX + dx
      const newY = Math.max(0, dragRef.current.winY + dy)
      posRef.current = { x: newX, y: newY }
    }

    const handleMouseUp = () => {
      if (dragRef.current) {
        moveWindow(win.id, posRef.current.x, posRef.current.y)
      }
      dragRef.current = null
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
  }, [win.id, win.x, win.y, win.isMaximized, isMobile, focusWindow, moveWindow])

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (win.isMaximized || isMobile) return
    const touch = e.touches[0]
    focusWindow(win.id)
    dragRef.current = {
      startX: touch.clientX,
      startY: touch.clientY,
      winX: win.x,
      winY: win.y,
    }
    posRef.current = { x: win.x, y: win.y }

    const handleTouchMove = (e: TouchEvent) => {
      if (!dragRef.current) return
      const touch = e.touches[0]
      const dx = touch.clientX - dragRef.current.startX
      const dy = touch.clientY - dragRef.current.startY
      const newX = dragRef.current.winX + dx
      const newY = Math.max(0, dragRef.current.winY + dy)
      posRef.current = { x: newX, y: newY }
    }

    const handleTouchEnd = () => {
      if (dragRef.current) {
        moveWindow(win.id, posRef.current.x, posRef.current.y)
      }
      dragRef.current = null
      document.removeEventListener('touchmove', handleTouchMove)
      document.removeEventListener('touchend', handleTouchEnd)
    }

    document.addEventListener('touchmove', handleTouchMove)
    document.addEventListener('touchend', handleTouchEnd)
  }, [win.id, win.x, win.y, win.isMaximized, isMobile, focusWindow, moveWindow])

  const handleMaximizeToggle = useCallback(() => {
    if (win.isMaximized) {
      restoreWindow(win.id)
    } else {
      maximizeWindow(win.id)
    }
  }, [win.id, win.isMaximized, maximizeWindow, restoreWindow])

  // Position & size
  const windowStyle: React.CSSProperties = isMobile
    ? { position: 'fixed', top: 0, left: 0, right: 0, bottom: 48, width: '100%', height: 'calc(100vh - 48px)', zIndex: win.zIndex }
    : win.isMaximized
    ? { position: 'fixed', top: 0, left: 0, width: '100%', height: 'calc(100vh - 48px)', zIndex: win.zIndex }
    : { position: 'absolute', left: win.x, top: win.y, width: win.width, height: win.height, zIndex: win.zIndex }

  // Settings panel special handling
  const isSettings = win.appId === 'settings'

  return (
    <motion.div
      style={windowStyle}
      className={`flex flex-col rounded-lg overflow-hidden shadow-2xl shadow-black/50 ${
        isActive
          ? 'ring-1 ring-neon-cyan/30'
          : 'ring-1 ring-white/[0.04]'
      }`}
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0.9, opacity: 0 }}
      transition={{ type: 'spring', damping: 25, stiffness: 300 }}
      onClick={() => focusWindow(win.id)}
    >
      {/* Glass panel background */}
      <div className={`absolute inset-0 glass-panel ${isActive ? 'border-neon-cyan/20' : 'border-white/[0.06]'}`} />

      {/* Title bar */}
      <div
        className={`relative flex items-center h-9 px-2 border-b select-none shrink-0 ${
          isActive ? 'bg-white/[0.06] border-neon-cyan/15' : 'bg-white/[0.03] border-white/[0.06]'
        }`}
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
        style={{ cursor: win.isMaximized || isMobile ? 'default' : 'grab' }}
      >
        {/* App icon + title */}
        <div className="flex items-center gap-2 flex-1 min-w-0">
          {IconComp && (
            <IconComp className={`w-3.5 h-3.5 flex-shrink-0 ${isActive ? 'text-neon-cyan/60' : 'text-white/30'}`} />
          )}
          <span className={`text-[11px] font-mono truncate ${isActive ? 'text-white/70' : 'text-white/30'}`}>
            {win.title}
          </span>
        </div>

        {/* Window controls */}
        <div className="flex items-center gap-0.5 ml-2">
          {/* Minimize */}
          <button
            onClick={(e) => { e.stopPropagation(); minimizeWindow(win.id) }}
            className="w-7 h-7 rounded flex items-center justify-center text-white/20 hover:text-yellow-400 hover:bg-yellow-400/10 transition-colors"
            title="Minimize"
          >
            <Minus className="w-3.5 h-3.5" />
          </button>
          {/* Maximize/Restore */}
          <button
            onClick={(e) => { e.stopPropagation(); handleMaximizeToggle() }}
            className="w-7 h-7 rounded flex items-center justify-center text-white/20 hover:text-green-400 hover:bg-green-400/10 transition-colors"
            title={win.isMaximized ? 'Restore' : 'Maximize'}
          >
            {win.isMaximized ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3 h-3" />}
          </button>
          {/* Close */}
          <button
            onClick={(e) => { e.stopPropagation(); closeWindow(win.id) }}
            className="w-7 h-7 rounded flex items-center justify-center text-white/20 hover:text-red-400 hover:bg-red-400/10 transition-colors"
            title="Close"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="relative flex-1 overflow-hidden">
        <Suspense fallback={<AppLoadingFallback />}>
          {AppComponent ? (
            isSettings ? (
              <SettingsPanel open={true} onClose={() => closeWindow(win.id)} />
            ) : (
              <AppComponent windowId={win.id} />
            )
          ) : (
            <div className="flex items-center justify-center h-full">
              <p className="font-mono text-xs text-white/20">App not found</p>
            </div>
          )}
        </Suspense>
      </div>
    </motion.div>
  )
}

export default function WindowManager() {
  const openWindows = useJarvisStore((s) => s.openWindows)
  const activeWindowId = useJarvisStore((s) => s.activeWindowId)

  // Only render non-minimized windows
  const visibleWindows = openWindows.filter((w) => w.isOpen && !w.isMinimized)

  if (visibleWindows.length === 0) return null

  return (
    <div className="absolute inset-0 z-[50] pointer-events-none">
      <AnimatePresence>
        {visibleWindows.map((win) => (
          <div key={win.id} className="pointer-events-auto">
            <WindowFrame win={win} isActive={activeWindowId === win.id} />
          </div>
        ))}
      </AnimatePresence>
    </div>
  )
}
