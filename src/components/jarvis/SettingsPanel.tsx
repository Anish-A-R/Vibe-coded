'use client'

import { motion, AnimatePresence } from 'framer-motion'
import {
  X,
  Brain,
  Volume2,
  VolumeX,
  Monitor,
  Trash2,
  Download,
  Info,
  Sparkles,
  Mic,
  Eye,
  Palette,
} from 'lucide-react'
import { Switch } from '@/components/ui/switch'
import { Slider } from '@/components/ui/slider'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { useJarvisStore } from '@/hooks/useJarvisStore'
import { PERSONALITIES } from '@/lib/personalities'
import type { PersonalityMode } from '@/hooks/useJarvisStore'

interface SettingsPanelProps {
  open: boolean
  onClose: () => void
}

function SectionTitle({ icon, children }: { icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2 mb-3">
      <span className="text-cyan-400">{icon}</span>
      <h3 className="text-sm font-mono font-semibold text-cyan-400/90 tracking-wide uppercase">
        {children}
      </h3>
    </div>
  )
}

function PersonalityOption({
  mode,
  isActive,
  onClick,
}: {
  mode: PersonalityMode
  isActive: boolean
  onClick: () => void
}) {
  const personality = PERSONALITIES[mode]
  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={`
        relative w-full rounded-lg border p-3 text-left transition-all duration-200
        ${isActive
          ? 'border-cyan-500/50 bg-cyan-500/10 shadow-[0_0_15px_rgba(0,240,255,0.1)]'
          : 'border-white/5 bg-white/[0.02] hover:border-white/10 hover:bg-white/[0.04]'
        }
      `}
    >
      {isActive && (
        <motion.div
          layoutId="personality-active"
          className="absolute inset-0 rounded-lg border border-cyan-500/30"
          transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
        />
      )}
      <div className="flex items-center gap-3">
        <span className="text-xl">{personality.icon}</span>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-mono font-semibold" style={{ color: isActive ? personality.color : 'rgba(255,255,255,0.7)' }}>
            {personality.name}
          </div>
          <div className="text-[10px] font-mono text-white/30 truncate">
            {personality.greeting.slice(0, 50)}...
          </div>
        </div>
        <div
          className="size-3 rounded-full"
          style={{
            backgroundColor: isActive ? personality.color : 'transparent',
            border: isActive ? 'none' : '2px solid rgba(255,255,255,0.15)',
            boxShadow: isActive ? `0 0 8px ${personality.color}66` : 'none',
          }}
        />
      </div>
    </motion.button>
  )
}

