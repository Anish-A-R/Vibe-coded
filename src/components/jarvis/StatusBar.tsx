'use client'

import { useState, useEffect } from 'react'
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

/* Animated signal bars for network status - pure CSS */
function SignalBars({ status }: { status: string }) {
  const barHeights = status === 'online' ? [4, 7, 10, 13] : status === 'weak' ? [4, 7, 0, 0] : [0, 0, 0, 0]
  const color = status === 'online' ? '#00ff88' : status === 'weak' ? '#ff6a00' : '#ff3366'

  return (
    <div className="flex items-end gap-[2px]">
      {barHeights.map((h, i) => (
        <div
          key={i}
          className={cn('w-[3px] rounded-sm', h && 'signal-bar-pulse')}
          style={{
            height: h || 3,
            backgroundColor: h ? color : 'rgba(255,255,255,0.1)',
            animationDelay: h ? `${i * 0.15}s` : undefined,
            animationDuration: '1.5s',
          }}
        />
      ))}
    </div>
  )
}

/* Data flow dots between sections - pure CSS */
function DataFlowDots() {
  return (
    <div className="flex items-center gap-[3px] mx-2">
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className="w-[3px] h-[3px] rounded-full bg-neon-cyan/30 data-flow-dot"
          style={{
            animationDelay: `${i * 0.4}s`,
          }}
        />
      ))}
    </div>
  )
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

  const pulseSpeed = status === 'thinking' ? '0.8s' : '1.5s'

  return (
    <div
      className={cn(
        'fixed bottom-0 left-0 right-0 z-40',
        'glass-panel-strong rounded-none border-x-0 border-b-0',
        className
      )}
    >
      {/* Animated gradient line at top */}
      <div
        className="h-[1px] w-full status-bar-flow"
        style={{
          background: 'linear-gradient(90deg, transparent, rgba(0, 240, 255, 0.2), rgba(0, 240, 255, 0.5), rgba(0, 136, 255, 0.3), rgba(0, 240, 255, 0.5), rgba(0, 240, 255, 0.2), transparent)',
          backgroundSize: '200% 100%',
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
              <div
                className={cn('absolute w-2 h-2 rounded-full status-pulse-ring', statusInfo.color)}
                style={{
                  animationDuration: pulseSpeed,
                }}
              />
            )}
          </div>
          <span className="text-neon-cyan/80 hidden sm:inline">{statusInfo.label}</span>
          <span className="text-neon-cyan/80 sm:hidden">{statusInfo.label.slice(0, 4)}</span>
        </div>

        {/* Data flow dots */}
        <div className="hidden sm:flex">
          <DataFlowDots />
        </div>

        {/* Center: Time with glow */}
        <div
          className="tabular-nums text-neon-cyan/70"
          style={{
            textShadow: '0 0 8px rgba(0, 240, 255, 0.4), 0 0 16px rgba(0, 240, 255, 0.2)',
          }}
        >
          {time}
        </div>

        {/* Data flow dots */}
        <div className="hidden sm:flex">
          <DataFlowDots />
        </div>

        {/* Right: Network with signal bars + Commands */}
        <div className="flex items-center gap-3 sm:gap-5">
          <div className="flex items-center gap-1.5">
            <SignalBars status={networkStatus} />
            <span className={cn('hidden sm:inline', netInfo.color)}>{netInfo.label}</span>
            <span className={cn('sm:hidden', netInfo.color)}>
              {networkStatus === 'online' ? '●' : networkStatus === 'offline' ? '○' : '◑'}
            </span>
          </div>

          <span className="text-neon-cyan/50">
            CMD: <span className="text-neon-cyan/80">{commandCount}</span>
          </span>
        </div>
      </div>
    </div>
  )
}
