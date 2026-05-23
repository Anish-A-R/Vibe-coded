import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// ===== Existing Type Definitions =====
export type AIStatus = 'idle' | 'listening' | 'thinking' | 'speaking'
export type PersonalityMode = 'professional' | 'funny' | 'boss'
export type ActivePanel = 'chat' | 'settings' | 'history' | 'diagnostics'
export type ColorTheme = 'cyan' | 'red' | 'green' | 'purple' | 'orange' | 'arctic'
export type AmbientSound = 'none' | 'rain' | 'cyberpunk' | 'space' | 'ocean' | 'fire'

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

// ===== NEW: Window Management Types =====
export interface OSWindow {
  id: string
  appId: string
  title: string
  icon: string
  x: number
  y: number
  width: number
  height: number
  minWidth: number
  minHeight: number
  isMinimized: boolean
  isMaximized: boolean
  zIndex: number
  isOpen: boolean
}

// ===== NEW: AI Agent System Types =====
export type AgentType = 'coding' | 'research' | 'productivity' | 'security' | 'automation' | 'creative' | 'system'

export interface AIAgent {
  id: AgentType
  name: string
  description: string
  icon: string
  status: 'idle' | 'active' | 'processing' | 'error'
  tasksCompleted: number
  color: string
}

// ===== NEW: AI Memory System Types =====
export interface MemoryEntry {
  id: string
  type: 'conversation' | 'preference' | 'workflow' | 'project' | 'context'
  content: string
  timestamp: number
  importance: number // 1-5
  tags: string[]
}

// ===== NEW: Gamification System Types =====
export interface Achievement {
  id: string
  name: string
  description: string
  icon: string
  unlockedAt: number | null
  xpReward: number
  category: 'commands' | 'chat' | 'agents' | 'exploration' | 'streaks'
  hidden: boolean
}

// ===== NEW: OS Mode Types =====
export type OSMode = 'normal' | 'focus' | 'coding' | 'security' | 'presentation' | 'stealth'

// ===== NEW: Advanced Theme Types =====
export type AdvancedTheme = 'cyberpunk' | 'holographic' | 'military' | 'hacker' | 'space' | 'glassmorphism' | 'neon'

// ===== NEW: Plugin System Types =====
export interface Plugin {
  id: string
  name: string
  description: string
  icon: string
  version: string
  enabled: boolean
  installed: boolean
  category: 'productivity' | 'developer' | 'creative' | 'system' | 'data'
}

// ===== NEW: App Definition Types =====
export interface AppDefinition {
  id: string
  name: string
  icon: string
  description: string
  category: 'communication' | 'productivity' | 'developer' | 'system' | 'creative' | 'data'
  defaultWidth: number
  defaultHeight: number
  minWidth: number
  minHeight: number
  singleton: boolean // only one instance allowed
}

