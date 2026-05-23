'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  CheckSquare, Clock, StickyNote, ListTodo, Workflow,
  Play, Pause, RotateCcw, Plus, Trash2, X, Target,
  Sun, Code, BookOpen, Zap, Flame, Trophy, Coffee,
  ArrowRight
} from 'lucide-react'
import { useJarvisStore, type OSMode } from '@/hooks/useJarvisStore'
import { playActivationSound, playDeactivationSound } from '@/lib/sounds'

interface ProductivityAppProps {
  windowId?: string
}

interface LocalTask {
  id: string
  text: string
  done: boolean
}

const focusModes = [
  { id: 'normal' as OSMode, label: 'Normal', icon: Sun, color: '#00f0ff', description: 'Standard operating mode' },
  { id: 'focus' as OSMode, label: 'Focus', icon: Target, color: '#00ff88', description: 'Minimized distractions' },
  { id: 'coding' as OSMode, label: 'Coding', icon: Code, color: '#8b5cf6', description: 'Optimized for development' },
  { id: 'study' as OSMode, label: 'Study', icon: BookOpen, color: '#ff6b35', description: 'Enhanced learning mode' },
]

const workflowTemplates = [
  {
    name: 'Morning Routine',
    description: 'Start your day with focus and clarity',
    icon: Sun,
    color: '#ffcc00',
    steps: ['Review priorities', 'Check messages', 'Plan tasks', 'Deep work session'],
  },
  {
    name: 'Deep Work',
    description: 'Distraction-free productivity block',
    icon: Target,
    color: '#00ff88',
    steps: ['Set timer', 'Close notifications', 'Single-task focus', 'Review progress'],
  },
  {
    name: 'Code Review',
    description: 'Systematic code review workflow',
    icon: Code,
    color: '#8b5cf6',
    steps: ['Pull latest', 'Review PRs', 'Run tests', 'Provide feedback'],
  },
]

