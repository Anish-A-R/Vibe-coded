# Task 2-c: VoiceChatOverlay Component

## Agent: Code Agent
## Status: COMPLETED

## Summary
Created `/home/z/my-project/src/components/jarvis/VoiceChatOverlay.tsx` — a floating chat overlay panel for the JARVIS AI assistant.

## What was built
- **VoiceChatOverlay component** with `open: boolean` and `onClose: () => void` props
- Floating translucent panel that slides in from the right side using Framer Motion spring animation
- Full height, ~420px wide on desktop, full width on mobile
- Glassmorphism styling with `glass-panel-strong` class + animated gradient borders (top + left edges)
- Can be dismissed by pressing Escape or via the `onClose` callback

## Features implemented
1. **Message history** — scrollable with `jarvis-scrollbar`, shows all messages from shared Zustand store
2. **Text input** at the bottom with JARVIS label + AI status dot, placeholder changes when voice is active
3. **Voice transcript** — real-time display of what user is saying while listening, with animated equalizer bars
4. **Clear chat button** — subtle RotateCcw icon in header
5. **Message styling** — role-based (user/assistant) with Bot/User avatars, holographic left/right borders, voice indicators
6. **Markdown support** — assistant messages rendered with `react-markdown` + `remark-gfm` (compact styling)
7. **SSE streaming** — full streaming support with blinking cyan cursor, thinking indicator, status transitions
8. **Command handling** — `parseCommand` from `@/lib/commands` for URL, search, system, generate, websearch commands
9. **TTS integration** — speaks AI responses via `useTTS`, stop speaking button available
10. **Notifications** — adds notifications on AI responses
11. **Backdrop** — subtle backdrop on mobile (click to close), none on desktop
12. **AbortController** — proper cleanup on unmount and close

## Store integration
Uses from `useJarvisStore`: `messages`, `addMessage`, `clearMessages`, `aiStatus`, `setAIStatus`, `voiceTranscript`, `isListening`, `pendingVoiceInput`, `setPendingVoiceInput`, `voiceLanguage`, `personalityMode`, `soundEnabled`, `incrementCommandCount`, `addNotification`

## Hooks used
- `useTTS` from `@/hooks/useTTS`
- `useJarvisToast` from `@/hooks/useJarvisToast`

## Lint status
- `npx eslint src/components/jarvis/VoiceChatOverlay.tsx` — CLEAN, no errors
