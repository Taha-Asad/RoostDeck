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

## 4. Upcoming FEAT-02 Contracts (Focus Altar & Void Mana)

*Currently under construction for backend implementation.*

### `start_focus_session`
```typescript
interface StartFocusArgs {
  durationMinutes: 25 | 50 | 90;
  realm: 'uni' | 'work' | 'personal';
  tag: string;
}

interface FocusSession {
  sessionId: string;
  startTime: string;
  durationMinutes: number;
  voidManaCost: number;     // e.g. 20
  active: boolean;
}
```

### `complete_focus_session`
```typescript
interface FocusResult {
  sessionId: string;
  completed: boolean;
  durationCompletedMinutes: number;
  xpAwarded: number;
  attributeBoost: { attribute: string; amount: number };
  voidManaRefundOrBurn: number;
}
```

---

## 5. Contract Changelog
- **2026-10-09 (FEAT-01)**: Certified initial IPC commands (`create_markdown_note`, `list_recent_notes`) and core `@roost/core-gamify` state machine.
- **2026-10-11**: Formalized dual-edition support (Sanctum Sovereign local paths vs. Commercial Prototype decoupled mock adapter).
