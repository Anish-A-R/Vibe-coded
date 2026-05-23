'use client'

import { motion } from 'framer-motion'
import { Clock, Search, Play, Smile, ScanLine, Activity, HelpCircle, type LucideIcon } from 'lucide-react'
import { getSampleCommands } from '@/lib/commands'

interface QuickCommandsProps {
  onCommand: (command: string) => void
}

const COMMAND_ICONS: Record<string, LucideIcon> = {
  'Hey Jarvis, what time is it?': Clock,
  'Search for latest AI news': Search,
  'Open YouTube': Play,
  'Tell me a joke': Smile,
  'Scan systems': ScanLine,
  'Show diagnostics': Activity,
  'Help': HelpCircle,
}

export function QuickCommands({ onCommand }: QuickCommandsProps) {
  const commands = getSampleCommands()

  return (
    <div className="w-full py-2">
      {/* SUGGESTIONS header label */}
      <div className="flex items-center gap-2 px-4 mb-2">
        <div className="h-[1px] flex-1 bg-neon-cyan/5" />
        <span className="text-[9px] font-mono text-neon-cyan/20 tracking-[0.2em] uppercase">
          Suggestions
        </span>
        <div className="h-[1px] flex-1 bg-neon-cyan/5" />
      </div>

      <motion.div
        className="flex gap-2 px-4 min-w-max overflow-x-auto jarvis-scrollbar"
        initial="hidden"
        animate="visible"
        variants={{
          hidden: {},
          visible: {
            transition: {
              staggerChildren: 0.06,
            },
          },
        }}
      >
        {commands.map((cmd, i) => {
          const IconComponent = COMMAND_ICONS[cmd]
          return (
            <motion.button
              key={i}
              variants={{
                hidden: { opacity: 0, y: 10, scale: 0.9 },
                visible: { opacity: 1, y: 0, scale: 1 },
              }}
              whileHover={{
                scale: 1.08,
                boxShadow: '0 0 20px rgba(0, 240, 255, 0.3), 0 0 6px rgba(0, 240, 255, 0.15)',
              }}
              whileTap={{ scale: 0.97 }}
              onClick={() => onCommand(cmd)}
              className="
                flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-mono
                bg-white/5 border border-neon-cyan/15
                text-neon-cyan/60
                hover:border-neon-cyan/40 hover:bg-neon-cyan/10 hover:text-neon-cyan
                transition-colors duration-200
                cursor-pointer whitespace-nowrap
              "
            >
              {IconComponent && <IconComponent className="w-3 h-3 opacity-50" />}
              {cmd}
            </motion.button>
          )
        })}
      </motion.div>
    </div>
  )
}
