/**
 * @file RecentFilesCard.tsx
 * @description Vault & Live Filesystem Explorer Card (FEAT-01).
 * 
 * GUIDE FOR UI/UX COLLABORATOR:
 * -----------------------------------------------------------------------------
 * 1. RESPONSIBILITY:
 *    Renders recently created/modified markdown notes in the sovereign vault.
 * 2. DUAL-EDITION ARCHITECTURE:
 *    - Personal Edition (Sanctum): Directly opens file in Obsidian using
 *      `obsidian://open?vault=...&file=...` protocol.
 *    - Commercial Edition: Opens embedded reader or preview drawer.
 * 3. ERGONOMICS:
 *    - Keyboard capture callout for empty state.
 *    - Interactive elements include `.press-feedback` and focus states.
 */

import React from 'react';
import { FileInfo } from '@roost/fs-engine';
import { FileText, ExternalLink, PlusCircle } from 'lucide-react';

interface RecentFilesCardProps {
  files: FileInfo[];
  vaultName?: string;
  onOpenQuickCapture?: () => void;
}

export const RecentFilesCard: React.FC<RecentFilesCardProps> = ({
  files,
  vaultName = 'TheFallenCrow',
  onOpenQuickCapture,
}) => {
  return (
    <section aria-labelledby="recent-files-heading" className="stone-card p-6 flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-[var(--gold-primary)]" />
            <h2 id="recent-files-heading" className="font-display text-sm tracking-wider font-bold text-[var(--ash-light)]">
              VAULT & RECENT FILES
            </h2>
          </div>
          <span className="text-[11px] font-mono text-[var(--ash-muted)]">Live Filesystem</span>
        </div>

        <div className="space-y-2.5 max-h-[220px] overflow-y-auto pr-1" role="feed" aria-label="Recent markdown notes">
          {files.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-6 text-center space-y-2.5 border border-dashed border-[var(--stone-border)] rounded-2xl bg-black/20">
              <p className="text-xs text-[var(--ash-muted)] font-mono">
                No recent notes in vault.
              </p>
              {onOpenQuickCapture ? (
                <button
                  type="button"
                  onClick={onOpenQuickCapture}
                  className="pill-control px-3 py-1.5 text-xs font-mono press-feedback text-[var(--gold-light)] border-[var(--gold-primary)]/40 hover:border-[var(--gold-primary)]"
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  <span>Capture Note (Ctrl+K)</span>
                </button>
              ) : (
                <span className="text-[11px] font-mono text-[var(--ash-muted)]">
                  Press <kbd className="px-1.5 py-0.5 rounded bg-black border border-stone-800 text-[10px]">n</kbd> to capture
                </span>
              )}
            </div>
          ) : (
            files.slice(0, 5).map((file) => {
              const obsidianUri = `obsidian://open?vault=${encodeURIComponent(vaultName)}&file=${encodeURIComponent(
                file.relativePath.replace(/\.md$/, '')
              )}`;

              return (
                <article
                  key={file.fileName}
                  className="group flex items-center justify-between p-2.5 rounded-xl border border-[var(--stone-border)] bg-black/30 hover:border-[var(--stone-border-hover)] hover:bg-black/50 transition-all duration-200"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <FileText className="w-3.5 h-3.5 text-[var(--ash-muted)] group-hover:text-[var(--gold-light)] flex-shrink-0 transition-colors" />
                    <div className="min-w-0">
                      <p className="text-xs font-mono text-[var(--ash-light)] truncate group-hover:text-white">
                        {file.title || file.fileName}
                      </p>
                      <p className="text-[10px] font-mono text-[var(--ash-muted)] truncate">
                        {file.relativePath}
                      </p>
                    </div>
                  </div>

                  <a
                    href={obsidianUri}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="pill-control px-2 py-1 text-[10px] font-mono opacity-70 group-hover:opacity-100 flex-shrink-0 press-feedback focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--gold-primary)]"
                    title="Open directly in Obsidian Vault"
                  >
                    <span>Obsidian</span>
                    <ExternalLink className="w-2.5 h-2.5" />
                  </a>
                </article>
              );
            })
          )}
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-[var(--stone-border)] text-[11px] font-mono text-[var(--ash-muted)] flex justify-between items-center">
        <span>VAULT ROOT:</span>
        <span className="text-[var(--gold-light)] font-mono truncate max-w-[200px]">
          /{vaultName}
        </span>
      </div>
    </section>
  );
};

