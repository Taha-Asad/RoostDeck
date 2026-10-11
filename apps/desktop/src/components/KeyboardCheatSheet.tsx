import React from 'react';
import { X, Keyboard, Command } from 'lucide-react';

interface KeyboardCheatSheetProps {
  isOpen: boolean;
  onClose: () => void;
}

export const KeyboardCheatSheet: React.FC<KeyboardCheatSheetProps> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  const shortcuts = [
    { key: 'j / k', desc: 'Navigate up and down through daily bounties' },
    { key: 'Space', desc: 'Toggle complete on selected bounty (earn XP + chime)' },
    { key: 'n', desc: 'Instant Quick-Capture note modal' },
    { key: 'Ctrl + K', desc: 'Global Command Palette and search' },
    { key: 'g then u', desc: 'Jump to The Scholarium (Uni Desk)' },
    { key: 'g then o', desc: 'Jump to The Merchant Guild (Work Desk)' },
    { key: 'g then p', desc: 'Jump to The Inner Sanctum (Personal Life)' },
    { key: '?', desc: 'Toggle this keyboard cheat-sheet' },
    { key: 'Esc', desc: 'Close open dialogs or dismiss overlay' },
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
      onClick={onClose}
    >
      <div
        className="stone-card w-full max-w-md p-6 border-[var(--gold-primary)] shadow-[0_25px_70px_rgba(0,0,0,0.9),0_0_30px_var(--gold-glow)]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-[var(--stone-border)]">
          <div className="flex items-center gap-2">
            <Keyboard className="w-4 h-4 text-[var(--gold-light)]" />
            <h2 className="font-display text-sm tracking-wider font-bold text-[var(--ash-light)]">
              KEYBOARD SANCTUARY CHEAT-SHEET
            </h2>
          </div>
          <button onClick={onClose} className="text-[var(--ash-muted)] hover:text-white p-1">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-2.5">
          {shortcuts.map((sc) => (
            <div
              key={sc.key}
              className="flex items-center justify-between p-2.5 rounded-xl border border-[var(--stone-border)] bg-black/40 text-xs font-mono"
            >
              <span className="text-[var(--ash-light)]">{sc.desc}</span>
              <kbd className="px-2 py-0.5 rounded bg-[rgba(201,169,98,0.12)] border border-[var(--gold-primary)] text-[var(--gold-light)] font-bold">
                {sc.key}
              </kbd>
            </div>
          ))}
        </div>

        <div className="mt-4 pt-3 border-t border-[var(--stone-border)] flex items-center justify-between text-[11px] font-mono text-[var(--ash-muted)]">
          <span className="flex items-center gap-1">
            <Command className="w-3 h-3 text-[var(--gold-primary)]" /> ZERO-MOUSE MANDATE
          </span>
          <span>Press <kbd className="px-1 py-0.5 rounded bg-black">Esc</kbd> to Close</span>
        </div>
      </div>
    </div>
  );
};
