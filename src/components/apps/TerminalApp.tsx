'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useJarvisStore } from '@/hooks/useJarvisStore'
import { playActivationSound, playMessageSound, playErrorSound, playBootSound } from '@/lib/sounds'

interface TerminalLine {
  id: string
  type: 'input' | 'output' | 'error' | 'system' | 'success' | 'warning' | 'ascii'
  content: string
  timestamp?: number
}

interface TerminalAppProps {
  windowId?: string
}

const NEOFETCH_ASCII = `
  ╔══════════════════════════════════╗
  ║    ╭──────────────────╮         ║
  ║    │  ╔══╗  ╔══╗ ╔══╗ │         ║
  ║    │  ║  ╚╗ ║  ║ ║  ║ │  OS:   JARVIS AI OS v4.2.0
  ║    │  ║ ╔╗║ ║  ║ ║  ║ │  AI:   J.A.R.V.I.S. Mk VII
  ║    │  ║ ║╚║ ╚══╝ ╚══╝ │  CPU:  Quantum Neural Net
  ║    │  ╚══╝            │  RAM:  ∞ allocated
  ║    ╰──────────────────╯         ║
  ╚══════════════════════════════════╝
`

const HELP_TEXT = `
Available Commands:
  help          Show this help message
  status        Display system status
  scan          Run a full system scan
  agents        List all AI agents
  agent <name>  Activate a specific agent
  memory        Show AI memory usage
  theme <name>  Change theme (cyan/purple/green/red)
  mode <name>   Change OS mode (professional/funny/boss)
  clear/cls     Clear terminal
  history       Show command history
  whoami        Display user information
  neofetch      Show system info
  matrix        Easter egg - matrix rain
  ping          Test connectivity
  uptime        Show system uptime
  tasks         Show running tasks
  exit          Close terminal

  Any other input will be sent to the AI chat API.
`

const AGENTS = [
  { name: 'coding', status: 'active', tasks: 47 },
  { name: 'research', status: 'idle', tasks: 23 },
  { name: 'productivity', status: 'active', tasks: 31 },
  { name: 'security', status: 'active', tasks: 56 },
  { name: 'automation', status: 'idle', tasks: 12 },
  { name: 'creative', status: 'processing', tasks: 8 },
  { name: 'system', status: 'active', tasks: 99 },
]