// ===== Default Data: App Definitions =====
const defaultApps: AppDefinition[] = [
  {
    id: 'chat',
    name: 'Chat',
    icon: 'MessageSquare',
    description: 'AI-powered conversation interface',
    category: 'communication',
    defaultWidth: 700,
    defaultHeight: 500,
    minWidth: 400,
    minHeight: 300,
    singleton: true,
  },
  {
    id: 'terminal',
    name: 'Terminal',
    icon: 'Terminal',
    description: 'Command-line interface for JARVIS',
    category: 'developer',
    defaultWidth: 650,
    defaultHeight: 450,
    minWidth: 400,
    minHeight: 250,
    singleton: true,
  },
  {
    id: 'agents',
    name: 'AI Agents',
    icon: 'Brain',
    description: 'Manage and interact with AI agents',
    category: 'system',
    defaultWidth: 600,
    defaultHeight: 500,
    minWidth: 400,
    minHeight: 300,
    singleton: true,
  },
  {
    id: 'dashboard',
    name: 'Dashboard',
    icon: 'LayoutDashboard',
    description: 'System overview and analytics',
    category: 'data',
    defaultWidth: 800,
    defaultHeight: 600,
    minWidth: 500,
    minHeight: 400,
    singleton: true,
  },
  {
    id: 'security',
    name: 'Security',
    icon: 'Shield',
    description: 'Security monitoring and threat detection',
    category: 'system',
    defaultWidth: 600,
    defaultHeight: 500,
    minWidth: 400,
    minHeight: 300,
    singleton: true,
  },
  {
    id: 'memory',
    name: 'AI Memory',
    icon: 'Database',
    description: 'View and manage AI memory banks',
    category: 'system',
    defaultWidth: 600,
    defaultHeight: 500,
    minWidth: 400,
    minHeight: 300,
    singleton: true,
  },
  {
    id: 'productivity',
    name: 'Productivity',
    icon: 'CheckSquare',
    description: 'Tasks, notes, and workflow management',
    category: 'productivity',
    defaultWidth: 600,
    defaultHeight: 500,
    minWidth: 400,
    minHeight: 300,
    singleton: true,
  },
  {
    id: 'developer',
    name: 'Developer Tools',
    icon: 'Code',
    description: 'Code editor and development utilities',
    category: 'developer',
    defaultWidth: 800,
    defaultHeight: 600,
    minWidth: 500,
    minHeight: 400,
    singleton: true,
  },
  {
    id: 'plugins',
    name: 'Plugins',
    icon: 'Puzzle',
    description: 'Manage installed plugins and extensions',
    category: 'system',
    defaultWidth: 550,
    defaultHeight: 450,
    minWidth: 350,
    minHeight: 300,
    singleton: true,
  },
  {
    id: 'settings',
    name: 'Settings',
    icon: 'Settings',
    description: 'System configuration and preferences',
    category: 'system',
    defaultWidth: 600,
    defaultHeight: 500,
    minWidth: 400,
    minHeight: 350,
    singleton: true,
  },
]

// ===== Default Data: AI Agents =====
const defaultAgents: AIAgent[] = [
  {
    id: 'coding',
    name: 'Code Agent',
    description: 'Writes, reviews, and debugs code across multiple languages',
    icon: 'Code',
    status: 'idle',
    tasksCompleted: 0,
    color: '#00f0ff',
  },
  {
    id: 'research',
    name: 'Research Agent',
    description: 'Conducts deep research and synthesizes information from multiple sources',
    icon: 'Search',
    status: 'idle',
    tasksCompleted: 0,
    color: '#8b5cf6',
  },
  {
    id: 'productivity',
    name: 'Productivity Agent',
    description: 'Manages tasks, schedules, and workflow optimization',
    icon: 'CheckSquare',
    status: 'idle',
    tasksCompleted: 0,
    color: '#00ff88',
  },
  {
    id: 'security',
    name: 'Security Agent',
    description: 'Monitors threats, manages access control, and ensures system integrity',
    icon: 'Shield',
    status: 'idle',
    tasksCompleted: 0,
    color: '#ff3366',
  },
  {
    id: 'automation',
    name: 'Automation Agent',
    description: 'Creates and manages automated workflows and recurring tasks',
    icon: 'Zap',
    status: 'idle',
    tasksCompleted: 0,
    color: '#ffcc00',
  },
  {
    id: 'creative',
    name: 'Creative Agent',
    description: 'Generates content, designs, and creative solutions',
    icon: 'Palette',
    status: 'idle',
    tasksCompleted: 0,
    color: '#ff6b35',
  },
  {
    id: 'system',
    name: 'System Agent',
    description: 'Handles OS operations, resource management, and system maintenance',
    icon: 'Cpu',
    status: 'idle',
    tasksCompleted: 0,
    color: '#64748b',
  },
]

