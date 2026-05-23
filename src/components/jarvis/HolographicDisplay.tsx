'use client'

import { useState, useEffect, useRef, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Mic, Loader2, Volume2, ChevronRight } from 'lucide-react'
import { useJarvisStore } from '@/hooks/useJarvisStore'

// ===== Types =====
interface HolographicDisplayProps {
  className?: string
}

// ===== Corner Bracket Decorations =====
function CornerBrackets() {
  const size = 16
  const thickness = 2
  const color = 'rgba(0, 240, 255, 0.5)'

  return (
    <>
      {/* Top-left */}
      <div className="absolute top-0 left-0 pointer-events-none" style={{ width: size, height: size }}>
        <div style={{ position: 'absolute', top: 0, left: 0, width: size, height: thickness, background: color }} />
        <div style={{ position: 'absolute', top: 0, left: 0, width: thickness, height: size, background: color }} />
      </div>
      {/* Top-right */}
      <div className="absolute top-0 right-0 pointer-events-none" style={{ width: size, height: size }}>
        <div style={{ position: 'absolute', top: 0, right: 0, width: size, height: thickness, background: color }} />
        <div style={{ position: 'absolute', top: 0, right: 0, width: thickness, height: size, background: color }} />
      </div>
      {/* Bottom-left */}
      <div className="absolute bottom-0 left-0 pointer-events-none" style={{ width: size, height: size }}>
        <div style={{ position: 'absolute', bottom: 0, left: 0, width: size, height: thickness, background: color }} />
        <div style={{ position: 'absolute', bottom: 0, left: 0, width: thickness, height: size, background: color }} />
      </div>
      {/* Bottom-right */}
      <div className="absolute bottom-0 right-0 pointer-events-none" style={{ width: size, height: size }}>
        <div style={{ position: 'absolute', bottom: 0, right: 0, width: size, height: thickness, background: color }} />
        <div style={{ position: 'absolute', bottom: 0, right: 0, width: thickness, height: size, background: color }} />
      </div>
    </>
  )
}

// ===== Typewriter Text Component =====
// Key-based reset from parent ensures no setState-in-effect for text changes
function TypewriterText({ text, speed = 18 }: { text: string; speed?: number }) {
  const [displayedLength, setDisplayedLength] = useState(0)

  useEffect(() => {
    if (displayedLength >= text.length) return

    const timer = setTimeout(() => {
      const remaining = text.length - displayedLength
      const increment = remaining > 40
        ? Math.floor(Math.random() * 5) + 3
        : remaining > 10
          ? Math.floor(Math.random() * 3) + 1
          : 1
      setDisplayedLength((prev) => Math.min(prev + increment, text.length))
    }, speed)

    return () => clearTimeout(timer)
  }, [displayedLength, text.length, speed])

  const displayedText = text.slice(0, displayedLength)
  const isComplete = displayedLength >= text.length

  return (
    <div className="markdown-content prose prose-invert prose-sm max-w-none">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({ children }) => (
            <h1 className="text-base font-bold neon-text-cyan mt-2 mb-1 first:mt-0">{children}</h1>
          ),
          h2: ({ children }) => (
            <h2 className="text-sm font-bold neon-text-cyan mt-2 mb-1 first:mt-0">{children}</h2>
          ),
          h3: ({ children }) => (
            <h3 className="text-sm font-semibold neon-text-cyan mt-1.5 mb-0.5 first:mt-0">{children}</h3>
          ),
          strong: ({ children }) => (
            <strong className="text-neon-cyan font-semibold">{children}</strong>
          ),
          code: ({ className, children, ...props }) => {
            const isBlock = className?.includes('language-')
            if (isBlock) {
              return (
                <code className={`${className || ''} text-[10px] font-mono`} {...props}>
                  {children}
                </code>
              )
            }
            return (
              <code
                className="bg-neon-cyan/10 text-neon-cyan px-1 py-0.5 rounded text-[10px] font-mono border border-neon-cyan/10"
                {...props}
              >
                {children}
              </code>
            )
          },
          pre: ({ children }) => (
            <div className="my-1.5 rounded-md overflow-hidden border border-neon-cyan/15 bg-black/50">
              <pre className="p-2 text-[10px] font-mono overflow-x-auto">{children}</pre>
            </div>
          ),
          ul: ({ children }) => (
            <ul className="list-none space-y-0.5 my-1 pl-3">{children}</ul>
          ),
          ol: ({ children }) => (
            <ol className="list-none space-y-0.5 my-1 pl-3 counter-reset-list">{children}</ol>
          ),
          li: ({ children, ordered, index }) => (
            <li className="relative pl-3 text-xs">
              <span className="absolute left-0 text-neon-cyan/50 font-mono text-[10px]">
                {ordered ? `${(index ?? 0) + 1}.` : '▸'}
              </span>
              {children}
            </li>
          ),
          a: ({ href, children }) => (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-neon-cyan hover:text-neon-cyan/80 underline underline-offset-2 transition-all"
            >
              {children}
            </a>
          ),
          p: ({ children }) => (
            <p className="mb-1.5 last:mb-0 text-xs leading-relaxed">{children}</p>
          ),
          blockquote: ({ children }) => (
            <blockquote className="border-l-2 border-neon-cyan/30 pl-2 my-1 text-white/50 italic text-xs">
              {children}
            </blockquote>
          ),
          hr: () => <hr className="my-2 border-neon-cyan/10" />,
          table: ({ children }) => (
            <div className="my-1 overflow-x-auto rounded border border-neon-cyan/10">
              <table className="min-w-full text-[10px]">{children}</table>
            </div>
          ),
          th: ({ children }) => (
            <th className="px-2 py-1 text-left text-neon-cyan/60 font-mono uppercase tracking-wider bg-neon-cyan/5">
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td className="px-2 py-1 text-white/60">{children}</td>
          ),
        }}
      >
        {displayedText}
      </ReactMarkdown>
      {/* Blinking cursor while typing */}
      {!isComplete && (
        <motion.span
          className="inline-block w-[6px] h-[13px] bg-neon-cyan ml-0.5 align-middle"
          style={{ boxShadow: '0 0 6px rgba(0,240,255,0.6)' }}
          animate={{ opacity: [1, 0] }}
          transition={{ duration: 0.5, repeat: Infinity, repeatType: 'reverse' }}
        />
      )}
    </div>
  )
}

