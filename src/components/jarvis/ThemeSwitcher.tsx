'use client'

import { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'
import { useJarvisStore, type ColorTheme } from '@/hooks/useJarvisStore'
import { useThemeColors } from '@/hooks/useThemeColors'

// ─── Theme definitions ────────────────────────────────────────────────
const themes: { id: ColorTheme; label: string; subtitle: string; hex: string }[] = [
  { id: 'cyan',    label: 'Cyan',    subtitle: 'Classic',   hex: '#00f0ff' },
  { id: 'red',     label: 'Red',     subtitle: 'Alert',     hex: '#ff3366' },
  { id: 'green',   label: 'Green',   subtitle: 'Matrix',    hex: '#00ff88' },
  { id: 'purple',  label: 'Purple',  subtitle: 'Nebula',    hex: '#8b5cf6' },
  { id: 'orange',  label: 'Orange',  subtitle: 'Flame',     hex: '#ff6a00' },
  { id: 'arctic',  label: 'Arctic',  subtitle: 'Frost',     hex: '#60a5fa' },
  { id: 'gold',    label: 'Gold',    subtitle: 'Stark',     hex: '#ffd700' },
  { id: 'pink',    label: 'Pink',    subtitle: 'Pulse',     hex: '#f472b6' },
  { id: 'teal',    label: 'Teal',    subtitle: 'Sonar',     hex: '#2dd4bf' },
  { id: 'crimson', label: 'Crimson', subtitle: 'Emergency', hex: '#dc2626' },
  { id: 'lime',    label: 'Lime',    subtitle: 'Toxic',     hex: '#84cc16' },
]

// ─── Props ────────────────────────────────────────────────────────────
interface ThemeSwitcherProps {
  open: boolean
  onClose: () => void
}

// ─── Hex swatch component ─────────────────────────────────────────────
function HexSwatch({
  hex,
  label,
  subtitle,
  isSelected,
  onClick,
}: {
  hex: string
  label: string
  subtitle: string
  isSelected: boolean
  onClick: () => void
}) {
  return (
    <motion.button
      whileHover={{ scale: 1.08, y: -2 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className="flex flex-col items-center gap-1.5 group outline-none"
      aria-label={`Select ${label} theme`}
    >
      {/* Hexagon swatch */}
      <div className="relative">
        {/* Glow ring behind hex when selected */}
        <AnimatePresence>
          {isSelected && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.25 }}
              className="absolute inset-[-6px] rounded-full"
              style={{
                boxShadow: `0 0 12px ${hex}66, 0 0 24px ${hex}33, 0 0 48px ${hex}1a`,
              }}
            />
          )}
        </AnimatePresence>

        {/* Hex shape */}
        <div
          className="relative w-12 h-12 sm:w-14 sm:h-14 flex items-center justify-center transition-all duration-300"
          style={{
            clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)',
            background: isSelected
              ? `linear-gradient(135deg, ${hex}, ${hex}cc)`
              : `linear-gradient(135deg, ${hex}33, ${hex}1a)`,
            boxShadow: isSelected ? `0 0 20px ${hex}44` : 'none',
          }}
        >
          {/* Inner hex core */}
          <div
            className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center transition-all duration-300"
            style={{
              clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)',
              background: isSelected
                ? `${hex}`
                : `${hex}44`,
              boxShadow: isSelected ? `inset 0 0 8px ${hex}66` : 'none',
            }}
          >
            {/* Selection check mark */}
            {isSelected && (
              <motion.svg
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#000"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="20 6 9 17 4 12" />
              </motion.svg>
            )}
          </div>
        </div>

        {/* Pulsing ring for selected */}
        {isSelected && (
          <motion.div
            className="absolute inset-[-3px]"
            style={{
              clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)',
              border: `2px solid ${hex}88`,
            }}
            animate={{ opacity: [0.4, 0.8, 0.4] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          />
        )}
      </div>

      {/* Label */}
      <div className="text-center">
        <p
          className="text-[10px] font-mono tracking-wider uppercase transition-colors duration-300"
          style={{ color: isSelected ? hex : 'rgba(255,255,255,0.5)' }}
        >
          {label}
        </p>
        <p className="text-[8px] font-mono tracking-wider uppercase" style={{ color: 'rgba(255,255,255,0.2)' }}>
          {subtitle}
        </p>
      </div>
    </motion.button>
  )
}

