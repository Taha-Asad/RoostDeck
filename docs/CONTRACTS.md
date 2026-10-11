# Backend IPC & API Contracts — The Roost Command Deck

This document serves as the single source of truth for all data contracts, TypeScript interfaces, and Tauri IPC commands between the backend and frontend.

---

## 1. Native Tauri IPC Commands (Rust Backend)

### `create_markdown_note`
Atomically writes a standard Markdown (`.md`) note to the filesystem with YAML frontmatter.

- **Rust Handler**: `commands::files::create_markdown_note`
- **Security**: Guarded by canonicalization and parent-directory escape protection. Rejects traversal attacks (`..`).
- **Signature (Frontend)**:
```typescript
import { invoke } from '@tauri-apps/api/core';

interface CreateNoteArgs {
  realm: 'uni' | 'work' | 'personal';
  title: string;
  noteType: string;      // e.g. 'lecture' | 'sprint' | 'journal'
  tags: string[];        // e.g. ['cs401', 'operating-systems']
  content: string;       // Full markdown content including frontmatter
}

const note = await invoke<FileInfo>('create_markdown_note', {
  realm: 'uni',
  title: 'Operating Systems: Virtual Memory',
  noteType: 'lecture',
  tags: ['cs401'],
  content: '---\ntitle: ...\n---\n# Content',
});
```

---

### `list_recent_notes`
Scans the active workspace directories (`Academic/`, `Commercial/`, `Sanctum/`) and returns recent notes.

- **Rust Handler**: `commands::files::list_recent_notes`
- **Signature (Frontend)**:
```typescript
interface ListRecentNotesArgs {
  limit?: number;        // Default: 10
}

const recentNotes = await invoke<FileInfo[]>('list_recent_notes', { limit: 15 });
```

---

## 2. Core Data Models (`@roost/fs-engine`)

### `FileInfo`
```typescript
export interface FileInfo {
  absolutePath: string;   // Full POSIX path (e.g. /home/.../workspace/Academic/paging.md)
  relativePath: string;   // Path relative to workspace (e.g. Academic/paging.md)
  fileName: string;       // e.g. paging.md
  title: string;          // Human-readable title
  realm: 'uni' | 'work' | 'personal';
  type: string;           // Note template category
  createdAt: string;      // ISO 8601 string
  modifiedAt: string;     // ISO 8601 string
  sizeBytes: number;      // File size in bytes
  tags: string[];         // Tag strings
}
```

### `NoteCreateDTO`
```typescript
export interface NoteCreateDTO {
  realm: 'uni' | 'work' | 'personal';
  title: string;
  type: 'lecture' | 'concept' | 'sprint' | 'bugfix' | 'journal' | 'reflection';
  tags?: string[];
  body?: string;
  courseId?: string;      // For academic desk
  clientName?: string;    // For commercial desk
}
```

---

## 3. Gamification Domain Contracts (`@roost/core-gamify`)

### `GamifyState`
```typescript
export interface GamifyState {
  level: number;
  currentXp: number;
  totalXp: number;
  streakDays: number;
  sanctuaryRestActive: boolean; // Streak freeze protection
  voidMana: number;            // 0 - 100
  attributes: {
    intellect: number;         // Boosted by academic tasks
    craft: number;             // Boosted by work & engineering
    vitality: number;          // Boosted by habits & personal care
  };
  bounties: Bounty[];
}

export interface Bounty {
  id: string;
  title: string;
  xpReward: number;
  attributeTarget: 'intellect' | 'craft' | 'vitality';
  completed: boolean;
  realm: 'uni' | 'work' | 'personal';
}
```

### Crow Rank Thresholds
```typescript
export type CrowRank =
  | 'Fledgling'                     // Level 1-4
  | 'Corvid Scout'                  // Level 5-9
  | 'Night Watcher'                 // Level 10-19
  | 'High Rook'                     // Level 20-34
  | 'Raven Sovereign'               // Level 35-49
  | 'Grand Sovereign Architect';    // Level 50+
```

---

## 4. FEAT-02: Focus Altar & Void Mana Engine (Certified)

The Focus Altar backend coordinates deep flow sessions, timer synchronization, Void Mana consumption, and attribute progression.

### TypeScript Imports
```typescript
import {
  FocusDuration,           // 25 | 50 | 90
  FocusSessionStatus,      // 'idle' | 'active' | 'paused' | 'completed' | 'abandoned'
  FocusSessionConfig,
  FocusSessionState,
  FocusCompletionResult,
  calculateManaCost,       // 25->15, 50->30, 90->50
  calculateFocusXpReward,  // 25->50, 50->120, 90->250
} from '@roost/core-gamify';
```

### Tauri IPC Commands & Client Bridge Methods
All methods are available directly from `apps/desktop/src/api/ipc-bridge.ts`:

#### 1. `startFocusSessionNative`
Starts a focus timer and deducts Void Mana from the player.
```typescript
import { startFocusSessionNative } from '../api/ipc-bridge';

// Throws error if another session is already active or if mana is insufficient
const session = await startFocusSessionNative(25, 'uni', 'Operating Systems Paging', 'void_drone');
console.log('Session started:', session.id, 'Remaining seconds:', session.remainingSeconds);
```

#### 2. `tickFocusSessionNative`
Advances elapsed time and decreases remaining time. Call every second in UI `useEffect` timer.
```typescript
import { tickFocusSessionNative } from '../api/ipc-bridge';

const updated = await tickFocusSessionNative(1); // advances by 1 second
console.log(updated.remainingSeconds);
```

#### 3. `pauseFocusSessionNative` & `resumeFocusSessionNative`
Pauses and resumes the active focus timer.
```typescript
import { pauseFocusSessionNative, resumeFocusSessionNative } from '../api/ipc-bridge';

const paused = await pauseFocusSessionNative();
const resumed = await resumeFocusSessionNative();
```

#### 4. `completeFocusSessionNative`
Completes the session when time reaches zero (or user marks complete), awarding scaled XP, attribute boosts, and mana recovery.
```typescript
import { completeFocusSessionNative } from '../api/ipc-bridge';

const result = await completeFocusSessionNative();
console.log('XP Earned:', result.xpEarned);               // 50 / 120 / 250
console.log('Attribute Boost:', result.attributeBoost);   // e.g. { attribute: 'intellect', amount: 3 }
console.log('Mana Recharged:', result.manaRecharged);     // +5
```

#### 5. `abandonFocusSessionNative`
Prematurely aborts the session. Spent Void Mana is **not** refunded and awards **0 XP**.
```typescript
import { abandonFocusSessionNative } from '../api/ipc-bridge';

const abandoned = await abandonFocusSessionNative();
```

#### 6. `getActiveFocusSessionNative`
Checks on app boot whether a session is currently running.
```typescript
import { getActiveFocusSessionNative } from '../api/ipc-bridge';

const activeSession = await getActiveFocusSessionNative();
if (activeSession) {
  console.log('Restoring in-progress timer:', activeSession.remainingSeconds);
}
```

---

## 5. Contract Changelog
- **2026-10-11 (FEAT-02 Certified)**: Completed Focus Altar and Void Mana Engine. Added 6 native Rust IPC commands, thread-safe session mutex, and browser mock bridge parity. 20/20 automated tests green.
- **2026-10-11**: Formalized dual-edition support (Sanctum Sovereign local paths vs. Commercial Prototype decoupled mock adapter).
- **2026-10-09 (FEAT-01 Certified)**: Initial IPC commands (`create_markdown_note`, `list_recent_notes`) and core `@roost/core-gamify` state machine.

