'use client'

import { useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import { useJarvisStore } from '@/hooks/useJarvisStore'
import type { AIStatus } from '@/hooks/useJarvisStore'

// ===== Theme Color Map =====
const themeColors: Record<string, { primary: string; hex: string; secondary: string }> = {
  cyan: { primary: 'rgba(0, 240, 255, 1)', hex: '#00f0ff', secondary: 'rgba(0, 102, 255, 0.6)' },
  red: { primary: 'rgba(255, 51, 102, 1)', hex: '#ff3366', secondary: 'rgba(255, 80, 120, 0.6)' },
  green: { primary: 'rgba(0, 255, 136, 1)', hex: '#00ff88', secondary: 'rgba(16, 185, 129, 0.6)' },
  purple: { primary: 'rgba(139, 92, 246, 1)', hex: '#8b5cf6', secondary: 'rgba(192, 38, 211, 0.6)' },
  orange: { primary: 'rgba(255, 106, 0, 1)', hex: '#ff6a00', secondary: 'rgba(255, 149, 0, 0.6)' },
  arctic: { primary: 'rgba(96, 165, 250, 1)', hex: '#60a5fa', secondary: 'rgba(56, 189, 248, 0.6)' },
  gold: { primary: 'rgba(255, 215, 0, 1)', hex: '#ffd700', secondary: 'rgba(245, 158, 11, 0.6)' },
  pink: { primary: 'rgba(244, 114, 182, 1)', hex: '#f472b6', secondary: 'rgba(232, 121, 249, 0.6)' },
  teal: { primary: 'rgba(45, 212, 191, 1)', hex: '#2dd4bf', secondary: 'rgba(20, 184, 166, 0.6)' },
  crimson: { primary: 'rgba(220, 38, 38, 1)', hex: '#dc2626', secondary: 'rgba(239, 68, 68, 0.6)' },
  lime: { primary: 'rgba(132, 204, 22, 1)', hex: '#84cc16', secondary: 'rgba(163, 230, 53, 0.6)' },
}

// ===== Status Configuration =====
const statusConfig: Record<AIStatus, {
  ringSpeeds: number[]
  pulseScale: [number, number]
  pulseDuration: number
  glowIntensity: number
  coreScale: number
  outerGlowScale: number
  colorPrimary: string
  colorHex: string
  colorSecondary: string
  arcCount: number
  pulseWaveInterval: number
  dataRingSpeed: number
  particleDirection: 'orbit' | 'outward' | 'pulse'
  particleSpeed: number
  hudRingOpacity: number
  energyArcIntensity: number
  statusLabel: string
}> = {
  idle: {
    ringSpeeds: [22, 32, 42, 28, 38, 20],
    pulseScale: [1, 1.04],
    pulseDuration: 3.5,
    glowIntensity: 0.35,
    coreScale: 1,
    outerGlowScale: 1,
    colorPrimary: 'rgba(0, 240, 255, 1)',
    colorHex: '#00f0ff',
    colorSecondary: 'rgba(0, 102, 255, 0.6)',
    arcCount: 3,
    pulseWaveInterval: 5,
    dataRingSpeed: 70,
    particleDirection: 'orbit',
    particleSpeed: 1,
    hudRingOpacity: 0.25,
    energyArcIntensity: 0.3,
    statusLabel: 'STANDBY',
  },
  listening: {
    ringSpeeds: [8, 13, 16, 10, 15, 9],
    pulseScale: [1, 1.14],
    pulseDuration: 1.0,
    glowIntensity: 0.9,
    coreScale: 1.08,
    outerGlowScale: 1.12,
    colorPrimary: 'rgba(0, 240, 255, 1)',
    colorHex: '#00f0ff',
    colorSecondary: 'rgba(0, 102, 255, 0.8)',
    arcCount: 7,
    pulseWaveInterval: 1.2,
    dataRingSpeed: 20,
    particleDirection: 'outward',
    particleSpeed: 2.5,
    hudRingOpacity: 0.6,
    energyArcIntensity: 0.8,
    statusLabel: 'LISTENING',
  },
  thinking: {
    ringSpeeds: [2, 4, 6, 3, 5, 2.5],
    pulseScale: [1, 1.08],
    pulseDuration: 0.6,
    glowIntensity: 1.0,
    coreScale: 1.03,
    outerGlowScale: 0.98,
    colorPrimary: 'rgba(255, 140, 50, 1)',
    colorHex: '#ff8c32',
    colorSecondary: 'rgba(139, 92, 246, 0.7)',
    arcCount: 9,
    pulseWaveInterval: 0.7,
    dataRingSpeed: 10,
    particleDirection: 'orbit',
    particleSpeed: 4,
    hudRingOpacity: 0.5,
    energyArcIntensity: 1.0,
    statusLabel: 'PROCESSING',
  },
  speaking: {
    ringSpeeds: [12, 18, 14, 16, 13, 15],
    pulseScale: [1, 1.1],
    pulseDuration: 1.2,
    glowIntensity: 0.7,
    coreScale: 1.04,
    outerGlowScale: 1.05,
    colorPrimary: 'rgba(60, 160, 255, 1)',
    colorHex: '#3ca0ff',
    colorSecondary: 'rgba(0, 240, 255, 0.6)',
    arcCount: 5,
    pulseWaveInterval: 1.8,
    dataRingSpeed: 25,
    particleDirection: 'pulse',
    particleSpeed: 1.5,
    hudRingOpacity: 0.45,
    energyArcIntensity: 0.6,
    statusLabel: 'SPEAKING',
  },
}

// ===== Pre-computed Data =====
function generateRingDefs() {
  return [
    { radius: 68, dashArray: '10 14', strokeWidth: 1.4, direction: 1, speedIdx: 0 },
    { radius: 58, dashArray: '5 10 14 10', strokeWidth: 0.9, direction: -1, speedIdx: 1 },
    { radius: 48, dashArray: '3 7 9 7', strokeWidth: 1.1, direction: 1, speedIdx: 2 },
    { radius: 38, dashArray: '16 6 6 6', strokeWidth: 0.7, direction: -1, speedIdx: 3 },
    { radius: 78, dashArray: '2 5 3 5 7 5', strokeWidth: 0.5, direction: -1, speedIdx: 4 },
    { radius: 28, dashArray: '7 4 3 4', strokeWidth: 0.8, direction: 1, speedIdx: 5 },
  ]
}

function generateDataChars() {
  const hexChars = '0123456789ABCDEF.:-|<>{}[]'
  return Array.from({ length: 40 }, (_, i) => ({
    id: i,
    angle: (i / 40) * 360,
    char: hexChars[(i * 7 + 3) % hexChars.length],
    fadeDuration: 2 + (i % 4),
    fadeDelay: i * 0.15,
  }))
}

function generateParticles() {
  return Array.from({ length: 14 }, (_, i) => ({
    id: i,
    angle: (i / 14) * 360,
    radius: 30 + ((i * 7 + 3) % 50),
    size: 1.2 + ((i * 3 + 2) % 20) / 10,
    speed: 5 + ((i * 5 + 1) % 6),
    opacity: 0.3 + ((i * 11 + 7) % 4) / 10,
    direction: i % 3 === 0 ? -1 : 1,
  }))
}

function generateHexagons() {
  const hexes: { id: number; cx: number; cy: number; points: string }[] = []
  const hexSize = 4.5
  const hGap = hexSize * 1.75
  const vGap = hexSize * 1.5
  for (let row = -2; row <= 2; row++) {
    for (let col = -2; col <= 2; col++) {
      const cx = col * hGap + (row % 2 !== 0 ? hGap / 2 : 0)
      const cy = row * vGap
      const dist = Math.sqrt(cx * cx + cy * cy)
      if (dist > 18) continue
      const points = Array.from({ length: 6 }, (_, i) => {
        const angle = (Math.PI / 3) * i - Math.PI / 6
        return `${cx + hexSize * Math.cos(angle)},${cy + hexSize * Math.sin(angle)}`
      }).join(' ')
      hexes.push({ id: hexes.length, cx, cy, points })
    }
  }
  return hexes
}

function generateHexOutline() {
  const hr = 9
  const hexPoints = Array.from({ length: 6 }, (_, i) => {
    const angle = (i * 60 - 30) * Math.PI / 180
    return `${Math.cos(angle) * hr},${Math.sin(angle) * hr}`
  }).join(' ')
  return `M ${hexPoints.replace(/ /g, ' L ')} Z`
}

function generateSpokes() {
  return Array.from({ length: 6 }, (_, i) => {
    const angle = (i * 60 - 30) * Math.PI / 180
    const ix = Math.cos(angle) * 4
    const iy = Math.sin(angle) * 4
    const ox = Math.cos(angle) * 9
    const oy = Math.sin(angle) * 9
    return { id: i, d: `M ${ix} ${iy} L ${ox} ${oy}` }
  })
}

function generateTickMarks() {
  return Array.from({ length: 72 }, (_, i) => ({
    id: i,
    angle: (i / 72) * 360,
    isMajor: i % 6 === 0,
  }))
}

function generateHUDArcs() {
  return [
    { id: 0, radius: 88, startAngle: -30, endAngle: 30, strokeWidth: 0.6, speed: 45, direction: 1 },
    { id: 1, radius: 92, startAngle: 120, endAngle: 180, strokeWidth: 0.4, speed: 55, direction: -1 },
    { id: 2, radius: 86, startAngle: 200, endAngle: 260, strokeWidth: 0.5, speed: 35, direction: 1 },
    { id: 3, radius: 95, startAngle: 60, endAngle: 100, strokeWidth: 0.3, speed: 65, direction: -1 },
  ]
}

function describeArc(radius: number, startAngle: number, endAngle: number): string {
  const startRad = (startAngle * Math.PI) / 180
  const endRad = (endAngle * Math.PI) / 180
  const x1 = Math.cos(startRad) * radius
  const y1 = Math.sin(startRad) * radius
  const x2 = Math.cos(endRad) * radius
  const y2 = Math.sin(endRad) * radius
  const largeArc = endAngle - startAngle > 180 ? 1 : 0
  return `M ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2}`
}

function generateEnergyArcs(count: number) {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    startRadius: 20 + (i % 3) * 15,
    endRadius: 40 + (i % 4) * 10,
    angle: (i * (360 / count)) * Math.PI / 180,
    delay: i * 0.2,
  }))
}

