import { NoteCreateDTO, FileInfo } from '@roost/fs-engine';
import { generateNoteContent } from '@roost/fs-engine';

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
