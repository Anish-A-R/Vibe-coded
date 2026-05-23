'use client'

import { useCallback } from 'react'

// Toast types
export type ToastType = 'info' | 'success' | 'warning' | 'error'

export interface JarvisToastData {
  id: string
  type: ToastType
  title: string
  message: string
  duration?: number
}

// Simple event-based toast system (no React state needed at hook level)
const TOAST_EVENT = 'jarvis-toast'

export function useJarvisToast() {
  const addToast = useCallback((type: ToastType, title: string, message: string, duration = 4000) => {
    const toast: JarvisToastData = {
      id: `toast-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      type,
      title,
      message,
      duration,
    }
    window.dispatchEvent(new CustomEvent(TOAST_EVENT, { detail: toast }))
  }, [])

  return { addToast }
}
