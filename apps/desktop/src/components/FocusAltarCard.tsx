/**
 * @file FocusAltarCard.tsx
 * @description UI Component representing the High-Immersion Focus Altar (FEAT-02).
 * 
 * GUIDE FOR UI/UX COLLABORATOR:
 * -----------------------------------------------------------------------------
 * 1. RESPONSIBILITY:
 *    Renders the deep work timer, Void Mana consumption badge, flow state controls,
 *    and ambient soundscape toggles.
 * 
 * 2. STATE DECOUPLING:
 *    All timer math and backend IPC communication are abstracted in `useFocusAltar`.
 *    You can freely restyle, re-theme, or redesign the visuals in this component
 *    without touching the backend or timing logic.
 * 
 * 3. KEYBOARD SHORTCUTS INTEGRATION:
 *    - `f`: Can be mapped to toggle the Focus Altar or focus duration picker.
 *    - `Space`: Pause/Resume active focus timer.
 *    - `Esc`: Abort/Cancel active session.
 * 
 * 4. DESIGN TOKENS:
 *    - Void Background: `bg-[var(--void-card)]` or `bg-[#13161F]`
 *    - Gold Accent: `text-[var(--gold-light)]`, `border-[var(--gold-primary)]`
 *    - Muted Ash: `text-[var(--ash-muted)]`
 */

import React, { useState } from 'react';
import {
  FocusDuration,
  FocusCompletionResult,
  FocusSessionState,
  RealmType,
} from '@roost/core-gamify';
import { useFocusAltar } from '../hooks/use-focus-altar.ts';
import { Play, Pause, Square, Zap, Clock, ShieldCheck, Flame, Radio } from 'lucide-react';

interface FocusAltarCardProps {
  currentMana: number;
  activeRealm: RealmType;
  onSessionCompleted: (result: FocusCompletionResult) => void;
  onSessionAbandoned?: (session: FocusSessionState) => void;
}

