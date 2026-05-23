'use client'

import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  X,
  Search,
  User,
  Bot,
  Trash2,
  Clock,
  MessageSquare,
  Mic,
  ChevronLeft,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Input } from '@/components/ui/input'
import { useJarvisStore } from '@/hooks/useJarvisStore'

interface ConversationHistoryProps {
  open: boolean
  onClose: () => void
}

function formatTimestamp(ts: number): string {
  const date = new Date(ts)
  const now = new Date()
  const isToday = date.toDateString() === now.toDateString()

  if (isToday) {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  const yesterday = new Date(now)
  yesterday.setDate(yesterday.getDate() - 1)
  const isYesterday = date.toDateString() === yesterday.toDateString()

  if (isYesterday) {
    return `Yesterday ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
  }

  return date.toLocaleDateString([], { month: 'short', day: 'numeric' }) +
    ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

export default function ConversationHistory({ open, onClose }: ConversationHistoryProps) {
  const { messages, clearMessages } = useJarvisStore()
  const [searchQuery, setSearchQuery] = useState('')
  const [showConfirmClear, setShowConfirmClear] = useState(false)

  const filteredMessages = useMemo(() => {
    if (!searchQuery.trim()) return messages
    const q = searchQuery.toLowerCase()
    return messages.filter((msg) => msg.content.toLowerCase().includes(q))
  }, [messages, searchQuery])

  const groupedMessages = useMemo(() => {
    const groups: { label: string; messages: typeof messages }[] = []
    let currentLabel = ''
    let currentGroup: typeof messages = []

    filteredMessages.forEach((msg) => {
      const date = new Date(msg.timestamp)
      const now = new Date()
      let label: string

      if (date.toDateString() === now.toDateString()) {
        label = 'Today'
      } else {
        const yesterday = new Date(now)
        yesterday.setDate(yesterday.getDate() - 1)
        label = date.toDateString() === yesterday.toDateString()
          ? 'Yesterday'
          : date.toLocaleDateString([], { month: 'long', day: 'numeric', year: 'numeric' })
      }

      if (label !== currentLabel) {
        if (currentGroup.length > 0) {
          groups.push({ label: currentLabel, messages: currentGroup })
        }
        currentLabel = label
        currentGroup = [msg]
      } else {
        currentGroup.push(msg)
      }
    })

    if (currentGroup.length > 0) {
      groups.push({ label: currentLabel, messages: currentGroup })
    }

    return groups
  }, [filteredMessages])

  const handleClear = () => {
    if (showConfirmClear) {
      clearMessages()
      setShowConfirmClear(false)
    } else {
      setShowConfirmClear(true)
      setTimeout(() => setShowConfirmClear(false), 3000)
    }
  }

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Panel */}
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed top-0 left-0 z-50 h-full w-full sm:w-[380px] border-r border-cyan-500/20 bg-black/80 backdrop-blur-xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-cyan-500/10">
              <div className="flex items-center gap-2">
                <MessageSquare className="size-5 text-cyan-400" />
                <h2 className="text-lg font-mono font-bold text-cyan-400">History</h2>
                <span className="text-xs font-mono text-cyan-400/40">
                  ({messages.length})
                </span>
              </div>
              <motion.button
                whileHover={{ scale: 1.1, rotate: -90 }}
                whileTap={{ scale: 0.9 }}
                onClick={onClose}
                className="size-8 flex items-center justify-center rounded-lg border border-white/10 text-white/50 hover:text-white/80 hover:border-white/20 transition-colors"
              >
                <X className="size-4" />
              </motion.button>
            </div>

            {/* Search */}
            <div className="p-3 border-b border-cyan-500/10">
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-4 text-cyan-400/30" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search conversations..."
                  className="pl-9 font-mono text-sm bg-white/[0.03] border-cyan-500/10 text-white/80 placeholder:text-white/20 focus-visible:ring-cyan-500/30"
                />
              </div>
            </div>

            {/* Messages */}
            <ScrollArea className="h-[calc(100%-130px)]">
              {filteredMessages.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-white/20">
                  <MessageSquare className="size-10 mb-3" />
                  <p className="text-sm font-mono">
                    {searchQuery ? 'No matching messages' : 'No conversations yet'}
                  </p>
                  <p className="text-xs font-mono mt-1 text-white/10">
                    Start chatting with JARVIS
                  </p>
                </div>
              ) : (
                <div className="p-3 space-y-4">
                  {groupedMessages.map((group, gi) => (
                    <div key={gi}>
                      {/* Date header */}
                      <div className="flex items-center gap-2 mb-2">
                        <div className="h-px flex-1 bg-cyan-500/10" />
                        <span className="text-[10px] font-mono text-cyan-400/30 uppercase tracking-wider">
                          {group.label}
                        </span>
                        <div className="h-px flex-1 bg-cyan-500/10" />
                      </div>

                      {/* Messages in group */}
                      <div className="space-y-1.5">
                        {group.messages.map((msg) => (
                          <motion.div
                            key={msg.id}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="group relative rounded-lg border border-white/[0.03] bg-white/[0.02] p-2.5 hover:border-cyan-500/10 hover:bg-cyan-500/[0.03] transition-all cursor-pointer"
                          >
                            <div className="flex items-start gap-2">
                              {/* Role icon */}
                              <div className={`
                                flex-shrink-0 size-5 rounded flex items-center justify-center mt-0.5
                                ${msg.role === 'user'
                                  ? 'bg-cyan-500/10 text-cyan-400'
                                  : msg.role === 'assistant'
                                    ? 'bg-orange-500/10 text-orange-400'
                                    : 'bg-white/5 text-white/30'
                                }
                              `}>
                                {msg.role === 'user' ? (
                                  <User className="size-3" />
                                ) : msg.role === 'assistant' ? (
                                  <Bot className="size-3" />
                                ) : (
                                  <MessageSquare className="size-3" />
                                )}
                              </div>

                              {/* Content */}
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-1.5 mb-0.5">
                                  <span className="text-[10px] font-mono text-white/30 uppercase">
                                    {msg.role === 'assistant' ? 'JARVIS' : msg.role}
                                  </span>
                                  {msg.isVoice && (
                                    <Mic className="size-2.5 text-cyan-400/40" />
                                  )}
                                </div>
                                <p className="text-xs font-mono text-white/60 line-clamp-2 leading-relaxed">
                                  {msg.content}
                                </p>
                                <div className="flex items-center gap-1 mt-1">
                                  <Clock className="size-2.5 text-white/15" />
                                  <span className="text-[9px] font-mono text-white/15">
                                    {formatTimestamp(msg.timestamp)}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>

            {/* Footer with clear button */}
            <div className="absolute bottom-0 left-0 right-0 p-3 border-t border-cyan-500/10 bg-black/60 backdrop-blur-xl">
              <Button
                variant="outline"
                size="sm"
                onClick={handleClear}
                className="w-full font-mono border-red-500/20 text-red-400/50 hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/30"
              >
                <Trash2 className="size-3.5" />
                {showConfirmClear ? 'Click again to confirm' : 'Clear All History'}
              </Button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
