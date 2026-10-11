import { useEffect, useRef } from 'react';
import { playMechanicalClick } from '../audio/sound-fx.ts';

export interface KeyboardActions {
  onNextItem: () => void;
  onPrevItem: () => void;
  onToggleActiveItem: () => void;
  onOpenQuickCapture: () => void;
  onOpenCommandPalette: () => void;
  onToggleCheatSheet: () => void;
  onCloseModals: () => void;
  onSelectDesk: (desk: 'uni' | 'work' | 'personal') => void;
}

export function useKeyboard(actions: KeyboardActions) {
  const pendingPrefix = useRef<string | null>(null);
  const prefixTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      // 1. Check if user is typing in an input field
      const activeTag = (document.activeElement?.tagName || '').toLowerCase();
      const isInput = activeTag === 'input' || activeTag === 'textarea' || (document.activeElement as HTMLElement)?.isContentEditable;

      // Allow Escape and Ctrl+K even inside inputs
      if (e.key === 'Escape') {
        actions.onCloseModals();
        return;
      }

      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        playMechanicalClick();
        actions.onOpenCommandPalette();
        return;
      }

      if (isInput) return;

      // 2. Multi-key prefix handling (e.g. 'g' then 'u' / 'o' / 'p')
      if (pendingPrefix.current === 'g') {
        if (prefixTimer.current) clearTimeout(prefixTimer.current);
        pendingPrefix.current = null;

        if (e.key === 'u') {
          e.preventDefault();
          playMechanicalClick();
          actions.onSelectDesk('uni');
          return;
        } else if (e.key === 'o') {
          e.preventDefault();
          playMechanicalClick();
          actions.onSelectDesk('work');
          return;
        } else if (e.key === 'p') {
          e.preventDefault();
          playMechanicalClick();
          actions.onSelectDesk('personal');
          return;
        }
      }

      if (e.key === 'g') {
        e.preventDefault();
        pendingPrefix.current = 'g';
        prefixTimer.current = setTimeout(() => {
          pendingPrefix.current = null;
        }, 1000);
        return;
      }

      // 3. Single-key Vim navigation & action shortcuts
      switch (e.key) {
        case 'j':
        case 'ArrowDown':
          e.preventDefault();
          playMechanicalClick();
          actions.onNextItem();
          break;

        case 'k':
        case 'ArrowUp':
          e.preventDefault();
          playMechanicalClick();
          actions.onPrevItem();
          break;

        case ' ': // Space
          e.preventDefault();
          actions.onToggleActiveItem();
          break;

        case 'n':
          e.preventDefault();
          playMechanicalClick();
          actions.onOpenQuickCapture();
          break;

        case '?':
          e.preventDefault();
          playMechanicalClick();
          actions.onToggleCheatSheet();
          break;

        default:
          break;
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      if (prefixTimer.current) clearTimeout(prefixTimer.current);
    };
  }, [actions]);
}
