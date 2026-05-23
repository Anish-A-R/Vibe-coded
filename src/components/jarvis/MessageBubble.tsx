'use client'

import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import ReactMarkdown from 'react-markdown'
import { Mic, Cpu, Copy, Volume2, Trash2, Check } from 'lucide-react'
import type { Message } from '@/hooks/useJarvisStore'
import { useJarvisStore } from '@/hooks/useJarvisStore'
import { useTTS } from '@/hooks/useTTS'

interface MessageBubbleProps {
  message: Message
}

function CopyCodeButton({ code }: { code: string }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(code).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    })
  }, [code])

  return (
    <button
      onClick={handleCopy}
      className="absolute top-2 right-2 p-1 rounded bg-white/5 border border-neon-cyan/20 text-neon-cyan/40 hover:text-neon-cyan hover:bg-neon-cyan/10 transition-all"
      aria-label="Copy code"
    >
      {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
    </button>
  )
}

export function MessageBubble({ message }: MessageBubbleProps) {
  const removeMessage = useJarvisStore((s) => s.removeMessage)
  const { speak } = useTTS()
  const isUser = message.role === 'user'
  const isSystem = message.role === 'system'

  const [copied, setCopied] = useState(false)

  const timeStr = new Date(message.timestamp).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  })

  const handleCopyMessage = useCallback(() => {
    navigator.clipboard.writeText(message.content).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    })
  }, [message.content])

  const handleSpeak = useCallback(() => {
    speak(message.content)
  }, [speak, message.content])

  const handleDelete = useCallback(() => {
    removeMessage(message.id)
  }, [removeMessage, message.id])

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
      className={`flex gap-3 px-4 py-2 group ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
    >
      {/* Avatar */}
      {!isUser && (
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-neon-cyan/10 border border-neon-cyan/30 flex items-center justify-center mt-1">
          <Cpu className="w-4 h-4 text-neon-cyan" />
        </div>
      )}

      {/* Message content */}
      <div className={`relative max-w-[80%] ${isUser ? 'items-end' : 'items-start'}`}>
        {/* Action buttons - top right on hover */}
        <AnimatePresence>
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            whileHover={{ opacity: 1, scale: 1 }}
            className={`absolute -top-2 ${isUser ? '-left-1' : '-right-1'} z-10 flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200`}
          >
            {/* Copy button */}
            <motion.button
              initial={{ opacity: 0, scale: 0.7 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0, duration: 0.15 }}
              onClick={handleCopyMessage}
              className="w-6 h-6 flex items-center justify-center rounded bg-black/60 border border-white/10 text-white/30 hover:text-neon-cyan hover:border-neon-cyan/30 transition-all"
              aria-label="Copy message"
            >
              {copied ? <Check className="w-3 h-3 text-neon-cyan" /> : <Copy className="w-3 h-3" />}
            </motion.button>

            {/* Speak button */}
            {!isUser && (
              <motion.button
                initial={{ opacity: 0, scale: 0.7 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.05, duration: 0.15 }}
                onClick={handleSpeak}
                className="w-6 h-6 flex items-center justify-center rounded bg-black/60 border border-white/10 text-white/30 hover:text-neon-cyan hover:border-neon-cyan/30 transition-all"
                aria-label="Speak message"
              >
                <Volume2 className="w-3 h-3" />
              </motion.button>
            )}

            {/* Delete button */}
            <motion.button
              initial={{ opacity: 0, scale: 0.7 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1, duration: 0.15 }}
              onClick={handleDelete}
              className="w-6 h-6 flex items-center justify-center rounded bg-black/60 border border-white/10 text-white/30 hover:text-red-400 hover:border-red-400/30 transition-all"
              aria-label="Delete message"
            >
              <Trash2 className="w-3 h-3" />
            </motion.button>
          </motion.div>
        </AnimatePresence>

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
                        <code className={`${className || ''} block text-xs font-mono overflow-x-auto`} {...props}>
                          {children}
                        </code>
                      )
                    }
                    return (
                      <code className="bg-neon-cyan/10 text-neon-cyan px-1.5 py-0.5 rounded text-xs font-mono" {...props}>
                        {children}
                      </code>
                    )
                  },
                  // Code blocks
                  pre: ({ children }) => {
                    // Extract code text for copy button
                    let codeText = ''
                    if (children && typeof children === 'object' && 'props' in children) {
                      const childProps = (children as React.ReactElement).props
                      if (childProps?.children) {
                        codeText = String(childProps.children)
                      }
                    }
                    return (
                      <pre className="relative bg-black/60 rounded-lg p-3 my-2 overflow-x-auto border border-neon-cyan/20">
                        <CopyCodeButton code={codeText} />
                        {children}
                      </pre>
                    )
                  },
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

        {/* Timestamp - always visible */}
        <div
          className={`mt-1 text-[9px] font-mono text-white/15 ${
            isUser ? 'text-right' : 'text-left'
          }`}
        >
          {timeStr}
        </div>
      </div>
    </motion.div>
  )
}
