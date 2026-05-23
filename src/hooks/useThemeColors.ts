'use client'

import { useJarvisStore } from './useJarvisStore'

// ===== Theme Color Map =====
const themeRGBMap: Record<string, string> = {
  cyan: '0, 240, 255',
  red: '255, 51, 102',
  green: '0, 255, 136',
  purple: '139, 92, 246',
  orange: '255, 106, 0',
  arctic: '96, 165, 250',
}

const themeHexMap: Record<string, string> = {
  cyan: '#00f0ff',
  red: '#ff3366',
  green: '#00ff88',
  purple: '#8b5cf6',
  orange: '#ff6a00',
  arctic: '#60a5fa',
}

/**
 * Hook that provides theme-aware color values for inline styles.
 * Returns the current theme's RGB components and hex color.
 */
export function useThemeColors() {
  const colorTheme = useJarvisStore((s) => s.colorTheme)
  const rgb = themeRGBMap[colorTheme] || themeRGBMap.cyan
  const hex = themeHexMap[colorTheme] || themeHexMap.cyan

  return {
    /** RGB components string, e.g., "0, 240, 255" for use in rgba() */
    rgb,
    /** Hex color, e.g., "#00f0ff" */
    hex,
    /** Create an rgba color with the theme primary */
    rgba: (alpha: number) => `rgba(${rgb}, ${alpha})`,
    /** Primary color with full opacity */
    primary: `rgba(${rgb}, 1)`,
  }
}
