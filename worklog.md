---
Task ID: 1
Agent: main
Task: Fix broken color system - themes not applying to the orb

Work Log:
- Identified root cause: JarvisOrb.tsx themeColors map only had 6 themes (cyan, red, green, purple, orange, arctic), missing gold, pink, teal, crimson, lime
- Added 5 missing themes to JarvisOrb.tsx themeColors map
- Enhanced useThemeColors.ts hook with secondary color support (secondaryRgb, secondaryHex, secondaryRgba, secondary)
- Added global data-theme sync in page.tsx - previously only synced when ThemeSwitcher was open
- Replaced hardcoded neon-cyan Tailwind classes in AmbientBar with theme-aware inline styles using useThemeColors hook
- Replaced hardcoded neon-cyan in VoiceStatusBar with theme-aware inline styles for mic button, pulse rings, SVG circles, and equalizer bars
- Replaced hardcoded background blur colors in main page with theme-aware rgba values
- All 11 themes verified working correctly in the orb via browser testing

Stage Summary:
- All 11 color themes (cyan, red, green, purple, orange, arctic, gold, pink, teal, crimson, lime) now work correctly in the orb
- CSS variable system works properly - data-theme attribute syncs globally
- Theme persistence works - closing theme switcher preserves selected theme
- No visual bugs remaining
