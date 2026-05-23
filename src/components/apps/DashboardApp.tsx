'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import {
  Cloud, Sun, CloudRain, Wind, Droplets, Thermometer,
  Newspaper, TrendingUp, TrendingDown, Cpu, MemoryStick,
  BarChart3, Clock, Target, Zap, Activity, ArrowUpRight,
  ArrowDownRight, RefreshCw
} from 'lucide-react'
import { useJarvisStore } from '@/hooks/useJarvisStore'

interface DashboardAppProps {
  windowId?: string
}

// Simulated crypto data
const cryptoData = [
  { symbol: 'BTC', name: 'Bitcoin', price: 67432.18, change: 2.34, sparkline: [62, 64, 63, 66, 65, 67, 68, 67] },
  { symbol: 'ETH', name: 'Ethereum', price: 3521.45, change: -1.12, sparkline: [36, 35, 37, 36, 34, 35, 34, 35] },
  { symbol: 'SOL', name: 'Solana', price: 178.92, change: 5.67, sparkline: [160, 165, 170, 168, 172, 175, 178, 179] },
]

// Simulated news headlines
const newsHeadlines = [
  { title: 'Quantum Computing Breakthrough Promises 100x Speed Improvement', time: '2m ago', category: 'TECH' },
  { title: 'Global AI Safety Summit Reaches Historic Agreement', time: '15m ago', category: 'AI' },
  { title: 'Stark Industries Reports Record Q4 Earnings', time: '32m ago', category: 'FIN' },
  { title: 'New Neural Interface Allows Direct Brain-Computer Connection', time: '1h ago', category: 'SCI' },
  { title: 'Autonomous Vehicle Fleet Passes 10 Billion Miles', time: '2h ago', category: 'AUTO' },
  { title: 'Fusion Energy Reactor Achieves Net Positive Output', time: '3h ago', category: 'ENERGY' },
  { title: 'Next-Gen Holographic Display Technology Unveiled', time: '4h ago', category: 'TECH' },
]

function SparklineSVG({ data, color, width = 80, height = 30 }: { data: number[]; color: string; width?: number; height?: number }) {
  const min = Math.min(...data)
  const max = Math.max(...data)
  const range = max - min || 1
  const points = data.map((v, i) => {
    const x = (i / (data.length - 1)) * width
    const y = height - ((v - min) / range) * height
    return `${x},${y}`
  }).join(' ')

  return (
    <svg width={width} height={height} className="overflow-visible">
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <polyline
        points={`0,${height} ${points} ${width},${height}`}
        fill={`${color}15`}
        stroke="none"
      />
    </svg>
  )
}

function GaugeBar({ value, max, color, label, icon: Icon }: { value: number; max: number; color: string; label: string; icon: React.ElementType }) {
  const pct = Math.min((value / max) * 100, 100)
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <Icon className="w-3 h-3 text-white/30" />
          <span className="text-[10px] font-mono text-white/40 uppercase">{label}</span>
        </div>
        <motion.span
          key={value}
          initial={{ scale: 1.15 }}
          animate={{ scale: 1 }}
          className="text-[11px] font-mono font-bold"
          style={{ color }}
        >
          {value}%
        </motion.span>
      </div>
      <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
        <motion.div
          className="h-full rounded-full"
          style={{ backgroundColor: color }}
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        />
      </div>
    </div>
  )
}

