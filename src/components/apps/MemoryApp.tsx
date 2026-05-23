'use client'

import { useState, useMemo, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Database, Search, Plus, Trash2, Star, Tag, Clock,
  MessageSquare, Settings, Workflow, FolderKanban, BrainCircuit,
  X, AlertTriangle, Filter
} from 'lucide-react'
import { useJarvisStore, type MemoryEntry } from '@/hooks/useJarvisStore'
import { playActivationSound, playDeactivationSound } from '@/lib/sounds'

interface MemoryAppProps {
  windowId?: string
}

const typeConfig: Record<string, { icon: React.ElementType; color: string; label: string }> = {
  conversation: { icon: MessageSquare, color: '#00f0ff', label: 'Conversation' },
  preference: { icon: Settings, color: '#ffcc00', label: 'Preference' },
  workflow: { icon: Workflow, color: '#00ff88', label: 'Workflow' },
  project: { icon: FolderKanban, color: '#ff6b35', label: 'Project' },
  context: { icon: BrainCircuit, color: '#8b5cf6', label: 'Context' },
}

const typeFilters = ['all', 'conversation', 'preference', 'workflow', 'project', 'context'] as const

export function MemoryApp({ windowId }: MemoryAppProps) {
  const { aiMemory, addMemory, removeMemory, clearMemory, soundEnabled } = useJarvisStore()

  const [searchQuery, setSearchQuery] = useState('')
  const [activeFilter, setActiveFilter] = useState<string>('all')
  const [showAddForm, setShowAddForm] = useState(false)
  const [showClearConfirm, setShowClearConfirm] = useState(false)
  const [newMemoryContent, setNewMemoryContent] = useState('')
  const [newMemoryType, setNewMemoryType] = useState<MemoryEntry['type']>('conversation')
  const [newMemoryImportance, setNewMemoryImportance] = useState(3)
  const [newMemoryTags, setNewMemoryTags] = useState('')

  // Filtered memories
  const filteredMemories = useMemo(() => {
    let result = aiMemory

    if (activeFilter !== 'all') {
      result = result.filter(m => m.type === activeFilter)
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      result = result.filter(m =>
        m.content.toLowerCase().includes(query) ||
        m.tags.some(t => t.toLowerCase().includes(query))
      )
    }

    return result
  }, [aiMemory, activeFilter, searchQuery])

  // Stats
  const stats = useMemo(() => {
    const byType: Record<string, number> = {}
    aiMemory.forEach(m => {
      byType[m.type] = (byType[m.type] || 0) + 1
    })
    return { total: aiMemory.length, byType }
  }, [aiMemory])

  const handleAddMemory = useCallback(() => {
    if (!newMemoryContent.trim()) return

    addMemory({
      type: newMemoryType,
      content: newMemoryContent.trim(),
      importance: newMemoryImportance,
      tags: newMemoryTags.split(',').map(t => t.trim()).filter(Boolean),
    })

    setNewMemoryContent('')
    setNewMemoryType('conversation')
    setNewMemoryImportance(3)
    setNewMemoryTags('')
    setShowAddForm(false)

    if (soundEnabled) playActivationSound()
  }, [newMemoryContent, newMemoryType, newMemoryImportance, newMemoryTags, addMemory, soundEnabled])

  const handleClearAll = useCallback(() => {
    clearMemory()
    setShowClearConfirm(false)
    if (soundEnabled) playDeactivationSound()
  }, [clearMemory, soundEnabled])

  const handleDelete = useCallback((id: string) => {
    removeMemory(id)
    if (soundEnabled) playDeactivationSound()
  }, [removeMemory, soundEnabled])

  return (
    <div className="flex flex-col h-full glass-panel overflow-hidden relative">
      {/* Animated gradient border */}
      <div className="absolute top-0 left-0 right-0 h-[1px] overflow-hidden">
        <motion.div
          className="h-full w-[200%]"
          style={{
            background: 'linear-gradient(90deg, transparent, rgba(139,92,246,0.6), rgba(0,240,255,0.4), transparent, rgba(139,92,246,0.6), transparent)',
            backgroundSize: '200% 100%',
          }}
          animate={{ backgroundPosition: ['0% 0%', '200% 0%'] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
        />
      </div>

      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-neon-purple/10">
        <div className="flex items-center gap-2">
          <motion.div
            className="w-2 h-2 rounded-full bg-neon-purple"
            animate={{ scale: [1, 1.3, 1], opacity: [0.6, 1, 0.6] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          />
          <h2 className="text-sm font-mono text-neon-purple/80 uppercase tracking-wider">
            AI Memory
          </h2>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-neon-purple/5 border border-neon-purple/10">
            <Database className="w-3 h-3 text-neon-purple/60" />
            <span className="text-[10px] font-mono text-neon-purple/60">{stats.total}</span>
          </div>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="px-3 py-2 border-b border-white/5 space-y-2">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/20" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search memories..."
            className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-white/5 border border-white/5
              text-[11px] text-white/70 placeholder:text-white/20 font-mono
              focus:outline-none focus:border-neon-purple/30 focus:bg-white/[0.07]
              transition-all duration-200"
          />
        </div>

        {/* Type filter tabs */}
        <div className="flex items-center gap-1 overflow-x-auto jarvis-scrollbar">
          {typeFilters.map(filter => {
            const config = filter === 'all' ? null : typeConfig[filter]
            const count = filter === 'all' ? stats.total : (stats.byType[filter] || 0)
            return (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={`flex items-center gap-1 px-2 py-1 rounded-md text-[9px] font-mono uppercase tracking-wider whitespace-nowrap transition-all ${
                  activeFilter === filter
                    ? 'bg-neon-purple/10 border border-neon-purple/20 text-neon-purple/70'
                    : 'bg-white/[0.02] border border-white/5 text-white/30 hover:text-white/50 hover:bg-white/5'
                }`}
              >
                {config && <config.icon className="w-2.5 h-2.5" />}
                <span>{filter === 'all' ? 'All' : config?.label}</span>
                <span className="opacity-50">({count})</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Memory List */}
      <div className="flex-1 overflow-y-auto jarvis-scrollbar p-3">
        {filteredMemories.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full gap-3">
            <Database className="w-10 h-10 text-neon-purple/20" />
            <p className="text-xs font-mono text-white/20">
              {aiMemory.length === 0 ? 'No memories stored yet' : 'No matching memories'}
            </p>
            <p className="text-[10px] font-mono text-white/10 text-center max-w-[200px]">
              JARVIS will automatically store conversation context and preferences
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            <AnimatePresence>
              {filteredMemories.map((memory) => {
                const config = typeConfig[memory.type]
                const TypeIcon = config.icon

                return (
                  <motion.div
                    key={memory.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -20, height: 0 }}
                    transition={{ duration: 0.2 }}
                    className="group rounded-lg p-3 bg-white/[0.02] border border-white/5 hover:border-neon-purple/15 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-1.5">
                      <div className="flex items-center gap-1.5">
                        <div
                          className="w-5 h-5 rounded flex items-center justify-center"
                          style={{ backgroundColor: `${config.color}15` }}
                        >
                          <TypeIcon className="w-3 h-3" style={{ color: config.color }} />
                        </div>
                        <span
                          className="text-[9px] font-mono font-bold uppercase tracking-wider px-1.5 py-0.5 rounded"
                          style={{ color: config.color, backgroundColor: `${config.color}10` }}
                        >
                          {config.label}
                        </span>
                        {/* Importance stars */}
                        <div className="flex items-center gap-0.5 ml-1">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                              key={i}
                              className={`w-2 h-2 ${i < memory.importance ? 'text-neon-orange/60 fill-neon-orange/60' : 'text-white/10'}`}
                            />
                          ))}
                        </div>
                      </div>
                      <button
                        onClick={() => handleDelete(memory.id)}
                        className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-neon-red/10 text-white/20 hover:text-neon-red/60 transition-all"
                        aria-label="Delete memory"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>

                    <p className="text-[10px] font-mono text-white/50 leading-relaxed mb-2 line-clamp-2">
                      {memory.content}
                    </p>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1 flex-wrap">
                        {memory.tags.map((tag, i) => (
                          <span key={i} className="text-[8px] font-mono text-neon-purple/40 bg-neon-purple/5 px-1.5 py-0.5 rounded">
                            #{tag}
                          </span>
                        ))}
                      </div>
                      <div className="flex items-center gap-1 text-white/15 flex-shrink-0">
                        <Clock className="w-2.5 h-2.5" />
                        <span className="text-[8px] font-mono">
                          {new Date(memory.timestamp).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                )
              })}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Add Memory Form */}
      <AnimatePresence>
        {showAddForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="border-t border-neon-purple/10 overflow-hidden"
          >
            <div className="p-3 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono text-neon-purple/60 uppercase tracking-wider">New Memory</span>
                <button onClick={() => setShowAddForm(false)} className="p-1 rounded hover:bg-white/5 text-white/30 hover:text-white/60 transition-colors">
                  <X className="w-3 h-3" />
                </button>
              </div>
              <textarea
                value={newMemoryContent}
                onChange={e => setNewMemoryContent(e.target.value)}
                placeholder="Memory content..."
                rows={2}
                className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/5
                  text-[11px] text-white/70 placeholder:text-white/20 font-mono resize-none
                  focus:outline-none focus:border-neon-purple/30 transition-all"
              />
              <div className="flex items-center gap-2">
                <select
                  value={newMemoryType}
                  onChange={e => setNewMemoryType(e.target.value as MemoryEntry['type'])}
                  className="px-2 py-1 rounded bg-white/5 border border-white/5 text-[10px] font-mono text-white/50 focus:outline-none focus:border-neon-purple/30"
                >
                  {Object.entries(typeConfig).map(([key, cfg]) => (
                    <option key={key} value={key}>{cfg.label}</option>
                  ))}
                </select>
                <div className="flex items-center gap-1">
                  <span className="text-[9px] font-mono text-white/25">Importance:</span>
                  {[1, 2, 3, 4, 5].map(n => (
                    <button key={n} onClick={() => setNewMemoryImportance(n)}>
                      <Star className={`w-3 h-3 ${n <= newMemoryImportance ? 'text-neon-orange/60 fill-neon-orange/60' : 'text-white/15'}`} />
                    </button>
                  ))}
                </div>
              </div>
              <input
                type="text"
                value={newMemoryTags}
                onChange={e => setNewMemoryTags(e.target.value)}
                placeholder="Tags (comma-separated)"
                className="w-full px-3 py-1.5 rounded-lg bg-white/5 border border-white/5
                  text-[10px] text-white/50 placeholder:text-white/20 font-mono
                  focus:outline-none focus:border-neon-purple/30 transition-all"
              />
              <button
                onClick={handleAddMemory}
                disabled={!newMemoryContent.trim()}
                className="w-full py-2 rounded-lg bg-neon-purple/10 border border-neon-purple/20 text-neon-purple/70
                  text-[10px] font-mono uppercase tracking-wider hover:bg-neon-purple/15 disabled:opacity-30 transition-all"
              >
                Save Memory
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Clear All Confirmation */}
      <AnimatePresence>
        {showClearConfirm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="border-t border-neon-red/10 overflow-hidden"
          >
            <div className="p-3 flex items-center gap-3 bg-neon-red/5">
              <AlertTriangle className="w-4 h-4 text-neon-red/60 flex-shrink-0" />
              <p className="text-[10px] font-mono text-white/50 flex-1">Clear all memories? This cannot be undone.</p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowClearConfirm(false)}
                  className="px-3 py-1 rounded-md text-[9px] font-mono text-white/30 border border-white/10 hover:bg-white/5 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleClearAll}
                  className="px-3 py-1 rounded-md text-[9px] font-mono text-neon-red/70 bg-neon-red/10 border border-neon-red/20 hover:bg-neon-red/15 transition-all"
                >
                  Clear All
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Footer Actions */}
      <div className="flex items-center justify-between px-3 py-2 border-t border-neon-purple/10">
        <div className="flex items-center gap-2">
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => setShowAddForm(!showAddForm)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-[9px] font-mono uppercase tracking-wider
              border border-neon-purple/20 bg-neon-purple/5 text-neon-purple/60
              hover:bg-neon-purple/10 hover:text-neon-purple/80 transition-all"
          >
            <Plus className="w-3 h-3" />
            <span>Add</span>
          </motion.button>
          {aiMemory.length > 0 && (
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setShowClearConfirm(true)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-[9px] font-mono uppercase tracking-wider
                border border-white/5 bg-white/[0.02] text-white/30
                hover:text-neon-red/60 hover:border-neon-red/20 hover:bg-neon-red/5 transition-all"
            >
              <Trash2 className="w-3 h-3" />
              <span>Clear</span>
            </motion.button>
          )}
        </div>
        <span className="text-[9px] font-mono text-white/15">
          {filteredMemories.length} of {stats.total} entries
        </span>
      </div>
    </div>
  )
}
