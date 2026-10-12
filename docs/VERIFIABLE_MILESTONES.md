# The Roost Command Deck — Verifiable Milestones Matrix

**Governance Standard**: Crow Parliament Charter (Rule 5: Honest Test Execution, Rule 17: Empirical Verification)  
**Lead Auditor**: Elena Rostova (`ROSTOVA-QA` - Gate 4 DoQV)  
**Mechanical Audit Command**: `npm run verify` (or `bash scripts/verify_milestones.sh`)  
**Audit Rule**: No milestone may be claimed as completed without all acceptance criteria backed by passing automated test suites and the mechanical audit script exiting with status `0`.

---

## 1. Master Audit Summary

| Milestone | Title | Scope & Deliverables | Automated Test Suites | Status |
| :--- | :--- | :--- | :--- | :---: |
| **M1** | **Starting Cockpit & Native OS File Engine** | Monorepo layout, level curve, Crow ranks, Obsidian YAML frontmatter, path security guard, hybrid keyboard engine. | `xp.test.mjs` (5), `frontmatter.test.mjs` (2), Rust `security.rs` / `files.rs` (3) | **VERIFIED GREEN** |
| **M2** | **Focus Altar & Void Mana Engine** | Focus timers (25/50/90m), Void Mana burn & bounds, progressive XP scaling, attribute boosts, thread-safe session Mutex, browser mock bridge. | `focus.test.mjs` (8), Rust `focus.rs` (2), `smoke_scenario.mjs` (3) | **VERIFIED GREEN** |
| **M3** | **Learning Mode & FSRS Spaced Repetition** | Inline markdown card miner (`Q::A`, `==Cloze==`), FSRS-4.5 scheduling engine, review queue calculation, card rating transitions. | *Pending implementation* | **UPCOMING** |
| **M4** | **Dual Storage Engine (Sanctum POSIX vs Commercial SQLite)** | Modular storage abstraction (`IStorageEngine`), direct Obsidian vault POSIX adapter, embedded SQLite adapter (`~/.roost/data`) with pre-seeded demo content. | *Pending implementation* | **UPCOMING** |
| **M5** | **The Guild Tavern & Anti-Isolation Chess Break** | P2P / WebSocket co-working rooms, masked productivity telemetry firewall, embedded Chess engine (legal moves, check/checkmate, 5m blitz). | *Pending implementation* | **UPCOMING** |
| **M6** | **Companion View & Cross-Platform Packaging** | Mobile review shell (Tauri Mobile / PWA), offline-first card review sync, habit logger. | *Pending implementation* | **UPCOMING** |

---

## 2. Milestone 1: Starting Cockpit & Native OS File Engine

### Objective
Establish the sovereign foundational core: deterministic RPG math, Obsidian-compatible frontmatter parsing, and sandboxed native OS file operations.

### Observable Acceptance Criteria
* [x] **AC-1.1 (Level Progression Curve)**: Level XP requirement increases monotonically according to $XP = \lfloor 120 \times L^{1.45} \rfloor$. Levels 1 to 50 map accurately to the 6 Crow Ranks (`Fledgling Crow` to `Grand Sovereign Architect`). Surplus XP rolls over without loss.  
  * *Verification*: `node --test packages/core-gamify/tests/xp.test.mjs` $\rightarrow$ `pass 5, fail 0`.
* [x] **AC-1.2 (Obsidian Frontmatter Round-Trip)**: YAML frontmatter serializer and parser preserve strict markdown compatibility. Parsing extracted metadata returns exact titles, tags, and realm classifications without data corruption.  
  * *Verification*: `node --test packages/fs-engine/tests/frontmatter.test.mjs` $\rightarrow$ `pass 2, fail 0`.
* [x] **AC-1.3 (Filesystem Security Boundary)**: Native Rust file writer rejects directory traversal attacks containing parent navigators (`..`), null bytes, or paths outside the designated workspace. Slug generator sanitizes titles into POSIX-safe filenames.  
  * *Verification*: `cargo test --manifest-path apps/desktop/src-tauri/Cargo.toml -- commands::security` $\rightarrow$ `pass 2, fail 0`.
* [x] **AC-1.4 (Zero-Mouse Keyboard Engine)**: Hybrid keyboard listener drives `j/k` list selection, `Space` toggle, `g u/o/p` desk jumps, `n`/`Ctrl+K` quick capture, and `?` cheat sheet.  
  * *Verification*: Production TypeScript build compiles without JSX/type errors (`npm run build`).

---

## 3. Milestone 2: Focus Altar & Void Mana Engine

### Objective
Provide deep flow session state management, Void Mana economics to prevent digital burnout, and progressive attribute progression.

### Observable Acceptance Criteria
* [x] **AC-2.1 (Calibrated Mana Costs & Bounds)**: 25m focus requires 15 Void Mana; 50m requires 30; 90m requires 50. If player has less mana than required, session initialization throws `INSUFFICIENT_VOID_MANA` and aborts.  
  * *Verification*: `packages/core-gamify/tests/focus.test.mjs` (tests 1, 3, 4).
* [x] **AC-2.2 (Timer State Transitions)**: Focus session executes state machine transitions: `active` $\rightarrow$ `paused` $\rightarrow$ `active` $\rightarrow$ `completed`. Ticking decreases `remainingSeconds` and increases `elapsedSeconds` without dropping below 0.  
  * *Verification*: `packages/core-gamify/tests/focus.test.mjs` (tests 5, 6).
