# Frontend Collaborator Guide — The Roost Command Deck

Welcome to **The Roost Command Deck**! This document explains how the project is organized, how frontend and backend collaborate, and how you can build UI/UX features without getting blocked by backend development.

---

## 1. Collaboration Philosophy

We use an **Agile Contract-First Feature-Driven Development (FDD)** workflow:
- **Backend & Core Engine**: Built by Alexander & Marcus (Antigravity). We provide tested Rust commands, core state packages, and typed contracts.
- **Frontend & UI/UX**: Built by you. You have full freedom over visual layout, component ergonomics, animations, and user flow in React 19 + Tailwind CSS.
- **Contract-First Bridge**: Every backend capability is documented in [`docs/CONTRACTS.md`](./CONTRACTS.md) with exact TypeScript types, IPC names, and example payloads.
- **No Blocking**: You can build and test UI using either:
  1. The **Tauri Desktop Shell** (live native Rust backend with real filesystem writes).
  2. The **Browser Mock Bridge** (runs in standard Chrome/Firefox without compiling Rust).

---

## 2. The Two Editions Architecture

Our backend is architected to power two editions from one codebase:

| Feature Dimension | Edition A: Sanctum Sovereign (Personal & Studio) | Edition B: Commercial Prototype (Showcase / Sale) |
| :--- | :--- | :--- |
| **Primary Audience** | Taha Asadullah, studio developers, close friends | Prospective buyers, client demos, SaaS users |
| **Storage Backend** | Local POSIX filesystem & Obsidian vault (`TheFallenCrow`) | Decoupled Sandbox storage adapter (mock/cloud-ready) |
| **File Formats** | Pure standard Markdown (`.md`) with YAML frontmatter | Standardized notes + pre-loaded showcase demo datasets |
| **Social / Co-Working** | Private P2P Guild Tavern with integrated Chess study breaks | Multi-tenant preview mode & presentation dashboard |
| **Privacy / Cloud** | 100% offline-first; zero telemetry or analytics | Clean demo accounts without private personal notes |

When designing components, write them cleanly against the shared DTOs so UI components work identically in both editions.

---

## 3. Quick Start for Frontend Development

### Prerequisites
- Node.js `v20+` or `v26+`
- `npm` (npm workspaces are used across the repository)

### Running in Browser Mode (Fast UI Iteration)
To iterate purely on UI/UX with hot module replacement (HMR) without needing the Rust toolchain:
```bash
# From repository root:
npm install
npm run dev
```
Open [http://localhost:5173](http://localhost:5173). The frontend automatically detects it is outside Tauri and uses the mock bridge in [`src/api/ipc-bridge.ts`](../apps/desktop/src/api/ipc-bridge.ts) with localStorage persistence.

### Running with Native Desktop Backend (Tauri 2)
If you have Rust installed (`cargo`) and want full native filesystem integration:
```bash
# In projects/RoostDeck:
npm run tauri dev -w apps/desktop
```
This launches the native desktop window.

### Running All Tests
```bash
# Monorepo unit tests
npm test

# Production build check
npm run build
```

---

## 4. How Frontend Talks to Backend

All backend communication flows through [`apps/desktop/src/api/ipc-bridge.ts`](../apps/desktop/src/api/ipc-bridge.ts).

### Example: Creating a Note
```typescript
import { createNoteNative } from './api/ipc-bridge';

const newNote = await createNoteNative({
  realm: 'uni',             // 'uni' | 'work' | 'personal'
  title: 'Binary Search Trees',
  type: 'lecture',          // 'lecture' | 'sprint' | 'journal' | 'concept'
  tags: ['cs201', 'trees'],
  body: '# Binary Search Trees\n\nNotes go here...',
});

console.log('Created note at:', newNote.absolutePath);
```

### Requesting New Backend Features
If you need a new data field, a new calculation, or a new IPC command:
1. Open [`docs/CONTRACTS.md`](./CONTRACTS.md).
2. Add a quick proposal under **Pending / Requested Contracts** or ping the backend log.
3. The backend team will implement the Rust command, write automated tests, update the TypeScript types, and certify the contract.

---

## 5. Design Tokens & Styling Guidelines

- **Background Void**: `#07080B` (main window background)
- **Stone Plates**: `#13161F` (bento cards, modals)
- **Border Trim**: `#222738` (card borders, dividers)
- **Gold Accent (Astrolabe)**: `#C9A962` (active states, XP bars, streak stars)
- **Muted Ash**: `#8E95A5` (secondary text, keyboard shortcuts)
- **Typography**:
  - Headings / Prestige: `Cinzel`
  - Body / UI: `Inter`
  - Shortcuts / Code / Data: `JetBrains Mono`
- **Zero-Mouse Rule**: Ensure every clickable button has an associated keyboard shortcut (e.g. `j/k` selection, `Space` toggle, `Esc` dismiss).

---

## 6. Procedural Audio Engine

We have a zero-dependency Web Audio procedural synthesizer in [`src/audio/sound-fx.ts`](../apps/desktop/src/audio/sound-fx.ts):
- `playMechanicalClick()`: Subtly clicks when navigating lists (`j/k`).
- `playCelestialChime()`: Plays a clean crystal chime on task completion.
- `playFanfare()`: Multi-tone harmonic chord when leveling up.
You can trigger these anywhere in your UI components!
