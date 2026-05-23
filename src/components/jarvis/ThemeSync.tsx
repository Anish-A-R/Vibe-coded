'use client'

import { useEffect } from 'react'
import { useJarvisStore } from '@/hooks/useJarvisStore'

/**
 * ThemeSync — keeps the data-theme attribute on <html> in sync with the store.
 * Renders nothing. Must be placed inside <body> in the layout.
 */
export function ThemeSync() {
  const colorTheme = useJarvisStore((s) => s.colorTheme)

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', colorTheme)
  }, [colorTheme])

  // Also set on mount (handles persisted state)
  useEffect(() => {
    const current = useJarvisStore.getState().colorTheme
    document.documentElement.setAttribute('data-theme', current)
  }, [])

  return null
}
