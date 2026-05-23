'use client'

import { useJarvisStore } from './useJarvisStore'

// ===== Theme Color Maps =====
const themeRGBMap: Record<string, string> = {
  cyan: '0, 240, 255',
  red: '255, 51, 102',
  green: '0, 255, 136',
  purple: '139, 92, 246',
  orange: '255, 106, 0',
  arctic: '96, 165, 250',
  gold: '255, 215, 0',
  pink: '244, 114, 182',
  teal: '45, 212, 191',
  crimson: '220, 38, 38',
  lime: '132, 204, 22',
}

const themeHexMap: Record<string, string> = {
  cyan: '#00f0ff',
  red: '#ff3366',
  green: '#00ff88',
  purple: '#8b5cf6',
  orange: '#ff6a00',
  arctic: '#60a5fa',
  gold: '#ffd700',
  pink: '#f472b6',
  teal: '#2dd4bf',
  crimson: '#dc2626',
  lime: '#84cc16',
}

const themeSecondaryRGBMap: Record<string, string> = {
  cyan: '0, 102, 255',
  red: '255, 128, 64',
  green: '64, 255, 128',
  purple: '192, 38, 211',
  orange: '255, 149, 0',
  arctic: '56, 189, 248',
  gold: '245, 158, 11',
  pink: '232, 121, 249',
  teal: '20, 184, 166',
  crimson: '239, 68, 68',
  lime: '163, 230, 53',
}

const themeSecondaryHexMap: Record<string, string> = {
  cyan: '#0066ff',
  red: '#ff8040',
  green: '#40ff80',
  purple: '#c026d3',
  orange: '#ff9500',
  arctic: '#38bdf8',
  gold: '#f59e0b',
  pink: '#e879f9',
  teal: '#14b8a6',
  crimson: '#ef4444',
  lime: '#a3e635',
}

/**
 * Hook that provides theme-aware color values for inline styles.
 * Returns the current theme's RGB components, hex color, and secondary colors.
 */
export function useThemeColors() {
  const colorTheme = useJarvisStore((s) => s.colorTheme)
  const rgb = themeRGBMap[colorTheme] || themeRGBMap.cyan
  const hex = themeHexMap[colorTheme] || themeHexMap.cyan
  const secondaryRgb = themeSecondaryRGBMap[colorTheme] || themeSecondaryRGBMap.cyan
  const secondaryHex = themeSecondaryHexMap[colorTheme] || themeSecondaryHexMap.cyan

  return {
    /** RGB components string, e.g., "0, 240, 255" for use in rgba() */
    rgb,
    /** Hex color, e.g., "#00f0ff" */
    hex,
    /** Create an rgba color with the theme primary */
    rgba: (alpha: number) => `rgba(${rgb}, ${alpha})`,
    /** Primary color with full opacity */
    primary: `rgba(${rgb}, 1)`,
    /** Secondary RGB components string */
    secondaryRgb,
    /** Secondary hex color */
    secondaryHex,
    /** Create an rgba color with the theme secondary */
    secondaryRgba: (alpha: number) => `rgba(${secondaryRgb}, ${alpha})`,
    /** Secondary color with full opacity */
    secondary: `rgba(${secondaryRgb}, 1)`,
  }
}
