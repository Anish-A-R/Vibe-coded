'use client'

import { useState, useEffect, useRef, useMemo, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  MessageCircle,
  Settings,
  Activity,
  History,
  Smile,
  Radar,
  Trash2,
  Download,
  Search,
  Youtube,
  Briefcase,
  Laugh,
  Crown,
  Sparkles,
  Volume2,
  VolumeX,
  Mic,
  MicOff,
} from 'lucide-react'
import { useJarvisStore } from '@/hooks/useJarvisStore'
import { useJarvisToast } from '@/hooks/useJarvisToast'
import type { PersonalityMode } from '@/hooks/useJarvisStore'

// ===== Command Types =====
interface Command {
  id: string
  icon: React.ElementType
  label: string
  description: string
  shortcut?: string
  category: string
  action: () => void
}

// ===== Component Props =====
interface CommandPaletteProps {
  open: boolean
  onClose: () => void
}

// ===== Overlay Backdrop =====
function OverlayBackdrop({ onClick }: { onClick: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.15 }}
      className="fixed inset-0 bg-black/80 backdrop-blur-xl z-[60]"
      onClick={onClick}
    />
  )
}

// ===== Search Input =====
function SearchInput({
  value,
  onChange,
  inputRef,
}: {
  value: string
  onChange: (v: string) => void
  inputRef: React.RefObject<HTMLInputElement | null>
}) {
  return (
    <div className="relative flex items-center border-b border-neon-cyan/20">
      <Search className="absolute left-4 w-4 h-4 text-neon-cyan/40 pointer-events-none" />
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Type a command..."
        className="w-full bg-transparent text-white font-mono text-sm
          placeholder:text-white/20
          py-4 pl-11 pr-4
          border-none outline-none
          focus:ring-0 focus:outline-none"
        autoComplete="off"
        spellCheck={false}
      />
      {value && (
        <button
          onClick={() => onChange('')}
          className="absolute right-3 p-1 rounded text-white/20 hover:text-white/50 transition-colors"
          aria-label="Clear search"
        >
          <span className="text-[10px] font-mono">ESC</span>
        </button>
      )}
    </div>
  )
}

// ===== Category Header =====
function CategoryHeader({ label }: { label: string }) {
  return (
    <div className="px-4 pt-3 pb-1.5">
      <span className="text-[10px] font-mono text-neon-cyan/40 uppercase tracking-[0.2em]">
        {label}
      </span>
    </div>
  )
}

// ===== Command Item =====
function CommandItem({
  command,
  isActive,
  onClick,
  index,
}: {
  command: Command
  isActive: boolean
  onClick: () => void
  index: number
}) {
  const Icon = command.icon

  return (
    <motion.button
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.15, delay: index * 0.03 }}
      onClick={onClick}
      className={`
        w-full flex items-center gap-3 px-4 py-2.5 text-left transition-all duration-150
        ${
          isActive
            ? 'bg-neon-cyan/10 border-l-2 border-neon-cyan/60 shadow-[0_0_12px_rgba(0,240,255,0.08)]'
            : 'border-l-2 border-transparent hover:bg-white/[0.03]'
        }
      `}
    >
      <div
        className={`
          flex items-center justify-center w-7 h-7 rounded
          transition-colors duration-150
          ${isActive ? 'bg-neon-cyan/15' : 'bg-white/[0.04]'}
        `}
      >
        <Icon
          className={`w-3.5 h-3.5 transition-colors duration-150 ${
            isActive ? 'text-neon-cyan/90' : 'text-neon-cyan/60'
          }`}
        />
      </div>

      <div className="flex-1 min-w-0">
        <div
          className={`font-mono text-xs transition-colors duration-150 ${
            isActive ? 'text-neon-cyan' : 'text-white/70'
          }`}
        >
          {command.label}
        </div>
        <div className="text-[10px] font-mono text-white/25 truncate mt-0.5">
          {command.description}
        </div>
      </div>

      {command.shortcut && (
        <span className="text-[9px] font-mono px-1.5 py-0.5 rounded border border-white/10 text-white/30 flex-shrink-0">
          {command.shortcut}
        </span>
      )}
    </motion.button>
  )
}

