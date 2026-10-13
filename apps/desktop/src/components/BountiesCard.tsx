import React from 'react';
import { Bounty } from '@roost/core-gamify';
import { CheckCircle2, Circle, BookOpen, Briefcase, Heart } from 'lucide-react';

interface BountiesCardProps {
  bounties: Bounty[];
  selectedIndex: number;
  onToggleBounty: (id: string) => void;
  onSelectIndex: (idx: number) => void;
}

export const BountiesCard: React.FC<BountiesCardProps> = ({
  bounties,
  selectedIndex,
  onToggleBounty,
  onSelectIndex,
}) => {
  const getRealmBadge = (realm: Bounty['realm']) => {
    switch (realm) {
      case 'uni':
        return {
          label: 'UNI / ACADEMIC',
          attr: '+Intellect',
          icon: <BookOpen className="w-3 h-3 text-sky-400" />,
          colorClass: 'text-sky-300 border-sky-500/30 bg-sky-950/30',
        };
      case 'work':
        return {
          label: 'OFFICE / CORBEL',
          attr: '+Craft',
          icon: <Briefcase className="w-3 h-3 text-emerald-400" />,
          colorClass: 'text-emerald-300 border-emerald-500/30 bg-emerald-950/30',
        };
      default:
        return {
          label: 'SANCTUM / LIFE',
          attr: '+Vitality',
          icon: <Heart className="w-3 h-3 text-amber-400" />,
          colorClass: 'text-amber-300 border-amber-500/30 bg-amber-950/30',
        };
    }
  };

  return (
    <div className="stone-card p-6 flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[var(--gold-primary)] shadow-[0_0_8px_var(--gold-primary)]" />
            <h2 className="font-display text-sm tracking-wider font-bold text-[var(--ash-light)]">
              TODAY'S BOUNTIES (DAWN RITES)
            </h2>
          </div>
          <span className="text-[11px] font-mono text-[var(--ash-muted)]">
            Use <kbd className="px-1.5 py-0.5 rounded bg-black/60 border border-stone-800 text-xs">j</kbd>/
            <kbd className="px-1.5 py-0.5 rounded bg-black/60 border border-stone-800 text-xs">k</kbd> +{' '}
            <kbd className="px-1.5 py-0.5 rounded bg-black/60 border border-stone-800 text-xs">Space</kbd>
          </span>
        </div>

        <div className="space-y-3">
          {bounties.map((bounty, idx) => {
            const isSelected = selectedIndex === idx;
            const badge = getRealmBadge(bounty.realm);

            return (
              <div
                key={bounty.id}
                onClick={() => {
                  onSelectIndex(idx);
                  onToggleBounty(bounty.id);
                }}
                className={`group flex items-start gap-3.5 p-3.5 rounded-2xl cursor-pointer border transition-all duration-200 ${
                  isSelected
                    ? 'border-[var(--gold-primary)] bg-[rgba(201,169,98,0.08)] shadow-[0_4px_20px_-4px_rgba(0,0,0,0.8)]'
                    : 'border-[var(--stone-border)] bg-black/30 hover:border-[var(--stone-border-hover)] hover:bg-black/50'
                }`}
              >
                {/* Checkbox */}
                <button
                  type="button"
                  className="mt-0.5 text-[var(--gold-primary)] transition-transform active:scale-90"
                  tabIndex={-1}
                >
                  {bounty.completed ? (
                    <CheckCircle2 className="w-5 h-5 text-[var(--gold-light)] fill-[rgba(201,169,98,0.15)] drop-shadow-[0_0_6px_var(--gold-glow)]" />
                  ) : (
                    <Circle className="w-5 h-5 text-[var(--ash-muted)] group-hover:text-[var(--gold-light)]" />
                  )}
                </button>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-mono tracking-wider border ${badge.colorClass}`}
                    >
                      {badge.icon}
                      {badge.label}
                    </span>
                    <span className="text-[10px] font-mono tabular-nums text-[var(--gold-dark)]">
                      +{bounty.xpReward} XP ({badge.attr})
                    </span>
                  </div>

                  <p
                    className={`text-sm leading-snug transition-colors text-wrap-balance ${
                      bounty.completed
                        ? 'line-through text-[var(--ash-muted)] opacity-60'
                        : 'text-[var(--ash-light)] group-hover:text-white'
                    }`}
                  >
                    {bounty.title}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-[var(--stone-border)] flex items-center justify-between text-xs font-mono text-[var(--ash-muted)]">
        <span className="tabular-nums">
          {bounties.filter((b) => b.completed).length} OF {bounties.length} RITES FULFILLED
        </span>
        <span className="text-[var(--gold-light)] tracking-wider">HOME-ROW HYBRID</span>
      </div>
    </div>
  );
};
