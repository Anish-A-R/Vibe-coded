'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  X,
  Cpu,
  MemoryStick,
  Thermometer,
  Wifi,
  Brain,
  Mic,
  HardDrive,
  Clock,
  Activity,
  Scan,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Zap,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useJarvisStore } from '@/hooks/useJarvisStore'
import { useSystemStats } from '@/hooks/useSystemStats'
import { PERSONALITIES } from '@/lib/personalities'

interface SystemDiagnosticsProps {
  open: boolean
  onClose: () => void
}

function GaugeBar({
  label,
  value,
  max = 100,
  color,
  icon,
  unit = '%',
}: {
  label: string
  value: number
  max?: number
  color: string
  icon: React.ReactNode
  unit?: string
}) {
  const percentage = Math.min((value / max) * 100, 100)
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-xs font-mono" style={{ color: `${color}99` }}>
          {icon}
          {label}
        </div>
        <span className="text-xs font-mono font-bold" style={{ color }}>
          {value}{unit}
        </span>
      </div>
      <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
        <motion.div
          className="h-full rounded-full"
          style={{ backgroundColor: color, boxShadow: `0 0 8px ${color}66` }}
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 1, ease: 'easeOut' }}
        />
      </div>
    </div>
  )
}

function StatusBadge({ status }: { status: 'ok' | 'warning' | 'error' }) {
  const config = {
    ok: { color: '#22c55e', icon: <CheckCircle2 className="size-3" />, text: 'Operational' },
    warning: { color: '#eab308', icon: <AlertTriangle className="size-3" />, text: 'Warning' },
    error: { color: '#ef4444', icon: <XCircle className="size-3" />, text: 'Error' },
  }
  const c = config[status]
  return (
    <div
      className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono"
      style={{ backgroundColor: `${c.color}15`, color: c.color }}
    >
      {c.icon}
      {c.text}
    </div>
  )
}

function DiagCard({
  title,
  icon,
  children,
  delay = 0,
}: {
  title: string
  icon: React.ReactNode
  children: React.ReactNode
  delay?: number
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      className="rounded-xl border border-cyan-500/15 bg-black/40 backdrop-blur-xl p-4"
    >
      <div className="flex items-center gap-2 mb-3">
        <span className="text-cyan-400">{icon}</span>
        <h3 className="text-sm font-mono font-semibold text-cyan-400/90 tracking-wide uppercase">
          {title}
        </h3>
      </div>
      {children}
    </motion.div>
  )
}

