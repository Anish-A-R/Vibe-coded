'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'

// ===== CornerBrackets =====
interface CornerBracketsProps {
  size?: number
  color?: string
  className?: string
}

export function CornerBrackets({ size = 16, color = 'cyan', className = '' }: CornerBracketsProps) {
  const colorMap: Record<string, string> = {
    cyan: '#00f0ff',
    blue: '#3b82f6',
    orange: '#f97316',
    green: '#22c55e',
    red: '#ef4444',
    purple: '#a855f7',
  }
  const hex = color.startsWith('#') ? color : (colorMap[color] || colorMap.cyan)
  const len = size
  const strokeW = 1.5

  const cornerVariants = {
    hidden: { pathLength: 0, opacity: 0 },
    visible: (i: number) => ({
      pathLength: 1,
      opacity: 1,
      transition: {
        pathLength: { delay: i * 0.15, duration: 0.6, ease: 'easeInOut' },
        opacity: { delay: i * 0.15, duration: 0.3 },
      },
    }),
  }

  const dotVariants = {
    hidden: { scale: 0, opacity: 0 },
    visible: (i: number) => ({
      scale: 1,
      opacity: 1,
      transition: { delay: i * 0.15 + 0.5, duration: 0.3, ease: 'easeOut' },
    }),
  }

  // Paths for each corner (origin at corner point, drawn outward)
  // Top-left: horizontal right, then vertical down
  // Top-right: horizontal left, then vertical down
  // Bottom-left: horizontal right, then vertical up
  // Bottom-right: horizontal left, then vertical up
  const corners = [
    { // Top-left
      path: `M ${len} 0 L 0 0 L 0 ${len}`,
      dot: { cx: 0, cy: 0 },
      position: 'top-0 left-0',
    },
    { // Top-right
      path: `M ${-len} 0 L 0 0 L 0 ${len}`,
      dot: { cx: 0, cy: 0 },
      position: 'top-0 right-0',
    },
    { // Bottom-left
      path: `M ${len} 0 L 0 0 L 0 ${-len}`,
      dot: { cx: 0, cy: 0 },
      position: 'bottom-0 left-0',
    },
    { // Bottom-right
      path: `M ${-len} 0 L 0 0 L 0 ${-len}`,
      dot: { cx: 0, cy: 0 },
      position: 'bottom-0 right-0',
    },
  ]

  return (
    <div className={`absolute inset-0 pointer-events-none ${className}`}>
      {corners.map((corner, i) => (
        <div key={i} className={`absolute ${corner.position}`} style={{ width: len, height: len }}>
          <motion.svg
            width={len}
            height={len}
            viewBox={`${-len} ${-len} ${len * 3} ${len * 3}`}
            className="absolute inset-0"
            style={{ overflow: 'visible' }}
          >
            <motion.path
              d={corner.path}
              stroke={hex}
              strokeWidth={strokeW}
              fill="none"
              custom={i}
              variants={cornerVariants}
              initial="hidden"
              animate="visible"
              style={{ filter: `drop-shadow(0 0 3px ${hex})` }}
            />
            <motion.circle
              cx={corner.dot.cx}
              cy={corner.dot.cy}
              r={2}
              fill={hex}
              custom={i}
              variants={dotVariants}
              initial="hidden"
              animate="visible"
              style={{ filter: `drop-shadow(0 0 4px ${hex})` }}
            />
          </motion.svg>
        </div>
      ))}
    </div>
  )
}

// ===== DataReadout =====
interface DataReadoutProps {
  label: string
  value: string
  className?: string
}