export default function SettingsPanel({ open, onClose }: SettingsPanelProps) {
  const {
    personalityMode,
    setPersonalityMode,
    soundEnabled,
    setSoundEnabled,
    volume,
    setVolume,
    particlesEnabled,
    setParticlesEnabled,
    wakeWordEnabled,
    setWakeWordEnabled,
    clearMessages,
    easterEggActivated,
    setEasterEggActivated,
    commandCount,
  } = useJarvisStore()

  const handleExportConversations = () => {
    const { messages } = useJarvisStore.getState()
    const data = JSON.stringify(messages, null, 2)
    const blob = new Blob([data], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `jarvis-conversations-${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Panel */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed top-0 right-0 z-50 h-full w-full sm:w-[400px] border-l border-cyan-500/20 bg-black/80 backdrop-blur-xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-cyan-500/10">
              <div className="flex items-center gap-2">
                <Sparkles className="size-5 text-cyan-400" />
                <h2 className="text-lg font-mono font-bold text-cyan-400">Settings</h2>
              </div>
              <motion.button
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
                onClick={onClose}
                className="size-8 flex items-center justify-center rounded-lg border border-white/10 text-white/50 hover:text-white/80 hover:border-white/20 transition-colors"
              >
                <X className="size-4" />
              </motion.button>
            </div>

            {/* Content */}
            <ScrollArea className="h-[calc(100%-65px)]">
              <div className="p-4 space-y-6">
                {/* AI Personality */}
                <section>
                  <SectionTitle icon={<Brain className="size-4" />}>AI Personality</SectionTitle>
                  <div className="space-y-2">
                    {(['professional', 'funny', 'boss'] as PersonalityMode[]).map((mode) => (
                      <PersonalityOption
                        key={mode}
                        mode={mode}
                        isActive={personalityMode === mode}
                        onClick={() => setPersonalityMode(mode)}
                      />
                    ))}
                  </div>
                </section>

                <Separator className="bg-cyan-500/10" />

                {/* Voice */}
                <section>
                  <SectionTitle icon={<Volume2 className="size-4" />}>Voice</SectionTitle>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Mic className="size-4 text-cyan-400/60" />
                        <span className="text-sm font-mono text-white/70">Wake Word</span>
                      </div>
                      <Switch
                        checked={wakeWordEnabled}
                        onCheckedChange={setWakeWordEnabled}
                        className="data-[state=checked]:bg-cyan-500"
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {soundEnabled ? (
                          <Volume2 className="size-4 text-cyan-400/60" />
                        ) : (
                          <VolumeX className="size-4 text-white/30" />
                        )}
                        <span className="text-sm font-mono text-white/70">Sound Effects</span>
                      </div>
                      <Switch
                        checked={soundEnabled}
                        onCheckedChange={setSoundEnabled}
                        className="data-[state=checked]:bg-cyan-500"
                      />
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-mono text-white/70">Volume</span>
                        <span className="text-xs font-mono text-cyan-400/60">
                          {Math.round(volume * 100)}%
                        </span>
                      </div>
                      <Slider
                        value={[volume * 100]}
                        onValueChange={([v]) => setVolume(v / 100)}
                        min={0}
                        max={100}
                        step={1}
                        className="[&_[data-slot=slider-range]]:bg-cyan-500 [&_[data-slot=slider-thumb]]:border-cyan-500"
                      />
                    </div>
                  </div>
                </section>

                <Separator className="bg-cyan-500/10" />

                {/* Display */}
                <section>
                  <SectionTitle icon={<Monitor className="size-4" />}>Display</SectionTitle>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Eye className="size-4 text-cyan-400/60" />
                        <span className="text-sm font-mono text-white/70">Particle Effects</span>
                      </div>
                      <Switch
                        checked={particlesEnabled}
                        onCheckedChange={setParticlesEnabled}
                        className="data-[state=checked]:bg-cyan-500"
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Palette className="size-4 text-cyan-400/60" />
                        <span className="text-sm font-mono text-white/70">Theme</span>
                      </div>
                      <span className="text-xs font-mono text-cyan-400/50 px-2 py-1 rounded border border-cyan-500/10">
                        Dark (Cinematic)
                      </span>
                    </div>
                  </div>
                </section>

                <Separator className="bg-cyan-500/10" />

                {/* Data */}
                <section>
                  <SectionTitle icon={<Info className="size-4" />}>Data</SectionTitle>
                  <div className="space-y-3">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleExportConversations}
                      className="w-full font-mono border-cyan-500/20 text-cyan-400/70 hover:bg-cyan-500/10 hover:text-cyan-400"
                    >
                      <Download className="size-4" />
                      Export Conversations
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={clearMessages}
                      className="w-full font-mono border-red-500/20 text-red-400/70 hover:bg-red-500/10 hover:text-red-400"
                    >
                      <Trash2 className="size-4" />
                      Clear Chat History
                    </Button>
                  </div>
                </section>

                <Separator className="bg-cyan-500/10" />

                {/* About */}
                <section>
                  <SectionTitle icon={<Info className="size-4" />}>About</SectionTitle>
                  <div className="space-y-2 text-xs font-mono text-white/40">
                    <div className="flex justify-between">
                      <span>Version</span>
                      <span className="text-cyan-400/50">v3.1.0</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Commands Executed</span>
                      <span className="text-cyan-400/50">{commandCount}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Credits</span>
                      <span className="text-cyan-400/50">Stark Industries</span>
                    </div>
                  </div>
                  {!easterEggActivated && (
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setEasterEggActivated(true)}
                      className="mt-3 w-full text-center text-[10px] font-mono text-white/10 hover:text-cyan-400/30 transition-colors cursor-pointer py-2"
                    >
                      ● ● ●
                    </motion.button>
                  )}
                  {easterEggActivated && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-3 p-2 rounded border border-amber-500/20 bg-amber-500/5 text-center text-xs font-mono text-amber-400/60"
                    >
                      🌟 Easter Egg Activated! &quot;I am Iron Man.&quot;
                    </motion.div>
                  )}
                </section>
              </div>
            </ScrollArea>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
