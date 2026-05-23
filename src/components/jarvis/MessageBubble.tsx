'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import ReactMarkdown from 'react-markdown'
import { Mic, Cpu } from 'lucide-react'
import type { Message } from '@/hooks/useJarvisStore'

interface MessageBubbleProps {
  message: Message
}

export function MessageBubble({ message }: MessageBubbleProps) {
  const [showTimestamp, setShowTimestamp] = useState(false)
  const isUser = message.role === 'user'
  const isSystem = message.role === 'system'

  const timeStr = new Date(message.timestamp).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  })

  // System messages: centered, muted
  if (isSystem) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
        className="flex justify-center py-2"
      >
        <div className="px-4 py-2 rounded-full bg-white/5 border border-white/10 text-white/40 text-xs font-mono">
          {message.content}
        </div>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className={`flex gap-3 px-4 py-2 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
      onMouseEnter={() => setShowTimestamp(true)}
      onMouseLeave={() => setShowTimestamp(false)}
    >
      {/* Avatar */}
      {!isUser && (
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-neon-cyan/10 border border-neon-cyan/30 flex items-center justify-center mt-1">
          <Cpu className="w-4 h-4 text-neon-cyan" />
        </div>
      )}

      {/* Message content */}
      <div className={`group relative max-w-[80%] ${isUser ? 'items-end' : 'items-start'}`}>
        <div
          className={`px-4 py-3 rounded-xl text-sm leading-relaxed ${
            isUser
              ? 'bg-neon-orange/10 border border-neon-orange/25 text-white/90 rounded-tr-sm'
              : 'bg-neon-cyan/5 border border-neon-cyan/15 text-white/90 rounded-tl-sm'
          }`}
        >
          {/* Voice indicator */}
          {message.isVoice && (
            <div className="flex items-center gap-1 mb-1">
              <Mic className={`w-3 h-3 ${isUser ? 'text-neon-orange/60' : 'text-neon-cyan/60'}`} />
              <span className={`text-[10px] font-mono ${isUser ? 'text-neon-orange/60' : 'text-neon-cyan/60'}`}>
                Voice input
              </span>
            </div>
          )}

          {/* Markdown for assistant, plain text for user */}
          {isUser ? (
            <p className="whitespace-pre-wrap break-words">{message.content}</p>
          ) : (
            <div className="markdown-content prose prose-invert prose-sm max-w-none">
              <ReactMarkdown
                components={{
                  // Bold text
                  strong: ({ children }) => (
                    <strong className="text-neon-cyan font-semibold">{children}</strong>
                  ),
                  // Inline code
                  code: ({ className, children, ...props }) => {
                    const isBlock = className?.includes('language-')
                    if (isBlock) {
                      return (
                        <code className={`${className || ''} block bg-black/40 rounded-lg p-3 my-2 text-xs font-mono overflow-x-auto`} {...props}>
                          {children}
                        </code>
                      )
                    }
                    return (
                      <code className="bg-black/30 text-neon-cyan px-1.5 py-0.5 rounded text-xs font-mono" {...props}>
                        {children}
                      </code>
                    )
                  },
                  // Code blocks
                  pre: ({ children }) => (
                    <pre className="bg-black/40 rounded-lg p-3 my-2 overflow-x-auto border border-neon-cyan/10">
                      {children}
                    </pre>
                  ),
                  // Lists
                  ul: ({ children }) => (
                    <ul className="list-disc list-inside space-y-1 my-1">{children}</ul>
                  ),
                  ol: ({ children }) => (
                    <ol className="list-decimal list-inside space-y-1 my-1">{children}</ol>
                  ),
                  // Links
                  a: ({ href, children }) => (
                    <a
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-neon-cyan hover:text-neon-cyan/80 underline underline-offset-2"
                    >
                      {children}
                    </a>
                  ),
                  // Paragraphs
                  p: ({ children }) => (
                    <p className="mb-2 last:mb-0">{children}</p>
                  ),
                }}
              >
                {message.content}
              </ReactMarkdown>
            </div>
          )}
        </div>

        {/* Timestamp on hover */}
        <motion.div
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: showTimestamp ? 1 : 0, y: showTimestamp ? 0 : 4 }}
          transition={{ duration: 0.15 }}
          className={`mt-1 text-[10px] font-mono text-white/30 ${
            isUser ? 'text-right' : 'text-left'
          }`}
        >
          {timeStr}
        </motion.div>
      </div>
    </motion.div>
  )
}
