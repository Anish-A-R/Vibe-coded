'use client'

import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { oneDark } from 'react-syntax-highlighter/dist/cjs/styles/prism'
import { Bot, User, Copy, Volume2, Trash2, Check, ThumbsUp, ThumbsDown, Clipboard } from 'lucide-react'
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

// Message reactions component for AI messages
function MessageReactions({ content }: { content: string }) {
  const [activeReaction, setActiveReaction] = useState<'up' | 'down' | null>(null)
  const [copied, setCopied] = useState(false)

  const handleThumbsUp = useCallback(() => {
    setActiveReaction(activeReaction === 'up' ? null : 'up')
  }, [activeReaction])

  const handleThumbsDown = useCallback(() => {
    setActiveReaction(activeReaction === 'down' ? null : 'down')
  }, [activeReaction])

  const handleCopyMessage = useCallback(() => {
    navigator.clipboard.writeText(content).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    })
  }, [content])

  return (
    <div className="flex items-center gap-1 mt-1.5 ml-1">
      <motion.button
        whileHover={{ scale: 1.2 }}
        whileTap={{ scale: 0.9 }}
        onClick={handleThumbsUp}
        className={`p-1 rounded transition-all ${
          activeReaction === 'up'
            ? 'text-neon-green bg-neon-green/10 shadow-[0_0_8px_rgba(0,255,136,0.3)]'
            : 'text-white/20 hover:text-neon-green/60 hover:bg-white/5'
        }`}
        aria-label="Thumbs up"
      >
        <ThumbsUp className="w-3 h-3" />
      </motion.button>
      <motion.button
        whileHover={{ scale: 1.2 }}
        whileTap={{ scale: 0.9 }}
        onClick={handleThumbsDown}
        className={`p-1 rounded transition-all ${
          activeReaction === 'down'
            ? 'text-neon-orange bg-neon-orange/10 shadow-[0_0_8px_rgba(255,106,0,0.3)]'
            : 'text-white/20 hover:text-neon-orange/60 hover:bg-white/5'
        }`}
        aria-label="Thumbs down"
      >
        <ThumbsDown className="w-3 h-3" />
      </motion.button>
      <motion.button
        whileHover={{ scale: 1.2 }}
        whileTap={{ scale: 0.9 }}
        onClick={handleCopyMessage}
        className={`p-1 rounded transition-all ${
          copied
            ? 'text-neon-cyan bg-neon-cyan/10 shadow-[0_0_8px_rgba(0,240,255,0.3)]'
            : 'text-white/20 hover:text-neon-cyan/60 hover:bg-white/5'
        }`}
        aria-label="Copy message"
      >
        {copied ? <Check className="w-3 h-3" /> : <Clipboard className="w-3 h-3" />}
      </motion.button>
    </div>
  )
}