// ===== Default Data: Achievements =====
const defaultAchievements: Achievement[] = [
  // Commands category
  {
    id: 'first-command',
    name: 'First Contact',
    description: 'Execute your first command',
    icon: 'Terminal',
    unlockedAt: null,
    xpReward: 10,
    category: 'commands',
    hidden: false,
  },
  {
    id: 'command-novice',
    name: 'Command Novice',
    description: 'Execute 10 commands',
    icon: 'ArrowRight',
    unlockedAt: null,
    xpReward: 25,
    category: 'commands',
    hidden: false,
  },
  {
    id: 'command-expert',
    name: 'Command Expert',
    description: 'Execute 100 commands',
    icon: 'Zap',
    unlockedAt: null,
    xpReward: 100,
    category: 'commands',
    hidden: false,
  },
  // Chat category
  {
    id: 'first-chat',
    name: 'Hello JARVIS',
    description: 'Send your first message to JARVIS',
    icon: 'MessageSquare',
    unlockedAt: null,
    xpReward: 10,
    category: 'chat',
    hidden: false,
  },
  {
    id: 'conversation-starter',
    name: 'Conversation Starter',
    description: 'Create 5 conversations',
    icon: 'MessagesSquare',
    unlockedAt: null,
    xpReward: 50,
    category: 'chat',
    hidden: false,
  },
  {
    id: 'polyglot',
    name: 'Polyglot',
    description: 'Chat in 3 different languages',
    icon: 'Globe',
    unlockedAt: null,
    xpReward: 75,
    category: 'chat',
    hidden: true,
  },
  // Agents category
  {
    id: 'first-agent',
    name: 'Agent Handler',
    description: 'Activate your first AI agent',
    icon: 'Brain',
    unlockedAt: null,
    xpReward: 25,
    category: 'agents',
    hidden: false,
  },
  {
    id: 'all-agents',
    name: 'Full Spectrum',
    description: 'Activate all 7 AI agents',
    icon: 'Layers',
    unlockedAt: null,
    xpReward: 150,
    category: 'agents',
    hidden: true,
  },
  {
    id: 'agent-tasks-50',
    name: 'Delegation Master',
    description: 'Complete 50 agent tasks',
    icon: 'CheckCircle',
    unlockedAt: null,
    xpReward: 100,
    category: 'agents',
    hidden: false,
  },
  // Exploration category
  {
    id: 'explorer',
    name: 'Explorer',
    description: 'Open 5 different apps',
    icon: 'Compass',
    unlockedAt: null,
    xpReward: 30,
    category: 'exploration',
    hidden: false,
  },
  {
    id: 'plugin-pioneer',
    name: 'Plugin Pioneer',
    description: 'Install your first plugin',
    icon: 'Puzzle',
    unlockedAt: null,
    xpReward: 20,
    category: 'exploration',
    hidden: false,
  },
  {
    id: 'theme-changer',
    name: 'Identity Shift',
    description: 'Change the advanced theme',
    icon: 'Palette',
    unlockedAt: null,
    xpReward: 15,
    category: 'exploration',
    hidden: false,
  },
  {
    id: 'easter-egg',
    name: 'I Am Iron Man',
    description: 'Discover the hidden easter egg',
    icon: 'Star',
    unlockedAt: null,
    xpReward: 50,
    category: 'exploration',
    hidden: true,
  },
  // Streaks category
  {
    id: 'first-streak',
    name: 'Consistency',
    description: 'Maintain a 3-day streak',
    icon: 'Flame',
    unlockedAt: null,
    xpReward: 30,
    category: 'streaks',
    hidden: false,
  },
  {
    id: 'streak-week',
    name: 'Dedicated',
    description: 'Maintain a 7-day streak',
    icon: 'Award',
    unlockedAt: null,
    xpReward: 100,
    category: 'streaks',
    hidden: false,
  },
  {
    id: 'streak-month',
    name: 'Unstoppable',
    description: 'Maintain a 30-day streak',
    icon: 'Crown',
    unlockedAt: null,
    xpReward: 500,
    category: 'streaks',
    hidden: true,
  },
]

