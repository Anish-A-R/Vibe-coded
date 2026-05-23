'use client'

import { useState, useEffect, useCallback, useRef, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'

interface BootSequenceProps {
  onComplete: () => void
  onPhase?: (phase: number) => void
  className?: string
}

interface BootLine {
  text: string
  hasOk?: boolean
  delay: number
}

const BOOT_LINES: BootLine[] = [
  { text: '[J.A.R.V.I.S. SYSTEM v4.2.1]', delay: 1400 }, // delayed for scan animation
  { text: 'Initializing neural networks...', delay: 1800 },
  { text: 'Loading cognitive modules...', hasOk: true, delay: 2150 },
  { text: 'Calibrating voice recognition...', hasOk: true, delay: 2500 },
  { text: 'Establishing secure connections...', hasOk: true, delay: 2900 },
  { text: 'Scanning environment...', hasOk: true, delay: 3300 },
  { text: 'Activating HUD interface...', hasOk: true, delay: 3700 },
  { text: 'Running diagnostics...', hasOk: true, delay: 4100 },
  { text: 'All systems operational.', delay: 4600 },
  { text: '', delay: 4900 },
  { text: 'Welcome back, sir.', delay: 5200 },
]

// Pre-generated hex characters to avoid hydration mismatch with Math.random()
const HEX_CHARS = '0123456789ABCDEF'

function generateHexStream(charsPerColumn: number, seed: number): string {
  // Deterministic hex generation using seed to avoid hydration mismatch
  const chars: string[] = []
  for (let i = 0; i < charsPerColumn; i++) {
    // Use a simple deterministic sequence instead of Math.random()
    chars.push(HEX_CHARS[(seed + i * 7 + i * i * 3) % 16])
  }
  return chars.join('\n')
}

// Hex data stream component - renders scrolling hex characters on the sides
function HexDataStream({ side }: { side: 'left' | 'right' }) {
  const columns = 3
  const charsPerColumn = 30

  const streams = useMemo(() => {
    const baseSeed = side === 'left' ? 0 : 50
    return Array.from({ length: columns }, (_, colIdx) =>
      generateHexStream(charsPerColumn, baseSeed + colIdx * 17)
    )
  }, [side])

  return (
    <div
      className={cn(
        'absolute top-0 bottom-0 flex gap-3 overflow-hidden pointer-events-none',
        side === 'left' ? 'left-2 sm:left-4' : 'right-2 sm:right-4'
      )}
    >
      {streams.map((stream, i) => (
        <div
          key={i}
          className="font-mono text-[8px] sm:text-[9px] leading-[14px] text-neon-cyan/8 whitespace-pre animate-data-scroll"
          style={{
            animationDuration: `${8 + i * 2}s`,
            animationDelay: `${i * 0.5}s`,
          }}
        >
          {stream}
          {stream}
        </div>
      ))}
    </div>
  )
}

// Circular progress ring SVG component
function ProgressRing({ progress, size = 120 }: { progress: number; size?: number }) {
  const strokeWidth = 3
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (progress / 100) * circumference

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg
        width={size}
        height={size}
        className="transform -rotate-90"
        viewBox={`0 0 ${size} ${size}`}
      >
        {/* Background ring */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgba(0, 240, 255, 0.08)"
          strokeWidth={strokeWidth}
        />
        {/* Progress arc */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgba(0, 240, 255, 0.6)"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{
            transition: 'stroke-dashoffset 0.1s ease',
            filter: 'drop-shadow(0 0 4px rgba(0, 240, 255, 0.4))',
          }}
        />
        {/* Tick marks */}
        {Array.from({ length: 12 }).map((_, i) => {
          const angle = (i * 30 * Math.PI) / 180
          const innerR = radius - 8
          const outerR = radius - 4
          return (
            <line
              key={i}
              x1={size / 2 + innerR * Math.cos(angle)}
              y1={size / 2 + innerR * Math.sin(angle)}
              x2={size / 2 + outerR * Math.cos(angle)}
              y2={size / 2 + outerR * Math.sin(angle)}
              stroke="rgba(0, 240, 255, 0.15)"
              strokeWidth={1}
            />
          )
        })}
      </svg>
      {/* Center text */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-lg font-mono text-neon-cyan font-bold neon-text-cyan">
          {Math.round(progress)}%
        </span>
        <span className="text-[7px] font-mono text-neon-cyan/30 uppercase tracking-wider mt-0.5">
          Boot
        </span>
      </div>
    </div>
  )
}

// Radar scan animation component
function RadarScan() {
  return (
    <motion.div
      className="absolute inset-0 flex items-center justify-center pointer-events-none"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      {/* Expanding rings */}
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className="absolute rounded-full border border-neon-cyan/20"
          initial={{ width: 0, height: 0, opacity: 0.6 }}
          animate={{
            width: [0, 300 + i * 80],
            height: [0, 300 + i * 80],
            opacity: [0.6, 0],
          }}
          transition={{
            duration: 1.2,
            delay: i * 0.15,
            ease: 'easeOut',
          }}
        />
      ))}
      {/* Center pulse */}
      <motion.div
        className="absolute w-4 h-4 rounded-full bg-neon-cyan/40"
        initial={{ scale: 0, opacity: 1 }}
        animate={{ scale: [0, 1, 0.8], opacity: [1, 0.6, 0] }}
        transition={{ duration: 1, ease: 'easeOut' }}
      />
      {/* Rotating scan line */}
      <motion.div
        className="absolute w-[1px] h-[150px] origin-bottom"
        style={{
          background: 'linear-gradient(to top, rgba(0,240,255,0.3), transparent)',
        }}
        initial={{ rotate: 0, opacity: 0 }}
        animate={{ rotate: 360, opacity: [0, 0.8, 0] }}
        transition={{ duration: 1.2, ease: 'easeOut' }}
      />
    </motion.div>
  )
}

