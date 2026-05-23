'use client'

import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Code, Terminal, Globe, GitBranch, Database, Bug,
  Play, Copy, Check, ChevronRight, Box, ArrowRight,
  Cpu, Layers, Zap, RefreshCw, Send, FileCode,
  Server, Wifi
} from 'lucide-react'
import { useJarvisStore } from '@/hooks/useJarvisStore'
import { playActivationSound } from '@/lib/sounds'

interface DeveloperAppProps {
  windowId?: string
}

// Code snippet templates
const codeSnippets = [
  {
    name: 'React Component',
    language: 'tsx',
    code: `import { useState } from 'react'

export function Counter() {
  const [count, setCount] = useState(0)
  return (
    <button onClick={() => setCount(c => c + 1)}>
      Count: {count}
    </button>
  )
}`,
  },
  {
    name: 'API Route',
    language: 'ts',
    code: `import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  const body = await req.json()
  return NextResponse.json({ success: true, data: body })
}`,
  },
  {
    name: 'Prisma Query',
    language: 'ts',
    code: `import { db } from '@/lib/db'

const users = await db.user.findMany({
  where: { active: true },
  select: { id: true, name: true, email: true },
  orderBy: { createdAt: 'desc' },
})`,
  },
  {
    name: 'WebSocket Handler',
    language: 'ts',
    code: `io.on('connection', (socket) => {
  console.log('Client connected:', socket.id)

  socket.on('message', (data) => {
    io.emit('broadcast', data)
  })

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id)
  })
})`,
  },
]

// Architecture components
const archComponents = [
  { name: 'Next.js App', icon: Layers, color: '#00f0ff', x: 50, y: 20 },
  { name: 'API Layer', icon: Server, color: '#8b5cf6', x: 50, y: 45 },
  { name: 'Database', icon: Database, color: '#00ff88', x: 50, y: 70 },
  { name: 'WebSocket', icon: Wifi, color: '#ffcc00', x: 15, y: 45 },
  { name: 'AI Engine', icon: Cpu, color: '#ff6b35', x: 85, y: 45 },
]

// Database schema display
const dbSchema = [
  { table: 'users', fields: ['id: Int (PK)', 'name: String', 'email: String', 'created: DateTime'] },
  { table: 'messages', fields: ['id: Int (PK)', 'content: String', 'userId: Int (FK)', 'timestamp: DateTime'] },
  { table: 'memory', fields: ['id: Int (PK)', 'type: String', 'content: String', 'importance: Int'] },
]

