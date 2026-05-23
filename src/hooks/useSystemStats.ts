'use client'

import { useEffect, useRef, useCallback } from 'react'
import { useJarvisStore } from './useJarvisStore'

/**
 * Hook to simulate system statistics (CPU, RAM, etc.)
 * In a real implementation, these would come from a backend API
 */
export function useSystemStats() {
  const { systemStats, setSystemStats } = useJarvisStore()
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const startTimeRef = useRef(Date.now())

  const updateStats = useCallback(() => {
    const uptime = Math.floor((Date.now() - startTimeRef.current) / 1000)

    // Simulate fluctuating system stats
    const cpuBase = 23
    const cpuVariance = Math.sin(Date.now() / 5000) * 15 + Math.random() * 10
    const cpu = Math.min(95, Math.max(5, Math.round(cpuBase + cpuVariance)))

    const ramBase = 41
    const ramVariance = Math.sin(Date.now() / 8000) * 8 + Math.random() * 5
    const ram = Math.min(90, Math.max(20, Math.round(ramBase + ramVariance)))

    const tempBase = 42
    const tempVariance = Math.sin(Date.now() / 6000) * 5 + Math.random() * 3
    const temperature = Math.min(80, Math.max(30, Math.round(tempBase + tempVariance)))

    // Simulate network status - mostly online
    const networkRoll = Math.random()
    const network = networkRoll > 0.98 ? 'offline' : networkRoll > 0.95 ? 'weak' : 'online'

    setSystemStats({ cpu, ram, network, temperature, uptime })
  }, [setSystemStats])

  useEffect(() => {
    updateStats()
    intervalRef.current = setInterval(updateStats, 2000)

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [updateStats])

  return systemStats
}
