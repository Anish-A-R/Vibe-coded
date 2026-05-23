'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

// ===== Component Props =====
interface KonamiEffectProps {
  active: boolean
  onComplete: () => void
}

// ===== Expanding Ring Component =====
function ExpandingRing({ delay, duration }: { delay: number; duration: number }) {
  return (
    <motion.div
      className="absolute top-1/2 left-1/2 rounded-full border-2 border-neon-cyan/60"
      style={{ boxShadow: '0 0 20px rgba(0,240,255,0.3), 0 0 40px rgba(0,240,255,0.1)' }}
      initial={{ width: 0, height: 0, x: '-50%', y: '-50%', opacity: 1 }}
      animate={{
        width: [0, 300, 600, 900],
        height: [0, 300, 600, 900],
        opacity: [0.8, 0.5, 0.2, 0],
      }}
      transition={{
        duration,
        delay,
        ease: 'easeOut',
      }}
    />
  )
}

// ===== Arc Reactor SVG =====
function ArcReactor() {
  return (
    <motion.svg
      width="300"
      height="300"
      viewBox="-150 -150 300 300"
      className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
      initial={{ opacity: 0, scale: 0 }}
      animate={{ opacity: [0, 0.6, 0.4], scale: [0.5, 1.2, 1] }}
      transition={{ duration: 1.5, ease: 'easeOut' }}
    >
      {/* Outer ring */}
      <motion.circle
        cx="0" cy="0" r="130"
        fill="none" stroke="rgba(0,240,255,0.15)" strokeWidth="1"
        animate={{ rotate: 360 }}
        transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
        style={{ transformOrigin: 'center' }}
      />

      {/* Hexagonal core */}
      <polygon
        points="0,-60 52,-30 52,30 0,60 -52,30 -52,-30"
        fill="none"
        stroke="rgba(0,240,255,0.3)"
        strokeWidth="2"
      />

      {/* Inner hex */}
      <polygon
        points="0,-35 30,-17.5 30,17.5 0,35 -30,17.5 -30,-17.5"
        fill="rgba(0,240,255,0.05)"
        stroke="rgba(0,240,255,0.4)"
        strokeWidth="1.5"
      />

      {/* Triangular spokes */}
      {[0, 60, 120, 180, 240, 300].map((angle) => (
        <line
          key={angle}
          x1="0" y1="0"
          x2={Math.cos((angle * Math.PI) / 180) * 55}
          y2={Math.sin((angle * Math.PI) / 180) * 55}
          stroke="rgba(0,240,255,0.25)"
          strokeWidth="1"
        />
      ))}

      {/* Center glow */}
      <motion.circle
        cx="0" cy="0" r="15"
        fill="rgba(0,240,255,0.15)"
        stroke="rgba(0,240,255,0.6)"
        strokeWidth="2"
        animate={{
          r: [12, 18, 12],
          opacity: [0.6, 1, 0.6],
        }}
        transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* Inner glow */}
      <circle cx="0" cy="0" r="8" fill="rgba(0,240,255,0.4)" />
    </motion.svg>
  )
}

// ===== Typewriter Text =====
function TypewriterText({ text, delay }: { text: string; delay: number }) {
  const [displayed, setDisplayed] = useState('')
  const [started, setStarted] = useState(false)

  useEffect(() => {
    const startTimer = setTimeout(() => setStarted(true), delay * 1000)
    return () => clearTimeout(startTimer)
  }, [delay])

  useEffect(() => {
    if (!started) return
    let idx = 0
    const interval = setInterval(() => {
      idx++
      setDisplayed(text.slice(0, idx))
      if (idx >= text.length) clearInterval(interval)
    }, 80)
    return () => clearInterval(interval)
  }, [started, text])

  if (!started) return null

  return (
    <div
      className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2
        font-mono text-3xl sm:text-4xl md:text-5xl tracking-[0.3em] text-neon-cyan font-bold
        whitespace-nowrap"
      style={{
        textShadow: '0 0 20px rgba(0,240,255,0.6), 0 0 40px rgba(0,240,255,0.3), 0 0 80px rgba(0,240,255,0.15)',
      }}
    >
      {displayed}
      <motion.span
        animate={{ opacity: [1, 0] }}
        transition={{ duration: 0.5, repeat: Infinity, repeatType: 'reverse' }}
        className="inline-block w-[3px] h-[1em] bg-neon-cyan ml-1 align-middle"
        style={{ boxShadow: '0 0 8px rgba(0,240,255,0.5)' }}
      />
    </div>
  )
}

// ===== Main Component =====
export default function KonamiEffect({ active, onComplete }: KonamiEffectProps) {
  // Track whether we're in the "displaying" phase (active was true and 4s hasn't elapsed)
  const displayingRef = useRef(false)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // When active becomes true, start the display timer
  useEffect(() => {
    if (active && !displayingRef.current) {
      displayingRef.current = true
      timerRef.current = setTimeout(() => {
        displayingRef.current = false
        timerRef.current = null
        onComplete()
      }, 4000)
    }
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current)
      }
    }
  }, [active, onComplete])

  // The effect is visible when active is true OR when we're still in the displaying phase
  // We use active as the render trigger since the parent controls it via onComplete
  return (
    <AnimatePresence>
      {active && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="fixed inset-0 z-[90] flex items-center justify-center pointer-events-none"
        >
          {/* Full screen flash */}
          <motion.div
            className="absolute inset-0 bg-neon-cyan/20"
            initial={{ opacity: 1 }}
            animate={{ opacity: [1, 0] }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          />

          {/* Dark overlay */}
          <div className="absolute inset-0 bg-black/60" />

          {/* Expanding concentric rings */}
          {[0, 0.3, 0.6, 0.9, 1.2].map((delay, i) => (
            <ExpandingRing key={i} delay={delay} duration={2.5} />
          ))}

          {/* Arc Reactor SVG */}
          <ArcReactor />

          {/* Typewriter text */}
          <TypewriterText text="I AM IRON MAN" delay={0.8} />

          {/* Fade out everything near the end */}
          <motion.div
            className="absolute inset-0 bg-black"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0, 0.8] }}
            transition={{ duration: 3.5, ease: 'easeIn' }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  )
}
