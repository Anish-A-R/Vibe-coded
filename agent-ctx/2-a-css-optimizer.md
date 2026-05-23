# Task 2-a: CSS Performance Optimization + CircularOrb Keyframes

## Summary
Added CircularOrb CSS keyframe animations and optimized existing CSS for performance in `/home/z/my-project/src/app/globals.css`.

## Changes Made

### 1. CircularOrb CSS Keyframes (7 new keyframes)
Added before the `.theme-purple` section:
- `orb-rotate-cw` — clockwise rotation (0→360deg)
- `orb-rotate-ccw` — counter-clockwise rotation (360→0deg)
- `orb-pulse-wave` — expanding sonar pulse (scale 0.3→8, opacity 0.4→0)
- `orb-core-pulse` — subtle core breathing (scale 1→1.05, opacity 0.8→1)
- `orb-hex-fade` — hexagonal grid fade in/out (opacity 0→0.12→0)
- `orb-hex-outline` — hex outline scale+opacity (scale 0.95→1.05, opacity 0.4→0.8)
- `orb-core-breathe` — dramatic core breathing (scale 1→1.3, opacity 0.9→1)

### 2. Glass Panel Blur Optimization
- `.glass-panel`: `backdrop-filter: blur(20px)` → `blur(12px)`, `-webkit-backdrop-filter: blur(20px)` → `blur(12px)`
- `.glass-panel-strong`: `backdrop-filter: blur(30px)` → `blur(16px)`, `-webkit-backdrop-filter: blur(30px)` → `blur(16px)`

### 3. CRT Overlay Scanline Optimization
- Changed from 2px spacing to 3px spacing: `transparent 3px` / `rgba(0,0,0,0.03) 6px`

### 4. Glass Shimmer Slowdown
- Changed `.glass-panel::before` animation from `glass-shimmer 8s` to `glass-shimmer 15s`

## Verification
- `bun run lint` ✅ Clean
- No existing CSS broken
