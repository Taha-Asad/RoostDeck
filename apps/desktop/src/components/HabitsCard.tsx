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
    <div className="stone-card p-6 flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[var(--gold-primary)]" />
            <h2 className="font-display text-sm tracking-wider font-bold text-[var(--ash-light)]">
              DAILY VITALITY & HABITS
            </h2>
          </div>
          <span className="text-[11px] font-mono text-[var(--ash-muted)]">+15 XP Each</span>
        </div>

        <div className="space-y-2.5">
          {habits.map((habit) => (
            <div
              key={habit.id}
              onClick={() => onToggleHabit(habit.id)}
              className="flex items-center justify-between p-3 rounded-2xl cursor-pointer border border-[var(--stone-border)] bg-black/30 hover:border-[var(--stone-border-hover)] hover:bg-black/50 transition-all duration-200"
            >
              <div className="flex items-center gap-3">
                <button type="button" tabIndex={-1} className="text-[var(--gold-primary)]">
                  {habit.completedToday ? (
                    <CheckCircle2 className="w-4 h-4 text-[var(--gold-light)] fill-[rgba(201,169,98,0.15)]" />
                  ) : (
                    <Circle className="w-4 h-4 text-[var(--ash-muted)]" />
                  )}
                </button>
                <span
                  className={`text-xs ${
                    habit.completedToday
                      ? 'line-through text-[var(--ash-muted)] opacity-60'
                      : 'text-[var(--ash-light)]'
                  }`}
                >
                  {habit.title}
                </span>
              </div>

              <span className="text-[10px] font-mono text-[var(--gold-dark)]">
                {habit.streak}d streak
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Sanctuary Mode Toggle */}
      <div className="mt-4 pt-3 border-t border-[var(--stone-border)]">
        <button
          onClick={onToggleSanctuary}
          className={`w-full py-2.5 px-3 rounded-xl border text-xs font-mono flex items-center justify-center gap-2 transition-all ${
            sanctuaryActive
              ? 'bg-indigo-950/40 border-indigo-400/60 text-indigo-200 shadow-[0_0_12px_rgba(99,102,241,0.2)]'
              : 'bg-black/40 border-[var(--stone-border)] text-[var(--ash-muted)] hover:border-indigo-400/40 hover:text-indigo-300'
          }`}
        >
          <Shield className="w-3.5 h-3.5 text-indigo-400" />
          <span>{sanctuaryActive ? 'SANCTUARY REST: ACTIVE (STREAK FROZEN)' : 'ENABLE SANCTUARY REST (FREEZE STREAK)'}</span>
        </button>
      </div>
    </div>
  );
};
