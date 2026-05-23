'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Target, Play, Pause, RotateCcw } from 'lucide-react'
import { useJarvisStore } from '@/hooks/useJarvisStore'

type TimerMode = 'focus' | 'shortBreak' | 'longBreak'

const MODE_CONFIG: Record<TimerMode, { label: string; minutes: number }> = {
  focus: { label: 'Focus', minutes: 25 },
  shortBreak: { label: 'Short', minutes: 5 },
  longBreak: { label: 'Long', minutes: 15 },
}

export default function FocusTimerWidget() {
  const { focusTimerSessions, setFocusTimerSessions } = useJarvisStore()
  const [mode, setMode] = useState<TimerMode>('focus')
  const [timeLeft, setTimeLeft] = useState(MODE_CONFIG.focus.minutes * 60)
  const [isRunning, setIsRunning] = useState(false)
  const [isComplete, setIsComplete] = useState(false)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const audioRef = useRef<AudioContext | null>(null)

  const totalSeconds = MODE_CONFIG[mode].minutes * 60
  const progress = 1 - timeLeft / totalSeconds

  const playCompleteSound = useCallback(() => {
    try {
      const ctx = audioRef.current || new AudioContext()
      audioRef.current = ctx
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.type = 'sine'
      osc.frequency.setValueAtTime(880, ctx.currentTime)
      osc.frequency.setValueAtTime(1100, ctx.currentTime + 0.15)
      osc.frequency.setValueAtTime(1320, ctx.currentTime + 0.3)
      gain.gain.setValueAtTime(0.15, ctx.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.6)
      osc.start(ctx.currentTime)
      osc.stop(ctx.currentTime + 0.6)
    } catch {
      // Audio not available
    }
  }, [])

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            setIsRunning(false)
            setIsComplete(true)
            playCompleteSound()
            setFocusTimerSessions((s: number) => mode === 'focus' ? s + 1 : s)
            return 0
          }
          return prev - 1
        })
      }, 1000)
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [isRunning, mode, playCompleteSound, setFocusTimerSessions])

  // Reset complete state after 3s
  useEffect(() => {
    if (isComplete) {
      const timeout = setTimeout(() => setIsComplete(false), 3000)
      return () => clearTimeout(timeout)
    }
  }, [isComplete])

  const handleModeChange = (newMode: TimerMode) => {
    setMode(newMode)
    setTimeLeft(MODE_CONFIG[newMode].minutes * 60)
    setIsRunning(false)
    setIsComplete(false)
  }

  const handleToggle = () => {
    if (isComplete) {
      setTimeLeft(MODE_CONFIG[mode].minutes * 60)
      setIsComplete(false)
    }
    setIsRunning(!isRunning)
  }

  const handleReset = () => {
    setIsRunning(false)
    setTimeLeft(MODE_CONFIG[mode].minutes * 60)
    setIsComplete(false)
  }

  const minutes = Math.floor(timeLeft / 60)
    .toString()
    .padStart(2, '0')
  const seconds = (timeLeft % 60).toString().padStart(2, '0')

  // SVG ring
  const radius = 42
  const circumference = 2 * Math.PI * radius
  const strokeDashoffset = circumference * (1 - progress)

  const currentSession = (focusTimerSessions % 4) + 1

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="relative overflow-hidden rounded-xl border border-cyan-500/20 bg-black/40 backdrop-blur-xl glass-panel holo-border-cyan inner-glow-cyan"
    >
      {/* Corner accents */}
      <div className="absolute top-0 left-0 h-4 w-4 border-t border-l border-cyan-500/40 z-[2]" />
      <div className="absolute top-0 right-0 h-4 w-4 border-t border-r border-cyan-500/40 z-[2]" />
      <div className="absolute bottom-0 left-0 h-4 w-4 border-b border-l border-cyan-500/40 z-[2]" />
      <div className="absolute bottom-0 right-0 h-4 w-4 border-b border-r border-cyan-500/40 z-[2]" />

      <div className="p-4 relative z-[2]">
        {/* Header */}
        <div className="flex items-center gap-2 mb-3">
          <Target className="size-4 text-cyan-400/70" />
          <h3 className="text-xs font-mono font-semibold text-cyan-400/80 tracking-widest uppercase">
            Focus Timer
          </h3>
        </div>

        {/* Mode selector */}
        <div className="flex gap-1 mb-4">
          {(Object.keys(MODE_CONFIG) as TimerMode[]).map((m) => (
            <button
              key={m}
              onClick={() => handleModeChange(m)}
              className={`flex-1 text-[10px] font-mono py-1 px-2 rounded-md transition-all duration-200 ${
                mode === m
                  ? 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/30'
                  : 'text-white/30 hover:text-white/50 border border-transparent hover:border-white/5'
              }`}
            >
              {MODE_CONFIG[m].label}
            </button>
          ))}
        </div>

        {/* Timer ring */}
        <div className="flex justify-center mb-3">
          <div className="relative gauge-breathe">
            <svg width="100" height="100" viewBox="0 0 100 100" className="transform -rotate-90">
              {/* Background ring */}
              <circle
                cx="50"
                cy="50"
                r={radius}
                stroke="rgba(0, 240, 255, 0.08)"
                strokeWidth="4"
                fill="none"
              />
              {/* Progress ring */}
              <motion.circle
                cx="50"
                cy="50"
                r={radius}
                stroke={isComplete ? '#00ff88' : '#00f0ff'}
                strokeWidth="4"
                fill="none"
                strokeLinecap="round"
                strokeDasharray={circumference}
                initial={{ strokeDashoffset: circumference }}
                animate={{
                  strokeDashoffset,
                  filter: isComplete
                    ? 'drop-shadow(0 0 12px rgba(0, 255, 136, 0.8))'
                    : 'drop-shadow(0 0 6px rgba(0, 240, 255, 0.5))',
                }}
                transition={{ duration: 0.5, ease: 'linear' }}
              />
              {/* Completion glow ring */}
              <AnimatePresence>
                {isComplete && (
                  <motion.circle
                    cx="50"
                    cy="50"
                    r={radius}
                    stroke="#00ff88"
                    strokeWidth="8"
                    fill="none"
                    initial={{ opacity: 0.8 }}
                    animate={{ opacity: [0.8, 0.2, 0.8] }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 1, repeat: Infinity }}
                    strokeDasharray={circumference}
                    strokeDashoffset={0}
                  />
                )}
              </AnimatePresence>
            </svg>
            {/* Center time */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span
                className="text-xl font-mono font-bold tracking-wider text-cyan-400"
                style={{ textShadow: '0 0 10px rgba(0, 240, 255, 0.4)' }}
              >
                {minutes}:{seconds}
              </span>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center gap-3 mb-3">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={handleToggle}
            className="size-9 flex items-center justify-center rounded-full border border-cyan-500/30 text-cyan-400/70 hover:bg-cyan-500/10 hover:text-cyan-400 transition-colors"
            aria-label={isRunning ? 'Pause timer' : 'Start timer'}
          >
            {isRunning ? <Pause className="size-4" /> : <Play className="size-4 ml-0.5" />}
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={handleReset}
            className="size-9 flex items-center justify-center rounded-full border border-white/10 text-white/40 hover:bg-white/5 hover:text-white/60 transition-colors"
            aria-label="Reset timer"
          >
            <RotateCcw className="size-4" />
          </motion.button>
        </div>

        {/* Session counter */}
        <div className="text-center text-[10px] font-mono text-white/30">
          Session {currentSession} of 4
        </div>
      </div>
    </motion.div>
  )
}