export function DeveloperApp({ windowId }: DeveloperAppProps) {
  const { soundEnabled, addMessage, addNotification } = useJarvisStore()

  const [activeSnippet, setActiveSnippet] = useState(0)
  const [copied, setCopied] = useState(false)

  // API testing
  const [apiUrl, setApiUrl] = useState('https://api.example.com/data')
  const [apiMethod, setApiMethod] = useState('GET')
  const [apiBody, setApiBody] = useState('')
  const [apiResponse, setApiResponse] = useState('')
  const [apiLoading, setApiLoading] = useState(false)

  // Debug console
  const [consoleLogs, setConsoleLogs] = useState<Array<{ id: string; type: 'info' | 'warn' | 'error' | 'success'; message: string; time: string }>>([
    { id: 'init-1', type: 'info', message: 'Developer tools initialized', time: new Date().toLocaleTimeString() },
    { id: 'init-2', type: 'success', message: 'All subsystems connected', time: new Date().toLocaleTimeString() },
  ])
  const [consoleInput, setConsoleInput] = useState('')

  // Generate code via AI chat
  const [generatePrompt, setGeneratePrompt] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)

  const copySnippet = useCallback(() => {
    navigator.clipboard.writeText(codeSnippets[activeSnippet].code).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
      if (soundEnabled) playActivationSound()
    }).catch(() => {})
  }, [activeSnippet, soundEnabled])

  const testApi = useCallback(async () => {
    setApiLoading(true)
    setApiResponse('')
    addConsoleLog('info', `Sending ${apiMethod} request to ${apiUrl}...`)

    try {
      const start = Date.now()
      const response = await fetch(apiUrl, {
        method: apiMethod,
        headers: { 'Content-Type': 'application/json' },
        body: apiMethod !== 'GET' && apiBody ? apiBody : undefined,
      })
      const duration = Date.now() - start

      let data: unknown
      try {
        data = await response.json()
      } catch {
        data = await response.text()
      }

      const result = JSON.stringify({
        status: response.status,
        statusText: response.statusText,
        duration: `${duration}ms`,
        data,
      }, null, 2)

      setApiResponse(result)
      addConsoleLog('success', `Response: ${response.status} ${response.statusText} (${duration}ms)`)
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Unknown error'
      setApiResponse(`Error: ${errorMsg}`)
      addConsoleLog('error', `Request failed: ${errorMsg}`)
    } finally {
      setApiLoading(false)
    }
  }, [apiUrl, apiMethod, apiBody])

  const addConsoleLog = useCallback((type: 'info' | 'warn' | 'error' | 'success', message: string) => {
    setConsoleLogs(prev => [
      ...prev,
      { id: `log-${Date.now()}`, type, message, time: new Date().toLocaleTimeString() },
    ].slice(-50))
  }, [])

  const handleConsoleInput = useCallback((cmd: string) => {
    if (!cmd.trim()) return
    addConsoleLog('info', `> ${cmd}`)

    // Simple console commands
    const lower = cmd.toLowerCase().trim()
    if (lower === 'help') {
      addConsoleLog('info', 'Available: help, clear, status, test, ping')
    } else if (lower === 'clear') {
      setConsoleLogs([])
    } else if (lower === 'status') {
      addConsoleLog('success', 'All systems operational')
    } else if (lower === 'ping') {
      addConsoleLog('success', 'Pong! 12ms')
    } else if (lower === 'test') {
      addConsoleLog('info', 'Running test suite...')
      setTimeout(() => addConsoleLog('success', '4/4 tests passed ✓'), 500)
    } else {
      addConsoleLog('warn', `Unknown command: ${cmd}`)
    }
  }, [addConsoleLog])

  const handleGenerateCode = useCallback(async () => {
    if (!generatePrompt.trim()) return
    setIsGenerating(true)
    addConsoleLog('info', `Generating code: "${generatePrompt}"`)

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: `Generate code for: ${generatePrompt}. Only return the code, no explanation.`,
          personality: 'professional',
          history: [],
          stream: false,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        if (data.response) {
          addConsoleLog('success', 'Code generated successfully')
          addMessage({
            role: 'assistant',
            content: `Generated code for "${generatePrompt}":\n\n${data.response}`,
          })
          addNotification({
            type: 'success',
            title: 'Code Generated',
            message: `Code for "${generatePrompt}" has been generated and added to chat.`,
          })
        }
      } else {
        addConsoleLog('error', 'Failed to generate code')
      }
    } catch {
      addConsoleLog('error', 'Connection to AI failed')
    } finally {
      setIsGenerating(false)
      setGeneratePrompt('')
    }
  }, [generatePrompt, addConsoleLog, addMessage, addNotification])

  const logColorMap = {
    info: 'text-neon-cyan/60',
    warn: 'text-neon-orange/60',
    error: 'text-neon-red/60',
    success: 'text-neon-green/60',
  }

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

      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-neon-cyan/10">
        <div className="flex items-center gap-2">
          <motion.div
            className="w-2 h-2 rounded-full bg-neon-cyan"
            animate={{ scale: [1, 1.3, 1], opacity: [0.6, 1, 0.6] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          />
          <h2 className="text-sm font-mono text-neon-cyan/80 uppercase tracking-wider">
            Dev Tools
          </h2>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto jarvis-scrollbar p-3 space-y-3">

        {/* Code Snippets */}
        <div className="rounded-xl bg-white/[0.02] border border-white/5 overflow-hidden">
          <div className="flex items-center justify-between px-3 py-2 border-b border-white/5">
            <div className="flex items-center gap-1.5">
              <FileCode className="w-3 h-3 text-neon-cyan/50" />
              <span className="text-[10px] font-mono text-neon-cyan/50 uppercase tracking-wider">Snippets</span>
            </div>
            <button
              onClick={copySnippet}
              className="flex items-center gap-1 px-2 py-1 rounded text-[9px] font-mono text-white/30 hover:text-neon-cyan/60 bg-white/5 hover:bg-neon-cyan/5 transition-all"
            >
              {copied ? <Check className="w-3 h-3 text-neon-green" /> : <Copy className="w-3 h-3" />}
              {copied ? 'Copied' : 'Copy'}
            </button>
          </div>
          {/* Snippet tabs */}
          <div className="flex items-center gap-0.5 px-2 pt-2 overflow-x-auto jarvis-scrollbar">
            {codeSnippets.map((snippet, i) => (
              <button
                key={i}
                onClick={() => setActiveSnippet(i)}
                className={`px-2.5 py-1 text-[9px] font-mono rounded-t whitespace-nowrap transition-all ${
                  activeSnippet === i
                    ? 'bg-white/[0.06] text-neon-cyan/70 border-b border-neon-cyan/30'
                    : 'text-white/25 hover:text-white/40'
                }`}
              >
                {snippet.name}
              </button>
            ))}
          </div>
          <pre className="px-3 py-2.5 text-[10px] font-mono text-neon-green/70 leading-relaxed overflow-x-auto jarvis-scrollbar bg-black/20">
            {codeSnippets[activeSnippet].code}
          </pre>
        </div>

        {/* Generate Code */}
        <div className="rounded-xl p-3 bg-white/[0.02] border border-white/5">
          <div className="flex items-center gap-1.5 mb-2">
            <Zap className="w-3 h-3 text-neon-cyan/50" />
            <span className="text-[10px] font-mono text-neon-cyan/50 uppercase tracking-wider">AI Code Generator</span>
          </div>
          <div className="flex items-center gap-1.5">
            <input
              type="text"
              value={generatePrompt}
              onChange={e => setGeneratePrompt(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') handleGenerateCode() }}
              placeholder="Describe what code to generate..."
              disabled={isGenerating}
              className="flex-1 px-2.5 py-1.5 rounded-lg bg-white/5 border border-white/5
                text-[10px] text-white/60 placeholder:text-white/20 font-mono
                focus:outline-none focus:border-neon-cyan/30 disabled:opacity-40 transition-all"
            />
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleGenerateCode}
              disabled={isGenerating || !generatePrompt.trim()}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-neon-cyan/10 border border-neon-cyan/20
                text-[9px] font-mono uppercase tracking-wider text-neon-cyan/70
                hover:bg-neon-cyan/15 disabled:opacity-30 disabled:cursor-wait transition-all"
            >
              {isGenerating ? (
                <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}>
                  <RefreshCw className="w-3 h-3" />
                </motion.div>
              ) : (
                <Code className="w-3 h-3" />
              )}
              Generate
            </motion.button>
          </div>
        </div>

        {/* API Testing */}
        <div className="rounded-xl p-3 bg-white/[0.02] border border-white/5">
          <div className="flex items-center gap-1.5 mb-2">
            <Globe className="w-3 h-3 text-neon-cyan/50" />
            <span className="text-[10px] font-mono text-neon-cyan/50 uppercase tracking-wider">API Tester</span>
          </div>
          <div className="flex items-center gap-1.5 mb-2">
            <select
              value={apiMethod}
              onChange={e => setApiMethod(e.target.value)}
              className="px-2 py-1.5 rounded-lg bg-white/5 border border-white/5 text-[10px] font-mono text-neon-cyan/60 focus:outline-none focus:border-neon-cyan/30"
            >
              {['GET', 'POST', 'PUT', 'PATCH', 'DELETE'].map(m => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
            <input
              type="text"
              value={apiUrl}
              onChange={e => setApiUrl(e.target.value)}
              placeholder="API URL..."
              className="flex-1 px-2.5 py-1.5 rounded-lg bg-white/5 border border-white/5
                text-[10px] text-white/60 placeholder:text-white/20 font-mono
                focus:outline-none focus:border-neon-cyan/30 transition-all"
            />
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={testApi}
              disabled={apiLoading}
              className="p-1.5 rounded-lg bg-neon-cyan/10 border border-neon-cyan/20 text-neon-cyan/70 disabled:opacity-30 transition-all"
            >
              <Send className="w-3.5 h-3.5" />
            </motion.button>
          </div>
          {apiMethod !== 'GET' && (
            <textarea
              value={apiBody}
              onChange={e => setApiBody(e.target.value)}
              placeholder='Request body (JSON)...'
              rows={2}
              className="w-full px-2.5 py-1.5 rounded-lg bg-white/5 border border-white/5
                text-[10px] text-white/60 placeholder:text-white/20 font-mono resize-none mb-2
                focus:outline-none focus:border-neon-cyan/30 transition-all"
            />
          )}
          {apiResponse && (
            <pre className="px-3 py-2 rounded-lg bg-black/30 text-[9px] font-mono text-neon-green/60 leading-relaxed overflow-x-auto jarvis-scrollbar max-h-32">
              {apiResponse}
            </pre>
          )}
        </div>

        {/* Architecture Visualizer */}
        <div className="rounded-xl p-3 bg-white/[0.02] border border-white/5">
          <div className="flex items-center gap-1.5 mb-2">
            <Box className="w-3 h-3 text-neon-cyan/50" />
            <span className="text-[10px] font-mono text-neon-cyan/50 uppercase tracking-wider">Architecture</span>
          </div>
          <div className="relative h-40 bg-black/20 rounded-lg overflow-hidden">
            {/* Connection lines */}
            <svg className="absolute inset-0 w-full h-full" style={{ zIndex: 0 }}>
              <line x1="50%" y1="28%" x2="50%" y2="53%" stroke="rgba(0,240,255,0.15)" strokeWidth="1" strokeDasharray="4,4" />
              <line x1="50%" y1="53%" x2="50%" y2="78%" stroke="rgba(0,255,136,0.15)" strokeWidth="1" strokeDasharray="4,4" />
              <line x1="15%" y1="53%" x2="50%" y2="53%" stroke="rgba(255,204,0,0.15)" strokeWidth="1" strokeDasharray="4,4" />
              <line x1="85%" y1="53%" x2="50%" y2="53%" stroke="rgba(255,107,53,0.15)" strokeWidth="1" strokeDasharray="4,4" />
            </svg>
            {/* Components */}
            {archComponents.map((comp) => {
              const CompIcon = comp.icon
              return (
                <div
                  key={comp.name}
                  className="absolute flex flex-col items-center gap-1"
                  style={{ left: `${comp.x}%`, top: `${comp.y}%`, transform: 'translate(-50%, -50%)' }}
                >
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center border"
                    style={{ backgroundColor: `${comp.color}10`, borderColor: `${comp.color}30` }}
                  >
                    <CompIcon className="w-4 h-4" style={{ color: comp.color }} />
                  </div>
                  <span className="text-[8px] font-mono text-white/30 whitespace-nowrap">{comp.name}</span>
                </div>
              )
            })}
          </div>
        </div>

        {/* GitHub Integration (Simulated) */}
        <div className="rounded-xl p-3 bg-white/[0.02] border border-white/5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <GitBranch className="w-4 h-4 text-neon-cyan/60" />
              <div>
                <span className="text-[10px] font-mono text-white/50">GitHub Integration</span>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <motion.div
                    className="w-1.5 h-1.5 rounded-full bg-neon-green"
                    animate={{ opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                  <span className="text-[9px] font-mono text-neon-green/50">Connected</span>
                </div>
              </div>
            </div>
            <div className="text-right">
              <span className="text-[9px] font-mono text-white/20">3 repos synced</span>
              <div className="text-[9px] font-mono text-white/15">Last: 5m ago</div>
            </div>
          </div>
        </div>

        {/* Database Browser */}
        <div className="rounded-xl p-3 bg-white/[0.02] border border-white/5">
          <div className="flex items-center gap-1.5 mb-2">
            <Database className="w-3 h-3 text-neon-cyan/50" />
            <span className="text-[10px] font-mono text-neon-cyan/50 uppercase tracking-wider">Database Schema</span>
          </div>
          <div className="space-y-2">
            {dbSchema.map(table => (
              <div key={table.table} className="p-2 rounded-lg bg-black/20 border border-white/5">
                <div className="flex items-center gap-1.5 mb-1">
                  <ChevronRight className="w-3 h-3 text-neon-cyan/40" />
                  <span className="text-[10px] font-mono font-bold text-neon-cyan/60">{table.table}</span>
                </div>
                <div className="pl-5 space-y-0.5">
                  {table.fields.map((field, i) => (
                    <div key={i} className="text-[9px] font-mono text-white/30">
                      {field.includes('PK') && <span className="text-neon-orange/50 mr-1">🔑</span>}
                      {field.includes('FK') && <span className="text-neon-purple/50 mr-1">🔗</span>}
                      {!field.includes('PK') && !field.includes('FK') && <span className="mr-2.5"> </span>}
                      {field.replace(' (PK)', '').replace(' (FK)', '')}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Debug Console */}
        <div className="rounded-xl bg-black/30 border border-white/5 overflow-hidden">
          <div className="flex items-center justify-between px-3 py-1.5 bg-black/40 border-b border-white/5">
            <div className="flex items-center gap-1.5">
              <Bug className="w-3 h-3 text-neon-cyan/50" />
              <span className="text-[10px] font-mono text-neon-cyan/50 uppercase tracking-wider">Console</span>
            </div>
            <button
              onClick={() => setConsoleLogs([])}
              className="text-[9px] font-mono text-white/20 hover:text-white/40 transition-colors"
            >
              Clear
            </button>
          </div>
          <div className="max-h-28 overflow-y-auto jarvis-scrollbar px-2 py-1.5 space-y-0.5">
            {consoleLogs.map(log => (
              <div key={log.id} className="flex items-start gap-1.5">
                <span className="text-[8px] font-mono text-white/15 flex-shrink-0">{log.time}</span>
                <span className={`text-[9px] font-mono ${logColorMap[log.type]}`}>{log.message}</span>
              </div>
            ))}
          </div>
          <div className="flex items-center gap-1 px-2 py-1.5 border-t border-white/5">
            <span className="text-[9px] font-mono text-neon-cyan/30">&gt;</span>
            <input
              type="text"
              value={consoleInput}
              onChange={e => setConsoleInput(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter') {
                  handleConsoleInput(consoleInput)
                  setConsoleInput('')
                }
              }}
              placeholder="Type a command..."
              className="flex-1 bg-transparent text-[9px] font-mono text-white/50 placeholder:text-white/15 focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between px-4 py-2 border-t border-neon-cyan/10">
        <span className="text-[9px] font-mono text-white/20">Dev Mode Active</span>
        <Terminal className="w-3 h-3 text-neon-cyan/30" />
      </div>
    </div>
  )
}
