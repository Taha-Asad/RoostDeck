/**
 * @file DesksCard.tsx
 * @description The Three Desks (Realms) switcher card (FEAT-01).
 * 
 * GUIDE FOR UI/UX COLLABORATOR:
 * -----------------------------------------------------------------------------
 * 1. REALM SYSTEM:
 *    - 'uni'      -> The Scholarium (Intellect attribute)
 *    - 'work'     -> The Merchant Guild (Craft attribute)
 *    - 'personal' -> The Inner Sanctum (Vitality attribute)
 * 2. INTERACTION:
 *    Each card acts as a home-row target (g u, g o, g p) and updates activeDesk.
 * 3. ERGONOMICS:
 *    Uses semantic buttons with .press-feedback, tabular figures for stats,
 *    and accessible focus rings.
 */

import React from 'react';
import { BookOpen, Briefcase, Compass } from 'lucide-react';
import { PlayerStats, RealmType } from '@roost/core-gamify';

interface DesksCardProps {
  activeDesk: RealmType;
  attributes: PlayerStats['attributes'];
  onSelectDesk: (desk: RealmType) => void;
}

export const DesksCard: React.FC<DesksCardProps> = ({
  activeDesk,
  attributes,
  onSelectDesk,
}) => {
  const desks: Array<{
    id: RealmType;
    title: string;
    sub: string;
    attrName: string;
    attrVal: number;
    shortcut: string;
    icon: React.ReactNode;
    colorGlow: string;
  }> = [
    {
      id: 'uni',
      title: 'The Scholarium',
      sub: 'Uni Courses & Lectures',
      attrName: 'Intellect',
      attrVal: attributes.intellect,
      shortcut: 'g u',
      icon: <BookOpen className="w-4 h-4 text-sky-400" />,
      colorGlow: 'hover:border-sky-500/50 hover:shadow-[0_0_20px_rgba(56,189,248,0.15)]',
    },
    {
      id: 'work',
      title: 'The Merchant Guild',
      sub: 'Corbel ERP & Client Work',
      attrName: 'Craft',
      attrVal: attributes.craft,
      shortcut: 'g o',
      icon: <Briefcase className="w-4 h-4 text-emerald-400" />,
      colorGlow: 'hover:border-emerald-500/50 hover:shadow-[0_0_20px_rgba(52,211,153,0.15)]',
    },
    {
      id: 'personal',
      title: 'The Inner Sanctum',
      sub: 'Habits, Studio & Mindset',
      attrName: 'Vitality',
      attrVal: attributes.vitality,
      shortcut: 'g p',
      icon: <Compass className="w-4 h-4 text-[var(--gold-primary)]" />,
      colorGlow: 'hover:border-[var(--gold-primary)] hover:shadow-[0_0_20px_var(--gold-glow)]',
    },
  ];

  return (
    <section aria-labelledby="three-desks-heading" className="stone-card p-6 flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[var(--gold-light)] shadow-[0_0_8px_var(--gold-light)]" />
            <h2 id="three-desks-heading" className="font-display text-sm tracking-wider font-bold text-[var(--ash-light)]">
              THE THREE DESKS
            </h2>
          </div>
          <span className="text-[11px] font-mono text-[var(--ash-muted)]">Instant Jumps</span>
        </div>

        <div className="grid grid-cols-1 gap-2.5" role="radiogroup" aria-label="Realm Desk Selection">
          {desks.map((d) => {
            const isActive = activeDesk === d.id;
            return (
              <button
                key={d.id}
                type="button"
                role="radio"
                aria-checked={isActive}
                onClick={() => onSelectDesk(d.id)}
                className={`w-full text-left flex items-center justify-between p-3 rounded-2xl cursor-pointer border transition-all duration-200 press-feedback focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--gold-primary)] ${
                  isActive
                    ? 'border-[var(--gold-primary)] bg-[rgba(201,169,98,0.12)] shadow-[0_0_18px_var(--gold-glow)] ring-1 ring-[var(--gold-primary)]/50'
                    : `border-[var(--stone-border)] bg-black/40 hover:-translate-y-0.5 ${d.colorGlow}`
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-black/60 border border-[var(--stone-border)] flex items-center justify-center flex-shrink-0">
                    {d.icon}
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-xs font-display font-bold text-[var(--ash-light)] truncate">{d.title}</h3>
                    <p className="text-[11px] text-[var(--ash-muted)] font-mono truncate">{d.sub}</p>
                  </div>
                </div>

                <div className="text-right flex-shrink-0 pl-2">
                  <div className="text-xs font-mono text-[var(--gold-light)] font-bold tabular-nums">
                    {d.attrName}: {d.attrVal}
                  </div>
                  <span className="text-[10px] font-mono text-[var(--ash-muted)]">
                    <kbd className="px-1 py-0.5 rounded bg-black/70 border border-stone-800">{d.shortcut}</kbd>
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-[var(--stone-border)] text-xs font-mono text-[var(--ash-muted)] flex justify-between items-center">
        <span>ACTIVE REALM:</span>
        <span className="text-[var(--gold-light)] font-bold uppercase tracking-wider">{activeDesk}</span>
      </div>
    </section>
  );
};

