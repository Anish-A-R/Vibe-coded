'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
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
  { text: '[J.A.R.V.I.S. SYSTEM v4.2.1]', delay: 0 },
  { text: 'Initializing neural networks...', delay: 400 },
  { text: 'Loading cognitive modules...', hasOk: true, delay: 750 },
  { text: 'Calibrating voice recognition...', hasOk: true, delay: 1100 },
  { text: 'Establishing secure connections...', hasOk: true, delay: 1500 },
  { text: 'Scanning environment...', hasOk: true, delay: 1900 },
  { text: 'Activating HUD interface...', hasOk: true, delay: 2300 },
  { text: 'Running diagnostics...', hasOk: true, delay: 2700 },
  { text: 'All systems operational.', delay: 3200 },
  { text: '', delay: 3500 },
  { text: 'Welcome back, sir.', delay: 3800 },
]

export default function BootSequence({ onComplete, onPhase, className }: BootSequenceProps) {
  const [visibleLines, setVisibleLines] = useState<number>(0)
  const [typedText, setTypedText] = useState<string>('')
  const [okMarkers, setOkMarkers] = useState<Set<number>>(new Set())
  const [showOk, setShowOk] = useState<number | null>(null)
  const [progress, setProgress] = useState(0)
  const [fadeOut, setFadeOut] = useState(false)
  const completedRef = useRef(false)

  const totalDuration = 4300

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
            'bg-jarvis-darker',
            className
          )}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8 }}
        >
          <div className="w-full max-w-xl px-6 sm:px-8 font-mono text-sm sm:text-base space-y-1.5">
            {BOOT_LINES.slice(0, visibleLines).map((line, index) => {
              const isCurrentLine = index === visibleLines - 1
              const showOkForLine = okMarkers.has(index)

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
                      'whitespace-pre',
                      line.text === 'Welcome back, sir.'
                        ? 'neon-text-cyan text-neon-cyan font-bold text-lg sm:text-xl mt-2'
                        : 'text-neon-cyan/80'
                    )}
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

          {/* Progress bar */}
          <div className="w-full max-w-xl px-6 sm:px-8 mt-8">
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
            <div className="mt-2 text-[10px] font-mono text-neon-cyan/40 text-right">
              {Math.round(progress)}%
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