export function MessageBubble({ message }: MessageBubbleProps) {
  const removeMessage = useJarvisStore((s) => s.removeMessage)
  const { speak } = useTTS()
  const isUser = message.role === 'user'
  const isSystem = message.role === 'system'

  const [copied, setCopied] = useState(false)
  const [renderError, setRenderError] = useState(false)

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

  // Fallback for render errors (markdown/code highlighting failures)
  if (renderError) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className={`flex gap-3 px-4 py-2 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
      >
        <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center mt-1 ${
          isUser ? 'bg-neon-orange/10 border border-neon-orange/30' : 'bg-neon-cyan/10 border border-neon-cyan/30'
        }`}>
          {isUser ? <User className="w-4 h-4 text-neon-orange" /> : <Bot className="w-4 h-4 text-neon-cyan" />}
        </div>
        <div className="max-w-[80%] px-4 py-3 rounded-xl text-sm text-white/90 bg-white/5 border border-white/10 whitespace-pre-wrap break-words">
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
      {/* Avatar with role icon */}
      <div
        className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center mt-1 ${
          isUser
            ? 'bg-neon-orange/10 border border-neon-orange/30'
            : 'bg-neon-cyan/10 border border-neon-cyan/30'
        }`}
      >
        {isUser ? (
          <User className="w-4 h-4 text-neon-orange" />
        ) : (
          <Bot className="w-4 h-4 text-neon-cyan" />
        )}
      </div>

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
          className={`relative px-4 py-3 rounded-xl text-sm leading-relaxed overflow-hidden ${
            isUser
              ? 'bg-neon-orange/8 border border-neon-orange/25 text-white/90 rounded-tr-sm'
              : 'bg-neon-cyan/5 border border-neon-cyan/15 text-white/90 rounded-tl-sm hud-scanline-h'
          }`}
        >
          {/* Holographic left border for AI messages */}
          {!isUser && (
            <div
              className="absolute top-0 left-0 w-[2px] h-full"
              style={{
                background: 'linear-gradient(to bottom, transparent, rgba(0,240,255,0.4), rgba(0,240,255,0.15), transparent)',
              }}
            />
          )}
          {/* Holographic right border for user messages */}
          {isUser && (
            <div
              className="absolute top-0 right-0 w-[2px] h-full"
              style={{
                background: 'linear-gradient(to bottom, transparent, rgba(255,106,0,0.4), rgba(255,106,0,0.15), transparent)',
              }}
            />
          )}

          {/* Subtle dark bg glow for AI messages */}
          {!isUser && (
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                boxShadow: 'inset 0 0 20px rgba(0,240,255,0.03)',
              }}
            />
          )}

          {/* Voice indicator */}
          {message.isVoice && (
            <div className="flex items-center gap-1 mb-1">
              <User className={`w-3 h-3 ${isUser ? 'text-neon-orange/60' : 'text-neon-cyan/60'}`} />
              <span className={`text-[10px] font-mono ${isUser ? 'text-neon-orange/60' : 'text-neon-cyan/60'}`}>
                Voice input
              </span>
            </div>
          )}

          {/* Markdown for assistant, plain text for user */}
          {isUser ? (
            <p className="whitespace-pre-wrap break-words">{message.content}</p>
          ) : (
            <div className="markdown-content prose prose-invert prose-sm max-w-none" onError={() => setRenderError(true)}>
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  // Headings with neon glow
                  h1: ({ children }) => (
                    <h1 className="text-lg font-bold neon-text-cyan mt-3 mb-2 first:mt-0">{children}</h1>
                  ),
                  h2: ({ children }) => (
                    <h2 className="text-base font-bold neon-text-cyan mt-2.5 mb-1.5 first:mt-0">{children}</h2>
                  ),
                  h3: ({ children }) => (
                    <h3 className="text-sm font-bold neon-text-cyan mt-2 mb-1 first:mt-0">{children}</h3>
                  ),
                  h4: ({ children }) => (
                    <h4 className="text-sm font-semibold neon-text-cyan mt-1.5 mb-1 first:mt-0">{children}</h4>
                  ),
                  // Bold text
                  strong: ({ children }) => (
                    <strong className="text-neon-cyan font-semibold">{children}</strong>
                  ),
                  // Inline code with cyan highlight
                  code: ({ className, children, ...props }) => {
                    const isBlock = className?.includes('language-')
                    if (isBlock) {
                      return (
                        <code className={`${className || ''} text-xs font-mono`} {...props}>
                          {children}
                        </code>
                      )
                    }
                    return (
                      <code
                        className="bg-neon-cyan/10 text-neon-cyan px-1.5 py-0.5 rounded text-xs font-mono border border-neon-cyan/10"
                        {...props}
                      >
                        {children}
                      </code>
                    )
                  },
                  // Code blocks with SyntaxHighlighter
                  pre: ({ children }) => {
                    // Extract code text and language for SyntaxHighlighter
                    let codeText = ''
                    let language = ''
                    if (children && typeof children === 'object' && 'props' in children) {
                      const childProps = (children as React.ReactElement).props
                      if (childProps?.children) {
                        codeText = String(childProps.children).replace(/\n$/, '')
                      }
                      if (childProps?.className) {
                        const match = childProps.className.match(/language-(\w+)/)
                        if (match) language = match[1]
                      }
                    }

                    return (
                      <div className="relative my-2 rounded-lg overflow-hidden border border-neon-cyan/20">
                        <CopyCodeButton code={codeText} />
                        {language && (
                          <div className="absolute top-0 left-0 px-2 py-0.5 text-[9px] font-mono text-neon-cyan/40 bg-neon-cyan/5 border-b border-neon-cyan/10 rounded-br">
                            {language}
                          </div>
                        )}
                        <SyntaxHighlighter
                          language={language || 'text'}
                          style={oneDark}
                          customStyle={{
                            margin: 0,
                            padding: '12px',
                            paddingTop: language ? '24px' : '12px',
                            background: 'rgba(0, 0, 0, 0.6)',
                            fontSize: '12px',
                            borderRadius: '8px',
                            border: 'none',
                          }}
                          codeTagProps={{
                            style: {
                              fontFamily: 'monospace',
                              fontSize: '12px',
                            },
                          }}
                        >
                          {codeText}
                        </SyntaxHighlighter>
                      </div>
                    )
                  },
                  // Lists with cyan bullet points
                  ul: ({ children }) => (
                    <ul className="list-none space-y-1 my-1 pl-4">
                      {children}
                    </ul>
                  ),
                  ol: ({ children }) => (
                    <ol className="list-none space-y-1 my-1 pl-4 counter-reset-list">
                      {children}
                    </ol>
                  ),
                  li: ({ children, ordered, index }) => (
                    <li className="relative pl-4">
                      <span className="absolute left-0 text-neon-cyan/50 font-mono text-xs">
                        {ordered ? `${(index ?? 0) + 1}.` : '▸'}
                      </span>
                      {children}
                    </li>
                  ),
                  // Links with cyan color and hover glow
                  a: ({ href, children }) => (
                    <a
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-neon-cyan hover:text-neon-cyan/80 underline underline-offset-2 transition-all hover:shadow-[0_0_8px_rgba(0,240,255,0.3)]"
                    >
                      {children}
                    </a>
                  ),
                  // Paragraphs
                  p: ({ children }) => (
                    <p className="mb-2 last:mb-0">{children}</p>
                  ),
                  // Tables with glass-panel styling
                  table: ({ children }) => (
                    <div className="my-2 overflow-x-auto rounded-lg border border-neon-cyan/15">
                      <table className="min-w-full text-xs">
                        {children}
                      </table>
                    </div>
                  ),
                  thead: ({ children }) => (
                    <thead className="bg-neon-cyan/5 border-b border-neon-cyan/15">
                      {children}
                    </thead>
                  ),
                  tbody: ({ children }) => (
                    <tbody className="divide-y divide-neon-cyan/10">
                      {children}
                    </tbody>
                  ),
                  tr: ({ children }) => (
                    <tr className="hover:bg-neon-cyan/5 transition-colors">
                      {children}
                    </tr>
                  ),
                  th: ({ children }) => (
                    <th className="px-3 py-1.5 text-left text-neon-cyan/70 font-mono font-medium uppercase tracking-wider">
                      {children}
                    </th>
                  ),
                  td: ({ children }) => (
                    <td className="px-3 py-1.5 text-white/70">
                      {children}
                    </td>
                  ),
                  // Blockquotes
                  blockquote: ({ children }) => (
                    <blockquote className="border-l-2 border-neon-cyan/30 pl-3 my-2 text-white/60 italic">
                      {children}
                    </blockquote>
                  ),
                  // Horizontal rule
                  hr: () => (
                    <hr className="my-3 border-neon-cyan/10" />
                  ),
                }}
              >
                {message.content}
              </ReactMarkdown>
            </div>
          )}
        </div>

        {/* Message reactions for AI messages */}
        {!isUser && <MessageReactions content={message.content} />}

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
