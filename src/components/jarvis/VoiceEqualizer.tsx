'use client'

import { useMemo } from 'react'
import { cn } from '@/lib/utils'
import type { AIStatus } from '@/hooks/useJarvisStore'

interface VoiceEqualizerProps {
  status?: AIStatus
  className?: string
}

const statusBars: Record<AIStatus, { minH: number; maxH: number; speed: number; intensity: number }> = {
  idle: { minH: 4, maxH: 10, speed: 2.5, intensity: 0.3 },
  listening: { minH: 4, maxH: 30, speed: 0.6, intensity: 0.8 },
  thinking: { minH: 6, maxH: 25, speed: 1.0, intensity: 0.7 },
  speaking: { minH: 4, maxH: 40, speed: 0.4, intensity: 1 },
}

export default function VoiceEqualizer({ status = 'idle', className }: VoiceEqualizerProps) {
  const barCount = 20
  const config = statusBars[status]

  const bars = useMemo(() => {
    return Array.from({ length: barCount }, (_, i) => {
      const centerDist = Math.abs(i - barCount / 2) / (barCount / 2)
      const heightFactor = 1 - centerDist * 0.5
      return {
        id: i,
        delay: i * 0.08,
        heightFactor,
      }
    })
  }, [])

  const maxH = config.maxH
  const minH = config.minH
  const speed = config.speed
  const intensity = config.intensity

  return (
    <div className={cn('flex items-end justify-center gap-[2px] h-[50px] sm:h-[60px]', className)}>
      {bars.map((bar) => {
        const barMaxH = maxH * bar.heightFactor
        const midH = (minH + barMaxH) / 2
        const amplitude = (barMaxH - minH) / 2
        // Create CSS keyframe values for this specific bar
        const keyframes = [
          minH,
          midH + amplitude * 0.6,
          barMaxH * intensity,
          midH - amplitude * 0.3,
          minH + (barMaxH - minH) * 0.2,
          midH + amplitude * 0.8 * intensity,
          minH,
        ]

        return (
          <div
            key={bar.id}
            className="w-[3px] sm:w-[4px] rounded-full"
            style={{
              background: `linear-gradient(to top, rgba(0, 240, 255, 0.9), rgba(0, 102, 255, 0.7), rgba(255, 106, 0, ${intensity * 0.5}))`,
              boxShadow: `0 0 4px rgba(0, 240, 255, ${intensity * 0.3})`,
              minHeight: minH,
              height: minH,
              animation: `eq-bar-${bar.id} ${speed * 2}s ease-in-out ${bar.delay * speed * 0.3}s infinite`,
            } as React.CSSProperties}
          >
            <style>{`
              @keyframes eq-bar-${bar.id} {
                0% { height: ${keyframes[0]}px; }
                14% { height: ${keyframes[1]}px; }
                28% { height: ${keyframes[2]}px; }
                42% { height: ${keyframes[3]}px; }
                57% { height: ${keyframes[4]}px; }
                71% { height: ${keyframes[5]}px; }
                100% { height: ${keyframes[6]}px; }
              }
            `}</style>
          </div>
        )
      })}
    </div>
  )
}
