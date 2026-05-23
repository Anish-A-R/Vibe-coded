'use client'

import { useMemo } from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import type { AIStatus } from '@/hooks/useJarvisStore'

interface CircularOrbProps {
  status?: AIStatus
  className?: string
}

const statusConfig: Record<AIStatus, {
  ringSpeed: number[]
  pulseScale: number[]
  pulseDuration: number
  glowIntensity: number
  coreScale: number
  outerScale: number
  colorShift: string
  colorHex: string
  arcCount: number
  pulseWaveInterval: number
  dataRingSpeed: number
  particleDirection: 'orbit' | 'outward'
}> = {
  idle: {
    ringSpeed: [20, 30, 40, 25, 35, 18],
    pulseScale: [1, 1.05],
    pulseDuration: 3,
    glowIntensity: 0.4,
    coreScale: 1,
    outerScale: 1,
    colorShift: 'rgba(0, 240, 255, 1)',
    colorHex: '#00f0ff',
    arcCount: 3,
    pulseWaveInterval: 4,
    dataRingSpeed: 60,
    particleDirection: 'orbit',
  },
  listening: {
    ringSpeed: [8, 12, 15, 10, 14, 9],
    pulseScale: [1, 1.12],
    pulseDuration: 1.2,
    glowIntensity: 0.8,
    coreScale: 1.05,
    outerScale: 1.08,
    colorShift: 'rgba(0, 240, 255, 1)',
    colorHex: '#00f0ff',
    arcCount: 6,
    pulseWaveInterval: 1.5,
    dataRingSpeed: 25,
    particleDirection: 'orbit',
  },
  thinking: {
    ringSpeed: [3, 5, 7, 4, 6, 3],
    pulseScale: [1, 1.08],
    pulseDuration: 0.8,
    glowIntensity: 1,
    coreScale: 1.02,
    outerScale: 1,
    colorShift: 'rgba(255, 140, 50, 1)',
    colorHex: '#ff8c32',
    arcCount: 8,
    pulseWaveInterval: 0.8,
    dataRingSpeed: 12,
    particleDirection: 'orbit',
  },
  speaking: {
    ringSpeed: [10, 16, 12, 14, 11, 13],
    pulseScale: [1, 1.1],
    pulseDuration: 1.5,
    glowIntensity: 0.7,
    coreScale: 1.03,
    outerScale: 1.04,
    colorShift: 'rgba(60, 160, 255, 1)',
    colorHex: '#3ca0ff',
    arcCount: 5,
    pulseWaveInterval: 2,
    dataRingSpeed: 20,
    particleDirection: 'outward',
  },
}

// Hexagonal grid core pattern
function HexagonalGridCore({ status }: { status: AIStatus }) {
  const config = statusConfig[status]
  const hexagons = useMemo(() => {
    const hexes: { id: number; cx: number; cy: number; size: number; points: string }[] = []
    const hexSize = 4
    const hGap = hexSize * 1.75
    const vGap = hexSize * 1.5

    // Generate a small grid of hexagons centered at 0,0
    const rows = 3
    const cols = 3
    for (let row = -Math.floor(rows / 2); row <= Math.floor(rows / 2); row++) {
      for (let col = -Math.floor(cols / 2); col <= Math.floor(cols / 2); col++) {
        const cx = col * hGap + (row % 2 !== 0 ? hGap / 2 : 0)
        const cy = row * vGap
        const dist = Math.sqrt(cx * cx + cy * cy)
        if (dist > 16) continue // Stay within inner area

        const points = Array.from({ length: 6 }, (_, i) => {
          const angle = (Math.PI / 3) * i - Math.PI / 6
          return `${cx + hexSize * Math.cos(angle)},${cy + hexSize * Math.sin(angle)}`
        }).join(' ')

        hexes.push({
          id: hexes.length,
          cx,
          cy,
          size: hexSize,
          points,
        })
      }
    }
    return hexes
  }, [])

  return (
    <g>
      {hexagons.map((hex, i) => (
        <motion.polygon
          key={hex.id}
          points={hex.points}
          fill="none"
          stroke={config.colorShift}
          strokeWidth={0.3}
          strokeOpacity={0.3}
          animate={{
            fillOpacity: [0, 0.12, 0],
            strokeOpacity: [0.2, 0.5, 0.2],
          }}
          transition={{
            duration: config.pulseDuration * (0.8 + i * 0.15),
            repeat: Infinity,
            ease: 'easeInOut',
            delay: i * 0.2,
          }}
        />
      ))}
    </g>
  )
}

