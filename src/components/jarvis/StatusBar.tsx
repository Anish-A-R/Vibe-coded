'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import type { AIStatus } from '@/hooks/useJarvisStore'

interface StatusBarProps {
  status?: AIStatus
  networkStatus?: 'online' | 'offline' | 'weak'
  commandCount?: number
  className?: string
}

const statusDisplay: Record<AIStatus, { label: string; color: string; pulse: boolean }> = {
  idle: { label: 'ONLINE', color: 'bg-neon-green', pulse: false },
  listening: { label: 'LISTENING', color: 'bg-neon-cyan', pulse: true },
  thinking: { label: 'THINKING', color: 'bg-neon-orange', pulse: true },
  speaking: { label: 'SPEAKING', color: 'bg-neon-blue', pulse: true },
}

const networkDisplay: Record<string, { label: string; color: string }> = {
  online: { label: 'NET: OK', color: 'text-neon-green' },
  offline: { label: 'NET: OFF', color: 'text-neon-red' },
  weak: { label: 'NET: WEAK', color: 'text-neon-orange' },
}

export default function StatusBar({
  status = 'idle',
  networkStatus = 'online',
  commandCount = 0,
  className,
}: StatusBarProps) {
  const [time, setTime] = useState<string>('')

  useEffect(() => {
    const updateTime = () => {
      const now = new Date()
      setTime(
        now.toLocaleTimeString('en-US', {
          hour12: false,
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        })
      )
    }
    updateTime()
    const interval = setInterval(updateTime, 1000)
    return () => clearInterval(interval)
  }, [])

  const statusInfo = statusDisplay[status]
  const netInfo = networkDisplay[networkStatus]

  return (
    <div
      className={cn(
        'fixed bottom-0 left-0 right-0 z-40',
        'glass-panel-strong rounded-none border-x-0 border-b-0',
        className
      )}
    >
      {/* Cyan accent line at top */}
      <div
        className="h-[1px] w-full"
        style={{
          background: 'linear-gradient(90deg, transparent, rgba(0, 240, 255, 0.4), rgba(0, 240, 255, 0.6), rgba(0, 240, 255, 0.4), transparent)',
        }}
      />

      <div className="flex items-center justify-between px-3 sm:px-6 py-2 font-mono text-[10px] sm:text-xs tracking-wider">
        {/* Left: Status */}
        <div className="flex items-center gap-2">
          <div className="relative flex items-center justify-center">
            <div
              className={cn('w-2 h-2 rounded-full', statusInfo.color)}
              style={{
                boxShadow: `0 0 6px currentColor`,
              }}
            />
            {statusInfo.pulse && (
              <motion.div
                className={cn('absolute w-2 h-2 rounded-full', statusInfo.color)}
                animate={{
                  scale: [1, 2.2, 1],
                  opacity: [0.6, 0, 0.6],
                }}
                transition={{
                  duration: status === 'thinking' ? 0.8 : 1.5,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
              />
            )}
          </div>
          <span className="text-neon-cyan/80 hidden sm:inline">{statusInfo.label}</span>
          <span className="text-neon-cyan/80 sm:hidden">{statusInfo.label.slice(0, 4)}</span>
        </div>

        {/* Center: Time */}
        <div className="text-neon-cyan/60 tabular-nums">{time}</div>

        {/* Right: Network & Commands */}
        <div className="flex items-center gap-3 sm:gap-5">
          <span className={cn('hidden sm:inline', netInfo.color)}>{netInfo.label}</span>
          <span className={cn('sm:hidden', netInfo.color)}>
            {networkStatus === 'online' ? '●' : networkStatus === 'offline' ? '○' : '◑'}
          </span>

          <span className="text-neon-cyan/50">
            CMD: <span className="text-neon-cyan/80">{commandCount}</span>
          </span>
        </div>
      </div>
    </div>
  )
}
