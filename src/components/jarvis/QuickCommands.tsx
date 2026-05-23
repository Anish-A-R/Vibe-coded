'use client'

import { motion } from 'framer-motion'
import { getSampleCommands } from '@/lib/commands'

interface QuickCommandsProps {
  onCommand: (command: string) => void
}

export function QuickCommands({ onCommand }: QuickCommandsProps) {
  const commands = getSampleCommands()

  return (
    <div className="w-full overflow-x-auto jarvis-scrollbar py-2">
      <motion.div
        className="flex gap-2 px-4 min-w-max"
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
        {commands.map((cmd, i) => (
          <motion.button
            key={i}
            variants={{
              hidden: { opacity: 0, y: 10, scale: 0.9 },
              visible: { opacity: 1, y: 0, scale: 1 },
            }}
            whileHover={{
              scale: 1.05,
              boxShadow: '0 0 15px rgba(0, 240, 255, 0.25)',
            }}
            whileTap={{ scale: 0.97 }}
            onClick={() => onCommand(cmd)}
            className="
              px-4 py-2 rounded-full text-xs font-mono
              bg-white/5 border border-neon-cyan/20
              text-neon-cyan/70
              hover:border-neon-cyan/50 hover:bg-neon-cyan/10 hover:text-neon-cyan
              transition-colors duration-200
              cursor-pointer whitespace-nowrap
            "
          >
            {cmd}
          </motion.button>
        ))}
      </motion.div>
    </div>
  )
}