export function ProductivityApp({ windowId }: ProductivityAppProps) {
  const {
    focusTimerMinutes,
    focusTimerBreakMinutes,
    focusTimerSessions,
    setFocusTimerMinutes,
    setFocusTimerBreakMinutes,
    setFocusTimerSessions,
    notes,
    addNote,
    removeNote,
    osMode,
    setOSMode,
    soundEnabled,
    addNotification,
  } = useJarvisStore()

  // Pomodoro timer state
  const [timerSeconds, setTimerSeconds] = useState(focusTimerMinutes * 60)
  const [isTimerRunning, setIsTimerRunning] = useState(false)
  const [isBreak, setIsBreak] = useState(false)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // Tasks
  const [tasks, setTasks] = useState<LocalTask[]>([
    { id: 'demo-1', text: 'Review project requirements', done: true },
    { id: 'demo-2', text: 'Set up development environment', done: true },
    { id: 'demo-3', text: 'Implement core features', done: false },
    { id: 'demo-4', text: 'Write documentation', done: false },
  ])
  const [newTaskText, setNewTaskText] = useState('')

  // Notes input
  const [newNoteText, setNewNoteText] = useState('')

  // Stats
  const completedToday = tasks.filter(t => t.done).length
  const streak = focusTimerSessions

  // Timer logic
  useEffect(() => {
    if (isTimerRunning) {
      timerRef.current = setInterval(() => {
        setTimerSeconds(prev => {
          if (prev <= 1) {
            // Timer finished
            setIsTimerRunning(false)
            if (isBreak) {
              setIsBreak(false)
              setTimerSeconds(focusTimerMinutes * 60)
              addNotification({
                type: 'success',
                title: 'Break Over',
                message: 'Time to get back to work!',
              })
            } else {
              setFocusTimerSessions(focusTimerSessions + 1)
              setIsBreak(true)
              setTimerSeconds(focusTimerBreakMinutes * 60)
              addNotification({
                type: 'info',
                title: 'Focus Session Complete',
                message: `Session #${focusTimerSessions + 1} done. Take a break!`,
              })
            }
            if (soundEnabled) playActivationSound()
            return 0
          }
          return prev - 1
        })
      }, 1000)
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [isTimerRunning, isBreak, focusTimerMinutes, focusTimerBreakMinutes, focusTimerSessions, setFocusTimerSessions, soundEnabled, addNotification])

  const toggleTimer = useCallback(() => {
    setIsTimerRunning(prev => !prev)
    if (!isTimerRunning && soundEnabled) playActivationSound()
  }, [isTimerRunning, soundEnabled])

  const resetTimer = useCallback(() => {
    setIsTimerRunning(false)
    setIsBreak(false)
    setTimerSeconds(focusTimerMinutes * 60)
    if (soundEnabled) playDeactivationSound()
  }, [focusTimerMinutes, soundEnabled])

  const toggleTask = useCallback((id: string) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, done: !t.done } : t))
  }, [])

  const addTask = useCallback(() => {
    if (!newTaskText.trim()) return
    setTasks(prev => [...prev, { id: `task-${Date.now()}`, text: newTaskText.trim(), done: false }])
    setNewTaskText('')
  }, [newTaskText])

  const removeTask = useCallback((id: string) => {
    setTasks(prev => prev.filter(t => t.id !== id))
  }, [])

  const handleAddNote = useCallback(() => {
    if (!newNoteText.trim()) return
    addNote(newNoteText.trim())
    setNewNoteText('')
  }, [newNoteText, addNote])

  const activateMode = useCallback((mode: OSMode) => {
    setOSMode(mode)
    if (soundEnabled) playActivationSound()
    addNotification({
      type: 'success',
      title: 'Mode Activated',
      message: `Switched to ${mode} mode`,
    })
  }, [setOSMode, soundEnabled, addNotification])

  // Format timer display
  const mins = Math.floor(timerSeconds / 60)
  const secs = timerSeconds % 60
  const timerDisplay = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  const timerProgress = isBreak
    ? 1 - timerSeconds / (focusTimerBreakMinutes * 60)
    : 1 - timerSeconds / (focusTimerMinutes * 60)

  return (
    <div className="flex flex-col h-full glass-panel overflow-hidden relative">
      {/* Animated gradient border */}
      <div className="absolute top-0 left-0 right-0 h-[1px] overflow-hidden">
        <motion.div
          className="h-full w-[200%]"
          style={{
            background: 'linear-gradient(90deg, transparent, rgba(0,255,136,0.6), rgba(0,240,255,0.4), transparent, rgba(0,255,136,0.6), transparent)',
            backgroundSize: '200% 100%',
          }}
          animate={{ backgroundPosition: ['0% 0%', '200% 0%'] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
        />
      </div>

      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-neon-green/10">
        <div className="flex items-center gap-2">
          <motion.div
            className="w-2 h-2 rounded-full bg-neon-green"
            animate={{ scale: [1, 1.3, 1], opacity: [0.6, 1, 0.6] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          />
          <h2 className="text-sm font-mono text-neon-green/80 uppercase tracking-wider">
            Productivity
          </h2>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 px-2 py-1 rounded-md bg-neon-green/5 border border-neon-green/10">
            <Trophy className="w-3 h-3 text-neon-green/60" />
            <span className="text-[10px] font-mono text-neon-green/60">{completedToday} done</span>
          </div>
          <div className="flex items-center gap-1 px-2 py-1 rounded-md bg-neon-orange/5 border border-neon-orange/10">
            <Flame className="w-3 h-3 text-neon-orange/60" />
            <span className="text-[10px] font-mono text-neon-orange/60">{streak} streak</span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto jarvis-scrollbar p-3 space-y-3">

        {/* Focus Mode Selector */}
        <div className="rounded-xl p-3 bg-white/[0.02] border border-white/5">
          <div className="flex items-center gap-1.5 mb-2">
            <Zap className="w-3 h-3 text-neon-green/50" />
            <span className="text-[10px] font-mono text-neon-green/50 uppercase tracking-wider">Focus Mode</span>
            <span className="text-[9px] font-mono text-white/20 ml-auto">Current: {osMode}</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {focusModes.map(mode => {
              const ModeIcon = mode.icon
              const isActive = osMode === mode.id
              return (
                <motion.button
                  key={mode.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => activateMode(mode.id)}
                  className={`flex items-center gap-2 p-2.5 rounded-lg border text-left transition-all ${
                    isActive
                      ? 'bg-white/[0.06] border-white/10'
                      : 'bg-white/[0.02] border-white/5 hover:bg-white/[0.04] hover:border-white/10'
                  }`}
                  style={{
                    boxShadow: isActive ? `0 0 12px ${mode.color}15` : 'none',
                    borderColor: isActive ? `${mode.color}30` : undefined,
                  }}
                >
                  <div
                    className="w-7 h-7 rounded-md flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: `${mode.color}15` }}
                  >
                    <ModeIcon className="w-3.5 h-3.5" style={{ color: mode.color }} />
                  </div>
                  <div className="min-w-0">
                    <div className="text-[10px] font-mono font-semibold text-white/60 truncate">{mode.label}</div>
                    <div className="text-[8px] font-mono text-white/25 truncate">{mode.description}</div>
                  </div>
                </motion.button>
              )
            })}
          </div>
        </div>

        {/* Pomodoro Timer */}
        <div className="rounded-xl p-4 bg-white/[0.02] border border-white/5 text-center">
          <div className="flex items-center justify-center gap-1.5 mb-3">
            <Clock className="w-3 h-3 text-neon-green/50" />
            <span className="text-[10px] font-mono text-neon-green/50 uppercase tracking-wider">
              {isBreak ? 'Break Timer' : 'Pomodoro Timer'}
            </span>
          </div>

          {/* Timer display */}
          <div className="relative w-28 h-28 mx-auto mb-3">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="42" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="4" />
              <motion.circle
                cx="50" cy="50" r="42" fill="none"
                stroke={isBreak ? '#ffcc00' : '#00ff88'}
                strokeWidth="4"
                strokeLinecap="round"
                strokeDasharray={2 * Math.PI * 42}
                animate={{ strokeDashoffset: 2 * Math.PI * 42 * (1 - timerProgress) }}
                transition={{ duration: 0.5 }}
                style={{ filter: `drop-shadow(0 0 6px ${isBreak ? '#ffcc0060' : '#00ff8860'})` }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <motion.span
                key={timerSeconds}
                initial={{ scale: 1.05 }}
                animate={{ scale: 1 }}
                className="text-2xl font-mono font-bold text-white/80"
              >
                {timerDisplay}
              </motion.span>
              <span className="text-[8px] font-mono text-white/20 uppercase">
                {isBreak ? 'Break' : 'Focus'}
              </span>
            </div>
          </div>

          <div className="flex items-center justify-center gap-2">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={toggleTimer}
              className={`p-2.5 rounded-xl border transition-all ${
                isTimerRunning
                  ? 'bg-neon-orange/10 border-neon-orange/20 text-neon-orange/70'
                  : 'bg-neon-green/10 border-neon-green/20 text-neon-green/70'
              }`}
            >
              {isTimerRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={resetTimer}
              className="p-2.5 rounded-xl border border-white/10 bg-white/[0.03] text-white/30 hover:text-white/60 transition-all"
            >
              <RotateCcw className="w-4 h-4" />
            </motion.button>
          </div>

          <div className="flex items-center justify-center gap-3 mt-2">
            <span className="text-[9px] font-mono text-white/20">Sessions: {focusTimerSessions}</span>
          </div>
        </div>

        {/* Quick Notes */}
        <div className="rounded-xl p-3 bg-white/[0.02] border border-white/5">
          <div className="flex items-center gap-1.5 mb-2">
            <StickyNote className="w-3 h-3 text-neon-green/50" />
            <span className="text-[10px] font-mono text-neon-green/50 uppercase tracking-wider">Quick Notes</span>
          </div>
          <div className="flex items-center gap-1.5 mb-2">
            <input
              type="text"
              value={newNoteText}
              onChange={e => setNewNoteText(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') handleAddNote() }}
              placeholder="Add a note..."
              className="flex-1 px-2.5 py-1.5 rounded-lg bg-white/5 border border-white/5
                text-[10px] text-white/60 placeholder:text-white/20 font-mono
                focus:outline-none focus:border-neon-green/30 transition-all"
            />
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleAddNote}
              disabled={!newNoteText.trim()}
              className="p-1.5 rounded-lg bg-neon-green/10 border border-neon-green/20 text-neon-green/60 disabled:opacity-30 transition-all"
            >
              <Plus className="w-3.5 h-3.5" />
            </motion.button>
          </div>
          <div className="max-h-24 overflow-y-auto jarvis-scrollbar space-y-1">
            {notes.length === 0 ? (
              <p className="text-[9px] font-mono text-white/15 text-center py-2">No notes yet</p>
            ) : (
              notes.map(note => (
                <div key={note.id} className="group flex items-center gap-1.5 py-1 px-2 rounded bg-white/[0.02]">
                  <span className="text-[10px] font-mono text-white/40 flex-1 truncate">{note.text}</span>
                  <button
                    onClick={() => removeNote(note.id)}
                    className="opacity-0 group-hover:opacity-100 p-0.5 text-white/20 hover:text-neon-red/60 transition-all"
                  >
                    <X className="w-2.5 h-2.5" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Task Checklist */}
        <div className="rounded-xl p-3 bg-white/[0.02] border border-white/5">
          <div className="flex items-center gap-1.5 mb-2">
            <ListTodo className="w-3 h-3 text-neon-green/50" />
            <span className="text-[10px] font-mono text-neon-green/50 uppercase tracking-wider">Tasks</span>
          </div>
          <div className="flex items-center gap-1.5 mb-2">
            <input
              type="text"
              value={newTaskText}
              onChange={e => setNewTaskText(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') addTask() }}
              placeholder="New task..."
              className="flex-1 px-2.5 py-1.5 rounded-lg bg-white/5 border border-white/5
                text-[10px] text-white/60 placeholder:text-white/20 font-mono
                focus:outline-none focus:border-neon-green/30 transition-all"
            />
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={addTask}
              disabled={!newTaskText.trim()}
              className="p-1.5 rounded-lg bg-neon-green/10 border border-neon-green/20 text-neon-green/60 disabled:opacity-30 transition-all"
            >
              <Plus className="w-3.5 h-3.5" />
            </motion.button>
          </div>
          <div className="max-h-32 overflow-y-auto jarvis-scrollbar space-y-1">
            {tasks.map(task => (
              <div key={task.id} className="group flex items-center gap-2 py-1.5 px-2 rounded hover:bg-white/[0.02] transition-colors">
                <button
                  onClick={() => toggleTask(task.id)}
                  className={`w-4 h-4 rounded border flex-shrink-0 flex items-center justify-center transition-all ${
                    task.done
                      ? 'bg-neon-green/20 border-neon-green/40'
                      : 'bg-white/5 border-white/15'
                  }`}
                >
                  {task.done && <CheckSquare className="w-2.5 h-2.5 text-neon-green" />}
                </button>
                <span className={`text-[10px] font-mono flex-1 ${task.done ? 'text-white/25 line-through' : 'text-white/50'}`}>
                  {task.text}
                </span>
                <button
                  onClick={() => removeTask(task.id)}
                  className="opacity-0 group-hover:opacity-100 p-0.5 text-white/20 hover:text-neon-red/60 transition-all"
                >
                  <Trash2 className="w-2.5 h-2.5" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Workflow Templates */}
        <div className="rounded-xl p-3 bg-white/[0.02] border border-white/5">
          <div className="flex items-center gap-1.5 mb-2">
            <Workflow className="w-3 h-3 text-neon-green/50" />
            <span className="text-[10px] font-mono text-neon-green/50 uppercase tracking-wider">Workflows</span>
          </div>
          <div className="space-y-2">
            {workflowTemplates.map((workflow) => {
              const WfIcon = workflow.icon
              return (
                <div key={workflow.name} className="p-2.5 rounded-lg bg-white/[0.02] border border-white/5 hover:border-white/10 transition-colors">
                  <div className="flex items-center gap-2 mb-1.5">
                    <div
                      className="w-6 h-6 rounded flex items-center justify-center"
                      style={{ backgroundColor: `${workflow.color}15` }}
                    >
                      <WfIcon className="w-3 h-3" style={{ color: workflow.color }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="text-[10px] font-mono font-semibold text-white/60">{workflow.name}</span>
                      <p className="text-[8px] font-mono text-white/20 truncate">{workflow.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 flex-wrap">
                    {workflow.steps.map((step, i) => (
                      <div key={i} className="flex items-center gap-1">
                        <span className="text-[8px] font-mono text-white/25 bg-white/5 px-1.5 py-0.5 rounded">
                          {step}
                        </span>
                        {i < workflow.steps.length - 1 && (
                          <ArrowRight className="w-2 h-2 text-white/10" />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between px-4 py-2 border-t border-neon-green/10">
        <span className="text-[9px] font-mono text-white/20">
          Mode: <span className="text-neon-green/40">{osMode}</span>
        </span>
        <div className="flex items-center gap-1">
          <Coffee className="w-2.5 h-2.5 text-white/20" />
          <span className="text-[9px] font-mono text-white/20">Stay productive</span>
        </div>
      </div>
    </div>
  )
}
