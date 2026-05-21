# ✊✋✌️ 3D Rock Paper Scissors

A polished, interactive **Rock Paper Scissors** game built with vanilla HTML, CSS, and JavaScript — featuring smooth 3D card flip animations, an AI opponent powered by Markov chain predictions, friend personalities, and a local 2-player pass-and-play mode.

---

## 🎮 Features

### 🤖 VS AI Mode
- **Advanced AI brain** using a multi-layer decision engine:
  - **Frequency analysis** — tracks which moves you throw most often
  - **Markov chain** — learns your move transition patterns (e.g. rock → paper tendencies)
  - **Meta-strategy** — predicts your next move and counters it
- Live **probability bars** update after every round showing the AI's read on you
- Running scoreboard with win / draw / loss tracking

### 👥 Friend Mode
Play against 6 unique AI friends, each with their own personality and move bias:

| Friend | Personality | Bias |
|--------|------------|------|
| 😎 Alex | Aggressive | Loves rock |
| 🦋 Mia | Wildcard | Truly random |
| 🧠 Dan | Overthinker | Avoids scissors |
| 🌸 Zara | Gentle | Paper fan |
| 🦁 Leo | Confident | Rock spammer |
| 🌙 Nyx | Mystical | Scissors fanatic |

Each friend has custom taunts that trigger on their wins.

### 🎮 2-Player Pass & Play
- Enter custom names for both players
- Each player picks **secretly** — their panel locks as soon as they choose so the other can't peek
- Hit **Reveal** once both are locked in — a countdown runs and both cards flip simultaneously
- Board auto-resets after each round

### 📊 Stats
- Your move frequency breakdown (vs AI)
- Full match history (last 15 rounds) with AI probability reads per round
- One-click data reset

---

## ✨ Card Flip Animation

The 3D card flip uses CSS `transform-style: preserve-3d` with `backface-visibility: hidden` on both faces. The flip is driven by toggling a `.flipped` class that applies `rotateY(180deg)` with a smooth cubic-bezier easing curve. A `pulse` keyframe fires after the transition ends for a satisfying bounce on reveal.

---

## 🚀 Getting Started

No dependencies. No build step. Just open the file.

```bash
git clone https://github.com/your-username/rock-paper-scissors-3d.git
cd rock-paper-scissors-3d
open index.html
```

Or drop `index.html` into any static host (GitHub Pages, Netlify, Vercel).

---

## 🗂️ Project Structure

```
rock-paper-scissors-3d/
├── index.html      # All game logic, styles, and markup in one file
└── README.md
```

---

## 🧠 How the AI Works

```
Player history
     │
     ├─► Frequency map  ──────────────────────────┐
     │   (rock/paper/scissors usage %)             │
     │                                             ▼
     └─► Markov chain   ──► Weighted blend ──► Predicted move
         (prev → next                              │
          transition)                              ▼
                                          Counter-move selection
                                          (+ 12% random noise)
```

The Markov chain weight grows with sample size (capped at 70%) so early game is more random and becomes more strategic as it learns your patterns.

---

## 🛠️ Built With

- **HTML5** — semantic markup
- **CSS3** — 3D transforms, keyframe animations, CSS variables for light/dark theming
- **Vanilla JavaScript** — no frameworks, no dependencies

---

## 📱 Compatibility

Works in all modern browsers. Fully responsive — playable on desktop and mobile.

---



> Made with ❤️ and a little too much game theory(Basically AI).
