'use client'

import { useState } from 'react'
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
  MapPin,
  Check,
  CheckCircle,
  Tv,
  FileText,
  CloudRain,
  Zap,
  Rocket,
  Waves,
  Flame,
  Globe,
} from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { Slider } from '@/components/ui/slider'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { useJarvisStore } from '@/hooks/useJarvisStore'
import { PERSONALITIES } from '@/lib/personalities'
import type { PersonalityMode, ColorTheme, AmbientSound } from '@/hooks/useJarvisStore'

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
    weatherLocation,
    setWeatherLocation,
    colorTheme,
    setColorTheme,
    crtOverlayEnabled,
    setCRTOverlayEnabled,
    ambientSound,
    setAmbientSound,
    ambientVolume,
    setAmbientVolume,
    voiceLanguage,
    setVoiceLanguage,
  } = useJarvisStore()

  const [locationInput, setLocationInput] = useState(weatherLocation)
  const [locationSaved, setLocationSaved] = useState(false)

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

  const handleExportMarkdown = () => {
    const { conversations, activeConversationId } = useJarvisStore.getState()
    const conv = conversations.find(c => c.id === activeConversationId)
    if (!conv || conv.messages.length === 0) return

    const lines = [
      `# ${conv.title}`,
      ``,
      `> Exported from J.A.R.V.I.S. on ${new Date().toLocaleString()}`,
      `> Personality: ${conv.personality}`,
      ``,
      `---`,
      ``,
    ]

    conv.messages.forEach(msg => {
      const time = new Date(msg.timestamp).toLocaleTimeString()
      if (msg.role === 'user') {
        lines.push(`### 👤 User — ${time}`)
      } else if (msg.role === 'assistant') {
        lines.push(`### 🤖 J.A.R.V.I.S. — ${time}`)
      } else {
        lines.push(`### ⚙️ System — ${time}`)
      }
      lines.push(``)
      lines.push(msg.content)
      lines.push(``)
      lines.push(`---`)
      lines.push(``)
    })

    const md = lines.join('\n')
    const blob = new Blob([md], { type: 'text/markdown' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `jarvis-${conv.title.replace(/[^a-zA-Z0-9]/g, '-').slice(0, 30)}-${new Date().toISOString().slice(0, 10)}.md`
    a.click()
    URL.revokeObjectURL(url)
  }

  const LANGUAGES = [
    { code: 'en-US', label: 'English (US)' },
    { code: 'en-GB', label: 'English (UK)' },
    { code: 'es-ES', label: 'Español' },
    { code: 'fr-FR', label: 'Français' },
    { code: 'de-DE', label: 'Deutsch' },
    { code: 'hi-IN', label: 'हिन्दी (Hindi)' },
    { code: 'ja-JP', label: '日本語 (Japanese)' },
    { code: 'zh-CN', label: '中文 (Chinese)' },
    { code: 'pt-BR', label: 'Português (BR)' },
    { code: 'ko-KR', label: '한국어 (Korean)' },
    { code: 'ar-SA', label: 'العربية (Arabic)' },
    { code: 'it-IT', label: 'Italiano' },
    { code: 'ru-RU', label: 'Русский (Russian)' },
  ]

  const AMBIENT_SOUNDS: { key: AmbientSound; label: string; icon: React.ReactNode }[] = [
    { key: 'none', label: 'Off', icon: <VolumeX className="size-3" /> },
    { key: 'rain', label: 'Rain', icon: <CloudRain className="size-3" /> },
    { key: 'cyberpunk', label: 'Cyber', icon: <Zap className="size-3" /> },
    { key: 'space', label: 'Space', icon: <Rocket className="size-3" /> },
    { key: 'ocean', label: 'Ocean', icon: <Waves className="size-3" /> },
    { key: 'fire', label: 'Fire', icon: <Flame className="size-3" /> },
  ]

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
                      <div className="flex items-center gap-2">
                        <Globe className="size-4 text-cyan-400/60" />
                        <span className="text-sm font-mono text-white/70">Voice Language</span>
                      </div>
                      <select
                        value={voiceLanguage}
                        onChange={(e) => setVoiceLanguage(e.target.value)}
                        className="
                          w-full h-8 px-3 rounded-md text-sm font-mono
                          bg-white/5 border border-cyan-500/20
                          text-white/80
                          focus:border-cyan-500/50 focus:outline-none
                          transition-colors duration-200
                          [&>option]:bg-black [&>option]:text-white/80
                        "
                      >
                        {LANGUAGES.map((lang) => (
                          <option key={lang.code} value={lang.code}>
                            {lang.label}
                          </option>
                        ))}
                      </select>
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
                        <Tv className="size-4 text-cyan-400/60" />
                        <span className="text-sm font-mono text-white/70">CRT Scanline Overlay</span>
                      </div>
                      <Switch
                        checked={crtOverlayEnabled}
                        onCheckedChange={setCRTOverlayEnabled}
                        className="data-[state=checked]:bg-cyan-500"
                      />
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Palette className="size-4 text-cyan-400/60" />
                        <span className="text-sm font-mono text-white/70">Color Theme</span>
                      </div>
                      <div className="flex items-center gap-3 justify-center">
                        {([
                          { key: 'cyan' as ColorTheme, color: '#00f0ff', label: 'Cyan' },
                          { key: 'purple' as ColorTheme, color: '#8b5cf6', label: 'Purple' },
                          { key: 'green' as ColorTheme, color: '#00ff88', label: 'Green' },
                          { key: 'red' as ColorTheme, color: '#ff3366', label: 'Red' },
                        ]).map(({ key, color, label }) => (
                          <motion.button
                            key={key}
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => setColorTheme(key)}
                            className="flex flex-col items-center gap-1 group"
                            aria-label={`Set ${label} theme`}
                          >
                            <div
                              className={`size-8 rounded-full flex items-center justify-center transition-all duration-200 ${
                                colorTheme === key
                                  ? 'ring-2 ring-offset-2 ring-offset-black'
                                  : 'ring-1 ring-white/10 group-hover:ring-white/25'
                              }`}
                              style={{
                                backgroundColor: color,
                                boxShadow: colorTheme === key ? `0 0 12px ${color}66, 0 0 24px ${color}33` : 'none',
                                ringColor: colorTheme === key ? color : undefined,
                              }}
                            >
                              {colorTheme === key && (
                                <motion.div
                                  initial={{ scale: 0 }}
                                  animate={{ scale: 1 }}
                                  transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                                >
                                  <CheckCircle className="size-4 text-white" />
                                </motion.div>
                              )}
                            </div>
                            <span
                              className={`text-[9px] font-mono transition-colors duration-200 ${
                                colorTheme === key ? 'text-white/70' : 'text-white/25 group-hover:text-white/40'
                              }`}
                            >
                              {label}
                            </span>
                          </motion.button>
                        ))}
                      </div>
                    </div>
                    {/* Location */}
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <MapPin className="size-4 text-cyan-400/60" />
                        <span className="text-sm font-mono text-white/70">Weather Location</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Input
                          value={locationInput}
                          onChange={(e) => {
                            setLocationInput(e.target.value)
                            setLocationSaved(false)
                          }}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              setWeatherLocation(locationInput)
                              setLocationSaved(true)
                              setTimeout(() => setLocationSaved(false), 2000)
                            }
                          }}
                          placeholder="Enter city name..."
                          className="
                            flex-1 h-8 text-sm font-mono
                            bg-white/5 border-cyan-500/20
                            text-white/80 placeholder:text-white/20
                            focus:border-cyan-500/50
                          "
                        />
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => {
                            setWeatherLocation(locationInput)
                            setLocationSaved(true)
                            setTimeout(() => setLocationSaved(false), 2000)
                          }}
                          className="flex-shrink-0 h-8 px-3 rounded-md border text-xs font-mono transition-colors
                            border-cyan-500/30 text-cyan-400/70 hover:bg-cyan-500/10 hover:text-cyan-400"
                        >
                          {locationSaved ? <Check className="size-3.5" /> : 'Save'}
                        </motion.button>
                      </div>
                      <div className="text-[10px] font-mono text-white/25">
                        Current: {weatherLocation}
                      </div>
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
                      onClick={handleExportMarkdown}
                      className="w-full font-mono border-cyan-500/20 text-cyan-400/70 hover:bg-cyan-500/10 hover:text-cyan-400"
                    >
                      <FileText className="size-4" />
                      Export as Markdown
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleExportConversations}
                      className="w-full font-mono border-cyan-500/20 text-cyan-400/70 hover:bg-cyan-500/10 hover:text-cyan-400"
                    >
                      <Download className="size-4" />
                      Export as JSON
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

                {/* Ambient Sound */}
                <section>
                  <SectionTitle icon={<CloudRain className="size-4" />}>Ambient Sound</SectionTitle>
                  <div className="space-y-4">
                    <div className="grid grid-cols-3 gap-2">
                      {AMBIENT_SOUNDS.map(({ key, label, icon }) => (
                        <motion.button
                          key={key}
                          whileHover={{ scale: 1.03 }}
                          whileTap={{ scale: 0.97 }}
                          onClick={() => setAmbientSound(key)}
                          className={`
                            flex flex-col items-center gap-1 py-2 px-1 rounded-lg transition-all duration-200
                            ${ambientSound === key
                              ? 'bg-purple-500/15 border border-purple-500/40'
                              : 'bg-white/[0.02] border border-transparent hover:bg-white/[0.04] hover:border-white/10'
                            }
                          `}
                        >
                          <span className={ambientSound === key ? 'text-purple-400' : 'text-white/30'}>
                            {icon}
                          </span>
                          <span className={`text-[9px] font-mono uppercase ${ambientSound === key ? 'text-purple-400' : 'text-white/25'}`}>
                            {label}
                          </span>
                        </motion.button>
                      ))}
                    </div>
                    {ambientSound !== 'none' && (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-mono text-white/70">Ambient Volume</span>
                          <span className="text-xs font-mono text-purple-400/60">
                            {Math.round(ambientVolume * 100)}%
                          </span>
                        </div>
                        <Slider
                          value={[ambientVolume * 100]}
                          onValueChange={([v]) => setAmbientVolume(v / 100)}
                          min={0}
                          max={100}
                          step={1}
                          className="[&_[data-slot=slider-range]]:bg-purple-500 [&_[data-slot=slider-thumb]]:border-purple-500"
                        />
                      </div>
                    )}
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
