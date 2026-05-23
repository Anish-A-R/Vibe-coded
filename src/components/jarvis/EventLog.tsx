'use client'

import { useState, useEffect, useRef, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  X,
  Search,
  Trash2,
  Info,
  CheckCircle,
  AlertTriangle,
  AlertCircle,
  ChevronUp,
} from 'lucide-react'
import { useJarvisStore, type SystemEvent, type EventType, type EventSeverity } from '@/hooks/useJarvisStore'

// ===== Severity Config =====
const SEVERITY_CONFIG: Record<EventSeverity, { color: string; bg: string; border: string; icon: React.ElementType; label: string }> = {
  info: {
    color: 'text-neon-cyan',
    bg: 'bg-neon-cyan/10',
    border: 'border-neon-cyan/30',
    icon: Info,
    label: 'INFO',
  },
  success: {
    color: 'text-neon-green',
    bg: 'bg-neon-green/10',
    border: 'border-neon-green/30',
    icon: CheckCircle,
    label: 'OK',
  },
  warning: {
    color: 'text-neon-orange',
    bg: 'bg-neon-orange/10',
    border: 'border-neon-orange/30',
    icon: AlertTriangle,
    label: 'WARN',
  },
  error: {
    color: 'text-neon-red',
    bg: 'bg-neon-red/10',
    border: 'border-neon-red/30',
    icon: AlertCircle,
    label: 'ERR',
  },
}

// ===== Type Filter Config =====
const TYPE_FILTERS: { label: string; types: EventType[] | null }[] = [
  { label: 'All', types: null },
  { label: 'System', types: ['boot', 'system'] },
  { label: 'Chat', types: ['chat'] },
  { label: 'Voice', types: ['voice'] },
  { label: 'Connection', types: ['connection'] },
]

// ===== Component Props =====
interface EventLogProps {
  open: boolean
  onClose: () => void
}

