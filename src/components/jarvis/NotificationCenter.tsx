'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Bell,
  X,
  CheckCheck,
  Trash2,
  MessageCircle,
  Cpu,
  Brain,
  Plus,
  Sparkles,
  ThermometerSun,
  Snowflake,
  AlertTriangle,
  Info,
  CheckCircle2,
  XCircle,
} from 'lucide-react'
import { useJarvisStore } from '@/hooks/useJarvisStore'
import type { AppNotification } from '@/hooks/useJarvisStore'

function getRelativeTime(timestamp: number): string {
  const now = Date.now()
  const diffMs = now - timestamp
  const diffSec = Math.floor(diffMs / 1000)
  if (diffSec < 60) return 'Just now'
  const diffMin = Math.floor(diffSec / 60)
  if (diffMin < 60) return `${diffMin}m ago`
  const diffHr = Math.floor(diffMin / 60)
  if (diffHr < 24) return `${diffHr}h ago`
  return `${Math.floor(diffHr / 24)}d ago`
}

function getNotificationIcon(notification: AppNotification) {
  const iconMap: Record<string, React.ReactNode> = {
    'message-circle': <MessageCircle className="size-3.5" />,
    'cpu': <Cpu className="size-3.5" />,
    'brain': <Brain className="size-3.5" />,
    'plus': <Plus className="size-3.5" />,
    'sparkles': <Sparkles className="size-3.5" />,
    'thermometer-sun': <ThermometerSun className="size-3.5" />,
    'snowflake': <Snowflake className="size-3.5" />,
    'alert-triangle': <AlertTriangle className="size-3.5" />,
  }

  if (notification.icon && iconMap[notification.icon]) {
    return iconMap[notification.icon]
  }

  switch (notification.type) {
    case 'info':
      return <Info className="size-3.5" />
    case 'warning':
      return <AlertTriangle className="size-3.5" />
    case 'success':
      return <CheckCircle2 className="size-3.5" />
    case 'error':
      return <XCircle className="size-3.5" />
  }
}

function getTypeColor(type: AppNotification['type']) {
  switch (type) {
    case 'info': return 'text-cyan-400'
    case 'warning': return 'text-orange-400'
    case 'success': return 'text-green-400'
    case 'error': return 'text-red-400'
  }
}

function getTypeBg(type: AppNotification['type']) {
  switch (type) {
    case 'info': return 'bg-cyan-500/10 border-cyan-500/20'
    case 'warning': return 'bg-orange-500/10 border-orange-500/20'
    case 'success': return 'bg-green-500/10 border-green-500/20'
    case 'error': return 'bg-red-500/10 border-red-500/20'
  }
}

