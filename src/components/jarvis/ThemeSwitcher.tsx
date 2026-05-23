'use client'

import { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'
import { useJarvisStore, type ColorTheme } from '@/hooks/useJarvisStore'

// ─── Theme definitions ────────────────────────────────────────────────
const themes: { id: ColorTheme; label: string; subtitle: string; hex: string }[] = [
  { id: 'cyan',   label: 'Cyan',   subtitle: 'Classic', hex: '#00f0ff' },
  { id: 'red',    label: 'Red',    subtitle: 'Alert',   hex: '#ff3366' },
  { id: 'green',  label: 'Green',  subtitle: 'Matrix',  hex: '#00ff88' },
  { id: 'purple', label: 'Purple', subtitle: 'Nebula',  hex: '#8b5cf6' },
  { id: 'orange', label: 'Orange', subtitle: 'Flame',   hex: '#ff6a00' },
  { id: 'arctic', label: 'Arctic', subtitle: 'Frost',   hex: '#60a5fa' },
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
      className="flex flex-col items-center gap-2 group outline-none"
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
          className="relative w-14 h-14 sm:w-16 sm:h-16 flex items-center justify-center transition-all duration-300"
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
            className="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center transition-all duration-300"
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
                width="16"
                height="16"
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
          className="text-[11px] font-mono tracking-wider uppercase transition-colors duration-300"
          style={{ color: isSelected ? hex : 'rgba(255,255,255,0.5)' }}
        >
          {label}
        </p>
        <p className="text-[9px] font-mono tracking-wider uppercase" style={{ color: 'rgba(255,255,255,0.25)' }}>
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

  // Sync data-theme attribute on change
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', colorTheme)
  }, [colorTheme])

  const handleSelect = (theme: ColorTheme) => {
    setColorTheme(theme)
    document.documentElement.setAttribute('data-theme', theme)
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
              className="pointer-events-auto max-w-[400px] w-[92vw] relative overflow-hidden glass-panel-strong"
              style={{
                borderRadius: '12px',
                border: `1px solid rgba(0,240,255,0.2)`,
                boxShadow: `0 0 30px rgba(0,240,255,0.08), 0 0 60px rgba(0,240,255,0.04), 0 8px 32px rgba(0,0,0,0.5)`,
              }}
            >
              {/* Corner brackets */}
              {(() => {
                const size = 18
                const thickness = 2
                const color = 'rgba(0, 240, 255, 0.5)'
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
              <div className="flex items-center justify-between px-5 py-3.5 border-b border-neon-cyan/10 relative z-10">
                <div className="flex items-center gap-2.5">
                  <div className="w-2 h-2 rounded-full bg-neon-cyan animate-pulse" />
                  <h2 className="text-xs font-mono text-neon-cyan/80 uppercase tracking-[0.2em]">
                    Color Mode
                  </h2>
                </div>
                <button
                  onClick={onClose}
                  className="p-1.5 rounded-md hover:bg-white/5 text-white/30 hover:text-neon-cyan/70 transition-colors"
                  aria-label="Close theme switcher"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Theme grid */}
              <div className="px-5 py-5 relative z-10">
                <div className="grid grid-cols-3 gap-4 sm:gap-5">
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
              <div className="px-5 pb-4 pt-1 relative z-10">
                <p className="text-[9px] font-mono text-white/20 text-center tracking-wider">
                  SELECT A COLOR MODE TO CUSTOMIZE THE INTERFACE
                </p>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