export function DataReadout({ label, value, className = '' }: DataReadoutProps) {
  const [flicker, setFlicker] = useState(false)

  useEffect(() => {
    const interval = setInterval(() => {
      setFlicker(true)
      setTimeout(() => setFlicker(false), 80)
    }, 3000 + Math.random() * 2000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className={`flex items-center gap-2 font-mono text-[10px] tracking-wider ${className}`}>
      <span className="text-cyan-400/60 uppercase whitespace-nowrap">{label}</span>
      <div className="flex-1 flex items-center min-w-[40px]">
        <motion.div
          className="h-px flex-1 bg-gradient-to-r from-cyan-400/40 to-transparent"
          style={{
            backgroundImage: 'repeating-linear-gradient(90deg, rgba(0,240,255,0.4) 0px, rgba(0,240,255,0.4) 4px, transparent 4px, transparent 8px)',
            backgroundSize: '8px 1px',
            height: '1px',
          }}
          initial={{ scaleX: 0, originX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 1, ease: 'easeOut' }}
        />
      </div>
      <motion.span
        className={`text-cyan-300 whitespace-nowrap transition-opacity duration-75 ${flicker ? 'opacity-40' : 'opacity-90'}`}
        initial={{ opacity: 0, x: -5 }}
        animate={{ opacity: flicker ? 0.4 : 0.9, x: 0 }}
        style={{ textShadow: '0 0 6px rgba(0,240,255,0.4)' }}
      >
        {value}
      </motion.span>
    </div>
  )
}

// ===== ScanLine =====
interface ScanLineProps {
  className?: string
  duration?: number
}

export function ScanLine({ className = '', duration = 4 }: ScanLineProps) {
  return (
    <div className={`absolute inset-0 pointer-events-none overflow-hidden ${className}`}>
      <motion.div
        className="absolute left-0 right-0 h-px"
        style={{
          background: 'linear-gradient(90deg, transparent 0%, rgba(0,240,255,0.3) 20%, rgba(0,240,255,0.6) 50%, rgba(0,240,255,0.3) 80%, transparent 100%)',
          boxShadow: '0 0 8px rgba(0,240,255,0.3), 0 0 20px rgba(0,240,255,0.1)',
        }}
        initial={{ top: '-2px' }}
        animate={{ top: ['0%', '100%'] }}
        transition={{
          duration,
          repeat: Infinity,
          ease: 'linear',
          repeatDelay: 1,
        }}
      />
    </div>
  )
}

// ===== HUDFrame =====
interface HUDFrameProps {
  title?: string
  readouts?: { label: string; value: string }[]
  children: React.ReactNode
  className?: string
}

export function HUDFrame({ title, readouts, children, className = '' }: HUDFrameProps) {
  return (
    <div className={`relative ${className}`}>
      {/* Corner brackets */}
      <CornerBrackets size={18} color="cyan" />

      {/* Top border line with glow */}
      <motion.div
        className="absolute top-0 left-4 right-4 h-px"
        style={{
          background: 'linear-gradient(90deg, transparent, rgba(0,240,255,0.5), transparent)',
          boxShadow: '0 0 6px rgba(0,240,255,0.2)',
        }}
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
      />

      {/* Title bar */}
      {title && (
        <motion.div
          className="absolute -top-3 left-6 flex items-center gap-2 z-10"
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.4 }}
        >
          <div className="w-1 h-1 rounded-full bg-cyan-400" style={{ boxShadow: '0 0 4px rgba(0,240,255,0.6)' }} />
          <span className="text-[11px] font-mono text-cyan-400/80 uppercase tracking-[0.2em] whitespace-nowrap"
            style={{ textShadow: '0 0 8px rgba(0,240,255,0.3)' }}
          >
            {title}
          </span>
          <div className="w-1 h-1 rounded-full bg-cyan-400" style={{ boxShadow: '0 0 4px rgba(0,240,255,0.6)' }} />
        </motion.div>
      )}

      {/* Scan line */}
      <ScanLine duration={5} />

      {/* Content */}
      <div className="relative z-[1]">
        {children}
      </div>

      {/* Bottom data readouts */}
      {readouts && readouts.length > 0 && (
        <motion.div
          className="mt-2 pt-2 border-t border-cyan-400/10 flex flex-wrap gap-x-6 gap-y-1 px-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.5 }}
        >
          {readouts.map((r, i) => (
            <DataReadout key={i} label={r.label} value={r.value} />
          ))}
        </motion.div>
      )}
    </div>
  )
}
