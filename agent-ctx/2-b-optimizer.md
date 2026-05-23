# Task 2-b: Performance Optimization of ParticleField & VoiceEqualizer

## Agent: optimizer
## Date: 2026-05-23

## Task Summary
Optimize two performance-critical JARVIS components: ParticleField and VoiceEqualizer.

## Changes Made

### 1. ParticleField (`/src/components/jarvis/ParticleField.tsx`)

**Optimizations applied:**
- **Reduced PARTICLE_COUNT**: 80 → 40 (50% fewer particles)
- **Reduced CONNECTION_DISTANCE**: 150 → 100 (fewer connection line checks)
- **Pre-computed CONNECTION_DISTANCE_SQ**: Avoids repeated multiplication in distance checks
- **Frame throttling to ~30fps**: Added `lastRenderRef` + `TARGET_FPS=30` + `FRAME_INTERVAL` check at top of render loop. Frames arriving faster than 33ms are skipped.
- **Squared distance check first**: Connection lines now compare `distSq < CONNECTION_DISTANCE_SQ` before computing `Math.sqrt`, avoiding expensive sqrt for distant pairs
- **Removed particle glow draw**: Eliminated the second `ctx.arc` + `ctx.fill` call per particle (was drawing a 2.5x radius semi-transparent glow)
- **Batched connection line draws**: Single `ctx.beginPath()` + single `ctx.stroke()` for all connections instead of per-line beginPath/stroke
- **Simplified shooting star trail**: Removed `createLinearGradient` per shooting star frame, replaced with flat color stroke (gradient creation is expensive per frame)
- **Reduced shooting star frequency**: `frameCount % 300` (was % 180), max 2 (was 3)
- **Removed AnimatePresence/motion.div wrapper**: Canvas doesn't benefit from Framer Motion animation; replaced with simple `<div>`. Removes React reconciliation overhead and Framer Motion dependency from this render path.
- **Removed framer-motion import entirely**: No longer needed
- **Capped DPR at 2**: `Math.min(window.devicePixelRatio || 1, 2)` prevents excessive canvas resolution on 3x+ displays
- **Added `{ alpha: true }` to getContext**: Hint to browser for compositing optimization

### 2. VoiceEqualizer (`/src/components/jarvis/VoiceEqualizer.tsx`)

**Optimizations applied:**
- **Replaced Framer Motion with pure CSS animations**: Each bar now uses CSS `@keyframes` with per-bar keyframe definitions. Eliminates 20 `motion.div` instances, each with their own animation controller, reconciliation overhead, and style recalculation.
- **Removed framer-motion import**: No longer needed
- **Removed `phaseOffset` from bar data**: Was unused in the Framer Motion version anyway
- **CSS `animation` property**: Uses `animation: eq-bar-{id} {duration}s ease-in-out {delay}s infinite` for GPU-accelerated CSS animation
- **Per-bar `<style>` injection**: Each bar gets its own `@keyframes` rule with 7 keyframe stops matching the original Framer Motion animation values
- **Type assertion `as React.CSSProperties`**: Needed for custom CSS animation property

## Performance Impact Estimates
- **ParticleField**: ~50% fewer particles + ~30fps cap + no glow draws + batched lines = estimated 60-70% GPU workload reduction
- **VoiceEqualizer**: Eliminating 20 Framer Motion animators = significant JS thread savings, CSS animations offloaded to compositor thread

## Verification
- `bun run lint` ✅ Clean (no errors)
- Dev server compiles successfully, page loads with 200 status
