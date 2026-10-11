# The Roost Command Deck 🦅

> **Sovereign Gamified Life Engine & Dual-Edition Productivity Ecosystem**  
> Tailored for Taha Asadullah (*The Fallen Crow*), studio developers, and keyboard-first knowledge workers.

---

## 1. Overview

**The Roost Command Deck** is an everyday digital sanctuary and command cockpit built to eliminate mouse friction, combat isolation, and turn intense laptop life (University $\rightarrow$ Work $\rightarrow$ Home) into an intrinsically rewarding RPG journey.

### Core Pillars
- **Zero-Mouse Mandate**: Full Vim-style keyboard navigation (`j/k` selection, `Space` toggle, `n` quick capture, `g u/o/p` desk switches, `?` cheat sheet).
- **The Three Desks**:
  - **The Scholarium (Academic)**: CS lectures, assignments, and FSRS spaced repetition.
  - **The Merchant Guild (Commercial)**: Studio projects, client sprints, release governance.
  - **The Inner Sanctum (Personal)**: Daily codex, reflection, habit rituals, and Sanctuary Rest.
- **The Guild Tavern**: Anti-isolation co-working room with shared focus timers and built-in **Chess** study breaks.
- **Intrinsic Progression**: Real-world attribute growth (**Intellect**, **Craft**, **Vitality**) with Void Mana dynamics and burnout prevention.

---

## 2. Dual-Edition Architecture

The codebase is architected with a decoupled modular backend supporting two runtime targets:

| Dimension | Edition A: Sanctum Sovereign (Studio & Friends) | Edition B: Commercial Prototype (Showcase / Sale) |
| :--- | :--- | :--- |
| **Audience** | Taha Asadullah, close friends, studio internal team | Potential buyers, client demonstrations, SaaS users |
| **Filesystem** | Unrestricted native POSIX filesystem & Obsidian vault (`TheFallenCrow`) | Decoupled Sandbox storage adapter (mock/cloud-ready) |
| **Data Format** | 100% standard Markdown (`.md`) with YAML frontmatter | Standard notes + pre-loaded showcase demo datasets |
| **Social** | Private P2P Guild Tavern with encrypted focus sessions | Presentation mode & multi-tenant demo preview |
| **Privacy** | 100% sovereign & local; zero telemetry | Clean demo accounts without private personal notes |

---

## 3. Team & Collaborative Workflow

We operate on an **Agile Contract-First Feature-Driven Development (FDD)** model:

- **Backend & Systems Engineering**: Led by Alexander Cross & Marcus Sterling (Antigravity). We build Rust backend services, typed domain state engines, filesystem/SQLite storage, and automated test suites.
- **Frontend & UI/UX**: Built by the UI collaborator in React 19 + Tailwind CSS.
- **Living Contract Bridge**: All IPC commands, TypeScript interfaces, and events are documented in [`docs/CONTRACTS.md`](./docs/CONTRACTS.md).
- **Collaborator Guide**: See [`docs/FRONTEND_COLLABORATOR_GUIDE.md`](./docs/FRONTEND_COLLABORATOR_GUIDE.md) for setup and mock bridges.

---

## 4. Repository Structure

```text
projects/RoostDeck/
├── apps/
│   └── desktop/               # Tauri 2 Desktop Shell + React 19 Cockpit
│       ├── src/               # React 19 UI, Tailwind CSS, Web Audio synthesizer
│       └── src-tauri/         # Rust backend (tokio, IPC commands, security guards)
├── packages/
│   ├── core-gamify/           # Pure TS Level Curve, Crow Ranks, Void Mana Engine
│   └── fs-engine/             # Pure TS Obsidian Frontmatter & Note Templates
├── docs/
│   ├── CONTRACTS.md           # Single source of truth for IPC & API contracts
│   └── FRONTEND_COLLABORATOR_GUIDE.md  # Onboarding guide for UI/UX developers
├── requirements/
│   ├── BRD.md                 # Business Requirements Document (Dual Editions & FDD)
│   ├── SRS.md                 # IEEE 830 Software Requirements Specification
│   └── GUILD_PRIVACY_IMPLICATIONS_REPORT.md  # Zero-knowledge privacy spec
├── package.json               # Root npm workspace configuration
└── project.json               # Crow Parliament project registry metadata
```

---

## 5. Development & Testing Commands

### Install Dependencies
```bash
npm install
```

### Browser Dev Mode (Fast UI/UX Iteration)
```bash
npm run dev
# Opens at http://localhost:5173 with automatic browser mock bridge
```

### Native Desktop Dev Mode (Tauri 2 + Rust)
```bash
npm run tauri dev -w apps/desktop
```

### Run Automated Tests
```bash
# Run all workspace unit tests
npm test

# Run Rust backend tests
cargo test --manifest-path apps/desktop/src-tauri/Cargo.toml
```

### Production Build
```bash
npm run build
```

---

## 6. Current Status & Roadmap
- [x] **FEAT-01: The Starting Cockpit & Zero-Mouse Command Deck** (10/10 automated tests green, native window verified).
- [ ] **FEAT-02: High-Immersion Focus Altar & Void Mana Engine** (Backend timers, void depletion state machine, ambient soundscape presets).
- [ ] **FEAT-03: Learning Mode & Automated FSRS Spaced Repetition** (Markdown card mining, FSRS-4.5 algorithm).
- [ ] **FEAT-04: Hybrid Note Editor & Bidirectional Knowledge Graph** (TipTap/CodeMirror, wikilinks).
- [ ] **FEAT-05: Zero-Knowledge Guild Network & Chess Study Break** (P2P WebSocket relay, E2EE chat, chess engine).
- [ ] **FEAT-06: Mobile Companion View** (Tauri Mobile / PWA review deck).

---
*Governed by Crow Parliament for The Foolish Crow Studio.*
