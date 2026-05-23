'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Shield, ShieldCheck, ShieldAlert, Lock, Unlock, Wifi, WifiOff,
  Scan, Eye, Activity, AlertTriangle, CheckCircle, XCircle,
  Radio, Server, Globe, Clock, RefreshCw, Fingerprint
} from 'lucide-react'
import { useJarvisStore } from '@/hooks/useJarvisStore'
import { playActivationSound, playErrorSound } from '@/lib/sounds'

interface SecurityAppProps {
  windowId?: string
}

interface SecurityEvent {
  id: string
  type: 'info' | 'warning' | 'success' | 'error'
  message: string
  timestamp: number
}

const threatLevels = [
  { level: 0, label: 'SECURE', color: '#00ff88', bgColor: 'bg-neon-green/10', textColor: 'text-neon-green' },
  { level: 1, label: 'LOW', color: '#ffcc00', bgColor: 'bg-neon-orange/10', textColor: 'text-neon-orange' },
  { level: 2, label: 'MODERATE', color: '#ff6b35', bgColor: 'bg-neon-orange/15', textColor: 'text-neon-orange' },
  { level: 3, label: 'HIGH', color: '#ff3366', bgColor: 'bg-neon-red/10', textColor: 'text-neon-red' },
]

const simulatedEvents: Omit<SecurityEvent, 'id' | 'timestamp'>[] = [
  { type: 'info', message: 'Firewall rule updated: Block port 4444' },
  { type: 'success', message: 'SSL certificate renewed for *.jarvis.ai' },
  { type: 'warning', message: 'Unusual login attempt from 192.168.1.42' },
  { type: 'info', message: 'Network scan completed: 24 devices found' },
  { type: 'success', message: 'Intrusion detection system calibrated' },
  { type: 'error', message: 'Failed SSH attempt from 10.0.0.99 (blocked)' },
  { type: 'info', message: 'DNS cache flushed successfully' },
  { type: 'warning', message: 'High traffic detected on port 8080' },
  { type: 'success', message: 'Security patch applied: CVE-2024-1234' },
  { type: 'info', message: 'VPN tunnel established to secure gateway' },
  { type: 'success', message: 'Two-factor authentication verified' },
  { type: 'warning', message: 'Certificate expiration warning: 15 days' },
]

function ThreatGauge({ level, size = 100 }: { level: number; size?: number }) {
  const threat = threatLevels[level]
  const radius = (size - 10) / 2
  const circumference = 2 * Math.PI * radius
  const progress = ((level + 1) / threatLevels.length) * circumference
  const center = size / 2

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        {/* Background circle */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.05)"
          strokeWidth={6}
        />
        {/* Progress circle */}
        <motion.circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke={threat.color}
          strokeWidth={6}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: circumference - progress }}
          transition={{ duration: 1, ease: 'easeOut' }}
          style={{
            filter: `drop-shadow(0 0 6px ${threat.color}60)`,
          }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <motion.span
          key={level}
          initial={{ scale: 1.3 }}
          animate={{ scale: 1 }}
          className="text-xs font-mono font-bold"
          style={{ color: threat.color }}
        >
          {threat.label}
        </motion.span>
        <span className="text-[8px] font-mono text-white/20 mt-0.5">THREAT</span>
      </div>
    </div>
  )
}