function formatUptime(seconds: number): string {
  const d = Math.floor(seconds / 86400)
  const h = Math.floor((seconds % 86400) / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = seconds % 60
  if (d > 0) return `${d}d ${h}h ${m}m ${s}s`
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
}

export default function SystemDiagnostics({ open, onClose }: SystemDiagnosticsProps) {
  const stats = useSystemStats()
  const {
    personalityMode,
    messages,
    wakeWordEnabled,
    commandCount,
  } = useJarvisStore()
  const [scanning, setScanning] = useState(false)
  const [scanProgress, setScanProgress] = useState(0)
  const [latencyValues, setLatencyValues] = useState<number[]>([])

  // Generate latency values
  useEffect(() => {
    if (!open) return
    const generateLatency = () => {
      const base = stats.network === 'online' ? 22 : stats.network === 'weak' ? 85 : 0
      const jitter = stats.network === 'online' ? 15 : stats.network === 'weak' ? 40 : 0
      const val = stats.network !== 'offline' ? Math.round(base + Math.random() * jitter) : 0
      setLatencyValues((prev) => [...prev.slice(-19), val])
    }
    generateLatency()
    const interval = setInterval(generateLatency, 1000)
    return () => clearInterval(interval)
  }, [open, stats.network])

  const runScan = useCallback(() => {
    setScanning(true)
    setScanProgress(0)
    const duration = 3000
    const start = Date.now()

    const tick = () => {
      const elapsed = Date.now() - start
      const progress = Math.min((elapsed / duration) * 100, 100)
      setScanProgress(progress)

      if (progress < 100) {
        requestAnimationFrame(tick)
      } else {
        setScanning(false)
      }
    }
    requestAnimationFrame(tick)
  }, [])

  const personality = PERSONALITIES[personalityMode]
  const avgLatency = latencyValues.length > 0
    ? Math.round(latencyValues.reduce((a, b) => a + b, 0) / latencyValues.length)
    : 0

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
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md"
          />

          {/* Full screen overlay */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-50 overflow-hidden"
          >
            {/* Scan effect overlay */}
            {scanning && (
              <motion.div
                className="absolute inset-0 z-10 pointer-events-none"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <motion.div
                  className="absolute left-0 right-0 h-1"
                  style={{
                    background: 'linear-gradient(90deg, transparent, #00f0ff, transparent)',
                    boxShadow: '0 0 30px #00f0ff, 0 0 60px #00f0ff44',
                  }}
                  animate={{ top: ['0%', '100%'] }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                />
              </motion.div>
            )}

            {/* Header */}
            <div className="relative flex items-center justify-between p-4 border-b border-cyan-500/15 bg-black/40 backdrop-blur-xl">
              <div className="flex items-center gap-3">
                <Activity className="size-5 text-cyan-400" />
                <h2 className="text-lg font-mono font-bold text-cyan-400">System Diagnostics</h2>
                {scanning && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex items-center gap-1.5 text-xs font-mono text-cyan-400/60"
                  >
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    >
                      <Scan className="size-3.5" />
                    </motion.div>
                    Scanning... {Math.round(scanProgress)}%
                  </motion.div>
                )}
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={runScan}
                  disabled={scanning}
                  className="font-mono border-cyan-500/20 text-cyan-400/70 hover:bg-cyan-500/10 hover:text-cyan-400 disabled:opacity-30"
                >
                  <Scan className="size-3.5" />
                  {scanning ? 'Scanning...' : 'Run Full Scan'}
                </Button>
                <motion.button
                  whileHover={{ scale: 1.1, rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={onClose}
                  className="size-8 flex items-center justify-center rounded-lg border border-white/10 text-white/50 hover:text-white/80 hover:border-white/20 transition-colors"
                >
                  <X className="size-4" />
                </motion.button>
              </div>
            </div>

            {/* Content */}
            <ScrollArea className="h-[calc(100%-65px)]">
              <div className="p-4 sm:p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {/* Core Systems */}
                  <DiagCard title="Core Systems" icon={<Cpu className="size-4" />} delay={0}>
                    <div className="space-y-3">
                      <GaugeBar
                        label="CPU Usage"
                        value={stats.cpu}
                        color="#00f0ff"
                        icon={<Cpu className="size-3" />}
                      />
                      <GaugeBar
                        label="RAM Usage"
                        value={stats.ram}
                        color="#ff6a00"
                        icon={<MemoryStick className="size-3" />}
                      />
                      <GaugeBar
                        label="Temperature"
                        value={stats.temperature}
                        max={100}
                        color={stats.temperature > 70 ? '#ef4444' : stats.temperature > 50 ? '#eab308' : '#22c55e'}
                        icon={<Thermometer className="size-3" />}
                        unit="°C"
                      />
                      <div className="flex items-center justify-between mt-2">
                        <StatusBadge status={stats.cpu < 80 && stats.temperature < 70 ? 'ok' : 'warning'} />
                      </div>
                    </div>
                  </DiagCard>

                  {/* Network */}
                  <DiagCard title="Network" icon={<Wifi className="size-4" />} delay={0.05}>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-mono text-white/40">Status</span>
                        <StatusBadge status={stats.network === 'online' ? 'ok' : stats.network === 'weak' ? 'warning' : 'error'} />
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-mono text-white/40">Avg Latency</span>
                        <span className="text-xs font-mono text-cyan-400">{avgLatency}ms</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-mono text-white/40">Protocol</span>
                        <span className="text-xs font-mono text-white/50">IPv4 / TCP</span>
                      </div>
                      {/* Latency chart */}
                      <div className="mt-2">
                        <div className="text-[10px] font-mono text-white/20 mb-1">LATENCY HISTORY</div>
                        <div className="flex items-end gap-px" style={{ height: 24 }}>
                          {latencyValues.map((val, i) => {
                            const maxVal = Math.max(...latencyValues, 1)
                            const h = Math.max(1, (val / maxVal) * 24)
                            return (
                              <motion.div
                                key={i}
                                className="flex-1 rounded-sm"
                                style={{
                                  height: h,
                                  backgroundColor: val > 60 ? '#eab308' : '#22c55e',
                                  opacity: 0.3 + (i / latencyValues.length) * 0.7,
                                }}
                                animate={{ height: h }}
                                transition={{ duration: 0.2 }}
                              />
                            )
                          })}
                        </div>
                      </div>
                    </div>
                  </DiagCard>

                  {/* AI Engine */}
                  <DiagCard title="AI Engine" icon={<Brain className="size-4" />} delay={0.1}>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-mono text-white/40">Model</span>
                        <span className="text-xs font-mono text-cyan-400">GPT-4 Turbo</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-mono text-white/40">Personality</span>
                        <div className="flex items-center gap-1.5">
                          <span className="text-sm">{personality.icon}</span>
                          <span className="text-xs font-mono" style={{ color: personality.color }}>
                            {personality.name}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-mono text-white/40">Commands</span>
                        <span className="text-xs font-mono text-cyan-400">{commandCount}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-mono text-white/40">Status</span>
                        <StatusBadge status="ok" />
                      </div>
                    </div>
                  </DiagCard>

                  {/* Voice Module */}
                  <DiagCard title="Voice Module" icon={<Mic className="size-4" />} delay={0.15}>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-mono text-white/40">Recognition</span>
                        <StatusBadge status="ok" />
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-mono text-white/40">Wake Word</span>
                        <span className="text-xs font-mono" style={{ color: wakeWordEnabled ? '#22c55e' : '#ef4444' }}>
                          {wakeWordEnabled ? 'Enabled' : 'Disabled'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-mono text-white/40">Engine</span>
                        <span className="text-xs font-mono text-white/50">Web Speech API</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-mono text-white/40">Language</span>
                        <span className="text-xs font-mono text-white/50">en-US</span>
                      </div>
                      {/* Voice waveform simulation */}
                      <div className="flex items-center gap-0.5 justify-center mt-2" style={{ height: 16 }}>
                        {Array.from({ length: 20 }).map((_, i) => {
                          const h = 4 + Math.random() * 12
                          return (
                            <motion.div
                              key={i}
                              className="w-1 rounded-full"
                              style={{ backgroundColor: '#00f0ff' }}
                              animate={{
                                height: [4, h, 4],
                                opacity: [0.3, 0.7, 0.3],
                              }}
                              transition={{
                                duration: 0.5 + Math.random() * 0.5,
                                repeat: Infinity,
                                delay: i * 0.05,
                              }}
                            />
                          )
                        })}
                      </div>
                    </div>
                  </DiagCard>

                  {/* Memory */}
                  <DiagCard title="Memory" icon={<HardDrive className="size-4" />} delay={0.2}>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-mono text-white/40">Messages</span>
                        <span className="text-xs font-mono text-cyan-400">{messages.length}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-mono text-white/40">Storage Used</span>
                        <span className="text-xs font-mono text-cyan-400">
                          {(messages.length * 0.2).toFixed(1)} KB
                        </span>
                      </div>
                      <GaugeBar
                        label="Storage"
                        value={Math.min(messages.length * 0.5, 100)}
                        color="#00f0ff"
                        icon={<HardDrive className="size-3" />}
                      />
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-mono text-white/40">Max Capacity</span>
                        <span className="text-xs font-mono text-white/50">200 messages</span>
                      </div>
                    </div>
                  </DiagCard>

                  {/* Uptime */}
                  <DiagCard title="Uptime" icon={<Clock className="size-4" />} delay={0.25}>
                    <div className="space-y-3">
                      <div className="text-center">
                        <motion.div
                          className="text-3xl font-mono font-bold text-cyan-400"
                          style={{ textShadow: '0 0 10px rgba(0, 240, 255, 0.3)' }}
                          key={stats.uptime}
                        >
                          {formatUptime(stats.uptime)}
                        </motion.div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-mono text-white/40">System</span>
                        <StatusBadge status="ok" />
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-mono text-white/40">Last Restart</span>
                        <span className="text-xs font-mono text-white/50">Session start</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-mono text-white/40">Reliability</span>
                        <div className="flex items-center gap-1">
                          <Zap className="size-3 text-green-400" />
                          <span className="text-xs font-mono text-green-400">99.97%</span>
                        </div>
                      </div>
                    </div>
                  </DiagCard>
                </div>
              </div>
            </ScrollArea>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
