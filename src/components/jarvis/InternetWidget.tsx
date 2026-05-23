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

export default function InternetWidget() {
  const { systemStats } = useJarvisStore()
  const [browserOnline, setBrowserOnline] = useState(() =>
    typeof navigator !== 'undefined' ? navigator.onLine : true
  )
  const [latency, setLatency] = useState(0)
  const [latencyHistory, setLatencyHistory] = useState<number[]>([])

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

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      className="relative overflow-hidden rounded-xl border border-cyan-500/20 bg-black/40 backdrop-blur-xl p-4"
    >
      {/* Corner accents */}
      <div className="absolute top-0 left-0 h-4 w-4 border-t border-l border-cyan-500/40" />
      <div className="absolute top-0 right-0 h-4 w-4 border-t border-r border-cyan-500/40" />
      <div className="absolute bottom-0 left-0 h-4 w-4 border-b border-l border-cyan-500/40" />
      <div className="absolute bottom-0 right-0 h-4 w-4 border-b border-r border-cyan-500/40" />

      {/* Header */}
      <div className="flex items-center justify-between mb-3">
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
        {/* Pulsing dot */}
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

      {/* Signal bars */}
      <div className="flex items-end gap-1 mb-3">
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
      <div className="flex items-center justify-between text-xs font-mono">
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

      {/* Mini latency chart */}
      {latencyHistory.length > 1 && effectiveStatus !== 'offline' && (
        <div className="mt-2">
          <div className="flex items-end gap-px" style={{ height: 16 }}>
            {latencyHistory.map((val, i) => {
              const maxVal = Math.max(...latencyHistory, 1)
              const h = Math.max(1, (val / maxVal) * 16)
              return (
                <motion.div
                  key={i}
                  className="flex-1"
                  style={{
                    height: h,
                    backgroundColor: val > 60 ? '#eab308' : '#22c55e',
                    opacity: 0.3 + (i / latencyHistory.length) * 0.5,
                    borderRadius: 1,
                  }}
                  animate={{ height: h }}
                  transition={{ duration: 0.3 }}
                />
              )
            })}
          </div>
        </div>
      )}
    </motion.div>
  )
}
