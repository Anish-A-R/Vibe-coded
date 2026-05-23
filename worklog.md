---
Task ID: 1
Agent: Main Agent
Task: Fix broken color system and add voice selection

Work Log:
- Read all existing files to understand the color/theme system architecture
- Identified that globals.css had hardcoded `rgba(0, 102, 255, ...)` blue references in:
  - jarvis-msg-ai box-shadow
  - jarvis-msg-ai::before gradient
  - jarvis-msg-ai::after gradient
  - loading bar gradient
- Fixed all hardcoded blue references to use `var(--theme-secondary-rgb)` instead
- Fixed JarvisOrb.tsx: Previously thinking/speaking states did NOT apply theme colors. Now ALL states (idle, listening, thinking, speaking) properly use theme colors
- Fixed CircularOrb.tsx: Added theme color map and wired it to useJarvisStore for dynamic theming
- Added voice selection state to store: selectedVoice, voicePitch, voiceRate
- Updated useTTS hook to use selected voice, pitch, and rate
- Added getAvailableVoices() and getVoicesByLanguage() helper functions to useTTS
- Created VoicePicker component with:
  - Voice list grouped by language
  - Voice preview button for each voice
  - Pitch and rate sliders
  - Reset to default button
  - Timeout fallback for browsers without speech synthesis
- Updated ThemeSwitcher to include tabs: Colors and Voice
- Added voice commands: "change voice", "switch voice", "select voice", "voice settings" to open settings
- Added "next voice" command to cycle through English voices
- Added "reset voice"/"default voice" command to reset voice settings
- Updated bottom hint bar to include voice command hints
- Added CSS for range input styling (slider thumb, etc.)
- All lint checks pass
- Browser tested: themes apply correctly to orb, settings panel works with both tabs

Stage Summary:
- Color system now properly uses CSS custom properties throughout
- All orb states (idle, listening, thinking, speaking) apply theme colors
- Voice selection system fully implemented with UI and voice commands
- Settings panel now has "Color" and "Voice" tabs
- Voice commands: "change voice", "next voice", "reset voice" available
