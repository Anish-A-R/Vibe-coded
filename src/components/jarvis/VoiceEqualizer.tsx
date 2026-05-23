'use client'

import { useMemo } from 'react'
import { motion } from 'framer-motion'
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
        phaseOffset: (i * 0.7 + Math.sin(i) * 1.3),
      }
    })
  }, [barCount])

  return (
    <div className={cn('flex items-end justify-center gap-[2px] h-[50px] sm:h-[60px]', className)}>
      {bars.map((bar) => {
        const minH = config.minH
        const maxH = config.maxH * bar.heightFactor
        const midH = (minH + maxH) / 2
        const amplitude = (maxH - minH) / 2

        return (
          <motion.div
            key={bar.id}
            className="w-[3px] sm:w-[4px] rounded-full"
            style={{
              background: `linear-gradient(to top, rgba(0, 240, 255, 0.9), rgba(0, 102, 255, 0.7), rgba(255, 106, 0, ${config.intensity * 0.5}))`,
              boxShadow: `0 0 4px rgba(0, 240, 255, ${config.intensity * 0.3})`,
              minHeight: minH,
            }}
            animate={{
              height: [
                minH,
                midH + amplitude * 0.6,
                maxH * config.intensity,
                midH - amplitude * 0.3,
                minH + (maxH - minH) * 0.2,
                midH + amplitude * 0.8 * config.intensity,
                minH,
              ],
            }}
            transition={{
              duration: config.speed * 2,
              delay: bar.delay * config.speed * 0.3,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
        )
      })}
    </div>
  )
}