// ===== Sub-Components =====

function TickMarks({ colorPrimary }: { colorPrimary: string }) {
  const ticks = useMemo(() => generateTickMarks(), [])
  return (
    <g>
      {ticks.map((tick) => {
        const rad = (tick.angle * Math.PI) / 180
        const outerR = 85
        const innerR = tick.isMajor ? 80 : 83
        return (
          <line
            key={tick.id}
            x1={Math.cos(rad) * innerR}
            y1={Math.sin(rad) * innerR}
            x2={Math.cos(rad) * outerR}
            y2={Math.sin(rad) * outerR}
            stroke={colorPrimary}
            strokeOpacity={0.15}
            strokeWidth={tick.isMajor ? 0.8 : 0.4}
          />
        )
      })}
    </g>
  )
}

function HUDArcs({ config }: { config: typeof statusConfig[AIStatus] }) {
  const arcs = useMemo(() => generateHUDArcs(), [])
  return (
    <g>
      {arcs.map((arc) => (
        <g
          key={arc.id}
          style={{
            animation: arc.direction > 0
              ? `orb-rotate-cw ${arc.speed}s linear infinite`
              : `orb-rotate-ccw ${arc.speed}s linear infinite`,
            transformOrigin: 'center',
          }}
        >
          <path
            d={describeArc(arc.radius, arc.startAngle, arc.endAngle)}
            fill="none"
            stroke={config.colorPrimary}
            strokeWidth={arc.strokeWidth}
            strokeOpacity={config.hudRingOpacity}
            strokeLinecap="round"
          />
        </g>
      ))}
    </g>
  )
}

