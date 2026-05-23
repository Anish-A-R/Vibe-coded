'use client'

import { useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Volume2, VolumeX, CloudRain, Zap, Rocket, Waves, Flame, ChevronDown, ChevronUp } from 'lucide-react'
import { useJarvisStore } from '@/hooks/useJarvisStore'
import type { AmbientSound } from '@/hooks/useJarvisStore'

const SOUNDS: { key: AmbientSound; label: string; icon: React.ReactNode; color: string }[] = [
  { key: 'none', label: 'Off', icon: <VolumeX className="w-3.5 h-3.5" />, color: '#666' },
  { key: 'rain', label: 'Rain', icon: <CloudRain className="w-3.5 h-3.5" />, color: '#00f0ff' },
  { key: 'cyberpunk', label: 'Cyber', icon: <Zap className="w-3.5 h-3.5" />, color: '#8b5cf6' },
  { key: 'space', label: 'Space', icon: <Rocket className="w-3.5 h-3.5" />, color: '#00ff88' },
  { key: 'ocean', label: 'Ocean', icon: <Waves className="w-3.5 h-3.5" />, color: '#0066ff' },
  { key: 'fire', label: 'Fire', icon: <Flame className="w-3.5 h-3.5" />, color: '#ff6a00' },
]

// Generate noise using Web Audio API
function createNoiseBuffer(ctx: AudioContext, type: 'brown' | 'pink' | 'white'): AudioBuffer {
  const bufferSize = ctx.sampleRate * 2
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate)
  const data = buffer.getChannelData(0)

  if (type === 'white') {
    for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1
  } else if (type === 'brown') {
    let lastOut = 0
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1
      data[i] = (lastOut + 0.02 * white) / 1.02
      lastOut = data[i]
      data[i] *= 3.5
    }
  } else {
    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1
      b0 = 0.99886 * b0 + white * 0.0555179
      b1 = 0.99332 * b1 + white * 0.0750759
      b2 = 0.96900 * b2 + white * 0.1538520
      b3 = 0.86650 * b3 + white * 0.3104856
      b4 = 0.55000 * b4 + white * 0.5329522
      b5 = -0.7616 * b5 - white * 0.0168980
      data[i] = b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362
      data[i] *= 0.11
      b6 = white * 0.115926
    }
  }
  return buffer
}