export default function NotificationCenter() {
  const {
    notifications,
    markNotificationRead,
    markAllNotificationsRead,
    clearNotifications,
    soundEnabled,
  } = useJarvisStore()

  const [isOpen, setIsOpen] = useState(false)
  const prevCountRef = useRef(0)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)

  const unreadCount = notifications.filter((n) => !n.read).length
  const displayCount = unreadCount > 99 ? '99+' : String(unreadCount)

  // Play notification sound on new notification
  useEffect(() => {
    const prev = prevCountRef.current
    prevCountRef.current = unreadCount
    if (unreadCount > prev && prev >= 0 && soundEnabled) {
      try {
        const ctx = new AudioContext()
        const osc = ctx.createOscillator()
        const gain = ctx.createGain()
        osc.connect(gain)
        gain.connect(ctx.destination)
        osc.type = 'sine'
        osc.frequency.setValueAtTime(880, ctx.currentTime)
        osc.frequency.setValueAtTime(1100, ctx.currentTime + 0.08)
        gain.gain.setValueAtTime(0.06, ctx.currentTime)
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2)
        osc.start(ctx.currentTime)
        osc.stop(ctx.currentTime + 0.2)
      } catch { /* Audio not available */ }
    }
  }, [unreadCount, soundEnabled])

  // Close dropdown when clicking outside
  useEffect(() => {
    if (!isOpen) return
    const handleClick = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false)
      }
    }
    const timer = setTimeout(() => {
      document.addEventListener('mousedown', handleClick)
    }, 0)
    return () => {
      clearTimeout(timer)
      document.removeEventListener('mousedown', handleClick)
    }
  }, [isOpen])

  // Refresh relative time display
  const [, setTick] = useState(0)
  useEffect(() => {
    const timer = setInterval(() => setTick((t) => t + 1), 30000)
    return () => clearInterval(timer)
  }, [])

  // Compute dropdown position from button
  const [dropdownStyle, setDropdownStyle] = useState<React.CSSProperties>({})
  const updatePosition = useCallback(() => {
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect()
      setDropdownStyle({
        position: 'fixed',
        top: rect.bottom + 8,
        right: window.innerWidth - rect.right,
        width: Math.min(384, window.innerWidth - 32),
      })
    }
  }, [])

  useEffect(() => {
    if (isOpen) {
      updatePosition()
      const handleResize = () => updatePosition()
      window.addEventListener('resize', handleResize)
      return () => window.removeEventListener('resize', handleResize)
    }
  }, [isOpen, updatePosition])

  return (
    <div className="relative">
      {/* Bell button */}
      <button
        ref={buttonRef}
        onClick={() => {
          setIsOpen(!isOpen)
          if (!isOpen && unreadCount > 0) {
            setTimeout(() => markAllNotificationsRead(), 2000)
          }
        }}
        className="relative p-2 rounded-lg text-white/30 hover:text-neon-cyan/70 hover:bg-white/5 transition-all duration-200"
        aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ''}`}
        title="Notifications"
      >
        <Bell className="w-4 h-4" />

        {/* Unread badge */}
        <AnimatePresence>
          {unreadCount > 0 && (
            <motion.div
              key={`badge-${unreadCount}`}
              initial={{ scale: 0 }}
              animate={{ scale: [0, 1.4, 1] }}
              exit={{ scale: 0 }}
              transition={{ type: 'spring', stiffness: 500, damping: 15 }}
              className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 flex items-center justify-center
                rounded-full bg-red-500 text-white text-[9px] font-mono font-bold px-1
                shadow-[0_0_8px_rgba(239,68,68,0.5)]"
            >
              {displayCount}
            </motion.div>
          )}
        </AnimatePresence>
      </button>

      {/* Dropdown panel - rendered via portal to escape overflow clipping */}
      {typeof window !== 'undefined' && createPortal(
        <AnimatePresence>
          {isOpen && (
            <motion.div
              ref={dropdownRef}
              initial={{ opacity: 0, y: -8, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              style={dropdownStyle}
              className="z-[60]
                border border-neon-cyan/15 bg-black/95 backdrop-blur-xl rounded-xl
                shadow-2xl shadow-black/60 overflow-hidden"
            >
              {/* Header */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-neon-cyan/10">
                <div className="flex items-center gap-2">
                  <Bell className="size-4 text-neon-cyan/60" />
                  <span className="text-xs font-mono text-neon-cyan/80 uppercase tracking-wider font-semibold">
                    Notifications
                  </span>
                  {unreadCount > 0 && (
                    <span className="text-[9px] font-mono text-neon-cyan/40 bg-neon-cyan/10 px-1.5 py-0.5 rounded">
                      {unreadCount} new
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllNotificationsRead}
                      className="p-1 rounded text-neon-cyan/40 hover:text-neon-cyan/70 hover:bg-neon-cyan/10 transition-colors"
                      aria-label="Mark all read"
                      title="Mark all as read"
                    >
                      <CheckCheck className="size-3.5" />
                    </button>
                  )}
                  {notifications.length > 0 && (
                    <button
                      onClick={clearNotifications}
                      className="p-1 rounded text-white/20 hover:text-red-400/70 hover:bg-red-500/10 transition-colors"
                      aria-label="Clear all"
                      title="Clear all notifications"
                    >
                      <Trash2 className="size-3.5" />
                    </button>
                  )}
                  <button
                    onClick={() => setIsOpen(false)}
                    className="p-1 rounded text-white/20 hover:text-white/50 hover:bg-white/5 transition-colors"
                    aria-label="Close"
                  >
                    <X className="size-3.5" />
                  </button>
                </div>
              </div>

              {/* Notification list */}
              <div className="max-h-96 overflow-y-auto jarvis-scrollbar">
                {notifications.length === 0 ? (
                  <div className="py-8 text-center">
                    <Bell className="size-8 text-white/10 mx-auto mb-2" />
                    <p className="text-xs font-mono text-white/20">No notifications yet</p>
                    <p className="text-[10px] font-mono text-white/10 mt-1">Important events will appear here</p>
                  </div>
                ) : (
                  <AnimatePresence initial={false}>
                    {notifications.map((notification) => (
                      <motion.div
                        key={notification.id}
                        initial={{ opacity: 0, x: 20, height: 0 }}
                        animate={{ opacity: 1, x: 0, height: 'auto' }}
                        exit={{ opacity: 0, x: -20, height: 0 }}
                        transition={{ duration: 0.2 }}
                        className={`
                          relative group px-4 py-3 border-b border-white/5 last:border-b-0
                          hover:bg-white/[0.02] transition-colors cursor-pointer
                          ${!notification.read ? 'bg-neon-cyan/[0.02]' : ''}
                        `}
                        onClick={() => markNotificationRead(notification.id)}
                      >
                        {/* Unread indicator */}
                        {!notification.read && (
                          <div className="absolute left-1.5 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-neon-cyan shadow-[0_0_4px_rgba(0,240,255,0.5)]" />
                        )}

                        <div className="flex items-start gap-3">
                          {/* Icon */}
                          <div className={`flex-shrink-0 mt-0.5 p-1.5 rounded border ${getTypeBg(notification.type)} ${getTypeColor(notification.type)}`}>
                            {getNotificationIcon(notification)}
                          </div>

                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className={`text-xs font-mono font-semibold ${getTypeColor(notification.type)}`}>
                                {notification.title}
                              </span>
                            </div>
                            <p className="text-[11px] font-mono text-white/40 mt-0.5 line-clamp-2">
                              {notification.message}
                            </p>
                            <span className="text-[9px] font-mono text-white/15 mt-1 block">
                              {getRelativeTime(notification.timestamp)}
                            </span>
                          </div>

                          {/* Dismiss button */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              const store = useJarvisStore.getState()
                              const updated = store.notifications.filter((n) => n.id !== notification.id)
                              useJarvisStore.setState({ notifications: updated })
                            }}
                            className="flex-shrink-0 opacity-0 group-hover:opacity-100 p-1 rounded
                              text-white/15 hover:text-white/40 hover:bg-white/5 transition-all"
                            aria-label="Dismiss notification"
                          >
                            <X className="size-3" />
                          </button>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                )}
              </div>

              {/* Footer */}
              {notifications.length > 0 && (
                <div className="px-4 py-2 border-t border-white/5 bg-white/[0.01]">
                  <p className="text-[9px] font-mono text-white/15 text-center">
                    {notifications.length} notification{notifications.length !== 1 ? 's' : ''} &bull; {unreadCount} unread
                  </p>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </div>
  )
}
