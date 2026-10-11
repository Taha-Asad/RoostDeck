import { NoteCreateDTO, FileInfo } from '@roost/fs-engine';
import { generateNoteContent } from '@roost/fs-engine';
import {
  FocusCompletionResult,
  FocusDuration,
  FocusSessionState,
  RealmType,
  calculateAttributeBoost,
  calculateFocusXpReward,
  calculateManaCost,
} from '@roost/core-gamify';

// Check if running inside Tauri runtime
const isTauri = typeof window !== 'undefined' && '__TAURI_INTERNALS__' in window;


export async function createNoteNative(dto: NoteCreateDTO): Promise<FileInfo> {
  const { fullContent, metadata } = generateNoteContent(dto);

  if (isTauri) {
    try {
      const { invoke } = await import('@tauri-apps/api/core');
      const res = await invoke<FileInfo>('create_markdown_note', {
        realm: dto.realm,
        title: dto.title,
        noteType: dto.type,
        tags: metadata.tags,
        content: fullContent,
      });
      return res;
    } catch (err) {
      console.error('Tauri IPC failed, falling back to local simulation:', err);
    }
  }

  // Fallback for browser mode / development preview
  const slug = dto.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  const fileName = `${slug}.md`;
  const relativePath = `${dto.realm === 'uni' ? 'Academic' : dto.realm === 'work' ? 'Commercial' : 'Sanctum'}/${fileName}`;

  const mockFile: FileInfo = {
    absolutePath: `/TheFallenCrow/${relativePath}`,
    relativePath,
    fileName,
    title: dto.title,
    realm: dto.realm,
    type: dto.type,
    createdAt: metadata.created,
    modifiedAt: metadata.created,
    sizeBytes: fullContent.length,
    tags: metadata.tags,
  };

  // Cache in localStorage recent files
  try {
    const existing = JSON.parse(localStorage.getItem('roost_recent_files') || '[]');
    const updated = [mockFile, ...existing.filter((f: FileInfo) => f.fileName !== fileName)].slice(0, 15);
    localStorage.setItem('roost_recent_files', JSON.stringify(updated));
  } catch {}

  return mockFile;
}

export async function fetchRecentNotes(): Promise<FileInfo[]> {
  if (isTauri) {
    try {
      const { invoke } = await import('@tauri-apps/api/core');
      return await invoke<FileInfo[]>('list_recent_notes', { limit: 10 });
    } catch (err) {
      console.warn('Tauri list_recent_notes fallback:', err);
    }
  }

  try {
    const cached = localStorage.getItem('roost_recent_files');
    if (cached) return JSON.parse(cached);
  } catch {}

  // Initial seed files
  return [
    {
      absolutePath: '/TheFallenCrow/Academic/os-virtual-memory.md',
      relativePath: 'Academic/os-virtual-memory.md',
      fileName: 'os-virtual-memory.md',
      title: 'Operating Systems: Virtual Memory & Paging',
      realm: 'uni',
      type: 'lecture',
      createdAt: '2026-10-09T00:30:00Z',
      modifiedAt: '2026-10-09T00:30:00Z',
      sizeBytes: 2450,
      tags: ['cs401', 'lecture'],
    },
    {
      absolutePath: '/TheFallenCrow/Commercial/corbel-fts5-fix.md',
      relativePath: 'Commercial/corbel-fts5-fix.md',
      fileName: 'corbel-fts5-fix.md',
      title: 'Corbel ERP SQLite FTS5 Stabilization',
      realm: 'work',
      type: 'sprint',
      createdAt: '2026-10-08T18:00:00Z',
      modifiedAt: '2026-10-08T18:00:00Z',
      sizeBytes: 3120,
      tags: ['corbel', 'sqlite'],
    },
    {
      absolutePath: '/TheFallenCrow/Sanctum/2026-10-08-codex.md',
      relativePath: 'Sanctum/2026-10-08-codex.md',
      fileName: '2026-10-08-codex.md',
      title: 'Daily Codex & Evening Reflection',
      realm: 'personal',
      type: 'journal',
      createdAt: '2026-10-08T22:00:00Z',
      modifiedAt: '2026-10-08T22:00:00Z',
      sizeBytes: 1150,
      tags: ['journal', 'mindset'],
    },
  ];
}

// ---------------------------------------------------------------------------
// FEAT-02: Focus Altar & Void Mana IPC Bridge
// ---------------------------------------------------------------------------

let mockActiveSession: FocusSessionState | null = null;

export async function startFocusSessionNative(
  durationMinutes: FocusDuration,
  realm: RealmType,
  label: string,
  ambientSoundscape?: 'void_drone' | 'celestial_rain' | 'deep_binaural' | 'none'
): Promise<FocusSessionState> {
  if (isTauri) {
    try {
      const { invoke } = await import('@tauri-apps/api/core');
      return await invoke<FocusSessionState>('start_focus_session', {
        durationMinutes,
        realm,
        label,
        ambientSoundscape: ambientSoundscape || null,
      });
    } catch (err) {
      console.warn('Tauri start_focus_session failed, falling back to local simulation:', err);
    }
  }

  // Browser Mock Simulation
  const totalSeconds = durationMinutes * 60;
  const session: FocusSessionState = {
    id: `mock_focus_${Date.now()}`,
    config: {
      durationMinutes,
      realm,
      label,
      ambientSoundscape,
    },
    status: 'active',
    totalDurationSeconds: totalSeconds,
    remainingSeconds: totalSeconds,
    elapsedSeconds: 0,
    voidManaCost: calculateManaCost(durationMinutes),
    startedAt: new Date().toISOString(),
  };

  mockActiveSession = session;
  return session;
}

