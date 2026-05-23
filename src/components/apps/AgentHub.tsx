'use client'

import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Code2, Search, CheckSquare, Shield, Zap, Palette, Cpu, Activity, Power, PowerOff } from 'lucide-react'
import { useJarvisStore, type AgentType } from '@/hooks/useJarvisStore'
import { playActivationSound, playDeactivationSound } from '@/lib/sounds'

interface AgentHubProps {
  windowId?: string
}

const agentIconMap: Record<string, React.ElementType> = {
  coding: Code2,
  research: Search,
  productivity: CheckSquare,
  security: Shield,
  automation: Zap,
  creative: Palette,
  system: Cpu,
}

const statusConfig = {
  idle: { color: 'bg-gray-500/60', text: 'text-gray-400', border: 'border-gray-500/20', label: 'IDLE', pulse: false },
  active: { color: 'bg-neon-cyan/60', text: 'text-neon-cyan', border: 'border-neon-cyan/30', label: 'ACTIVE', pulse: true },
  processing: { color: 'bg-neon-orange/60', text: 'text-neon-orange', border: 'border-neon-orange/30', label: 'PROCESSING', pulse: true },
  error: { color: 'bg-neon-red/60', text: 'text-neon-red', border: 'border-neon-red/30', label: 'ERROR', pulse: true },
}

