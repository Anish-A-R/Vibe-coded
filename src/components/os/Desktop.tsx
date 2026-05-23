'use client'

import { useMemo } from 'react'
import { motion } from 'framer-motion'
import { useJarvisStore } from '@/hooks/useJarvisStore'
import ParticleField from '@/components/jarvis/ParticleField'
import CircularOrb from '@/components/jarvis/CircularOrb'
import RadarScanner from '@/components/jarvis/RadarScanner'
import VoiceEqualizer from '@/components/jarvis/VoiceEqualizer'
import DesktopIcon from '@/components/os/DesktopIcon'

export default function Desktop() {
  const aiStatus = useJarvisStore((s) => s.aiStatus)
  const particlesEnabled = useJarvisStore((s) => s.particlesEnabled)
  const personalityMode = useJarvisStore((s) => s.personalityMode)
  const availableApps = useJarvisStore((s) => s.availableApps)

  const ambientColor = useMemo(() =>
    personalityMode === 'boss' ? { r: 255, g: 51, b: 102 }
    : personalityMode === 'funny' ? { r: 255, g: 106, b: 0 }
    : { r: 0, g: 240, b: 255 },
    [personalityMode]
  )

  // Desktop apps: show all available apps as desktop icons
  const desktopApps = useMemo(() => availableApps, [availableApps])

  return (
    <div className="absolute inset-0 overflow-hidden">
      {/* Particle background */}
      <ParticleField enabled={particlesEnabled} />

      {/* Ambient glow effects */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <div
          className="absolute top-0 left-0 w-[600px] h-[600px] rounded-full blur-[120px]"
          style={{ backgroundColor: `rgba(${ambientColor.r}, ${ambientColor.g}, ${ambientColor.b}, 0.03)` }}
        />
        <div
          className="absolute bottom-0 right-0 w-[400px] h-[400px] rounded-full blur-[100px]"
          style={{ backgroundColor: `rgba(${ambientColor.r}, ${ambientColor.g}, ${ambientColor.b}, 0.02)` }}
        />
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full blur-[80px]"
          style={{
            background: `radial-gradient(circle, rgba(${ambientColor.r}, ${ambientColor.g}, ${ambientColor.b}, 0.04) 0%, transparent 70%)`,
          }}
        />
      </div>

      {/* Desktop icon grid on the left */}
      <div className="absolute top-4 left-4 bottom-16 z-10 flex flex-col flex-wrap gap-3 content-start overflow-y-auto jarvis-scrollbar py-2 pr-2 max-w-[340px]">
        {desktopApps.map((app, index) => (
          <DesktopIcon key={app.id} app={app} index={index} />
        ))}
      </div>

      {/* Center: JARVIS Orb (home screen) */}
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-[1]">
        {/* Decorative rings */}
        <div className="absolute flex items-center justify-center pointer-events-none" style={{ animation: 'orb-fade-in 0.6s ease-out 0.3s both' }}>
          <div
            className="w-[320px] h-[320px] sm:w-[380px] sm:h-[380px] rounded-full border border-neon-cyan/[0.06]"
            style={{ animation: 'orb-rotate-cw 60s linear infinite' }}
          />
        </div>
        <div className="absolute flex items-center justify-center pointer-events-none" style={{ animation: 'orb-fade-in 0.6s ease-out 0.45s both' }}>
          <div
            className="w-[360px] h-[360px] sm:w-[420px] sm:h-[420px] rounded-full border border-dashed border-neon-cyan/[0.04]"
            style={{ animation: 'orb-rotate-ccw 90s linear infinite' }}
          />
        </div>

        {/* Main orb */}
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.5, type: 'spring', stiffness: 150, damping: 12 }}
        >
          <CircularOrb status={aiStatus} />
        </motion.div>

        {/* Voice equalizer */}
        <div className="mt-4">
          <VoiceEqualizer status={aiStatus} />
        </div>

        {/* Status label */}
        <motion.div
          className="flex items-center gap-3 mt-3"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1.0 }}
        >
          {aiStatus !== 'idle' && (
            <div className="flex gap-1">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="w-1 h-1 rounded-full bg-neon-cyan animate-pulse"
                  style={{ animationDelay: `${i * 0.2}s` }}
                />
              ))}
            </div>
          )}
          <div
            className="font-mono text-sm sm:text-base tracking-[0.2em] uppercase text-neon-cyan"
            style={{
              animation: aiStatus === 'idle' ? 'pulse 2s ease-in-out infinite' : 'none',
            }}
          >
            {aiStatus === 'idle' ? 'Awaiting Command'
              : aiStatus === 'listening' ? 'Listening'
              : aiStatus === 'thinking' ? 'Processing'
              : 'Speaking'}
          </div>
          {aiStatus !== 'idle' && (
            <div className="flex gap-1">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="w-1 h-1 rounded-full bg-neon-cyan animate-pulse"
                  style={{ animationDelay: `${(2 - i) * 0.2}s` }}
                />
              ))}
            </div>
          )}
        </motion.div>
      </div>

      {/* Bottom-right: Mini radar (visible on desktop only) */}
      <div className="absolute bottom-20 right-4 hidden xl:block z-10">
        <RadarScanner />
      </div>
    </div>
  )
}
