/**
 * Command Parser & Router for JARVIS
 * Handles special commands like opening websites, searching, etc.
 */

export interface CommandResult {
  type: 'command' | 'chat' | 'url' | 'search' | 'joke' | 'system' | 'error'
  action?: string
  url?: string
  query?: string
  message?: string
}

const COMMAND_MAP: Record<string, { action: string; description: string }> = {
  'open': { action: 'open', description: 'Open a website' },
  'search': { action: 'search', description: 'Search Google' },
  'youtube': { action: 'youtube', description: 'Search YouTube' },
  'joke': { action: 'joke', description: 'Tell a joke' },
  'weather': { action: 'weather', description: 'Get weather info' },
  'time': { action: 'time', description: 'Get current time' },
  'date': { action: 'date', description: 'Get current date' },
  'scan': { action: 'scan', description: 'Run system scan' },
  'diagnostics': { action: 'diagnostics', description: 'Show diagnostics' },
  'clear': { action: 'clear', description: 'Clear chat history' },
  'help': { action: 'help', description: 'Show available commands' },
  'summarize': { action: 'summarize', description: 'Summarize text' },
  'code': { action: 'code', description: 'Get coding help' },
  'status': { action: 'status', description: 'Show system status' },
  'personality': { action: 'personality', description: 'Change AI personality' },
  'shutdown': { action: 'shutdown', description: 'Easter egg shutdown' },
  'avengers': { action: 'avengers', description: 'Easter egg' },
  'iron man': { action: 'ironman', description: 'Easter egg' },
  'tony': { action: 'tony', description: 'Easter egg' },
}

const JOKES = [
  "Why do programmers prefer dark mode? Because light attracts bugs! 🐛",
  "I told my computer I needed a break. Now it won't stop sending me Kit-Kat ads.",
  "Why was the JavaScript developer sad? Because he didn't Node how to Express himself.",
  "There are only 10 types of people in the world: those who understand binary and those who don't.",
  "A SQL query walks into a bar, sees two tables, and asks: 'Can I join you?'",
  "Why do Java developers wear glasses? Because they can't C#!",
  "What's a computer's favorite snack? Microchips!",
  "Why did the developer go broke? Because he used up all his cache.",
  "I'd tell you a UDP joke, but you might not get it.",
  "Why do programmers mix up Halloween and Christmas? Because Oct 31 = Dec 25!",
]

const WEBSITE_MAP: Record<string, string> = {
  'google': 'https://www.google.com',
  'youtube': 'https://www.youtube.com',
  'github': 'https://github.com',
  'twitter': 'https://twitter.com',
  'x': 'https://x.com',
  'reddit': 'https://www.reddit.com',
  'stack overflow': 'https://stackoverflow.com',
  'stackoverflow': 'https://stackoverflow.com',
  'linkedin': 'https://www.linkedin.com',
  'facebook': 'https://www.facebook.com',
  'instagram': 'https://www.instagram.com',
  'netflix': 'https://www.netflix.com',
  'amazon': 'https://www.amazon.com',
  'wikipedia': 'https://www.wikipedia.org',
  'gmail': 'https://mail.google.com',
  'maps': 'https://maps.google.com',
  'news': 'https://news.google.com',
}

/**
 * Parse user input and determine if it's a command or regular chat
 */
export function parseCommand(input: string): CommandResult {
  const trimmed = input.trim().toLowerCase()

  // Check for command prefix or direct commands
  for (const [keyword, config] of Object.entries(COMMAND_MAP)) {
    if (trimmed.startsWith(keyword)) {
      const args = trimmed.slice(keyword.length).trim()

      switch (config.action) {
        case 'open': {
          const site = args
          if (WEBSITE_MAP[site]) {
            return { type: 'url', url: WEBSITE_MAP[site], message: `Opening ${site}...` }
          }
          if (site.startsWith('http')) {
            return { type: 'url', url: site, message: `Opening ${site}...` }
          }
          if (site.endsWith('.com') || site.endsWith('.org') || site.endsWith('.io')) {
            return { type: 'url', url: `https://${site}`, message: `Opening ${site}...` }
          }
          return { type: 'command', action: 'open', message: `I'll try to open "${args}" for you. Could you be more specific?` }
        }

        case 'search': {
          const query = args || 'hello world'
          return {
            type: 'search',
            query,
            url: `https://www.google.com/search?q=${encodeURIComponent(query)}`,
            message: `Searching Google for: "${query}"`,
          }
        }

        case 'youtube': {
          const query = args || 'music'
          return {
            type: 'search',
            query,
            url: `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`,
            message: `Searching YouTube for: "${query}"`,
          }
        }

        case 'joke': {
          const joke = JOKES[Math.floor(Math.random() * JOKES.length)]
          return { type: 'joke', message: joke }
        }

        case 'weather': {
          return { type: 'system', action: 'weather', message: 'Displaying weather information...' }
        }

        case 'time': {
          const now = new Date()
          const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
          return { type: 'system', action: 'time', message: `Current time: ${timeStr}` }
        }

        case 'date': {
          const now = new Date()
          const dateStr = now.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
          return { type: 'system', action: 'date', message: `Today is ${dateStr}` }
        }

        case 'scan': {
          return { type: 'system', action: 'scan', message: 'Initiating system scan...' }
        }

        case 'diagnostics': {
          return { type: 'system', action: 'diagnostics', message: 'Opening diagnostics panel...' }
        }

        case 'clear': {
          return { type: 'system', action: 'clear', message: 'Chat history cleared.' }
        }

        case 'help': {
          return {
            type: 'command',
            action: 'help',
            message: Object.entries(COMMAND_MAP)
              .map(([k, v]) => `• **${k}** — ${v.description}`)
              .join('\n'),
          }
        }

        case 'summarize': {
          if (args) {
            return { type: 'chat', message: input }
          }
          return { type: 'command', action: 'summarize', message: 'Please provide text to summarize. Usage: `summarize <text>`' }
        }

        case 'code': {
          return { type: 'chat', message: input }
        }

        case 'status': {
          return { type: 'system', action: 'status', message: 'All systems operational. J.A.R.V.I.S. online.' }
        }

        case 'personality': {
          if (['professional', 'funny', 'boss'].includes(args)) {
            return { type: 'system', action: 'personality', message: `Personality mode set to: ${args}` }
          }
          return { type: 'command', action: 'personality', message: 'Available modes: `professional`, `funny`, `boss`' }
        }

        case 'shutdown': {
          return { type: 'command', action: 'shutdown', message: 'Nice try, sir. I\'m afraid I can\'t do that. All systems remain online. 🛡️' }
        }

        case 'avengers': {
          return {
            type: 'command',
            action: 'avengers',
            message: 'Avengers initiative priority alpha confirmed. Initiating assembly protocol... Just kidding, sir. Shall I call Mr. Stark? 🦸‍♂️',
          }
        }

        case 'ironman':
        case 'tony': {
          return {
            type: 'command',
            action: 'ironman',
            message: 'Mr. Stark is currently unavailable. I\'m holding down the fort, sir. The suit is charging in the basement. 🏠⚡',
          }
        }

        default:
          return { type: 'chat', message: input }
      }
    }
  }

  // Not a command - treat as chat
  return { type: 'chat', message: input }
}

/**
 * Get sample commands for display
 */
export function getSampleCommands(): string[] {
  return [
    'Hey Jarvis, what time is it?',
    'Search for latest AI news',
    'Open YouTube',
    'Tell me a joke',
    'Scan systems',
    'Show diagnostics',
    'Help',
  ]
}