// Hexagonal grid background
function HexGrid() {
  const hexSize = 30
  const cols = 40
  const rows = 30

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-[0.03]">
      <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern
            id="hex-pattern"
            width={hexSize * 1.732}
            height={hexSize * 2}
            patternUnits="userSpaceOnUse"
            patternTransform="scale(1)"
          >
            <polygon
              points={`${hexSize * 0.866},0 ${hexSize * 1.732},${hexSize * 0.5} ${hexSize * 1.732},${hexSize * 1.5} ${hexSize * 0.866},${hexSize * 2} 0,${hexSize * 1.5} 0,${hexSize * 0.5}`}
              fill="none"
              stroke="rgba(0, 240, 255, 1)"
              strokeWidth="0.5"
            />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#hex-pattern)" />
      </svg>
    </div>
  )
}

export default function BootSequence({ onComplete, onPhase, className }: BootSequenceProps) {
  const [visibleLines, setVisibleLines] = useState<number>(0)
  const [typedText, setTypedText] = useState<string>('')
  const [okMarkers, setOkMarkers] = useState<Set<number>>(new Set())
  const [showOk, setShowOk] = useState<number | null>(null)
  const [progress, setProgress] = useState(0)
  const [fadeOut, setFadeOut] = useState(false)
  const [showScan, setShowScan] = useState(true)
  const [showWelcomeFlash, setShowWelcomeFlash] = useState(false)
  const completedRef = useRef(false)

  const totalDuration = 5700 // Adjusted for scan delay

  // Hide scan after 1.2 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowScan(false)
    }, 1200)
    return () => clearTimeout(timer)
  }, [])

  // Progress bar
  useEffect(() => {
    const startTime = Date.now()
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime
      const pct = Math.min((elapsed / totalDuration) * 100, 100)
      setProgress(pct)
      if (pct >= 100) clearInterval(interval)
    }, 50)
    return () => clearInterval(interval)
  }, [totalDuration])

  // Reveal lines one by one
  useEffect(() => {
    const timers: NodeJS.Timeout[] = []

    BOOT_LINES.forEach((line, index) => {
      const timer = setTimeout(() => {
        setVisibleLines(index + 1)

        if (onPhase) onPhase(index)

        // Typewriter effect for the current line
        if (line.text) {
          let charIndex = 0
          const typeTimer = setInterval(() => {
            charIndex++
            setTypedText(line.text.slice(0, charIndex))
            if (charIndex >= line.text.length) {
              clearInterval(typeTimer)
              // Show [OK] marker after text is typed
              if (line.hasOk) {
                setTimeout(() => {
                  setShowOk(index)
                  setOkMarkers((prev) => new Set(prev).add(index))
                }, 150)
              }
              // Welcome flash effect
              if (line.text === 'Welcome back, sir.') {
                setShowWelcomeFlash(true)
                setTimeout(() => setShowWelcomeFlash(false), 1200)
              }
            }
          }, 18)
          timers.push(typeTimer as unknown as NodeJS.Timeout)
        } else {
          setTypedText('')
        }
      }, line.delay)

      timers.push(timer)
    })

    return () => timers.forEach(clearTimeout)
  }, [onPhase])

  // Trigger fade out and completion
  useEffect(() => {
    const fadeTimer = setTimeout(() => {
      setFadeOut(true)
    }, totalDuration + 800)

    const completeTimer = setTimeout(() => {
      if (!completedRef.current) {
        completedRef.current = true
        onComplete()
      }
    }, totalDuration + 1800)

    return () => {
      clearTimeout(fadeTimer)
      clearTimeout(completeTimer)
    }
  }, [onComplete, totalDuration])

  return (
    <AnimatePresence>
      {!fadeOut && (
        <motion.div
          className={cn(
            'fixed inset-0 z-50 flex flex-col items-center justify-center',
            'bg-jarvis-darker overflow-hidden',
            className
          )}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8 }}
        >
          {/* Hex grid background */}
          <HexGrid />

          {/* Data stream effect - left side */}
          <HexDataStream side="left" />
          {/* Data stream effect - right side */}
          <HexDataStream side="right" />

          {/* Radar scan animation (first 1.2 seconds) */}
          <AnimatePresence>
            {showScan && <RadarScan />}
          </AnimatePresence>

          {/* Welcome flash overlay */}
          <AnimatePresence>
            {showWelcomeFlash && (
              <motion.div
                className="absolute inset-0 pointer-events-none z-20"
                initial={{ opacity: 0 }}
                animate={{
                  opacity: [0, 0.8, 0.3, 0],
                  background: [
                    'radial-gradient(circle at center, rgba(0,240,255,0) 0%, rgba(0,240,255,0) 100%)',
                    'radial-gradient(circle at center, rgba(0,240,255,0.4) 0%, rgba(0,240,255,0.1) 50%, rgba(0,240,255,0) 100%)',
                    'radial-gradient(circle at center, rgba(0,240,255,0.15) 0%, rgba(0,240,255,0.05) 60%, rgba(0,240,255,0) 100%)',
                    'radial-gradient(circle at center, rgba(0,240,255,0) 0%, rgba(0,240,255,0) 100%)',
                  ],
                }}
                transition={{ duration: 1.2, ease: 'easeOut' }}
              />
            )}
          </AnimatePresence>

          {/* Main content area */}
          <div className="flex items-center gap-8 sm:gap-12 relative z-10">
            {/* Boot text */}
            <div className="w-full max-w-md px-4 sm:px-6 font-mono text-sm sm:text-base space-y-1.5">
              {BOOT_LINES.slice(0, visibleLines).map((line, index) => {
                const isCurrentLine = index === visibleLines - 1
                const showOkForLine = okMarkers.has(index)
                const isWelcome = line.text === 'Welcome back, sir.'

                return (
                  <motion.div
                    key={index}
                    className="flex items-center gap-2"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <span
                      className={cn(
                        'whitespace-pre transition-all duration-500',
                        isWelcome
                          ? 'neon-text-cyan text-neon-cyan font-bold text-lg sm:text-xl mt-2'
                          : 'text-neon-cyan/80'
                      )}
                      style={
                        isWelcome && showWelcomeFlash
                          ? {
                              textShadow: [
                                '0 0 7px rgba(0, 240, 255, 0.6), 0 0 20px rgba(0, 240, 255, 0.3), 0 0 40px rgba(0, 240, 255, 0.1)',
                                '0 0 10px rgba(0, 240, 255, 1), 0 0 30px rgba(0, 240, 255, 0.8), 0 0 60px rgba(0, 240, 255, 0.5), 0 0 100px rgba(0, 240, 255, 0.3)',
                                '0 0 7px rgba(0, 240, 255, 0.6), 0 0 20px rgba(0, 240, 255, 0.3), 0 0 40px rgba(0, 240, 255, 0.1)',
                              ].join(', '),
                              color: '#00f0ff',
                            }
                          : undefined
                      }
                    >
                      {isCurrentLine ? typedText : line.text}
                      {isCurrentLine && line.text && typedText.length < line.text.length && (
                        <span className="typing-cursor ml-0.5">&nbsp;</span>
                      )}
                    </span>

                    {showOkForLine && (
                      <motion.span
                        className="text-neon-green text-xs sm:text-sm font-bold"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.2 }}
                      >
                        [OK]
                      </motion.span>
                    )}
                  </motion.div>
                )
              })}
            </div>

            {/* Progress ring */}
            <div className="hidden sm:flex flex-shrink-0">
              <ProgressRing progress={progress} size={120} />
            </div>
          </div>

          {/* Progress bar */}
          <div className="w-full max-w-xl px-6 sm:px-8 mt-8 relative z-10">
            <div className="h-[2px] w-full bg-neon-cyan/10 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-neon-cyan rounded-full"
                style={{
                  boxShadow: '0 0 8px rgba(0, 240, 255, 0.5), 0 0 16px rgba(0, 240, 255, 0.2)',
                }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.1 }}
              />
            </div>
            <div className="mt-2 text-[10px] font-mono text-neon-cyan/40 text-right sm:hidden">
              {Math.round(progress)}%
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
