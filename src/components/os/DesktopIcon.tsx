'use client'

import { useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import {
  MessageCircle,
  Mic,
  StickyNote,
  Timer,
  CloudSun,
  Clock,
  Terminal,
  Activity,
  Radar,
  Settings,
  ScrollText,
  Music,
  type LucideIcon,
} from 'lucide-react'
import { useJarvisStore, type AppDefinition } from '@/hooks/useJarvisStore'

// Map icon name string to actual Lucide component
const ICON_MAP: Record<string, LucideIcon> = {
  MessageCircle,
  Mic,
  StickyNote,
  Timer,
  CloudSun,
  Clock,
  Terminal,
  Activity,
  Radar,
  Settings,
  ScrollText,
  Music,
}

interface DesktopIconProps {
  app: AppDefinition
  index: number
}

export default function DesktopIcon({ app, index }: DesktopIconProps) {
  const [isHovered, setIsHovered] = useState(false)
  const openApp = useJarvisStore((s) => s.openApp)
  const IconComponent = ICON_MAP[app.icon]

  const handleDoubleClick = useCallback(() => {
    openApp(app.id)
  }, [openApp, app.id])

  const handleContextMenu = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
  }, [])

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      className="flex flex-col items-center gap-1.5 w-20 cursor-pointer select-none group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onDoubleClick={handleDoubleClick}
      onContextMenu={handleContextMenu}
      role="button"
      tabIndex={0}
      aria-label={`Open ${app.name}`}
      onKeyDown={(e) => {
        if (e.key === 'Enter') handleDoubleClick()
      }}
    >
      {/* Icon container */}
      <motion.div
        className={`
          relative w-14 h-14 rounded-lg flex items-center justify-center
          bg-jarvis-panel border transition-all duration-200
          ${isHovered
            ? 'border-neon-cyan/40 neon-glow-cyan'
            : 'border-neon-cyan/10 group-hover:border-neon-cyan/25'
          }
        `}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.95 }}
      >
        {/* Animated gradient top line */}
        <div
          className="absolute top-0 left-2 right-2 h-px rounded-full"
          style={{
            background: isHovered
              ? 'linear-gradient(90deg, transparent, rgba(0,240,255,0.6), transparent)'
              : 'linear-gradient(90deg, transparent, rgba(0,240,255,0.2), transparent)',
          }}
        />

        {IconComponent && (
          <IconComponent
            className={`w-6 h-6 transition-colors duration-200 ${
              isHovered ? 'text-neon-cyan' : 'text-neon-cyan/50'
            }`}
          />
        )}

        {/* Hover glow ring */}
        {isHovered && (
          <motion.div
            className="absolute inset-0 rounded-lg border border-neon-cyan/20"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              boxShadow: '0 0 15px rgba(0,240,255,0.15), inset 0 0 15px rgba(0,240,255,0.05)',
            }}
          />
        )}
      </motion.div>

      {/* App name */}
      <span
        className={`
          font-mono text-[10px] text-center leading-tight truncate w-full
          transition-colors duration-200
          ${isHovered ? 'text-neon-cyan/90' : 'text-white/50'}
        `}
      >
        {app.name}
      </span>
    </motion.div>
  )
}