// ===== Default Data: Plugins =====
const defaultPlugins: Plugin[] = [
  {
    id: 'code-assist',
    name: 'Code Assist Pro',
    description: 'Advanced code completion and refactoring suggestions',
    icon: 'Code',
    version: '2.1.0',
    enabled: true,
    installed: true,
    category: 'developer',
  },
  {
    id: 'markdown-editor',
    name: 'Markdown Studio',
    description: 'Rich markdown editing with live preview',
    icon: 'FileText',
    version: '1.4.2',
    enabled: true,
    installed: true,
    category: 'productivity',
  },
  {
    id: 'git-manager',
    name: 'Git Flow',
    description: 'Visual Git repository management and insights',
    icon: 'GitBranch',
    version: '3.0.1',
    enabled: false,
    installed: true,
    category: 'developer',
  },
  {
    id: 'api-tester',
    name: 'API Forge',
    description: 'REST and GraphQL API testing workbench',
    icon: 'Globe',
    version: '1.2.0',
    enabled: false,
    installed: true,
    category: 'developer',
  },
  {
    id: 'data-viz',
    name: 'DataLens',
    description: 'Interactive data visualization and chart builder',
    icon: 'BarChart3',
    version: '1.8.0',
    enabled: true,
    installed: true,
    category: 'data',
  },
  {
    id: 'security-scanner',
    name: 'VulnGuard',
    description: 'Automated vulnerability scanning and patch recommendations',
    icon: 'ShieldAlert',
    version: '2.3.0',
    enabled: false,
    installed: true,
    category: 'system',
  },
  {
    id: 'creative-studio',
    name: 'Creative Canvas',
    description: 'AI-powered image generation and design tools',
    icon: 'Paintbrush',
    version: '1.0.5',
    enabled: false,
    installed: false,
    category: 'creative',
  },
  {
    id: 'workflow-engine',
    name: 'FlowBuilder',
    description: 'Visual workflow automation and scheduling engine',
    icon: 'Workflow',
    version: '1.5.0',
    enabled: false,
    installed: false,
    category: 'productivity',
  },
  {
    id: 'db-explorer',
    name: 'DB Navigator',
    description: 'Database browser with query editor and schema visualization',
    icon: 'Database',
    version: '2.0.3',
    enabled: false,
    installed: false,
    category: 'developer',
  },
  {
    id: 'sys-monitor',
    name: 'SysMonitor Plus',
    description: 'Advanced system monitoring with alerting and resource optimization',
    icon: 'Activity',
    version: '1.1.0',
    enabled: true,
    installed: true,
    category: 'system',
  },
]