* [x] **AC-2.3 (Progressive XP & Attribute Scaling)**: Completing a session awards calibrated XP (25m $\rightarrow$ 50 XP, 50m $\rightarrow$ 120 XP, 90m $\rightarrow$ 250 XP). Boosts the realm attribute (+3/+7/+15 to `intellect` for Uni, `craft` for Work, or `vitality` for Personal) and grants +5 mana recovery.  
  * *Verification*: `packages/core-gamify/tests/focus.test.mjs` (test 7).
* [x] **AC-2.4 (Session Abandonment Penalty)**: Aborting a session transitions status to `abandoned`, awards 0 XP, and retains deducted Void Mana.  
  * *Verification*: `packages/core-gamify/tests/focus.test.mjs` (test 8).
* [x] **AC-2.5 (Native Rust Thread-Safe Session Mutex)**: Rust backend manages session state via `Mutex<Option<FocusSessionState>>`. Rejects duplicate active sessions with `SESSION_ALREADY_ACTIVE`. Exposes 7 typed IPC commands.  
  * *Verification*: `cargo test --manifest-path apps/desktop/src-tauri/Cargo.toml -- commands::focus` $\rightarrow$ `pass 2, fail 0`.
* [x] **AC-2.6 (Collaborator Dual-Mode Parity)**: Frontend bridge in `apps/desktop/src/api/ipc-bridge.ts` mirrors 100% of native IPC signatures with browser mock fallback, enabling full UI development without a Rust toolchain.  
  * *Verification*: Full workspace build (`npm run build`) clean with 0 TypeScript errors.

---

## 4. Milestone 3: Learning Mode & FSRS Spaced Repetition (Upcoming)

### Objective
Automate flashcard generation from lecture notes and schedule active-recall reviews using the Free Spaced Repetition Scheduler (FSRS-4.5) algorithm.

### Observable Acceptance Criteria
* [ ] **AC-3.1 (Markdown Card Mining)**: Card extractor scans raw markdown files and extracts:
  - Standard Q&A: `Question text :: Answer text`
  - Inline Cloze: `Memory is divided into ==pages==.`
  - Multi-line card blocks: `<!-- card --> ... <!-- endcard -->`
* [ ] **AC-3.2 (FSRS-4.5 Scheduling Engine)**: Pure TypeScript/Rust implementation of the DSR (Difficulty, Stability, Retrievability) memory model.
  - Computes next interval (days) given review rating: `Again` (1), `Hard` (2), `Good` (3), `Easy` (4).
  - Preserves retrievability decay formula: $R(t) = (1 + F \times \frac{t}{S})^{-w}$.
* [ ] **AC-3.3 (Review Queue Engine)**: Given a card deck and current timestamp, calculates due cards, new cards, and learning cards.
* [ ] **AC-3.4 (Automated Test Suite)**: Unit tests verifying card parsing accuracy, interval mathematical boundaries, and stability updates.

---

## 5. Milestone 4: Dual Storage Engine (Upcoming)

### Objective
Provide clean architectural decoupling between the Personal Sanctum (Obsidian POSIX filesystem) and the Commercial Prototype (embedded SQLite with demo accounts).

### Observable Acceptance Criteria
* [ ] **AC-4.1 (Unified Storage Contract)**: Common interface `IStorageEngine` defining:
  - `saveNote(note)`, `getNote(id)`, `listNotes(filter)`, `deleteNote(id)`.
  - `loadGamifyState()`, `saveGamifyState(state)`.
* [ ] **AC-4.2 (Sanctum POSIX Implementation)**: Reads and writes directly to Obsidian vault (`TheFallenCrow`) with atomic file writes.
* [ ] **AC-4.3 (Commercial SQLite Implementation)**: Reads and writes to local SQLite database (`~/.roost/data/roost.db`). Includes auto-migration schema and pre-populated demo database (Computer Science Student profile, Studio Software Engineer profile).
* [ ] **AC-4.4 (Runtime Mode Switching)**: Mode configurable via `roost.config.json` or CLI flag (`--edition=commercial` vs `--edition=sanctum`).

---

## 6. How to Run the Mechanical Verification Harness

Any developer, collaborator, or CI system can verify all current milestone acceptance criteria by running:

```bash
# In projects/RoostDeck:
npm run verify
```

**Expected Exit Output**:
```text
==============================================================================
   ROOST COMMAND DECK — VERIFIABLE MILESTONES MECHANICAL AUDIT HARNESS        
==============================================================================
Project Root: /run/media/thefoolishcrow/New Volume/Obsidian/TheFallenCrow/projects/RoostDeck
Timestamp:    ...

--- [1/4] Auditing Monorepo Unit Test Suites ---
  [PASS] Monorepo unit tests pass cleanly (15/15 tests green across core packages)
--- [2/4] Auditing Native Tauri Rust Backend Tests ---
  [PASS] Rust backend cargo tests pass cleanly (5/5 unit & IPC security tests green)
--- [3/4] Auditing TypeScript & Production Vite Build ---
  [PASS] Full workspace production build clean (0 TypeScript / Vite bundling errors)
--- [4/4] Auditing End-to-End Milestone Smoke Scenario ---
  [PASS] End-to-End Scenario: XP curves, YAML frontmatter, Focus timers & Mana bounds verified

==============================================================================
   AUDIT PASSED: ALL VERIFIABLE MILESTONE INVARIANTS CONFIRMED GREEN (0 FAILS)
==============================================================================
```
