'use client'

import { useState, useEffect, useMemo } from 'react'
import { motion } from 'framer-motion'

interface DataTickerProps {
  className?: string
}

export default function DataTicker({ className = '' }: DataTickerProps) {
  const [tickIndex, setTickIndex] = useState(0)

  const messages = useMemo(() => [
    'SYS.NOMINAL // ALL SUBSYSTEMS GREEN',
    'NET.STABLE // LATENCY <50ms',
    'SEC.CLEAR // NO INTRUSIONS DETECTED',
    'PWR.OPTIMAL // ARC REACTOR 98.7%',
    'AI.ONLINE // COGNITIVE CORE ACTIVE',
    'HUD.ACTIVE // INTERFACE RESPONSIVE',
    'MEM.STABLE // ALLOCATIONS NORMAL',
    'COM.OPEN // CHANNELS SECURE',
    'VRS.4.2.1 // STARK INDUSTRIES BUILD',
    'SHD.MAXIMUM // DEFENSE PROTOCOLS SET',
  ], [])

  useEffect(() => {
    const interval = setInterval(() => {
      setTickIndex(i => (i + 1) % messages.length)
    }, 4000)
    return () => clearInterval(interval)
  }, [messages.length])

  return (
    <div className={`relative overflow-hidden h-4 ${className}`}>
      <motion.div
        key={tickIndex}
        initial={{ x: 40, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: -40, opacity: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="flex items-center gap-2 whitespace-nowrap"
      >
        <motion.div
          className="w-1 h-1 rounded-full bg-neon-cyan/60"
          animate={{ opacity: [0.3, 1, 0.3] }}
          transition={{ duration: 1, repeat: Infinity }}
        />
        <span className="text-[9px] font-mono text-neon-cyan/25 tracking-[0.15em] uppercase">
          {messages[tickIndex]}
        </span>
        <motion.div
          className="w-1 h-1 rounded-full bg-neon-cyan/60"
          animate={{ opacity: [0.3, 1, 0.3] }}
          transition={{ duration: 1, repeat: Infinity, delay: 0.5 }}
        />
      </motion.div>
    </div>
  )
}
