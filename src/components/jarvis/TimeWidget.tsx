'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'

export default function TimeWidget() {
  const [time, setTime] = useState(new Date())

  useEffect(() => {
    const interval = setInterval(() => {
      setTime(new Date())
    }, 1000)
    return () => clearInterval(interval)
  }, [])

  const hours = time.getHours().toString().padStart(2, '0')
  const minutes = time.getMinutes().toString().padStart(2, '0')
  const seconds = time.getSeconds().toString().padStart(2, '0')
  const secondsProgress = time.getSeconds() / 60

  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']

  const dayOfWeek = dayNames[time.getDay()]
  const month = monthNames[time.getMonth()]
  const date = time.getDate()
  const year = time.getFullYear()

  // SVG arc for seconds progress
  const radius = 40
  const circumference = 2 * Math.PI * radius
  const strokeDashoffset = circumference * (1 - secondsProgress)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="relative overflow-hidden rounded-xl border border-cyan-500/20 bg-black/40 backdrop-blur-xl p-4"
    >
      {/* Corner accents */}
      <div className="absolute top-0 left-0 h-4 w-4 border-t border-l border-cyan-500/40" />
      <div className="absolute top-0 right-0 h-4 w-4 border-t border-r border-cyan-500/40" />
      <div className="absolute bottom-0 left-0 h-4 w-4 border-b border-l border-cyan-500/40" />
      <div className="absolute bottom-0 right-0 h-4 w-4 border-b border-r border-cyan-500/40" />

      <div className="flex items-center gap-4">
        {/* Seconds arc */}
        <div className="relative flex-shrink-0">
          <svg width="96" height="96" viewBox="0 0 96 96" className="transform -rotate-90">
            {/* Background circle */}
            <circle
              cx="48"
              cy="48"
              r={radius}
              stroke="rgba(0, 240, 255, 0.1)"
              strokeWidth="3"
              fill="none"
            />
            {/* Progress arc */}
            <motion.circle
              cx="48"
              cy="48"
              r={radius}
              stroke="#00f0ff"
              strokeWidth="3"
              fill="none"
              strokeLinecap="round"
              strokeDasharray={circumference}
              animate={{ strokeDashoffset }}
              transition={{ duration: 0.5, ease: 'linear' }}
              style={{ filter: 'drop-shadow(0 0 4px rgba(0, 240, 255, 0.5))' }}
            />
          </svg>
          {/* Seconds number in center */}
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-xs font-mono text-cyan-400/70">{seconds}</span>
          </div>
        </div>

        {/* Time display */}
        <div className="flex-1 min-w-0">
          <div className="font-mono text-2xl sm:text-3xl tracking-wider text-cyan-400 flex items-center" style={{ textShadow: '0 0 10px rgba(0, 240, 255, 0.3)' }}>
            {hours}
            <motion.span
              animate={{ opacity: [1, 0.3, 1] }}
              transition={{ duration: 1, repeat: Infinity, ease: 'easeInOut' }}
              className="mx-0.5"
            >
              :
            </motion.span>
            {minutes}
            <motion.span
              animate={{ opacity: [1, 0.3, 1] }}
              transition={{ duration: 1, repeat: Infinity, ease: 'easeInOut' }}
              className="mx-0.5"
            >
              :
            </motion.span>
            <span className="text-lg text-cyan-500/70">{seconds}</span>
          </div>
          <div className="mt-1 text-xs text-cyan-300/50 font-mono tracking-wide">
            {dayOfWeek}
          </div>
          <div className="mt-0.5 text-xs text-cyan-300/40 font-mono">
            {month} {date}, {year}
          </div>
        </div>
      </div>
    </motion.div>
  )
}
