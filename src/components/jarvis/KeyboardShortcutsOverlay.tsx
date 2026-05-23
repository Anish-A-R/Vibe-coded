'use client'

import { useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Keyboard } from 'lucide-react'

// ===== Shortcut Data =====
interface ShortcutItem {
  keys: string[]
  description: string
}

interface ShortcutCategory {
  name: string
  shortcuts: ShortcutItem[]
}

const CATEGORIES: ShortcutCategory[] = [
  {
    name: 'Navigation',
    shortcuts: [
      { keys: ['Ctrl', 'K'], description: 'Toggle Chat' },
      { keys: ['Ctrl', 'P'], description: 'Command Palette' },
      { keys: ['Ctrl', 'D'], description: 'Diagnostics' },
      { keys: ['Ctrl', 'H'], description: 'History' },
      { keys: ['Ctrl', ','], description: 'Settings' },
      { keys: ['Esc'], description: 'Close Panel' },
    ],
  },
  {
    name: 'Voice',
    shortcuts: [
      { keys: ['Ctrl', 'Space'], description: 'Toggle Voice Input' },
    ],
  },
  {
    name: 'Chat',
    shortcuts: [
      { keys: ['Enter'], description: 'Send Message' },
      { keys: ['Shift', 'Enter'], description: 'New Line' },
    ],
  },
  {
    name: 'System',
    shortcuts: [
      { keys: ['?'], description: 'Show Shortcuts' },
    ],
  },
]

// ===== KBD Element =====
function Kbd({ children }: { children: React.ReactNode }) {
  return (
    <kbd
      className="inline-flex items-center justify-center min-w-[24px] px-2 py-1
        font-mono text-[11px] text-neon-cyan/90
        bg-neon-cyan/[0.08] border border-neon-cyan/30 rounded
        shadow-[0_0_6px_rgba(0,240,255,0.15),inset_0_1px_0_rgba(0,240,255,0.1)]"
      style={{ textShadow: '0 0 8px rgba(0,240,255,0.5)' }}
    >
      {children}
    </kbd>
  )
}

// ===== Component Props =====
interface KeyboardShortcutsOverlayProps {
  open: boolean
  onClose: () => void
}

// ===== Main Component =====
export default function KeyboardShortcutsOverlay({ open, onClose }: KeyboardShortcutsOverlayProps) {
  // Close on Escape
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape' && open) {
        e.preventDefault()
        onClose()
      }
    },
    [open, onClose]
  )

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-md z-[70]"
            onClick={onClose}
          />

          {/* Overlay Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 20 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[71]
              w-[calc(100%-2rem)] sm:w-[520px] max-h-[80vh]
              bg-jarvis-darker/95 border border-neon-cyan/20 rounded-lg
              shadow-[0_0_60px_rgba(0,240,255,0.08),0_25px_50px_-12px_rgba(0,0,0,0.5)]
              flex flex-col overflow-hidden"
          >
            {/* Scan line effect */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
              <motion.div
                className="absolute left-0 right-0 h-[2px]"
                style={{
                  background: 'linear-gradient(90deg, transparent, rgba(0,240,255,0.15), rgba(0,240,255,0.3), rgba(0,240,255,0.15), transparent)',
                  boxShadow: '0 0 12px rgba(0,240,255,0.15)',
                }}
                animate={{ top: ['0%', '100%'] }}
                transition={{ duration: 4, repeat: Infinity, ease: 'linear', repeatDelay: 1 }}
              />
            </div>

            {/* Top glow accent */}
            <div className="h-px w-full bg-gradient-to-r from-transparent via-neon-cyan/40 to-transparent" />

            {/* Header */}
            <div className="relative px-6 py-4 border-b border-neon-cyan/10 flex items-center justify-between">
              {/* Corner brackets decorations */}
              <div className="absolute top-0 left-0 w-4 h-4 border-t border-l border-neon-cyan/30" />
              <div className="absolute top-0 right-0 w-4 h-4 border-t border-r border-neon-cyan/30" />

              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-8 h-8 rounded border border-neon-cyan/20 bg-neon-cyan/5">
                  <Keyboard className="w-4 h-4 text-neon-cyan/60" />
                </div>
                <div>
                  <h2
                    className="font-mono text-sm tracking-[0.2em] text-neon-cyan/90 uppercase font-semibold"
                    style={{ textShadow: '0 0 10px rgba(0,240,255,0.3)' }}
                  >
                    [ Keyboard Shortcuts ]
                  </h2>
                  <p className="text-[9px] font-mono text-neon-cyan/25 tracking-wider mt-0.5">
                    QUICK ACCESS COMMANDS
                  </p>
                </div>
              </div>

              <button
                onClick={onClose}
                className="p-2 rounded-lg text-white/30 hover:text-white/70 hover:bg-white/5
                  border border-transparent hover:border-white/10 transition-all"
                aria-label="Close shortcuts"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-5 custom-scrollbar">
              {CATEGORIES.map((category, catIdx) => (
                <motion.div
                  key={category.name}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: catIdx * 0.08, duration: 0.3 }}
                >
                  {/* Category header */}
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-1 h-1 rounded-full bg-neon-cyan/50" style={{ boxShadow: '0 0 4px rgba(0,240,255,0.4)' }} />
                    <span
                      className="text-[11px] font-mono text-neon-cyan/50 uppercase tracking-[0.15em]"
                      style={{ textShadow: '0 0 6px rgba(0,240,255,0.2)' }}
                    >
                      {category.name}
                    </span>
                    <div className="flex-1 h-px bg-gradient-to-r from-neon-cyan/20 to-transparent" />
                  </div>

                  {/* Shortcuts list */}
                  <div className="space-y-2">
                    {category.shortcuts.map((shortcut) => (
                      <div
                        key={shortcut.description}
                        className="flex items-center justify-between py-1.5 px-3 rounded
                          hover:bg-neon-cyan/[0.04] transition-colors group"
                      >
                        <span className="text-[12px] font-mono text-white/50 group-hover:text-white/70 transition-colors">
                          {shortcut.description}
                        </span>
                        <div className="flex items-center gap-1.5">
                          {shortcut.keys.map((key, i) => (
                            <span key={i} className="flex items-center gap-1.5">
                              {i > 0 && (
                                <span className="text-[10px] text-neon-cyan/30 font-mono">+</span>
                              )}
                              <Kbd>{key}</Kbd>
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Footer */}
            <div className="border-t border-neon-cyan/10 px-6 py-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Kbd>Esc</Kbd>
                <span className="text-[10px] font-mono text-white/25">to close</span>
              </div>
              <span className="text-[9px] font-mono text-neon-cyan/15 tracking-wider">
                JARVIS v3.2
              </span>
            </div>

            {/* Bottom glow accent */}
            <div className="h-px w-full bg-gradient-to-r from-transparent via-neon-cyan/20 to-transparent" />

            {/* Bottom corner brackets */}
            <div className="absolute bottom-0 left-0 w-4 h-4 border-b border-l border-neon-cyan/30" />
            <div className="absolute bottom-0 right-0 w-4 h-4 border-b border-r border-neon-cyan/30" />
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
