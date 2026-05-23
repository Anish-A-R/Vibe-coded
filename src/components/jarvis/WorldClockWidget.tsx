'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Globe } from 'lucide-react'

interface CityClock {
  city: string
  timezone: string
}

const DEFAULT_CITIES: CityClock[] = [
  { city: 'New York', timezone: 'America/New_York' },
  { city: 'London', timezone: 'Europe/London' },
  { city: 'Tokyo', timezone: 'Asia/Tokyo' },
  { city: 'Sydney', timezone: 'Australia/Sydney' },
]

function getTimeInZone(tz: string): { time: string; date: string; seconds: number } {
  const now = new Date()
  try {
    const timeStr = now.toLocaleTimeString('en-US', {
      timeZone: tz,
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    })
    const dateStr = now.toLocaleDateString('en-US', {
      timeZone: tz,
      month: 'short',
      day: 'numeric',
    })
    const seconds = parseInt(
      now.toLocaleTimeString('en-US', { timeZone: tz, second: '2-digit' }),
      10
    )
    return { time: timeStr, date: dateStr, seconds }
  } catch {
    return { time: '--:--:--', date: '---', seconds: 0 }
  }
}

export default function WorldClockWidget() {
  const [clocks, setClocks] = useState<
    Array<{ city: string; time: string; date: string; seconds: number }>
  >([])

  useEffect(() => {
    const updateClocks = () => {
      setClocks(
        DEFAULT_CITIES.map((c) => {
          const { time, date, seconds } = getTimeInZone(c.timezone)
          return { city: c.city, time, date, seconds }
        })
      )
    }
    updateClocks()
    const interval = setInterval(updateClocks, 1000)
    return () => clearInterval(interval)
  }, [])

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
          <Globe className="size-4 text-cyan-400/70" />
          <h3 className="text-xs font-mono font-semibold text-cyan-400/80 tracking-widest uppercase">
            World Clock
          </h3>
        </div>

        {/* Clock entries */}
        <div className="space-y-0">
          {clocks.map((clock, i) => (
            <div key={clock.city}>
              <motion.div
                className="flex items-center justify-between py-2 group"
                whileHover={{ x: 2 }}
                transition={{ duration: 0.15 }}
              >
                <div className="min-w-0 flex-1">
                  <div className="text-[10px] font-mono text-white/40 group-hover:text-cyan-400/60 transition-colors duration-200">
                    {clock.city}
                  </div>
                  <div className="text-xs font-mono text-white/20 mt-0.5">
                    {clock.date}
                  </div>
                </div>
                <div className="font-mono text-lg tracking-wider text-cyan-400 neon-text-cyan flex items-center">
                  {clock.time.split(':').map((segment, idx) => (
                    <span key={idx} className="flex items-center">
                      {idx > 0 && (
                        <motion.span
                          animate={{ opacity: [1, 0.2, 1] }}
                          transition={{ duration: 1, repeat: Infinity, ease: 'easeInOut' }}
                          className="mx-px text-cyan-400/60"
                        >
                          :
                        </motion.span>
                      )}
                      {idx === 2 ? (
                        <span className="text-sm text-cyan-500/60">
                          {segment}
                        </span>
                      ) : (
                        segment
                      )}
                    </span>
                  ))}
                </div>
              </motion.div>
              {i < clocks.length - 1 && (
                <div className="h-px bg-gradient-to-r from-transparent via-cyan-500/10 to-transparent" />
              )}
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  )
}
