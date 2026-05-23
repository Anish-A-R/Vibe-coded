import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// ===== Type Definitions =====
export type AIStatus = 'idle' | 'listening' | 'thinking' | 'speaking'
export type PersonalityMode = 'professional' | 'funny' | 'boss'
export type ActivePanel = 'chat' | 'settings' | 'history' | 'diagnostics'
export type ColorTheme = 'cyan' | 'purple' | 'green' | 'red'

export interface Message {
  id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  timestamp: number
  isVoice?: boolean
}

export interface Conversation {
  id: string
  title: string
  messages: Message[]
  createdAt: number
  updatedAt: number
  personality: PersonalityMode
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
  source?: 'live' | 'simulated'
  updated?: string
}

// ===== Notification Types =====
export interface AppNotification {
  id: string
  type: 'info' | 'warning' | 'success' | 'error'
  title: string
  message: string
  timestamp: number
  read: boolean
  icon?: string
}

// ===== Note Types =====
export interface QuickNote {
  id: string
  text: string
  timestamp: number
}

// ===== Event Log Types =====
export type EventSeverity = 'info' | 'warning' | 'success' | 'error'
export type EventType = 'boot' | 'chat' | 'command' | 'connection' | 'voice' | 'system'

export interface SystemEvent {
  id: string
  type: EventType
  severity: EventSeverity
  message: string
  timestamp: number
  details?: string
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

  // Chat - messages derived from active conversation
  messages: Message[]
  addMessage: (message: Omit<Message, 'id' | 'timestamp'>) => void
  removeMessage: (id: string) => void
  clearMessages: () => void

  // Multi-conversation support
  conversations: Conversation[]
  activeConversationId: string | null
  addConversation: () => string
  switchConversation: (id: string) => void
  deleteConversation: (id: string) => void
  updateConversationTitle: (id: string, title: string) => void

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

  // Weather Location
  weatherLocation: string
  setWeatherLocation: (loc: string) => void

  // Notifications (session-only, not persisted)
  notifications: AppNotification[]
  addNotification: (n: Omit<AppNotification, 'id' | 'timestamp' | 'read'>) => void
  markNotificationRead: (id: string) => void
  markAllNotificationsRead: () => void
  clearNotifications: () => void

  // Easter eggs
  easterEggActivated: boolean
  setEasterEggActivated: (activated: boolean) => void
  commandCount: number
  incrementCommandCount: () => void

  // Event Log
  events: SystemEvent[]
  addEvent: (event: Omit<SystemEvent, 'id' | 'timestamp'>) => void
  clearEvents: () => void

  // Focus Timer
  focusTimerMinutes: number
  focusTimerBreakMinutes: number
  focusTimerSessions: number
  setFocusTimerMinutes: (m: number) => void
  setFocusTimerBreakMinutes: (m: number) => void
  setFocusTimerSessions: (s: number) => void

  // Quick Notes
  notes: QuickNote[]
  addNote: (text: string) => void
  removeNote: (id: string) => void

  // Color Theme
  colorTheme: ColorTheme
  setColorTheme: (theme: ColorTheme) => void
}

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