// ===== Event Row =====
function EventRow({ event }: { event: SystemEvent }) {
  const config = SEVERITY_CONFIG[event.severity]
  const Icon = config.icon
  const time = new Date(event.timestamp).toLocaleTimeString('en-US', {
    hour12: false,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.15 }}
      className="flex items-start gap-3 px-3 py-2 hover:bg-white/[0.02] transition-colors group"
    >
      {/* Severity dot + icon */}
      <div className={`flex-shrink-0 mt-0.5 w-5 h-5 rounded flex items-center justify-center ${config.bg}`}>
        <Icon className={`w-3 h-3 ${config.color}`} />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded border ${config.border} ${config.color} uppercase tracking-wider`}>
            {event.type}
          </span>
          <span className="text-[11px] font-mono text-white/60 truncate">
            {event.message}
          </span>
        </div>
        {event.details && (
          <p className="text-[10px] font-mono text-white/25 mt-0.5 truncate">
            {event.details}
          </p>
        )}
      </div>

      {/* Timestamp */}
      <span className="flex-shrink-0 text-[9px] font-mono text-white/20 tabular-nums mt-1">
        {time}
      </span>
    </motion.div>
  )
}

// ===== Main Component =====
export default function EventLog({ open, onClose }: EventLogProps) {
  const { events, clearEvents } = useJarvisStore()
  const [search, setSearch] = useState('')
  const [activeFilter, setActiveFilter] = useState<number>(0)
  const [isCollapsed, setIsCollapsed] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  // Filtered events
  const filteredEvents = useMemo(() => {
    let filtered = events

    // Type filter
    const typeFilter = TYPE_FILTERS[activeFilter]
    if (typeFilter.types) {
      filtered = filtered.filter((e) => typeFilter.types!.includes(e.type))
    }

    // Search filter
    if (search.trim()) {
      const q = search.toLowerCase()
      filtered = filtered.filter(
        (e) =>
          e.message.toLowerCase().includes(q) ||
          e.type.toLowerCase().includes(q) ||
          (e.details && e.details.toLowerCase().includes(q))
      )
    }

    return filtered
  }, [events, activeFilter, search])

  // Auto-scroll to newest event
  useEffect(() => {
    if (open && scrollRef.current) {
      scrollRef.current.scrollTop = 0
    }
  }, [open, filteredEvents.length])

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ y: '100%' }}
          animate={{ y: isCollapsed ? 'calc(100% - 48px)' : 0 }}
          exit={{ y: '100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className="fixed bottom-8 left-0 right-0 z-[50] mx-2 sm:mx-4
            bg-jarvis-darker/95 border border-neon-cyan/20 rounded-t-lg
            shadow-[0_-10px_40px_rgba(0,0,0,0.5),0_0_30px_rgba(0,240,255,0.05)]
            flex flex-col overflow-hidden"
          style={{ maxHeight: '60vh' }}
        >
          {/* Top glow accent */}
          <div className="h-px w-full bg-gradient-to-r from-transparent via-neon-cyan/40 to-transparent" />

          {/* Header */}
          <div className="flex items-center justify-between px-4 py-2.5 border-b border-neon-cyan/10 flex-shrink-0">
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-neon-cyan/50" style={{ boxShadow: '0 0 4px rgba(0,240,255,0.4)' }} />
              <span
                className="text-[11px] font-mono text-neon-cyan/70 uppercase tracking-[0.15em] font-semibold"
                style={{ textShadow: '0 0 8px rgba(0,240,255,0.2)' }}
              >
                [ Event Log ]
              </span>
              <span className="text-[9px] font-mono text-white/20 ml-1">
                {events.length} event{events.length !== 1 ? 's' : ''}
              </span>
            </div>

            <div className="flex items-center gap-1">
              {/* Clear button */}
              <button
                onClick={clearEvents}
                className="p-1.5 rounded text-white/20 hover:text-neon-red/70 hover:bg-neon-red/5 transition-colors"
                aria-label="Clear all events"
                title="Clear events"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>

              {/* Collapse toggle */}
              <button
                onClick={() => setIsCollapsed(!isCollapsed)}
                className="p-1.5 rounded text-white/20 hover:text-white/50 hover:bg-white/5 transition-colors"
                aria-label={isCollapsed ? 'Expand' : 'Collapse'}
              >
                <ChevronUp className={`w-3.5 h-3.5 transition-transform ${isCollapsed ? 'rotate-180' : ''}`} />
              </button>

              {/* Close button */}
              <button
                onClick={onClose}
                className="p-1.5 rounded text-white/20 hover:text-white/50 hover:bg-white/5 transition-colors"
                aria-label="Close event log"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Filters + Search */}
          {!isCollapsed && (
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 px-4 py-2 border-b border-neon-cyan/5 flex-shrink-0">
              {/* Type filters */}
              <div className="flex items-center gap-1 flex-wrap">
                {TYPE_FILTERS.map((filter, idx) => (
                  <button
                    key={filter.label}
                    onClick={() => setActiveFilter(idx)}
                    className={`text-[9px] font-mono px-2 py-1 rounded border transition-all
                      ${
                        activeFilter === idx
                          ? 'border-neon-cyan/30 bg-neon-cyan/10 text-neon-cyan/80'
                          : 'border-white/5 text-white/25 hover:border-white/10 hover:text-white/40'
                      }`}
                  >
                    {filter.label}
                  </button>
                ))}
              </div>

              {/* Search */}
              <div className="relative flex-1 w-full sm:w-auto sm:min-w-[180px]">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-white/20 pointer-events-none" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search events..."
                  className="w-full bg-white/[0.03] border border-white/5 rounded px-2.5 pl-7 py-1.5
                    text-[10px] font-mono text-white/60 placeholder:text-white/15
                    focus:outline-none focus:border-neon-cyan/20 transition-colors"
                  spellCheck={false}
                />
              </div>
            </div>
          )}

          {/* Event list */}
          {!isCollapsed && (
            <div
              ref={scrollRef}
              className="flex-1 overflow-y-auto max-h-[40vh] custom-scrollbar"
            >
              {filteredEvents.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 text-white/15">
                  <Info className="w-6 h-6 mb-2 opacity-30" />
                  <p className="font-mono text-[10px]">
                    {search ? 'No matching events' : 'No events recorded'}
                  </p>
                  <p className="font-mono text-[9px] text-white/10 mt-1">
                    Events will appear here as you interact with JARVIS
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-white/[0.03]">
                  {filteredEvents.map((event) => (
                    <EventRow key={event.id} event={event} />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Bottom glow accent */}
          <div className="h-px w-full bg-gradient-to-r from-transparent via-neon-cyan/15 to-transparent flex-shrink-0" />
        </motion.div>
      )}
    </AnimatePresence>
  )
}