// Arc reactor core - hexagonal/triangular pattern with inner hex grid
function ArcReactorCore({ status }: { status: AIStatus }) {
  const config = statusConfig[status]

  // Generate hexagonal pattern paths
  const hexPaths = useMemo(() => {
    const paths: { id: number; d: string }[] = []
    // Inner hexagon
    const hr = 8
    const hexPoints = Array.from({ length: 6 }, (_, i) => {
      const angle = (i * 60 - 30) * Math.PI / 180
      return `${Math.cos(angle) * hr},${Math.sin(angle) * hr}`
    }).join(' ')
    paths.push({ id: 0, d: `M ${hexPoints.replace(/ /g, ' L ')} Z` })

    // Triangular spokes from center to hex vertices
    for (let i = 0; i < 6; i++) {
      const angle = (i * 60 - 30) * Math.PI / 180
      const ix = Math.cos(angle) * 3
      const iy = Math.sin(angle) * 3
      const ox = Math.cos(angle) * hr
      const oy = Math.sin(angle) * hr
      paths.push({ id: i + 1, d: `M ${ix} ${iy} L ${ox} ${oy}` })
    }

    paths.push({ id: 7, d: '' })
    return paths
  }, [])

  return (
    <g>
      {/* Hexagonal grid core */}
      <HexagonalGridCore status={status} />

      {/* Hexagonal outline */}
      <motion.path
        d={hexPaths[0].d}
        fill="none"
        stroke={config.colorShift}
        strokeWidth={0.6}
        strokeOpacity={0.5}
        style={{ filter: 'url(#orbGlow)' }}
        animate={{
          opacity: [0.4, 0.8, 0.4],
          scale: [0.95, 1.05, 0.95],
        }}
        transition={{
          duration: config.pulseDuration,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />

      {/* Triangular spokes */}
      {hexPaths.slice(1, 7).map((spoke) => (
        <motion.path
          key={spoke.id}
          d={spoke.d}
          fill="none"
          stroke={config.colorShift}
          strokeWidth={0.4}
          strokeOpacity={0.35}
          animate={{ opacity: [0.2, 0.5, 0.2] }}
          transition={{
            duration: config.pulseDuration * 0.7,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: spoke.id * 0.1,
          }}
        />
      ))}

      {/* Inner bright circle of the reactor */}
      <motion.circle
        cx={0}
        cy={0}
        r={3}
        fill={config.colorShift}
        style={{ filter: 'url(#orbGlow)' }}
        animate={{
          scale: [1, 1.3, 1],
          opacity: [0.9, 1, 0.9],
        }}
        transition={{
          duration: config.pulseDuration * 0.6,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
    </g>
  )
}

// Data text ring with hex characters that fade in and out
function DataTextRing({ status }: { status: AIStatus }) {
  const config = statusConfig[status]
  const chars = useMemo(() => {
    const hexChars = '0123456789ABCDEF.:-|<>{}[]'
    return Array.from({ length: 36 }, (_, i) => ({
      id: i,
      angle: (i / 36) * 360,
      char: hexChars[(i * 7 + 3) % hexChars.length], // Deterministic to avoid hydration mismatch
      fadeDelay: (i * 0.11) % 4, // Deterministic pseudo-random
      fadeDuration: 2 + (i * 0.17) % 3,
    }))
  }, [])

  return (
    <motion.g
      animate={{ rotate: [0, 360] }}
      transition={{
        duration: config.dataRingSpeed,
        repeat: Infinity,
        ease: 'linear',
      }}
    >
      {chars.map((c) => {
        const rad = (c.angle * Math.PI) / 180
        const r = 72
        const x = Math.cos(rad) * r
        const y = Math.sin(rad) * r
        return (
          <motion.text
            key={c.id}
            x={x}
            y={y}
            fill={config.colorShift}
            fontSize="3.5"
            fontFamily="monospace"
            textAnchor="middle"
            dominantBaseline="central"
            animate={{
              opacity: [0.05, 0.4, 0.05],
            }}
            transition={{
              duration: c.fadeDuration,
              delay: c.fadeDelay,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          >
            {c.char}
          </motion.text>
        )
      })}
    </motion.g>
  )
}

// Energy arcs between rings
function EnergyArcs({ status }: { status: AIStatus }) {
  const config = statusConfig[status]
  const arcs = useMemo(() => {
    return Array.from({ length: config.arcCount }, (_, i) => {
      // Deterministic pseudo-random to avoid hydration mismatch
      const startAngle = (i / config.arcCount) * 360 + ((i * 7 + 3) % 30)
      const sweep = 15 + ((i * 13 + 7) % 25)
      const innerR = 30 + ((i * 11 + 5) % 15)
      const outerR = innerR + 10 + ((i * 17 + 3) % 20)
      const duration = 0.4 + ((i * 3 + 2) % 6) / 10
      const delay = ((i * 5 + 1) % 20) / 10
      return { id: i, startAngle, sweep, innerR, outerR, duration, delay }
    })
  }, [config.arcCount])

  return (
    <g>
      {arcs.map((arc) => {
        const startRad = (arc.startAngle * Math.PI) / 180
        const sweepRad = (arc.sweep * Math.PI) / 180
        const endRad = startRad + sweepRad
        const midR = (arc.innerR + arc.outerR) / 2
        const sx = Math.cos(startRad) * midR
        const sy = Math.sin(startRad) * midR
        const ex = Math.cos(endRad) * midR
        const ey = Math.sin(endRad) * midR
        const cpx = Math.cos(startRad + sweepRad / 2) * arc.outerR
        const cpy = Math.sin(startRad + sweepRad / 2) * arc.outerR
        const pathD = `M ${sx} ${sy} Q ${cpx} ${cpy} ${ex} ${ey}`

        return (
          <motion.path
            key={arc.id}
            d={pathD}
            fill="none"
            stroke={config.colorShift}
            strokeWidth={0.8}
            strokeLinecap="round"
            style={{ filter: 'url(#orbGlow)' }}
            initial={{ opacity: 0, pathLength: 0 }}
            animate={{
              opacity: [0, 0.8, 0.8, 0],
              pathLength: [0, 1, 1, 0],
            }}
            transition={{
              duration: arc.duration * (config.ringSpeed[0] / 20),
              delay: arc.delay,
              repeat: Infinity,
              repeatDelay: 1 + Math.random() * 3,
              ease: 'easeInOut',
            }}
          />
        )
      })}
    </g>
  )
}

// Pulse waves expanding from core
function PulseWaves({ status }: { status: AIStatus }) {
  const config = statusConfig[status]
  const waveCount = 3

  return (
    <g>
      {Array.from({ length: waveCount }).map((_, i) => (
        <motion.circle
          key={i}
          cx={0}
          cy={0}
          r={10}
          fill="none"
          stroke={config.colorShift}
          strokeWidth={0.5}
          strokeOpacity={0.3}
          initial={{ scale: 0.3, opacity: 0.5 }}
          animate={{
            scale: [0.3, 8],
            opacity: [0.4 * config.glowIntensity, 0],
          }}
          transition={{
            duration: config.pulseWaveInterval * 2,
            delay: i * (config.pulseWaveInterval * 2 / waveCount),
            repeat: Infinity,
            ease: 'easeOut',
          }}
        />
      ))}
    </g>
  )
}

// Orbital particles with gradient trail lines
function OrbParticles({ status }: { status: AIStatus }) {
  const config = statusConfig[status]
  const particles = useMemo(() => {
    return Array.from({ length: 8 }, (_, i) => ({
      id: i,
      angle: (i / 8) * 360,
      radius: 58 + ((i * 7 + 3) % 12), // Deterministic to avoid hydration mismatch
      size: 1.5 + ((i * 3 + 2) % 15) / 10,
      speed: 6 + ((i * 5 + 1) % 4),
      opacity: 0.3 + ((i * 11 + 7) % 3) / 10,
    }))
  }, [])

  return (
    <g>
      {particles.map((p) => {
        const isOutward = config.particleDirection === 'outward'
        return (
          <g key={p.id}>
            {/* Gradient trail line */}
            <motion.line
              x1={0}
              y1={-p.radius}
              x2={0}
              y2={-p.radius + (isOutward ? -8 : 8)}
              stroke={`url(#trailGradient${p.id})`}
              strokeWidth={p.size * 0.8}
              strokeLinecap="round"
              animate={{
                rotate: [p.angle - 8, p.angle + 352],
              }}
              transition={{
                duration: p.speed * (config.ringSpeed[0] / 20),
                repeat: Infinity,
                ease: 'linear',
              }}
            />
            {/* Particle dot */}
            <motion.circle
              cx={0}
              cy={-p.radius}
              r={p.size}
              fill={config.colorShift}
              style={{
                filter: `drop-shadow(0 0 ${p.size * 2}px ${config.colorShift})`,
              }}
              animate={{
                rotate: [p.angle, p.angle + 360],
                ...(isOutward
                  ? { r: [p.size, p.size * 2.5, p.size] }
                  : {}),
              }}
              transition={{
                rotate: {
                  duration: p.speed * (config.ringSpeed[0] / 20),
                  repeat: Infinity,
                  ease: 'linear',
                },
                ...(isOutward
                  ? {
                      r: {
                        duration: config.pulseDuration,
                        repeat: Infinity,
                        ease: 'easeInOut',
                      },
                    }
                  : {}),
              }}
            />
          </g>
        )
      })}
    </g>
  )
}

// Tick marks around outermost ring
function TickMarks() {
  const ticks = useMemo(() => {
    return Array.from({ length: 60 }, (_, i) => ({
      id: i,
      angle: (i / 60) * 360,
      isMajor: i % 5 === 0,
    }))
  }, [])

  return (
    <g>
      {ticks.map((tick) => {
        const rad = (tick.angle * Math.PI) / 180
        const outerR = 82
        const innerR = tick.isMajor ? 78 : 80
        const x1 = Math.cos(rad) * innerR
        const y1 = Math.sin(rad) * innerR
        const x2 = Math.cos(rad) * outerR
        const y2 = Math.sin(rad) * outerR
        return (
          <line
            key={tick.id}
            x1={x1}
            y1={y1}
            x2={x2}
            y2={y2}
            stroke="rgba(0, 240, 255, 0.2)"
            strokeWidth={tick.isMajor ? 0.8 : 0.4}
          />
        )
      })}
    </g>
  )
}

export default function CircularOrb({ status = 'idle', className }: CircularOrbProps) {
  const config = statusConfig[status]

  const ringDefs = useMemo(
    () => [
      { radius: 65, dashArray: '8 12', strokeWidth: 1.2, direction: 1, speedIdx: 0 },
      { radius: 55, dashArray: '4 8 12 8', strokeWidth: 0.8, direction: -1, speedIdx: 1 },
      { radius: 45, dashArray: '2 6 8 6', strokeWidth: 1.0, direction: 1, speedIdx: 2 },
      { radius: 35, dashArray: '15 5 5 5', strokeWidth: 0.6, direction: -1, speedIdx: 3 },
      { radius: 75, dashArray: '1 4 2 4 6 4', strokeWidth: 0.5, direction: -1, speedIdx: 4 },
      { radius: 25, dashArray: '6 3 2 3', strokeWidth: 0.7, direction: 1, speedIdx: 5 },
    ],
    []
  )

  // Generate gradient definitions for particle trails
  const trailGradients = useMemo(() => {
    return Array.from({ length: 8 }, (_, i) => ({
      id: `trailGradient${i}`,
    }))
  }, [])

  return (
    <div className={cn('relative flex items-center justify-center', className)}>
      {/* Outer glow */}
      <motion.div
        className="absolute rounded-full"
        style={{
          width: '120%',
          height: '120%',
          background: `radial-gradient(circle, ${config.colorShift.replace('1)', `${config.glowIntensity * 0.15})`)} 0%, transparent 70%)`,
        }}
        animate={{
          scale: config.pulseScale,
          opacity: [0.6, 1, 0.6],
        }}
        transition={{
          scale: { duration: config.pulseDuration, repeat: Infinity, ease: 'easeInOut' },
          opacity: { duration: config.pulseDuration * 1.5, repeat: Infinity, ease: 'easeInOut' },
        }}
      />

      <motion.svg
        viewBox="-90 -90 180 180"
        className="w-[200px] h-[200px] sm:w-[250px] sm:h-[250px] md:w-[280px] md:h-[280px]"
        animate={{ scale: config.outerScale }}
        transition={{ duration: 0.5 }}
      >
        <defs>
          <radialGradient id="coreGradient" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor={config.colorShift} stopOpacity="0.6" />
            <stop offset="60%" stopColor={config.colorShift} stopOpacity="0.15" />
            <stop offset="100%" stopColor={config.colorShift} stopOpacity="0" />
          </radialGradient>
          <filter id="orbGlow">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          {/* Trail gradients for each particle */}
          {trailGradients.map((g) => (
            <linearGradient key={g.id} id={g.id} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={config.colorHex} stopOpacity="0.4" />
              <stop offset="100%" stopColor={config.colorHex} stopOpacity="0" />
            </linearGradient>
          ))}
        </defs>

        {/* Pulse waves */}
        <PulseWaves status={status} />

        {/* Core glow */}
        <motion.circle
          cx={0}
          cy={0}
          r={28}
          fill="url(#coreGradient)"
          animate={{
            scale: config.pulseScale.map((s) => s * config.coreScale),
            opacity: [0.8, 1, 0.8],
          }}
          transition={{
            scale: { duration: config.pulseDuration, repeat: Infinity, ease: 'easeInOut' },
            opacity: { duration: config.pulseDuration, repeat: Infinity, ease: 'easeInOut' },
          }}
        />

        {/* Arc reactor core with hexagonal grid */}
        <ArcReactorCore status={status} />

        {/* Rotating rings - 6 total */}
        {ringDefs.map((ring, idx) => (
          <motion.circle
            key={idx}
            cx={0}
            cy={0}
            r={ring.radius}
            fill="none"
            stroke={config.colorShift}
            strokeWidth={ring.strokeWidth}
            strokeDasharray={ring.dashArray}
            strokeOpacity={0.4 + config.glowIntensity * 0.3}
            strokeLinecap="round"
            style={{ filter: 'url(#orbGlow)' }}
            animate={{
              rotate: ring.direction > 0 ? [0, 360] : [360, 0],
            }}
            transition={{
              duration: config.ringSpeed[ring.speedIdx],
              repeat: Infinity,
              ease: 'linear',
            }}
          />
        ))}

        {/* Energy arcs */}
        <EnergyArcs status={status} />

        {/* Data text ring with animated fading */}
        <DataTextRing status={status} />

        {/* Tick marks around outermost ring */}
        <TickMarks />

        {/* Orbital particles with gradient trails */}
        <OrbParticles status={status} />
      </motion.svg>
    </div>
  )
}