export function TerminalApp({ windowId }: TerminalAppProps) {
  const {
    systemStats,
    aiStatus,
    personalityMode,
    setPersonalityMode,
    colorTheme,
    setColorTheme,
    soundEnabled,
    addMessage,
    incrementCommandCount,
    commandCount,
  } = useJarvisStore()

  const [lines, setLines] = useState<TerminalLine[]>([
    { id: 'init-1', type: 'system', content: '╔═══════════════════════════════════════════╗' },
    { id: 'init-2', type: 'system', content: '║  J.A.R.V.I.S. Terminal v4.2.0            ║' },
    { id: 'init-3', type: 'system', content: '║  Stark Industries AI Operating System     ║' },
    { id: 'init-4', type: 'system', content: '╚═══════════════════════════════════════════╝' },
    { id: 'init-5', type: 'success', content: 'System initialized. Type "help" for available commands.' },
  ])
  const [currentInput, setCurrentInput] = useState('')
  const [commandHistory, setCommandHistory] = useState<string[]>([])
  const [historyIndex, setHistoryIndex] = useState(-1)
  const [isProcessing, setIsProcessing] = useState(false)
  const [showMatrix, setShowMatrix] = useState(false)
  const [matrixDrops, setMatrixDrops] = useState<Array<{ id: number; x: number; chars: string[]; speed: number }>>([])
  const [typingText, setTypingText] = useState('')
  const [isTyping, setIsTyping] = useState(false)

  const terminalRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const matrixRef = useRef<HTMLCanvasElement>(null)

  // Auto-scroll to bottom
  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight
    }
  }, [lines, typingText])

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  // Matrix rain effect
  useEffect(() => {
    if (!showMatrix) return

    const chars = 'アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン0123456789'
    const columns = 40
    const drops: number[] = Array(columns).fill(1)

    const canvas = matrixRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    canvas.width = canvas.offsetWidth
    canvas.height = canvas.offsetHeight

    const fontSize = 12
    const colWidth = canvas.width / columns

    let animId: number
    const draw = () => {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.05)'
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      ctx.font = `${fontSize}px monospace`

      for (let i = 0; i < drops.length; i++) {
        const char = chars[Math.floor(Math.random() * chars.length)]
        const x = i * colWidth
        const y = drops[i] * fontSize

        // Head of the drop is brighter
        ctx.fillStyle = i % 3 === 0 ? 'rgba(0, 255, 136, 0.9)' : 'rgba(0, 240, 255, 0.7)'
        ctx.fillText(char, x, y)

        if (y > canvas.height && Math.random() > 0.975) {
          drops[i] = 0
        }
        drops[i]++
      }
      animId = requestAnimationFrame(draw)
    }

    draw()

    return () => {
      cancelAnimationFrame(animId)
    }
  }, [showMatrix])

  const addLine = useCallback((type: TerminalLine['type'], content: string) => {
    setLines((prev) => [
      ...prev,
      { id: `line-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`, type, content, timestamp: Date.now() },
    ])
  }, [])

  const typeOutput = useCallback((text: string, type: TerminalLine['type'] = 'output') => {
    setIsTyping(true)
    setTypingText('')
    let i = 0
    const interval = setInterval(() => {
      if (i < text.length) {
        setTypingText(text.slice(0, i + 1))
        i++
      } else {
        clearInterval(interval)
        setTypingText('')
        setIsTyping(false)
        addLine(type, text)
      }
    }, 15)
    return () => clearInterval(interval)
  }, [addLine])

  const processCommand = useCallback(async (cmd: string) => {
    const trimmed = cmd.trim()
    if (!trimmed) return

    // Add input line
    addLine('input', `jarvis > ${trimmed}`)
    setCommandHistory((prev) => [...prev, trimmed])
    setHistoryIndex(-1)
    incrementCommandCount()

    if (soundEnabled) playActivationSound()

    const lower = trimmed.toLowerCase()
    const parts = lower.split(/\s+/)
    const command = parts[0]
    const args = parts.slice(1).join(' ')

    switch (command) {
      case 'help': {
        addLine('system', HELP_TEXT)
        break
      }
      case 'status': {
        addLine('system', '┌─ System Status ──────────────────────────┐')
        addLine('success', `│  AI Status:     ${aiStatus.toUpperCase().padEnd(20)}│`)
        addLine(systemStats.network === 'online' ? 'success' : 'error', `│  Network:       ${(systemStats.network || 'unknown').toUpperCase().padEnd(20)}│`)
        addLine(systemStats.cpu < 50 ? 'success' : 'warning', `│  CPU Usage:     ${String(systemStats.cpu + '%').padEnd(20)}│`)
        addLine(systemStats.ram < 60 ? 'success' : 'warning', `│  RAM Usage:     ${String(systemStats.ram + '%').padEnd(20)}│`)
        addLine(systemStats.temperature < 60 ? 'success' : 'error', `│  Temperature:   ${String(systemStats.temperature + '°C').padEnd(20)}│`)
        addLine('success', `│  Personality:   ${personalityMode.padEnd(20)}│`)
        addLine('success', `│  Theme:         ${colorTheme.padEnd(20)}│`)
        addLine('system', '└───────────────────────────────────────────┘')
        break
      }
      case 'scan': {
        addLine('system', 'Initiating system scan...')
        setIsProcessing(true)
        await new Promise((r) => setTimeout(r, 1500))
        addLine('success', '✓ Neural core .............. ONLINE')
        await new Promise((r) => setTimeout(r, 400))
        addLine('success', '✓ Memory banks ............. ONLINE')
        await new Promise((r) => setTimeout(r, 400))
        addLine('success', '✓ Network interfaces ....... ONLINE')
        await new Promise((r) => setTimeout(r, 400))
        addLine('success', '✓ Agent subsystems ......... ONLINE')
        await new Promise((r) => setTimeout(r, 400))
        addLine('success', '✓ Security protocols ....... ACTIVE')
        await new Promise((r) => setTimeout(r, 400))
        addLine('success', '✓ Voice recognition ........ ONLINE')
        await new Promise((r) => setTimeout(r, 300))
        addLine('system', '┌─ Scan Complete ──────────────────────────┐')
        addLine('success', '│  All systems operational. No threats     │')
        addLine('success', '│  detected. Security perimeter secure.    │')
        addLine('system', '└───────────────────────────────────────────┘')
        setIsProcessing(false)
        break
      }
      case 'agents': {
        addLine('system', '┌─ AI Agents ──────────────────────────────┐')
        AGENTS.forEach((agent) => {
          const statusIcon = agent.status === 'active' ? '●' : agent.status === 'processing' ? '◐' : '○'
          const statusColor = agent.status === 'active' ? 'success' : agent.status === 'processing' ? 'warning' : 'output'
          addLine(statusColor, `│  ${statusIcon} ${agent.name.padEnd(14)} ${agent.status.padEnd(12)} ${String(agent.tasks + ' tasks').padEnd(10)}│`)
        })
        addLine('system', '└───────────────────────────────────────────┘')
        break
      }
      case 'agent': {
        if (!args) {
          addLine('warning', 'Usage: agent <name>. Available: coding, research, productivity, security, automation, creative, system')
        } else {
          const agent = AGENTS.find((a) => a.name === args)
          if (agent) {
            addLine('success', `Agent "${agent.name}" activated. Status: ${agent.status}. Tasks completed: ${agent.tasks}`)
          } else {
            addLine('error', `Agent "${args}" not found. Type "agents" to see available agents.`)
            if (soundEnabled) playErrorSound()
          }
        }
        break
      }
      case 'memory': {
        const memUsed = systemStats.ram
        const memTotal = 100
        const memBar = '█'.repeat(Math.floor(memUsed / 5)) + '░'.repeat(20 - Math.floor(memUsed / 5))
        addLine('system', '┌─ AI Memory ──────────────────────────────┐')
        addLine('output', `│  [${memBar}] ${memUsed}%   │`)
        addLine('output', `│  Short-term:    ${String(Math.floor(memUsed * 0.6) + 'MB / 60MB').padEnd(26)}│`)
        addLine('output', `│  Long-term:     ${String(Math.floor(memUsed * 0.4) + 'MB / 40MB').padEnd(26)}│`)
        addLine('output', `│  Conversations: 42 stored                  │`)
        addLine('system', '└───────────────────────────────────────────┘')
        break
      }
      case 'theme': {
        const validThemes = ['cyan', 'purple', 'green', 'red']
        if (!args || !validThemes.includes(args)) {
          addLine('warning', 'Usage: theme <cyan|purple|green|red>')
        } else {
          setColorTheme(args as 'cyan' | 'purple' | 'green' | 'red')
          addLine('success', `Theme set to "${args}".`)
        }
        break
      }
      case 'mode': {
        const validModes = ['professional', 'funny', 'boss']
        if (!args || !validModes.includes(args)) {
          addLine('warning', 'Usage: mode <professional|funny|boss>')
        } else {
          setPersonalityMode(args as 'professional' | 'funny' | 'boss')
          addLine('success', `Personality mode set to "${args}".`)
        }
        break
      }
      case 'clear':
      case 'cls': {
        setLines([])
        break
      }
      case 'history': {
        if (commandHistory.length === 0) {
          addLine('output', 'No command history.')
        } else {
          addLine('system', '┌─ Command History ────────────────────────┐')
          commandHistory.slice(-15).forEach((cmd, i) => {
            addLine('output', `│  ${String(i + 1).padStart(3)}. ${cmd.padEnd(35)}│`)
          })
          addLine('system', '└───────────────────────────────────────────┘')
        }
        break
      }
      case 'whoami': {
        addLine('system', '┌─ User Info ──────────────────────────────┐')
        addLine('success', '│  Name:       Tony Stark                  │')
        addLine('success', '│  Role:       Administrator               │')
        addLine('success', '│  Clearance:  Level 10 (Maximum)          │')
        addLine('success', '│  Location:   Stark Tower, NYC            │')
        addLine('system', '└───────────────────────────────────────────┘')
        break
      }
      case 'neofetch': {
        addLine('ascii', NEOFETCH_ASCII)
        break
      }
      case 'matrix': {
        setShowMatrix(true)
        addLine('system', 'Entering the Matrix... (click or press any key to exit)')
        setTimeout(() => {
          setShowMatrix(false)
          addLine('success', 'Matrix simulation terminated.')
        }, 8000)
        break
      }
      case 'ping': {
        addLine('system', 'Pinging AI core...')
        await new Promise((r) => setTimeout(r, 800))
        addLine('success', 'Pong! Response time: 12ms')
        break
      }
      case 'uptime': {
        const hours = Math.floor(systemStats.uptime / 3600)
        const mins = Math.floor((systemStats.uptime % 3600) / 60)
        addLine('success', `System uptime: ${hours}h ${mins}m`)
        break
      }
      case 'tasks': {
        addLine('system', '┌─ Running Tasks ──────────────────────────┐')
        addLine('success', '│  ● Neural processing ........ RUNNING    │')
        addLine('success', '│  ● Security monitoring ..... RUNNING    │')
        addLine('warning', '│  ◐ Data backup ............. PENDING    │')
        addLine('output',  '│  ○ Scheduled maintenance ... QUEUED     │')
        addLine('system', '└───────────────────────────────────────────┘')
        break
      }
      case 'exit': {
        addLine('warning', 'Nice try, sir. The terminal cannot be closed from within.')
        break
      }
      default: {
        // Send to AI API
        setIsProcessing(true)
        addLine('system', 'Processing with AI...')
        try {
          const response = await fetch('/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              message: trimmed,
              personality: personalityMode,
              history: [],
              stream: false,
            }),
          })

          if (response.ok) {
            const data = await response.json()
            if (data.response) {
              // Type out the AI response
              const cleanResponse = data.response
                .replace(/!\[.*?\]\(.*?\)/g, '[Image]')
                .replace(/\*\*(.*?)\*\*/g, '$1')
                .replace(/\*(.*?)\*/g, '$1')
                .replace(/`{1,3}(.*?)`{1,3}/g, '$1')
                .replace(/\[(.*?)\]\(.*?\)/g, '$1')
                .replace(/#{1,6}\s/g, '')
                .replace(/[-*+]\s/g, '• ')
              typeOutput(cleanResponse, 'output')
            } else {
              addLine('error', 'No response from AI.')
              if (soundEnabled) playErrorSound()
            }
          } else {
            addLine('error', `Error: ${response.status} ${response.statusText}`)
            if (soundEnabled) playErrorSound()
          }
        } catch {
          addLine('error', 'Connection to AI core failed. Please try again.')
          if (soundEnabled) playErrorSound()
        } finally {
          setIsProcessing(false)
        }
        break
      }
    }
  }, [addLine, aiStatus, systemStats, personalityMode, colorTheme, commandHistory, soundEnabled, incrementCommandCount, typeOutput, setPersonalityMode, setColorTheme])

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (showMatrix) {
      setShowMatrix(false)
      return
    }

    if (e.key === 'Enter') {
      e.preventDefault()
      const cmd = currentInput
      setCurrentInput('')
      processCommand(cmd)
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      if (commandHistory.length > 0) {
        const newIndex = historyIndex < commandHistory.length - 1 ? historyIndex + 1 : historyIndex
        setHistoryIndex(newIndex)
        setCurrentInput(commandHistory[commandHistory.length - 1 - newIndex])
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault()
      if (historyIndex > 0) {
        const newIndex = historyIndex - 1
        setHistoryIndex(newIndex)
        setCurrentInput(commandHistory[commandHistory.length - 1 - newIndex])
      } else {
        setHistoryIndex(-1)
        setCurrentInput('')
      }
    } else if (e.key === 'Tab') {
      e.preventDefault()
      // Simple autocomplete
      const commands = ['help', 'status', 'scan', 'agents', 'agent', 'memory', 'theme', 'mode', 'clear', 'cls', 'history', 'whoami', 'neofetch', 'matrix', 'ping', 'uptime', 'tasks', 'exit']
      const match = commands.find((c) => c.startsWith(currentInput.toLowerCase()))
      if (match) {
        setCurrentInput(match)
      }
    } else if (e.key === 'l' && e.ctrlKey) {
      e.preventDefault()
      setLines([])
    }
  }, [currentInput, commandHistory, historyIndex, processCommand, showMatrix])

  // Color mapping for line types
  const lineColorMap: Record<TerminalLine['type'], string> = {
    input: 'text-neon-cyan',
    output: 'text-neon-green',
    error: 'text-neon-red',
    system: 'text-neon-cyan/70',
    success: 'text-neon-green',
    warning: 'text-neon-orange',
    ascii: 'text-neon-cyan/60',
  }

  return (
    <div
      className="flex flex-col h-full bg-black/95 rounded-lg overflow-hidden relative font-mono"
      onClick={() => inputRef.current?.focus()}
    >
      {/* Matrix rain overlay */}
      <AnimatePresence>
        {showMatrix && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-10"
            onClick={() => setShowMatrix(false)}
          >
            <canvas
              ref={matrixRef}
              className="w-full h-full"
              style={{ background: 'rgba(0,0,0,0.95)' }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Terminal header bar */}
      <div className="flex items-center justify-between px-3 py-1.5 bg-black/80 border-b border-neon-green/20">
        <div className="flex items-center gap-2">
          <div className="flex gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-neon-red/80" />
            <div className="w-2.5 h-2.5 rounded-full bg-neon-orange/80" />
            <div className="w-2.5 h-2.5 rounded-full bg-neon-green/80" />
          </div>
          <span className="text-[10px] text-neon-green/50 ml-2 uppercase tracking-wider">
            JARVIS Terminal
          </span>
        </div>
        <div className="flex items-center gap-2">
          {isProcessing && (
            <motion.div
              className="w-1.5 h-1.5 rounded-full bg-neon-green"
              animate={{ opacity: [1, 0.3, 1] }}
              transition={{ duration: 0.8, repeat: Infinity }}
            />
          )}
          <span className="text-[9px] text-neon-green/30">
            {lines.length} lines
          </span>
        </div>
      </div>

      {/* Scanline effect */}
      <div className="absolute inset-0 pointer-events-none z-[5]">
        <div className="w-full h-full"
          style={{
            background: 'repeating-linear-gradient(0deg, transparent 0px, transparent 2px, rgba(0,0,0,0.03) 2px, rgba(0,0,0,0.03) 4px)',
          }}
        />
      </div>

      {/* Terminal output */}
      <div
        ref={terminalRef}
        className="flex-1 overflow-y-auto p-3 space-y-0.5 jarvis-scrollbar"
        style={{ scrollbarGutter: 'stable' }}
      >
        {lines.map((line) => (
          <motion.div
            key={line.id}
            initial={{ opacity: 0, x: -5 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.15 }}
            className={`${lineColorMap[line.type]} text-[12px] leading-[1.6] whitespace-pre-wrap break-all select-text`}
          >
            {line.type === 'input' ? (
              <>
                <span className="text-neon-green/50">jarvis</span>
                <span className="text-white/30"> {'>'} </span>
                <span className="text-neon-cyan">{line.content.replace('jarvis > ', '')}</span>
              </>
            ) : line.type === 'error' ? (
              <>
                <span className="text-neon-red/50">✗</span>{' '}
                <span className="text-neon-red">{line.content}</span>
              </>
            ) : line.type === 'success' ? (
              <>
                <span className="text-neon-green/50">✓</span>{' '}
                <span>{line.content}</span>
              </>
            ) : line.type === 'warning' ? (
              <>
                <span className="text-neon-orange/50">⚠</span>{' '}
                <span>{line.content}</span>
              </>
            ) : (
              line.content
            )}
          </motion.div>
        ))}

        {/* Typing animation */}
        {isTyping && typingText && (
          <div className="text-neon-green text-[12px] leading-[1.6] whitespace-pre-wrap">
            {typingText}
            <motion.span
              className="inline-block w-[6px] h-[12px] bg-neon-green ml-0.5 align-middle"
              animate={{ opacity: [1, 0] }}
              transition={{ duration: 0.5, repeat: Infinity }}
            />
          </div>
        )}

        {/* Current input line */}
        {!isTyping && (
          <div className="flex items-center text-[12px] leading-[1.6]">
            <span className="text-neon-green/50">jarvis</span>
            <span className="text-white/30"> {'>'} </span>
            <span className="text-neon-cyan">{currentInput}</span>
            <motion.span
              className="inline-block w-[6px] h-[12px] bg-neon-green ml-0.5 align-middle"
              animate={{ opacity: [1, 0] }}
              transition={{ duration: 0.6, repeat: Infinity, ease: 'steps(2)' }}
            />
          </div>
        )}
      </div>

      {/* Hidden input */}
      <input
        ref={inputRef}
        type="text"
        value={currentInput}
        onChange={(e) => setCurrentInput(e.target.value)}
        onKeyDown={handleKeyDown}
        className="absolute opacity-0 w-0 h-0"
        autoFocus
      />

      {/* Bottom status bar */}
      <div className="flex items-center justify-between px-3 py-1 bg-black/80 border-t border-neon-green/10">
        <div className="flex items-center gap-3">
          <span className="text-[9px] text-neon-green/30">
            CMD#{commandCount}
          </span>
          <span className="text-[9px] text-neon-green/30">
            {personalityMode.toUpperCase()}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <motion.div
            className={`w-1.5 h-1.5 rounded-full ${
              systemStats.network === 'online' ? 'bg-neon-green' : 'bg-neon-red'
            }`}
            animate={systemStats.network === 'online' ? { scale: [1, 1, 1] } : { opacity: [1, 0.3, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          />
          <span className="text-[9px] text-neon-green/30 uppercase">
            {systemStats.network}
          </span>
        </div>
      </div>
    </div>
  )
}
