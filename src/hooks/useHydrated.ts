'use client'

import { useSyncExternalStore } from 'react'

// Returns true only on the client after hydration
// Uses useSyncExternalStore to avoid hydration mismatch and lint errors
const emptySubscribe = () => () => {}

export function useHydrated(): boolean {
  return useSyncExternalStore(
    emptySubscribe,
    () => true,  // Client returns true
    () => false  // Server returns false
  )
}