function EnergyArcs({ count, config }: { count: number; config: typeof statusConfig[AIStatus] }) {
  const arcs = useMemo(() => generateEnergyArcs(count), [count])
  return (
    <g>
      {arcs.map((arc) => (
        <motion.line
          key={arc.id}
          x1={Math.cos(arc.angle) * arc.startRadius}
          y1={Math.sin(arc.angle) * arc.startRadius}
          x2={Math.cos(arc.angle) * arc.endRadius}
          y2={Math.sin(arc.angle) * arc.endRadius}
          stroke={config.colorPrimary}
          strokeWidth={0.6}
          strokeOpacity={config.energyArcIntensity}
          strokeLinecap="round"
          animate={{
            strokeOpacity: [config.energyArcIntensity * 0.3, config.energyArcIntensity, config.energyArcIntensity * 0.3],
          }}
          transition={{
            duration: config.pulseDuration,
            repeat: Infinity,
            delay: arc.delay,
            ease: 'easeInOut',
          }}
        />
      ))}
    </g>
  )
}

// ===== Main Component =====

export default function JarvisOrb({ className }: { className?: string }) {
  const aiStatus = useJarvisStore((s) => s.aiStatus)
  const colorTheme = useJarvisStore((s) => s.colorTheme)
  const baseConfig = statusConfig[aiStatus]
  
  // Override colors based on theme for ALL states
  // Thinking uses a warm-shifted variant of the theme color
  // Speaking uses a lighter/brighter variant of the theme color
  const themeColor = themeColors[colorTheme] || themeColors.cyan
  const config = (() => {
    if (aiStatus === 'thinking') {
      // Thinking: blend theme primary with a warm orange shift
      return {
        ...baseConfig,
        colorPrimary: themeColor.primary, // Use theme color for thinking too
        colorHex: themeColor.hex,
        colorSecondary: themeColor.secondary,
      }
    }
    if (aiStatus === 'speaking') {
      // Speaking: use theme colors with a lighter secondary
      return {
        ...baseConfig,
        colorPrimary: themeColor.primary,
        colorHex: themeColor.hex,
        colorSecondary: themeColor.secondary,
      }
    }
    // Idle & Listening: full theme colors
    return {
      ...baseConfig,
      colorPrimary: themeColor.primary,
      colorHex: themeColor.hex,
      colorSecondary: themeColor.secondary,
    }
  })()

  const ringDefs = useMemo(() => generateRingDefs(), [])
  const dataChars = useMemo(() => generateDataChars(), [])
  const particles = useMemo(() => generateParticles(), [])
  const hexagons = useMemo(() => generateHexagons(), [])
  const hexOutlinePath = useMemo(() => generateHexOutline(), [])
  const spokes = useMemo(() => generateSpokes(), [])

  return (
    <div className={cn(
      'relative flex flex-col items-center justify-center w-full h-full select-none',
      className
    )}>
      {/* ===== Outer ambient glow ===== */}
      <motion.div
        className="absolute rounded-full pointer-events-none"
        style={{
          width: '180%',
          height: '180%',
          background: `radial-gradient(circle, ${config.colorPrimary.replace('1)', `${config.glowIntensity * 0.12})`)} 0%, ${config.colorSecondary.replace(/[\d.]+\)$/, `${config.glowIntensity * 0.05})`)} 30%, transparent 65%)`,
        }}
        animate={{
          scale: [1, 1.08, 1],
          opacity: [0.5, 0.8, 0.5],
        }}
        transition={{
          scale: { duration: config.pulseDuration * 2, repeat: Infinity, ease: 'easeInOut' },
          opacity: { duration: config.pulseDuration * 2.5, repeat: Infinity, ease: 'easeInOut' },
        }}
      />

      {/* ===== Secondary glow layer ===== */}
      <motion.div
        className="absolute rounded-full pointer-events-none neon-glow-cyan"
        style={{
          width: '140%',
          height: '140%',
          background: `radial-gradient(circle, ${config.colorPrimary.replace('1)', `${config.glowIntensity * 0.08})`)} 0%, transparent 50%)`,
        }}
        animate={{
          scale: config.pulseScale,
        }}
        transition={{
          duration: config.pulseDuration,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />

      {/* ===== Main SVG Orb ===== */}
      <motion.svg
        viewBox="-100 -100 200 200"
        className="w-[200px] h-[200px] sm:w-[240px] sm:h-[240px] md:w-[280px] md:h-[280px] lg:w-[300px] lg:h-[300px]"
        animate={{ scale: config.outerGlowScale }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        style={{ willChange: 'auto' }}
      >
        <defs>
          {/* Core radial gradient */}
          <radialGradient id="jarvis-core-grad" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor={config.colorPrimary} stopOpacity="0.7" />
            <stop offset="30%" stopColor={config.colorPrimary} stopOpacity="0.3" />
            <stop offset="60%" stopColor={config.colorSecondary} stopOpacity="0.12" />
            <stop offset="100%" stopColor={config.colorPrimary} stopOpacity="0" />
          </radialGradient>

          {/* Glow filter */}
          <filter id="jarvis-glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="2.5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          {/* Intense glow filter for core */}
          <filter id="jarvis-core-glow" x="-100%" y="-100%" width="300%" height="300%">
            <feGaussianBlur stdDeviation="4" result="blur1" />
            <feGaussianBlur in="SourceGraphic" stdDeviation="1.5" result="blur2" />
            <feMerge>
              <feMergeNode in="blur1" />
              <feMergeNode in="blur2" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          {/* Particle trail gradients */}
          {particles.map((p) => (
            <linearGradient key={`trail-${p.id}`} id={`jarvis-trail-${p.id}`} x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor={config.colorHex} stopOpacity={p.opacity * 0.6} />
              <stop offset="100%" stopColor={config.colorHex} stopOpacity="0" />
            </linearGradient>
          ))}
        </defs>

        {/* ===== HUD Arc Segments (outermost decorative) ===== */}
        <HUDArcs config={config} />

        {/* ===== Pulse Waves ===== */}
        <g>
          {[0, 1, 2, 3].map((i) => (
            <motion.circle
              key={`pulse-${i}`}
              cx={0}
              cy={0}
              r={8}
              fill="none"
              stroke={config.colorPrimary}
              strokeWidth={0.6}
              initial={{ scale: 0.2, opacity: 0.5 }}
              animate={{
                scale: [0.2, 10],
                opacity: [0.4 * config.glowIntensity, 0],
              }}
              transition={{
                duration: config.pulseWaveInterval * 2.5,
                repeat: Infinity,
                delay: i * (config.pulseWaveInterval * 2.5 / 4),
                ease: 'easeOut',
              }}
            />
          ))}
        </g>

        {/* ===== Core Glow Circle ===== */}
        <motion.circle
          cx={0}
          cy={0}
          r={30}
          fill="url(#jarvis-core-grad)"
          animate={{
            scale: [1, 1.06, 1],
            opacity: [0.7, 1, 0.7],
          }}
          transition={{
            duration: config.pulseDuration,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />

        {/* ===== Arc Reactor Core: Hexagonal Grid ===== */}
        <g opacity={0.5}>
          {hexagons.map((hex, i) => (
            <motion.polygon
              key={hex.id}
              points={hex.points}
              fill="none"
              stroke={config.colorPrimary}
              strokeWidth={0.3}
              animate={{
                strokeOpacity: [0.1, 0.4, 0.1],
                fillOpacity: [0, 0.08, 0],
              }}
              transition={{
                duration: config.pulseDuration * (0.7 + i * 0.12),
                repeat: Infinity,
                delay: i * 0.25,
                ease: 'easeInOut',
              }}
              style={{ transformOrigin: `${hex.cx}px ${hex.cy}px` }}
            />
          ))}
        </g>

        {/* ===== Hexagonal Outline ===== */}
        <motion.path
          d={hexOutlinePath}
          fill="none"
          stroke={config.colorPrimary}
          strokeWidth={0.7}
          animate={{
            strokeOpacity: [0.3, 0.7, 0.3],
            scale: [0.95, 1.05, 0.95],
          }}
          transition={{
            duration: config.pulseDuration,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          style={{ transformOrigin: 'center' }}
        />

        {/* ===== Triangular Spokes ===== */}
        <g stroke={config.colorPrimary} strokeWidth={0.4} strokeOpacity={0.35} fill="none">
          {spokes.map((spoke) => (
            <path key={spoke.id} d={spoke.d} />
          ))}
        </g>

        {/* ===== Inner Bright Core Point ===== */}
        <motion.circle
          cx={0}
          cy={0}
          r={3.5}
          fill={config.colorPrimary}
          filter="url(#jarvis-core-glow)"
          animate={{
            scale: [1, 1.4, 1],
            opacity: [0.85, 1, 0.85],
          }}
          transition={{
            duration: config.pulseDuration * 0.5,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />

        {/* ===== Rotating Rings ===== */}
        {ringDefs.map((ring, idx) => (
          <motion.circle
            key={`ring-${idx}`}
            cx={0}
            cy={0}
            r={ring.radius}
            fill="none"
            stroke={config.colorPrimary}
            strokeWidth={ring.strokeWidth}
            strokeDasharray={ring.dashArray}
            strokeOpacity={0.3 + config.glowIntensity * 0.35}
            strokeLinecap="round"
            animate={{
              rotate: ring.direction > 0 ? [0, 360] : [360, 0],
            }}
            transition={{
              duration: config.ringSpeeds[ring.speedIdx],
              repeat: Infinity,
              ease: 'linear',
            }}
            style={{ transformOrigin: 'center' }}
          />
        ))}

        {/* ===== Data Text Ring ===== */}
        <motion.g
          animate={{ rotate: [0, 360] }}
          transition={{
            duration: config.dataRingSpeed,
            repeat: Infinity,
            ease: 'linear',
          }}
          style={{ transformOrigin: 'center' }}
        >
          {dataChars.map((c) => {
            const rad = (c.angle * Math.PI) / 180
            const r = 74
            const x = Math.cos(rad) * r
            const y = Math.sin(rad) * r
            return (
              <motion.text
                key={c.id}
                x={x}
                y={y}
                fill={config.colorPrimary}
                fontSize="3.2"
                fontFamily="monospace"
                textAnchor="middle"
                dominantBaseline="central"
                animate={{
                  opacity: [0.08, 0.25, 0.08],
                }}
                transition={{
                  duration: c.fadeDuration,
                  repeat: Infinity,
                  delay: c.fadeDelay,
                  ease: 'easeInOut',
                }}
              >
                {c.char}
              </motion.text>
            )
          })}
        </motion.g>

        {/* ===== Tick Marks ===== */}
        <TickMarks colorPrimary={config.colorPrimary} />

        {/* ===== Energy Arcs ===== */}
        <EnergyArcs count={config.arcCount} config={config} />

        {/* ===== Orbital Particles with Trails ===== */}
        <g>
          {particles.map((p) => (
            <motion.g
              key={p.id}
              animate={{
                rotate: p.direction > 0 ? [0, 360] : [360, 0],
              }}
              transition={{
                duration: p.speed * (config.ringSpeeds[0] / 20) / config.particleSpeed,
                repeat: Infinity,
                ease: 'linear',
              }}
              style={{ transformOrigin: 'center' }}
            >
              {/* Particle dot */}
              <motion.circle
                cx={0}
                cy={-p.radius}
                r={p.size}
                fill={config.colorHex}
                filter="url(#jarvis-glow)"
                animate={
                  config.particleDirection === 'outward'
                    ? { cy: [-p.radius, -p.radius - 4, -p.radius] }
                    : config.particleDirection === 'pulse'
                      ? { r: [p.size, p.size * 1.6, p.size], opacity: [p.opacity, p.opacity * 1.5, p.opacity] }
                      : {}
                }
                transition={{
                  duration: config.pulseDuration * 1.5,
                  repeat: Infinity,
                  ease: 'easeInOut',
                  delay: p.id * 0.1,
                }}
                opacity={p.opacity}
              />
              {/* Particle trail */}
              <line
                x1={0}
                y1={-p.radius}
                x2={p.direction > 0 ? -8 : 8}
                y2={-p.radius}
                stroke={`url(#jarvis-trail-${p.id})`}
                strokeWidth={p.size * 0.6}
                strokeLinecap="round"
                opacity={p.opacity * 0.4}
              />
            </motion.g>
          ))}
        </g>

        {/* ===== Status-specific: Listening - expanding rings ===== */}
        <AnimatePresence>
          {aiStatus === 'listening' && (
            <>
              {[0, 1, 2].map((i) => (
                <motion.circle
                  key={`listen-ring-${i}`}
                  cx={0}
                  cy={0}
                  r={10}
                  fill="none"
                  stroke={config.colorPrimary}
                  strokeWidth={1}
                  initial={{ scale: 0.3, opacity: 0.6, strokeDasharray: '4 4' }}
                  animate={{
                    scale: [0.3, 12],
                    opacity: [0.6, 0],
                    strokeWidth: [1, 0.1],
                  }}
                  transition={{
                    duration: 2.5,
                    repeat: Infinity,
                    delay: i * 0.8,
                    ease: 'easeOut',
                  }}
                />
              ))}
            </>
          )}
        </AnimatePresence>

        {/* ===== Status-specific: Thinking - data stream particles ===== */}
        <AnimatePresence>
          {aiStatus === 'thinking' && (
            <>
              {Array.from({ length: 8 }, (_, i) => {
                const angle = (i / 8) * 360
                const rad = (angle * Math.PI) / 180
                return (
                  <motion.circle
                    key={`think-particle-${i}`}
                    cx={0}
                    cy={0}
                    r={1.5}
                    fill={config.colorHex}
                    filter="url(#jarvis-glow)"
                    initial={{ x: 0, y: 0, opacity: 0 }}
                    animate={{
                      x: [0, Math.cos(rad) * 70],
                      y: [0, Math.sin(rad) * 70],
                      opacity: [0.8, 0],
                    }}
                    transition={{
                      duration: 1.5,
                      repeat: Infinity,
                      delay: i * 0.18,
                      ease: 'easeOut',
                    }}
                  />
                )
              })}
            </>
          )}
        </AnimatePresence>

        {/* ===== Status-specific: Speaking - voice wave rings ===== */}
        <AnimatePresence>
          {aiStatus === 'speaking' && (
            <>
              {[0, 1, 2].map((i) => (
                <motion.circle
                  key={`speak-ring-${i}`}
                  cx={0}
                  cy={0}
                  r={20 + i * 10}
                  fill="none"
                  stroke={config.colorPrimary}
                  strokeWidth={0.8}
                  strokeDasharray="3 5"
                  animate={{
                    scale: [1, 1.15, 1],
                    opacity: [0.4, 0.15, 0.4],
                    strokeDashoffset: [0, -20],
                  }}
                  transition={{
                    duration: 1.2,
                    repeat: Infinity,
                    delay: i * 0.3,
                    ease: 'easeInOut',
                  }}
                />
              ))}
            </>
          )}
        </AnimatePresence>
      </motion.svg>

      {/* ===== Status Label below orb ===== */}
      <motion.div
        className="mt-4 sm:mt-6 select-none"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.5 }}
      >
        <AnimatePresence mode="wait">
          <motion.span
            key={config.statusLabel}
            className="text-[10px] sm:text-xs tracking-[0.35em] font-mono neon-text-cyan arc-reactor-glow"
            style={{ color: config.colorHex }}
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            transition={{ duration: 0.3 }}
          >
            {config.statusLabel}
          </motion.span>
        </AnimatePresence>
      </motion.div>
    </div>
  )
}
