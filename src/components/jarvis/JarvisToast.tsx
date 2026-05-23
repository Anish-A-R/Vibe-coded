'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Info, CheckCircle, AlertTriangle, AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { JarvisToastData, ToastType } from '@/hooks/useJarvisToast'

const TOAST_EVENT = 'jarvis-toast'
const MAX_TOASTS = 3

// Color config for each toast type
const TOAST_COLORS: Record<ToastType, { border: string; bg: string; icon: string; progress: string; glow: string }> = {
  info: {
    border: 'rgba(0, 240, 255, 0.4)',
    bg: 'rgba(0, 240, 255, 0.06)',
    icon: 'text-neon-cyan',
    progress: 'bg-neon-cyan',
    glow: '0 0 10px rgba(0, 240, 255, 0.2), 0 0 20px rgba(0, 240, 255, 0.05)',
  },
  success: {
    border: 'rgba(0, 255, 136, 0.4)',
    bg: 'rgba(0, 255, 136, 0.06)',
    icon: 'text-neon-green',
    progress: 'bg-neon-green',
    glow: '0 0 10px rgba(0, 255, 136, 0.2), 0 0 20px rgba(0, 255, 136, 0.05)',
  },
  warning: {
    border: 'rgba(255, 106, 0, 0.4)',
    bg: 'rgba(255, 106, 0, 0.06)',
    icon: 'text-neon-orange',
    progress: 'bg-neon-orange',
    glow: '0 0 10px rgba(255, 106, 0, 0.2), 0 0 20px rgba(255, 106, 0, 0.05)',
  },
  error: {
    border: 'rgba(255, 51, 102, 0.4)',
    bg: 'rgba(255, 51, 102, 0.06)',
    icon: 'text-neon-red',
    progress: 'bg-neon-red',
    glow: '0 0 10px rgba(255, 51, 102, 0.2), 0 0 20px rgba(255, 51, 102, 0.05)',
  },
}

const TOAST_ICONS: Record<ToastType, React.ReactNode> = {
  info: <Info className="w-4 h-4" />,
  success: <CheckCircle className="w-4 h-4" />,
  warning: <AlertTriangle className="w-4 h-4" />,
  error: <AlertCircle className="w-4 h-4" />,
}

// Individual toast component
function ToastItem({
  toast,
  onDismiss,
  soundEnabled,
}: {
  toast: JarvisToastData
  onDismiss: (id: string) => void
  soundEnabled: boolean
}) {
  const [timeLeft, setTimeLeft] = useState(toast.duration || 4000)
  const startTimeRef = useRef(Date.now())
  const colors = TOAST_COLORS[toast.type]
  const duration = toast.duration || 4000

  // Countdown timer
  useEffect(() => {
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTimeRef.current
      const remaining = Math.max(0, duration - elapsed)
      setTimeLeft(remaining)

      if (remaining <= 0) {
        clearInterval(interval)
        onDismiss(toast.id)
      }
    }, 50)

    return () => clearInterval(interval)
  }, [toast.id, duration, onDismiss])

  // Play sound on appear
  useEffect(() => {
    if (soundEnabled) {
      try {
        const ctx = new AudioContext()
        const oscillator = ctx.createOscillator()
        const gain = ctx.createGain()

        oscillator.connect(gain)
        gain.connect(ctx.destination)

        oscillator.type = 'sine'
        const freqMap: Record<ToastType, number> = {
          info: 800,
          success: 1000,
          warning: 600,
          error: 400,
        }
        oscillator.frequency.setValueAtTime(freqMap[toast.type], ctx.currentTime)
        oscillator.frequency.exponentialRampToValueAtTime(
          freqMap[toast.type] * 1.2,
          ctx.currentTime + 0.05
        )

        gain.gain.setValueAtTime(0.08, ctx.currentTime)
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15)

        oscillator.start(ctx.currentTime)
        oscillator.stop(ctx.currentTime + 0.15)
      } catch {
        // Audio not available
      }
    }
  }, [soundEnabled, toast.type])

  const progressPercent = (timeLeft / duration) * 100

  return (
    <motion.div
      layout
      initial={{ x: 400, opacity: 0, scale: 0.95 }}
      animate={{ x: 0, opacity: 1, scale: 1 }}
      exit={{ x: 400, opacity: 0, scale: 0.95 }}
      transition={{ type: 'spring', damping: 25, stiffness: 200 }}
      className={cn(
        'relative w-80 sm:w-96 overflow-hidden rounded-xl',
        'backdrop-blur-xl border',
        'shadow-lg'
      )}
      style={{
        background: `linear-gradient(135deg, rgba(10, 14, 26, 0.9), rgba(10, 14, 26, 0.8))`,
        borderColor: colors.border,
        boxShadow: colors.glow,
      }}
    >
      <div className="p-4 flex items-start gap-3" style={{ background: colors.bg }}>
        {/* Icon */}
        <div className={cn('flex-shrink-0 mt-0.5', colors.icon)}>
          {TOAST_ICONS[toast.type]}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-mono font-semibold text-white/90 tracking-wide">
            {toast.title}
          </h4>
          <p className="text-xs font-mono text-white/50 mt-1 leading-relaxed">
            {toast.message}
          </p>
        </div>

        {/* Close button */}
        <button
          onClick={() => onDismiss(toast.id)}
          className="flex-shrink-0 p-1 rounded-md text-white/20 hover:text-white/60 hover:bg-white/5 transition-colors"
          aria-label="Dismiss notification"
        >
          <X className="w-3 h-3" />
        </button>
      </div>

      {/* Progress bar */}
      <div className="h-[2px] w-full" style={{ background: `${colors.border.replace('0.4', '0.15')}` }}>
        <motion.div
          className={cn('h-full', colors.progress)}
          style={{
            boxShadow: `0 0 4px ${colors.border}`,
          }}
          animate={{ width: `${progressPercent}%` }}
          transition={{ duration: 0.05 }}
        />
      </div>
    </motion.div>
  )
}

// Container component that listens for toast events
export function JarvisToastContainer({ soundEnabled = true }: { soundEnabled?: boolean }) {
  const [toasts, setToasts] = useState<JarvisToastData[]>([])

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  // Listen for toast events
  useEffect(() => {
    const handleToast = (e: Event) => {
      const customEvent = e as CustomEvent<JarvisToastData>
      const toast = customEvent.detail

      setToasts((prev) => {
        // Max 3 toasts - remove oldest if needed
        const updated = [...prev, toast]
        if (updated.length > MAX_TOASTS) {
          return updated.slice(updated.length - MAX_TOASTS)
        }
        return updated
      })
    }

    window.addEventListener(TOAST_EVENT, handleToast as EventListener)
    return () => window.removeEventListener(TOAST_EVENT, handleToast as EventListener)
  }, [])

  return (
    <div className="fixed top-4 right-4 z-[100] flex flex-col gap-3 pointer-events-none">
      <AnimatePresence mode="popLayout">
        {toasts.map((toast) => (
          <div key={toast.id} className="pointer-events-auto">
            <ToastItem
              toast={toast}
              onDismiss={dismissToast}
              soundEnabled={soundEnabled}
            />
          </div>
        ))}
      </AnimatePresence>
    </div>
  )
}