export const useJarvisStore = create<JarvisState>()(
  persist(
    (set, get) => ({
      // Boot sequence
      booted: false,
      bootPhase: 0,
      setBooted: (booted) => set({ booted }),
      setBootPhase: (phase) => set({ bootPhase: phase }),

      // AI Status
      aiStatus: 'idle',
      setAIStatus: (status) => set({ aiStatus: status }),

      // Chat - messages derived from active conversation
      messages: [],
      addMessage: (message) => {
        const state = get()
        const newMsg: Message = {
          ...message,
          id: `msg-${generateId()}`,
          timestamp: Date.now(),
        }

        // Update the active conversation if one exists
        let updatedConversations = state.conversations
        let activeId = state.activeConversationId

        if (activeId) {
          updatedConversations = state.conversations.map((conv) => {
            if (conv.id === activeId) {
              const updatedMessages = [...conv.messages, newMsg]
              // Auto-title: if this is the first user message, use it as title
              let title = conv.title
              if (
                message.role === 'user' &&
                conv.messages.filter((m) => m.role === 'user').length === 0
              ) {
                title = message.content.slice(0, 30) + (message.content.length > 30 ? '...' : '')
              }
              return {
                ...conv,
                messages: updatedMessages,
                title,
                updatedAt: Date.now(),
              }
            }
            return conv
          })
        } else {
          // No active conversation, create one
          const newConv: Conversation = {
            id: `conv-${generateId()}`,
            title: message.role === 'user'
              ? message.content.slice(0, 30) + (message.content.length > 30 ? '...' : '')
              : 'New Conversation',
            messages: [newMsg],
            createdAt: Date.now(),
            updatedAt: Date.now(),
            personality: state.personalityMode,
          }
          activeId = newConv.id
          updatedConversations = [newConv, ...state.conversations]
        }

        // Get messages from the active conversation
        const activeConv = updatedConversations.find((c) => c.id === activeId)
        const newMessages = activeConv ? activeConv.messages : [...state.messages, newMsg]

        set({
          messages: newMessages,
          conversations: updatedConversations,
          activeConversationId: activeId,
        })
      },
      removeMessage: (id) => {
        const state = get()
        const filteredMessages = state.messages.filter((m) => m.id !== id)

        // Also update the conversation
        let updatedConversations = state.conversations
        if (state.activeConversationId) {
          updatedConversations = state.conversations.map((conv) => {
            if (conv.id === state.activeConversationId) {
              return {
                ...conv,
                messages: conv.messages.filter((m) => m.id !== id),
                updatedAt: Date.now(),
              }
            }
            return conv
          })
        }

        set({
          messages: filteredMessages,
          conversations: updatedConversations,
        })
      },
      clearMessages: () => {
        const state = get()
        // Create a new empty conversation
        const newConv: Conversation = {
          id: `conv-${generateId()}`,
          title: 'New Conversation',
          messages: [],
          createdAt: Date.now(),
          updatedAt: Date.now(),
          personality: state.personalityMode,
        }
        set({
          messages: [],
          conversations: [newConv, ...state.conversations],
          activeConversationId: newConv.id,
        })
      },

      // Multi-conversation support
      conversations: [],
      activeConversationId: null,
      addConversation: () => {
        const state = get()
        const newConv: Conversation = {
          id: `conv-${generateId()}`,
          title: 'New Conversation',
          messages: [],
          createdAt: Date.now(),
          updatedAt: Date.now(),
          personality: state.personalityMode,
        }
        set({
          conversations: [newConv, ...state.conversations],
          activeConversationId: newConv.id,
          messages: [],
        })
        return newConv.id
      },
      switchConversation: (id) => {
        const state = get()
        const conv = state.conversations.find((c) => c.id === id)
        if (conv) {
          set({
            activeConversationId: id,
            messages: conv.messages,
            personalityMode: conv.personality,
          })
        }
      },
      deleteConversation: (id) => {
        const state = get()
        const filtered = state.conversations.filter((c) => c.id !== id)

        // If deleting the active conversation, switch to another or create new
        if (state.activeConversationId === id) {
          if (filtered.length > 0) {
            const nextConv = filtered[0]
            set({
              conversations: filtered,
              activeConversationId: nextConv.id,
              messages: nextConv.messages,
              personalityMode: nextConv.personality,
            })
          } else {
            // No conversations left, create a fresh one
            const newConv: Conversation = {
              id: `conv-${generateId()}`,
              title: 'New Conversation',
              messages: [],
              createdAt: Date.now(),
              updatedAt: Date.now(),
              personality: state.personalityMode,
            }
            set({
              conversations: [newConv],
              activeConversationId: newConv.id,
              messages: [],
            })
          }
        } else {
          set({ conversations: filtered })
        }
      },
      updateConversationTitle: (id, title) => {
        set((state) => ({
          conversations: state.conversations.map((conv) =>
            conv.id === id ? { ...conv, title, updatedAt: Date.now() } : conv
          ),
        }))
      },

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
      setPersonalityMode: (mode) => {
        set((state) => {
          // Also update the active conversation's personality
          let updatedConversations = state.conversations
          if (state.activeConversationId) {
            updatedConversations = state.conversations.map((conv) =>
              conv.id === state.activeConversationId
                ? { ...conv, personality: mode, updatedAt: Date.now() }
                : conv
            )
          }
          return { personalityMode: mode, conversations: updatedConversations }
        })
      },
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

      // Weather Location
      weatherLocation: 'New York',
      setWeatherLocation: (loc) => set({ weatherLocation: loc }),

      // Notifications (session-only, not persisted)
      notifications: [],
      addNotification: (n) =>
        set((state) => {
          const newNotification: AppNotification = {
            ...n,
            id: `notif-${generateId()}`,
            timestamp: Date.now(),
            read: false,
          }
          // Keep last 30 notifications
          const updated = [newNotification, ...state.notifications].slice(0, 30)
          return { notifications: updated }
        }),
      markNotificationRead: (id) =>
        set((state) => ({
          notifications: state.notifications.map((n) =>
            n.id === id ? { ...n, read: true } : n
          ),
        })),
      markAllNotificationsRead: () =>
        set((state) => ({
          notifications: state.notifications.map((n) => ({ ...n, read: true })),
        })),
      clearNotifications: () => set({ notifications: [] }),

      // Easter eggs
      easterEggActivated: false,
      setEasterEggActivated: (activated) => set({ easterEggActivated: activated }),
      commandCount: 0,
      incrementCommandCount: () =>
        set((state) => ({ commandCount: state.commandCount + 1 })),

      // Event Log (session-only, not persisted)
      events: [],
      addEvent: (event) =>
        set((state) => {
          const newEvent: SystemEvent = {
            ...event,
            id: `evt-${generateId()}`,
            timestamp: Date.now(),
          }
          // Keep last 50 events
          const updated = [newEvent, ...state.events].slice(0, 50)
          return { events: updated }
        }),
      clearEvents: () => set({ events: [] }),

      // Focus Timer
      focusTimerMinutes: 25,
      focusTimerBreakMinutes: 5,
      focusTimerSessions: 0,
      setFocusTimerMinutes: (m) => set({ focusTimerMinutes: m }),
      setFocusTimerBreakMinutes: (m) => set({ focusTimerBreakMinutes: m }),
      setFocusTimerSessions: (s) => set({ focusTimerSessions: s }),

      // Quick Notes
      notes: [],
      addNote: (text) =>
        set((state) => {
          const newNote: QuickNote = {
            id: `note-${generateId()}`,
            text,
            timestamp: Date.now(),
          }
          // Keep last 20 notes, newest first
          const updated = [newNote, ...state.notes].slice(0, 20)
          return { notes: updated }
        }),
      removeNote: (id) =>
        set((state) => ({
          notes: state.notes.filter((n) => n.id !== id),
        })),

      // Color Theme
      colorTheme: 'cyan',
      setColorTheme: (theme) => set({ colorTheme: theme }),
    }),
    {
      name: 'jarvis-store',
      partialize: (state) => ({
        personalityMode: state.personalityMode,
        soundEnabled: state.soundEnabled,
        volume: state.volume,
        particlesEnabled: state.particlesEnabled,
        wakeWordEnabled: state.wakeWordEnabled,
        commandCount: state.commandCount,
        easterEggActivated: state.easterEggActivated,
        weatherLocation: state.weatherLocation,
        // Focus Timer
        focusTimerMinutes: state.focusTimerMinutes,
        focusTimerBreakMinutes: state.focusTimerBreakMinutes,
        focusTimerSessions: state.focusTimerSessions,
        // Quick Notes (keep last 20)
        notes: state.notes.slice(0, 20),
        // Color Theme
        colorTheme: state.colorTheme,
        // events are NOT persisted (session-only)
        // notifications are NOT persisted (session-only)
        // Persist conversations (keep last 10, last 50 messages each)
        conversations: state.conversations.slice(0, 10).map((conv) => ({
          ...conv,
          messages: conv.messages.slice(-50),
        })),
        activeConversationId: state.activeConversationId,
      }),
    }
  )
)
