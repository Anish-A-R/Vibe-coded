'use client';

import { useEffect, useRef, useState } from 'react';

export default function NexusOS() {
  const [bootComplete, setBootComplete] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState('Tinku');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  // Define users
  const users = [
    { id: 'Tinku', name: 'Tinku', icon: '👤', hasPassword: false },
    { id: 'admin', name: 'admin', icon: '🔐', hasPassword: true }
  ];
  const [aiVisible, setAiVisible] = useState(false);
  const [aiMessages, setAiMessages] = useState<Array<{ role: 'user' | 'assistant'; content: string }>>([
    { role: 'assistant', content: 'Hello, Operator! I\'m NEXUS, your AI assistant. How can I help you today?' }
  ]);
  const [aiInput, setAiInput] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [theme, setTheme] = useState('cyberpunk');
  const [windows, setWindows] = useState<any[]>([]);
  const [activeWindow, setActiveWindow] = useState<string | null>(null);
  const [minimizedWindows, setMinimizedWindows] = useState<string[]>([]);
  const [windowZIndex, setWindowZIndex] = useState(100);
  const [startMenuVisible, setStartMenuVisible] = useState(false);
  const [contextMenuVisible, setContextMenuVisible] = useState(false);
  const [contextMenuPosition, setContextMenuPosition] = useState({ x: 0, y: 0 });
  const [leftClickMenuVisible, setLeftClickMenuVisible] = useState(false);
  const [leftClickMenuPosition, setLeftClickMenuPosition] = useState({ x: 0, y: 0 });
  const [selectedIcon, setSelectedIcon] = useState<string | null>(null);
  const [iconContextMenuVisible, setIconContextMenuVisible] = useState(false);
  const [iconContextMenuPosition, setIconContextMenuPosition] = useState({ x: 0, y: 0 });
  const [iconContextMenuFor, setIconContextMenuFor] = useState<string | null>(null);
  const [iconPositions, setIconPositions] = useState<Record<string, { x: number; y: number }>>({});
  const [draggingIcon, setDraggingIcon] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [showWeatherWidget, setShowWeatherWidget] = useState(true);
  const [weatherData, setWeatherData] = useState({
    temperature: 24,
    location: 'Neo Tokyo Sector 7',
    condition: '🌤️ Partly Cloudy',
    loading: true
  });
  const [filesystem, setFilesystem] = useState<any>({
    '/system': {
      type: 'folder',
      children: {
        'kernel.sys': { type: 'file', size: '2.4 MB' },
        'bootloader': { type: 'file', size: '512 KB' },
        'drivers': { type: 'folder', children: {} },
        'config': { type: 'folder', children: { 'system.conf': { type: 'file', size: '12 KB' } } }
      }
    },
    '/users': {
      type: 'folder',
      children: {
        'operator': {
          type: 'folder',
          children: {
            'documents': {
              type: 'folder',
              children: {
                'mission_briefing.txt': { type: 'file', size: '24 KB' },
                'notes.txt': { type: 'file', size: '8 KB' }
              }
            },
            'downloads': { type: 'folder', children: {} },
            'pictures': { type: 'folder', children: {} }
          }
        }
      }
    },
    '/logs': {
      type: 'folder',
      children: {
        'system': { 
          type: 'folder',
          children: {
            'boot.log': { type: 'file', size: '245 KB' },
            'kernel.log': { type: 'file', size: '1.2 MB' },
            'services.log': { type: 'file', size: '567 KB' }
          }
        },
        'security': { 
          type: 'folder',
          children: {
            'auth.log': { type: 'file', size: '856 KB' },
            'firewall.log': { type: 'file', size: '423 KB' },
            'intrusion.log': { type: 'file', size: '189 KB' }
          }
        },
        'network': { 
          type: 'folder',
          children: {
            'connections.log': { type: 'file', size: '432 KB' },
            'traffic.log': { type: 'file', size: '1.8 MB' },
            'proxy.log': { type: 'file', size: '345 KB' }
          }
        },
        'applications': {
          type: 'folder',
          children: {
            'app_errors.log': { type: 'file', size: '234 KB' },
            'crash_reports': { 
              type: 'folder',
              children: {
                'crash_2024_01_15.log': { type: 'file', size: '45 KB' },
                'crash_2024_02_20.log': { type: 'file', size: '67 KB' }
              }
            }
          }
        },
        'archive': {
          type: 'folder',
          children: {
            'logs_2023.zip': { type: 'file', size: '12.4 GB' },
            'logs_2022.zip': { type: 'file', size: '10.8 GB' }
          }
        }
      }
    },
    '/projects': {
      type: 'folder',
      children: {
        'Gesture_Controller': { type: 'folder', url: 'https://github.com/Anish-A-R/Vibe-coded/tree/main/Gesture_Controller', children: {} },
        'Rock, Paper and Scissors': { type: 'folder', url: 'https://github.com/Anish-A-R/Vibe-coded/tree/main/Rock%20%2C%20Paper%20and%20Scissor', children: {} },
        'Rock Paper Scissors V2': { type: 'folder', url: 'https://github.com/Anish-A-R/Vibe-coded/tree/main/Rock%20Paper%20Scissors%20V2', children: {} },
        'Simple Keylogger': { type: 'folder', url: 'https://github.com/Anish-A-R/Vibe-coded/tree/main/Simple%20Keylogger', children: {} }
      }
    },
    '/classified': {
      type: 'folder',
      children: {
        'phase_1': { 
          type: 'folder',
          children: {
            'research_data': { 
              type: 'folder',
              children: {
                'neural_patterns.dat': { type: 'file', size: '890 MB' },
                'experimental_results.log': { type: 'file', size: '123 KB' }
              }
            },
            'blueprints': {
              type: 'folder',
              children: {
                'quantum_core_v2.dwg': { type: 'file', size: '45 MB' },
                'neural_interface_v3.dwg': { type: 'file', size: '67 MB' }
              }
            }
          }
        },
        'phase_2': { 
          type: 'folder',
          children: {
            'test_subjects': {
              type: 'folder',
              children: {
                'subject_alpha.dat': { type: 'file', size: '2.3 GB' },
                'subject_beta.dat': { type: 'file', size: '1.8 GB' }
              }
            },
            'observations': {
              type: 'folder',
              children: {
                'daily_reports': {
                  type: 'folder',
                  children: {
                    'report_001.txt': { type: 'file', size: '45 KB' },
                    'report_002.txt': { type: 'file', size: '52 KB' },
                    'report_003.txt': { type: 'file', size: '38 KB' }
                  }
                },
                'anomalies.log': { type: 'file', size: '789 KB' }
              }
            }
          }
        },
        'phase_3': { 
          type: 'folder',
          children: {
            'prototypes': {
              type: 'folder',
              children: {
                'mark_1': { type: 'folder', children: { 'specs.pdf': { type: 'file', size: '12 MB' } } },
                'mark_2': { type: 'folder', children: { 'specs.pdf': { type: 'file', size: '15 MB' } } }
              }
            },
            'classified_docs': {
              type: 'folder',
              children: {
                'top_secret_manifesto.docx': { type: 'file', size: '2.4 MB' },
                'operation_cascade.docx': { type: 'file', size: '3.1 MB' }
              }
            }
          }
        },
        'encrypted': { 
          type: 'folder',
          children: {
            'encrypted.dat': { type: 'file', size: '4.2 GB' },
            'backup_keys.enc': { type: 'file', size: '12 KB' },
            'master_key.enc': { type: 'file', size: '24 KB' }
          }
        }
      }
    },
    '/credentials': {
      type: 'folder',
      restricted: true,
      children: {
        'admin_passwords.txt': { type: 'file', size: '2 KB' },
        'api_keys.txt': { type: 'file', size: '5 KB' },
        'secret_docs': {
          type: 'folder',
          children: {
            'project_alpha.docx': { type: 'file', size: '1.2 MB' },
            'project_beta.docx': { type: 'file', size: '890 KB' }
          }
        }
      }
    }
  });
  const [draggedItem, setDraggedItem] = useState<{ name: string; fromPath: string } | null>(null);
  const [dragOverFolder, setDragOverFolder] = useState<string | null>(null);
  
  // File drag and drop state
  const terminalOutputRef = useRef<HTMLDivElement>(null);
  const terminalInputRef = useRef<HTMLInputElement>(null);
  const notesEditorRef = useRef<HTMLTextAreaElement>(null);
  const playbackControllerRef = useRef<{ abort: () => void } | null>(null);
  const timerInitializedRef = useRef(false);
  const aiMessagesRef = useRef<HTMLDivElement>(null);
  const [notesContent, setNotesContent] = useState('');
  const [calcDisplay, setCalcDisplay] = useState('0');
  const [calcExpression, setCalcExpression] = useState('');
  const [currentPath, setCurrentPath] = useState('/');
  const [terminalHistory, setTerminalHistory] = useState<string[]>([]);
  const [terminalHistoryIndex, setTerminalHistoryIndex] = useState(-1);
  const [currentTrack, setCurrentTrack] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [musicProgress, setMusicProgress] = useState(0);
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null);
  const [activeOscillators, setActiveOscillators] = useState<OscillatorNode[]>([]);
  const [cpu, setCpu] = useState(0);
  const [memory, setMemory] = useState(0);
  const [gpu, setGpu] = useState(0);
  const [network, setNetwork] = useState(0);
  const [notification, setNotification] = useState<{ title: string; body: string } | null>(null);
  const [draggedWindow, setDraggedWindow] = useState<any>(null);
  const [windowDragOffset, setWindowDragOffset] = useState({ x: 0, y: 0 });
  const [resizingWindow, setResizingWindow] = useState<any>(null);
  const [selectionBox, setSelectionBox] = useState<any>(null);
  const [settingsTab, setSettingsTab] = useState('appearance');
  const [masterVolume, setMasterVolume] = useState(75);
  const [soundEffectsEnabled, setSoundEffectsEnabled] = useState(true);
  const [ambientSoundEnabled, setAmbientSoundEnabled] = useState(false);
  const [activeTrayPanel, setActiveTrayPanel] = useState<string | null>(null);
  const [trayPanelPosition, setTrayPanelPosition] = useState({ x: 0, y: 0 });
  const [batteryLevel, setBatteryLevel] = useState(87);
  const [isCharging, setIsCharging] = useState(false);
  const [networkStatus, setNetworkStatus] = useState('connected');
  const [browserUrl, setBrowserUrl] = useState('https://www.wikipedia.org');
  const [browserHistory, setBrowserHistory] = useState<string[]>(['https://www.wikipedia.org']);
  const [browserHistoryIndex, setBrowserHistoryIndex] = useState(0);
  const [browserLoading, setBrowserLoading] = useState(false);
  const [cursorStyle, setCursorStyle] = useState('cyberpunk');

  const themes: any = {
    cyberpunk: { primary: '#00f0ff', secondary: '#ff00ff', accent: '#ffff00', bg: '#0a0a1a' },
    matrix: { primary: '#00ff00', secondary: '#008800', accent: '#00ff00', bg: '#000a00' },
    holographic: { primary: '#00aaff', secondary: '#0066ff', accent: '#00ffff', bg: '#0a0a1a' },
    retro: { primary: '#00ff00', secondary: '#ffff00', accent: '#ff0000', bg: '#001100' },
    minimal: { primary: '#ffffff', secondary: '#888888', accent: '#cccccc', bg: '#1a1a1a' },
    tactical: { primary: '#ff6600', secondary: '#ffaa00', accent: '#ff0000', bg: '#0f0a05' }
  };

  const wallpapers: any = {
    cyberpunk: {
      name: 'Cyberpunk Neon',
      background: 'linear-gradient(135deg, #0a0a1a 0%, #1a0a2a 50%, #0a1a2a 100%)',
      effects: 'radial-gradient(circle at 20% 80%, rgba(0, 240, 255, 0.1) 0%, transparent 40%), radial-gradient(circle at 80% 20%, rgba(255, 0, 255, 0.1) 0%, transparent 40%)',
      animation: 'bgPulse 8s ease-in-out infinite'
    },
    matrix: {
      name: 'Matrix Rain',
      background: 'linear-gradient(180deg, #000a00 0%, #001a00 50%, #000a00 100%)',
      effects: 'radial-gradient(circle at 50% 50%, rgba(0, 255, 0, 0.05) 0%, transparent 50%)',
      animation: 'matrixPulse 4s ease-in-out infinite'
    },
    holographic: {
      name: 'Holographic Grid',
      background: 'linear-gradient(135deg, #0a0a2a 0%, #1a0a3a 50%, #0a2a3a 100%)',
      effects: 'radial-gradient(circle at 30% 70%, rgba(0, 170, 255, 0.15) 0%, transparent 50%), radial-gradient(circle at 70% 30%, rgba(0, 102, 255, 0.15) 0%, transparent 50%)',
      animation: 'hologramPulse 6s ease-in-out infinite'
    },
    deepspace: {
      name: 'Deep Space',
      background: 'linear-gradient(180deg, #0a0000 0%, #0a0a1a 30%, #000a1a 70%, #00000a 100%)',
      effects: 'radial-gradient(circle at 50% 50%, rgba(100, 100, 255, 0.1) 0%, transparent 70%), radial-gradient(circle at 20% 80%, rgba(150, 0, 255, 0.1) 0%, transparent 40%)',
      animation: 'spacePulse 10s ease-in-out infinite'
    },
    digitalsunset: {
      name: 'Digital Sunset',
      background: 'linear-gradient(180deg, #1a0a2a 0%, #2a1a0a 40%, #0a1a2a 100%)',
      effects: 'radial-gradient(circle at 50% 100%, rgba(255, 100, 0, 0.2) 0%, transparent 60%), radial-gradient(circle at 30% 70%, rgba(255, 0, 150, 0.15) 0%, transparent 50%)',
      animation: 'sunsetPulse 8s ease-in-out infinite'
    }
  };

  const cursorStyles: any = {
    cyberpunk: {
      name: 'Cyberpunk Neon',
      cursor: "url('data:image/svg+xml;utf8,<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"32\" height=\"32\" viewBox=\"0 0 32 32\"><polygon points=\"8,0 12,12 0,8\" fill=\"%2300f0ff\"/><polygon points=\"12,12 8,0 14,14\" fill=\"%23ff00ff\" opacity=\"0.7\"/></svg>') 0 0, auto",
      pointer: "url('data:image/svg+xml;utf8,<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"32\" height=\"32\" viewBox=\"0 0 32 32\"><polygon points=\"8,0 12,12 0,8\" fill=\"%2300f0ff\"/><circle cx=\"16\" cy=\"16\" r=\"4\" fill=\"%23ff00ff\" opacity=\"0.7\"/></svg>') 0 0, pointer"
    },
    matrix: {
      name: 'Matrix Code',
      cursor: "url('data:image/svg+xml;utf8,<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"32\" height=\"32\" viewBox=\"0 0 32 32\"><text x=\"0\" y=\"24\" font-family=\"monospace\" font-size=\"24\" fill=\"%2300ff00\">></text></svg>') 0 24, auto",
      pointer: "url('data:image/svg+xml;utf8,<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"32\" height=\"32\" viewBox=\"0 0 32 32\"><text x=\"0\" y=\"24\" font-family=\"monospace\" font-size=\"24\" fill=\"%2300ff00\">❯</text></svg>') 0 24, pointer"
    },
    holographic: {
      name: 'Holographic',
      cursor: "url('data:image/svg+xml;utf8,<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"32\" height=\"32\" viewBox=\"0 0 32 32\"><polygon points=\"0,0 16,16 0,16\" fill=\"%2300aaff\" opacity=\"0.9\"/><polygon points=\"16,16 32,32 32,16\" fill=\"%2300ffff\" opacity=\"0.7\"/></svg>') 0 0, auto",
      pointer: "url('data:image/svg+xml;utf8,<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"32\" height=\"32\" viewBox=\"0 0 32 32\"><circle cx=\"12\" cy=\"12\" r=\"10\" stroke=\"%2300aaff\" stroke-width=\"2\" fill=\"none\"/><circle cx=\"12\" cy=\"12\" r=\"4\" fill=\"%2300ffff\" opacity=\"0.8\"/></svg>') 12 12, pointer"
    },
    retro: {
      name: 'Retro Pixel',
      cursor: "url('data:image/svg+xml;utf8,<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"24\" height=\"24\" viewBox=\"0 0 24 24\"><rect x=\"0\" y=\"0\" width=\"6\" height=\"6\" fill=\"%2300ff00\"/><rect x=\"6\" y=\"0\" width=\"6\" height=\"6\" fill=\"%23ffff00\"/><rect x=\"0\" y=\"6\" width=\"6\" height=\"6\" fill=\"%2300ff00\"/><rect x=\"6\" y=\"6\" width=\"6\" height=\"6\" fill=\"%2300ff00\"/></svg>') 0 0, auto",
      pointer: "url('data:image/svg+xml;utf8,<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"24\" height=\"24\" viewBox=\"0 0 24 24\"><rect x=\"6\" y=\"6\" width=\"12\" height=\"12\" fill=\"none\" stroke=\"%2300ff00\" stroke-width=\"2\"/><rect x=\"10\" y=\"10\" width=\"4\" height=\"4\" fill=\"%23ffff00\"/></svg>') 12 12, pointer"
    },
    tactical: {
      name: 'Tactical Crosshair',
      cursor: "url('data:image/svg+xml;utf8,<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"32\" height=\"32\" viewBox=\"0 0 32 32\"><line x1=\"16\" y1=\"0\" x2=\"16\" y2=\"12\" stroke=\"%23ff6600\" stroke-width=\"2\"/><line x1=\"16\" y1=\"20\" x2=\"16\" y2=\"32\" stroke=\"%23ff6600\" stroke-width=\"2\"/><line x1=\"0\" y1=\"16\" x2=\"12\" y2=\"16\" stroke=\"%23ff6600\" stroke-width=\"2\"/><line x1=\"20\" y1=\"16\" x2=\"32\" y2=\"16\" stroke=\"%23ff6600\" stroke-width=\"2\"/><circle cx=\"16\" cy=\"16\" r=\"3\" fill=\"none\" stroke=\"%23ff6600\" stroke-width=\"2\"/></svg>') 16 16, crosshair",
      pointer: "url('data:image/svg+xml;utf8,<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"32\" height=\"32\" viewBox=\"0 0 32 32\"><line x1=\"16\" y1=\"0\" x2=\"16\" y2=\"12\" stroke=\"%23ff0000\" stroke-width=\"2\"/><line x1=\"16\" y1=\"20\" x2=\"16\" y2=\"32\" stroke=\"%23ff0000\" stroke-width=\"2\"/><line x1=\"0\" y1=\"16\" x2=\"12\" y2=\"16\" stroke=\"%23ff0000\" stroke-width=\"2\"/><line x1=\"20\" y1=\"16\" x2=\"32\" y2=\"16\" stroke=\"%23ff0000\" stroke-width=\"2\"/><circle cx=\"16\" cy=\"16\" r=\"3\" fill=\"%23ff0000\"/></svg>') 16 16, pointer"
    },
    minimal: {
      name: 'Minimal',
      cursor: 'default',
      pointer: 'pointer'
    }
  };

  const apps = [
    { id: 'terminal', name: 'Terminal', icon: '⌨️', color: '#00ff00', width: 700, height: 450 },
    { id: 'files', name: 'File Explorer', icon: '📁', color: '#ffcc00', width: 800, height: 500 },
    { id: 'notes', name: 'Notes', icon: '📝', color: '#00f0ff', width: 500, height: 400 },
    { id: 'calculator', name: 'Calculator', icon: '🧮', color: '#ff00ff', width: 320, height: 450 },
    { id: 'music', name: 'Music Player', icon: '🎵', color: '#ff6600', width: 400, height: 500 },
    { id: 'settings', name: 'Settings', icon: '⚙️', color: '#808080', width: 700, height: 500 },
    { id: 'monitor', name: 'System Monitor', icon: '📊', color: '#00ff88', width: 600, height: 450 },
    { id: 'browser', name: 'Web Browser', icon: '🌐', color: '#0088ff', width: 900, height: 600 },
    { id: 'game-rps', name: 'Rock Paper Scissors', icon: '✊', color: '#ff4444', width: 400, height: 500 },
    { id: 'game-rps-v2', name: 'RPS V2', icon: '🎮', color: '#44ff44', width: 400, height: 500 }
  ];

  const playlist = [
    { title: 'Neon Dreams', artist: 'Cyber Collective', duration: '3:45' },
    { title: 'Digital Rain', artist: 'Matrix Sounds', duration: '4:12' },
    { title: 'Quantum Pulse', artist: 'Neural Beat', duration: '3:28' },
    { title: 'Holographic Night', artist: 'Future Wave', duration: '4:56' },
    { title: 'Electric Soul', artist: 'Synth Masters', duration: '3:33' },
    { title: 'Midnight Circuit', artist: 'Binary Flow', duration: '4:02' },
    { title: 'Cyber Chrome', artist: 'Neon Horizon', duration: '3:51' },
    { title: 'Neural Network', artist: 'Data Stream', duration: '5:15' },
    { title: 'Virtual Reality', artist: 'Digital Dreams', duration: '3:44' },
    { title: 'Starlight Echo', artist: 'Cosmic Frequencies', duration: '4:28' },
    { title: 'System Override', artist: 'Hack The Planet', duration: '3:37' },
    { title: 'Plasma Core', artist: 'Fusion Reactor', duration: '4:19' },
    { title: 'Binary Sunset', artist: 'Code Breakers', duration: '3:56' },
    { title: 'Neural Link', artist: 'Mind Interface', duration: '4:33' },
    { title: 'Cyber City', artist: 'Urban Grid', duration: '3:42' },
    { title: 'Quantum Entanglement', artist: 'Particle Wave', duration: '5:02' },
    { title: 'Digital Frontier', artist: 'Tech Nova', duration: '4:07' },
    { title: 'Synthwave Paradise', artist: 'Retro Future', duration: '3:58' },
    { title: 'Data Ghost', artist: 'Memory Lane', duration: '4:21' },
    { title: 'Electric Dreams', artist: 'Voltage Pulse', duration: '3:29' }
  ];

  const [bootProgress, setBootProgress] = useState(0);
  const [bootLogs, setBootLogsState] = useState<any[]>([]);
  const [wallpaper, setWallpaper] = useState('cyberpunk');

  useEffect(() => {
    // Load saved theme, wallpaper and notes
    const savedTheme = localStorage.getItem('nexus-theme');
    if (savedTheme && themes[savedTheme]) {
      setTheme(savedTheme);
    }

    const savedWallpaper = localStorage.getItem('nexus-wallpaper');
    if (savedWallpaper && wallpapers[savedWallpaper]) {
      setWallpaper(savedWallpaper);
    }

    const savedNotes = localStorage.getItem('nexus-notes');
    if (savedNotes) {
      setNotesContent(savedNotes);
    }

    const savedCursor = localStorage.getItem('nexus-cursor');
    if (savedCursor && cursorStyles[savedCursor]) {
      setCursorStyle(savedCursor);
    }

    // Load saved icon positions
    const savedIconPositions = localStorage.getItem('nexus-icon-positions');
    if (savedIconPositions) {
      // Load positions as-is, allowing overlap (user has full control)
      setIconPositions(JSON.parse(savedIconPositions));
    }

    // Run boot sequence
    runBootSequence();
  }, []);

  const runBootSequence = async () => {
    const logs = [
      { text: '[ BIOS ] NEXUS-7 BIOS v4.2.1', type: 'info' },
      { text: '[ OK ] Memory Test: 64 TB PASSED', type: 'ok' },
      { text: '[ OK ] CPU: Quantum Core i9 @ 128 THz', type: 'ok' },
      { text: '[ OK ] Neural Interface: Connected', type: 'ok' },
      { text: '[ OK ] Initializing quantum encryption...', type: 'ok' },
      { text: '[ OK ] Loading kernel modules...', type: 'ok' },
      { text: '[ INFO ] Mounting virtual filesystem...', type: 'info' },
      { text: '[ OK ] /system mounted', type: 'ok' },
      { text: '[ OK ] /users mounted', type: 'ok' },
      { text: '[ OK ] /logs mounted', type: 'ok' },
      { text: '[ OK ] Starting network services...', type: 'ok' },
      { text: '[ INFO ] Connecting to neural net...', type: 'info' },
      { text: '[ OK ] Neural link established', type: 'ok' },
      { text: '[ OK ] Initializing display subsystem...', type: 'ok' },
      { text: '[ OK ] Loading desktop environment...', type: 'ok' },
      { text: '[ OK ] Starting window manager...', type: 'ok' },
      { text: '[ OK ] Loading system services...', type: 'ok' },
      { text: '[ OK ] Audio subsystem: Ready', type: 'ok' },
      { text: '[ OK ] Security protocols: Active', type: 'ok' },
      { text: '[ INFO ] Loading user preferences...', type: 'info' },
      { text: '[ OK ] Theme: Cyberpunk Neon loaded', type: 'ok' },
      { text: '[ OK ] Wallpaper: Animated loaded', type: 'ok' },
      { text: '[ OK ] Starting background services...', type: 'ok' },
      { text: '[ OK ] AI Assistant: Online', type: 'ok' },
      { text: '[ OK ] System Monitor: Active', type: 'ok' },
      { text: '[ ONLINE ] Mission Control Ready', type: 'success' }
    ];

    for (let i = 0; i < logs.length; i++) {
      setBootLogsState(prev => [...prev, logs[i]]);
      setBootProgress(((i + 1) / logs.length) * 100);
      await new Promise(resolve => setTimeout(resolve, Math.random() * 200 + 100));
    }

    await new Promise(resolve => setTimeout(resolve, 500));
    setBootComplete(true);
    setShowLogin(true);
  };

  const handleLogin = () => {
    const user = users.find(u => u.id === selectedUser);
    const password = loginPassword;

    if (user.id === 'Tinku') {
      // Tinku - no password required
      setCurrentUser('Tinku');
      setIsLoggedIn(true);
      setShowLogin(false);
      showNotification('Welcome, Tinku!', 'Access granted. Some folders may be restricted.');
    } else if (user.id === 'admin') {
      // Admin - requires password
      if (password === 'admin123') {
        setCurrentUser('Admin');
        setIsLoggedIn(true);
        setShowLogin(false);
        showNotification('Welcome, Admin!', 'Full system access granted.');
      } else {
        setLoginError('Invalid password for admin');
      }
    }
  };

  const handleLoginKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleLogin();
    }
  };

  const showNotification = (title: string, body: string) => {
    setNotification({ title, body });
    setTimeout(() => setNotification(null), 5000);
  };

  const handleShutdown = () => {
    showNotification('Shutting Down', 'NEXUS-7 OS is shutting down...');
    setTimeout(() => {
      globalThis.location.reload();
    }, 2000);
  };

  const handleAiSend = async () => {
    const message = aiInput.trim().toLowerCase();
    if (!message || aiLoading) return;

    // Add user message
    const newMessages = [...aiMessages, { role: 'user' as const, content: aiInput }];
    setAiMessages(newMessages);
    setAiInput('');
    setAiLoading(true);

    // Simulate AI thinking delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Simple rule-based responses
    let response = '';

    if (message.includes('hello') || message.includes('hi') || message.includes('hey')) {
      response = 'Hello, Operator! How can I assist you with your NEXUS-7 system today?';
    } else if (message.includes('how are you')) {
      response = 'I\'m functioning at optimal capacity, Operator! All systems are running smoothly. How can I help you?';
    } else if (message.includes('what can you do') || message.includes('help')) {
      response = 'I can help you with:\n• System information and status\n• File management\n• Application guidance\n• General assistance\n\nJust ask away!';
    } else if (message.includes('time') || message.includes('date')) {
      response = `Current system time: ${new Date().toLocaleString()}`;
    } else if (message.includes('weather')) {
      response = `The weather in ${weatherData.location} is currently ${weatherData.temperature}°C with ${weatherData.condition.replace(/[^\w\s]/g, '').trim()} conditions. Perfect weather for system operations!`;
    } else if (message.includes('thanks') || message.includes('thank you')) {
      response = 'You\'re welcome, Operator! I\'m always here to assist you.';
    } else if (message.includes('bye') || message.includes('goodbye')) {
      response = 'Goodbye, Operator! Stay safe and have a productive day in the NEXUS-7 system.';
    } else if (message.includes('who are you') || message.includes('what are you')) {
      response = 'I\'m NEXUS, your AI assistant for the NEXUS-7 operating system. I\'m here to help you navigate and manage your system efficiently.';
    } else if (message.includes('status') || message.includes('system')) {
      response = 'System Status:\n• OS: NEXUS-7 v2.4.1\n• Status: Online\n• CPU: Normal\n• Memory: Optimal\n• Network: Connected';
    } else if (message.includes('open')) {
      response = 'To open applications, you can:\n• Double-click desktop icons\n• Use the Start Menu\n• Right-click on desktop for options\n\nWhich application would you like to open?';
    } else if (message.includes('file') || message.includes('folder')) {
      response = 'You can manage files using the File Explorer application. Double-click the 📁 File Explorer icon on your desktop to get started.';
    } else if (message.includes('terminal') || message.includes('command')) {
      response = 'The Terminal allows you to execute system commands. Double-click the ⌨️ Terminal icon to open it. Type "help" to see available commands.';
    } else if (message.includes('music') || message.includes('audio')) {
      response = 'You can use the Music Player application to play audio files. Double-click the 🎵 Music Player icon on your desktop.';
    } else if (message.includes('game')) {
      response = 'We have two games available:\n• Rock Paper Scissors (✊)\n• RPS V2 (🎮)\n\nDouble-click the game icons on your desktop to play!';
    } else if (message.includes('shutdown') || message.includes('restart')) {
      response = 'To shutdown the system, use the ⏻ Shutdown button in the Start Menu (bottom left corner). This will reload the NEXUS-7 OS.';
    } else {
      response = 'I understand you said: "' + aiInput + '". I\'m a basic AI assistant and can help with system information, navigation, and general assistance. Try asking me about:\n• System status\n• Opening applications\n• Current time\n• Available features';
    }

    // Add AI response
    setAiMessages([...newMessages, { role: 'assistant' as const, content: response }]);
    setAiLoading(false);
  };

  const handleAiKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleAiSend();
    }
  };

  // Auto-scroll AI messages to bottom
  useEffect(() => {
    if (aiMessagesRef.current) {
      aiMessagesRef.current.scrollTop = aiMessagesRef.current.scrollHeight;
    }
  }, [aiMessages, aiLoading]);

  const openWindow = (appId: string) => {
    const existing = windows.find(w => w.id === appId);
    if (existing) {
      if (minimizedWindows.includes(appId)) {
        setMinimizedWindows(prev => prev.filter(id => id !== appId));
      }
      setActiveWindow(appId);
      setWindowZIndex(prev => prev + 1);
      return;
    }

    const app = apps.find(a => a.id === appId);
    if (!app) return;

    const newWindow = {
      ...app,
      zIndex: windowZIndex + 1,
      x: 100 + windows.length * 30,
      y: 50 + windows.length * 30
    };

    setWindows(prev => [...prev, newWindow]);
    setActiveWindow(appId);
    setWindowZIndex(prev => prev + 1);
  };

  const closeWindow = (appId: string) => {
    setWindows(prev => prev.filter(w => w.id !== appId));
    setMinimizedWindows(prev => prev.filter(id => id !== appId));
    if (activeWindow === appId) {
      setActiveWindow(windows.length > 1 ? windows[windows.length - 2]?.id || null : null);
    }
  };

  const minimizeWindow = (appId: string) => {
    setMinimizedWindows(prev => [...prev, appId]);
  };

  const maximizeWindow = (appId: string) => {
    setWindows(prev => prev.map(w => 
      w.id === appId ? { ...w, maximized: !w.maximized } : w
    ));
  };

  // Window drag handlers
  const handleWindowMouseDown = (e: React.MouseEvent, windowId: string) => {
    // Don't drag if window is maximized
    const window = windows.find(w => w.id === windowId);
    if (window && window.maximized) return;

    // Prevent dragging when clicking on window controls
    if ((e.target as HTMLElement).closest('.window-control')) return;

    e.preventDefault();
    e.stopPropagation();

    setDraggedWindow(windowId);
    setWindowDragOffset({
      x: e.clientX - (window?.x || 0),
      y: e.clientY - (window?.y || 0)
    });

    // Set window as active
    if (activeWindow !== windowId) {
      setActiveWindow(windowId);
      setWindowZIndex(prev => prev + 1);
      setWindows(prev => prev.map(w => 
        w.id === windowId ? { ...w, zIndex: windowZIndex + 1 } : w
      ));
    }
  };

  useEffect(() => {
    if (draggedWindow) {
      const handleWindowMouseMove = (e: MouseEvent) => {
        const desktop = document.getElementById('desktop');
        if (!desktop) return;

        const desktopRect = desktop.getBoundingClientRect();
        let newX = e.clientX - windowDragOffset.x;
        let newY = e.clientY - windowDragOffset.y;

        // Get window dimensions for constraints
        const window = windows.find(w => w.id === draggedWindow);
        const windowWidth = window?.width || 400;
        const windowHeight = window?.height || 300;
        const taskbarHeight = 72;
        const headerHeight = 40;

        // Constrain window to desktop bounds (allow header to be at top)
        newX = Math.max(0, Math.min(newX, desktopRect.width - windowWidth));
        newY = Math.max(0, Math.min(newY, desktopRect.height - taskbarHeight - windowHeight + headerHeight));

        setWindows(prev => prev.map(w => 
          w.id === draggedWindow ? { ...w, x: newX, y: newY } : w
        ));
      };

      const handleWindowMouseUp = () => {
        setDraggedWindow(null);
        setWindowDragOffset({ x: 0, y: 0 });
      };

      document.addEventListener('mousemove', handleWindowMouseMove);
      document.addEventListener('mouseup', handleWindowMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleWindowMouseMove);
        document.removeEventListener('mouseup', handleWindowMouseUp);
      };
    }
  }, [draggedWindow, windowDragOffset, windows, windowZIndex, activeWindow]);

  const handleTerminalInput = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      const input = e.currentTarget;
      const command = input.value.trim();
      if (command) {
        setTerminalHistory(prev => [...prev, command]);
        setTerminalHistoryIndex(terminalHistory.length + 1);
        executeCommand(command);
        input.value = '';
      }
    } else if (e.key === 'ArrowUp' && terminalHistoryIndex > 0) {
      e.preventDefault();
      const newIndex = terminalHistoryIndex - 1;
      setTerminalHistoryIndex(newIndex);
      e.currentTarget.value = terminalHistory[newIndex];
    }
  };

  const executeCommand = (command: string) => {
    const parts = command.split(' ');
    const cmd = parts[0].toLowerCase();
    const args = parts.slice(1);

    let result = '';
    const output = terminalOutputRef.current;

    switch (cmd) {
      case 'help':
        result = `Available commands:
  help      - Show this help message
  sysinfo   - Display system information
  matrix    - Activate Matrix mode
  scan      - Run network scan
  clear     - Clear terminal
  diagnostics - Run system diagnostics
  ai        - Talk to AI assistant
  files     - List files
  date      - Show current date/time
  whoami    - Show current user
  neofetch  - Display system info with ASCII art`;
        break;
      case 'sysinfo':
        result = `System Information:
  OS: NEXUS-7 v2.4.1
  Kernel: Quantum 5.18.0
  CPU: Quantum Core i9 @ 128 THz
  Memory: 64 TB Quantum RAM
  Storage: 1 PB Neural SSD
  Network: Neural Link v4
  Uptime: ${Math.floor(Math.random() * 100)} hours`;
        break;
      case 'matrix':
        result = 'Entering Matrix mode...\n[ Matrix visualization would appear here ]';
        setTheme('matrix');
        localStorage.setItem('nexus-theme', 'matrix');
        break;
      case 'scan':
        result = 'Scanning network...\n';
        for (let i = 0; i < 5; i++) {
          result += `  [${'█'.repeat(i + 1)}${'░'.repeat(4 - i)}] Scanning sector ${i + 1}...\n`;
          result += `    Found ${Math.floor(Math.random() * 10)} devices\n`;
        }
        result += '\nScan complete. No threats detected.';
        break;
      case 'clear':
        if (output) output.innerHTML = '';
        return;
      case 'diagnostics':
        result = 'Running system diagnostics...\n\n  [████████░░] CPU Test... PASSED\n  [████████░░] Memory Test... PASSED\n  [████████░░] Neural Interface... PASSED\n  [████████░░] Quantum Coherence... PASSED\n  [████████░░] Security Protocols... ACTIVE\n\nAll systems nominal.';
        break;
      case 'ai':
        setAiVisible(true);
        result = 'AI Assistant panel opened.';
        break;
      case 'files':
        result = 'Opening File Explorer...';
        setTimeout(() => openWindow('files'), 500);
        break;
      case 'date':
        result = new Date().toString();
        break;
      case 'whoami':
        result = 'operator';
        break;
      case 'neofetch':
        result = `        ▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄
        █  operator@nexus-7  █
        █  ----------------  █
        █  OS: NEXUS-7 2.4.1 █
        █  Kernel: Quantum   █
        █  CPU: 128 THz      █
        █  RAM: 64 TB        █
        █                    █
        ▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀`;
        break;
      default:
        result = `Command not found: ${cmd}\nType 'help' for available commands.`;
    }

    if (output) {
      const cmdLine = document.createElement('div');
      cmdLine.className = 'terminal-line command';
      cmdLine.textContent = `operator@nexus:~$ ${command}`;
      output.appendChild(cmdLine);

      const resultLine = document.createElement('div');
      resultLine.className = 'terminal-line';
      resultLine.innerHTML = result.replace(/\n/g, '<br>');
      output.appendChild(resultLine);
      output.scrollTop = output.scrollHeight;
    }
  };

  const handleCalcInput = (value: string) => {
    if (calcDisplay === '0' && !isNaN(Number(value))) {
      setCalcDisplay(value);
    } else {
      setCalcDisplay(calcDisplay + value);
    }
  };

  const handleCalcClear = () => {
    setCalcDisplay('0');
    setCalcExpression('');
  };

  const handleCalcEquals = () => {
    try {
      setCalcExpression(calcDisplay);
      const result = eval(calcDisplay);
      setCalcDisplay(String(result));
    } catch (e) {
      setCalcDisplay('Error');
    }
  };

  const handleCalcBackspace = () => {
    setCalcDisplay(calcDisplay.slice(0, -1) || '0');
  };

  const handleNotesChange = (value: string) => {
    setNotesContent(value);
    localStorage.setItem('nexus-notes', value);
  };

  const navigateToPath = (path: string) => {
    // Check if trying to access credentials folder and user is Tinku
    if (path === '/credentials' || path.startsWith('/credentials/')) {
      if (currentUser === 'Tinku') {
        showNotification('Access Denied', 'You do not have permission to access the Credentials folder. Contact Admin for access.');
        return;
      }
    }
    setCurrentPath(path);
  };

  const handleThemeChange = (newTheme: string) => {
    setTheme(newTheme);
    localStorage.setItem('nexus-theme', newTheme);
  };

  const handleWallpaperChange = (newWallpaper: string) => {
    setWallpaper(newWallpaper);
    localStorage.setItem('nexus-wallpaper', newWallpaper);
  };

  const handleCursorChange = (newCursor: string) => {
    setCursorStyle(newCursor);
    localStorage.setItem('nexus-cursor', newCursor);
  };

  // Audio playback functions
  const initAudioContext = () => {
    if (!audioContext) {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      setAudioContext(ctx);
      return ctx;
    }
    return audioContext;
  };

  const playTone = (frequency: number, duration: number, volume: number = 0.3) => {
    const ctx = initAudioContext();
    if (ctx.state === 'suspended') {
      ctx.resume();
    }

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.type = 'sine';
    osc.frequency.setValueAtTime(frequency, ctx.currentTime);
    
    gain.gain.setValueAtTime(volume * (masterVolume / 100), ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);

    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + duration);

    return osc;
  };

  const stopMusic = () => {
    // Stop all active oscillators
    activeOscillators.forEach(osc => {
      try {
        osc.stop();
      } catch (e) {
        // Oscillator already stopped
      }
    });
    setActiveOscillators([]);
    
    // Abort the playback controller
    if (playbackControllerRef.current) {
      playbackControllerRef.current.abort();
      playbackControllerRef.current = null;
    }
  };

  const playMusic = () => {
    if (!soundEffectsEnabled || !soundEnabled) return;
    
    const track = playlist[currentTrack];
    const trackIndex = currentTrack;
    
    // Create an abort controller for this playback session
    const controller = new AbortController();
    playbackControllerRef.current = controller;
    
    // Different instrument types for variety
    const instrumentTypes = ['sine', 'square', 'sawtooth', 'triangle'];
    const waveType = instrumentTypes[trackIndex % instrumentTypes.length];
    
    // Different scales/modes for different tracks
    const scales = [
      [261.63, 293.66, 329.63, 349.23, 392.00, 440.00, 493.88, 523.25], // C Major
      [293.66, 329.63, 392.00, 440.00, 523.25, 587.33, 659.25, 698.46], // D Major
      [329.63, 369.99, 415.30, 493.88, 554.37, 659.25, 739.99, 830.61], // E Minor
      [349.23, 392.00, 440.00, 523.25, 587.33, 698.46, 783.99, 880.00], // F Major
      [392.00, 440.00, 493.88, 587.33, 659.25, 783.99, 880.00, 987.77], // G Major
    ];
    const scale = scales[trackIndex % scales.length];
    
    // Create musical patterns
    const patterns = [
      // Simple melody
      scale.map(freq => ({ freq, dur: 0.3 })),
      // Arpeggio pattern
      [0, 2, 4, 7, 4, 2, 0].map(i => ({ freq: scale[i % scale.length], dur: 0.2 })),
      // Rising sequence
      scale.map((freq, i) => ({ freq, dur: 0.25 })),
      // Descending sequence
      [...scale].reverse().map((freq, i) => ({ freq, dur: 0.25 })),
      // Random melody
      Array(8).fill(null).map(() => ({ freq: scale[Math.floor(Math.random() * scale.length)], dur: 0.2 + Math.random() * 0.2 })),
    ];
    const pattern = patterns[trackIndex % patterns.length];

    const playPattern = async () => {
      const ctx = initAudioContext();
      if (ctx.state === 'suspended') {
        await ctx.resume();
      }

      // Add reverb effect
      const convolver = ctx.createConvolver();
      const reverbTime = 2 + Math.random();
      const sampleRate = ctx.sampleRate;
      const length = sampleRate * reverbTime;
      const impulse = ctx.createBuffer(2, length, sampleRate);
      
      for (let channel = 0; channel < 2; channel++) {
        const channelData = impulse.getChannelData(channel);
        for (let i = 0; i < length; i++) {
          channelData[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / length, 2);
        }
      }
      convolver.buffer = impulse;

      // Create master gain
      const masterGain = ctx.createGain();
      masterGain.connect(convolver);
      convolver.connect(ctx.destination);
      masterGain.connect(ctx.destination);
      
      masterGain.gain.setValueAtTime(0, ctx.currentTime);
      masterGain.gain.linearRampToValueAtTime((masterVolume / 100) * 0.3, ctx.currentTime + 0.1);

      for (let i = 0; i < 100; i++) {
        if (controller.signal.aborted || !isPlaying || currentTrack !== trackIndex) {
          break;
        }
        
        for (const note of pattern) {
          if (controller.signal.aborted || !isPlaying || currentTrack !== trackIndex) {
            break;
          }
          
          // Main oscillator
          const osc = ctx.createOscillator();
          const oscGain = ctx.createGain();
          
          osc.connect(oscGain);
          oscGain.connect(masterGain);
          
          osc.type = waveType;
          osc.frequency.setValueAtTime(note.freq, ctx.currentTime);
          
          // Add slight frequency modulation for vibrato
          const vibrato = ctx.createOscillator();
          const vibratoGain = ctx.createGain();
          vibrato.frequency.setValueAtTime(5 + Math.random() * 3, ctx.currentTime);
          vibratoGain.gain.setValueAtTime(note.freq * 0.01, ctx.currentTime);
          vibrato.connect(vibratoGain);
          vibratoGain.connect(osc.frequency);
          vibrato.start(ctx.currentTime);
          vibrato.stop(ctx.currentTime + note.dur);
          
          const volume = (soundEffectsEnabled && soundEnabled) ? 0.15 : 0;
          oscGain.gain.setValueAtTime(0, ctx.currentTime);
          oscGain.gain.linearRampToValueAtTime(volume, ctx.currentTime + 0.02);
          oscGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + note.dur);
          
          osc.start(ctx.currentTime);
          osc.stop(ctx.currentTime + note.dur);
          
          // Track oscillators
          setActiveOscillators(prev => [...prev, osc, vibrato]);
          
          // Clean up
          setTimeout(() => {
            setActiveOscillators(prev => prev.filter(o => o !== osc && o !== vibrato));
          }, note.dur * 1000 + 100);
          
          try {
            await new Promise((resolve, reject) => {
              const timeout = setTimeout(resolve, note.dur * 1000);
              controller.signal.addEventListener('abort', () => {
                clearTimeout(timeout);
                reject(new Error('Aborted'));
              });
            });
          } catch (e) {
            break;
          }
        }
        
        // Small pause between pattern repetitions
        try {
          await new Promise((resolve, reject) => {
            const timeout = setTimeout(resolve, 300);
            controller.signal.addEventListener('abort', () => {
              clearTimeout(timeout);
              reject(new Error('Aborted'));
            });
          });
        } catch (e) {
          break;
        }
      }
    };

    playPattern();
  };

  const handlePlayPause = () => {
    if (isPlaying) {
      setIsPlaying(false);
      stopMusic();
    } else {
      setIsPlaying(true);
      playMusic();
    }
  };

  const handleTrackChange = (newIndex: number) => {
    setCurrentTrack(newIndex);
    setMusicProgress(0);
    if (isPlaying) {
      stopMusic();
      setTimeout(() => {
        setIsPlaying(true);
        playMusic();
      }, 100);
    }
  };

  const handleNextTrack = () => {
    handleTrackChange((currentTrack + 1) % playlist.length);
  };

  const handlePrevTrack = () => {
    handleTrackChange((currentTrack - 1 + playlist.length) % playlist.length);
  };

  const handleDesktopClick = (e: React.MouseEvent) => {
    // Check if clicking on desktop icons
    if ((e.target as HTMLElement).closest('.desktop-icon')) {
      return;
    }
    
    // Check if clicking on windows or other interactive elements
    if ((e.target as HTMLElement).closest('.window') ||
        (e.target as HTMLElement).closest('#taskbar') ||
        (e.target as HTMLElement).closest('#start-menu') ||
        (e.target as HTMLElement).closest('#context-menu') ||
        (e.target as HTMLElement).closest('#left-click-menu') ||
        (e.target as HTMLElement).closest('#icon-context-menu') ||
        (e.target as HTMLElement).closest('#ai-assistant') ||
        (e.target as HTMLElement).closest('.tray-panel')) {
      return;
    }
    
    // Close menus
    setContextMenuVisible(false);
    setLeftClickMenuVisible(false);
    setIconContextMenuVisible(false);
    setSelectedIcon(null);
    setActiveTrayPanel(null);

    // Show left-click menu
    setLeftClickMenuPosition({ x: e.clientX, y: e.clientY });
    setLeftClickMenuVisible(true);
  };

  const handleIconClick = (appId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedIcon(appId);
  };

  const handleIconDoubleClick = (appId: string) => {
    openWindow(appId);
    setSelectedIcon(null);
  };

  // Tray panel handlers
  const handleTrayIconClick = (panelType: string, e: React.MouseEvent) => {
    e.stopPropagation();

    if (activeTrayPanel === panelType) {
      setActiveTrayPanel(null);
    } else {
      const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
      setTrayPanelPosition({
        x: rect.left + rect.width / 2,
        y: rect.top
      });
      setActiveTrayPanel(panelType);
    }
  };

  // Browser navigation handlers
  const getProxyUrl = (url: string) => {
    return `/api/proxy?url=${encodeURIComponent(url)}`;
  };

  const handleBrowserNavigate = (url: string) => {
    // Open URL in new tab
    globalThis.open(url, '_blank', 'noopener,noreferrer');

    // Update URL display (but don't load in iframe)
    setBrowserUrl(url);

    // Update history
    const newHistory = browserHistory.slice(0, browserHistoryIndex + 1);
    newHistory.push(url);
    setBrowserHistory(newHistory);
    setBrowserHistoryIndex(newHistory.length - 1);
  };

  const handleBrowserBack = () => {
    if (browserHistoryIndex > 0) {
      const newIndex = browserHistoryIndex - 1;
      setBrowserHistoryIndex(newIndex);
      const url = browserHistory[newIndex];
      setBrowserUrl(url);
      globalThis.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  const handleBrowserForward = () => {
    if (browserHistoryIndex < browserHistory.length - 1) {
      const newIndex = browserHistoryIndex + 1;
      setBrowserHistoryIndex(newIndex);
      const url = browserHistory[newIndex];
      setBrowserUrl(url);
      globalThis.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  const handleBrowserRefresh = () => {
    if (browserUrl) {
      globalThis.open(browserUrl, '_blank', 'noopener,noreferrer');
    }
  };

  const handleBrowserHome = () => {
    handleBrowserNavigate('https://www.wikipedia.org');
  };

  // Icon context menu handlers
  const handleIconContextMenu = (e: React.MouseEvent, iconId: string) => {
    e.preventDefault();
    e.stopPropagation();
    
    setIconContextMenuFor(iconId);
    setIconContextMenuPosition({ x: e.clientX, y: e.clientY });
    setIconContextMenuVisible(true);
    setSelectedIcon(iconId);
  };

  const handleIconMenuAction = (action: string, iconId: string) => {
    switch (action) {
      case 'open':
        openWindow(iconId);
        break;
      case 'resetPosition':
        // Reset to default position
        const index = apps.findIndex(app => app.id === iconId);
        const defaultPos = { x: 20, y: 20 + index * 100 };
        setIconPositions(prev => ({
          ...prev,
          [iconId]: defaultPos
        }));
        localStorage.setItem('nexus-icon-positions', JSON.stringify({
          ...iconPositions,
          [iconId]: defaultPos
        }));
        showNotification('Position Reset', `${apps.find(a => a.id === iconId)?.name} position has been reset`);
        break;
      case 'center':
        // Move to center of screen
        if (typeof window !== 'undefined') {
          const centerX = (window.innerWidth - 100) / 2;
          const centerY = (window.innerHeight - 100) / 2;
          setIconPositions(prev => {
            const updated = {
              ...prev,
              [iconId]: { x: centerX, y: centerY }
            };
            localStorage.setItem('nexus-icon-positions', JSON.stringify(updated));
            return updated;
          });
        }
        break;
      case 'properties':
        const app = apps.find(a => a.id === iconId);
        if (app) {
          showNotification('App Properties', `${app.name} | Size: ${app.width}x${app.height} | ID: ${app.id}`);
        }
        break;
      case 'hide':
        // Hide icon (move off-screen)
        setIconPositions(prev => ({
          ...prev,
          [iconId]: { x: -9999, y: -9999 }
        }));
        showNotification('Icon Hidden', `${apps.find(a => a.id === iconId)?.name} has been hidden. Reset position to show it again.`);
        break;
    }
    setIconContextMenuVisible(false);
    setIconContextMenuFor(null);
  };

  // Desktop icon drag handlers
  const handleIconMouseDown = (e: React.MouseEvent, iconId: string) => {
    e.preventDefault();
    const iconElement = e.currentTarget as HTMLElement;
    const rect = iconElement.getBoundingClientRect();
    
    setDraggingIcon(iconId);
    setDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
  };

  useEffect(() => {
    if (draggingIcon) {
      const onMouseMove = (e: MouseEvent) => {
        const desktop = document.getElementById('desktop');
        if (!desktop) return;

        const desktopRect = desktop.getBoundingClientRect();
        let newX = e.clientX - desktopRect.left - dragOffset.x;
        let newY = e.clientY - desktopRect.top - dragOffset.y;

        // Constrain to desktop bounds
        const iconWidth = 100;
        const iconHeight = 100;
        const taskbarHeight = 72;
        
        newX = Math.max(0, Math.min(newX, desktopRect.width - iconWidth));
        newY = Math.max(0, Math.min(newY, desktopRect.height - taskbarHeight - iconHeight));

        // During drag, just update position directly (no snap-to-grid, no collision check)
        // This makes movement smooth like Linux desktops
        setIconPositions(prev => ({
          ...prev,
          [draggingIcon]: { x: newX, y: newY }
        }));
      };

      const onMouseUp = () => {
        if (draggingIcon) {
          // On drop, just save the current position exactly where it was dropped
          // No snap-to-grid, no collision checking - stays exactly where user drops it
          setIconPositions(prev => {
            const updated = {
              ...prev,
              [draggingIcon]: prev[draggingIcon]
            };
            localStorage.setItem('nexus-icon-positions', JSON.stringify(updated));
            return updated;
          });
        }
        setDraggingIcon(null);
      };

      document.addEventListener('mousemove', onMouseMove);
      document.addEventListener('mouseup', onMouseUp);
      return () => {
        document.removeEventListener('mousemove', onMouseMove);
        document.removeEventListener('mouseup', onMouseUp);
      };
    }
  }, [draggingIcon, dragOffset]);

  // File drag and drop handlers
  const handleDragStart = (e: React.DragEvent, itemName: string, fromPath: string) => {
    e.dataTransfer.effectAllowed = 'move';
    setDraggedItem({ name: itemName, fromPath });
  };

  const handleDragOver = (e: React.DragEvent, targetPath: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverFolder(targetPath);
  };

  const handleDrop = (e: React.DragEvent, targetPath: string) => {
    e.preventDefault();
    
    if (!draggedItem) return;
    
    const { name, fromPath } = draggedItem;
    
    // Prevent dropping in the same location
    if (fromPath === targetPath) {
      setDraggedItem(null);
      return;
    }
    
    // Create a new filesystem with the item moved
    const newFilesystem = { ...filesystem };
    
    // Helper function to get folder from path
    const getFolder = (fs: any, path: string): any => {
      if (path === '/') return fs;
      const parts = path.split('/').filter(Boolean);
      let current = fs;
      // Navigate through the filesystem, looking for keys with slashes
      for (const part of parts) {
        // Try to find the folder with this name (keys may have slashes or not)
        const foundKey = Object.keys(current).find(key => key.replace(/^\//, '') === part);
        if (foundKey && current[foundKey] && current[foundKey].type === 'folder') {
          current = current[foundKey].children;
        } else {
          return null;
        }
      }
      return current;
    };
    
    // Get source and destination folders
    const sourceFolder = getFolder(newFilesystem, fromPath);
    const destFolder = getFolder(newFilesystem, targetPath);
    
    if (!sourceFolder || !destFolder) {
      setDraggedItem(null);
      return;
    }
    
    // Check if item exists in source
    if (!sourceFolder[name]) {
      setDraggedItem(null);
      return;
    }
    
    // Check if destination already has an item with the same name
    if (destFolder[name]) {
      showNotification('Move Failed', `An item named "${name}" already exists in the destination.`);
      setDraggedItem(null);
      return;
    }
    
    // Move the item
    destFolder[name] = { ...sourceFolder[name] };
    delete sourceFolder[name];
    
    // Update filesystem
    setFilesystem(newFilesystem);
    setDraggedItem(null);
    
    showNotification('File Moved', `"${name}" moved to ${targetPath}`);
    setDragOverFolder(null);
  };

  const handleDragEnd = () => {
    setDraggedItem(null);
    setDragOverFolder(null);
  };

  // Update music progress
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    
    if (isPlaying) {
      interval = setInterval(() => {
        setMusicProgress(prev => {
          const track = playlist[currentTrack];
          const [mins, secs] = track.duration.split(':').map(Number);
          const totalSeconds = mins * 60 + secs;
          const newProgress = prev + 1;
          
          if (newProgress >= totalSeconds) {
            // Use setTimeout to avoid calling setState during setState
            setTimeout(() => {
              setCurrentTrack((prevTrack) => (prevTrack + 1) % playlist.length);
              setMusicProgress(0);
            }, 0);
            return totalSeconds; // Return the max value temporarily
          }
          
          return newProgress;
        });
      }, 1000);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isPlaying, currentTrack]);

  // Cleanup audio on unmount
  useEffect(() => {
    return () => {
      // Stop all active oscillators
      activeOscillators.forEach(osc => {
        try {
          osc.stop();
        } catch (e) {
          // Oscillator already stopped
        }
      });
      
      // Abort the playback controller
      if (playbackControllerRef.current) {
        playbackControllerRef.current.abort();
        playbackControllerRef.current = null;
      }
      
      // Close audio context if it's not already closed
      if (audioContext && audioContext.state !== 'closed') {
        audioContext.close();
      }
    };
  }, []);

  // Close left-click menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('#left-click-menu') && !target.closest('.desktop-icon')) {
        setLeftClickMenuVisible(false);
      }
    };

    if (leftClickMenuVisible) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [leftClickMenuVisible]);

  // Close icon context menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('#icon-context-menu')) {
        setIconContextMenuVisible(false);
        setIconContextMenuFor(null);
      }
    };

    if (iconContextMenuVisible) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [iconContextMenuVisible]);

  const getCurrentTime = () => {
    const now = new Date();
    return {
      time: now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }),
      date: now.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    };
  };

  const [currentTime, setCurrentTime] = useState<{ time: string; date: string } | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    if (timerInitializedRef.current) return;
    timerInitializedRef.current = true;

    setMounted(true);
    setCurrentTime(getCurrentTime());
    const timer = setInterval(() => {
      setCurrentTime(getCurrentTime());
      // Update system monitor values
      setCpu(Math.floor(Math.random() * 60 + 20));
      setMemory(Math.floor(Math.random() * 40 + 30));
      setGpu(Math.floor(Math.random() * 50 + 10));
      setNetwork(Math.floor(Math.random() * 500 + 100));
    }, 1000);
    return () => {
      clearInterval(timer);
      timerInitializedRef.current = false;
    };
  }, []);

  // Battery tracking effect
  useEffect(() => {
    const initBattery = async () => {
      try {
        // Check if Battery API is supported
        if ('getBattery' in navigator) {
          const battery = await (navigator as any).getBattery();

          // Set initial values
          setBatteryLevel(Math.round(battery.level * 100));
          setIsCharging(battery.charging);

          // Listen for battery level changes
          const handleLevelChange = () => {
            setBatteryLevel(Math.round(battery.level * 100));
          };

          // Listen for charging status changes
          const handleChargingChange = () => {
            setIsCharging(battery.charging);
          };

          // Add event listeners
          battery.addEventListener('levelchange', handleLevelChange);
          battery.addEventListener('chargingchange', handleChargingChange);

          // Cleanup on unmount
          return () => {
            battery.removeEventListener('levelchange', handleLevelChange);
            battery.removeEventListener('chargingchange', handleChargingChange);
          };
        } else {
          // Battery API not supported, use simulated battery
          console.log('Battery API not supported, using simulated battery');
          setBatteryLevel(87);
          setIsCharging(false);
        }
      } catch (error) {
        console.error('Error accessing battery API:', error);
        // Fallback to simulated battery
        setBatteryLevel(87);
        setIsCharging(false);
      }
    };

    const cleanupPromise = initBattery();

    return () => {
      cleanupPromise.then(cleanup => {
        if (cleanup) cleanup();
      });
    };
  }, []);

  // Weather data fetching
  useEffect(() => {
    const fetchWeather = async () => {
      try {
        // Get user's location
        if ('geolocation' in navigator) {
          navigator.geolocation.getCurrentPosition(
            async (position) => {
              const { latitude, longitude } = position.coords;
              
              try {
                // Fetch weather data from Open-Meteo API (free, no API key required)
                const response = await fetch(
                  `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,weather_code`
                );
                const data = await response.json();
                
                if (data.current) {
                  const temp = Math.round(data.current.temperature_2m);
                  const weatherCode = data.current.weather_code;
                  
                  // Map weather codes to conditions
                  const getWeatherCondition = (code: number) => {
                    if (code === 0) return '☀️ Clear';
                    if (code >= 1 && code <= 3) return '🌤️ Partly Cloudy';
                    if (code >= 45 && code <= 48) return '🌫️ Foggy';
                    if (code >= 51 && code <= 67) return '🌧️ Rainy';
                    if (code >= 71 && code <= 77) return '❄️ Snowy';
                    if (code >= 80 && code <= 82) return '🌦️ Showers';
                    if (code >= 95) return '⛈️ Thunderstorm';
                    return '🌤️ Partly Cloudy';
                  };
                  
                  // Reverse geocode to get city name (using a simple approach)
                  let locationName = 'Your Location';
                  try {
                    const geoResponse = await fetch(
                      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
                    );
                    const geoData = await geoResponse.json();
                    if (geoData.address) {
                      const city = geoData.address.city || geoData.address.town || geoData.address.village || geoData.address.county;
                      const country = geoData.address.country;
                      locationName = city ? `${city}, ${country}` : country || 'Your Location';
                    }
                  } catch (geoError) {
                    console.log('Geocoding failed, using default location');
                  }
                  
                  setWeatherData({
                    temperature: temp,
                    location: locationName,
                    condition: getWeatherCondition(weatherCode),
                    loading: false
                  });
                }
              } catch (weatherError) {
                console.error('Weather fetch failed:', weatherError);
                setWeatherData(prev => ({ ...prev, loading: false }));
              }
            },
            (error) => {
              console.log('Geolocation denied, using default location');
              // Use default location (Neo Tokyo) if geolocation is denied
              fetchDefaultWeather();
            }
          );
        } else {
          fetchDefaultWeather();
        }
      } catch (error) {
        console.error('Weather initialization failed:', error);
        setWeatherData(prev => ({ ...prev, loading: false }));
      }
    };

    const fetchDefaultWeather = async () => {
      try {
        // Default to Tokyo coordinates
        const response = await fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=35.6762&longitude=139.6503&current=temperature_2m,weather_code`
        );
        const data = await response.json();
        
        if (data.current) {
          const temp = Math.round(data.current.temperature_2m);
          const weatherCode = data.current.weather_code;
          
          const getWeatherCondition = (code: number) => {
            if (code === 0) return '☀️ Clear';
            if (code >= 1 && code <= 3) return '🌤️ Partly Cloudy';
            if (code >= 45 && code <= 48) return '🌫️ Foggy';
            if (code >= 51 && code <= 67) return '🌧️ Rainy';
            if (code >= 71 && code <= 77) return '❄️ Snowy';
            if (code >= 80 && code <= 82) return '🌦️ Showers';
            if (code >= 95) return '⛈️ Thunderstorm';
            return '🌤️ Partly Cloudy';
          };
          
          setWeatherData({
            temperature: temp,
            location: 'Tokyo, Japan',
            condition: getWeatherCondition(weatherCode),
            loading: false
          });
        }
      } catch (error) {
        console.error('Default weather fetch failed:', error);
        setWeatherData(prev => ({ ...prev, loading: false }));
      }
    };

    fetchWeather();

    // Refresh weather every 10 minutes
    const refreshInterval = setInterval(fetchWeather, 10 * 60 * 1000);

    return () => clearInterval(refreshInterval);
  }, []);

  const currentTheme = themes[theme];

  return (
    <div className="nexus-os" style={{ '--primary': currentTheme.primary, '--secondary': currentTheme.secondary, '--accent': currentTheme.accent, '--bg-dark': currentTheme.bg } as React.CSSProperties}>
      <style>{`
        * { margin: 0; padding: 0; box-sizing: border-box; }
        .nexus-os { 
          font-family: 'Courier New', monospace; 
          background: var(--bg-dark); 
          color: #e0e0e0; 
          height: 100vh; 
          width: 100vw; 
          overflow: hidden;
        }
        :root {
          --primary: ${currentTheme.primary};
          --secondary: ${currentTheme.secondary};
          --accent: ${currentTheme.accent};
          --bg-dark: ${currentTheme.bg};
          --bg-glass: rgba(10, 10, 20, 0.85);
          --border: rgba(0, 240, 255, 0.3);
          --glow: 0 0 20px rgba(0, 240, 255, 0.5);
          --text-primary: #e0e0e0;
          --text-dim: #808080;
          --success: #00ff00;
          --error: #ff0040;
        }
        #boot-screen {
          position: fixed; inset: 0; background: #000; z-index: 10000;
          display: flex; flex-direction: column; align-items: center;
          justify-content: flex-start; padding: 40px; font-size: 14px;
        }
        #boot-screen.hidden { animation: bootFadeOut 0.5s ease forwards; }
        @keyframes bootFadeOut { to { opacity: 0; pointer-events: none; } }
        .bios-logo {
          font-size: 48px; color: var(--primary); text-shadow: var(--glow);
          margin-bottom: 40px; animation: pulse 2s infinite;
        }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
        .boot-log {
          width: 100%; max-width: 800px; height: 400px; overflow-y: auto;
          background: rgba(0, 20, 40, 0.3); border: 1px solid var(--border);
          padding: 20px; margin-bottom: 20px; font-size: 12px;
        }
        .boot-log-line { margin: 4px 0; animation: fadeIn 0.3s ease forwards; }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        .boot-log-line.ok { color: var(--success); }
        .boot-log-line.warn { color: var(--accent); }
        .boot-log-line.error { color: var(--error); }
        .boot-log-line.info { color: var(--primary); }
        .loading-bar {
          width: 100%; max-width: 800px; height: 4px;
          background: rgba(0, 240, 255, 0.1); border: 1px solid var(--border);
          overflow: hidden;
        }
        .loading-progress {
          height: 100%; background: linear-gradient(90deg, var(--primary), var(--secondary));
          width: ${bootProgress}%; transition: width 0.3s ease; box-shadow: var(--glow);
        }
        .boot-status { margin-top: 10px; font-size: 12px; color: var(--primary); }
        #login-screen {
          position: fixed; inset: 0; background: linear-gradient(135deg, #0a0a1a 0%, #1a0a2a 50%, #0a1a2a 100%);
          display: flex; align-items: center; justify-content: center; z-index: 9998;
          animation: fadeIn 0.5s ease;
        }
        .login-container {
          background: rgba(0, 0, 0, 0.6); border: 2px solid var(--primary);
          border-radius: 20px; padding: 40px; width: 100%; max-width: 400px;
          backdrop-filter: blur(10px); box-shadow: 0 0 40px rgba(0, 240, 255, 0.3);
          animation: slideUp 0.5s ease;
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .login-logo {
          font-size: 64px; color: var(--primary); text-align: center;
          margin-bottom: 10px; text-shadow: 0 0 20px var(--primary);
        }
        .login-title {
          font-size: 28px; font-weight: 700; color: var(--primary);
          text-align: center; margin-bottom: 5px; text-transform: uppercase;
          letter-spacing: 2px;
        }
        .login-subtitle {
          font-size: 14px; color: var(--text-dim); text-align: center;
          margin-bottom: 30px;
        }
        .login-form { display: flex; flex-direction: column; gap: 20px; }
        .login-field { display: flex; flex-direction: column; gap: 8px; }
        .login-label {
          font-size: 12px; color: var(--primary); font-weight: 600;
          text-transform: uppercase; letter-spacing: 1px;
        }
        .login-input {
          padding: 12px 16px; background: rgba(0, 0, 0, 0.4);
          border: 1px solid var(--border); border-radius: 10px;
          color: var(--text-primary); font-size: 14px; outline: none;
          transition: all 0.3s ease;
        }
        .login-input:focus {
          border-color: var(--primary); box-shadow: 0 0 15px rgba(0, 240, 255, 0.3);
        }
        .login-input:disabled {
          opacity: 0.5; cursor: not-allowed;
        }
        .login-error {
          color: var(--error); font-size: 12px; text-align: center;
          padding: 8px; background: rgba(255, 0, 64, 0.1);
          border-radius: 6px; border: 1px solid var(--error);
        }
        .login-button {
          padding: 14px; background: linear-gradient(135deg, var(--primary), var(--secondary));
          border: none; border-radius: 10px; color: #000; font-size: 16px;
          font-weight: 700; cursor: pointer; transition: all 0.3s ease;
          text-transform: uppercase; letter-spacing: 1px;
          box-shadow: 0 4px 15px rgba(0, 240, 255, 0.4);
        }
        .login-button:hover {
          transform: translateY(-2px); box-shadow: 0 6px 20px rgba(0, 240, 255, 0.6);
        }
        .login-button:active {
          transform: translateY(0);
        }
        .user-selector {
          background: rgba(0, 0, 0, 0.4);
          border: 1px solid var(--border);
          border-radius: 10px;
          overflow: hidden;
        }
        .user-list {
          max-height: 200px;
          overflow-y: auto;
        }
        .user-list::-webkit-scrollbar {
          width: 0px;
          background: transparent;
        }
        .user-list {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .user-item {
          display: flex;
          align-items: center;
          padding: 14px 16px;
          cursor: pointer;
          transition: all 0.3s ease;
          border-bottom: 1px solid rgba(0, 240, 255, 0.1);
        }
        .user-item:last-child {
          border-bottom: none;
        }
        .user-item:hover {
          background: rgba(0, 240, 255, 0.1);
        }
        .user-item.selected {
          background: rgba(0, 240, 255, 0.2);
          border-left: 3px solid var(--primary);
        }
        .user-icon {
          font-size: 20px;
          margin-right: 12px;
        }
        .user-name {
          flex: 1;
          font-size: 14px;
          color: var(--text-primary);
          font-weight: 500;
        }
        .user-check {
          color: var(--primary);
          font-weight: bold;
          font-size: 16px;
        }
        .no-password-hint {
          margin-left: 8px;
          font-size: 11px;
          color: var(--text-dim);
          font-weight: normal;
          text-transform: none;
        }
        #crt-overlay {
          position: fixed; inset: 0; pointer-events: none; z-index: 9999;
          background: repeating-linear-gradient(0deg, rgba(0, 0, 0, 0.1), rgba(0, 0, 0, 0.1) 1px, transparent 1px, transparent 2px);
        }
        #desktop {
          position: fixed; inset: 0; opacity: 0; transition: opacity 1s ease;
          background: ${wallpapers[wallpaper].background};
        }
        #desktop.visible { opacity: 1; }
        #desktop::before {
          content: ''; position: absolute; inset: 0;
          background: ${wallpapers[wallpaper].effects};
          animation: ${wallpapers[wallpaper].animation};
        }
        @keyframes bgPulse { 0%, 100% { opacity: 0.5; } 50% { opacity: 1; } }
        #desktop::after {
          content: ''; position: absolute; inset: 0;
          background-image: linear-gradient(rgba(0, 240, 255, 0.03) 1px, transparent 1px),
                          linear-gradient(90deg, rgba(0, 240, 255, 0.03) 1px, transparent 1px);
          background-size: 50px 50px; animation: gridMove 20s linear infinite;
        }
        @keyframes gridMove { 0% { transform: translate(0, 0); } 100% { transform: translate(50px, 50px); } }
        @keyframes matrixPulse { 0%, 100% { opacity: 0.3; } 50% { opacity: 0.6; } }
        @keyframes hologramPulse { 0%, 100% { opacity: 0.4; } 50% { opacity: 0.8; } }
        @keyframes spacePulse { 0%, 100% { opacity: 0.3; transform: scale(1); } 50% { opacity: 0.7; transform: scale(1.05); } }
        @keyframes sunsetPulse { 0%, 100% { opacity: 0.5; } 50% { opacity: 0.9; } }
        #desktop-icons {
          position: absolute; top: 0; left: 0; right: 0; bottom: 72px;
          z-index: 10;
        }
        .desktop-icon {
          display: flex; flex-direction: column; align-items: center;
          padding: 10px; width: 100px; height: 100px; cursor: grab; border-radius: 8px;
          transition: transform 0.15s ease-out, box-shadow 0.15s ease-out, background 0.15s ease-out, left 0.25s cubic-bezier(0.2, 0, 0.2, 1), top 0.25s cubic-bezier(0.2, 0, 0.2, 1);
          position: absolute;
          user-select: none;
          will-change: left, top, transform;
          box-sizing: border-box;
        }
        .desktop-icon:hover {
          background: rgba(0, 240, 255, 0.1); transform: scale(1.03);
        }
        .desktop-icon.selected {
          background: rgba(0, 240, 255, 0.2);
          box-shadow: 0 0 10px rgba(0, 240, 255, 0.3);
        }
        .desktop-icon.dragging {
          opacity: 0.9;
          transform: scale(1.02);
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.4);
          z-index: 100;
          cursor: grabbing;
          transition: none;
        }
        .desktop-icon.dragging:hover {
          transform: scale(1.02);
          cursor: grabbing;
        }
        .desktop-icon-icon {
          width: 48px; height: 48px; display: flex; align-items: center;
          justify-content: center; font-size: 28px; margin-bottom: 6px;
          filter: drop-shadow(0 0 5px currentColor); transition: all 0.3s ease;
          flex-shrink: 0;
        }
        .desktop-icon:hover .desktop-icon-icon {
          transform: scale(1.1); filter: drop-shadow(0 0 15px currentColor);
        }
        .desktop-icon-label {
          font-size: 11px; text-align: center; color: var(--text-primary);
          text-shadow: 0 1px 3px rgba(0, 0, 0, 0.8); word-wrap: break-word;
          max-width: 80px; overflow: hidden; text-overflow: ellipsis;
          white-space: nowrap; line-height: 1.2; flex-shrink: 0;
        }
        #context-menu {
          position: fixed; background: var(--bg-glass);
          border: 1px solid var(--border); border-radius: 8px;
          padding: 8px 0; min-width: 180px; backdrop-filter: blur(10px);
          z-index: 1000; display: none; box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5);
        }
        #context-menu.visible { display: block; animation: contextMenuIn 0.2s ease; }
        @keyframes contextMenuIn {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        .context-menu-item {
          padding: 8px 16px; cursor: pointer; display: flex; align-items: center;
          gap: 10px; font-size: 13px; transition: all 0.2s ease;
        }
        .context-menu-item span:first-child {
          font-size: 20px;
        }
        .context-menu-item:hover { background: rgba(0, 240, 255, 0.1); }
        .context-menu-separator { height: 1px; background: var(--border); margin: 4px 0; }
        #taskbar {
          position: fixed; bottom: 8px; left: 50%; transform: translateX(-50%);
          height: 56px;
          background: rgba(10, 10, 26, 0.85);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(0, 240, 255, 0.15);
          border-radius: 16px;
          display: flex; align-items: center;
          padding: 0 8px; z-index: 1000; gap: 6px;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4),
                      0 0 0 1px rgba(0, 240, 255, 0.05),
                      inset 0 1px 0 rgba(255, 255, 255, 0.1);
        }
        #start-button {
          width: 44px; height: 44px;
          background: linear-gradient(135deg, rgba(0, 240, 255, 0.15), rgba(255, 0, 255, 0.15));
          border: 1px solid rgba(0, 240, 255, 0.2);
          border-radius: 12px;
          display: flex; align-items: center; justify-content: center;
          cursor: pointer; transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          font-size: 22px; position: relative; overflow: hidden;
        }
        #start-button::before {
          content: ''; position: absolute; inset: 0;
          background: linear-gradient(135deg, rgba(0, 240, 255, 0.2), rgba(255, 0, 255, 0.2));
          opacity: 0; transition: opacity 0.3s ease;
        }
        #start-button:hover {
          transform: translateY(-2px) scale(1.05);
          border-color: rgba(0, 240, 255, 0.4);
          box-shadow: 0 4px 20px rgba(0, 240, 255, 0.3);
        }
        #start-button:hover::before { opacity: 1; }
        #start-button:active { transform: translateY(0) scale(0.98); }
        #taskbar-apps {
          flex: 1; display: flex; gap: 4px; overflow-x: auto;
          padding: 0 4px; margin: 0 4px;
        }
        #taskbar-apps::-webkit-scrollbar { display: none; }
        .taskbar-app {
          width: 44px; height: 44px; min-width: 44px; padding: 0;
          background: transparent; border: none;
          border-radius: 12px; display: flex; align-items: center; justify-content: center;
          cursor: pointer; transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          font-size: 24px; white-space: nowrap; position: relative;
        }
        .taskbar-app::after {
          content: ''; position: absolute; bottom: 4px; left: 50%; transform: translateX(-50%);
          width: 4px; height: 4px; background: var(--primary);
          border-radius: 50%; opacity: 0; transition: all 0.3s ease;
          box-shadow: 0 0 6px var(--primary);
        }
        .taskbar-app.active::after {
          opacity: 1;
          animation: activeIndicatorPulse 2s ease-in-out infinite;
        }
        @keyframes activeIndicatorPulse {
          0%, 100% { box-shadow: 0 0 6px var(--primary); }
          50% { box-shadow: 0 0 12px var(--primary), 0 0 20px rgba(0, 240, 255, 0.5); }
        }
        .taskbar-app:hover {
          background: rgba(0, 240, 255, 0.1);
          transform: translateY(-2px);
        }
        .taskbar-app.active {
          background: rgba(0, 240, 255, 0.15);
        }
        .taskbar-app.active::after { opacity: 1; }
        .taskbar-app.active:hover {
          background: rgba(0, 240, 255, 0.25);
        }
        .taskbar-app span {
          filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3));
          transition: all 0.3s ease;
        }
        .taskbar-app:hover span {
          filter: drop-shadow(0 2px 8px rgba(0, 240, 255, 0.5)) drop-shadow(0 0 12px var(--primary));
        }
        #system-tray {
          display: flex; align-items: center; gap: 8px; padding: 0 8px;
        }
        .tray-icon {
          width: 36px; height: 36px;
          display: flex; align-items: center; justify-content: center;
          border-radius: 10px;
          cursor: pointer; transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          font-size: 18px; background: transparent; border: none;
        }
        .tray-icon:hover {
          background: rgba(0, 240, 255, 0.1);
          color: var(--primary);
          transform: translateY(-2px);
        }
        .tray-icon.active {
          background: rgba(0, 240, 255, 0.15);
          color: var(--primary);
          box-shadow: 0 0 10px rgba(0, 240, 255, 0.3);
        }
        #clock {
          text-align: right; padding: 4px 12px;
          background: rgba(0, 0, 0, 0.2);
          border-radius: 10px; border: 1px solid rgba(0, 240, 255, 0.1);
          cursor: pointer; transition: all 0.3s ease;
        }
        #clock:hover {
          background: rgba(0, 240, 255, 0.1);
          border-color: rgba(0, 240, 255, 0.3);
        }
        #clock-time { font-size: 13px; font-weight: bold; }
        #clock-date { font-size: 11px; color: var(--text-dim); }
        .tray-panel {
          position: fixed;
          background: rgba(10, 10, 26, 0.95);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(0, 240, 255, 0.2);
          border-radius: 16px;
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.6),
                      0 0 0 1px rgba(0, 240, 255, 0.1);
          z-index: 10000;
          display: none;
          overflow: hidden;
          min-width: 280px;
          transform-origin: bottom center;
        }
        .tray-panel.visible {
          display: block;
          animation: trayPanelIn 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
        @keyframes trayPanelIn {
          from {
            opacity: 0;
            transform: translateY(15px) scale(0.8);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        .tray-panel-header {
          padding: 16px;
          background: rgba(0, 240, 255, 0.05);
          border-bottom: 1px solid rgba(0, 240, 255, 0.1);
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .tray-panel-header-icon {
          font-size: 24px;
        }
        .tray-panel-header-title {
          font-size: 14px;
          font-weight: 600;
          color: var(--primary);
        }
        .tray-panel-content {
          padding: 16px;
        }
        .tray-panel-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 12px;
        }
        .tray-panel-row:last-child {
          margin-bottom: 0;
        }
        .tray-panel-label {
          font-size: 13px;
          color: var(--text-dim);
        }
        .tray-panel-value {
          font-size: 14px;
          font-weight: 500;
          color: var(--text-primary);
        }
        .volume-slider-container {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 8px 0;
        }
        .volume-slider-container input[type="range"] {
          flex: 1;
          height: 4px;
          -webkit-appearance: none;
          appearance: none;
          background: rgba(0, 240, 255, 0.2);
          border-radius: 2px;
          outline: none;
        }
        .volume-slider-container input[type="range"]::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 16px;
          height: 16px;
          background: var(--primary);
          border-radius: 50%;
          cursor: pointer;
          box-shadow: 0 0 10px var(--primary);
        }
        .cursor-options {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 8px;
          margin-top: 12px;
        }
        .cursor-option-btn {
          padding: 10px 12px;
          background: rgba(0, 0, 0, 0.3);
          border: 1px solid rgba(0, 240, 255, 0.2);
          border-radius: 8px;
          color: var(--text-primary);
          font-size: 11px;
          transition: all 0.2s ease;
          text-align: center;
        }
        .cursor-option-btn:hover {
          background: rgba(0, 240, 255, 0.1);
          border-color: rgba(0, 240, 255, 0.4);
        }
        .cursor-option-btn.active {
          background: rgba(0, 240, 255, 0.2);
          border-color: var(--primary);
          box-shadow: 0 0 10px rgba(0, 240, 255, 0.3);
        }
        .battery-level-bar {
          width: 100%;
          height: 8px;
          background: rgba(0, 0, 0, 0.3);
          border-radius: 4px;
          overflow: hidden;
          margin-top: 8px;
        }
        .battery-level-fill {
          height: 100%;
          background: linear-gradient(90deg, var(--primary), var(--secondary));
          border-radius: 4px;
          transition: width 0.5s ease;
        }
        .network-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 10px;
          background: rgba(0, 0, 0, 0.2);
          border-radius: 10px;
          margin-bottom: 8px;
          cursor: pointer;
          transition: all 0.3s ease;
        }
        .network-item:hover {
          background: rgba(0, 240, 255, 0.1);
        }
        .network-item.active {
          background: rgba(0, 240, 255, 0.15);
          border: 1px solid rgba(0, 240, 255, 0.3);
        }
        .network-item-icon {
          font-size: 20px;
        }
        .network-item-info {
          flex: 1;
        }
        .network-item-name {
          font-size: 13px;
          color: var(--text-primary);
          margin-bottom: 2px;
        }
        .network-item-status {
          font-size: 11px;
          color: var(--text-dim);
        }
        .calendar-grid {
          display: grid;
          grid-template-columns: repeat(7, 1fr);
          gap: 4px;
          margin-top: 12px;
        }
        .calendar-day-header {
          font-size: 10px;
          text-align: center;
          color: var(--text-dim);
          padding: 4px;
          text-transform: uppercase;
        }
        .calendar-day {
          font-size: 12px;
          text-align: center;
          padding: 8px 4px;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s ease;
          color: var(--text-primary);
        }
        .calendar-day:hover {
          background: rgba(0, 240, 255, 0.1);
        }
        .calendar-day.today {
          background: linear-gradient(135deg, var(--primary), var(--secondary));
          color: #000;
          font-weight: bold;
        }
        .calendar-day.other-month {
          color: var(--text-dim);
        }
        #start-menu {
          position: fixed; bottom: 72px; left: 8px; width: 340px;
          background: rgba(10, 10, 26, 0.9);
          border: 1px solid rgba(0, 240, 255, 0.2);
          border-radius: 16px; backdrop-filter: blur(20px); z-index: 10001;
          display: none; overflow: hidden;
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.6),
                      0 0 0 1px rgba(0, 240, 255, 0.1);
        }
        #start-menu.visible { display: block; animation: startMenuIn 0.25s cubic-bezier(0.34, 1.56, 0.64, 1); }
        @keyframes startMenuIn {
          from { opacity: 0; transform: translateY(15px) scale(0.8); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        #start-menu-search { padding: 15px; border-bottom: 1px solid var(--border); }
        #start-menu-search input {
          width: 100%; padding: 10px 15px; background: rgba(0, 0, 0, 0.3);
          border: 1px solid var(--border); border-radius: 6px; color: var(--text-primary);
          font-size: 13px; outline: none; transition: all 0.3s ease;
        }
        #start-menu-search input:focus { border-color: var(--primary); box-shadow: var(--glow); }
        #start-menu-apps {
          padding: 12px; display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px;
          max-height: 320px; overflow-y: auto;
        }
        .start-menu-app {
          display: flex; flex-direction: column; align-items: center;
          padding: 12px 8px; border-radius: 12px; cursor: pointer;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          background: rgba(0, 0, 0, 0.2); border: 1px solid transparent;
        }
        .start-menu-app:hover {
          background: rgba(0, 240, 255, 0.1);
          border-color: rgba(0, 240, 255, 0.2);
          transform: translateY(-2px);
        }
        .start-menu-app-icon { font-size: 24px; margin-bottom: 6px; }
        .start-menu-app-label { font-size: 11px; text-align: center; color: var(--text-primary); }
        #start-menu-footer {
          padding: 12px 15px; border-top: 1px solid rgba(0, 240, 255, 0.1);
          display: flex; justify-content: space-between; align-items: center;
          background: rgba(0, 0, 0, 0.2);
        }
        .user-profile { display: flex; align-items: center; gap: 10px; }
        .user-avatar {
          width: 32px; height: 32px; background: linear-gradient(135deg, var(--primary), var(--secondary));
          border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 20px;
        }
        .power-button {
          padding: 8px 16px; background: rgba(255, 0, 64, 0.2);
          border: 1px solid var(--error); border-radius: 6px; cursor: pointer;
          transition: all 0.3s ease; font-size: 12px;
        }
        .power-button:hover { background: rgba(255, 0, 64, 0.4); box-shadow: 0 0 15px rgba(255, 0, 64, 0.5); }
        .window {
          position: absolute; background: var(--bg-glass); border: 1px solid var(--border);
          border-radius: 12px; backdrop-filter: blur(10px);
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5); min-width: 300px; min-height: 200px;
          display: flex; flex-direction: column; overflow: hidden;
          transition: opacity 0.3s ease, transform 0.3s ease, box-shadow 0.2s ease;
        }
        .window.minimized { opacity: 0; transform: scale(0.8) translateY(100px); pointer-events: none; }
        .window.maximized { top: 0 !important; left: 0 !important; width: 100% !important; height: calc(100% - 50px) !important; border-radius: 0; }
        .window-header {
          height: 40px; background: rgba(0, 240, 255, 0.1); border-bottom: 1px solid var(--border);
          display: flex; align-items: center; padding: 0 15px; cursor: grab; gap: 10px;
          user-select: none;
        }
        .window-header:active {
          cursor: grabbing;
        }
        .window.inactive .window-header { background: rgba(0, 0, 0, 0.3); }
        .window-icon { font-size: 28px; }
        .window-title { flex: 1; font-size: 13px; font-weight: 500; }
        .window-controls { display: flex; gap: 8px; }
        .window-control {
          width: 28px; height: 28px; border-radius: 6px; display: flex; align-items: center;
          justify-content: center; cursor: pointer; font-size: 18px; transition: all 0.2s ease;
        }
        .window-control:hover { transform: scale(1.1); }
        .window-control.minimize { background: rgba(255, 200, 0, 0.2); }
        .window-control.maximize { background: rgba(0, 255, 0, 0.2); }
        .window-control.close { background: rgba(255, 0, 64, 0.2); }
        .window-content { flex: 1; overflow: auto; padding: 15px; }
        .terminal {
          background: #0a0a0a; font-family: 'Courier New', monospace;
          font-size: 13px; height: 100%; display: flex; flex-direction: column;
        }
        .terminal-output {
          flex: 1; overflow-y: auto; padding: 10px; color: #00ff00;
        }
        .terminal-line { margin: 2px 0; white-space: pre-wrap; }
        .terminal-line.command { color: var(--primary); }
        .terminal-line.error { color: var(--error); }
        .terminal-line.success { color: var(--success); }
        .terminal-line.warn { color: var(--accent); }
        .terminal-input-line {
          display: flex; align-items: center; padding: 10px;
          background: rgba(0, 0, 0, 0.5); border-top: 1px solid var(--border);
        }
        .terminal-prompt { color: var(--primary); margin-right: 10px; }
        .terminal-input {
          flex: 1; background: transparent; border: none; color: #00ff00;
          font-family: inherit; font-size: inherit; outline: none;
        }
        .file-explorer { height: 100%; display: flex; flex-direction: column; }
        .file-explorer-toolbar {
          display: flex; gap: 10px; padding: 10px;
          background: rgba(0, 0, 0, 0.2); border-bottom: 1px solid var(--border);
        }
        .file-explorer-toolbar button {
          padding: 6px 12px; background: rgba(0, 240, 255, 0.1);
          border: 1px solid var(--border); border-radius: 6px; color: var(--text-primary);
          cursor: pointer; transition: all 0.3s ease; font-size: 12px;
        }
        .file-explorer-toolbar button:hover { background: rgba(0, 240, 255, 0.2); }
        .file-path {
          flex: 1; padding: 6px 12px; background: rgba(0, 0, 0, 0.3);
          border: 1px solid var(--border); border-radius: 6px; color: var(--text-dim); font-size: 12px;
        }
        .file-explorer-body { flex: 1; display: flex; overflow: hidden; }
        .file-sidebar {
          width: 180px; background: rgba(0, 0, 0, 0.2); border-right: 1px solid var(--border);
          padding: 10px; overflow-y: auto;
        }
        .file-sidebar-item {
          padding: 8px 12px; cursor: pointer; border-radius: 6px;
          display: flex; align-items: center; gap: 8px; font-size: 12px; margin-bottom: 4px;
          transition: all 0.2s ease;
        }
        .file-sidebar-item:hover { background: rgba(0, 240, 255, 0.1); }
        .file-sidebar-item.active { background: rgba(0, 240, 255, 0.2); }
        .file-sidebar-item.drag-over {
          background: rgba(0, 240, 255, 0.3);
          box-shadow: 0 0 10px rgba(0, 240, 255, 0.5);
        }
        .file-grid {
          flex: 1; padding: 15px; display: grid; grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
          gap: 15px; overflow-y: auto;
        }
        .file-item {
          display: flex; flex-direction: column; align-items: center;
          padding: 15px 10px; border-radius: 8px; cursor: pointer; transition: all 0.3s ease;
        }
        .file-item:hover { background: rgba(0, 240, 255, 0.1); transform: scale(1.05); }
        .file-item.dragging {
          opacity: 0.5;
          transform: scale(0.95);
          box-shadow: 0 0 20px rgba(0, 240, 255, 0.5);
        }
        .file-icon { font-size: 28px; margin-bottom: 8px; }
        .file-name { font-size: 11px; text-align: center; word-break: break-word; }
        .notes-app { height: 100%; display: flex; flex-direction: column; }
        .notes-toolbar {
          display: flex; gap: 10px; padding: 10px;
          background: rgba(0, 0, 0, 0.2); border-bottom: 1px solid var(--border);
        }
        .notes-toolbar button {
          padding: 6px 12px; background: rgba(0, 240, 255, 0.1);
          border: 1px solid var(--border); border-radius: 6px; color: var(--text-primary);
          cursor: pointer; transition: all 0.3s ease; font-size: 12px;
        }
        .notes-toolbar button:hover { background: rgba(0, 240, 255, 0.2); }
        .notes-editor {
          flex: 1; background: rgba(0, 0, 0, 0.2); border: none; color: var(--text-primary);
          padding: 15px; font-family: 'Courier New', monospace; font-size: 14px;
          line-height: 1.6; resize: none; outline: none;
        }
        .calculator { display: flex; flex-direction: column; height: 100%; }
        .calc-display {
          background: rgba(0, 0, 0, 0.5); padding: 20px; text-align: right;
          font-size: 32px; color: var(--primary); border-bottom: 1px solid var(--border);
          min-height: 80px; display: flex; align-items: flex-end; justify-content: flex-end; overflow: hidden;
        }
        .calc-expression { font-size: 14px; color: var(--text-dim); margin-right: 10px; }
        .calc-buttons {
          flex: 1; display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; padding: 15px;
        }
        .calc-btn {
          padding: 15px; font-size: 20px; background: rgba(0, 240, 255, 0.1);
          border: 1px solid var(--border); border-radius: 8px; color: var(--text-primary);
          cursor: pointer; transition: all 0.2s ease;
        }
        .calc-btn:hover { background: rgba(0, 240, 255, 0.2); transform: scale(1.05); }
        .calc-btn:active { transform: scale(0.95); }
        .calc-btn.operator { background: rgba(255, 0, 255, 0.1); color: var(--secondary); }
        .calc-btn.equals {
          background: linear-gradient(135deg, var(--primary), var(--secondary));
          color: #000; font-weight: bold;
        }
        .calc-btn.clear { background: rgba(255, 0, 64, 0.2); color: var(--error); }
        .music-player { height: 100%; display: flex; flex-direction: column; }
        .music-visualizer {
          height: 100px; background: rgba(0, 0, 0, 0.3); display: flex;
          align-items: center; justify-content: center; gap: 3px; padding: 15px;
          border-bottom: 1px solid var(--border);
        }
        .visualizer-bar {
          width: 4px; background: linear-gradient(to top, var(--primary), var(--secondary));
          border-radius: 2px; transition: height 0.1s ease;
        }
        .music-info { padding: 20px; text-align: center; }
        .music-title { font-size: 18px; margin-bottom: 5px; color: var(--primary); }
        .music-artist { font-size: 13px; color: var(--text-dim); }
        .music-progress { padding: 0 20px; }
        .music-progress-bar {
          height: 4px; background: rgba(0, 240, 255, 0.2); border-radius: 2px;
          overflow: hidden; cursor: pointer;
        }
        .music-progress-fill {
          height: 100%; background: linear-gradient(90deg, var(--primary), var(--secondary));
          width: 35%;
        }
        .music-time {
          display: flex; justify-content: space-between; font-size: 11px; color: var(--text-dim); margin-top: 5px;
        }
        .music-controls {
          display: flex; justify-content: center; align-items: center; gap: 20px; padding: 20px;
        }
        .music-btn {
          width: 40px; height: 40px; border-radius: 50%;
          background: rgba(0, 240, 255, 0.1); border: 1px solid var(--border);
          color: var(--text-primary); cursor: pointer; display: flex; align-items: center;
          justify-content: center; font-size: 20px; transition: all 0.3s ease;
        }
        .music-btn:hover { background: rgba(0, 240, 255, 0.2); transform: scale(1.1); }
        .music-btn.play {
          width: 50px; height: 50px; background: linear-gradient(135deg, var(--primary), var(--secondary));
          color: #000; font-size: 24px;
        }
        .music-playlist { flex: 1; overflow-y: auto; border-top: 1px solid var(--border); }
        .playlist-item {
          padding: 12px 20px; display: flex; align-items: center; gap: 10px;
          cursor: pointer; transition: all 0.2s ease; border-bottom: 1px solid rgba(0, 240, 255, 0.05);
        }
        .playlist-item:hover { background: rgba(0, 240, 255, 0.1); }
        .playlist-item.active {
          background: rgba(0, 240, 255, 0.15); border-left: 3px solid var(--primary);
        }
        .playlist-item-icon { font-size: 20px; color: var(--text-dim); }
        .playlist-item-info { flex: 1; }
        .playlist-item-title { font-size: 13px; }
        .playlist-item-artist { font-size: 11px; color: var(--text-dim); }
        .playlist-item-duration { font-size: 12px; color: var(--text-dim); }
        .settings-app { height: 100%; display: flex; }
        .settings-sidebar {
          width: 180px; background: rgba(0, 0, 0, 0.2); border-right: 1px solid var(--border);
          padding: 15px;
        }
        .settings-nav-item {
          padding: 10px 15px; border-radius: 6px; cursor: pointer; transition: all 0.2s ease;
          font-size: 13px; margin-bottom: 5px; display: flex; align-items: center; gap: 10px;
        }
        .settings-nav-item:hover { background: rgba(0, 240, 255, 0.1); }
        .settings-nav-item.active { background: rgba(0, 240, 255, 0.2); color: var(--primary); }
        .settings-content { flex: 1; padding: 20px; overflow-y: auto; }
        .settings-section { margin-bottom: 30px; }
        .settings-section h3 {
          font-size: 16px; margin-bottom: 15px; color: var(--primary);
          padding-bottom: 10px; border-bottom: 1px solid var(--border);
        }
        .settings-item {
          display: flex; justify-content: space-between; align-items: center;
          padding: 15px; background: rgba(0, 0, 0, 0.2); border-radius: 8px; margin-bottom: 10px;
        }
        .settings-item-label { font-size: 13px; }
        .settings-item-desc { font-size: 11px; color: var(--text-dim); margin-top: 4px; }
        .theme-grid {
          display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px; margin-top: 15px;
        }
        .theme-option {
          padding: 15px; border-radius: 8px; cursor: pointer; transition: all 0.3s ease;
          border: 2px solid transparent; text-align: center;
        }
        .theme-option:hover { transform: scale(1.05); }
        .theme-option.active {
          border-color: var(--primary); box-shadow: var(--glow);
        }
        .theme-preview { height: 40px; border-radius: 6px; margin-bottom: 8px; }
        .theme-name { font-size: 12px; }
        .toggle {
          width: 50px; height: 26px; background: rgba(0, 0, 0, 0.3);
          border: 1px solid var(--border); border-radius: 13px; position: relative;
          cursor: pointer; transition: all 0.3s ease;
        }
        .toggle.active { background: rgba(0, 240, 255, 0.3); border-color: var(--primary); }
        .toggle-knob {
          position: absolute; top: 3px; left: 3px; width: 18px; height: 18px;
          background: var(--text-dim); border-radius: 50%; transition: all 0.3s ease;
        }
        .toggle.active .toggle-knob {
          left: 27px; background: var(--primary); box-shadow: var(--glow);
        }
        .volume-slider {
          width: 120px; height: 6px; -webkit-appearance: none; appearance: none;
          background: rgba(0, 0, 0, 0.3); border-radius: 3px; outline: none; cursor: pointer;
        }
        .volume-slider::-webkit-slider-thumb {
          -webkit-appearance: none; appearance: none; width: 16px; height: 16px;
          background: var(--primary); border-radius: 50%; cursor: pointer;
          transition: all 0.2s ease;
        }
        .volume-slider::-webkit-slider-thumb:hover {
          transform: scale(1.2); box-shadow: var(--glow);
        }
        .volume-slider::-moz-range-thumb {
          width: 16px; height: 16px; background: var(--primary); border-radius: 50%;
          cursor: pointer; border: none; transition: all 0.2s ease;
        }
        .volume-slider::-moz-range-thumb:hover {
          transform: scale(1.2); box-shadow: var(--glow);
        }
        .settings-select {
          padding: 8px 12px; background: rgba(0, 0, 0, 0.3);
          border: 1px solid var(--border); border-radius: 6px; color: var(--text-primary);
          font-size: 12px; outline: none; cursor: pointer; transition: all 0.3s ease;
        }
        .settings-select:hover { border-color: var(--primary); }
        .settings-select:focus { border-color: var(--primary); box-shadow: var(--glow); }
        .settings-select option {
          background: var(--bg-dark); color: var(--text-primary); padding: 8px;
        }
        .system-monitor { height: 100%; display: flex; flex-direction: column; }
        .monitor-grid {
          display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px; padding: 15px;
        }
        .monitor-card {
          background: rgba(0, 0, 0, 0.2); border: 1px solid var(--border);
          border-radius: 8px; padding: 15px;
        }
        .monitor-card-title {
          font-size: 12px; color: var(--text-dim); margin-bottom: 10px;
          display: flex; justify-content: space-between;
        }
        .monitor-value { font-size: 28px; font-weight: bold; color: var(--primary); }
        .monitor-bar {
          height: 6px; background: rgba(0, 240, 255, 0.1); border-radius: 3px;
          margin-top: 10px; overflow: hidden;
        }
        .monitor-bar-fill {
          height: 100%; background: linear-gradient(90deg, var(--primary), var(--secondary));
          border-radius: 3px; transition: width 0.5s ease;
        }
        .monitor-graph {
          height: 80px; margin-top: 10px; display: flex; align-items: flex-end; gap: 2px;
        }
        .graph-bar {
          flex: 1; background: rgba(0, 240, 255, 0.5); border-radius: 2px 2px 0 0;
          transition: height 0.3s ease;
        }
        .monitor-details {
          display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; margin-top: 10px;
        }
        .monitor-detail { font-size: 11px; color: var(--text-dim); }
        .monitor-detail span { color: var(--text-primary); }
        .browser-app { height: 100%; display: flex; flex-direction: column; }
        .browser-toolbar {
          display: flex; align-items: center; gap: 10px; padding: 10px;
          background: rgba(0, 0, 0, 0.3); border-bottom: 1px solid var(--border);
        }
        .browser-nav-buttons {
          display: flex; gap: 4px;
        }
        .browser-nav-btn {
          width: 32px; height: 32px;
          background: rgba(0, 240, 255, 0.1); border: 1px solid var(--border);
          border-radius: 6px; color: var(--text-primary);
          cursor: pointer; transition: all 0.2s ease;
          display: flex; align-items: center; justify-content: center;
          font-size: 16px;
        }
        .browser-nav-btn:hover:not(:disabled) {
          background: rgba(0, 240, 255, 0.2);
          border-color: var(--primary);
        }
        .browser-nav-btn:disabled {
          opacity: 0.3; cursor: not-allowed;
        }
        .browser-url-bar {
          flex: 1; display: flex; align-items: center; gap: 8px;
          background: rgba(0, 0, 0, 0.4); border: 1px solid var(--border);
          border-radius: 8px; padding: 6px 12px;
        }
        .browser-url-icon {
          font-size: 14px; color: var(--success);
        }
        .browser-url-input {
          flex: 1; background: transparent; border: none; outline: none;
          color: var(--text-primary); font-size: 13px;
        }
        .browser-url-input::placeholder {
          color: var(--text-dim);
        }
        .browser-go-btn {
          width: 28px; height: 28px;
          background: var(--primary); border: none; border-radius: 6px;
          color: #000; cursor: pointer; font-size: 14px;
          transition: all 0.2s ease;
        }
        .browser-go-btn:hover {
          background: var(--secondary);
          transform: scale(1.05);
        }
        .browser-bookmarks {
          display: flex; gap: 8px; padding: 10px;
          background: rgba(0, 0, 0, 0.2); border-bottom: 1px solid var(--border);
          overflow-x: auto;
        }
        .browser-bookmarks::-webkit-scrollbar { height: 4px; }
        .browser-bookmarks::-webkit-scrollbar-track { background: transparent; }
        .browser-bookmarks::-webkit-scrollbar-thumb {
          background: var(--border); border-radius: 2px;
        }
        .bookmark-btn {
          padding: 6px 12px; background: rgba(0, 240, 255, 0.1);
          border: 1px solid var(--border); border-radius: 6px;
          color: var(--text-primary); font-size: 12px; cursor: pointer;
          transition: all 0.2s ease; white-space: nowrap;
        }
        .bookmark-btn:hover {
          background: rgba(0, 240, 255, 0.2);
          border-color: var(--primary);
          transform: translateY(-1px);
        }
        .bookmark-btn.external-btn {
          background: rgba(255, 165, 0, 0.15);
          border-color: rgba(255, 165, 0, 0.3);
        }
        .bookmark-btn.external-btn:hover {
          background: rgba(255, 165, 0, 0.25);
          border-color: #ffa500;
          box-shadow: 0 0 15px rgba(255, 165, 0, 0.3);
        }
        .browser-content {
          flex: 1; position: relative; overflow: hidden;
          display: flex; align-items: center; justify-content: center;
          background: rgba(0, 0, 0, 0.3);
        }
        .browser-placeholder {
          text-align: center; padding: 40px;
        }
        .browser-placeholder-icon {
          font-size: 80px; margin-bottom: 20px;
          animation: float 3s ease-in-out infinite;
        }
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        .browser-placeholder-title {
          font-size: 24px; font-weight: 600; color: var(--primary);
          margin-bottom: 12px;
        }
        .browser-placeholder-text {
          font-size: 14px; color: var(--text-dim);
          line-height: 1.6;
        }
        .browser-current-url {
          margin-top: 30px; padding: 15px 20px;
          background: rgba(0, 240, 255, 0.1);
          border: 1px solid rgba(0, 240, 255, 0.2);
          border-radius: 8px;
        }
        .browser-url-label {
          display: block; font-size: 12px;
          color: var(--text-dim); margin-bottom: 5px;
        }
        .browser-url-value {
          font-size: 13px; color: var(--primary);
          word-break: break-all;
        }
        .browser-iframe {
          width: 100%; height: 100%; border: none;
          background: #000;
        }
        .browser-loading {
          position: absolute; inset: 0;
          display: flex; flex-direction: column; align-items: center; justify-content: center;
          background: rgba(0, 0, 0, 0.8); z-index: 10;
        }
        .loading-spinner {
          width: 40px; height: 40px;
          border: 3px solid rgba(0, 240, 255, 0.2);
          border-top-color: var(--primary);
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        .loading-text {
          margin-top: 16px; font-size: 13px; color: var(--text-dim);
        }
        .game-app { height: 100%; display: flex; flex-direction: column; }
        .game-header {
          padding: 15px 20px;
          background: rgba(0, 0, 0, 0.3);
          border-bottom: 1px solid var(--border);
        }
        .game-title {
          font-size: 18px; font-weight: 600; color: var(--primary);
        }
        .game-content {
          flex: 1; display: flex; align-items: center; justify-content: center;
          background: rgba(0, 0, 0, 0.3);
        }
        .game-play-btn {
          text-align: center; padding: 40px;
        }
        .game-launch-btn {
          padding: 15px 40px; font-size: 16px; font-weight: 600;
          background: linear-gradient(135deg, var(--primary), var(--secondary));
          border: none; border-radius: 10px; color: #000;
          cursor: pointer; transition: all 0.3s ease;
          box-shadow: 0 4px 15px rgba(0, 240, 255, 0.3);
        }
        .game-launch-btn:hover {
          transform: translateY(-2px) scale(1.05);
          box-shadow: 0 6px 20px rgba(0, 240, 255, 0.5);
        }
        .game-launch-btn:active {
          transform: translateY(0) scale(0.98);
        }
        .game-info {
          margin-top: 20px; font-size: 13px; color: var(--text-dim);
          line-height: 1.6;
        }
        #notification {
          position: fixed; top: 20px; right: 20px; background: var(--bg-glass);
          border: 1px solid var(--border); border-radius: 8px; padding: 15px 20px;
          backdrop-filter: blur(10px); z-index: 500; display: none;
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5); max-width: 350px;
        }
        #notification.visible { display: block; animation: slideInRight 0.3s ease; }
        @keyframes slideInRight {
          from { opacity: 0; transform: translateX(20px); }
          to { opacity: 1; transform: translateX(0); }
        }
        .notification-title { font-size: 14px; font-weight: 500; margin-bottom: 5px; color: var(--primary); }
        .notification-body { font-size: 12px; color: var(--text-dim); }
        #ai-assistant {
          position: fixed; right: 20px; bottom: 70px; width: 350px;
          background: var(--bg-glass); border: 1px solid var(--border);
          border-radius: 12px; backdrop-filter: blur(10px); z-index: 150;
          display: none; flex-direction: column; box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5);
        }
        #ai-assistant.visible { display: flex; animation: slideInRight 0.3s ease; }
        .ai-header {
          padding: 15px; background: linear-gradient(135deg, rgba(0, 240, 255, 0.2), rgba(255, 0, 255, 0.2));
          border-bottom: 1px solid var(--border); display: flex; align-items: center; justify-content: space-between;
        }
        .ai-title { display: flex; align-items: center; gap: 10px; font-size: 14px; font-weight: 500; }
        .ai-status {
          width: 8px; height: 8px; background: var(--success); border-radius: 50%;
          animation: pulse 2s infinite;
        }
        .ai-close { cursor: pointer; font-size: 18px; opacity: 0.7; transition: opacity 0.2s ease; }
        .ai-close:hover { opacity: 1; }
        .ai-messages { flex: 1; max-height: 300px; overflow-y: auto; padding: 15px; }
        .ai-message { margin-bottom: 15px; animation: fadeIn 0.3s ease; }
        .ai-message.user { text-align: right; }
        .ai-message.assistant { text-align: left; }
        .ai-message-bubble {
          display: inline-block; max-width: 80%; padding: 10px 15px;
          border-radius: 12px; font-size: 13px; line-height: 1.6;
          white-space: pre-wrap; word-wrap: break-word;
        }
        .ai-message.user .ai-message-bubble {
          background: linear-gradient(135deg, var(--primary), var(--secondary)); color: #000;
          border-radius: 12px 12px 0 12px;
        }
        .ai-message.assistant .ai-message-bubble {
          background: rgba(0, 240, 255, 0.1); border: 1px solid var(--border);
          border-radius: 12px 12px 12px 0;
        }
        .ai-input-area {
          padding: 15px; border-top: 1px solid var(--border); display: flex; gap: 10px;
        }
        .ai-input {
          flex: 1; padding: 10px 15px; background: rgba(0, 0, 0, 0.3);
          border: 1px solid var(--border); border-radius: 20px; color: var(--text-primary);
          font-size: 13px; outline: none;
        }
        .ai-input:focus { border-color: var(--primary); }
        .ai-input:disabled { opacity: 0.5; cursor: not-allowed; }
        .ai-send {
          width: 40px; height: 40px; border-radius: 50%;
          background: linear-gradient(135deg, var(--primary), var(--secondary));
          border: none; color: #000; cursor: pointer; display: flex; align-items: center;
          justify-content: center; transition: all 0.3s ease;
        }
        .ai-send:hover { transform: scale(1.1); }
        .ai-send:disabled { opacity: 0.5; cursor: not-allowed; transform: none; }
        .ai-message-bubble.loading {
          background: rgba(0, 240, 255, 0.05);
          border: 1px dashed var(--border);
        }
        .loading-dots::after {
          content: '...';
          animation: dots 1.5s steps(4, end) infinite;
        }
        @keyframes dots {
          0%, 20% { content: '.'; }
          40% { content: '..'; }
          60%, 100% { content: '...'; }
        }
        .weather-widget {
          position: fixed; top: 20px; right: 20px; width: 180px;
          background: var(--bg-glass); border: 1px solid var(--border);
          border-radius: 12px; backdrop-filter: blur(10px); padding: 15px; z-index: 50;
        }
        .weather-close-btn {
          position: absolute; top: 8px; right: 8px;
          width: 24px; height: 24px; border: none;
          background: rgba(255, 0, 64, 0.2); color: #ff0040;
          border-radius: 50%; font-size: 14px; font-weight: bold;
          cursor: pointer; display: flex; align-items: center;
          justify-content: center; transition: all 0.2s ease;
        }
        .weather-close-btn:hover {
          background: rgba(255, 0, 64, 0.4); color: #ff6666;
          transform: scale(1.1);
        }
        .weather-refresh-btn {
          position: absolute; top: 8px; right: 38px;
          width: 24px; height: 24px; border: none;
          background: rgba(0, 240, 255, 0.2); color: #00f0ff;
          border-radius: 50%; font-size: 12px; font-weight: bold;
          cursor: pointer; display: flex; align-items: center;
          justify-content: center; transition: all 0.2s ease;
        }
        .weather-refresh-btn:hover {
          background: rgba(0, 240, 255, 0.4); color: #66ffff;
          transform: scale(1.1) rotate(180deg);
        }
        .weather-temp { font-size: 36px; color: var(--primary); }
        .weather-location { font-size: 12px; color: var(--text-dim); margin-top: 5px; }
        .weather-condition {
          font-size: 14px; margin-top: 10px; display: flex; align-items: center; gap: 8px;
        }
      `}</style>

      {/* CRT Overlay */}
      <div id="crt-overlay"></div>

      {/* Boot Screen */}
      <div id={`boot-screen`} className={bootComplete ? 'hidden' : ''}>
        <div className="bios-logo">⬡ NEXUS-7</div>
        <div className="boot-log">
          {bootLogs.map((log, index) => (
            <div key={index} className={`boot-log-line ${log.type}`}>
              {log.text}
            </div>
          ))}
        </div>
        <div className="loading-bar">
          <div className="loading-progress"></div>
        </div>
        <div className="boot-status">Loading... {Math.round(bootProgress)}%</div>
      </div>

      {/* Login Screen */}
      {showLogin && (
        <div id="login-screen">
          <div className="login-container">
            <div className="login-logo">⬡</div>
            <div className="login-title">NEXUS-7 OS</div>
            <div className="login-subtitle">Authentication Required</div>
            
            <div className="login-form">
              <div className="login-field">
                <label className="login-label">Select User</label>
                <div className="user-selector">
                  <div className="user-list">
                    {users.map((user) => (
                      <div
                        key={user.id}
                        className={`user-item ${selectedUser === user.id ? 'selected' : ''}`}
                        onClick={() => {
                          setSelectedUser(user.id);
                          setLoginPassword('');
                          setLoginError('');
                        }}
                      >
                        <span className="user-icon">{user.icon}</span>
                        <span className="user-name">{user.name}</span>
                        {selectedUser === user.id && <span className="user-check">✓</span>}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              
              <div className="login-field">
                <label className="login-label">
                  Password
                  {!users.find(u => u.id === selectedUser)?.hasPassword && (
                    <span className="no-password-hint">(Not required for Tinku)</span>
                  )}
                </label>
                <input
                  type="password"
                  className="login-input"
                  placeholder={users.find(u => u.id === selectedUser)?.hasPassword ? 'Enter password' : 'Not required'}
                  value={loginPassword}
                  onChange={(e) => {
                    setLoginPassword(e.target.value);
                    setLoginError('');
                  }}
                  onKeyPress={handleLoginKeyPress}
                  disabled={!users.find(u => u.id === selectedUser)?.hasPassword}
                />
              </div>

              {loginError && (
                <div className="login-error">{loginError}</div>
              )}

              <button className="login-button" onClick={handleLogin}>
                Login to NEXUS-7
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Desktop */}
      {isLoggedIn && (
        <div
          id={`desktop`}
          className="visible"
          onClick={handleDesktopClick}
          style={{ cursor: cursorStyles[cursorStyle]?.cursor || 'default' }}
        >
        {/* Desktop Icons */}
        <div id="desktop-icons">
          {/* First Column - Main Apps */}
          {apps.filter(app => app.id !== 'game-rps' && app.id !== 'game-rps-v2').map((app, index) => {
            const pos = iconPositions[app.id] || { x: 20, y: 20 + index * 100 };
            return (
              <div
                key={app.id}
                className={`desktop-icon ${selectedIcon === app.id ? 'selected' : ''} ${draggingIcon === app.id ? 'dragging' : ''}`}
                style={{
                  left: `${pos.x}px`,
                  top: `${pos.y}px`
                }}
                onClick={(e) => handleIconClick(app.id, e)}
                onDoubleClick={() => handleIconDoubleClick(app.id)}
                onMouseDown={(e) => handleIconMouseDown(e, app.id)}
                onContextMenu={(e) => handleIconContextMenu(e, app.id)}
              >
                <div className="desktop-icon-icon" style={{ color: app.color }}>{app.icon}</div>
                <div className="desktop-icon-label">{app.name}</div>
              </div>
            );
          })}
          {/* Second Column - Games and AI */}
          <div
            className={`desktop-icon ${selectedIcon === 'game-rps' ? 'selected' : ''} ${draggingIcon === 'game-rps' ? 'dragging' : ''}`}
            style={{
              left: `${iconPositions['game-rps']?.x || 130}px`,
              top: `${iconPositions['game-rps']?.y || 20}px`
            }}
            onClick={(e) => handleIconClick('game-rps', e)}
            onDoubleClick={() => handleIconDoubleClick('game-rps')}
            onMouseDown={(e) => handleIconMouseDown(e, 'game-rps')}
            onContextMenu={(e) => handleIconContextMenu(e, 'game-rps')}
          >
            <div className="desktop-icon-icon" style={{ color: '#ff4444' }}>✊</div>
            <div className="desktop-icon-label">Rock Paper Scissors</div>
          </div>
          <div
            className={`desktop-icon ${selectedIcon === 'game-rps-v2' ? 'selected' : ''} ${draggingIcon === 'game-rps-v2' ? 'dragging' : ''}`}
            style={{
              left: `${iconPositions['game-rps-v2']?.x || 130}px`,
              top: `${iconPositions['game-rps-v2']?.y || 120}px`
            }}
            onClick={(e) => handleIconClick('game-rps-v2', e)}
            onDoubleClick={() => handleIconDoubleClick('game-rps-v2')}
            onMouseDown={(e) => handleIconMouseDown(e, 'game-rps-v2')}
            onContextMenu={(e) => handleIconContextMenu(e, 'game-rps-v2')}
          >
            <div className="desktop-icon-icon" style={{ color: '#44ff44' }}>🎮</div>
            <div className="desktop-icon-label">RPS V2</div>
          </div>
          <div
            className={`desktop-icon ${selectedIcon === 'ai' ? 'selected' : ''} ${draggingIcon === 'ai' ? 'dragging' : ''}`}
            style={{
              left: `${iconPositions['ai']?.x || 130}px`,
              top: `${iconPositions['ai']?.y || 220}px`
            }}
            onClick={(e) => handleIconClick('ai', e)}
            onDoubleClick={() => setAiVisible(true)}
            onMouseDown={(e) => handleIconMouseDown(e, 'ai')}
          >
            <div className="desktop-icon-icon" style={{ color: '#00f0ff' }}>🤖</div>
            <div className="desktop-icon-label">AI Assistant</div>
          </div>
        </div>

        {/* Weather Widget */}
        {showWeatherWidget && (
          <div className="weather-widget">
            <button
              className="weather-close-btn"
              onClick={() => setShowWeatherWidget(false)}
              title="Hide weather widget"
            >
              ✕
            </button>
            <button
              className="weather-refresh-btn"
              onClick={() => window.location.reload()}
              title="Refresh weather"
            >
              🔄
            </button>
            <div className="weather-temp">{weatherData.loading ? '...' : `${weatherData.temperature}°C`}</div>
            <div className="weather-location">📍 {weatherData.location}</div>
            <div className="weather-condition">{weatherData.loading ? 'Loading...' : weatherData.condition}</div>
          </div>
        )}

        {/* Notification */}
        {notification && (
          <div id="notification" className="visible">
            <div className="notification-title">{notification.title}</div>
            <div className="notification-body">{notification.body}</div>
          </div>
        )}

        {/* Windows */}
        {windows.map(window => (
          <div
            key={window.id}
            className={`window ${minimizedWindows.includes(window.id) ? 'minimized' : ''} ${window.maximized ? 'maximized' : ''} ${activeWindow === window.id ? '' : 'inactive'}`}
            style={{
              width: window.maximized ? '100%' : window.width,
              height: window.maximized ? 'calc(100% - 50px)' : window.height,
              left: window.maximized ? 0 : window.x,
              top: window.maximized ? 0 : window.y,
              zIndex: window.zIndex
            }}
            onMouseDown={() => {
              if (activeWindow !== window.id) {
                setActiveWindow(window.id);
                setWindowZIndex(prev => prev + 1);
              }
            }}
          >
            <div className="window-header" onMouseDown={(e) => handleWindowMouseDown(e, window.id)}>
              <span className="window-icon">{window.icon}</span>
              <span className="window-title">{window.name}</span>
              <div className="window-controls">
                <div className="window-control minimize" onClick={() => minimizeWindow(window.id)}>−</div>
                <div className="window-control maximize" onClick={() => maximizeWindow(window.id)}>□</div>
                <div className="window-control close" onClick={() => closeWindow(window.id)}>×</div>
              </div>
            </div>
            <div className="window-content">
              {window.id === 'terminal' && (
                <div className="terminal">
                  <div className="terminal-output" ref={terminalOutputRef}>
                    <div className="terminal-line">NEXUS-7 Terminal v2.4.1</div>
                    <div className="terminal-line">Type 'help' for available commands</div>
                    <div className="terminal-line">&nbsp;</div>
                  </div>
                  <div className="terminal-input-line">
                    <span className="terminal-prompt">operator@nexus:~$</span>
                    <input
                      type="text"
                      className="terminal-input"
                      ref={terminalInputRef}
                      onKeyDown={handleTerminalInput}
                      autoFocus
                    />
                  </div>
                </div>
              )}
              {window.id === 'files' && (
                <div className="file-explorer">
                  <div className="file-explorer-toolbar">
                    <button onClick={() => navigateToPath('/')}>🏠 Home</button>
                    <div className="file-path">{currentPath}</div>
                  </div>
                  <div className="file-explorer-body">
                    <div className="file-sidebar">
                      <div 
                        className={`file-sidebar-item ${currentPath === '/' ? 'active' : ''} ${dragOverFolder === '/' ? 'drag-over' : ''}`}
                        onClick={() => navigateToPath('/')}
                        onDragOver={(e) => handleDragOver(e, '/')}
                        onDrop={(e) => handleDrop(e, '/')}
                        onDragLeave={() => setDragOverFolder(null)}
                      >
                        📁 Root
                      </div>
                      <div 
                        className={`file-sidebar-item ${currentPath === '/system' ? 'active' : ''} ${dragOverFolder === '/system' ? 'drag-over' : ''}`}
                        onClick={() => navigateToPath('/system')}
                        onDragOver={(e) => handleDragOver(e, '/system')}
                        onDrop={(e) => handleDrop(e, '/system')}
                        onDragLeave={() => setDragOverFolder(null)}
                      >
                        📁 System
                      </div>
                      <div 
                        className={`file-sidebar-item ${currentPath === '/users' ? 'active' : ''} ${dragOverFolder === '/users' ? 'drag-over' : ''}`}
                        onClick={() => navigateToPath('/users')}
                        onDragOver={(e) => handleDragOver(e, '/users')}
                        onDrop={(e) => handleDrop(e, '/users')}
                        onDragLeave={() => setDragOverFolder(null)}
                      >
                        📁 Users
                      </div>
                      <div 
                        className={`file-sidebar-item ${currentPath === '/logs' ? 'active' : ''} ${dragOverFolder === '/logs' ? 'drag-over' : ''}`}
                        onClick={() => navigateToPath('/logs')}
                        onDragOver={(e) => handleDragOver(e, '/logs')}
                        onDrop={(e) => handleDrop(e, '/logs')}
                        onDragLeave={() => setDragOverFolder(null)}
                      >
                        📁 Logs
                      </div>
                      <div 
                        className={`file-sidebar-item ${currentPath === '/projects' ? 'active' : ''} ${dragOverFolder === '/projects' ? 'drag-over' : ''}`}
                        onClick={() => navigateToPath('/projects')}
                        onDragOver={(e) => handleDragOver(e, '/projects')}
                        onDrop={(e) => handleDrop(e, '/projects')}
                        onDragLeave={() => setDragOverFolder(null)}
                      >
                        📁 Projects
                      </div>
                      <div 
                        className={`file-sidebar-item ${currentPath === '/classified' ? 'active' : ''} ${dragOverFolder === '/classified' ? 'drag-over' : ''}`}
                        onClick={() => navigateToPath('/classified')}
                        onDragOver={(e) => handleDragOver(e, '/classified')}
                        onDrop={(e) => handleDrop(e, '/classified')}
                        onDragLeave={() => setDragOverFolder(null)}
                      >
                        🔒 Classified
                      </div>
                      <div 
                        className={`file-sidebar-item ${currentPath === '/credentials' ? 'active' : ''} ${dragOverFolder === '/credentials' ? 'drag-over' : ''}`}
                        onClick={() => navigateToPath('/credentials')}
                        onDragOver={(e) => handleDragOver(e, '/credentials')}
                        onDrop={(e) => handleDrop(e, '/credentials')}
                        onDragLeave={() => setDragOverFolder(null)}
                      >
                        🔐 Credentials
                      </div>
                    </div>
                    <div 
                      className="file-grid"
                      onDragOver={(e) => handleDragOver(e, currentPath)}
                      onDrop={(e) => handleDrop(e, currentPath)}
                    >
                      {(() => {
                        // Get current folder contents
                        const getContents = (path: string) => {
                          if (path === '/') return filesystem;
                          const parts = path.split('/').filter(Boolean);
                          let current = filesystem;
                          // Navigate through the filesystem, looking for keys with slashes
                          for (const part of parts) {
                            // Try to find the folder with this name (keys may have slashes or not)
                            const foundKey = Object.keys(current).find(key => key.replace(/^\//, '') === part);
                            if (foundKey && current[foundKey] && current[foundKey].type === 'folder') {
                              current = current[foundKey].children;
                            } else {
                              return {};
                            }
                          }
                          return current;
                        };

                        const contents = getContents(currentPath);
                        
                        return Object.entries(contents).map(([name, item]: [string, any]) => (
                          <div
                            key={name}
                            className={`file-item ${draggedItem?.name === name ? 'dragging' : ''}`}
                            draggable
                            onDragStart={(e) => handleDragStart(e, name, currentPath)}
                            onDragEnd={handleDragEnd}
                            onDoubleClick={() => {
                              if (item.url) {
                                globalThis.open(item.url, '_blank', 'noopener,noreferrer');
                              } else if (item.type === 'folder') {
                                navigateToPath(currentPath === '/' ? `/${name}` : `${currentPath}/${name}`);
                              }
                            }}
                          >
                            <div className="file-icon">
                              {item.type === 'folder' ? '📁' : '📄'}
                            </div>
                            <div className="file-name">{name}</div>
                          </div>
                        ));
                      })()}
                    </div>
                  </div>
                </div>
              )}
              {window.id === 'notes' && (
                <div className="notes-app">
                  <div className="notes-toolbar">
                    <button onClick={() => localStorage.setItem('nexus-notes', notesContent)}>💾 Save</button>
                    <span style={{ marginLeft: 'auto', fontSize: '11px', color: '#808080' }}>Auto-saves automatically</span>
                  </div>
                  <textarea
                    className="notes-editor"
                    ref={notesEditorRef}
                    value={notesContent}
                    onChange={(e) => handleNotesChange(e.target.value)}
                    placeholder="Start typing your notes..."
                  />
                </div>
              )}
              {window.id === 'calculator' && (
                <div className="calculator">
                  <div className="calc-display">
                    <span className="calc-expression">{calcExpression}</span>
                    <span>{calcDisplay}</span>
                  </div>
                  <div className="calc-buttons">
                    <button className="calc-btn clear" onClick={handleCalcClear}>C</button>
                    <button className="calc-btn" onClick={() => handleCalcInput('(')}>(</button>
                    <button className="calc-btn" onClick={() => handleCalcInput(')')}>)</button>
                    <button className="calc-btn operator" onClick={() => handleCalcInput('/')}>÷</button>
                    <button className="calc-btn" onClick={() => handleCalcInput('7')}>7</button>
                    <button className="calc-btn" onClick={() => handleCalcInput('8')}>8</button>
                    <button className="calc-btn" onClick={() => handleCalcInput('9')}>9</button>
                    <button className="calc-btn operator" onClick={() => handleCalcInput('*')}>×</button>
                    <button className="calc-btn" onClick={() => handleCalcInput('4')}>4</button>
                    <button className="calc-btn" onClick={() => handleCalcInput('5')}>5</button>
                    <button className="calc-btn" onClick={() => handleCalcInput('6')}>6</button>
                    <button className="calc-btn operator" onClick={() => handleCalcInput('-')}>−</button>
                    <button className="calc-btn" onClick={() => handleCalcInput('1')}>1</button>
                    <button className="calc-btn" onClick={() => handleCalcInput('2')}>2</button>
                    <button className="calc-btn" onClick={() => handleCalcInput('3')}>3</button>
                    <button className="calc-btn operator" onClick={() => handleCalcInput('+')}>+</button>
                    <button className="calc-btn" onClick={() => handleCalcInput('0')}>0</button>
                    <button className="calc-btn" onClick={() => handleCalcInput('.')}>.</button>
                    <button className="calc-btn" onClick={handleCalcBackspace}>⌫</button>
                    <button className="calc-btn equals" onClick={handleCalcEquals}>=</button>
                  </div>
                </div>
              )}
              {window.id === 'music' && (
                <div className="music-player">
                  <div className="music-visualizer">
                    {Array(30).fill('').map((_, i) => (
                      <div
                        key={i}
                        className="visualizer-bar"
                        style={{ height: isPlaying ? `${Math.random() * 60 + 10}px` : '20px' }}
                      />
                    ))}
                  </div>
                  <div className="music-info">
                    <div className="music-title">{playlist[currentTrack].title}</div>
                    <div className="music-artist">{playlist[currentTrack].artist}</div>
                  </div>
                  <div className="music-progress">
                    <div className="music-progress-bar" onClick={(e) => {
                      const bar = e.currentTarget;
                      const rect = bar.getBoundingClientRect();
                      const percent = ((e.clientX - rect.left) / rect.width) * 100;
                      const track = playlist[currentTrack];
                      const [mins, secs] = track.duration.split(':').map(Number);
                      const totalSeconds = mins * 60 + secs;
                      setMusicProgress(Math.floor((percent / 100) * totalSeconds));
                    }}>
                      <div 
                        className="music-progress-fill" 
                        style={{ 
                          width: `${Math.min(100, (musicProgress / (() => {
                            const [mins, secs] = playlist[currentTrack].duration.split(':').map(Number);
                            return mins * 60 + secs;
                          })()) * 100)}%` 
                        }} 
                      />
                    </div>
                    <div className="music-time">
                      <span>{`${Math.floor(musicProgress / 60)}:${String(musicProgress % 60).padStart(2, '0')}`}</span>
                      <span>{playlist[currentTrack].duration}</span>
                    </div>
                  </div>
                  <div className="music-controls">
                    <button className="music-btn" onClick={handlePrevTrack}>⏮</button>
                    <button className="music-btn play" onClick={handlePlayPause}>{isPlaying ? '⏸' : '▶'}</button>
                    <button className="music-btn" onClick={handleNextTrack}>⏭</button>
                  </div>
                  <div className="music-playlist">
                    {playlist.map((track, index) => (
                      <div
                        key={index}
                        className={`playlist-item ${currentTrack === index ? 'active' : ''}`}
                        onClick={() => handleTrackChange(index)}
                      >
                        <span className="playlist-item-icon">{currentTrack === index && isPlaying ? '▶️' : '🎵'}</span>
                        <div className="playlist-item-info">
                          <div className="playlist-item-title">{track.title}</div>
                          <div className="playlist-item-artist">{track.artist}</div>
                        </div>
                        <span className="playlist-item-duration">{track.duration}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {window.id === 'settings' && (
                <div className="settings-app">
                  <div className="settings-sidebar">
                    <div 
                      className={`settings-nav-item ${settingsTab === 'appearance' ? 'active' : ''}`}
                      onClick={() => setSettingsTab('appearance')}
                    >
                      🎨 Appearance
                    </div>
                    <div 
                      className={`settings-nav-item ${settingsTab === 'sound' ? 'active' : ''}`}
                      onClick={() => setSettingsTab('sound')}
                    >
                      🔊 Sound
                    </div>
                    <div 
                      className={`settings-nav-item ${settingsTab === 'system' ? 'active' : ''}`}
                      onClick={() => setSettingsTab('system')}
                    >
                      ⚙️ System
                    </div>
                    <div 
                      className={`settings-nav-item ${settingsTab === 'about' ? 'active' : ''}`}
                      onClick={() => setSettingsTab('about')}
                    >
                      ℹ️ About
                    </div>
                  </div>
                  <div className="settings-content">
                    {settingsTab === 'appearance' && (
                      <>
                        <div className="settings-section">
                          <h3>Themes</h3>
                          <div className="theme-grid">
                            {Object.entries(themes).map(([name, t]) => (
                              <div
                                key={name}
                                className={`theme-option ${theme === name ? 'active' : ''}`}
                                onClick={() => handleThemeChange(name)}
                              >
                                <div
                                  className="theme-preview"
                                  style={{ background: `linear-gradient(135deg, ${t.primary}, ${t.secondary})` }}
                                />
                                <div className="theme-name">{name.charAt(0).toUpperCase() + name.slice(1)}</div>
                              </div>
                            ))}
                          </div>
                        </div>
                        <div className="settings-section">
                          <h3>Wallpapers</h3>
                          <div className="theme-grid">
                            {Object.entries(wallpapers).map(([name, w]) => (
                              <div
                                key={name}
                                className={`theme-option ${wallpaper === name ? 'active' : ''}`}
                                onClick={() => handleWallpaperChange(name)}
                              >
                                <div
                                  className="theme-preview"
                                  style={{ background: w.background }}
                                />
                                <div className="theme-name">{w.name}</div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </>
                    )}
                    {settingsTab === 'sound' && (
                      <>
                        <div className="settings-section">
                          <h3>Volume Control</h3>
                          <div className="settings-item">
                            <div>
                              <div className="settings-item-label">Master Volume</div>
                              <div className="settings-item-desc">Control overall system volume</div>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                              <span style={{ fontSize: '12px', color: 'var(--text-dim)' }}>{masterVolume}%</span>
                              <input
                                type="range"
                                min="0"
                                max="100"
                                value={masterVolume}
                                onChange={(e) => setMasterVolume(Number(e.target.value))}
                                className="volume-slider"
                              />
                            </div>
                          </div>
                        </div>
                        <div className="settings-section">
                          <h3>Sound Effects</h3>
                          <div className="settings-item">
                            <div>
                              <div className="settings-item-label">Interface Sounds</div>
                              <div className="settings-item-desc">Play sounds on clicks, notifications, and alerts</div>
                            </div>
                            <div 
                              className={`toggle ${soundEffectsEnabled ? 'active' : ''}`}
                              onClick={() => setSoundEffectsEnabled(!soundEffectsEnabled)}
                            >
                              <div className="toggle-knob"></div>
                            </div>
                          </div>
                          <div className="settings-item">
                            <div>
                              <div className="settings-item-label">Ambient Sounds</div>
                              <div className="settings-item-desc">Enable background ambient audio effects</div>
                            </div>
                            <div 
                              className={`toggle ${ambientSoundEnabled ? 'active' : ''}`}
                              onClick={() => setAmbientSoundEnabled(!ambientSoundEnabled)}
                            >
                              <div className="toggle-knob"></div>
                            </div>
                          </div>
                        </div>
                        <div className="settings-section">
                          <h3>Audio Output</h3>
                          <div className="settings-item">
                            <div>
                              <div className="settings-item-label">Output Device</div>
                              <div className="settings-item-desc">Select audio output device</div>
                            </div>
                            <select className="settings-select">
                              <option>System Default</option>
                              <option>Neural Link Audio</option>
                              <option>External Speakers</option>
                              <option>Headphones</option>
                            </select>
                          </div>
                        </div>
                      </>
                    )}
                    {settingsTab === 'system' && (
                      <>
                        <div className="settings-section">
                          <h3>System Preferences</h3>
                          <div className="settings-item">
                            <div>
                              <div className="settings-item-label">Startup Sound</div>
                              <div className="settings-item-desc">Play sound on system boot</div>
                            </div>
                            <div 
                              className={`toggle ${soundEnabled ? 'active' : ''}`}
                              onClick={() => setSoundEnabled(!soundEnabled)}
                            >
                              <div className="toggle-knob"></div>
                            </div>
                          </div>
                          <div className="settings-item">
                            <div>
                              <div className="settings-item-label">Animations</div>
                              <div className="settings-item-desc">Enable window and UI animations</div>
                            </div>
                            <div 
                              className={`toggle active`}
                              onClick={() => {}}
                            >
                              <div className="toggle-knob"></div>
                            </div>
                          </div>
                          <div className="settings-item">
                            <div>
                              <div className="settings-item-label">Scanlines Effect</div>
                              <div className="settings-item-desc">Show CRT scanlines overlay</div>
                            </div>
                            <div 
                              className={`toggle active`}
                              onClick={() => {}}
                            >
                              <div className="toggle-knob"></div>
                            </div>
                          </div>
                        </div>
                        <div className="settings-section">
                          <h3>Performance</h3>
                          <div className="settings-item">
                            <div>
                              <div className="settings-item-label">Power Mode</div>
                              <div className="settings-item-desc">Balance between performance and energy</div>
                            </div>
                            <select className="settings-select">
                              <option>Performance</option>
                              <option>Balanced</option>
                              <option>Power Saver</option>
                            </select>
                          </div>
                        </div>
                      </>
                    )}
                    {settingsTab === 'about' && (
                      <>
                        <div className="settings-section">
                          <div style={{ textAlign: 'center', padding: '20px' }}>
                            <div style={{ 
                              fontSize: '64px', 
                              marginBottom: '20px',
                              background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
                              WebkitBackgroundClip: 'text',
                              WebkitTextFillColor: 'transparent',
                              backgroundClip: 'text'
                            }}>
                              NEXUS-7
                            </div>
                            <h3 style={{ 
                              fontSize: '24px', 
                              color: 'var(--primary)',
                              marginBottom: '10px'
                            }}>
                              Quantum Operating System
                            </h3>
                            <p style={{ color: 'var(--text-dim)', marginBottom: '30px' }}>
                              Version 2.4.1 (Build 2024.12)
                            </p>
                          </div>
                          <div style={{ 
                            background: 'rgba(0, 0, 0, 0.2)', 
                            borderRadius: '8px', 
                            padding: '20px',
                            marginBottom: '20px'
                          }}>
                            <div className="settings-item-label" style={{ marginBottom: '15px' }}>System Information</div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                              <div>
                                <div style={{ fontSize: '11px', color: 'var(--text-dim)' }}>Kernel</div>
                                <div style={{ fontSize: '13px' }}>Quantum 5.18.0</div>
                              </div>
                              <div>
                                <div style={{ fontSize: '11px', color: 'var(--text-dim)' }}>Architecture</div>
                                <div style={{ fontSize: '13px' }}>x86_64-quantum</div>
                              </div>
                              <div>
                                <div style={{ fontSize: '11px', color: 'var(--text-dim)' }}>CPU</div>
                                <div style={{ fontSize: '13px' }}>Quantum Core i9</div>
                              </div>
                              <div>
                                <div style={{ fontSize: '11px', color: 'var(--text-dim)' }}>Memory</div>
                                <div style={{ fontSize: '13px' }}>64 TB Quantum RAM</div>
                              </div>
                              <div>
                                <div style={{ fontSize: '11px', color: 'var(--text-dim)' }}>Storage</div>
                                <div style={{ fontSize: '13px' }}>1 PB Neural SSD</div>
                              </div>
                              <div>
                                <div style={{ fontSize: '11px', color: 'var(--text-dim)' }}>Network</div>
                                <div style={{ fontSize: '13px' }}>Neural Link v4</div>
                              </div>
                            </div>
                          </div>
                          <div style={{ 
                            background: 'rgba(0, 0, 0, 0.2)', 
                            borderRadius: '8px', 
                            padding: '20px',
                            marginBottom: '20px'
                          }}>
                            <div className="settings-item-label" style={{ marginBottom: '15px' }}>Legal Information</div>
                            <div style={{ fontSize: '12px', color: 'var(--text-dim)', lineHeight: '1.8' }}>
                              <div style={{ marginBottom: '10px' }}>
                                <strong style={{ color: 'var(--text-primary)' }}>© 2024 NEXUS Technologies</strong>
                              </div>
                              <div style={{ marginBottom: '10px' }}>All rights reserved. NEXUS-7 OS is a quantum-grade operating system designed for next-generation computing.</div>
                              <div style={{ marginBottom: '10px' }}>Neural Interface compatibility certified. Quantum encryption enabled.</div>
                              <div>License: Enterprise Quantum Edition</div>
                            </div>
                          </div>
                          <div style={{ 
                            textAlign: 'center',
                            padding: '15px',
                            background: 'rgba(0, 240, 255, 0.1)',
                            borderRadius: '8px',
                            border: '1px solid var(--border)'
                          }}>
                            <div style={{ fontSize: '12px', color: 'var(--primary)' }}>
                              🚀 NEXUS-7: The Future of Computing is Here
                            </div>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              )}
              {window.id === 'monitor' && (
                <div className="system-monitor">
                  <div className="monitor-grid">
                    <div className="monitor-card">
                      <div className="monitor-card-title">
                        <span>CPU Usage</span>
                        <span>🖥️</span>
                      </div>
                      <div className="monitor-value">{cpu}%</div>
                      <div className="monitor-bar">
                        <div className="monitor-bar-fill" style={{ width: `${cpu}%` }} />
                      </div>
                      <div className="monitor-graph">
                        {Array(20).fill('').map((_, i) => (
                          <div key={i} className="graph-bar" style={{ height: `${Math.random() * 80 + 20}%` }} />
                        ))}
                      </div>
                      <div className="monitor-details">
                        <div className="monitor-detail">Cores: <span>128</span></div>
                        <div className="monitor-detail">Temp: <span>{40 + Math.floor(cpu * 0.3)}°C</span></div>
                      </div>
                    </div>
                    <div className="monitor-card">
                      <div className="monitor-card-title">
                        <span>Memory Usage</span>
                        <span>💾</span>
                      </div>
                      <div className="monitor-value">{memory}%</div>
                      <div className="monitor-bar">
                        <div className="monitor-bar-fill" style={{ width: `${memory}%` }} />
                      </div>
                      <div className="monitor-graph">
                        {Array(20).fill('').map((_, i) => (
                          <div key={i} className="graph-bar" style={{ height: `${Math.random() * 80 + 20}%` }} />
                        ))}
                      </div>
                      <div className="monitor-details">
                        <div className="monitor-detail">Total: <span>64 TB</span></div>
                        <div className="monitor-detail">Used: <span>{(memory / 100 * 64).toFixed(1)} TB</span></div>
                      </div>
                    </div>
                    <div className="monitor-card">
                      <div className="monitor-card-title">
                        <span>GPU Usage</span>
                        <span>🎮</span>
                      </div>
                      <div className="monitor-value">{gpu}%</div>
                      <div className="monitor-bar">
                        <div className="monitor-bar-fill" style={{ width: `${gpu}%` }} />
                      </div>
                      <div className="monitor-graph">
                        {Array(20).fill('').map((_, i) => (
                          <div key={i} className="graph-bar" style={{ height: `${Math.random() * 80 + 20}%` }} />
                        ))}
                      </div>
                      <div className="monitor-details">
                        <div className="monitor-detail">VRAM: <span>32 TB</span></div>
                        <div className="monitor-detail">Temp: <span>{45 + Math.floor(gpu * 0.3)}°C</span></div>
                      </div>
                    </div>
                    <div className="monitor-card">
                      <div className="monitor-card-title">
                        <span>Network</span>
                        <span>📡</span>
                      </div>
                      <div className="monitor-value">{network} Mb/s</div>
                      <div className="monitor-bar">
                        <div className="monitor-bar-fill" style={{ width: `${Math.min(100, network / 10)}%` }} />
                      </div>
                      <div className="monitor-graph">
                        {Array(20).fill('').map((_, i) => (
                          <div key={i} className="graph-bar" style={{ height: `${Math.random() * 80 + 20}%` }} />
                        ))}
                      </div>
                      <div className="monitor-details">
                        <div className="monitor-detail">Upload: <span>{Math.floor(network * 0.3)} Mb/s</span></div>
                        <div className="monitor-detail">Download: <span>{Math.floor(network * 0.7)} Mb/s</span></div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              {window.id === 'browser' && (
                <div className="browser-app">
                  <div className="browser-toolbar">
                    <div className="browser-nav-buttons">
                      <button
                        className="browser-nav-btn"
                        onClick={handleBrowserBack}
                        disabled={browserHistoryIndex <= 0}
                        title="Back"
                      >
                        ←
                      </button>
                      <button
                        className="browser-nav-btn"
                        onClick={handleBrowserForward}
                        disabled={browserHistoryIndex >= browserHistory.length - 1}
                        title="Forward"
                      >
                        →
                      </button>
                      <button
                        className="browser-nav-btn"
                        onClick={handleBrowserRefresh}
                        title="Refresh"
                      >
                        ↻
                      </button>
                      <button
                        className="browser-nav-btn"
                        onClick={handleBrowserHome}
                        title="Home"
                      >
                        🏠
                      </button>
                    </div>
                    <div className="browser-url-bar">
                      <span className="browser-url-icon">🔒</span>
                      <input
                        type="text"
                        className="browser-url-input"
                        value={browserUrl}
                        onChange={(e) => setBrowserUrl(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            let url = e.currentTarget.value.trim();
                            if (!url.startsWith('http://') && !url.startsWith('https://')) {
                              url = 'https://' + url;
                            }
                            handleBrowserNavigate(url);
                          }
                        }}
                        placeholder="Enter URL or search..."
                      />
                      <button
                        className="browser-go-btn"
                        onClick={() => {
                          let url = browserUrl.trim();
                          if (!url.startsWith('http://') && !url.startsWith('https://')) {
                            url = 'https://' + url;
                          }
                          handleBrowserNavigate(url);
                        }}
                      >
                        →
                      </button>
                    </div>
                  </div>
                  <div className="browser-bookmarks">
                    <button
                      className="bookmark-btn"
                      onClick={() => handleBrowserNavigate('https://www.wikipedia.org')}
                    >
                      📚 Wikipedia
                    </button>
                    <button
                      className="bookmark-btn"
                      onClick={() => handleBrowserNavigate('https://github.com/Anish-A-R/Vibe-coded')}
                    >
                      💻 GitHub
                    </button>
                    <button
                      className="bookmark-btn"
                      onClick={() => handleBrowserNavigate('https://www.instagram.com/__anishar__/')}
                    >
                      📸 Instagram
                    </button>
                    <button
                      className="bookmark-btn"
                      onClick={() => handleBrowserNavigate('https://www.w3schools.com')}
                    >
                      📚 W3Schools
                    </button>
                  </div>
                  <div className="browser-content">
                    <div className="browser-placeholder">
                      <div className="browser-placeholder-icon">🌐</div>
                      <div className="browser-placeholder-title">NEXUS Web Browser</div>
                      <div className="browser-placeholder-text">
                        Enter a URL or click a bookmark to open it in a new tab.<br/>
                        All links open externally for full functionality.
                      </div>
                      {browserUrl && (
                        <div className="browser-current-url">
                          <span className="browser-url-label">Current URL:</span>
                          <span className="browser-url-value">{browserUrl}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
              {window.id === 'game-rps' && (
                <div className="game-app">
                  <div className="game-header">
                    <div className="game-title">✊ Rock Paper Scissors</div>
                  </div>
                  <div className="game-content">
                    <div className="game-play-btn">
                      <button
                        className="game-launch-btn"
                        onClick={() => globalThis.open('https://anish-a-r.github.io/Vibe-coded/Rock%20,%20Paper%20and%20Scissor/index.html', '_blank', 'noopener,noreferrer')}
                      >
                        🎮 Play Game
                      </button>
                      <div className="game-info">
                        Click the button to play Rock Paper Scissors in a new tab
                      </div>
                    </div>
                  </div>
                </div>
              )}
              {window.id === 'game-rps-v2' && (
                <div className="game-app">
                  <div className="game-header">
                    <div className="game-title">🎮 Rock Paper Scissors V2</div>
                  </div>
                  <div className="game-content">
                    <div className="game-play-btn">
                      <button
                        className="game-launch-btn"
                        onClick={() => globalThis.open('https://anish-a-r.github.io/Vibe-coded/Rock%20Paper%20Scissors%20V2/main.html', '_blank', 'noopener,noreferrer')}
                      >
                        🎮 Play Game
                      </button>
                      <div className="game-info">
                        Click the button to play Rock Paper Scissors V2 in a new tab
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}

        {/* AI Assistant */}
        <div id={`ai-assistant`} className={aiVisible ? 'visible' : ''}>
          <div className="ai-header">
            <div className="ai-title">
              <div className="ai-status"></div>
              <span>NEXUS AI Assistant</span>
            </div>
            <span className="ai-close" onClick={() => setAiVisible(false)}>×</span>
          </div>
          <div className="ai-messages" ref={aiMessagesRef}>
            {aiMessages.map((msg, index) => (
              <div key={index} className={`ai-message ${msg.role}`}>
                <div className="ai-message-bubble">{msg.content}</div>
              </div>
            ))}
            {aiLoading && (
              <div className="ai-message assistant">
                <div className="ai-message-bubble loading">
                  <span className="loading-dots">Thinking</span>
                </div>
              </div>
            )}
          </div>
          <div className="ai-input-area">
            <input
              type="text"
              className="ai-input"
              placeholder="Ask me anything..."
              value={aiInput}
              onChange={(e) => setAiInput(e.target.value)}
              onKeyPress={handleAiKeyPress}
              disabled={aiLoading}
            />
            <button className="ai-send" onClick={handleAiSend} disabled={aiLoading || !aiInput.trim()}>
              ➤
            </button>
          </div>
        </div>

        {/* Context Menu */}
        <div
          id="context-menu"
          className={contextMenuVisible ? 'visible' : ''}
          style={{ left: contextMenuPosition.x, top: contextMenuPosition.y }}
          onClick={(e) => { e.stopPropagation(); setContextMenuVisible(false); }}
        >
          <div className="context-menu-item" onClick={() => { openWindow('terminal'); setContextMenuVisible(false); }}>⌨️ Open Terminal</div>
          <div className="context-menu-item" onClick={() => { openWindow('files'); setContextMenuVisible(false); }}>📁 Open File Explorer</div>
          <div className="context-menu-item" onClick={() => { openWindow('settings'); setContextMenuVisible(false); }}>⚙️ Settings</div>
          <div className="context-menu-separator"></div>
          <div className="context-menu-item" onClick={() => { setAiVisible(true); setContextMenuVisible(false); }}>🤖 AI Assistant</div>
          {showWeatherWidget ? (
            <div className="context-menu-item" onClick={() => { setShowWeatherWidget(false); setContextMenuVisible(false); }}>🌤️ Hide Weather</div>
          ) : (
            <div className="context-menu-item" onClick={() => { setShowWeatherWidget(true); setContextMenuVisible(false); }}>🌤️ Show Weather</div>
          )}
          <div className="context-menu-separator"></div>
          <div className="context-menu-item" onClick={() => { setContextMenuVisible(false); }}>🖼️ Change Wallpaper</div>
          <div className="context-menu-item" onClick={() => { openWindow('monitor'); setContextMenuVisible(false); }}>ℹ️ System Info</div>
        </div>

        {/* Icon Context Menu */}
        {iconContextMenuVisible && iconContextMenuFor && (
          <div
            id="icon-context-menu"
            className="visible"
            style={{ 
              left: iconContextMenuPosition.x, 
              top: iconContextMenuPosition.y,
              position: 'fixed',
              background: 'var(--bg-glass)',
              border: '1px solid var(--border)',
              borderRadius: '8px',
              padding: '8px 0',
              minWidth: '200px',
              backdropFilter: 'blur(10px)',
              zIndex: 1000,
              boxShadow: '0 10px 40px rgba(0, 0, 0, 0.5)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="context-menu-item" onClick={() => handleIconMenuAction('open', iconContextMenuFor)}>
              <span>▶️</span>
              <span style={{ marginLeft: '10px' }}>Open</span>
            </div>
            <div className="context-menu-separator"></div>
            <div className="context-menu-item" onClick={() => handleIconMenuAction('center', iconContextMenuFor)}>
              <span>🎯</span>
              <span style={{ marginLeft: '10px' }}>Center on Screen</span>
            </div>
            <div className="context-menu-item" onClick={() => handleIconMenuAction('resetPosition', iconContextMenuFor)}>
              <span>🔄</span>
              <span style={{ marginLeft: '10px' }}>Reset Position</span>
            </div>
            <div className="context-menu-separator"></div>
            <div className="context-menu-item" onClick={() => handleIconMenuAction('properties', iconContextMenuFor)}>
              <span>ℹ️</span>
              <span style={{ marginLeft: '10px' }}>Properties</span>
            </div>
            <div className="context-menu-item" onClick={() => handleIconMenuAction('hide', iconContextMenuFor)}>
              <span>👁️</span>
              <span style={{ marginLeft: '10px' }}>Hide Icon</span>
            </div>
          </div>
        )}

        {/* Left-Click Quick Action Menu */}
        {leftClickMenuVisible && (
          <div
            id="left-click-menu"
            className="visible"
            style={{ 
              position: 'fixed',
              left: Math.min(leftClickMenuPosition.x, window.innerWidth - 220),
              top: Math.min(leftClickMenuPosition.y, window.innerHeight - 300),
              background: 'var(--bg-glass)',
              border: '1px solid var(--border)',
              borderRadius: '12px',
              padding: '10px 0',
              minWidth: '200px',
              backdropFilter: 'blur(10px)',
              zIndex: 1000,
              boxShadow: '0 10px 40px rgba(0, 0, 0, 0.5)',
              animation: 'contextMenuIn 0.2s ease'
            }}
            onClick={(e) => { e.stopPropagation(); setLeftClickMenuVisible(false); }}
          >
            <div style={{ padding: '8px 16px', fontSize: '11px', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '1px' }}>
              Quick Actions
            </div>
            <div 
              className="context-menu-item"
              onClick={() => { 
                openWindow('terminal'); 
                setLeftClickMenuVisible(false); 
              }}
            >
              <span>⌨️</span>
              <span style={{ marginLeft: '10px' }}>New Terminal</span>
            </div>
            <div 
              className="context-menu-item"
              onClick={() => { 
                openWindow('notes'); 
                setLeftClickMenuVisible(false); 
              }}
            >
              <span>📝</span>
              <span style={{ marginLeft: '10px' }}>New Note</span>
            </div>
            <div 
              className="context-menu-item"
              onClick={() => { 
                openWindow('files'); 
                setLeftClickMenuVisible(false); 
              }}
            >
              <span>📁</span>
              <span style={{ marginLeft: '10px' }}>Open Files</span>
            </div>
            <div className="context-menu-separator"></div>
            <div style={{ padding: '8px 16px', fontSize: '11px', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '1px' }}>
              Applications
            </div>
            <div 
              className="context-menu-item"
              onClick={() => { 
                openWindow('calculator'); 
                setLeftClickMenuVisible(false); 
              }}
            >
              <span>🧮</span>
              <span style={{ marginLeft: '10px' }}>Calculator</span>
            </div>
            <div 
              className="context-menu-item"
              onClick={() => { 
                openWindow('music'); 
                setLeftClickMenuVisible(false); 
              }}
            >
              <span>🎵</span>
              <span style={{ marginLeft: '10px' }}>Music Player</span>
            </div>
            <div 
              className="context-menu-item"
              onClick={() => { 
                openWindow('monitor'); 
                setLeftClickMenuVisible(false); 
              }}
            >
              <span>📊</span>
              <span style={{ marginLeft: '10px' }}>System Monitor</span>
            </div>
            <div className="context-menu-separator"></div>
            <div 
              className="context-menu-item"
              onClick={() => { 
                setAiVisible(true); 
                setLeftClickMenuVisible(false); 
              }}
            >
              <span>🤖</span>
              <span style={{ marginLeft: '10px' }}>AI Assistant</span>
            </div>
            <div 
              className="context-menu-item"
              onClick={() => { 
                openWindow('settings'); 
                setLeftClickMenuVisible(false); 
              }}
            >
              <span>⚙️</span>
              <span style={{ marginLeft: '10px' }}>Settings</span>
            </div>
          </div>
        )}

        {/* Taskbar */}
        <div id="taskbar">
          <div id="start-button" onClick={() => setStartMenuVisible(!startMenuVisible)}>⬡</div>
          <div id="taskbar-apps">
            {windows.map(window => (
              <div
                key={window.id}
                className={`taskbar-app ${activeWindow === window.id && !minimizedWindows.includes(window.id) ? 'active' : ''}`}
                onClick={() => {
                  if (minimizedWindows.includes(window.id)) {
                    setMinimizedWindows(prev => prev.filter(id => id !== window.id));
                  } else if (activeWindow === window.id) {
                    minimizeWindow(window.id);
                  } else {
                    setActiveWindow(window.id);
                  }
                }}
                title={window.name}
              >
                <span>{window.icon}</span>
              </div>
            ))}
          </div>
          <div id="system-tray">
            <span
              className={`tray-icon ${activeTrayPanel === 'network' ? 'active' : ''}`}
              title="Network"
              onClick={(e) => handleTrayIconClick('network', e)}
            >📶</span>
            <span
              className={`tray-icon ${activeTrayPanel === 'volume' ? 'active' : ''}`}
              title="Volume"
              onClick={(e) => handleTrayIconClick('volume', e)}
            >🔊</span>
            <span
              className={`tray-icon ${activeTrayPanel === 'battery' ? 'active' : ''}`}
              title={`Battery ${batteryLevel}%${isCharging ? ' (Charging)' : ''}`}
              onClick={(e) => handleTrayIconClick('battery', e)}
            >{isCharging ? '⚡' : '🔋'}</span>
            <div
              id={`clock ${activeTrayPanel === 'calendar' ? 'active' : ''}`}
              className={activeTrayPanel === 'calendar' ? 'active' : ''}
              style={activeTrayPanel === 'calendar' ? {
                background: 'rgba(0, 240, 255, 0.15)',
                borderColor: 'rgba(0, 240, 255, 0.3)',
                boxShadow: '0 0 10px rgba(0, 240, 255, 0.3)'
              } : {}}
              title="Date & Time"
              onClick={(e) => handleTrayIconClick('calendar', e)}
            >
              <div id="clock-time">{mounted && currentTime ? currentTime.time : '--:--'}</div>
              <div id="clock-date">{mounted && currentTime ? currentTime.date : ''}</div>
            </div>
          </div>
        </div>

        {/* Tray Panels */}
        {/* Volume Panel */}
        <div
          className={`tray-panel ${activeTrayPanel === 'volume' ? 'visible' : ''}`}
          style={{
            left: `${trayPanelPosition.x - 140}px`,
            bottom: '75px'
          }}
        >
          <div className="tray-panel-header">
            <span className="tray-panel-header-icon">🔊</span>
            <span className="tray-panel-header-title">Volume Control</span>
          </div>
          <div className="tray-panel-content">
            <div className="tray-panel-row">
              <span className="tray-panel-label">Master Volume</span>
              <span className="tray-panel-value">{masterVolume}%</span>
            </div>
            <div className="volume-slider-container">
              <span>🔈</span>
              <input
                type="range"
                min="0"
                max="100"
                value={masterVolume}
                onChange={(e) => setMasterVolume(Number(e.target.value))}
              />
              <span>🔊</span>
            </div>
            <div className="tray-panel-row" style={{ marginTop: '16px' }}>
              <span className="tray-panel-label">Sound Effects</span>
              <span
                className="tray-panel-value"
                style={{ cursor: 'pointer', color: soundEffectsEnabled ? 'var(--primary)' : 'var(--text-dim)' }}
                onClick={() => setSoundEffectsEnabled(!soundEffectsEnabled)}
              >
                {soundEffectsEnabled ? 'ON' : 'OFF'}
              </span>
            </div>
            <div className="tray-panel-row">
              <span className="tray-panel-label">Ambient Sound</span>
              <span
                className="tray-panel-value"
                style={{ cursor: 'pointer', color: ambientSoundEnabled ? 'var(--primary)' : 'var(--text-dim)' }}
                onClick={() => setAmbientSoundEnabled(!ambientSoundEnabled)}
              >
                {ambientSoundEnabled ? 'ON' : 'OFF'}
              </span>
            </div>
            <div className="tray-panel-row" style={{ marginTop: '16px' }}>
              <span className="tray-panel-label">Cursor Style</span>
              <span className="tray-panel-value" style={{ color: 'var(--primary)' }}>
                {cursorStyles[cursorStyle]?.name || 'Default'}
              </span>
            </div>
            <div className="cursor-options">
              {Object.keys(cursorStyles).map((style) => (
                <button
                  key={style}
                  className={`cursor-option-btn ${cursorStyle === style ? 'active' : ''}`}
                  onClick={() => handleCursorChange(style)}
                  style={{ cursor: cursorStyles[style]?.cursor || 'default' }}
                >
                  {cursorStyles[style].name}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Battery Panel */}
        <div
          className={`tray-panel ${activeTrayPanel === 'battery' ? 'visible' : ''}`}
          style={{
            left: `${trayPanelPosition.x - 140}px`,
            bottom: '75px'
          }}
        >
          <div className="tray-panel-header">
            <span className="tray-panel-header-icon">{isCharging ? '⚡' : '🔋'}</span>
            <span className="tray-panel-header-title">Battery Status</span>
          </div>
          <div className="tray-panel-content">
            <div className="tray-panel-row">
              <span className="tray-panel-label">Charge Level</span>
              <span className="tray-panel-value">{batteryLevel}%</span>
            </div>
            <div className="battery-level-bar">
              <div className="battery-level-fill" style={{ width: `${batteryLevel}%` }}></div>
            </div>
            <div className="tray-panel-row" style={{ marginTop: '16px' }}>
              <span className="tray-panel-label">Status</span>
              <span className="tray-panel-value" style={{ color: isCharging ? 'var(--success)' : batteryLevel < 20 ? 'var(--error)' : 'var(--text-primary)' }}>
                {isCharging ? 'Charging' : batteryLevel < 20 ? 'Low Battery' : 'On Battery'}
              </span>
            </div>
            <div className="tray-panel-row">
              <span className="tray-panel-label">Time Remaining</span>
              <span className="tray-panel-value">{isCharging ? 'Calculating...' : '~4h 32m'}</span>
            </div>
            <div className="tray-panel-row">
              <span className="tray-panel-label">Battery Health</span>
              <span className="tray-panel-value">Excellent</span>
            </div>
          </div>
        </div>

        {/* Network Panel */}
        <div
          className={`tray-panel ${activeTrayPanel === 'network' ? 'visible' : ''}`}
          style={{
            left: `${trayPanelPosition.x - 140}px`,
            bottom: '75px'
          }}
        >
          <div className="tray-panel-header">
            <span className="tray-panel-header-icon">📶</span>
            <span className="tray-panel-header-title">Network</span>
          </div>
          <div className="tray-panel-content">
            <div className="network-item active">
              <span className="network-item-icon">📶</span>
              <div className="network-item-info">
                <div className="network-item-name">NEXUS-7 Network</div>
                <div className="network-item-status">Connected • 5 GHz</div>
              </div>
            </div>
            <div className="network-item">
              <span className="network-item-icon">📶</span>
              <div className="network-item-info">
                <div className="network-item-name">Guest Network</div>
                <div className="network-item-status">2.4 GHz • Secured</div>
              </div>
            </div>
            <div className="network-item">
              <span className="network-item-icon">📶</span>
              <div className="network-item-info">
                <div className="network-item-name">Office WiFi</div>
                <div className="network-item-status">2.4 GHz • Secured</div>
              </div>
            </div>
            <div className="tray-panel-row" style={{ marginTop: '16px' }}>
              <span className="tray-panel-label">IP Address</span>
              <span className="tray-panel-value">192.168.1.107</span>
            </div>
            <div className="tray-panel-row">
              <span className="tray-panel-label">Upload Speed</span>
              <span className="tray-panel-value">847 Mbps</span>
            </div>
            <div className="tray-panel-row">
              <span className="tray-panel-label">Download Speed</span>
              <span className="tray-panel-value">1.2 Gbps</span>
            </div>
          </div>
        </div>

        {/* Calendar Panel */}
        <div
          className={`tray-panel ${activeTrayPanel === 'calendar' ? 'visible' : ''}`}
          style={{
            left: `${trayPanelPosition.x - 140}px`,
            bottom: '75px'
          }}
        >
          <div className="tray-panel-header">
            <span className="tray-panel-header-icon">📅</span>
            <span className="tray-panel-header-title">Calendar</span>
          </div>
          <div className="tray-panel-content">
            <div style={{ textAlign: 'center', marginBottom: '12px' }}>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: 'var(--primary)' }}>
                {new Date().toLocaleDateString('en-US', { day: 'numeric' })}
              </div>
              <div style={{ fontSize: '14px', color: 'var(--text-dim)' }}>
                {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', year: 'numeric' })}
              </div>
            </div>
            <div className="calendar-grid">
              <div className="calendar-day-header">Sun</div>
              <div className="calendar-day-header">Mon</div>
              <div className="calendar-day-header">Tue</div>
              <div className="calendar-day-header">Wed</div>
              <div className="calendar-day-header">Thu</div>
              <div className="calendar-day-header">Fri</div>
              <div className="calendar-day-header">Sat</div>
              {(() => {
                const now = new Date();
                const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
                const firstDay = new Date(now.getFullYear(), now.getMonth(), 1).getDay();
                const today = now.getDate();
                const days = [];

                // Empty cells for days before the first day of month
                for (let i = 0; i < firstDay; i++) {
                  days.push(<div key={`empty-${i}`} className="calendar-day other-month"></div>);
                }

                // Days of the month
                for (let i = 1; i <= daysInMonth; i++) {
                  const isToday = i === today;
                  days.push(
                    <div key={i} className={`calendar-day ${isToday ? 'today' : ''}`}>
                      {i}
                    </div>
                  );
                }

                return days;
              })()}
            </div>
          </div>
        </div>

        {/* Start Menu */}
        <div id={`start-menu`} className={startMenuVisible ? 'visible' : ''}>
          <div id="start-menu-search">
            <input type="text" placeholder="Search apps, files, settings..." />
          </div>
          <div id="start-menu-apps">
            {apps.map(app => (
              <div
                key={app.id}
                className="start-menu-app"
                onClick={() => { openWindow(app.id); setStartMenuVisible(false); }}
              >
                <div className="start-menu-app-icon" style={{ color: app.color }}>{app.icon}</div>
                <div className="start-menu-app-label">{app.name}</div>
              </div>
            ))}
          </div>
          <div id="start-menu-footer">
            <div className="user-profile">
              <div className="user-avatar">👤</div>
              <span>{currentUser || 'Operator'}</span>
            </div>
            <button className="power-button" onClick={handleShutdown}>⏻ Shutdown</button>
          </div>
        </div>
      </div>
      )}
    </div>
  );
}
