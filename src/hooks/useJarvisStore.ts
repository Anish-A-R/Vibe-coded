import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// ===== Type Definitions =====
export type AIStatus = 'idle' | 'listening' | 'thinking' | 'speaking'
export type PersonalityMode = 'professional' | 'funny' | 'boss'
export type ActivePanel = 'chat' | 'settings' | 'history' | 'diagnostics'

export interface Message {
  id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  timestamp: number
  isVoice?: boolean
}

export interface SystemStats {
  cpu: number
  ram: number
  network: 'online' | 'offline' | 'weak'
  temperature: number
  uptime: number
}

export interface WeatherData {
  temp: number
  condition: string
  humidity: number
  wind: number
  location: string
}

interface JarvisState {
  // Boot sequence
  booted: boolean
  bootPhase: number
  setBooted: (booted: boolean) => void
  setBootPhase: (phase: number) => void

  // AI Status
  aiStatus: AIStatus
  setAIStatus: (status: AIStatus) => void

  // Chat
  messages: Message[]
  addMessage: (message: Omit<Message, 'id' | 'timestamp'>) => void
  removeMessage: (id: string) => void
  clearMessages: () => void

  // Voice
  isListening: boolean
  setIsListening: (listening: boolean) => void
  wakeWordEnabled: boolean
  setWakeWordEnabled: (enabled: boolean) => void

  // UI
  activePanel: ActivePanel
  setActivePanel: (panel: ActivePanel) => void
  showSettings: boolean
  setShowSettings: (show: boolean) => void
  showHistory: boolean
  setShowHistory: (show: boolean) => void
  showDiagnostics: boolean
  setShowDiagnostics: (show: boolean) => void

  // Settings
  personalityMode: PersonalityMode
  setPersonalityMode: (mode: PersonalityMode) => void
  soundEnabled: boolean
  setSoundEnabled: (enabled: boolean) => void
  volume: number
  setVolume: (volume: number) => void
  particlesEnabled: boolean
  setParticlesEnabled: (enabled: boolean) => void

  // System
  systemStats: SystemStats
  setSystemStats: (stats: SystemStats) => void
  weather: WeatherData | null
  setWeather: (weather: WeatherData | null) => void

  // Easter eggs
  easterEggActivated: boolean
  setEasterEggActivated: (activated: boolean) => void
  commandCount: number
  incrementCommandCount: () => void
}

export const useJarvisStore = create<JarvisState>()(
  persist(
    (set) => ({
      // Boot sequence
      booted: false,
      bootPhase: 0,
      setBooted: (booted) => set({ booted }),
      setBootPhase: (phase) => set({ bootPhase: phase }),

      // AI Status
      aiStatus: 'idle',
      setAIStatus: (status) => set({ aiStatus: status }),

      // Chat
      messages: [],
      addMessage: (message) =>
        set((state) => ({
          messages: [
            ...state.messages,
            {
              ...message,
              id: `msg-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
              timestamp: Date.now(),
            },
          ],
        })),
      removeMessage: (id) =>
        set((state) => ({
          messages: state.messages.filter((m) => m.id !== id),
        })),
      clearMessages: () => set({ messages: [] }),

      // Voice
      isListening: false,
      setIsListening: (listening) => set({ isListening: listening }),
      wakeWordEnabled: true,
      setWakeWordEnabled: (enabled) => set({ wakeWordEnabled: enabled }),

      // UI
      activePanel: 'chat',
      setActivePanel: (panel) => set({ activePanel: panel }),
      showSettings: false,
      setShowSettings: (show) => set({ showSettings: show }),
      showHistory: false,
      setShowHistory: (show) => set({ showHistory: show }),
      showDiagnostics: false,
      setShowDiagnostics: (show) => set({ showDiagnostics: show }),

      // Settings
      personalityMode: 'professional',
      setPersonalityMode: (mode) => set({ personalityMode: mode }),
      soundEnabled: true,
      setSoundEnabled: (enabled) => set({ soundEnabled: enabled }),
      volume: 0.7,
      setVolume: (volume) => set({ volume }),
      particlesEnabled: true,
      setParticlesEnabled: (enabled) => set({ particlesEnabled: enabled }),

      // System
      systemStats: {
        cpu: 23,
        ram: 41,
        network: 'online',
        temperature: 42,
        uptime: 0,
      },
      setSystemStats: (stats) => set({ systemStats: stats }),
      weather: null,
      setWeather: (weather) => set({ weather }),

      // Easter eggs
      easterEggActivated: false,
      setEasterEggActivated: (activated) => set({ easterEggActivated: activated }),
      commandCount: 0,
      incrementCommandCount: () =>
        set((state) => ({ commandCount: state.commandCount + 1 })),
    }),
    {
      name: 'jarvis-store',
      partialize: (state) => ({
        personalityMode: state.personalityMode,
        soundEnabled: state.soundEnabled,
        volume: state.volume,
        particlesEnabled: state.particlesEnabled,
        wakeWordEnabled: state.wakeWordEnabled,
        messages: state.messages.slice(-100), // Keep last 100 messages
        commandCount: state.commandCount,
        easterEggActivated: state.easterEggActivated,
      }),
    }
  )
)
