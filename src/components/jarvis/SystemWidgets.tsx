'use client'

import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import TimeWidget from './TimeWidget'
import WeatherWidget from './WeatherWidget'
import SystemStatsWidget from './SystemStatsWidget'
import InternetWidget from './InternetWidget'

interface SystemWidgetsProps {
  className?: string
  staggerDirection?: 'left' | 'right' | 'none'
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
    },
  },
}

function getItemVariants(direction: 'left' | 'right' | 'none') {
  if (direction === 'left') {
    return {
      hidden: { opacity: 0, x: -30, scale: 0.95 },
      visible: {
        opacity: 1,
        x: 0,
        scale: 1,
        transition: { duration: 0.5, ease: 'easeOut' },
      },
    }
  }
  if (direction === 'right') {
    return {
      hidden: { opacity: 0, x: 30, scale: 0.95 },
      visible: {
        opacity: 1,
        x: 0,
        scale: 1,
        transition: { duration: 0.5, ease: 'easeOut' },
      },
    }
  }
  return {
    hidden: { opacity: 0, y: 20, scale: 0.95 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { duration: 0.5, ease: 'easeOut' },
    },
  }
}

export default function SystemWidgets({ className, staggerDirection = 'none' }: SystemWidgetsProps) {
  const itemVariants = getItemVariants(staggerDirection)

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