// ===== State Interface =====
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
  clearAllConversations: () => void
  updateConversationTitle: (id: string, title: string) => void

  // Voice
  isListening: boolean
  setIsListening: (listening: boolean) => void
  wakeWordEnabled: boolean
  setWakeWordEnabled: (enabled: boolean) => void
  pendingVoiceInput: string | null
  setPendingVoiceInput: (text: string | null) => void
  voiceTranscript: string
  setVoiceTranscript: (text: string) => void

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

  // Event Log (session-only, not persisted)
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

  // CRT Overlay
  crtOverlayEnabled: boolean
  setCRTOverlayEnabled: (enabled: boolean) => void

  // Ambient Sound
  ambientSound: AmbientSound
  setAmbientSound: (sound: AmbientSound) => void
  ambientVolume: number
  setAmbientVolume: (volume: number) => void

  // Widget Collapse State
  collapsedWidgets: string[]
  toggleWidgetCollapse: (widgetId: string) => void

  // Voice Language
  voiceLanguage: string
  setVoiceLanguage: (lang: string) => void

  // ===== NEW: Window Management (OS-level) =====
  openWindows: OSWindow[]
  activeWindowId: string | null
  nextZIndex: number
  openApp: (appId: string) => void
  closeWindow: (id: string) => void
  minimizeWindow: (id: string) => void
  maximizeWindow: (id: string) => void
  restoreWindow: (id: string) => void
  focusWindow: (id: string) => void
  moveWindow: (id: string, x: number, y: number) => void
  resizeWindow: (id: string, width: number, height: number) => void

  // ===== NEW: AI Agent System =====
  agents: AIAgent[]
  activeAgentId: AgentType | null
  setActiveAgent: (id: AgentType | null) => void
  updateAgentStatus: (id: AgentType, status: AIAgent['status']) => void
  incrementAgentTasks: (id: AgentType) => void

  // ===== NEW: AI Memory System =====
  aiMemory: MemoryEntry[]
  addMemory: (entry: Omit<MemoryEntry, 'id' | 'timestamp'>) => void
  removeMemory: (id: string) => void
  clearMemory: () => void

  // ===== NEW: Gamification System =====
  xp: number
  level: number
  achievements: Achievement[]
  streak: number
  lastActiveDate: string | null
  totalCommands: number
  addXP: (amount: number) => void
  unlockAchievement: (id: string) => void
  updateStreak: () => void

  // ===== NEW: OS Mode System =====
  osMode: OSMode
  setOSMode: (mode: OSMode) => void

  // ===== NEW: Command History =====
  commandHistory: string[]
  addToCommandHistory: (cmd: string) => void
  clearCommandHistory: () => void

  // ===== NEW: Advanced Theme =====
  advancedTheme: AdvancedTheme
  setAdvancedTheme: (theme: AdvancedTheme) => void

  // ===== NEW: Plugin System =====
  plugins: Plugin[]
  togglePlugin: (id: string) => void
  installPlugin: (id: string) => void
  uninstallPlugin: (id: string) => void

  // ===== NEW: App Definitions =====
  availableApps: AppDefinition[]

  // ===== NEW: App Launcher =====
  showAppLauncher: boolean
  setShowAppLauncher: (show: boolean) => void

  // ===== NEW: Window Toggle =====
  toggleWindowMinimize: (id: string) => void

  // ===== Voice-First UI =====
  showChat: boolean
  setShowChat: (show: boolean) => void
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
      clearAllConversations: () => {
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
          conversations: [newConv],
          activeConversationId: newConv.id,
          messages: [],
        })
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
      pendingVoiceInput: null,
      setPendingVoiceInput: (text) => set({ pendingVoiceInput: text }),
      voiceTranscript: '',
      setVoiceTranscript: (text) => set({ voiceTranscript: text }),

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

      // CRT Overlay
      crtOverlayEnabled: true,
      setCRTOverlayEnabled: (enabled) => set({ crtOverlayEnabled: enabled }),

      // Ambient Sound
      ambientSound: 'none',
      setAmbientSound: (sound) => set({ ambientSound: sound }),
      ambientVolume: 0.5,
      setAmbientVolume: (volume) => set({ ambientVolume: volume }),

      // Widget Collapse
      collapsedWidgets: [],
      toggleWidgetCollapse: (widgetId) =>
        set((state) => ({
          collapsedWidgets: state.collapsedWidgets.includes(widgetId)
            ? state.collapsedWidgets.filter((id) => id !== widgetId)
            : [...state.collapsedWidgets, widgetId],
        })),

      // Voice Language
      voiceLanguage: 'en-US',
      setVoiceLanguage: (lang) => set({ voiceLanguage: lang }),

      // ===== NEW: Window Management (OS-level) =====
      openWindows: [],
      activeWindowId: null,
      nextZIndex: 100,
      openApp: (appId) => {
        const state = get()
        const appDef = state.availableApps.find((a) => a.id === appId)
        if (!appDef) return

        // If singleton and already open, just focus it
        if (appDef.singleton) {
          const existing = state.openWindows.find((w) => w.appId === appId && w.isOpen)
          if (existing) {
          set({
            activeWindowId: existing.id,
            openWindows: state.openWindows.map((w) =>
              w.id === existing.id
                ? { ...w, zIndex: state.nextZIndex, isMinimized: false }
                : w
            ),
            nextZIndex: state.nextZIndex + 1,
          })
          return
          }
        }

        // Calculate position with offset for cascading
        const openCount = state.openWindows.filter((w) => w.isOpen).length
        const offset = openCount * 30
        const maxX = typeof window !== 'undefined' ? Math.max(window.innerWidth - appDef.defaultWidth, 0) : 100
        const maxY = typeof window !== 'undefined' ? Math.max(window.innerHeight - appDef.defaultHeight - 48, 0) : 50

        const newWindow: OSWindow = {
          id: `win-${generateId()}`,
          appId: appDef.id,
          title: appDef.name,
          icon: appDef.icon,
          x: Math.min(80 + offset, maxX),
          y: Math.min(40 + offset, maxY),
          width: appDef.defaultWidth,
          height: appDef.defaultHeight,
          minWidth: appDef.minWidth,
          minHeight: appDef.minHeight,
          isMinimized: false,
          isMaximized: false,
          zIndex: state.nextZIndex,
          isOpen: true,
        }

        set({
          openWindows: [...state.openWindows, newWindow],
          activeWindowId: newWindow.id,
          nextZIndex: state.nextZIndex + 1,
        })
      },
      closeWindow: (id) =>
        set((state) => {
          const remaining = state.openWindows.filter((w) => w.id !== id)
          const newActiveId =
            state.activeWindowId === id
              ? remaining.length > 0
                ? remaining.reduce((a, b) => (a.zIndex > b.zIndex ? a : b)).id
                : null
              : state.activeWindowId
          return {
            openWindows: remaining,
            activeWindowId: newActiveId,
          }
        }),
      minimizeWindow: (id) =>
        set((state) => ({
          openWindows: state.openWindows.map((w) =>
            w.id === id ? { ...w, isMinimized: true } : w
          ),
          activeWindowId:
            state.activeWindowId === id
              ? (() => {
                  const visible = state.openWindows.filter(
                    (w) => w.id !== id && !w.isMinimized
                  )
                  return visible.length > 0
                    ? visible.reduce((a, b) => (a.zIndex > b.zIndex ? a : b)).id
                    : null
                })()
              : state.activeWindowId,
        })),
      maximizeWindow: (id) =>
        set((state) => ({
          openWindows: state.openWindows.map((w) =>
            w.id === id ? { ...w, isMaximized: true } : w
          ),
        })),
      restoreWindow: (id) =>
        set((state) => ({
          openWindows: state.openWindows.map((w) =>
            w.id === id ? { ...w, isMinimized: false, isMaximized: false } : w
          ),
        })),
      focusWindow: (id) =>
        set((state) => ({
          activeWindowId: id,
          openWindows: state.openWindows.map((w) =>
            w.id === id
              ? { ...w, zIndex: state.nextZIndex, isMinimized: false }
              : w
          ),
          nextZIndex: state.nextZIndex + 1,
        })),
      moveWindow: (id, x, y) =>
        set((state) => ({
          openWindows: state.openWindows.map((w) =>
            w.id === id ? { ...w, x, y } : w
          ),
        })),
      resizeWindow: (id, width, height) =>
        set((state) => ({
          openWindows: state.openWindows.map((w) =>
            w.id === id
              ? {
                  ...w,
                  width: Math.max(width, w.minWidth),
                  height: Math.max(height, w.minHeight),
                }
              : w
          ),
        })),

      // ===== NEW: AI Agent System =====
      agents: defaultAgents,
      activeAgentId: null,
      setActiveAgent: (id) => set({ activeAgentId: id }),
      updateAgentStatus: (id, status) =>
        set((state) => ({
          agents: state.agents.map((agent) =>
            agent.id === id ? { ...agent, status } : agent
          ),
        })),
      incrementAgentTasks: (id) =>
        set((state) => ({
          agents: state.agents.map((agent) =>
            agent.id === id
              ? { ...agent, tasksCompleted: agent.tasksCompleted + 1 }
              : agent
          ),
        })),

      // ===== NEW: AI Memory System =====
      aiMemory: [],
      addMemory: (entry) =>
        set((state) => {
          const newEntry: MemoryEntry = {
            ...entry,
            id: `mem-${generateId()}`,
            timestamp: Date.now(),
          }
          // Keep last 100 memories, newest first
          const updated = [newEntry, ...state.aiMemory].slice(0, 100)
          return { aiMemory: updated }
        }),
      removeMemory: (id) =>
        set((state) => ({
          aiMemory: state.aiMemory.filter((m) => m.id !== id),
        })),
      clearMemory: () => set({ aiMemory: [] }),

      // ===== NEW: Gamification System =====
      xp: 0,
      level: 1,
      achievements: defaultAchievements,
      streak: 0,
      lastActiveDate: null,
      totalCommands: 0,
      addXP: (amount) =>
        set((state) => {
          const newXP = state.xp + amount
          // Level up formula: each level requires level * 100 XP
          const xpForLevel = (level: number) => level * 100
          let newLevel = state.level
          let remainingXP = newXP
          // Calculate level based on cumulative XP
          let totalNeeded = 0
          while (totalNeeded + xpForLevel(newLevel) <= remainingXP) {
            totalNeeded += xpForLevel(newLevel)
            newLevel++
          }
          return { xp: newXP, level: newLevel }
        }),
      unlockAchievement: (id) =>
        set((state) => {
          const achievement = state.achievements.find((a) => a.id === id)
          if (!achievement || achievement.unlockedAt !== null) return state

          const updatedAchievements = state.achievements.map((a) =>
            a.id === id ? { ...a, unlockedAt: Date.now() } : a
          )
          // Auto-add XP from achievement
          const newXP = state.xp + achievement.xpReward
          const xpForLevel = (level: number) => level * 100
          let newLevel = state.level
          let remainingXP = newXP
          let totalNeeded = 0
          while (totalNeeded + xpForLevel(newLevel) <= remainingXP) {
            totalNeeded += xpForLevel(newLevel)
            newLevel++
          }

          return {
            achievements: updatedAchievements,
            xp: newXP,
            level: newLevel,
          }
        }),
      updateStreak: () =>
        set((state) => {
          const today = new Date().toISOString().split('T')[0]
          if (state.lastActiveDate === today) return state

          const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0]
          const newStreak = state.lastActiveDate === yesterday ? state.streak + 1 : 1

          return {
            streak: newStreak,
            lastActiveDate: today,
          }
        }),

      // ===== NEW: OS Mode System =====
      osMode: 'normal',
      setOSMode: (mode) => set({ osMode: mode }),

      // ===== NEW: Command History =====
      commandHistory: [],
      addToCommandHistory: (cmd) =>
        set((state) => {
          // Avoid duplicates at the top
          const filtered = state.commandHistory.filter((c) => c !== cmd)
          // Keep last 50
          const updated = [cmd, ...filtered].slice(0, 50)
          return {
            commandHistory: updated,
            totalCommands: state.totalCommands + 1,
          }
        }),
      clearCommandHistory: () => set({ commandHistory: [] }),

      // ===== NEW: Advanced Theme =====
      advancedTheme: 'cyberpunk',
      setAdvancedTheme: (theme) => set({ advancedTheme: theme }),

      // ===== NEW: Plugin System =====
      plugins: defaultPlugins,
      togglePlugin: (id) =>
        set((state) => ({
          plugins: state.plugins.map((p) =>
            p.id === id && p.installed ? { ...p, enabled: !p.enabled } : p
          ),
        })),
      installPlugin: (id) =>
        set((state) => ({
          plugins: state.plugins.map((p) =>
            p.id === id ? { ...p, installed: true, enabled: true } : p
          ),
        })),
      uninstallPlugin: (id) =>
        set((state) => ({
          plugins: state.plugins.map((p) =>
            p.id === id ? { ...p, installed: false, enabled: false } : p
          ),
        })),

      // ===== NEW: App Definitions =====
      availableApps: defaultApps,

      // ===== NEW: App Launcher =====
      showAppLauncher: false,
      setShowAppLauncher: (show) => set({ showAppLauncher: show }),

      // ===== Voice-First UI =====
      showChat: false,
      setShowChat: (show) => set({ showChat: show }),

      // ===== NEW: Window Toggle =====
      toggleWindowMinimize: (id) => {
        const state = get()
        const win = state.openWindows.find((w) => w.id === id)
        if (!win) return

        if (win.isMinimized) {
          // If minimized, restore + focus
          state.focusWindow(id)
        } else if (state.activeWindowId === id) {
          // If active, minimize it
          state.minimizeWindow(id)
        } else {
          // If not minimized and not active, focus it
          state.focusWindow(id)
        }
      },
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
        // CRT Overlay
        crtOverlayEnabled: state.crtOverlayEnabled,
        // Ambient Sound
        ambientSound: state.ambientSound,
        ambientVolume: state.ambientVolume,
        // Widget Collapse
        collapsedWidgets: state.collapsedWidgets,
        // Voice Language
        voiceLanguage: state.voiceLanguage,
        // Persist conversations (keep last 10, last 50 messages each)
        conversations: state.conversations.slice(0, 10).map((conv) => ({
          ...conv,
          messages: conv.messages.slice(-50),
        })),
        activeConversationId: state.activeConversationId,
        // events are NOT persisted (session-only)
        // notifications are NOT persisted (session-only)

        // ===== NEW: Persisted OS-level state =====
        // Window Management
        openWindows: state.openWindows,
        activeWindowId: state.activeWindowId,

        // Advanced Theme
        advancedTheme: state.advancedTheme,

        // OS Mode
        osMode: state.osMode,

        // Gamification
        xp: state.xp,
        level: state.level,
        streak: state.streak,
        achievements: state.achievements,
        lastActiveDate: state.lastActiveDate,
        totalCommands: state.totalCommands,

        // AI Memory (keep last 100)
        aiMemory: state.aiMemory.slice(0, 100),

        // Command History (keep last 50)
        commandHistory: state.commandHistory.slice(0, 50),

        // Plugins
        plugins: state.plugins,

        // App Launcher
        showAppLauncher: state.showAppLauncher,
      }),
    }
  )
)

// ===== Named Exports =====
export const APP_REGISTRY = defaultApps

export const APP_CATEGORIES: AppDefinition['category'][] = [
  'communication',
  'productivity',
  'developer',
  'system',
  'creative',
  'data',
]
