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
}> = {
  idle: {
    ringSpeed: [20, 30, 40, 25],
    pulseScale: [1, 1.05],
    pulseDuration: 3,
    glowIntensity: 0.4,
    coreScale: 1,
    outerScale: 1,
    colorShift: 'rgba(0, 240, 255, 1)',
  },
  listening: {
    ringSpeed: [8, 12, 15, 10],
    pulseScale: [1, 1.12],
    pulseDuration: 1.2,
    glowIntensity: 0.8,
    coreScale: 1.05,
    outerScale: 1.08,
    colorShift: 'rgba(0, 240, 255, 1)',
  },
  thinking: {
    ringSpeed: [3, 5, 7, 4],
    pulseScale: [1, 1.08],
    pulseDuration: 0.8,
    glowIntensity: 1,
    coreScale: 1.02,
    outerScale: 1,
    colorShift: 'rgba(100, 200, 255, 1)',
  },
  speaking: {
    ringSpeed: [10, 16, 12, 14],
    pulseScale: [1, 1.1],
    pulseDuration: 1.5,
    glowIntensity: 0.7,
    coreScale: 1.03,
    outerScale: 1.04,
    colorShift: 'rgba(0, 180, 255, 1)',
  },
}

// Orbital particles around the orb
function OrbParticles({ status }: { status: AIStatus }) {
  const config = statusConfig[status]
  const particles = useMemo(() => {
    return Array.from({ length: 8 }, (_, i) => ({
      id: i,
      angle: (i / 8) * 360,
      radius: 58 + Math.random() * 12,
      size: 1.5 + Math.random() * 1.5,
      speed: 6 + Math.random() * 4,
      opacity: 0.3 + Math.random() * 0.3,
    }))
  }, [])

  return (
    <g>
      {particles.map((p) => (
        <motion.circle
          key={p.id}
          cx={0}
          cy={-p.radius}
          r={p.size}
          fill={`rgba(0, 240, 255, ${p.opacity})`}
          style={{
            filter: `drop-shadow(0 0 ${p.size * 2}px rgba(0, 240, 255, ${p.opacity * 0.5}))`,
          }}
          animate={{
            rotate: [p.angle, p.angle + 360],
          }}
          transition={{
            duration: p.speed * (config.ringSpeed[0] / 20),
            repeat: Infinity,
            ease: 'linear',
          }}
        />
      ))}
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
    ],
    []
  )

  return (
    <div className={cn('relative flex items-center justify-center', className)}>
      {/* Outer glow */}
      <motion.div
        className="absolute rounded-full"
        style={{
          width: '120%',
          height: '120%',
          background: `radial-gradient(circle, rgba(0, 240, 255, ${config.glowIntensity * 0.15}) 0%, transparent 70%)`,
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
        viewBox="-80 -80 160 160"
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
        </defs>

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

        {/* Inner bright core */}
        <motion.circle
          cx={0}
          cy={0}
          r={6}
          fill={config.colorShift}
          style={{ filter: 'url(#orbGlow)' }}
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.9, 1, 0.9],
          }}
          transition={{
            duration: config.pulseDuration * 0.8,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />

        {/* Rotating rings */}
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

        {/* Orbital particles */}
        <OrbParticles status={status} />
      </motion.svg>
    </div>
  )
}
