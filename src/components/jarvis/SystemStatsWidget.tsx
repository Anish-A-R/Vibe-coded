'use client'

import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { Cpu, MemoryStick, Thermometer, Clock, TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { useSystemStats } from '@/hooks/useSystemStats'

function CircularGauge({
  value,
  color,
  label,
  icon,
  trend,
}: {
  value: number
  color: string
  label: string
  icon: React.ReactNode
  trend: 'up' | 'down' | 'stable'
}) {
  const radius = 32
  const circumference = 2 * Math.PI * radius
  const strokeDashoffset = circumference * (1 - value / 100)

  const trendIcon = trend === 'up' 
    ? <TrendingUp className="size-2.5 text-red-400/70" />
    : trend === 'down' 
    ? <TrendingDown className="size-2.5 text-green-400/70" />
    : <Minus className="size-2.5 text-white/30" />

  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative gauge-breathe">
        <svg width="76" height="76" viewBox="0 0 76 76" className="transform -rotate-90">
          {/* Background circle */}
          <circle
            cx="38"
            cy="38"
            r={radius}
            stroke="rgba(255,255,255,0.05)"
            strokeWidth="5"
            fill="none"
          />
          {/* Progress arc */}
          <motion.circle
            cx="38"
            cy="38"
            r={radius}
            stroke={color}
            strokeWidth="5"
            fill="none"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={circumference}
            animate={{ strokeDashoffset }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            style={{ filter: `drop-shadow(0 0 6px ${color}66)` }}
          />
        </svg>
        {/* Center text */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div className="text-sm font-mono font-bold" style={{ color }}>
              {value}%
            </div>
          </div>
        </div>
        {/* Trend sparkline indicator */}
        <div className="absolute -bottom-0.5 -right-0.5">
          {trendIcon}
        </div>
      </div>
      <div className="flex items-center gap-1 text-xs font-mono" style={{ color: `${color}99` }}>
        {icon}
        {label}
      </div>
    </div>
  )
}

function formatUptime(seconds: number): string {
  const h = Math.floor(seconds / 3600).toString().padStart(2, '0')
  const m = Math.floor((seconds % 3600) / 60).toString().padStart(2, '0')
  const s = (seconds % 60).toString().padStart(2, '0')
  return `${h}:${m}:${s}`
}

export default function SystemStatsWidget() {
  const stats = useSystemStats()
  const cpuHistoryRef = useRef<number[]>(Array(10).fill(stats.cpu))
  const [cpuHistory, setCpuHistory] = useState<number[]>(() =>
    Array(10).fill(stats.cpu)
  )

  useEffect(() => {
    const id = requestAnimationFrame(() => {
      cpuHistoryRef.current = [...cpuHistoryRef.current.slice(1), stats.cpu]
      setCpuHistory([...cpuHistoryRef.current])
    })
    return () => cancelAnimationFrame(id)
  }, [stats.cpu])

  const maxCpu = Math.max(...cpuHistory, 1)
  const barHeight = 32

  // Determine trend from cpuHistory (no refs needed)
  const cpuTrend: 'up' | 'down' | 'stable' = cpuHistory.length >= 2
    ? cpuHistory[cpuHistory.length - 1] > cpuHistory[cpuHistory.length - 2] + 2
      ? 'up'
      : cpuHistory[cpuHistory.length - 1] < cpuHistory[cpuHistory.length - 2] - 2
        ? 'down'
        : 'stable'
    : 'stable'
  const ramTrend: 'up' | 'down' | 'stable' = 'stable'

  // Temperature color coding
  const tempColor = stats.temperature > 70 ? '#ff3366' : stats.temperature > 50 ? '#ffcc00' : '#00ff88'
  const tempGlow = stats.temperature > 70
    ? '0 0 8px rgba(255, 51, 102, 0.5)'
    : stats.temperature > 50
    ? '0 0 8px rgba(255, 204, 0, 0.5)'
    : '0 0 8px rgba(0, 255, 136, 0.5)'

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="relative overflow-hidden rounded-xl border border-cyan-500/20 bg-black/40 backdrop-blur-xl p-4 holo-border-cyan inner-glow-cyan"
    >
      {/* Corner accents */}
      <div className="absolute top-0 left-0 h-4 w-4 border-t border-l border-cyan-500/40 z-[2]" />
      <div className="absolute top-0 right-0 h-4 w-4 border-t border-r border-cyan-500/40 z-[2]" />
      <div className="absolute bottom-0 left-0 h-4 w-4 border-b border-l border-cyan-500/40 z-[2]" />
      <div className="absolute bottom-0 right-0 h-4 w-4 border-b border-r border-cyan-500/40 z-[2]" />

      {/* Gauges */}
      <div className="relative z-[2] flex items-center justify-around mb-4">
        <CircularGauge
          value={stats.cpu}
          color="#00f0ff"
          label="CPU"
          icon={<Cpu className="size-3" />}
          trend={cpuTrend}
        />
        <CircularGauge
          value={stats.ram}
          color="#ff6a00"
          label="RAM"
          icon={<MemoryStick className="size-3" />}
          trend={ramTrend}
        />
      </div>

      {/* CPU History Bar Chart with gradient fill */}
      <div className="relative z-[2] mb-3">
        <div className="text-[10px] text-cyan-400/40 font-mono mb-1">CPU HISTORY</div>
        <div className="flex items-end gap-1" style={{ height: barHeight }}>
          {cpuHistory.map((val, i) => {
            const height = Math.max(2, (val / maxCpu) * barHeight)
            return (
              <motion.div
                key={i}
                className="flex-1 rounded-sm relative overflow-hidden"
                style={{ height }}
                animate={{ height }}
                transition={{ duration: 0.3 }}
              >
                {/* Gradient fill from bottom to top */}
                <div
                  className="absolute inset-0"
                  style={{
                    background: val > 70
                      ? 'linear-gradient(to top, rgba(255, 106, 0, 0.3), rgba(255, 51, 102, 0.7))'
                      : val > 40
                      ? 'linear-gradient(to top, rgba(0, 240, 255, 0.2), rgba(255, 204, 0, 0.6))'
                      : 'linear-gradient(to top, rgba(0, 240, 255, 0.15), rgba(0, 240, 255, 0.5))',
                    opacity: 0.4 + (i / cpuHistory.length) * 0.6,
                  }}
                />
              </motion.div>
            )
          })}
        </div>
      </div>

      {/* Bottom stats */}
      <div className="relative z-[2] flex items-center justify-between text-xs font-mono">
        <div className="flex items-center gap-1">
          <Thermometer className="size-3" />
          <span
            style={{ color: tempColor, textShadow: tempGlow }}
            className="font-bold transition-colors duration-500"
          >
            {stats.temperature}°C
          </span>
        </div>
        <div className="flex items-center gap-1 text-cyan-400/50">
          <Clock className="size-3" />
          <span>{formatUptime(stats.uptime)}</span>
        </div>
      </div>
    </motion.div>
  )
}