// ===== Status Indicator =====
function StatusIndicator({ status, isListening }: { status: string; isListening: boolean }) {
  let label = ''
  let icon = null
  let color = ''

  if (isListening) {
    label = 'Listening...'
    icon = <Mic className="w-3 h-3" />
    color = 'text-neon-orange'
  } else if (status === 'thinking') {
    label = 'Processing...'
    icon = <Loader2 className="w-3 h-3 animate-spin" />
    color = 'text-neon-cyan'
  } else if (status === 'speaking') {
    label = 'Speaking...'
    icon = <Volume2 className="w-3 h-3" />
    color = 'text-neon-cyan'
  }

  if (!label) return null

  return (
    <motion.div
      initial={{ opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -5 }}
      transition={{ duration: 0.3 }}
      className="flex items-center gap-1.5 px-3 py-1.5 rounded-full glass-panel holo-border-cyan inner-glow-cyan"
    >
      <span className={color}>{icon}</span>
      <span className={`text-[10px] font-mono tracking-wider ${color} uppercase`}>{label}</span>
    </motion.div>
  )
}

// ===== Voice Transcript Card =====
function VoiceTranscriptCard({ transcript }: { transcript: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -10, scale: 0.95 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="glass-panel holo-border-cyan inner-glow-cyan hud-scanline relative p-3 max-w-[380px] mx-auto mb-2"
      style={{ boxShadow: '0 0 20px rgba(0,240,255,0.08), 0 4px 15px rgba(0,0,0,0.3)' }}
    >
      <CornerBrackets />
      <div className="flex items-start gap-2">
        <Mic className="w-3 h-3 text-neon-orange/70 mt-0.5 flex-shrink-0" />
        <p className="text-xs text-neon-orange/80 font-mono leading-relaxed">{transcript}</p>
      </div>
    </motion.div>
  )
}