export default function AmbientSoundWidget() {
  const { ambientSound, setAmbientSound, ambientVolume, setAmbientVolume, collapsedWidgets, toggleWidgetCollapse } = useJarvisStore()
  const audioCtxRef = useRef<AudioContext | null>(null)
  const gainNodeRef = useRef<GainNode | null>(null)
  const sourceRef = useRef<AudioBufferSourceNode | null>(null)
  const widgetId = 'ambient-sound'
  const isCollapsed = collapsedWidgets.includes(widgetId)
  const isPlaying = ambientSound !== 'none'

  // Start sound - called from event handlers, not effects
  const startSound = useCallback((sound: AmbientSound) => {
    // Stop any existing sound first
    if (sourceRef.current) {
      try { sourceRef.current.stop() } catch { /* ignore */ }
      sourceRef.current = null
    }

    const ctx = new AudioContext()
    audioCtxRef.current = ctx

    const gainNode = ctx.createGain()
    gainNode.gain.value = ambientVolume * 0.3
    gainNodeRef.current = gainNode

    let noiseType: 'brown' | 'pink' | 'white' = 'brown'
    let filterFreq = 400
    let filterQ = 1

    switch (sound) {
      case 'rain': noiseType = 'pink'; filterFreq = 3000; filterQ = 0.5; break
      case 'cyberpunk': noiseType = 'white'; filterFreq = 800; filterQ = 3; break
      case 'space': noiseType = 'brown'; filterFreq = 200; filterQ = 0.7; break
      case 'ocean': noiseType = 'brown'; filterFreq = 500; filterQ = 0.3; break
      case 'fire': noiseType = 'pink'; filterFreq = 1500; filterQ = 1.5; break
    }

    const buffer = createNoiseBuffer(ctx, noiseType)
    const source = ctx.createBufferSource()
    source.buffer = buffer
    source.loop = true
    sourceRef.current = source

    const filter = ctx.createBiquadFilter()
    filter.type = 'lowpass'
    filter.frequency.value = filterFreq
    filter.Q.value = filterQ

    const lfo = ctx.createOscillator()
    const lfoGain = ctx.createGain()
    lfo.type = 'sine'
    lfo.frequency.value = sound === 'ocean' ? 0.1 : sound === 'fire' ? 2 : 0.3
    lfoGain.gain.value = sound === 'ocean' ? 0.15 : sound === 'fire' ? 0.05 : 0.03
    lfo.connect(lfoGain)
    lfoGain.connect(gainNode.gain)
    lfo.start()

    source.connect(filter)
    filter.connect(gainNode)
    gainNode.connect(ctx.destination)
    source.start()
  }, [ambientVolume])

  const stopSound = useCallback(() => {
    if (sourceRef.current) {
      try { sourceRef.current.stop() } catch { /* ignore */ }
      sourceRef.current = null
    }
    if (audioCtxRef.current) {
      audioCtxRef.current.close()
      audioCtxRef.current = null
    }
  }, [])

  // Handle sound selection - manage audio lifecycle
  const handleSoundChange = useCallback((sound: AmbientSound) => {
    stopSound()
    setAmbientSound(sound)
    if (sound !== 'none') {
      startSound(sound)
    }
  }, [stopSound, startSound, setAmbientSound])

  // Update volume live
  useEffect(() => {
    if (gainNodeRef.current) {
      gainNodeRef.current.gain.value = ambientVolume * 0.3
    }
  }, [ambientVolume])

  // Cleanup on unmount
  useEffect(() => {
    return () => { stopSound() }
  }, [stopSound])

  const activeSound = SOUNDS.find(s => s.key === ambientSound)

  return (
    <motion.div
      layout
      className="glass-panel holo-border-purple inner-glow-cyan overflow-hidden"
    >
      {/* Header */}
      <button
        onClick={() => toggleWidgetCollapse(widgetId)}
        className="w-full flex items-center justify-between p-3 hover:bg-white/[0.02] transition-colors"
      >
        <div className="flex items-center gap-2">
          <Volume2 className="w-3.5 h-3.5 text-neon-purple/60" />
          <span className="text-[10px] font-mono text-neon-purple/60 uppercase tracking-wider font-semibold">
            Ambient Sound
          </span>
        </div>
        <div className="flex items-center gap-2">
          {isPlaying && (
            <motion.div
              className="flex gap-[2px] items-end h-3"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              {[0, 1, 2].map(i => (
                <motion.div
                  key={i}
                  className="w-[2px] rounded-full"
                  style={{ backgroundColor: activeSound?.color || '#8b5cf6' }}
                  animate={{ height: [3, 10, 5, 8, 3] }}
                  transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.15, ease: 'easeInOut' }}
                />
              ))}
            </motion.div>
          )}
          {isCollapsed ? (
            <ChevronDown className="w-3 h-3 text-white/20" />
          ) : (
            <ChevronUp className="w-3 h-3 text-white/20" />
          )}
        </div>
      </button>

      <AnimatePresence>
        {!isCollapsed && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="px-3 pb-3 space-y-3">
              {/* Animated Visualizer Bars */}
              {isPlaying && (
                <div className="flex items-end justify-center gap-[2px] h-8 rounded-lg bg-black/30 px-2 overflow-hidden">
                  {Array.from({ length: 16 }).map((_, i) => (
                    <motion.div
                      key={i}
                      className="w-[3px] rounded-full"
                      style={{ backgroundColor: activeSound?.color || '#8b5cf6' }}
                      animate={{
                        height: [
                          `${10 + Math.random() * 30}%`,
                          `${30 + Math.random() * 50}%`,
                          `${15 + Math.random() * 40}%`,
                          `${20 + Math.random() * 60}%`,
                        ],
                      }}
                      transition={{
                        duration: 0.6 + Math.random() * 0.4,
                        repeat: Infinity,
                        repeatType: 'reverse',
                        ease: 'easeInOut',
                        delay: i * 0.03,
                      }}
                    />
                  ))}
                </div>
              )}

              {/* Sound Selection Grid */}
              <div className="grid grid-cols-3 gap-1.5">
                {SOUNDS.map(({ key, label, icon, color }) => (
                  <motion.button
                    key={key}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => handleSoundChange(key)}
                    className={`
                      flex flex-col items-center gap-1 py-2 px-1 rounded-lg transition-all duration-200
                      ${ambientSound === key
                        ? 'bg-white/[0.08] border'
                        : 'bg-white/[0.02] border border-transparent hover:bg-white/[0.04] hover:border-white/10'
                      }
                    `}
                    style={ambientSound === key ? { borderColor: `${color}40`, boxShadow: `0 0 8px ${color}15` } : {}}
                  >
                    <span style={{ color: ambientSound === key ? color : 'rgba(255,255,255,0.3)' }}>
                      {icon}
                    </span>
                    <span
                      className="text-[8px] font-mono uppercase tracking-wider"
                      style={{ color: ambientSound === key ? color : 'rgba(255,255,255,0.25)' }}
                    >
                      {label}
                    </span>
                  </motion.button>
                ))}
              </div>

              {/* Volume Slider */}
              {isPlaying && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] font-mono text-white/30">Volume</span>
                    <span className="text-[9px] font-mono" style={{ color: activeSound?.color || '#8b5cf6' }}>
                      {Math.round(ambientVolume * 100)}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={ambientVolume * 100}
                    onChange={(e) => setAmbientVolume(Number(e.target.value) / 100)}
                    className="w-full h-1 rounded-full appearance-none cursor-pointer"
                    style={{
                      background: `linear-gradient(to right, ${activeSound?.color || '#8b5cf6'} ${ambientVolume * 100}%, rgba(255,255,255,0.05) ${ambientVolume * 100}%)`,
                    }}
                  />
                </motion.div>
              )}

              {/* Now Playing Indicator */}
              {isPlaying && (
                <div className="flex items-center justify-center gap-1.5 py-1">
                  <motion.div
                    className="w-1.5 h-1.5 rounded-full"
                    style={{ backgroundColor: activeSound?.color || '#8b5cf6' }}
                    animate={{ opacity: [0.4, 1, 0.4] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  />
                  <span className="text-[9px] font-mono" style={{ color: `${activeSound?.color}88` }}>
                    Playing: {activeSound?.label}
                  </span>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
