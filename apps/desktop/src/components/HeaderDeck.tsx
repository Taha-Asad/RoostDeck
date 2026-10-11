import React from 'react';
import { PlayerStats } from '@roost/core-gamify';
import { Flame, Shield, Zap, Volume2, VolumeX, Keyboard } from 'lucide-react';
import { isAudioEnabled, toggleAudio } from '../audio/sound-fx.ts';

interface HeaderDeckProps {
  player: PlayerStats;
  onOpenQuickCapture: () => void;
  onToggleCheatSheet: () => void;
}

export const HeaderDeck: React.FC<HeaderDeckProps> = ({
  player,
  onOpenQuickCapture,
  onToggleCheatSheet,
}) => {
  const [audioOn, setAudioOn] = React.useState(isAudioEnabled());

  const handleToggleSound = () => {
    const next = toggleAudio();
    setAudioOn(next);
  };

  const progressPercent = Math.min(100, Math.round((player.currentLevelXp / player.nextLevelXpRequired) * 100));

  return (
    <header className="stone-card px-6 py-4 flex flex-col md:flex-row items-center justify-between gap-4 border-stone-border">
      {/* Astrolabe Logo & Title */}
      <div className="flex items-center gap-4">
        <div className="relative w-12 h-12 flex items-center justify-center">
          <svg className="absolute inset-0 w-full h-full orbit-slow text-[var(--gold-primary)] opacity-40" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="46" fill="none" stroke="currentColor" strokeWidth="1" strokeDasharray="4 3" />
            <circle cx="50" cy="4" r="2.5" fill="currentColor" />
          </svg>
          <svg className="absolute inset-1 w-[38px] h-[38px] orbit-counter text-[var(--gold-light)] opacity-70" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="46" fill="none" stroke="currentColor" strokeWidth="1.2" strokeDasharray="6 4" />
          </svg>
          <div className="w-8 h-8 rounded-full bg-black border border-[var(--gold-primary)] flex items-center justify-center shadow-lg overflow-hidden">
            <span className="font-display text-xs text-[var(--gold-light)] font-bold">FC</span>
          </div>
        </div>

        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-display font-bold text-sm md:text-base tracking-wider text-[var(--ash-light)]">
              THE ROOST COMMAND DECK
            </h1>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[rgba(201,169,98,0.12)] text-[var(--gold-light)] border border-[rgba(201,169,98,0.3)]">
              SANCTUM
            </span>
          </div>
          <p className="text-xs font-mono text-[var(--ash-muted)] flex items-center gap-2 mt-0.5">
            <span>LEVEL {player.level}</span>
            <span className="text-[var(--gold-dark)]">•</span>
            <span className="text-[var(--gold-light)]">{player.rank}</span>
          </p>
        </div>
      </div>

      {/* Center: XP Bar & Stats */}
      <div className="w-full md:w-auto flex-1 max-w-md mx-2">
        <div className="flex justify-between items-center text-xs font-mono mb-1.5">
          <span className="text-[var(--ash-muted)]">XP PROGRESS</span>
          <span className="text-[var(--gold-light)] font-bold tabular-nums">
            {player.currentLevelXp} / {player.nextLevelXpRequired} XP ({progressPercent}%)
          </span>
        </div>
        <div className="w-full h-2.5 bg-black/60 rounded-full border border-[var(--stone-border)] overflow-hidden p-[1px]">
          <div
            className="h-full rounded-full transition-all duration-500 ease-out bg-gradient-to-r from-[var(--gold-dark)] via-[var(--gold-primary)] to-[var(--gold-light)] shadow-[0_0_10px_var(--gold-glow)]"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Right: Mana, Streak & Quick Actions */}
      <div className="flex items-center gap-2.5">
        {/* Void Mana */}
        <div
          className="pill-control px-3 py-1.5 text-xs font-mono"
          title="Void Mana (Focus Stamina). Burns during deep work, recharges on rest."
        >
          <Zap className="w-3.5 h-3.5 text-cyan-400" />
          <span className="text-cyan-200">{player.voidMana}/100</span>
        </div>

        {/* Consistency Streak */}
        <div
          className={`pill-control px-3 py-1.5 text-xs font-mono ${
            player.sanctuaryActive ? 'border-indigo-400/50 bg-indigo-950/30' : ''
          }`}
          title={player.sanctuaryActive ? 'Sanctuary Rest Active: Streak is frozen safely' : 'Daily Consistency Streak'}
        >
          {player.sanctuaryActive ? (
            <Shield className="w-3.5 h-3.5 text-indigo-400" />
          ) : (
            <Flame className="w-3.5 h-3.5 text-amber-500" />
          )}
          <span className={player.sanctuaryActive ? 'text-indigo-200' : 'text-amber-300'}>
            {player.streakDays}d {player.sanctuaryActive ? '(Frozen)' : ''}
          </span>
        </div>

        {/* Keyboard Helper */}
        <button
          onClick={onToggleCheatSheet}
          className="pill-control px-3 py-1.5 text-xs font-mono hover:text-[var(--gold-light)]"
          title="Toggle Keyboard Shortcuts (?)"
        >
          <Keyboard className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">?</span>
        </button>

        {/* Sound Toggle */}
        <button
          onClick={handleToggleSound}
          className="pill-control p-2 text-xs"
          title={audioOn ? 'Tactile Sound: Enabled' : 'Tactile Sound: Muted'}
        >
          {audioOn ? (
            <Volume2 className="w-3.5 h-3.5 text-[var(--gold-primary)]" />
          ) : (
            <VolumeX className="w-3.5 h-3.5 text-[var(--ash-muted)]" />
          )}
        </button>

        {/* Quick Capture Pill */}
        <button
          onClick={onOpenQuickCapture}
          className="pill-control px-3.5 py-1.5 text-xs font-mono bg-[rgba(201,169,98,0.12)] border-[var(--gold-primary)] text-[var(--gold-light)] hover:bg-[rgba(201,169,98,0.25)] shadow-[0_0_12px_var(--gold-glow)]"
          title="Quick Note Capture (n or Ctrl+K)"
        >
          <span>+ Note</span>
          <span className="hidden lg:inline text-[10px] text-[var(--ash-muted)] opacity-70">Ctrl+K</span>
        </button>
      </div>
    </header>
  );
};
