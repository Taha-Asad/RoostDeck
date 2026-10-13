/**
 * @file QuickCaptureModal.tsx
 * @description Quick Note Capture Modal (FEAT-01).
 * 
 * GUIDE FOR UI/UX COLLABORATOR:
 * -----------------------------------------------------------------------------
 * 1. RESPONSIBILITY:
 *    Captures rapid thoughts/lectures/tasks directly into the local vault
 *    with Obsidian-compliant YAML frontmatter.
 * 2. KEYBOARD TRIGGERS:
 *    - Triggered globally via `n` or `Ctrl+K`.
 *    - `Enter` submits form.
 *    - `Esc` closes dialog.
 * 3. BACKEND CONTRACT:
 *    Calls `createNoteNative` which dispatches either through Tauri Rust IPC
 *    (in native desktop app) or local browser mock (in dev browser preview).
 */

import React, { useState, useEffect, useRef } from 'react';
import { NoteType, RealmType } from '@roost/fs-engine';
import { X, Sparkles, BookOpen, Briefcase, Compass } from 'lucide-react';
import { playMechanicalClick, playCelestialChime } from '../audio/sound-fx.ts';

interface QuickCaptureModalProps {
  isOpen: boolean;
  activeRealm: RealmType;
  onClose: () => void;
  onCreateNote: (params: { title: string; realm: RealmType; type: NoteType; tags: string[] }) => void;
}