export async function tickFocusSessionNative(elapsedDeltaSeconds: number): Promise<FocusSessionState> {
  if (isTauri) {
    try {
      const { invoke } = await import('@tauri-apps/api/core');
      return await invoke<FocusSessionState>('tick_focus_session', {
        elapsedDeltaSeconds,
      });
    } catch (err) {
      console.warn('Tauri tick_focus_session failed, falling back to local simulation:', err);
    }
  }

  if (!mockActiveSession || mockActiveSession.status !== 'active') {
    throw new Error('NO_ACTIVE_SESSION: No session is currently running.');
  }

  const newElapsed = Math.min(mockActiveSession.totalDurationSeconds, mockActiveSession.elapsedSeconds + elapsedDeltaSeconds);
  const newRemaining = Math.max(0, mockActiveSession.totalDurationSeconds - newElapsed);

  mockActiveSession = {
    ...mockActiveSession,
    elapsedSeconds: newElapsed,
    remainingSeconds: newRemaining,
  };

  return mockActiveSession;
}

export async function pauseFocusSessionNative(): Promise<FocusSessionState> {
  if (isTauri) {
    try {
      const { invoke } = await import('@tauri-apps/api/core');
      return await invoke<FocusSessionState>('pause_focus_session');
    } catch (err) {
      console.warn('Tauri pause_focus_session failed, falling back to local simulation:', err);
    }
  }

  if (!mockActiveSession || mockActiveSession.status !== 'active') {
    throw new Error('CANNOT_PAUSE: Session is not currently active.');
  }

  mockActiveSession = {
    ...mockActiveSession,
    status: 'paused',
    pausedAt: new Date().toISOString(),
  };

  return mockActiveSession;
}

export async function resumeFocusSessionNative(): Promise<FocusSessionState> {
  if (isTauri) {
    try {
      const { invoke } = await import('@tauri-apps/api/core');
      return await invoke<FocusSessionState>('resume_focus_session');
    } catch (err) {
      console.warn('Tauri resume_focus_session failed, falling back to local simulation:', err);
    }
  }

  if (!mockActiveSession || mockActiveSession.status !== 'paused') {
    throw new Error('CANNOT_RESUME: Session is not paused.');
  }

  mockActiveSession = {
    ...mockActiveSession,
    status: 'active',
    pausedAt: undefined,
  };

  return mockActiveSession;
}

export async function completeFocusSessionNative(): Promise<FocusCompletionResult> {
  if (isTauri) {
    try {
      const { invoke } = await import('@tauri-apps/api/core');
      return await invoke<FocusCompletionResult>('complete_focus_session');
    } catch (err) {
      console.warn('Tauri complete_focus_session failed, falling back to local simulation:', err);
    }
  }

  if (!mockActiveSession) {
    throw new Error('NO_ACTIVE_SESSION: No session to complete.');
  }

  const completedSession: FocusSessionState = {
    ...mockActiveSession,
    status: 'completed',
    remainingSeconds: 0,
    elapsedSeconds: mockActiveSession.totalDurationSeconds,
    completedAt: new Date().toISOString(),
  };

  const xpEarned = calculateFocusXpReward(mockActiveSession.config.durationMinutes);
  const boost = calculateAttributeBoost(mockActiveSession.config.durationMinutes, mockActiveSession.config.realm);

  mockActiveSession = null;

  return {
    session: completedSession,
    xpEarned,
    attributeBoost: boost,
    manaRecharged: 5,
    nextState: null as any,
  };
}

export async function abandonFocusSessionNative(): Promise<FocusSessionState> {
  if (isTauri) {
    try {
      const { invoke } = await import('@tauri-apps/api/core');
      return await invoke<FocusSessionState>('abandon_focus_session');
    } catch (err) {
      console.warn('Tauri abandon_focus_session failed, falling back to local simulation:', err);
    }
  }

  if (!mockActiveSession) {
    throw new Error('NO_ACTIVE_SESSION: No session to abandon.');
  }

  const abandonedSession: FocusSessionState = {
    ...mockActiveSession,
    status: 'abandoned',
    abandonedAt: new Date().toISOString(),
  };

  mockActiveSession = null;
  return abandonedSession;
}

export async function getActiveFocusSessionNative(): Promise<FocusSessionState | null> {
  if (isTauri) {
    try {
      const { invoke } = await import('@tauri-apps/api/core');
      return await invoke<FocusSessionState | null>('get_active_focus_session');
    } catch (err) {
      console.warn('Tauri get_active_focus_session fallback:', err);
    }
  }

  return mockActiveSession;
}

