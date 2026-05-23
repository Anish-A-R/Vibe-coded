# Task 2a - TTS + HUD Decorations

## Task: Add TTS and HUD decorations

## Work Log
- Created `/src/hooks/useTTS.ts` - Web Speech Synthesis API hook with speak(), stop(), isSpeaking()
- Modified `/src/components/jarvis/ChatPanel.tsx`:
  - Added `useTTS` import and hook usage
  - Added `VolumeX` stop button in header when JARVIS is speaking
  - Auto-speaks AI responses after typing effect completes (when soundEnabled)
  - Stops speaking when chat is cleared
  - Updated dependency arrays for typeResponse and handleSend
- Modified `/src/components/jarvis/MessageBubble.tsx`:
  - Added `useTTS` import and hook usage
  - Added `Volume2` speaker button on assistant messages (visible on hover)
- Created `/src/components/jarvis/HUDDecorations.tsx`:
  - `CornerBrackets` - SVG L-shaped corner brackets with draw animation and corner dots
  - `DataReadout` - Label──Value with animated dashed line and flicker effect
  - `ScanLine` - Horizontal glow line moving top-to-bottom
  - `HUDFrame` - Complete wrapper with brackets, title bar, scan line, and data readouts
- Lint passes cleanly
- Updated worklog.md with task completion

## Files Modified/Created
- `/src/hooks/useTTS.ts` (NEW)
- `/src/components/jarvis/ChatPanel.tsx` (MODIFIED)
- `/src/components/jarvis/MessageBubble.tsx` (MODIFIED)
- `/src/components/jarvis/HUDDecorations.tsx` (NEW)
- `/home/z/my-project/worklog.md` (MODIFIED)