export const QuickCaptureModal: React.FC<QuickCaptureModalProps> = ({
  isOpen,
  activeRealm,
  onClose,
  onCreateNote,
}) => {
  const [title, setTitle] = useState('');
  const [realm, setRealm] = useState<RealmType>(activeRealm);
  const [noteType, setNoteType] = useState<NoteType>('lecture');
  const [tagsInput, setTagsInput] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setRealm(activeRealm);
      if (activeRealm === 'uni') setNoteType('lecture');
      else if (activeRealm === 'work') setNoteType('sprint');
      else setNoteType('journal');
      setTitle('');
      setTagsInput('');
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen, activeRealm]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    playMechanicalClick();
    playCelestialChime();

    const tags = tagsInput
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    onCreateNote({
      title: title.trim(),
      realm,
      type: noteType,
      tags: tags.length > 0 ? tags : [realm, noteType],
    });

    onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="quick-capture-heading"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="stone-card w-full max-w-lg p-6 border-[var(--gold-primary)] shadow-[0_25px_70px_-12px_rgba(0,0,0,0.95),0_0_35px_var(--gold-glow)]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-[var(--stone-border)]">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[var(--gold-light)]" />
            <h2 id="quick-capture-heading" className="font-display text-sm tracking-wider font-bold text-[var(--ash-light)]">
              QUICK CAPTURE NOTE
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="text-[var(--ash-muted)] hover:text-white p-1 rounded-lg press-feedback"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Note Title Input */}
          <div>
            <label className="block text-xs font-mono text-[var(--ash-muted)] mb-1.5">
              NOTE TITLE <span className="text-[var(--gold-primary)]">*</span>
            </label>
            <input
              ref={inputRef}
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Operating Systems Paging Lecture 04"
              className="w-full px-4 py-2.5 rounded-xl bg-black/60 border border-[var(--stone-border)] text-sm text-[var(--ash-light)] placeholder-[var(--ash-muted)]/50 focus:outline-none focus:border-[var(--gold-primary)] focus:shadow-[0_0_12px_var(--gold-glow)] font-ui"
            />
          </div>

          {/* Realm Selector */}
          <div>
            <label className="block text-xs font-mono text-[var(--ash-muted)] mb-1.5">TARGET REALM</label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => {
                  setRealm('uni');
                  setNoteType('lecture');
                }}
                className={`py-2 px-3 rounded-xl border text-xs font-mono flex items-center justify-center gap-1.5 transition-all ${
                  realm === 'uni'
                    ? 'border-sky-500 bg-sky-950/40 text-sky-200 shadow-[0_0_10px_rgba(56,189,248,0.2)]'
                    : 'border-[var(--stone-border)] bg-black/40 text-[var(--ash-muted)] hover:border-sky-500/40'
                }`}
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>Uni</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setRealm('work');
                  setNoteType('sprint');
                }}
                className={`py-2 px-3 rounded-xl border text-xs font-mono flex items-center justify-center gap-1.5 transition-all ${
                  realm === 'work'
                    ? 'border-emerald-500 bg-emerald-950/40 text-emerald-200 shadow-[0_0_10px_rgba(52,211,153,0.2)]'
                    : 'border-[var(--stone-border)] bg-black/40 text-[var(--ash-muted)] hover:border-emerald-500/40'
                }`}
              >
                <Briefcase className="w-3.5 h-3.5" />
                <span>Office</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setRealm('personal');
                  setNoteType('journal');
                }}
                className={`py-2 px-3 rounded-xl border text-xs font-mono flex items-center justify-center gap-1.5 transition-all ${
                  realm === 'personal'
                    ? 'border-[var(--gold-primary)] bg-[rgba(201,169,98,0.15)] text-[var(--gold-light)] shadow-[0_0_10px_var(--gold-glow)]'
                    : 'border-[var(--stone-border)] bg-black/40 text-[var(--ash-muted)] hover:border-[var(--gold-primary)]/40'
                }`}
              >
                <Compass className="w-3.5 h-3.5" />
                <span>Sanctum</span>
              </button>
            </div>
          </div>

          {/* Template Type Picker */}
          <div>
            <label className="block text-xs font-mono text-[var(--ash-muted)] mb-1.5">NOTE TEMPLATE</label>
            <select
              value={noteType}
              onChange={(e) => setNoteType(e.target.value as NoteType)}
              className="w-full px-3 py-2 rounded-xl bg-black/60 border border-[var(--stone-border)] text-xs text-[var(--ash-light)] focus:outline-none focus:border-[var(--gold-primary)] font-mono"
            >
              <option value="lecture">Lecture Note (Invariants, Slides, Follow-ups)</option>
              <option value="assignment">Assignment Brief (Requirements, Tasks, Rubric)</option>
              <option value="sprint">Sprint Task (Acceptance Criteria, Commits)</option>
              <option value="meeting">Meeting Log (Agenda, Discussion, Actions)</option>
              <option value="journal">Dusk Journal (Wins, Stalls, Reflection)</option>
              <option value="note">General Note (Clean Markdown)</option>
            </select>
          </div>

          {/* Tags Field */}
          <div>
            <label className="block text-xs font-mono text-[var(--ash-muted)] mb-1.5">
              TAGS <span className="text-[10px] text-[var(--ash-muted)]/70">(comma separated)</span>
            </label>
            <input
              type="text"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              placeholder="e.g. cs401, memory, exam"
              className="w-full px-3 py-2 rounded-xl bg-black/60 border border-[var(--stone-border)] text-xs text-[var(--ash-light)] placeholder-[var(--ash-muted)]/50 focus:outline-none focus:border-[var(--gold-primary)] font-mono"
            />
          </div>

          {/* Actions */}
          <div className="pt-2 flex items-center justify-between">
            <span className="text-[10px] font-mono text-[var(--ash-muted)]">
              Press <kbd className="px-1 py-0.5 rounded bg-black">Enter</kbd> to Create |{' '}
              <kbd className="px-1 py-0.5 rounded bg-black">Esc</kbd> to Cancel
            </span>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={onClose}
                className="pill-control px-4 py-1.5 text-xs font-mono press-feedback"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!title.trim()}
                className="pill-control px-5 py-1.5 text-xs font-mono tabular-nums press-feedback bg-[rgba(201,169,98,0.2)] border-[var(--gold-primary)] text-[var(--gold-light)] hover:bg-[rgba(201,169,98,0.35)] shadow-[0_0_12px_var(--gold-glow)] disabled:opacity-40"
              >
                Create Note (+30 XP)
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