export const FocusAltarCard: React.FC<FocusAltarCardProps> = ({
  currentMana,
  activeRealm,
  onSessionCompleted,
  onSessionAbandoned,
}) => {
  const [selectedDuration, setSelectedDuration] = useState<FocusDuration>(25);
  const [label, setLabel] = useState('Deep Flow Session');
  const [soundscape, setSoundscape] = useState<'void_drone' | 'celestial_rain' | 'deep_binaural' | 'none'>('void_drone');

  const {
    session,
    isFocusing,
    isPaused,
    timeRemainingFormatted,
    progressPercent,
    error,
    startSession,
    pauseSession,
    resumeSession,
    abandonSession,
    completeSession,
  } = useFocusAltar({
    onSessionCompleted,
    onSessionAbandoned,
  });

  // Mana costs for the three standard flow rituals
  const manaCost = selectedDuration === 25 ? 15 : selectedDuration === 50 ? 30 : 50;
  const xpReward = selectedDuration === 25 ? 50 : selectedDuration === 50 ? 120 : 250;
  const hasEnoughMana = currentMana >= manaCost;

  const handleStart = async () => {
    try {
      await startSession(selectedDuration, activeRealm, label, soundscape);
    } catch {}
  };

  return (
    <section
      aria-labelledby="focus-altar-heading"
      className="stone-card p-6 flex flex-col justify-between relative overflow-hidden group"
    >
      {/* Background Decorative Radial Glow */}
      <div
        className={`absolute -top-16 -right-16 w-48 h-48 rounded-full blur-3xl pointer-events-none transition-opacity duration-700 ${
          isFocusing ? 'bg-[rgba(201,169,98,0.18)] opacity-100' : 'bg-[rgba(201,169,98,0.04)] opacity-50'
        }`}
        aria-hidden="true"
      />

      {/* Header: Title & Realm Badge */}
      <div className="flex items-center justify-between z-10 mb-4">
        <div className="flex items-center gap-3">
          <div
            className={`w-9 h-9 rounded-xl border flex items-center justify-center transition-colors ${
              isFocusing
                ? 'bg-[rgba(201,169,98,0.2)] border-[var(--gold-primary)] text-[var(--gold-light)] animate-pulse'
                : 'bg-black/40 border-stone-800 text-[var(--ash-muted)]'
            }`}
          >
            <Clock className="w-4 h-4" />
          </div>
          <div>
            <h2 id="focus-altar-heading" className="font-display font-semibold text-sm tracking-wide text-[var(--ash-light)]">
              FOCUS ALTAR
            </h2>
            <p className="text-xs font-mono text-[var(--ash-muted)]">
              {isFocusing ? (isPaused ? 'SESSION PAUSED' : 'DEEP IMMERSION ACTIVE') : 'FLOW RITUALS & VOID MANA'}
            </p>
          </div>
        </div>

        {/* Void Mana Indicator */}
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/50 border border-stone-800 text-xs font-mono">
          <Zap className="w-3.5 h-3.5 text-cyan-400" />
          <span className="text-[var(--ash-light)]">{currentMana}</span>
          <span className="text-[var(--ash-muted)] text-[10px]">MANA</span>
        </div>
      </div>

      {/* Main Interactive Altar State */}
      <div className="flex-1 flex flex-col items-center justify-center py-4 z-10">
        {isFocusing ? (
          /* Active Timer View */
          <div className="flex flex-col items-center space-y-4 w-full">
            {/* Digital Timer Display */}
            <div className="relative flex flex-col items-center justify-center">
              <span className="font-mono tabular-nums text-5xl md:text-6xl font-bold tracking-tight text-[var(--gold-light)] drop-shadow-md">
                {timeRemainingFormatted}
              </span>
              <span className="text-xs font-mono text-[var(--ash-muted)] mt-1 tracking-wider uppercase">
                {session?.config.label} • {session?.config.durationMinutes}M RITUAL
              </span>
            </div>

            {/* Progress Gauge */}
            <div className="w-full max-w-xs space-y-1.5">
              <div
                role="progressbar"
                aria-valuenow={progressPercent}
                aria-valuemin={0}
                aria-valuemax={100}
                className="w-full h-2 rounded-full bg-stone-900 border border-stone-800 overflow-hidden"
              >
                <div
                  className="h-full bg-gradient-to-r from-[var(--gold-dark)] to-[var(--gold-primary)] transition-all duration-500"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
              <div className="flex justify-between text-[10px] font-mono tabular-nums text-[var(--ash-muted)]">
                <span>{progressPercent}% COMPLETE</span>
                <span>+{xpReward} XP UPON FINISH</span>
              </div>
            </div>

            {/* Action Buttons: Pause, Resume, Complete, Abort */}
            <div className="flex items-center gap-3 pt-2">
              {isPaused ? (
                <button
                  type="button"
                  onClick={resumeSession}
                  className="px-4 py-2 rounded-xl bg-[var(--gold-primary)] hover:bg-[var(--gold-light)] text-black font-semibold text-xs font-mono flex items-center gap-2 transition press-feedback"
                >
                  <Play className="w-3.5 h-3.5 fill-current" /> RESUME
                </button>
              ) : (
                <button
                  type="button"
                  onClick={pauseSession}
                  className="px-4 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-[var(--ash-light)] text-xs font-mono flex items-center gap-2 transition border border-stone-700 press-feedback"
                >
                  <Pause className="w-3.5 h-3.5 fill-current" /> PAUSE
                </button>
              )}

              <button
                type="button"
                onClick={completeSession}
                className="px-4 py-2 rounded-xl bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-800/80 text-emerald-300 text-xs font-mono flex items-center gap-2 transition press-feedback"
              >
                <ShieldCheck className="w-3.5 h-3.5" /> COMPLETE
              </button>

              <button
                type="button"
                onClick={abandonSession}
                className="px-3 py-2 rounded-xl bg-rose-950/40 hover:bg-rose-900/60 border border-rose-900/40 text-rose-300 text-xs font-mono flex items-center gap-1.5 transition press-feedback"
                title="Abandon without XP reward"
              >
                <Square className="w-3 h-3 fill-current" /> ABORT
              </button>
            </div>
          </div>
        ) : (
          /* Idle Configuration View */
          <div className="flex flex-col items-center space-y-5 w-full">
            {/* Duration Selector Buttons (25m / 50m / 90m) */}
            <div className="flex items-center gap-3 w-full justify-center" role="radiogroup" aria-label="Focus Duration">
              {([25, 50, 90] as FocusDuration[]).map((dur) => {
                const cost = dur === 25 ? 15 : dur === 50 ? 30 : 50;
                const isSelected = selectedDuration === dur;
                return (
                  <button
                    key={dur}
                    type="button"
                    role="radio"
                    aria-checked={isSelected}
                    onClick={() => setSelectedDuration(dur)}
                    className={`flex-1 max-w-[100px] py-3 px-2 rounded-xl border flex flex-col items-center justify-center transition-all press-feedback ${
                      isSelected
                        ? 'bg-[rgba(201,169,98,0.12)] border-[var(--gold-primary)] text-[var(--gold-light)] shadow-lg shadow-[rgba(201,169,98,0.1)] ring-1 ring-[var(--gold-primary)]/40'
                        : 'bg-black/30 border-stone-800/80 text-[var(--ash-muted)] hover:border-stone-700'
                    }`}
                  >
                    <span className="font-mono tabular-nums text-lg font-bold">{dur}m</span>
                    <span className="text-[10px] font-mono tabular-nums text-[var(--ash-muted)] mt-0.5">
                      -{cost} Mana
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Session Label Input */}
            <div className="w-full max-w-sm">
              <input
                type="text"
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                placeholder="Session intent (e.g. Algorithms, Refactor)..."
                className="w-full bg-black/40 border border-stone-800 rounded-xl px-3 py-2 text-xs font-mono text-[var(--ash-light)] focus:outline-none focus:border-[var(--gold-primary)] transition"
              />
            </div>

            {/* Soundscape & Yield Preview */}
            <div className="flex items-center justify-between w-full max-w-sm text-xs font-mono text-[var(--ash-muted)] px-1">
              <div className="flex items-center gap-1.5">
                <Flame className="w-3.5 h-3.5 text-amber-400" />
                <span className="tabular-nums">YIELD: +{xpReward} XP</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Radio className="w-3.5 h-3.5 text-cyan-400" />
                <select
                  value={soundscape}
                  onChange={(e: any) => setSoundscape(e.target.value)}
                  className="bg-transparent text-[var(--ash-muted)] text-xs font-mono focus:outline-none cursor-pointer"
                >
                  <option value="void_drone">Void Drone</option>
                  <option value="celestial_rain">Celestial Rain</option>
                  <option value="deep_binaural">40Hz Binaural</option>
                  <option value="none">Silent</option>
                </select>
              </div>
            </div>

            {/* Start Button */}
            <button
              type="button"
              onClick={handleStart}
              disabled={!hasEnoughMana}
              className={`w-full max-w-sm py-2.5 rounded-xl font-mono text-xs font-bold tracking-wider flex items-center justify-center gap-2 transition press-feedback ${
                hasEnoughMana
                  ? 'bg-[var(--gold-primary)] hover:bg-[var(--gold-light)] text-black cursor-pointer shadow-md'
                  : 'bg-stone-800 text-stone-500 cursor-not-allowed border border-stone-700'
              }`}
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              {hasEnoughMana ? `ENTER FOCUS RITUAL (-${manaCost} MANA)` : 'VOID MANA DEPLETED (REST NEEDED)'}
            </button>

            {error && (
              <p className="text-rose-400 text-[11px] font-mono text-center">
                {error}
              </p>
            )}
          </div>
        )}
      </div>

      {/* Footer Info */}
      <footer className="border-t border-stone-800/60 pt-3 flex items-center justify-between text-[11px] font-mono text-[var(--ash-muted)] z-10">
        <span>GATE 3 / FEAT-02 BACKEND SYNC</span>
        <span className="text-[var(--gold-light)]">IMMERSIVE SHIELD</span>
      </footer>
    </section>
  );
};