export function SecurityApp({ windowId }: SecurityAppProps) {
  const { systemStats, soundEnabled, addNotification } = useJarvisStore()

  const [firewallEnabled, setFirewallEnabled] = useState(true)
  const [encryptionActive, setEncryptionActive] = useState(true)
  const [threatLevel, setThreatLevel] = useState(0)
  const [isScanning, setIsScanning] = useState(false)
  const [scanProgress, setScanProgress] = useState(0)
  const [portScanActive, setPortScanActive] = useState(false)
  const [portScanIndex, setPortScanIndex] = useState(0)
  const [events, setEvents] = useState<SecurityEvent[]>([
    { id: 'init-1', type: 'success', message: 'Security subsystem initialized', timestamp: Date.now() },
    { id: 'init-2', type: 'info', message: 'Firewall active — monitoring all traffic', timestamp: Date.now() - 1000 },
    { id: 'init-3', type: 'success', message: 'AES-256 encryption verified', timestamp: Date.now() - 2000 },
  ])

  // Port scan animation
  useEffect(() => {
    if (!portScanActive) return
    const interval = setInterval(() => {
      setPortScanIndex(prev => {
        if (prev >= 99) {
          setPortScanActive(false)
          return 0
        }
        return prev + 1
      })
    }, 50)
    return () => clearInterval(interval)
  }, [portScanActive])

  // Occasional random events
  useEffect(() => {
    const interval = setInterval(() => {
      const event = simulatedEvents[Math.floor(Math.random() * simulatedEvents.length)]
      const newEvent: SecurityEvent = {
        ...event,
        id: `sevt-${Date.now()}`,
        timestamp: Date.now(),
      }
      setEvents(prev => [newEvent, ...prev].slice(0, 30))
    }, 8000)
    return () => clearInterval(interval)
  }, [])

  const runSecurityScan = useCallback(() => {
    if (isScanning) return
    setIsScanning(true)
    setScanProgress(0)

    if (soundEnabled) playActivationSound()

    const scanSteps = [
      'Scanning network interfaces...',
      'Checking firewall rules...',
      'Verifying encryption protocols...',
      'Analyzing open ports...',
      'Inspecting DNS records...',
      'Reviewing access logs...',
      'Validating SSL certificates...',
      'Testing intrusion detection...',
    ]

    let step = 0
    const stepInterval = setInterval(() => {
      if (step < scanSteps.length) {
        setEvents(prev => [
          { id: `scan-${Date.now()}-${step}`, type: 'info', message: scanSteps[step], timestamp: Date.now() },
          ...prev,
        ].slice(0, 30))
        setScanProgress(Math.round(((step + 1) / scanSteps.length) * 100))
        step++
      } else {
        clearInterval(stepInterval)
        setIsScanning(false)
        setScanProgress(100)
        setThreatLevel(0)
        setEvents(prev => [
          { id: `scan-done-${Date.now()}`, type: 'success', message: 'Security scan complete — All systems secure', timestamp: Date.now() },
          ...prev,
        ].slice(0, 30))
        addNotification({
          type: 'success',
          title: 'Security Scan Complete',
          message: 'All systems secure. No threats detected.',
        })
        if (soundEnabled) playActivationSound()
        setTimeout(() => setScanProgress(0), 2000)
      }
    }, 600)
  }, [isScanning, soundEnabled, addNotification])

  const eventIconMap = {
    info: Eye,
    warning: AlertTriangle,
    success: CheckCircle,
    error: XCircle,
  }

  const eventColorMap = {
    info: 'text-neon-cyan/60',
    warning: 'text-neon-orange/60',
    success: 'text-neon-green/60',
    error: 'text-neon-red/60',
  }

  const ports = [22, 80, 443, 3000, 5432, 8080, 8443]

  return (
    <div className="flex flex-col h-full glass-panel overflow-hidden relative">
      {/* Animated gradient border */}
      <div className="absolute top-0 left-0 right-0 h-[1px] overflow-hidden">
        <motion.div
          className="h-full w-[200%]"
          style={{
            background: 'linear-gradient(90deg, transparent, rgba(255,51,102,0.6), rgba(0,255,136,0.4), transparent, rgba(255,51,102,0.6), transparent)',
            backgroundSize: '200% 100%',
          }}
          animate={{ backgroundPosition: ['0% 0%', '200% 0%'] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
        />
      </div>

      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-neon-red/10">
        <div className="flex items-center gap-2">
          <motion.div
            className="w-2 h-2 rounded-full bg-neon-green"
            animate={{ scale: [1, 1.3, 1], opacity: [0.6, 1, 0.6] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          />
          <h2 className="text-sm font-mono text-neon-red/80 uppercase tracking-wider">
            Security Center
          </h2>
        </div>
        <div className="flex items-center gap-1.5">
          <motion.div
            className={`w-1.5 h-1.5 rounded-full ${systemStats.network === 'online' ? 'bg-neon-green' : 'bg-neon-red'}`}
            animate={systemStats.network !== 'online' ? { opacity: [1, 0.3, 1] } : {}}
            transition={{ duration: 1, repeat: Infinity }}
          />
          <span className="text-[9px] font-mono text-white/30 uppercase">{systemStats.network}</span>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto jarvis-scrollbar p-3 space-y-3">

        {/* Top Row: Network + Threat + Firewall */}
        <div className="grid grid-cols-3 gap-3">
          {/* Network Status */}
          <div className="rounded-xl p-3 bg-white/[0.02] border border-white/5 text-center">
            <div className="flex items-center justify-center gap-1.5 mb-2">
              {systemStats.network === 'online' ? (
                <Wifi className="w-4 h-4 text-neon-green/60" />
              ) : (
                <WifiOff className="w-4 h-4 text-neon-red/60" />
              )}
            </div>
            <motion.div
              key={systemStats.network}
              initial={{ scale: 1.2 }}
              animate={{ scale: 1 }}
              className={`text-xs font-mono font-bold uppercase ${systemStats.network === 'online' ? 'text-neon-green' : systemStats.network === 'weak' ? 'text-neon-orange' : 'text-neon-red'}`}
            >
              {systemStats.network}
            </motion.div>
            <span className="text-[8px] font-mono text-white/20">NETWORK</span>
          </div>

          {/* Threat Level */}
          <div className="rounded-xl p-3 bg-white/[0.02] border border-white/5 flex flex-col items-center justify-center">
            <ThreatGauge level={threatLevel} size={70} />
          </div>

          {/* Firewall Toggle */}
          <div className="rounded-xl p-3 bg-white/[0.02] border border-white/5 text-center">
            <div className="flex items-center justify-center gap-1.5 mb-2">
              {firewallEnabled ? (
                <ShieldCheck className="w-4 h-4 text-neon-green/60" />
              ) : (
                <ShieldAlert className="w-4 h-4 text-neon-red/60" />
              )}
            </div>
            <button
              onClick={() => {
                setFirewallEnabled(!firewallEnabled)
                if (soundEnabled) playActivationSound()
              }}
              className={`relative w-10 h-5 rounded-full transition-colors duration-300 ${firewallEnabled ? 'bg-neon-green/30' : 'bg-white/10'}`}
            >
              <motion.div
                className="absolute top-0.5 w-4 h-4 rounded-full"
                style={{ backgroundColor: firewallEnabled ? '#00ff88' : '#64748b' }}
                animate={{ left: firewallEnabled ? '22px' : '2px' }}
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              />
            </button>
            <span className="text-[8px] font-mono text-white/20 mt-1 block">FIREWALL</span>
          </div>
        </div>

        {/* Encryption Status */}
        <div className="rounded-xl p-3 bg-white/[0.02] border border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {encryptionActive ? (
              <Lock className="w-4 h-4 text-neon-green/60" />
            ) : (
              <Unlock className="w-4 h-4 text-neon-red/60" />
            )}
            <div>
              <span className="text-[10px] font-mono text-white/60">Encryption</span>
              <div className="text-[9px] font-mono text-white/25">AES-256-GCM</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <motion.div
              className={`w-1.5 h-1.5 rounded-full ${encryptionActive ? 'bg-neon-green' : 'bg-neon-red'}`}
              animate={encryptionActive ? {} : { opacity: [1, 0.3, 1] }}
              transition={{ duration: 1, repeat: Infinity }}
            />
            <span className={`text-[10px] font-mono uppercase ${encryptionActive ? 'text-neon-green/70' : 'text-neon-red/70'}`}>
              {encryptionActive ? 'ACTIVE' : 'INACTIVE'}
            </span>
          </div>
        </div>

        {/* Port Scan Simulation */}
        <div className="rounded-xl p-3 bg-white/[0.02] border border-white/5">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5">
              <Server className="w-3 h-3 text-neon-cyan/50" />
              <span className="text-[10px] font-mono text-white/40 uppercase tracking-wider">Port Scan</span>
            </div>
            <button
              onClick={() => {
                setPortScanActive(true)
                setPortScanIndex(0)
                if (soundEnabled) playActivationSound()
              }}
              disabled={portScanActive}
              className="text-[9px] font-mono uppercase tracking-wider text-neon-cyan/50 hover:text-neon-cyan/80 disabled:opacity-30 transition-colors"
            >
              {portScanActive ? 'Scanning...' : 'Scan Ports'}
            </button>
          </div>
          <div className="grid grid-cols-7 gap-1">
            {ports.map((port, i) => {
              const isScanned = portScanActive && i <= Math.floor(portScanIndex / (100 / ports.length))
              return (
                <motion.div
                  key={port}
                  className={`text-center py-1 rounded text-[9px] font-mono border transition-all duration-300 ${
                    isScanned
                      ? 'bg-neon-green/10 border-neon-green/20 text-neon-green/70'
                      : 'bg-white/[0.02] border-white/5 text-white/20'
                  }`}
                  animate={portScanActive && i === Math.floor(portScanIndex / (100 / ports.length)) ? {
                    scale: [1, 1.1, 1],
                  } : {}}
                  transition={{ duration: 0.3 }}
                >
                  {port}
                </motion.div>
              )
            })}
          </div>
        </div>

        {/* Run Security Scan Button */}
        <motion.button
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          onClick={runSecurityScan}
          disabled={isScanning}
          className="w-full py-3 rounded-xl border border-neon-red/20 bg-neon-red/5 text-neon-red/70 hover:bg-neon-red/10 hover:border-neon-red/30 hover:text-neon-red disabled:opacity-40 disabled:cursor-wait transition-all flex items-center justify-center gap-2"
        >
          {isScanning ? (
            <>
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              >
                <RefreshCw className="w-4 h-4" />
              </motion.div>
              <span className="text-[11px] font-mono uppercase tracking-wider">
                Scanning... {scanProgress}%
              </span>
            </>
          ) : (
            <>
              <Scan className="w-4 h-4" />
              <span className="text-[11px] font-mono uppercase tracking-wider">Run Security Scan</span>
            </>
          )}
        </motion.button>

        {/* Scan Progress */}
        {isScanning && (
          <div className="h-1 rounded-full bg-white/5 overflow-hidden">
            <motion.div
              className="h-full rounded-full bg-neon-red/60"
              initial={{ width: 0 }}
              animate={{ width: `${scanProgress}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        )}

        {/* Activity Log */}
        <div className="rounded-xl p-3 bg-white/[0.02] border border-white/5">
          <div className="flex items-center gap-1.5 mb-2">
            <Activity className="w-3 h-3 text-neon-cyan/50" />
            <span className="text-[10px] font-mono text-white/40 uppercase tracking-wider">Activity Log</span>
          </div>
          <div className="max-h-36 overflow-y-auto jarvis-scrollbar space-y-1">
            <AnimatePresence>
              {events.map((event) => {
                const EventIcon = eventIconMap[event.type]
                return (
                  <motion.div
                    key={event.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0 }}
                    className="flex items-start gap-1.5 py-1"
                  >
                    <EventIcon className={`w-3 h-3 mt-0.5 flex-shrink-0 ${eventColorMap[event.type]}`} />
                    <div className="flex-1 min-w-0">
                      <span className="text-[10px] font-mono text-white/40 leading-relaxed">{event.message}</span>
                    </div>
                    <span className="text-[8px] font-mono text-white/15 flex-shrink-0">
                      {new Date(event.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </span>
                  </motion.div>
                )
              })}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between px-4 py-2 border-t border-neon-red/10">
        <div className="flex items-center gap-2">
          <Fingerprint className="w-3 h-3 text-white/20" />
          <span className="text-[9px] font-mono text-white/20">Identity verified</span>
        </div>
        <div className="flex items-center gap-1">
          <Shield className="w-2.5 h-2.5 text-neon-green/40" />
          <span className="text-[9px] font-mono text-neon-green/40 uppercase">Secure</span>
        </div>
      </div>
    </div>
  )
}
