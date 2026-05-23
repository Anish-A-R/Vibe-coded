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

// Tick marks around outermost ring (static, no animation)
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

  // Pre-compute data text ring characters
  const dataChars = useMemo(() => {
    const hexChars = '0123456789ABCDEF.:-|<>{}[]'
    return Array.from({ length: 36 }, (_, i) => ({
      id: i,
      angle: (i / 36) * 360,
      char: hexChars[(i * 7 + 3) % hexChars.length],
    }))
  }, [])

  // Pre-compute particle positions
  const particles = useMemo(() => {
    return Array.from({ length: 6 }, (_, i) => ({
      id: i,
      angle: (i / 6) * 360,
      radius: 58 + ((i * 7 + 3) % 12),
      size: 1.5 + ((i * 3 + 2) % 15) / 10,
      speed: 6 + ((i * 5 + 1) % 4),
      opacity: 0.3 + ((i * 11 + 7) % 3) / 10,
    }))
  }, [])

  // Pre-compute hexagonal grid
  const hexagons = useMemo(() => {
    const hexes: { id: number; cx: number; cy: number; points: string }[] = []
    const hexSize = 4
    const hGap = hexSize * 1.75
    const vGap = hexSize * 1.5
    const rows = 3
    const cols = 3
    for (let row = -Math.floor(rows / 2); row <= Math.floor(rows / 2); row++) {
      for (let col = -Math.floor(cols / 2); col <= Math.floor(cols / 2); col++) {
        const cx = col * hGap + (row % 2 !== 0 ? hGap / 2 : 0)
        const cy = row * vGap
        const dist = Math.sqrt(cx * cx + cy * cy)
        if (dist > 16) continue
        const points = Array.from({ length: 6 }, (_, i) => {
          const angle = (Math.PI / 3) * i - Math.PI / 6
          return `${cx + hexSize * Math.cos(angle)},${cy + hexSize * Math.sin(angle)}`
        }).join(' ')
        hexes.push({ id: hexes.length, cx, cy, points })
      }
    }
    return hexes
  }, [])

  // Hexagonal core outline path
  const hexOutlinePath = useMemo(() => {
    const hr = 8
    const hexPoints = Array.from({ length: 6 }, (_, i) => {
      const angle = (i * 60 - 30) * Math.PI / 180
      return `${Math.cos(angle) * hr},${Math.sin(angle) * hr}`
    }).join(' ')
    return `M ${hexPoints.replace(/ /g, ' L ')} Z`
  }, [])

  // Spoke paths
  const spokes = useMemo(() => {
    return Array.from({ length: 6 }, (_, i) => {
      const angle = (i * 60 - 30) * Math.PI / 180
      const ix = Math.cos(angle) * 3
      const iy = Math.sin(angle) * 3
      const ox = Math.cos(angle) * 8
      const oy = Math.sin(angle) * 8
      return { id: i, d: `M ${ix} ${iy} L ${ox} ${oy}` }
    })
  }, [])

  return (
    <div className={cn('relative flex items-center justify-center', className)}>
      {/* Outer glow - single motion.div */}
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
        style={{ willChange: 'auto' }}
      >
        <defs>
          <radialGradient id="coreGradient" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor={config.colorShift} stopOpacity="0.6" />
            <stop offset="60%" stopColor={config.colorShift} stopOpacity="0.15" />
            <stop offset="100%" stopColor={config.colorShift} stopOpacity="0" />
          </radialGradient>
          {/* Single glow filter - lightweight */}
          <filter id="orbGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="2" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Pulse waves - CSS animated via style attribute */}
        <g>
          {[0, 1, 2].map((i) => (
            <circle
              key={`pulse-${i}`}
              cx={0}
              cy={0}
              r={10}
              fill="none"
              stroke={config.colorShift}
              strokeWidth={0.5}
              style={{
                animation: `orb-pulse-wave ${config.pulseWaveInterval * 2}s ease-out ${i * (config.pulseWaveInterval * 2 / 3)}s infinite`,
                opacity: 0,
                transformOrigin: 'center',
              }}
            />
          ))}
        </g>

        {/* Core glow */}
        <circle
          cx={0}
          cy={0}
          r={28}
          fill="url(#coreGradient)"
          style={{
            animation: `orb-core-pulse ${config.pulseDuration}s ease-in-out infinite`,
            transformOrigin: 'center',
          }}
        />

        {/* Arc reactor core - hexagonal grid (static SVG, no animation) */}
        <g opacity={0.5}>
          {hexagons.map((hex, i) => (
            <polygon
              key={hex.id}
              points={hex.points}
              fill="none"
              stroke={config.colorShift}
              strokeWidth={0.3}
              strokeOpacity={0.3}
              style={{
                animation: `orb-hex-fade ${config.pulseDuration * (0.8 + i * 0.15)}s ease-in-out ${i * 0.2}s infinite`,
                transformOrigin: `${hex.cx}px ${hex.cy}px`,
              }}
            />
          ))}
        </g>

        {/* Hexagonal outline */}
        <path
          d={hexOutlinePath}
          fill="none"
          stroke={config.colorShift}
          strokeWidth={0.6}
          strokeOpacity={0.5}
          style={{
            animation: `orb-hex-outline ${config.pulseDuration}s ease-in-out infinite`,
            transformOrigin: 'center',
          }}
        />

        {/* Triangular spokes (static, no individual animation) */}
        <g stroke={config.colorShift} strokeWidth={0.4} strokeOpacity={0.35} fill="none">
          {spokes.map((spoke) => (
            <path key={spoke.id} d={spoke.d} />
          ))}
        </g>

        {/* Inner bright circle of the reactor */}
        <circle
          cx={0}
          cy={0}
          r={3}
          fill={config.colorShift}
          style={{
            animation: `orb-core-breathe ${config.pulseDuration * 0.6}s ease-in-out infinite`,
            transformOrigin: 'center',
          }}
        />

        {/* Rotating rings - CSS animations */}
        {ringDefs.map((ring, idx) => (
          <circle
            key={`ring-${idx}`}
            cx={0}
            cy={0}
            r={ring.radius}
            fill="none"
            stroke={config.colorShift}
            strokeWidth={ring.strokeWidth}
            strokeDasharray={ring.dashArray}
            strokeOpacity={0.4 + config.glowIntensity * 0.3}
            strokeLinecap="round"
            style={{
              animation: ring.direction > 0
                ? `orb-rotate-cw ${config.ringSpeed[ring.speedIdx]}s linear infinite`
                : `orb-rotate-ccw ${config.ringSpeed[ring.speedIdx]}s linear infinite`,
              transformOrigin: 'center',
            }}
          />
        ))}

        {/* Data text ring - rotating with CSS, static characters */}
        <g style={{
          animation: `orb-rotate-cw ${config.dataRingSpeed}s linear infinite`,
          transformOrigin: 'center',
        }}>
          {dataChars.map((c) => {
            const rad = (c.angle * Math.PI) / 180
            const r = 72
            const x = Math.cos(rad) * r
            const y = Math.sin(rad) * r
            return (
              <text
                key={c.id}
                x={x}
                y={y}
                fill={config.colorShift}
                fontSize="3.5"
                fontFamily="monospace"
                textAnchor="middle"
                dominantBaseline="central"
                opacity={0.15}
              >
                {c.char}
              </text>
            )
          })}
        </g>

        {/* Tick marks around outermost ring */}
        <TickMarks />

        {/* Orbital particles - CSS animated */}
        <g>
          {particles.map((p) => (
            <g
              key={p.id}
              style={{
                animation: `orb-rotate-cw ${p.speed * (config.ringSpeed[0] / 20)}s linear infinite`,
                transformOrigin: 'center',
              }}
            >
              <circle
                cx={0}
                cy={-p.radius}
                r={p.size}
                fill={config.colorShift}
                opacity={p.opacity}
              />
            </g>
          ))}
        </g>
      </motion.svg>
    </div>
  )
}
