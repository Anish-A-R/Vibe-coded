'use client'

import { useEffect, useMemo, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'

interface RadarScannerProps {
  className?: string
}

interface Blip {
  id: number
  x: number
  y: number
  createdAt: number
}

export default function RadarScanner({ className }: RadarScannerProps) {
  const [blips, setBlips] = useState<Blip[]>([])
  const [blipId, setBlipId] = useState(0)

  // Add random blips periodically
  useEffect(() => {
    const interval = setInterval(() => {
      const angle = Math.random() * Math.PI * 2
      const dist = Math.random() * 0.75 + 0.1
      const newBlip: Blip = {
        id: blipId,
        x: 50 + Math.cos(angle) * dist * 50,
        y: 50 + Math.sin(angle) * dist * 50,
        createdAt: Date.now(),
      }
      setBlipId((prev) => prev + 1)
      setBlips((prev) => [...prev.slice(-8), newBlip])
    }, 1200 + Math.random() * 1800)

    return () => clearInterval(interval)
  }, [blipId])

  // Remove old blips
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now()
      setBlips((prev) => prev.filter((b) => now - b.createdAt < 3000))
    }, 500)
    return () => clearInterval(interval)
  }, [])

  const rings = useMemo(() => [18, 32, 46, 60], [])
  const gridLines = useMemo(() => {
    const lines = []
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * 360
      lines.push(angle)
    }
    return lines
  }, [])

  return (
    <div
      className={cn(
        'glass-panel relative overflow-hidden p-3',
        'w-[180px] h-[180px] sm:w-[200px] sm:h-[200px]',
        className
      )}
    >
      {/* Title */}
      <div className="absolute top-2 left-3 z-10 text-[9px] font-mono tracking-widest text-neon-cyan/60 uppercase">
        Scanner
      </div>

      <svg
        viewBox="0 0 100 100"
        className="w-full h-full"
        style={{ filter: 'drop-shadow(0 0 2px rgba(0, 240, 255, 0.2))' }}
      >
        {/* Concentric rings */}
        {rings.map((r, i) => (
          <circle
            key={`ring-${i}`}
            cx="50"
            cy="50"
            r={r}
            fill="none"
            stroke="rgba(0, 240, 255, 0.15)"
            strokeWidth="0.4"
          />
        ))}

        {/* Grid lines */}
        {gridLines.map((angle, i) => {
          const rad = (angle * Math.PI) / 180
          const x2 = 50 + Math.cos(rad) * 48
          const y2 = 50 + Math.sin(rad) * 48
          return (
            <line
              key={`grid-${i}`}
              x1="50"
              y1="50"
              x2={x2}
              y2={y2}
              stroke="rgba(0, 240, 255, 0.08)"
              strokeWidth="0.3"
            />
          )
        })}

        {/* Sweep line */}
        <g>
          <motion.line
            x1="50"
            y1="50"
            x2="98"
            y2="50"
            stroke="rgba(0, 240, 255, 0.7)"
            strokeWidth="0.6"
            strokeLinecap="round"
            animate={{ rotate: [0, 360] }}
            transition={{ duration: 3.5, repeat: Infinity, ease: 'linear' }}
            style={{ originX: '50px', originY: '50px', transformOrigin: '50px 50px' }}
          />
          {/* Sweep cone / trail */}
          <motion.path
            d="M50,50 L98,50 A48,48 0 0,0 73.9,14.6 Z"
            fill="rgba(0, 240, 255, 0.06)"
            animate={{ rotate: [0, 360] }}
            transition={{ duration: 3.5, repeat: Infinity, ease: 'linear' }}
            style={{ transformOrigin: '50px 50px' }}
          />
        </g>

        {/* Center dot */}
        <circle cx="50" cy="50" r="1.5" fill="rgba(0, 240, 255, 0.6)" />

        {/* Blips */}
        <AnimatePresence>
          {blips.map((blip) => {
            const age = (Date.now() - blip.createdAt) / 3000
            const opacity = Math.max(0, 1 - age)
            return (
              <motion.circle
                key={blip.id}
                cx={blip.x}
                cy={blip.y}
                r={1.8}
                fill={`rgba(0, 255, 136, ${opacity})`}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity }}
                exit={{ scale: 0.5, opacity: 0 }}
                transition={{ duration: 0.3 }}
                style={{
                  filter: `drop-shadow(0 0 2px rgba(0, 255, 136, ${opacity * 0.6}))`,
                }}
              />
            )
          })}
        </AnimatePresence>

        {/* Outer border ring */}
        <circle
          cx="50"
          cy="50"
          r="48"
          fill="none"
          stroke="rgba(0, 240, 255, 0.25)"
          strokeWidth="0.6"
        />
      </svg>
    </div>
  )
}
