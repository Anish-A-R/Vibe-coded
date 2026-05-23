'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { StickyNote, Send, X } from 'lucide-react'
import { useJarvisStore } from '@/hooks/useJarvisStore'

export default function QuickNotesWidget() {
  const { notes, addNote, removeNote } = useJarvisStore()
  const [inputValue, setInputValue] = useState('')
  const listRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Auto-scroll to top (newest note) when notes change
  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = 0
    }
  }, [notes.length])

  const handleAddNote = () => {
    const text = inputValue.trim()
    if (!text) return
    addNote(text)
    setInputValue('')
    inputRef.current?.focus()
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleAddNote()
    }
  }

  const formatTimestamp = (ts: number): string => {
    const d = new Date(ts)
    const h = d.getHours().toString().padStart(2, '0')
    const m = d.getMinutes().toString().padStart(2, '0')
    return `${h}:${m}`
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="relative overflow-hidden rounded-xl border border-orange-500/20 bg-black/40 backdrop-blur-xl glass-panel holo-border-orange inner-glow-orange"
    >
      {/* Corner accents */}
      <div className="absolute top-0 left-0 h-4 w-4 border-t border-l border-orange-500/40 z-[2]" />
      <div className="absolute top-0 right-0 h-4 w-4 border-t border-r border-orange-500/40 z-[2]" />
      <div className="absolute bottom-0 left-0 h-4 w-4 border-b border-l border-orange-500/40 z-[2]" />
      <div className="absolute bottom-0 right-0 h-4 w-4 border-b border-r border-orange-500/40 z-[2]" />

      <div className="p-4 relative z-[2]">
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <StickyNote className="size-4 text-orange-400/70" />
            <h3 className="text-xs font-mono font-semibold text-orange-400/80 tracking-widest uppercase">
              Quick Notes
            </h3>
          </div>
          <span className="text-[10px] font-mono text-orange-400/30">
            {notes.length}/20
          </span>
        </div>

        {/* Notes list */}
        <div
          ref={listRef}
          className="max-h-48 overflow-y-auto jarvis-scrollbar space-y-1.5 mb-3"
        >
          <AnimatePresence initial={false}>
            {notes.length === 0 ? (
              <div className="text-center py-6">
                <StickyNote className="size-6 text-orange-500/15 mx-auto mb-2" />
                <p className="text-[10px] font-mono text-white/15">No notes yet</p>
              </div>
            ) : (
              notes.map((note) => (
                <motion.div
                  key={note.id}
                  initial={{ opacity: 0, y: -10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, x: 20, scale: 0.9 }}
                  transition={{ duration: 0.2 }}
                  className="group flex items-start gap-2 p-2 rounded-lg bg-white/[0.02] border border-orange-500/5 hover:bg-orange-500/[0.04] hover:border-orange-500/10 transition-all duration-200"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-mono text-white/70 leading-relaxed break-words">
                      {note.text}
                    </p>
                    <span className="text-[9px] font-mono text-orange-400/25 mt-1 block">
                      {formatTimestamp(note.timestamp)}
                    </span>
                  </div>
                  <button
                    onClick={() => removeNote(note.id)}
                    className="flex-shrink-0 size-5 flex items-center justify-center rounded opacity-0 group-hover:opacity-100 text-white/20 hover:text-orange-400/70 hover:bg-orange-500/10 transition-all duration-150"
                    aria-label="Delete note"
                  >
                    <X className="size-3" />
                  </button>
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>

        {/* Input */}
        <div className="flex items-center gap-2">
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="JARVIS, note this down..."
            maxLength={200}
            className="flex-1 h-8 px-3 text-xs font-mono bg-white/5 border border-orange-500/15 rounded-md text-white/70 placeholder:text-white/15 focus:border-orange-500/40 focus:outline-none transition-colors duration-200"
          />
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleAddNote}
            disabled={!inputValue.trim()}
            className="flex-shrink-0 size-8 flex items-center justify-center rounded-md border border-orange-500/25 text-orange-400/50 hover:bg-orange-500/10 hover:text-orange-400/80 disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-200"
            aria-label="Add note"
          >
            <Send className="size-3.5" />
          </motion.button>
        </div>
      </div>
    </motion.div>
  )
}