// ===== AI Response Card =====
function AIResponseCard({ content, messageId }: { content: string; messageId: string }) {
  const scrollRef = useRef<HTMLDivElement>(null)

  // Auto-scroll during typewriter - reading DOM, not setting state
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [content])

  return (
    <motion.div
      initial={{ opacity: 0, y: 15, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -15, scale: 0.96 }}
      transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="glass-panel holo-border-cyan inner-glow-cyan hud-scanline relative"
      style={{
        boxShadow: '0 0 30px rgba(0,240,255,0.1), 0 0 60px rgba(0,240,255,0.05), 0 8px 25px rgba(0,0,0,0.4)',
      }}
    >
      <CornerBrackets />

      {/* Header bar */}
      <div className="flex items-center gap-2 px-4 py-2 border-b border-neon-cyan/10 bg-neon-cyan/[0.02]">
        <ChevronRight className="w-3 h-3 text-neon-cyan/50" />
        <span className="text-[10px] font-mono text-neon-cyan/50 tracking-widest uppercase">J.A.R.V.I.S. Response</span>
        <div className="flex-1" />
        <div className="flex items-center gap-1">
          <div className="w-1.5 h-1.5 rounded-full bg-neon-cyan/60 animate-pulse" />
          <span className="text-[8px] font-mono text-neon-cyan/30">ACTIVE</span>
        </div>
      </div>

      {/* Content with scroll - key resets TypewriterText state */}
      <div
        ref={scrollRef}
        className="p-4 max-h-[300px] overflow-y-auto custom-scrollbar"
      >
        <TypewriterText key={messageId} text={content} speed={15} />
      </div>

      {/* Bottom decorative line */}
      <div
        className="absolute bottom-0 left-4 right-4 h-[1px]"
        style={{
          background: 'linear-gradient(90deg, transparent, rgba(0,240,255,0.2), transparent)',
        }}
      />
    </motion.div>
  )
}

// ===== Main Holographic Display Component =====
export default function HolographicDisplay({ className = '' }: HolographicDisplayProps) {
  const messages = useJarvisStore((s) => s.messages)
  const aiStatus = useJarvisStore((s) => s.aiStatus)
  const voiceTranscript = useJarvisStore((s) => s.voiceTranscript)
  const isListening = useJarvisStore((s) => s.isListening)

  // Track auto-dismissed message IDs (setState only from setTimeout callback)
  const [autoDismissedId, setAutoDismissedId] = useState<string | null>(null)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Get the latest AI message - derive directly from store
  const latestAIMessage = useMemo(() => {
    for (let i = messages.length - 1; i >= 0; i--) {
      if (messages[i].role === 'assistant') return messages[i]
    }
    return null
  }, [messages])

  // Auto-dismiss timer - setState only in setTimeout callback (async), not synchronously
  useEffect(() => {
    if (!latestAIMessage) return

    // Clear previous timer
    if (timerRef.current) clearTimeout(timerRef.current)

    // Set up auto-dismiss after 30 seconds - setState in callback is allowed
    const id = latestAIMessage.id
    timerRef.current = setTimeout(() => {
      setAutoDismissedId(id)
    }, 30000)

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [latestAIMessage])

  // Derive visibility from data - no setState needed
  const showResponse = useMemo(() => {
    if (!latestAIMessage) return false
    if (aiStatus === 'thinking') return false
    if (autoDismissedId === latestAIMessage.id) return false
    return true
  }, [latestAIMessage, aiStatus, autoDismissedId])

  const showStatus = isListening || aiStatus === 'thinking' || aiStatus === 'speaking'
  const showTranscript = !!voiceTranscript

  // Don't render anything if there's nothing to show
  if (!showResponse && !showStatus && !showTranscript) return null

  return (
    <div
      className={`fixed top-16 left-1/2 -translate-x-1/2 z-30 flex flex-col items-center gap-2 pointer-events-none ${className}`}
    >
      <AnimatePresence mode="sync">
        {/* Status Indicator */}
        {showStatus && (
          <StatusIndicator key="status" status={aiStatus} isListening={isListening} />
        )}

        {/* Voice Transcript Card */}
        {showTranscript && (
          <VoiceTranscriptCard key="transcript" transcript={voiceTranscript} />
        )}

        {/* AI Response Card */}
        {showResponse && latestAIMessage && (
          <motion.div
            key="response-wrapper"
            className="pointer-events-auto w-full max-w-[500px] animate-float"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <AIResponseCard
              content={latestAIMessage.content}
              messageId={latestAIMessage.id}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
