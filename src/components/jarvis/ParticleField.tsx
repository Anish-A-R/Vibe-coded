'use client'

import { useEffect, useMemo, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'

interface ParticleFieldProps {
  enabled?: boolean
  className?: string
}

interface Particle {
  id: number
  x: number
  y: number
  size: number
  duration: number
  delay: number
  drift: number
  opacity: number
  color: string
}

function generateParticles(count: number): Particle[] {
  const particles: Particle[] = []
  for (let i = 0; i < count; i++) {
    const isOrange = Math.random() < 0.1
    particles.push({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 3 + 1,
      duration: Math.random() * 15 + 10,
      delay: Math.random() * -20,
      drift: (Math.random() - 0.5) * 30,
      opacity: Math.random() * 0.4 + 0.1,
      color: isOrange
        ? 'rgba(255, 106, 0, OPACITY)'
        : 'rgba(0, 240, 255, OPACITY)',
    })
  }
  return particles
}

export default function ParticleField({ enabled = true, className }: ParticleFieldProps) {
  const particles = useMemo(() => generateParticles(70), [])

  return (
    <AnimatePresence>
      {enabled && (
        <motion.div
          className={cn(
            'pointer-events-none absolute inset-0 overflow-hidden',
            className
          )}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1 }}
        >
          {particles.map((p) => (
            <motion.div
              key={p.id}
              className="absolute rounded-full"
              style={{
                left: `${p.x}%`,
                bottom: `-${p.size + 5}%`,
                width: p.size,
                height: p.size,
                background: p.color.replace('OPACITY', String(p.opacity)),
                boxShadow: `0 0 ${p.size * 3}px ${p.color.replace('OPACITY', String(p.opacity * 0.6))}, 0 0 ${p.size * 6}px ${p.color.replace('OPACITY', String(p.opacity * 0.3))}`,
                willChange: 'transform',
              }}
              animate={{
                y: [0, -(typeof window !== 'undefined' ? window.innerHeight + 50 : 1100)],
                x: [0, p.drift],
              }}
              transition={{
                duration: p.duration,
                delay: p.delay,
                repeat: Infinity,
                ease: 'linear',
              }}
            />
          ))}
        </motion.div>
      )}
    </AnimatePresence>
  )
}