export function DashboardApp({ windowId }: DashboardAppProps) {
  const { systemStats, weather, notes } = useJarvisStore()

  const [cmdPerSession, setCmdPerSession] = useState(24)
  const [avgResponseTime, setAvgResponseTime] = useState(1.2)
  const [focusMinutes, setFocusMinutes] = useState(45)
  const [cryptoPrices, setCryptoPrices] = useState(cryptoData)
  const [lastUpdate, setLastUpdate] = useState(Date.now())

  // Simulate live data updates
  useEffect(() => {
    const interval = setInterval(() => {
      setCmdPerSession(prev => Math.max(1, prev + Math.floor(Math.random() * 3) - 1))
      setAvgResponseTime(prev => Math.max(0.3, Math.min(3, prev + (Math.random() - 0.5) * 0.2)))
      setFocusMinutes(prev => Math.max(0, prev + (Math.random() > 0.5 ? 1 : 0)))
      setCryptoPrices(prev =>
        prev.map(c => ({
          ...c,
          price: c.price * (1 + (Math.random() - 0.5) * 0.002),
          change: c.change + (Math.random() - 0.5) * 0.1,
          sparkline: [...c.sparkline.slice(1), c.price * (1 + (Math.random() - 0.5) * 0.003)],
        }))
      )
      setLastUpdate(Date.now())
    }, 3000)
    return () => clearInterval(interval)
  }, [])

  const weatherIcon = weather?.condition?.toLowerCase().includes('rain')
    ? CloudRain
    : weather?.condition?.toLowerCase().includes('cloud')
      ? Cloud
      : Sun

  const WeatherIcon = weatherIcon

  return (
    <div className="flex flex-col h-full glass-panel overflow-hidden relative">
      {/* Animated gradient border */}
      <div className="absolute top-0 left-0 right-0 h-[1px] overflow-hidden">
        <motion.div
          className="h-full w-[200%]"
          style={{
            background: 'linear-gradient(90deg, transparent, rgba(0,240,255,0.6), rgba(0,255,136,0.4), transparent, rgba(0,240,255,0.6), transparent)',
            backgroundSize: '200% 100%',
          }}
          animate={{ backgroundPosition: ['0% 0%', '200% 0%'] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
        />
      </div>

      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-neon-cyan/10">
        <div className="flex items-center gap-2">
          <motion.div
            className="w-2 h-2 rounded-full bg-neon-cyan"
            animate={{ scale: [1, 1.3, 1], opacity: [0.6, 1, 0.6] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          />
          <h2 className="text-sm font-mono text-neon-cyan/80 uppercase tracking-wider">
            Dashboard
          </h2>
        </div>
        <div className="flex items-center gap-1.5">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
          >
            <RefreshCw className="w-3 h-3 text-white/20" />
          </motion.div>
          <span className="text-[9px] font-mono text-white/20">LIVE</span>
        </div>
      </div>

      {/* Dashboard Grid */}
      <div className="flex-1 overflow-y-auto jarvis-scrollbar p-3 space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">

          {/* Weather Widget */}
          <div className="rounded-xl p-4 bg-white/[0.02] border border-white/5 hover:border-neon-cyan/15 transition-colors">
            <div className="flex items-center gap-1.5 mb-3">
              <Cloud className="w-3 h-3 text-neon-cyan/50" />
              <span className="text-[10px] font-mono text-neon-cyan/50 uppercase tracking-wider">Weather</span>
            </div>
            {weather ? (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <WeatherIcon className="w-6 h-6 text-neon-orange/70" />
                    <span className="text-2xl font-mono font-bold text-white/80">{Math.round(weather.temp)}°</span>
                  </div>
                  <span className="text-[10px] font-mono text-white/30">{weather.location}</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1">
                    <Droplets className="w-3 h-3 text-neon-cyan/40" />
                    <span className="text-[10px] font-mono text-white/40">{weather.humidity}%</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Wind className="w-3 h-3 text-neon-cyan/40" />
                    <span className="text-[10px] font-mono text-white/40">{weather.wind} km/h</span>
                  </div>
                  <span className="text-[9px] font-mono text-white/20 ml-auto">
                    {weather.source === 'live' ? 'LIVE' : 'SIM'}
                  </span>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <motion.div
                  className="w-5 h-5 border border-neon-cyan/30 rounded-full"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
                  style={{ borderTopColor: 'transparent' }}
                />
                <span className="text-[11px] font-mono text-white/30">Loading...</span>
              </div>
            )}
          </div>

          {/* System Performance */}
          <div className="rounded-xl p-4 bg-white/[0.02] border border-white/5 hover:border-neon-cyan/15 transition-colors">
            <div className="flex items-center gap-1.5 mb-3">
              <Activity className="w-3 h-3 text-neon-cyan/50" />
              <span className="text-[10px] font-mono text-neon-cyan/50 uppercase tracking-wider">System</span>
            </div>
            <div className="space-y-3">
              <GaugeBar value={systemStats.cpu} max={100} color={systemStats.cpu > 70 ? '#ff3366' : systemStats.cpu > 50 ? '#ffcc00' : '#00ff88'} label="CPU" icon={Cpu} />
              <GaugeBar value={systemStats.ram} max={100} color={systemStats.ram > 80 ? '#ff3366' : systemStats.ram > 60 ? '#ffcc00' : '#00f0ff'} label="RAM" icon={MemoryStick} />
              <GaugeBar value={systemStats.temperature} max={100} color={systemStats.temperature > 70 ? '#ff3366' : systemStats.temperature > 50 ? '#ffcc00' : '#00ff88'} label="TEMP" icon={Thermometer} />
            </div>
          </div>

          {/* Crypto Ticker */}
          <div className="rounded-xl p-4 bg-white/[0.02] border border-white/5 hover:border-neon-cyan/15 transition-colors">
            <div className="flex items-center gap-1.5 mb-3">
              <BarChart3 className="w-3 h-3 text-neon-cyan/50" />
              <span className="text-[10px] font-mono text-neon-cyan/50 uppercase tracking-wider">Crypto</span>
            </div>
            <div className="space-y-2.5">
              {cryptoPrices.map((coin) => (
                <div key={coin.symbol} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono font-bold text-white/60 w-8">{coin.symbol}</span>
                    <SparklineSVG
                      data={coin.sparkline}
                      color={coin.change >= 0 ? '#00ff88' : '#ff3366'}
                      width={50}
                      height={20}
                    />
                  </div>
                  <div className="text-right">
                    <div className="text-[11px] font-mono text-white/70">
                      ${coin.price.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                    </div>
                    <div className={`flex items-center gap-0.5 text-[9px] font-mono ${coin.change >= 0 ? 'text-neon-green' : 'text-neon-red'}`}>
                      {coin.change >= 0 ? <ArrowUpRight className="w-2.5 h-2.5" /> : <ArrowDownRight className="w-2.5 h-2.5" />}
                      {Math.abs(coin.change).toFixed(2)}%
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* AI Analytics */}
          <div className="rounded-xl p-4 bg-white/[0.02] border border-white/5 hover:border-neon-cyan/15 transition-colors">
            <div className="flex items-center gap-1.5 mb-3">
              <Zap className="w-3 h-3 text-neon-cyan/50" />
              <span className="text-[10px] font-mono text-neon-cyan/50 uppercase tracking-wider">AI Analytics</span>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono text-white/30">Commands/Session</span>
                <motion.span
                  key={cmdPerSession}
                  initial={{ scale: 1.2, color: '#00f0ff' }}
                  animate={{ scale: 1, color: 'rgba(255,255,255,0.6)' }}
                  className="text-sm font-mono font-bold"
                >
                  {cmdPerSession}
                </motion.span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono text-white/30">Avg Response</span>
                <motion.span
                  key={avgResponseTime.toFixed(2)}
                  initial={{ scale: 1.2, color: '#00f0ff' }}
                  animate={{ scale: 1, color: 'rgba(255,255,255,0.6)' }}
                  className="text-sm font-mono font-bold"
                >
                  {avgResponseTime.toFixed(2)}s
                </motion.span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono text-white/30">Uptime</span>
                <span className="text-sm font-mono font-bold text-white/60">
                  {Math.floor(systemStats.uptime / 3600)}h {Math.floor((systemStats.uptime % 3600) / 60)}m
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono text-white/30">Network</span>
                <div className="flex items-center gap-1">
                  <motion.div
                    className={`w-1.5 h-1.5 rounded-full ${systemStats.network === 'online' ? 'bg-neon-green' : systemStats.network === 'weak' ? 'bg-neon-orange' : 'bg-neon-red'}`}
                    animate={systemStats.network !== 'online' ? { opacity: [1, 0.3, 1] } : {}}
                    transition={{ duration: 1, repeat: Infinity }}
                  />
                  <span className="text-[10px] font-mono text-white/50 uppercase">{systemStats.network}</span>
                </div>
              </div>
            </div>
          </div>

          {/* News Ticker */}
          <div className="rounded-xl p-4 bg-white/[0.02] border border-white/5 hover:border-neon-cyan/15 transition-colors sm:col-span-2">
            <div className="flex items-center gap-1.5 mb-3">
              <Newspaper className="w-3 h-3 text-neon-cyan/50" />
              <span className="text-[10px] font-mono text-neon-cyan/50 uppercase tracking-wider">News Feed</span>
            </div>
            <div className="max-h-32 overflow-y-auto jarvis-scrollbar space-y-2">
              {newsHeadlines.map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="flex items-start gap-2 py-1 border-b border-white/5 last:border-0"
                >
                  <span className="text-[8px] font-mono font-bold text-neon-cyan/40 bg-neon-cyan/5 px-1 py-0.5 rounded mt-0.5 flex-shrink-0">
                    {item.category}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] font-mono text-white/50 leading-relaxed truncate">{item.title}</p>
                    <span className="text-[8px] font-mono text-white/20">{item.time}</span>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Productivity Tracker */}
          <div className="rounded-xl p-4 bg-white/[0.02] border border-white/5 hover:border-neon-cyan/15 transition-colors sm:col-span-2">
            <div className="flex items-center gap-1.5 mb-3">
              <Target className="w-3 h-3 text-neon-cyan/50" />
              <span className="text-[10px] font-mono text-neon-cyan/50 uppercase tracking-wider">Productivity</span>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="text-center">
                <motion.div
                  key={focusMinutes}
                  initial={{ scale: 1.15 }}
                  animate={{ scale: 1 }}
                  className="text-lg font-mono font-bold text-neon-green/80"
                >
                  {focusMinutes}
                </motion.div>
                <div className="text-[9px] font-mono text-white/30 uppercase">Focus Min</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-mono font-bold text-neon-cyan/80">{notes.length}</div>
                <div className="text-[9px] font-mono text-white/30 uppercase">Notes</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-mono font-bold text-neon-orange/80">
                  {systemStats.cpu < 50 ? 'High' : systemStats.cpu < 80 ? 'Med' : 'Low'}
                </div>
                <div className="text-[9px] font-mono text-white/30 uppercase">Efficiency</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between px-4 py-2 border-t border-neon-cyan/10">
        <span className="text-[9px] font-mono text-white/20">
          Last update: {new Date(lastUpdate).toLocaleTimeString()}
        </span>
        <div className="flex items-center gap-1.5">
          <Clock className="w-2.5 h-2.5 text-white/20" />
          <span className="text-[9px] font-mono text-white/20">Auto-refresh</span>
        </div>
      </div>
    </div>
  )
}
