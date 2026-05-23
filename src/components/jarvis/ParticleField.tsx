'use client'

import { useEffect, useRef, useCallback } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface ParticleFieldProps {
  enabled?: boolean
  className?: string
}

interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  size: number
  opacity: number
  depth: number // 0.3 to 1.0 for parallax
  color: string
}

interface ShootingStar {
  x: number
  y: number
  vx: number
  vy: number
  life: number
  maxLife: number
  length: number
}

const CONNECTION_DISTANCE = 150
const PARTICLE_COUNT = 80
const MOUSE_RADIUS = 120
const MOUSE_FORCE = 0.5

export default function ParticleField({ enabled = true, className }: ParticleFieldProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationRef = useRef<number>(0)
  const particlesRef = useRef<Particle[]>([])
  const shootingStarsRef = useRef<ShootingStar[]>([])
  const mouseRef = useRef({ x: -1000, y: -1000 })
  const sizeRef = useRef({ w: 0, h: 0 })

  const createParticle = useCallback((w: number, h: number): Particle => {
    const isOrange = Math.random() < 0.1
    const depth = 0.3 + Math.random() * 0.7
    return {
      x: Math.random() * w,
      y: Math.random() * h,
      vx: (Math.random() - 0.5) * 0.3 * depth,
      vy: -0.1 - Math.random() * 0.4 * depth,
      size: Math.max(0.5, 1 + Math.random() * 2) * depth,
      opacity: 0.1 + Math.random() * 0.4,
      depth,
      color: isOrange ? '255, 106, 0' : '0, 240, 255',
    }
  }, [])

  const createShootingStar = useCallback((w: number, h: number): ShootingStar => {
    const fromLeft = Math.random() > 0.5
    return {
      x: fromLeft ? -10 : w + 10,
      y: Math.random() * h * 0.5,
      vx: fromLeft ? 4 + Math.random() * 6 : -(4 + Math.random() * 6),
      vy: 2 + Math.random() * 3,
      life: 0,
      maxLife: 60 + Math.random() * 40,
      length: 20 + Math.random() * 30,
    }
  }, [])

  const initParticles = useCallback(() => {
    const w = sizeRef.current.w
    const h = sizeRef.current.h
    particlesRef.current = Array.from({ length: PARTICLE_COUNT }, () => createParticle(w, h))
  }, [createParticle])

  useEffect(() => {
    if (!enabled) return

    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const resizeCanvas = () => {
      const dpr = window.devicePixelRatio || 1
      const w = window.innerWidth
      const h = window.innerHeight
      canvas.width = w * dpr
      canvas.height = h * dpr
      canvas.style.width = `${w}px`
      canvas.style.height = `${h}px`
      ctx.scale(dpr, dpr)
      sizeRef.current = { w, h }
    }

    resizeCanvas()
    initParticles()

    const handleResize = () => {
      resizeCanvas()
      // Re-scatter particles on resize
      particlesRef.current.forEach((p) => {
        p.x = Math.random() * sizeRef.current.w
        p.y = Math.random() * sizeRef.current.h
      })
    }

    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY }
    }

    const handleMouseLeave = () => {
      mouseRef.current = { x: -1000, y: -1000 }
    }

    window.addEventListener('resize', handleResize)
    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseleave', handleMouseLeave)

    let frameCount = 0

    const render = () => {
      const { w, h } = sizeRef.current
      ctx.clearRect(0, 0, w, h)

      const particles = particlesRef.current
      const shootingStars = shootingStarsRef.current
      const mouse = mouseRef.current
      frameCount++

      // Spawn shooting stars occasionally
      if (frameCount % 180 === 0 && shootingStars.length < 3) {
        shootingStars.push(createShootingStar(w, h))
      }

      // Update and draw particles
      for (const p of particles) {
        // Mouse interaction - repel
        const dx = p.x - mouse.x
        const dy = p.y - mouse.y
        const dist = Math.sqrt(dx * dx + dy * dy)
        if (dist < MOUSE_RADIUS && dist > 0) {
          const force = (1 - dist / MOUSE_RADIUS) * MOUSE_FORCE
          p.vx += (dx / dist) * force * p.depth
          p.vy += (dy / dist) * force * p.depth
        }

        // Apply velocity with parallax depth
        p.x += p.vx
        p.y += p.vy

        // Gentle upward drift
        p.vy -= 0.002 * p.depth

        // Damping
        p.vx *= 0.99
        p.vy *= 0.99

        // Wrap around edges
        if (p.y < -10) { p.y = h + 10; p.x = Math.random() * w }
        if (p.y > h + 10) { p.y = -10; p.x = Math.random() * w }
        if (p.x < -10) p.x = w + 10
        if (p.x > w + 10) p.x = -10

        // Draw particle
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(${p.color}, ${p.opacity})`
        ctx.fill()

        // Draw glow
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.size * 2.5, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(${p.color}, ${p.opacity * 0.15})`
        ctx.fill()
      }

      // Draw connection lines between nearby particles
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const a = particles[i]
          const b = particles[j]
          const dx = a.x - b.x
          const dy = a.y - b.y
          const dist = Math.sqrt(dx * dx + dy * dy)
          if (dist < CONNECTION_DISTANCE) {
            const alpha = (1 - dist / CONNECTION_DISTANCE) * 0.15 * Math.min(a.opacity, b.opacity)
            ctx.beginPath()
            ctx.moveTo(a.x, a.y)
            ctx.lineTo(b.x, b.y)
            ctx.strokeStyle = `rgba(0, 240, 255, ${alpha})`
            ctx.lineWidth = 0.5
            ctx.stroke()
          }
        }
      }

      // Update and draw shooting stars
      for (let i = shootingStars.length - 1; i >= 0; i--) {
        const s = shootingStars[i]
        s.x += s.vx
        s.y += s.vy
        s.life++

        const progress = s.life / s.maxLife
        const opacity = progress < 0.2 ? progress * 5 : progress > 0.8 ? (1 - progress) * 5 : 1

        if (s.life >= s.maxLife) {
          shootingStars.splice(i, 1)
          continue
        }

        // Draw shooting star trail
        const tailX = s.x - (s.vx / Math.sqrt(s.vx * s.vx + s.vy * s.vy)) * s.length
        const tailY = s.y - (s.vy / Math.sqrt(s.vx * s.vx + s.vy * s.vy)) * s.length

        const gradient = ctx.createLinearGradient(tailX, tailY, s.x, s.y)
        gradient.addColorStop(0, `rgba(0, 240, 255, 0)`)
        gradient.addColorStop(1, `rgba(0, 240, 255, ${opacity * 0.8})`)

        ctx.beginPath()
        ctx.moveTo(tailX, tailY)
        ctx.lineTo(s.x, s.y)
        ctx.strokeStyle = gradient
        ctx.lineWidth = 1.5
        ctx.stroke()

        // Bright head
        ctx.beginPath()
        ctx.arc(s.x, s.y, 2, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(200, 255, 255, ${opacity})`
        ctx.fill()
      }

      animationRef.current = requestAnimationFrame(render)
    }

    animationRef.current = requestAnimationFrame(render)

    return () => {
      cancelAnimationFrame(animationRef.current)
      window.removeEventListener('resize', handleResize)
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseleave', handleMouseLeave)
    }
  }, [enabled, createParticle, createShootingStar, initParticles])

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
          <canvas
            ref={canvasRef}
            className="absolute inset-0"
            style={{ width: '100%', height: '100%' }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  )
}
