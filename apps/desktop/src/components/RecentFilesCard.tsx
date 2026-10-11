import React from 'react';
import { FileInfo } from '@roost/fs-engine';
import { FileText, ExternalLink } from 'lucide-react';

interface RecentFilesCardProps {
  files: FileInfo[];
  vaultName?: string;
}

export const RecentFilesCard: React.FC<RecentFilesCardProps> = ({
  files,
  vaultName = 'TheFallenCrow',
}) => {
  return (
    <div className="stone-card p-6 flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-[var(--gold-primary)]" />
            <h2 className="font-display text-sm tracking-wider font-bold text-[var(--ash-light)]">
              VAULT & RECENT FILES
            </h2>
          </div>
          <span className="text-[11px] font-mono text-[var(--ash-muted)]">Live Filesystem</span>
        </div>

        <div className="space-y-2.5 max-h-[220px] overflow-y-auto pr-1">
          {files.length === 0 ? (
            <p className="text-xs text-[var(--ash-muted)] font-mono py-4 text-center">
              No recent files yet. Press <kbd className="px-1 py-0.5 rounded bg-black">n</kbd> to capture one!
            </p>
          ) : (
            files.slice(0, 5).map((file) => {
              const obsidianUri = `obsidian://open?vault=${encodeURIComponent(vaultName)}&file=${encodeURIComponent(
                file.relativePath.replace(/\.md$/, '')
              )}`;

              return (
                <div
                  key={file.fileName}
                  className="group flex items-center justify-between p-2.5 rounded-xl border border-[var(--stone-border)] bg-black/30 hover:border-[var(--stone-border-hover)] hover:bg-black/50 transition-all duration-200"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <FileText className="w-3.5 h-3.5 text-[var(--ash-muted)] group-hover:text-[var(--gold-light)] flex-shrink-0" />
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
                    className="pill-control px-2 py-1 text-[10px] font-mono opacity-60 group-hover:opacity-100 flex-shrink-0"
                    title="Open directly in Obsidian Vault"
                  >
                    <span>Obsidian</span>
                    <ExternalLink className="w-2.5 h-2.5" />
                  </a>
                </div>
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
    </div>
  );
};
