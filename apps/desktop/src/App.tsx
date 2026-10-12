import React, { useState, useEffect } from 'react';
import {
  GamificationState,
  RealmType,
  createInitialGamificationState,
  toggleBounty,
  toggleHabit,
  toggleSanctuaryMode,
  addExperience,
} from '@roost/core-gamify';
import { FileInfo } from '@roost/fs-engine';
import { HeaderDeck } from './components/HeaderDeck.tsx';
import { FocusAltarCard } from './components/FocusAltarCard.tsx';
import { BountiesCard } from './components/BountiesCard.tsx';
import { DesksCard } from './components/DesksCard.tsx';
import { HabitsCard } from './components/HabitsCard.tsx';
import { RecentFilesCard } from './components/RecentFilesCard.tsx';
import { QuickCaptureModal } from './components/QuickCaptureModal.tsx';
import { KeyboardCheatSheet } from './components/KeyboardCheatSheet.tsx';
import { useKeyboard } from './hooks/use-keyboard.ts';
import { createNoteNative, fetchRecentNotes } from './api/ipc-bridge.ts';
import { playMechanicalClick, playCelestialChime, playLevelUpFanfare } from './audio/sound-fx.ts';
import { FocusCompletionResult } from '@roost/core-gamify';


export const App: React.FC = () => {
  // 1. Gamification State with localStorage persistence
  const [gameState, setGameState] = useState<GamificationState>(() => {
    try {
      const saved = localStorage.getItem('roost_game_state');
      if (saved) return JSON.parse(saved);
    } catch {}
    return createInitialGamificationState();
  });

  // 2. Navigation State
  const [selectedBountyIdx, setSelectedBountyIdx] = useState(0);
  const [activeDesk, setActiveDesk] = useState<RealmType>('personal');
  const [recentFiles, setRecentFiles] = useState<FileInfo[]>([]);

  // 3. Modals State
  const [quickCaptureOpen, setQuickCaptureOpen] = useState(false);
  const [cheatSheetOpen, setCheatSheetOpen] = useState(false);

  // Sync state to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('roost_game_state', JSON.stringify(gameState));
    } catch {}
  }, [gameState]);

  // Load initial files
  useEffect(() => {
    fetchRecentNotes().then(setRecentFiles);
  }, []);

  // 4. Action Handlers with Sound & Level Detection
  const handleToggleBounty = (id: string) => {
    const prevLevel = gameState.player.level;
    const nextState = toggleBounty(gameState, id);
    setGameState(nextState);

    const targetBounty = gameState.bounties.find((b) => b.id === id);
    if (targetBounty && !targetBounty.completed) {
      if (nextState.player.level > prevLevel) {
        playLevelUpFanfare();
      } else {
        playCelestialChime();
      }
    } else {
      playMechanicalClick();
    }
  };

  const handleToggleHabit = (id: string) => {
    const prevLevel = gameState.player.level;
    const nextState = toggleHabit(gameState, id);
    setGameState(nextState);

    if (nextState.player.level > prevLevel) {
      playLevelUpFanfare();
    } else {
      playCelestialChime();
    }
  };

  const handleToggleSanctuary = () => {
    playMechanicalClick();
    setGameState(toggleSanctuaryMode(gameState));
  };

  const handleCreateNote = async (params: {
    title: string;
    realm: RealmType;
    type: any;
    tags: string[];
  }) => {
    const prevLevel = gameState.player.level;
    const newFile = await createNoteNative({
      title: params.title,
      realm: params.realm,
      type: params.type,
      tags: params.tags,
    });

    // Award +30 XP for capturing a note
    const updatedPlayer = addExperience(gameState.player, 30);
    setGameState({
      ...gameState,
      player: updatedPlayer,
      lastUpdated: new Date().toISOString(),
    });

    if (updatedPlayer.level > prevLevel) {
      playLevelUpFanfare();
    }

    setRecentFiles((prev) => [newFile, ...prev.filter((f) => f.fileName !== newFile.fileName)].slice(0, 10));
  };

  // 5. Focus Altar Completion Handler (FEAT-02)
  const handleFocusCompleted = (result: FocusCompletionResult) => {
    const prevLevel = gameState.player.level;
    let updatedPlayer = addExperience(gameState.player, result.xpEarned);

    // Apply attribute boost and mana recovery
    const attr = result.attributeBoost.attribute;
    updatedPlayer = {
      ...updatedPlayer,
      attributes: {
        ...updatedPlayer.attributes,
        [attr]: updatedPlayer.attributes[attr] + result.attributeBoost.amount,
      },
      voidMana: Math.min(updatedPlayer.maxVoidMana, updatedPlayer.voidMana + result.manaRecharged),
    };

    setGameState({
      ...gameState,
      player: updatedPlayer,
      lastUpdated: new Date().toISOString(),
    });

    if (updatedPlayer.level > prevLevel) {
      playLevelUpFanfare();
    } else {
      playCelestialChime();
    }
  };

  // 6. Connect Hybrid Keyboard Engine
  useKeyboard({
    onNextItem: () => {
      setSelectedBountyIdx((prev) => (prev + 1) % gameState.bounties.length);
    },
    onPrevItem: () => {
      setSelectedBountyIdx((prev) => (prev - 1 + gameState.bounties.length) % gameState.bounties.length);
    },
    onToggleActiveItem: () => {
      if (gameState.bounties[selectedBountyIdx]) {
        handleToggleBounty(gameState.bounties[selectedBountyIdx].id);
      }
    },
    onOpenQuickCapture: () => setQuickCaptureOpen(true),
    onOpenCommandPalette: () => setQuickCaptureOpen(true),
    onToggleCheatSheet: () => setCheatSheetOpen((prev) => !prev),
    onCloseModals: () => {
      setQuickCaptureOpen(false);
      setCheatSheetOpen(false);
    },
    onSelectDesk: (desk) => setActiveDesk(desk),
  });

  return (
    <div className="min-h-screen p-4 md:p-8 flex flex-col justify-between max-w-7xl mx-auto space-y-6">
      {/* Top Header Deck */}
      <HeaderDeck
        player={gameState.player}
        onOpenQuickCapture={() => setQuickCaptureOpen(true)}
        onToggleCheatSheet={() => setCheatSheetOpen(true)}
      />

      {/* Main Bento Grid */}
      <main className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 flex-1">
        {/* FEAT-02: High-Immersion Focus Altar */}
        <div className="md:col-span-2 lg:col-span-1">
          <FocusAltarCard
            currentMana={gameState.player.voidMana}
            activeRealm={activeDesk}
            onSessionCompleted={handleFocusCompleted}
          />
        </div>

        {/* Card 1: Today's Bounties (Dawn Rites) */}
        <BountiesCard
          bounties={gameState.bounties}
          selectedIndex={selectedBountyIdx}
          onToggleBounty={handleToggleBounty}
          onSelectIndex={setSelectedBountyIdx}
        />

        {/* Card 2: The Three Desks */}
        <DesksCard
          activeDesk={activeDesk}
          attributes={gameState.player.attributes}
          onSelectDesk={setActiveDesk}
        />

        {/* Card 3: Daily Vitality & Habits */}
        <HabitsCard
          habits={gameState.habits}
          sanctuaryActive={gameState.player.sanctuaryActive}
          onToggleHabit={handleToggleHabit}
          onToggleSanctuary={handleToggleSanctuary}
        />

        {/* Card 4: Vault & Recent Files */}
        <div className="md:col-span-2 lg:col-span-2">
          <RecentFilesCard files={recentFiles} vaultName="TheFallenCrow" />
        </div>
      </main>

      {/* Footer Status Bar */}
      <footer className="stone-card px-6 py-3 flex items-center justify-between text-xs font-mono text-[var(--ash-muted)]">
        <div className="flex items-center gap-3">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>ROOST DECK ONLINE</span>
          <span className="text-[var(--gold-dark)]">•</span>
          <span>ENVIRONMENT: LINUX (THE ROOST)</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="hidden sm:inline">HYBRID KEYBOARD: HOME ROW ACTIVE</span>
          <button
            onClick={() => setCheatSheetOpen(true)}
            className="hover:text-[var(--gold-light)] transition"
          >
            PRESS <kbd className="px-1.5 py-0.5 rounded bg-black/60 border border-stone-800 text-[10px]">?</kbd> FOR KEYS
          </button>
        </div>
      </footer>

      {/* Quick Capture Modal (Ctrl+K / n) */}
      <QuickCaptureModal
        isOpen={quickCaptureOpen}
        activeRealm={activeDesk}
        onClose={() => setQuickCaptureOpen(false)}
        onCreateNote={handleCreateNote}
      />

      {/* Keyboard Shortcuts Cheat-Sheet (?) */}
      <KeyboardCheatSheet
        isOpen={cheatSheetOpen}
        onClose={() => setCheatSheetOpen(false)}
      />
    </div>
  );
};