export function AgentHub({ windowId }: AgentHubProps) {
  const {
    agents,
    activeAgentId,
    setActiveAgent,
    updateAgentStatus,
    incrementAgentTasks,
    soundEnabled,
    addNotification,
  } = useJarvisStore()

  const [processingAgent, setProcessingAgent] = useState<AgentType | null>(null)

  const totalActive = agents.filter(a => a.status === 'active' || a.status === 'processing').length
  const totalTasks = agents.reduce((sum, a) => sum + a.tasksCompleted, 0)

  const handleToggleAgent = useCallback((agentId: AgentType) => {
    const agent = agents.find(a => a.id === agentId)
    if (!agent) return

    if (agent.status === 'idle' || agent.status === 'error') {
      // Activate agent
      setProcessingAgent(agentId)
      updateAgentStatus(agentId, 'processing')

      // Simulate processing delay then activate
      setTimeout(() => {
        updateAgentStatus(agentId, 'active')
        setActiveAgent(agentId)
        setProcessingAgent(null)
        incrementAgentTasks(agentId)
        if (soundEnabled) playActivationSound()
        addNotification({
          type: 'success',
          title: 'Agent Activated',
          message: `${agent.name} is now online and ready`,
        })
      }, 1200)
    } else {
      // Deactivate agent
      updateAgentStatus(agentId, 'idle')
      if (activeAgentId === agentId) {
        setActiveAgent(null)
      }
      if (soundEnabled) playDeactivationSound()
      addNotification({
        type: 'info',
        title: 'Agent Deactivated',
        message: `${agent.name} has been taken offline`,
      })
    }
  }, [agents, activeAgentId, soundEnabled, updateAgentStatus, setActiveAgent, incrementAgentTasks, addNotification])

  return (
    <div className="flex flex-col h-full glass-panel overflow-hidden relative">
      {/* Animated gradient border */}
      <div className="absolute top-0 left-0 right-0 h-[1px] overflow-hidden">
        <motion.div
          className="h-full w-[200%]"
          style={{
            background: 'linear-gradient(90deg, transparent, rgba(0,240,255,0.6), rgba(139,92,246,0.4), transparent, rgba(0,240,255,0.6), transparent)',
            backgroundSize: '200% 100%',
          }}
          animate={{ backgroundPosition: ['0% 0%', '200% 0%'] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
        />
      </div>

      {/* Header with stats */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-neon-cyan/10">
        <div className="flex items-center gap-2">
          <motion.div
            className="w-2 h-2 rounded-full bg-neon-cyan"
            animate={{ scale: [1, 1.3, 1], opacity: [0.6, 1, 0.6] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          />
          <h2 className="text-sm font-mono text-neon-cyan/80 uppercase tracking-wider">
            AI Agent Hub
          </h2>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-neon-cyan/5 border border-neon-cyan/10">
            <Activity className="w-3 h-3 text-neon-cyan/60" />
            <span className="text-[10px] font-mono text-neon-cyan/60">{totalActive} Active</span>
          </div>
          <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-neon-green/5 border border-neon-green/10">
            <CheckSquare className="w-3 h-3 text-neon-green/60" />
            <span className="text-[10px] font-mono text-neon-green/60">{totalTasks} Tasks</span>
          </div>
        </div>
      </div>

      {/* Agent Grid */}
      <div className="flex-1 overflow-y-auto jarvis-scrollbar p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <AnimatePresence>
            {agents.map((agent, index) => {
              const IconComponent = agentIconMap[agent.id] || Cpu
              const status = statusConfig[agent.status]
              const isActive = agent.status === 'active' || agent.status === 'processing'
              const isProcessing = processingAgent === agent.id

              return (
                <motion.div
                  key={agent.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  className={`relative group rounded-xl p-4 border transition-all duration-300 ${
                    isActive
                      ? 'bg-white/[0.04] border-white/10'
                      : 'bg-white/[0.02] border-white/5'
                  }`}
                  style={{
                    boxShadow: isActive
                      ? `0 0 20px ${agent.color}15, inset 0 0 20px ${agent.color}08`
                      : 'none',
                  }}
                >
                  {/* Pulsing glow border for active agents */}
                  {isActive && (
                    <motion.div
                      className="absolute inset-0 rounded-xl pointer-events-none"
                      style={{
                        border: `1.5px solid ${agent.color}40`,
                        boxShadow: `0 0 12px ${agent.color}20`,
                      }}
                      animate={{
                        boxShadow: [
                          `0 0 8px ${agent.color}10`,
                          `0 0 20px ${agent.color}30`,
                          `0 0 8px ${agent.color}10`,
                        ],
                      }}
                      transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                    />
                  )}

                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2.5">
                      <div
                        className="w-9 h-9 rounded-lg flex items-center justify-center border"
                        style={{
                          backgroundColor: `${agent.color}10`,
                          borderColor: `${agent.color}30`,
                        }}
                      >
                        <IconComponent
                          className="w-4.5 h-4.5"
                          style={{ color: agent.color }}
                        />
                      </div>
                      <div>
                        <h3 className="text-xs font-mono font-semibold text-white/80">
                          {agent.name}
                        </h3>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <motion.div
                            className={`w-1.5 h-1.5 rounded-full ${status.color}`}
                            animate={
                              status.pulse
                                ? { scale: [1, 1.4, 1], opacity: [0.6, 1, 0.6] }
                                : {}
                            }
                            transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
                          />
                          <span className={`text-[9px] font-mono uppercase tracking-wider ${status.text}`}>
                            {status.label}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <p className="text-[10px] text-white/30 font-mono leading-relaxed mb-3">
                    {agent.description}
                  </p>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      <span className="text-[9px] font-mono text-white/20">Tasks:</span>
                      <motion.span
                        key={agent.tasksCompleted}
                        initial={{ scale: 1.3, color: agent.color }}
                        animate={{ scale: 1, color: 'rgba(255,255,255,0.5)' }}
                        className="text-[10px] font-mono font-bold"
                      >
                        {agent.tasksCompleted}
                      </motion.span>
                    </div>

                    <motion.button
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => handleToggleAgent(agent.id)}
                      disabled={isProcessing}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[10px] font-mono uppercase tracking-wider border transition-all duration-200 ${
                        isProcessing
                          ? 'border-neon-orange/30 bg-neon-orange/10 text-neon-orange/60 cursor-wait'
                          : isActive
                            ? 'border-white/10 bg-white/[0.03] text-white/40 hover:text-neon-red/70 hover:border-neon-red/20 hover:bg-neon-red/5'
                            : 'border-white/10 bg-white/[0.03] text-white/40 hover:text-neon-cyan/70 hover:border-neon-cyan/20 hover:bg-neon-cyan/5'
                      }`}
                    >
                      {isProcessing ? (
                        <>
                          <motion.div
                            className="w-2.5 h-2.5 border border-neon-orange/60 rounded-full"
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                            style={{ borderTopColor: 'transparent' }}
                          />
                          <span>LOADING</span>
                        </>
                      ) : isActive ? (
                        <>
                          <PowerOff className="w-3 h-3" />
                          <span>DEACTIVATE</span>
                        </>
                      ) : (
                        <>
                          <Power className="w-3 h-3" />
                          <span>ACTIVATE</span>
                        </>
                      )}
                    </motion.button>
                  </div>
                </motion.div>
              )
            })}
          </AnimatePresence>
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between px-4 py-2 border-t border-neon-cyan/10">
        <span className="text-[9px] font-mono text-white/20">
          {agents.length} agents registered
        </span>
        <div className="flex items-center gap-1.5">
          <motion.div
            className="w-1.5 h-1.5 rounded-full bg-neon-cyan/40"
            animate={{ opacity: [0.3, 0.8, 0.3] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          />
          <span className="text-[9px] font-mono text-white/20 uppercase">Hub Online</span>
        </div>
      </div>
    </div>
  )
}
