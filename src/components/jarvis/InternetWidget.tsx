'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Wifi, WifiOff, Signal, Globe, Activity } from 'lucide-react'
import { useJarvisStore } from '@/hooks/useJarvisStore'

type NetworkStatus = 'online' | 'offline' | 'weak'

function getStatusColor(status: NetworkStatus): string {
  switch (status) {
    case 'online': return '#22c55e'
    case 'weak': return '#eab308'
    case 'offline': return '#ef4444'
  }
}

function getStatusLabel(status: NetworkStatus): string {
  switch (status) {
    case 'online': return 'Connected'
    case 'weak': return 'Weak Signal'
    case 'offline': return 'Disconnected'
  }
}

function getSignalBars(status: NetworkStatus): number[] {
  switch (status) {
    case 'online': return [1, 1, 1, 1]
    case 'weak': return [1, 1, 0, 0]
    case 'offline': return [0, 0, 0, 0]
  }
}

/* Animated signal wave for header */
function SignalWave({ status }: { status: NetworkStatus }) {
  if (status === 'offline') return null

  const barCount = 12
  const color = getStatusColor(status)

  return (
    <div className="flex items-end gap-[2px] h-4">
      {Array.from({ length: barCount }).map((_, i) => (
        <motion.div
          key={i}
          className="w-[2px] rounded-sm"
          style={{
            backgroundColor: color,
            opacity: 0.4,
          }}
          animate={{
            scaleY: [0.3, 1, 0.3],
            opacity: [0.2, 0.6, 0.2],
          }}
          transition={{
            duration: 1.2,
            repeat: Infinity,
            delay: i * 0.08,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  )
}

export default function InternetWidget() {
  const { systemStats } = useJarvisStore()
  const [browserOnline, setBrowserOnline] = useState(() =>
    typeof navigator !== 'undefined' ? navigator.onLine : true
  )
  const [latency, setLatency] = useState(0)
  const [latencyHistory, setLatencyHistory] = useState<number[]>([])
  const [hoveredBar, setHoveredBar] = useState<number | null>(null)

  // Monitor browser online status
  useEffect(() => {
    const handleOnline = () => setBrowserOnline(true)
    const handleOffline = () => setBrowserOnline(false)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  // Simulate latency
  useEffect(() => {
    const updateLatency = () => {
      const base = systemStats.network === 'online' ? 22 : systemStats.network === 'weak' ? 85 : 0
      const jitter = systemStats.network === 'online' ? 15 : systemStats.network === 'weak' ? 40 : 0
      const newLatency = systemStats.network !== 'offline'
        ? Math.round(base + Math.random() * jitter)
        : 0
      setLatency(newLatency)
      setLatencyHistory((prev) => [...prev.slice(-14), newLatency])
    }
    updateLatency()
    const interval = setInterval(updateLatency, 2000)
    return () => clearInterval(interval)
  }, [systemStats.network])

  const effectiveStatus: NetworkStatus = browserOnline ? systemStats.network : 'offline'
  const statusColor = getStatusColor(effectiveStatus)
  const signalBars = getSignalBars(effectiveStatus)

  // Find peak latency
  const peakLatency = latencyHistory.length > 0 ? Math.max(...latencyHistory) : 0

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      className="relative overflow-hidden rounded-xl border border-cyan-500/20 bg-black/40 backdrop-blur-xl p-4 holo-border-cyan inner-glow-cyan"
    >
      {/* Corner accents */}
      <div className="absolute top-0 left-0 h-4 w-4 border-t border-l border-cyan-500/40 z-[2]" />
      <div className="absolute top-0 right-0 h-4 w-4 border-t border-r border-cyan-500/40 z-[2]" />
      <div className="absolute bottom-0 left-0 h-4 w-4 border-b border-l border-cyan-500/40 z-[2]" />
      <div className="absolute bottom-0 right-0 h-4 w-4 border-b border-r border-cyan-500/40 z-[2]" />

      {/* Header */}
      <div className="relative z-[2] flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <AnimatePresence mode="wait">
            <motion.div
              key={effectiveStatus}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              {effectiveStatus === 'offline' ? (
                <WifiOff className="size-5" style={{ color: statusColor }} />
              ) : (
                <Wifi className="size-5" style={{ color: statusColor }} />
              )}
            </motion.div>
          </AnimatePresence>
          <span className="text-sm font-mono font-semibold" style={{ color: statusColor }}>
            {getStatusLabel(effectiveStatus)}
          </span>
        </div>
        {/* Pulsing dot + signal wave */}
        <div className="flex items-center gap-2">
          <SignalWave status={effectiveStatus} />
          <motion.div
            className="relative"
            animate={effectiveStatus === 'online' ? { scale: [1, 1.3, 1] } : {}}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          >
            <div
              className="size-2.5 rounded-full"
              style={{
                backgroundColor: statusColor,
                boxShadow: `0 0 8px ${statusColor}`,
              }}
            />
            {effectiveStatus === 'online' && (
              <motion.div
                className="absolute inset-0 rounded-full"
                style={{ backgroundColor: statusColor }}
                animate={{ scale: [1, 2.5], opacity: [0.6, 0] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: 'easeOut' }}
              />
            )}
          </motion.div>
        </div>
      </div>

      {/* Signal bars */}
      <div className="relative z-[2] flex items-end gap-1 mb-3">
        {signalBars.map((active, i) => (
          <motion.div
            key={i}
            className="w-2 rounded-sm"
            style={{
              height: 6 + i * 4,
              backgroundColor: active ? statusColor : 'rgba(255,255,255,0.1)',
              opacity: active ? 0.8 : 0.3,
            }}
            animate={{
              backgroundColor: active ? statusColor : 'rgba(255,255,255,0.1)',
            }}
            transition={{ duration: 0.3 }}
          />
        ))}
        <span className="ml-2 text-xs font-mono" style={{ color: `${statusColor}99` }}>
          {effectiveStatus === 'online' ? 'Strong' : effectiveStatus === 'weak' ? 'Fair' : 'None'}
        </span>
      </div>

      {/* Latency */}
      <div className="relative z-[2] flex items-center justify-between text-xs font-mono">
        <div className="flex items-center gap-1.5" style={{ color: `${statusColor}99` }}>
          <Activity className="size-3" />
          <span>
            {effectiveStatus === 'offline' ? '--' : `${latency}ms`}
          </span>
        </div>
        <div className="flex items-center gap-1 text-cyan-400/40">
          <Globe className="size-3" />
          <span>{effectiveStatus === 'offline' ? 'No Route' : 'IPv4'}</span>
        </div>
      </div>

      {/* Mini latency chart with gradient fill bars and hover tooltips */}
      {latencyHistory.length > 1 && effectiveStatus !== 'offline' && (
        <div className="relative z-[2] mt-2">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[8px] text-cyan-400/30 font-mono tracking-wider uppercase">Latency History</span>
            {peakLatency > 0 && (
              <span className="text-[8px] text-yellow-400/60 font-mono tracking-wider">
                PEAK: {peakLatency}ms
              </span>
            )}
          </div>
          <div className="flex items-end gap-px" style={{ height: 20 }}>
            {latencyHistory.map((val, i) => {
              const maxVal = Math.max(...latencyHistory, 1)
              const h = Math.max(2, (val / maxVal) * 20)
              const isPeak = val === peakLatency
              return (
                <div
                  key={i}
                  className="flex-1 relative cursor-default"
                  onMouseEnter={() => setHoveredBar(i)}
                  onMouseLeave={() => setHoveredBar(null)}
                >
                  <motion.div
                    className="w-full rounded-sm"
                    style={{
                      height: h,
                      background: `linear-gradient(to top, rgba(34, 197, 94, ${0.3 + (i / latencyHistory.length) * 0.4}), rgba(234, 179, 8, ${0.3 + (i / latencyHistory.length) * 0.4}))`,
                      borderRadius: 1,
                    }}
                    animate={{ height: h }}
                    transition={{ duration: 0.3 }}
                  />
                  {/* PEAK indicator */}
                  {isPeak && latencyHistory.length > 3 && (
                    <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 text-[6px] font-mono text-yellow-400/70 tracking-wider">
                      ▲
                    </div>
                  )}
                  {/* Hover tooltip */}
                  {hoveredBar === i && (
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 px-1.5 py-0.5 rounded bg-black/90 border border-cyan-500/30 text-[9px] font-mono text-cyan-400/80 whitespace-nowrap z-20">
                      {val}ms
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}
    </motion.div>
  )
}