// ─── Main component ───────────────────────────────────────────────────
export function ThemeSwitcher({ open, onClose }: ThemeSwitcherProps) {
  const colorTheme = useJarvisStore((s) => s.colorTheme)
  const setColorTheme = useJarvisStore((s) => s.setColorTheme)
  const tc = useThemeColors()

  // Sync data-theme attribute on change
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', colorTheme)
  }, [colorTheme])

  const handleSelect = (theme: ColorTheme) => {
    setColorTheme(theme)
    document.documentElement.setAttribute('data-theme', theme)
  }

  // Cycle to next theme
  const cycleTheme = () => {
    const currentIndex = themes.findIndex(t => t.id === colorTheme)
    const nextIndex = (currentIndex + 1) % themes.length
    const nextTheme = themes[nextIndex].id
    handleSelect(nextTheme)
  }

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            key="theme-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Panel */}
          <motion.div
            key="theme-panel"
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', stiffness: 350, damping: 28, mass: 0.8 }}
            className="fixed inset-0 z-[70] flex items-center justify-center pointer-events-none p-4"
          >
            <div
              className="pointer-events-auto max-w-[460px] w-[92vw] relative overflow-hidden glass-panel-strong"
              style={{
                borderRadius: '12px',
                border: `1px solid ${tc.rgba(0.2)}`,
                boxShadow: `0 0 30px ${tc.rgba(0.08)}, 0 0 60px ${tc.rgba(0.04)}, 0 8px 32px rgba(0,0,0,0.5)`,
              }}
            >
              {/* Corner brackets */}
              {(() => {
                const size = 18
                const thickness = 2
                const color = tc.rgba(0.5)
                return (
                  <>
                    <div className="absolute top-0 left-0 pointer-events-none" style={{ width: size, height: size }}>
                      <div style={{ position: 'absolute', top: 0, left: 0, width: size, height: thickness, background: color }} />
                      <div style={{ position: 'absolute', top: 0, left: 0, width: thickness, height: size, background: color }} />
                    </div>
                    <div className="absolute top-0 right-0 pointer-events-none" style={{ width: size, height: size }}>
                      <div style={{ position: 'absolute', top: 0, right: 0, width: size, height: thickness, background: color }} />
                      <div style={{ position: 'absolute', top: 0, right: 0, width: thickness, height: size, background: color }} />
                    </div>
                    <div className="absolute bottom-0 left-0 pointer-events-none" style={{ width: size, height: size }}>
                      <div style={{ position: 'absolute', bottom: 0, left: 0, width: size, height: thickness, background: color }} />
                      <div style={{ position: 'absolute', bottom: 0, left: 0, width: thickness, height: size, background: color }} />
                    </div>
                    <div className="absolute bottom-0 right-0 pointer-events-none" style={{ width: size, height: size }}>
                      <div style={{ position: 'absolute', bottom: 0, right: 0, width: size, height: thickness, background: color }} />
                      <div style={{ position: 'absolute', bottom: 0, right: 0, width: thickness, height: size, background: color }} />
                    </div>
                  </>
                )
              })()}

              {/* Scanline overlay */}
              <div className="absolute inset-0 pointer-events-none z-[5] hud-scanline-h opacity-30" />

              {/* Header */}
              <div className="flex items-center justify-between px-5 py-3 border-b border-neon-cyan/10 relative z-10">
                <div className="flex items-center gap-2.5">
                  <div className="w-2 h-2 rounded-full animate-pulse" style={{ background: tc.hex }} />
                  <h2 className="text-xs font-mono uppercase tracking-[0.2em]" style={{ color: tc.rgba(0.8) }}>
                    Color Mode
                  </h2>
                </div>
                <div className="flex items-center gap-2">
                  {/* Cycle button */}
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={cycleTheme}
                    className="px-2.5 py-1 rounded-md text-[9px] font-mono uppercase tracking-wider transition-colors"
                    style={{
                      color: tc.rgba(0.6),
                      border: `1px solid ${tc.rgba(0.15)}`,
                      background: tc.rgba(0.05),
                    }}
                    aria-label="Cycle to next theme"
                  >
                    Next →
                  </motion.button>
                  <button
                    onClick={onClose}
                    className="p-1.5 rounded-md hover:bg-white/5 transition-colors"
                    style={{ color: tc.rgba(0.3) }}
                    aria-label="Close theme switcher"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Theme grid */}
              <div className="px-5 py-4 relative z-10">
                <div className="grid grid-cols-4 gap-3 sm:gap-4">
                  {themes.map((theme) => (
                    <HexSwatch
                      key={theme.id}
                      hex={theme.hex}
                      label={theme.label}
                      subtitle={theme.subtitle}
                      isSelected={colorTheme === theme.id}
                      onClick={() => handleSelect(theme.id)}
                    />
                  ))}
                </div>
              </div>

              {/* Footer */}
              <div className="px-5 pb-3 pt-1 relative z-10">
                <p className="text-[9px] font-mono text-white/20 text-center tracking-wider">
                  SAY &ldquo;CHANGE COLOR&rdquo; OR PICK A MODE ABOVE
                </p>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
