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
  Plus,
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
  const {
    messages,
    conversations,
    activeConversationId,
    addConversation,
    switchConversation,
    deleteConversation,
  } = useJarvisStore()
  const [searchQuery, setSearchQuery] = useState('')
  const [showConfirmClear, setShowConfirmClear] = useState(false)

  // Filter conversations by search query
  const filteredConversations = useMemo(() => {
    if (!searchQuery.trim()) return conversations
    const q = searchQuery.toLowerCase()
    return conversations.filter((conv) =>
      conv.title.toLowerCase().includes(q) ||
      conv.messages.some((msg) => msg.content.toLowerCase().includes(q))
    )
  }, [conversations, searchQuery])

  // Group conversations by date
  const groupedConversations = useMemo(() => {
    const groups: { label: string; conversations: typeof conversations }[] = []
    let currentLabel = ''
    let currentGroup: typeof conversations = []

    filteredConversations.forEach((conv) => {
      const date = new Date(conv.updatedAt)
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
          groups.push({ label: currentLabel, conversations: currentGroup })
        }
        currentLabel = label
        currentGroup = [conv]
      } else {
        currentGroup.push(conv)
      }
    })

    if (currentGroup.length > 0) {
      groups.push({ label: currentLabel, conversations: currentGroup })
    }

    return groups
  }, [filteredConversations])

  // Filter current conversation messages for the "Current Chat" section
  const filteredMessages = useMemo(() => {
    if (!searchQuery.trim()) return messages
    const q = searchQuery.toLowerCase()
    return messages.filter((msg) => msg.content.toLowerCase().includes(q))
  }, [messages, searchQuery])

  // Group current messages by date
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
      deleteConversation(activeConversationId!)
      setShowConfirmClear(false)
    } else {
      setShowConfirmClear(true)
      setTimeout(() => setShowConfirmClear(false), 3000)
    }
  }

  const handleNewConversation = () => {
    addConversation()
  }

  const totalMessageCount = conversations.reduce((acc, conv) => acc + conv.messages.length, 0)

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
                  ({conversations.length} chat{conversations.length !== 1 ? 's' : ''})
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

            {/* Content */}
            <ScrollArea className="h-[calc(100%-180px)]">
              {conversations.length === 0 && messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-white/20">
                  <MessageSquare className="size-10 mb-3" />
                  <p className="text-sm font-mono">
                    {searchQuery ? 'No matching conversations' : 'No conversations yet'}
                  </p>
                  <p className="text-xs font-mono mt-1 text-white/10">
                    Start chatting with JARVIS
                  </p>
                </div>
              ) : (
                <div className="p-3 space-y-4">
                  {/* Conversations section */}
                  {groupedConversations.length > 0 && (
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <div className="h-px flex-1 bg-cyan-500/10" />
                        <span className="text-[10px] font-mono text-cyan-400/30 uppercase tracking-wider">
                          Conversations
                        </span>
                        <div className="h-px flex-1 bg-cyan-500/10" />
                      </div>
                      <div className="space-y-1.5">
                        {groupedConversations.map((group, gi) => (
                          <div key={gi}>
                            {gi > 0 && (
                              <div className="flex items-center gap-2 my-2">
                                <div className="h-px flex-1 bg-white/5" />
                                <span className="text-[9px] font-mono text-white/15 uppercase">
                                  {group.label}
                                </span>
                                <div className="h-px flex-1 bg-white/5" />
                              </div>
                            )}
                            {group.conversations.map((conv) => (
                              <motion.div
                                key={conv.id}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                className={`group relative rounded-lg border p-2.5 transition-all cursor-pointer ${
                                  conv.id === activeConversationId
                                    ? 'border-cyan-500/20 bg-cyan-500/[0.06]'
                                    : 'border-white/[0.03] bg-white/[0.02] hover:border-cyan-500/10 hover:bg-cyan-500/[0.03]'
                                }`}
                                onClick={() => {
                                  switchConversation(conv.id)
                                  onClose()
                                }}
                              >
                                <div className="flex items-start gap-2">
                                  <div className={`
                                    flex-shrink-0 size-5 rounded flex items-center justify-center mt-0.5
                                    ${conv.id === activeConversationId
                                      ? 'bg-cyan-500/20 text-cyan-400'
                                      : 'bg-cyan-500/10 text-cyan-400/60'
                                    }
                                  `}>
                                    <MessageSquare className="size-3" />
                                  </div>

                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-1.5 mb-0.5">
                                      <span className={`text-[11px] font-mono truncate ${
                                        conv.id === activeConversationId
                                          ? 'text-cyan-400/80'
                                          : 'text-white/40'
                                      }`}>
                                        {conv.title}
                                      </span>
                                      {conv.id === activeConversationId && (
                                        <span className="text-[8px] font-mono text-cyan-400/40 uppercase px-1 py-0.5 rounded bg-cyan-500/10">
                                          Active
                                        </span>
                                      )}
                                    </div>
                                    <p className="text-[10px] font-mono text-white/25 line-clamp-1 leading-relaxed">
                                      {conv.messages.length > 0
                                        ? conv.messages[conv.messages.length - 1].content.slice(0, 60)
                                        : 'Empty conversation'
                                      }
                                    </p>
                                    <div className="flex items-center gap-2 mt-1">
                                      <div className="flex items-center gap-1">
                                        <Clock className="size-2.5 text-white/15" />
                                        <span className="text-[9px] font-mono text-white/15">
                                          {formatTimestamp(conv.updatedAt)}
                                        </span>
                                      </div>
                                      <span className="text-[9px] font-mono text-white/10">
                                        {conv.messages.length} msg{conv.messages.length !== 1 ? 's' : ''}
                                      </span>
                                    </div>
                                  </div>

                                  {/* Delete button */}
                                  {conversations.length > 1 && (
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation()
                                        deleteConversation(conv.id)
                                      }}
                                      className="opacity-0 group-hover:opacity-100 p-1 rounded text-white/20 hover:text-red-400 transition-all"
                                      aria-label="Delete conversation"
                                    >
                                      <Trash2 className="size-3" />
                                    </button>
                                  )}
                                </div>
                              </motion.div>
                            ))}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Current conversation messages (detailed view) */}
                  {messages.length > 0 && (
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <div className="h-px flex-1 bg-cyan-500/10" />
                        <span className="text-[10px] font-mono text-cyan-400/30 uppercase tracking-wider">
                          Current Chat Messages
                        </span>
                        <div className="h-px flex-1 bg-cyan-500/10" />
                      </div>

                      <div className="space-y-1.5">
                        {groupedMessages.map((group, gi) => (
                          <div key={gi}>
                            {gi > 0 && (
                              <div className="flex items-center gap-2 my-2">
                                <div className="h-px flex-1 bg-white/5" />
                                <span className="text-[9px] font-mono text-white/15 uppercase">
                                  {group.label}
                                </span>
                                <div className="h-px flex-1 bg-white/5" />
                              </div>
                            )}
                            {group.messages.map((msg) => (
                              <motion.div
                                key={msg.id}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="group relative rounded-lg border border-white/[0.03] bg-white/[0.02] p-2.5 hover:border-cyan-500/10 hover:bg-cyan-500/[0.03] transition-all cursor-pointer"
                              >
                                <div className="flex items-start gap-2">
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
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </ScrollArea>

            {/* Footer with actions */}
            <div className="absolute bottom-0 left-0 right-0 p-3 border-t border-cyan-500/10 bg-black/60 backdrop-blur-xl space-y-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleNewConversation}
                className="w-full font-mono border-cyan-500/20 text-cyan-400/50 hover:bg-cyan-500/10 hover:text-cyan-400 hover:border-cyan-500/30"
              >
                <Plus className="size-3.5" />
                New Conversation
              </Button>
              {messages.length > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleClear}
                  className="w-full font-mono border-red-500/20 text-red-400/50 hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/30"
                >
                  <Trash2 className="size-3.5" />
                  {showConfirmClear ? 'Click again to confirm' : 'Clear Current Chat'}
                </Button>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
