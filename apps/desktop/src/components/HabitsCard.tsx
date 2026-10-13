/**
 * @file HabitsCard.tsx
 * @description Daily Vitality & Habits card with Sanctuary Rest freeze toggle (FEAT-01).
 * 
 * GUIDE FOR UI/UX COLLABORATOR:
 * -----------------------------------------------------------------------------
 * 1. RESPONSIBILITY:
 *    Renders daily recurring vitality habits (+15 XP each) and the Sanctuary Mode
 *    streak preservation freeze mechanism.
 * 2. STREAK FREEZE LOGIC:
 *    When `sanctuaryActive` is true, streaks cannot decay if a day is missed.
 *    The toggle has a distinct protective indigo glow.
 * 3. ERGONOMICS:
 *    Items are accessible buttons with `press-feedback`, tabular-nums on streak
 *    counts, and keyboard focus states.
 */

import React from 'react';
import { Habit } from '@roost/core-gamify';
import { CheckCircle2, Circle, Shield, Sparkles } from 'lucide-react';

interface HabitsCardProps {
  habits: Habit[];
  sanctuaryActive: boolean;
  onToggleHabit: (id: string) => void;
  onToggleSanctuary: () => void;
}

export const HabitsCard: React.FC<HabitsCardProps> = ({
  habits,
  sanctuaryActive,
  onToggleHabit,
  onToggleSanctuary,
}) => {
  return (
    <section aria-labelledby="habits-heading" className="stone-card p-6 flex flex-col justify-between h-full">
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[var(--gold-primary)]" />
            <h2 id="habits-heading" className="font-display text-sm tracking-wider font-bold text-[var(--ash-light)]">
              DAILY VITALITY & HABITS
            </h2>
          </div>
          <span className="text-[11px] font-mono tabular-nums text-[var(--ash-muted)]">+15 XP Each</span>
        </div>

        <div className="space-y-2.5" role="group" aria-label="Daily habits list">
          {habits.map((habit) => (
            <button
              key={habit.id}
              type="button"
              role="checkbox"
              aria-checked={habit.completedToday}
              onClick={() => onToggleHabit(habit.id)}
              className="w-full text-left flex items-center justify-between p-3 rounded-2xl cursor-pointer border border-[var(--stone-border)] bg-black/30 hover:border-[var(--stone-border-hover)] hover:bg-black/50 transition-all duration-200 press-feedback focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--gold-primary)]"
            >
              <div className="flex items-center gap-3 min-w-0">
                <span className="text-[var(--gold-primary)] flex-shrink-0">
                  {habit.completedToday ? (
                    <CheckCircle2 className="w-4 h-4 text-[var(--gold-light)] fill-[rgba(201,169,98,0.15)]" />
                  ) : (
                    <Circle className="w-4 h-4 text-[var(--ash-muted)]" />
                  )}
                </span>
                <span
                  className={`text-xs truncate ${
                    habit.completedToday
                      ? 'line-through text-[var(--ash-muted)] opacity-60'
                      : 'text-[var(--ash-light)]'
                  }`}
                >
                  {habit.title}
                </span>
              </div>

              <span className="text-[10px] font-mono tabular-nums text-[var(--gold-dark)] flex-shrink-0 pl-2">
                {habit.streak}d streak
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Sanctuary Mode Toggle */}
      <div className="mt-4 pt-3 border-t border-[var(--stone-border)]">
        <button
          type="button"
          aria-pressed={sanctuaryActive}
          onClick={onToggleSanctuary}
          className={`w-full py-2.5 px-3 rounded-xl border text-xs font-mono flex items-center justify-center gap-2 transition-all duration-200 press-feedback focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-indigo-400 ${
            sanctuaryActive
              ? 'bg-indigo-950/50 border-indigo-400/70 text-indigo-200 shadow-[0_0_14px_rgba(99,102,241,0.25)] ring-1 ring-indigo-400/40'
              : 'bg-black/40 border-[var(--stone-border)] text-[var(--ash-muted)] hover:border-indigo-400/40 hover:text-indigo-300'
          }`}
        >
          <Shield className="w-3.5 h-3.5 text-indigo-400 flex-shrink-0" />
          <span className="truncate">
            {sanctuaryActive ? 'SANCTUARY REST: ACTIVE (STREAK FROZEN)' : 'ENABLE SANCTUARY REST (FREEZE STREAK)'}
          </span>
        </button>
      </div>
    </section>
  );
};

