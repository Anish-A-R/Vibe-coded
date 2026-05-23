---
Task ID: 1
Agent: Main
Task: Add color theme switching and 5-second voice recording timer

Work Log:
- Read current project state: globals.css already had `--theme-primary-rgb` CSS variables, `[data-theme]` selectors, and `personality-*` classes
- Added ThemeSync component to layout.tsx for syncing data-theme attribute on <html>
- Added theme switcher hexagonal button to page.tsx (top-right corner)
- Imported ThemeSwitcher component and wired it up with showThemeSwitcher state
- Added voice commands for theme switching: "change theme to cyan/red/green/purple/orange/arctic", "change color", "switch mode"
- Created useThemeColors hook for providing theme-aware inline style values
- Updated JarvisOrb to read colorTheme from store and override statusConfig colors per theme
- Updated TickMarks in JarvisOrb to accept colorPrimary prop
- Updated VoiceChatOverlay to use useThemeColors for inline styles (card border, animated borders, corner brackets, holographic accent bars, cursor)
- Updated ThemeSwitcher panel border to use theme-aware colors
- 5-second voice recording timer was already implemented by subagent (recordingBufferRef, countdownIntervalRef, silenceTimerRef, recordingCountdown state, circular SVG progress indicator on mic button, green recording state)

Stage Summary:
- 6 color themes available: cyan (default), red, green, purple, orange, arctic
- Theme can be changed via: hexagonal button in top-right, voice commands, or ThemeSwitcher panel
- CSS classes (glass-panel, neon-glow-cyan, neon-text-cyan, etc.) use var(--theme-primary-rgb) for automatic theme switching
- Voice recording buffers for 5 seconds with 2-second silence detection for early processing
- Visual feedback: circular SVG progress ring around mic button, countdown number, green glow state
- Status label shows "RECORDING 5s" → "RECORDING 1s" during buffer window