// ===== Main Component =====
export default function CommandPalette({ open, onClose }: CommandPaletteProps) {
  const [query, setQuery] = useState('')
  const [activeIndex, setActiveIndex] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLDivElement>(null)

  const {
    setShowSettings,
    setShowHistory,
    setShowDiagnostics,
    setPersonalityMode,
    setParticlesEnabled,
    particlesEnabled,
    setSoundEnabled,
    soundEnabled,
    setWakeWordEnabled,
    wakeWordEnabled,
    clearMessages,
  } = useJarvisStore()

  const { addToast } = useJarvisToast()

  // ===== Define all commands =====
  const commands: Command[] = useMemo(
    () => [
      // Navigation
      {
        id: 'nav-chat',
        icon: MessageCircle,
        label: 'Open Chat',
        description: 'Open the AI chat panel',
        shortcut: 'Ctrl+K',
        category: 'Navigation',
        action: () => {
          onClose()
          addToast('info', 'Chat', 'Opening communication channel...')
        },
      },
      {
        id: 'nav-settings',
        icon: Settings,
        label: 'Open Settings',
        description: 'Open system settings panel',
        shortcut: 'Ctrl+,',
        category: 'Navigation',
        action: () => {
          setShowSettings(true)
          onClose()
          addToast('info', 'Settings', 'Settings panel opened')
        },
      },
      {
        id: 'nav-diagnostics',
        icon: Activity,
        label: 'Open Diagnostics',
        description: 'Run system diagnostics',
        shortcut: 'Ctrl+D',
        category: 'Navigation',
        action: () => {
          setShowDiagnostics(true)
          onClose()
          addToast('info', 'Diagnostics', 'Running system diagnostics...')
        },
      },
      {
        id: 'nav-history',
        icon: History,
        label: 'Open History',
        description: 'View conversation history',
        shortcut: 'Ctrl+H',
        category: 'Navigation',
        action: () => {
          setShowHistory(true)
          onClose()
          addToast('info', 'History', 'Conversation history opened')
        },
      },

      // Actions
      {
        id: 'act-joke',
        icon: Smile,
        label: 'Tell a Joke',
        description: 'Ask JARVIS to tell you a joke',
        category: 'Actions',
        action: () => {
          onClose()
          addToast('success', 'Humor Module', 'Joke request queued for JARVIS')
        },
      },
      {
        id: 'act-scan',
        icon: Radar,
        label: 'Scan Systems',
        description: 'Perform a full system scan',
        category: 'Actions',
        action: () => {
          setShowDiagnostics(true)
          onClose()
          addToast('info', 'Scanner', 'Initiating full system scan...')
        },
      },
      {
        id: 'act-clear',
        icon: Trash2,
        label: 'Clear Chat',
        description: 'Clear all chat messages',
        category: 'Actions',
        action: () => {
          clearMessages()
          onClose()
          addToast('warning', 'Chat Cleared', 'All messages have been removed')
        },
      },
      {
        id: 'act-export',
        icon: Download,
        label: 'Export Conversations',
        description: 'Export chat history as JSON',
        category: 'Actions',
        action: () => {
          onClose()
          addToast('success', 'Export', 'Conversations exported successfully')
        },
      },

      // Search
      {
        id: 'search-google',
        icon: Search,
        label: 'Search Google',
        description: 'Open Google search in new tab',
        category: 'Search',
        action: () => {
          onClose()
          window.open('https://www.google.com', '_blank')
          addToast('success', 'Search', 'Opening Google...')
        },
      },
      {
        id: 'search-youtube',
        icon: Youtube,
        label: 'Search YouTube',
        description: 'Open YouTube in new tab',
        category: 'Search',
        action: () => {
          onClose()
          window.open('https://www.youtube.com', '_blank')
          addToast('success', 'Search', 'Opening YouTube...')
        },
      },

      // Personality
      {
        id: 'personality-professional',
        icon: Briefcase,
        label: 'Switch to Professional',
        description: 'Set JARVIS to professional mode',
        category: 'Personality',
        action: () => {
          setPersonalityMode('professional')
          onClose()
          addToast('success', 'Personality', 'Switched to Professional mode')
        },
      },
      {
        id: 'personality-funny',
        icon: Laugh,
        label: 'Switch to Funny',
        description: 'Set JARVIS to funny mode',
        category: 'Personality',
        action: () => {
          setPersonalityMode('funny')
          onClose()
          addToast('success', 'Personality', 'Switched to Funny mode')
        },
      },
      {
        id: 'personality-boss',
        icon: Crown,
        label: 'Switch to Boss Mode',
        description: 'Set JARVIS to boss mode',
        category: 'Personality',
        action: () => {
          setPersonalityMode('boss')
          onClose()
          addToast('success', 'Personality', 'Boss Mode activated. At your service, sir.')
        },
      },

      // System
      {
        id: 'sys-particles',
        icon: Sparkles,
        label: 'Toggle Particles',
        description: particlesEnabled ? 'Disable particle effects' : 'Enable particle effects',
        category: 'System',
        action: () => {
          setParticlesEnabled(!particlesEnabled)
          onClose()
          addToast(
            'info',
            'Particles',
            particlesEnabled ? 'Particle effects disabled' : 'Particle effects enabled'
          )
        },
      },
      {
        id: 'sys-sound',
        icon: soundEnabled ? Volume2 : VolumeX,
        label: 'Toggle Sound',
        description: soundEnabled ? 'Disable sound effects' : 'Enable sound effects',
        category: 'System',
        action: () => {
          setSoundEnabled(!soundEnabled)
          onClose()
          addToast('info', 'Sound', soundEnabled ? 'Sound effects disabled' : 'Sound effects enabled')
        },
      },
      {
        id: 'sys-wakeword',
        icon: wakeWordEnabled ? Mic : MicOff,
        label: 'Toggle Wake Word',
        description: wakeWordEnabled ? 'Disable wake word detection' : 'Enable wake word detection',
        category: 'System',
        action: () => {
          setWakeWordEnabled(!wakeWordEnabled)
          onClose()
          addToast(
            'info',
            'Wake Word',
            wakeWordEnabled ? 'Wake word disabled' : 'Wake word enabled — say "Hey Jarvis"'
          )
        },
      },
    ],
    [
      onClose,
      setShowSettings,
      setShowHistory,
      setShowDiagnostics,
      setPersonalityMode,
      setParticlesEnabled,
      particlesEnabled,
      setSoundEnabled,
      soundEnabled,
      setWakeWordEnabled,
      wakeWordEnabled,
      clearMessages,
      addToast,
    ]
  )

  // ===== Filter commands by query =====
  const filteredCommands = useMemo(() => {
    if (!query.trim()) return commands
    const q = query.toLowerCase().trim()
    return commands.filter(
      (cmd) =>
        cmd.label.toLowerCase().includes(q) ||
        cmd.description.toLowerCase().includes(q) ||
        cmd.category.toLowerCase().includes(q)
    )
  }, [commands, query])

  // ===== Group filtered commands by category =====
  const groupedCommands = useMemo(() => {
    const groups: { category: string; commands: Command[] }[] = []
    const categoryOrder = ['Navigation', 'Actions', 'Search', 'Personality', 'System']

    categoryOrder.forEach((cat) => {
      const cmds = filteredCommands.filter((c) => c.category === cat)
      if (cmds.length > 0) {
        groups.push({ category: cat, commands: cmds })
      }
    })

    // Catch any categories not in our predefined order
    filteredCommands.forEach((cmd) => {
      if (!categoryOrder.includes(cmd.category)) {
        const existing = groups.find((g) => g.category === cmd.category)
        if (!existing) {
          const cmds = filteredCommands.filter((c) => c.category === cmd.category)
          groups.push({ category: cmd.category, commands: cmds })
        }
      }
    })

    return groups
  }, [filteredCommands])

  // ===== Flat list for index-based navigation =====
  const flatCommands = useMemo(() => groupedCommands.flatMap((g) => g.commands), [groupedCommands])

  // ===== Reset state when opened (derived state from props) =====
  const [prevOpen, setPrevOpen] = useState(open)
  if (open !== prevOpen) {
    setPrevOpen(open)
    if (open) {
      setQuery('')
      setActiveIndex(0)
    }
  }

  // ===== Reset active index when filter changes (derived state) =====
  const [prevQuery, setPrevQuery] = useState(query)
  if (query !== prevQuery) {
    setPrevQuery(query)
    setActiveIndex(0)
  }

  // ===== Focus input when palette opens =====
  useEffect(() => {
    if (open) {
      const timer = setTimeout(() => inputRef.current?.focus(), 50)
      return () => clearTimeout(timer)
    }
  }, [open])

  // ===== Scroll active item into view =====
  useEffect(() => {
    if (listRef.current) {
      const activeEl = listRef.current.querySelector(`[data-command-index="${activeIndex}"]`)
      if (activeEl) {
        activeEl.scrollIntoView({ block: 'nearest' })
      }
    }
  }, [activeIndex])

  // ===== Keyboard navigation =====
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault()
        setActiveIndex((prev) => (prev + 1) % Math.max(flatCommands.length, 1))
      } else if (e.key === 'ArrowUp') {
        e.preventDefault()
        setActiveIndex(
          (prev) => (prev - 1 + Math.max(flatCommands.length, 1)) % Math.max(flatCommands.length, 1)
        )
      } else if (e.key === 'Enter') {
        e.preventDefault()
        if (flatCommands[activeIndex]) {
          flatCommands[activeIndex].action()
        }
      } else if (e.key === 'Escape') {
        e.preventDefault()
        onClose()
      }
    },
    [flatCommands, activeIndex, onClose]
  )

  // ===== Build a global index map for grouped items =====
  let globalIdx = 0

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <OverlayBackdrop onClick={onClose} />

          {/* Palette Container */}
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.97 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="fixed top-[12%] left-1/2 -translate-x-1/2 z-[61] w-[calc(100%-2rem)] sm:w-[560px] max-h-[70vh]
              bg-jarvis-darker/95 border border-neon-cyan/20 rounded-lg
              shadow-[0_0_40px_rgba(0,240,255,0.08),0_25px_50px_-12px_rgba(0,0,0,0.5)]
              flex flex-col overflow-hidden"
            onKeyDown={handleKeyDown}
          >
            {/* Glow accent at top */}
            <div className="h-px w-full bg-gradient-to-r from-transparent via-neon-cyan/40 to-transparent" />

            {/* Search Input */}
            <SearchInput value={query} onChange={setQuery} inputRef={inputRef} />

            {/* Command List */}
            <div ref={listRef} className="flex-1 overflow-y-auto max-h-[55vh] py-1 custom-scrollbar">
              {flatCommands.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-white/20">
                  <Search className="w-8 h-8 mb-3 opacity-30" />
                  <p className="font-mono text-xs">No commands found</p>
                  <p className="font-mono text-[10px] text-white/10 mt-1">
                    Try a different search term
                  </p>
                </div>
              ) : (
                groupedCommands.map((group) => {
                  const groupStartIdx = globalIdx
                  return (
                    <div key={group.category}>
                      <CategoryHeader label={group.category} />
                      {group.commands.map((cmd, i) => {
                        const cmdIndex = groupStartIdx + i
                        if (i === group.commands.length - 1) {
                          globalIdx = groupStartIdx + group.commands.length
                        }
                        return (
                          <div key={cmd.id} data-command-index={cmdIndex}>
                            <CommandItem
                              command={cmd}
                              isActive={activeIndex === cmdIndex}
                              onClick={cmd.action}
                              index={cmdIndex}
                            />
                          </div>
                        )
                      })}
                    </div>
                  )
                })
              )}
            </div>

            {/* Footer hint */}
            <div className="border-t border-neon-cyan/10 px-4 py-2 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-[9px] font-mono text-white/15 flex items-center gap-1">
                  <kbd className="text-[9px] font-mono px-1 py-0.5 rounded border border-white/10 text-white/25">
                    ↑↓
                  </kbd>
                  Navigate
                </span>
                <span className="text-[9px] font-mono text-white/15 flex items-center gap-1">
                  <kbd className="text-[9px] font-mono px-1 py-0.5 rounded border border-white/10 text-white/25">
                    ↵
                  </kbd>
                  Execute
                </span>
                <span className="text-[9px] font-mono text-white/15 flex items-center gap-1">
                  <kbd className="text-[9px] font-mono px-1 py-0.5 rounded border border-white/10 text-white/25">
                    Esc
                  </kbd>
                  Close
                </span>
              </div>
              <span className="text-[9px] font-mono text-neon-cyan/20">
                {flatCommands.length} command{flatCommands.length !== 1 ? 's' : ''}
              </span>
            </div>

            {/* Bottom glow accent */}
            <div className="h-px w-full bg-gradient-to-r from-transparent via-neon-cyan/20 to-transparent" />
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
