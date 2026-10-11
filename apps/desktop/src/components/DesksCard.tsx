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
    <div className="stone-card p-6 flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[var(--gold-light)] shadow-[0_0_8px_var(--gold-light)]" />
            <h2 className="font-display text-sm tracking-wider font-bold text-[var(--ash-light)]">
              THE THREE DESKS
            </h2>
          </div>
          <span className="text-[11px] font-mono text-[var(--ash-muted)]">Instant Jumps</span>
        </div>

        <div className="grid grid-cols-1 gap-2.5">
          {desks.map((d) => {
            const isActive = activeDesk === d.id;
            return (
              <div
                key={d.id}
                onClick={() => onSelectDesk(d.id)}
                className={`flex items-center justify-between p-3 rounded-2xl cursor-pointer border transition-all duration-200 ${
                  isActive
                    ? 'border-[var(--gold-primary)] bg-[rgba(201,169,98,0.12)] shadow-[0_0_15px_var(--gold-glow)]'
                    : `border-[var(--stone-border)] bg-black/40 ${d.colorGlow}`
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-black/60 border border-[var(--stone-border)] flex items-center justify-center">
                    {d.icon}
                  </div>
                  <div>
                    <h3 className="text-xs font-display font-bold text-[var(--ash-light)]">{d.title}</h3>
                    <p className="text-[11px] text-[var(--ash-muted)] font-mono">{d.sub}</p>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-xs font-mono text-[var(--gold-light)] font-bold">
                    {d.attrName}: {d.attrVal}
                  </div>
                  <span className="text-[10px] font-mono text-[var(--ash-muted)]">
                    <kbd className="px-1 py-0.5 rounded bg-black/70 border border-stone-800">{d.shortcut}</kbd>
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-[var(--stone-border)] text-xs font-mono text-[var(--ash-muted)] flex justify-between">
        <span>ACTIVE DESK:</span>
        <span className="text-[var(--gold-light)] font-bold uppercase">{activeDesk}</span>
      </div>
    </div>
  );
};
