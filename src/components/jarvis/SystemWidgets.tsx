'use client'

import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import TimeWidget from './TimeWidget'
import WeatherWidget from './WeatherWidget'
import SystemStatsWidget from './SystemStatsWidget'
import InternetWidget from './InternetWidget'

interface SystemWidgetsProps {
  className?: string
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.5, ease: 'easeOut' },
  },
}

export default function SystemWidgets({ className }: SystemWidgetsProps) {
  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className={cn(
        'grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4',
        className
      )}
    >
      <motion.div variants={itemVariants}>
        <TimeWidget />
      </motion.div>
      <motion.div variants={itemVariants}>
        <WeatherWidget />
      </motion.div>
      <motion.div variants={itemVariants}>
        <SystemStatsWidget />
      </motion.div>
      <motion.div variants={itemVariants}>
        <InternetWidget />
      </motion.div>
    </motion.div>
  )
}
