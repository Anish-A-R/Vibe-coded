'use client'

import { useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Heart, Activity, Cpu, Wifi, Thermometer, ChevronDown, ChevronUp } from 'lucide-react'
import { useJarvisStore } from '@/hooks/useJarvisStore'
import { useSystemStats } from '@/hooks/useSystemStats'

function HealthGauge({ value, size = 80 }: { value: number; size?: number }) {
  const strokeWidth = 4
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (value / 100) * circumference

  const getColor = (v: number) => {
    if (v >= 80) return '#00ff88'
    if (v >= 60) return '#00f0ff'
    if (v >= 40) return '#ffcc00'
    if (v >= 20) return '#ff6a00'
    return '#ff3366'
  }

  const color = getColor(value)

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="transform -rotate-90" viewBox={`0 0 ${size} ${size}`}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.05)"
          strokeWidth={strokeWidth}
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1, ease: 'easeOut' }}
          strokeLinecap="round"
          style={{
            filter: `drop-shadow(0 0 4px ${color}80)`,
          }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <motion.span
          className="text-xl font-mono font-bold"
          style={{ color, textShadow: `0 0 10px ${color}40` }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          {Math.round(value)}
        </motion.span>
        <span className="text-[7px] font-mono text-white/25 uppercase tracking-wider">Score</span>
      </div>
    </div>
  )
}

export default function SystemHealthWidget() {
  const { systemStats, collapsedWidgets, toggleWidgetCollapse } = useJarvisStore()
  const stats = useSystemStats()
  const widgetId = 'system-health'
  const isCollapsed = collapsedWidgets.includes(widgetId)

  // Derive health score and status from stats (no setState in effect)
  const { healthScore, statusLabel, statusColor } = useMemo(() => {
    const cpuScore = Math.max(0, 100 - stats.cpu * 1.2)
    const ramScore = Math.max(0, 100 - stats.ram * 1.1)
    const tempScore = stats.temperature < 50 ? 100 : stats.temperature < 70 ? 70 : stats.temperature < 85 ? 40 : 10
    const netScore = stats.network === 'online' ? 100 : stats.network === 'weak' ? 50 : 0
    const score = Math.round(cpuScore * 0.35 + ramScore * 0.25 + tempScore * 0.25 + netScore * 0.15)
    const clampedScore = Math.min(100, Math.max(0, score))

    if (score >= 80) return { healthScore: clampedScore, statusLabel: 'Optimal', statusColor: '#00ff88' }
    if (score >= 60) return { healthScore: clampedScore, statusLabel: 'Good', statusColor: '#00f0ff' }
    if (score >= 40) return { healthScore: clampedScore, statusLabel: 'Fair', statusColor: '#ffcc00' }
    if (score >= 20) return { healthScore: clampedScore, statusLabel: 'Degraded', statusColor: '#ff6a00' }
    return { healthScore: clampedScore, statusLabel: 'Critical', statusColor: '#ff3366' }
  }, [stats.cpu, stats.ram, stats.temperature, stats.network])

  const metrics = [
    { icon: <Cpu className="w-2.5 h-2.5" />, label: 'CPU', value: stats.cpu, max: 100, color: stats.cpu < 50 ? '#00f0ff' : stats.cpu < 80 ? '#ffcc00' : '#ff3366' },
    { icon: <Activity className="w-2.5 h-2.5" />, label: 'RAM', value: stats.ram, max: 100, color: stats.ram < 60 ? '#00ff88' : stats.ram < 85 ? '#ffcc00' : '#ff3366' },
    { icon: <Thermometer className="w-2.5 h-2.5" />, label: 'TEMP', value: stats.temperature, max: 100, color: stats.temperature < 50 ? '#00ff88' : stats.temperature < 70 ? '#ffcc00' : '#ff3366' },
    { icon: <Wifi className="w-2.5 h-2.5" />, label: 'NET', value: stats.network === 'online' ? 95 : stats.network === 'weak' ? 45 : 5, max: 100, color: stats.network === 'online' ? '#00ff88' : stats.network === 'weak' ? '#ffcc00' : '#ff3366' },
  ]

  return (
    <motion.div
      layout
      className="glass-panel holo-border-green inner-glow-cyan overflow-hidden"
    >
      {/* Header */}
      <button
        onClick={() => toggleWidgetCollapse(widgetId)}
        className="w-full flex items-center justify-between p-3 hover:bg-white/[0.02] transition-colors"
      >
        <div className="flex items-center gap-2">
          <Heart className="w-3.5 h-3.5 text-neon-green/60" />
          <span className="text-[10px] font-mono text-neon-green/60 uppercase tracking-wider font-semibold">
            System Health
          </span>
        </div>
        <div className="flex items-center gap-2">
          <motion.div
            className="w-2 h-2 rounded-full"
            style={{ backgroundColor: statusColor, boxShadow: `0 0 6px ${statusColor}60` }}
            animate={{ scale: [1, 1.2, 1], opacity: [0.7, 1, 0.7] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
          <span className="text-[8px] font-mono" style={{ color: `${statusColor}aa` }}>
            {statusLabel}
          </span>
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
              {/* Health Score Gauge */}
              <div className="flex items-center justify-center py-2">
                <HealthGauge value={healthScore} size={90} />
              </div>

              {/* Individual Metrics */}
              <div className="space-y-2">
                {metrics.map(({ icon, label, value, max, color }) => (
                  <div key={label} className="flex items-center gap-2">
                    <span style={{ color: `${color}88` }}>{icon}</span>
                    <span className="text-[9px] font-mono text-white/30 w-8">{label}</span>
                    <div className="flex-1 h-1.5 rounded-full bg-white/5 overflow-hidden">
                      <motion.div
                        className="h-full rounded-full"
                        style={{ backgroundColor: color, boxShadow: `0 0 4px ${color}40` }}
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min((value / max) * 100, 100)}%` }}
                        transition={{ duration: 0.8, ease: 'easeOut' }}
                      />
                    </div>
                    <span className="text-[8px] font-mono w-7 text-right" style={{ color: `${color}aa` }}>
                      {label === 'NET' ? (value > 80 ? 'OK' : value > 40 ? 'LOW' : 'OFF') : `${Math.round(value)}%`}
                    </span>
                  </div>
                ))}
              </div>

              {/* Health Assessment */}
              <div className="text-center py-1">
                <span className="text-[8px] font-mono text-white/15">
                  All subsystems monitored in real-time
                </span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
