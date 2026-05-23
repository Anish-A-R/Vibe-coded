'use client'

import React, { useState, useEffect } from 'react'
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

function getTimeInZone(tz: string, now: Date): { time: string; date: string } {
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
    return { time: timeStr, date: dateStr }
  } catch {
    return { time: '--:--:--', date: '---' }
  }
}

function WorldClockWidgetInner() {
  // Single counter incremented every second — all display values derived during render
  const [tick, setTick] = useState(0)

  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 1000)
    return () => clearInterval(id)
  }, [])

  const now = new Date()

  return (
    <div className="relative overflow-hidden rounded-xl border border-cyan-500/20 bg-black/40 backdrop-blur-xl glass-panel holo-border-cyan inner-glow-cyan animate-fade-in-up">
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
          {DEFAULT_CITIES.map((c, i) => {
            const { time, date } = getTimeInZone(c.timezone, now)
            return (
              <div key={c.city}>
                <div className="flex items-center justify-between py-2 group hover:translate-x-0.5 transition-transform duration-150">
                  <div className="min-w-0 flex-1">
                    <div className="text-[10px] font-mono text-white/40 group-hover:text-cyan-400/60 transition-colors duration-200">
                      {c.city}
                    </div>
                    <div className="text-xs font-mono text-white/20 mt-0.5">
                      {date}
                    </div>
                  </div>
                  <div className="font-mono text-lg tracking-wider text-cyan-400 neon-text-cyan flex items-center">
                    {time.split(':').map((segment, idx) => (
                      <span key={idx} className="flex items-center">
                        {idx > 0 && (
                          <span className="blink-colon mx-px text-cyan-400/60">
                            :
                          </span>
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
                </div>
                {i < DEFAULT_CITIES.length - 1 && (
                  <div className="h-px bg-gradient-to-r from-transparent via-cyan-500/10 to-transparent" />
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export default React.memo(WorldClockWidgetInner)
