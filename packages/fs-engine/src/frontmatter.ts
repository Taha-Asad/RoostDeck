import { NoteCreateDTO, NoteMetadata, NoteType } from './types.js';

/**
 * Serializes metadata into valid, canonical YAML frontmatter.
 */
export function serializeFrontmatter(meta: NoteMetadata): string {
  const tagsFormatted = `[${meta.tags.map((t) => (t.includes(' ') ? `"${t}"` : t)).join(', ')}]`;
  const escapedTitle = meta.title.includes(':') || meta.title.includes('"')
    ? `"${meta.title.replace(/"/g, '\\"')}"`
    : `"${meta.title}"`;

  return [
    '---',
    `title: ${escapedTitle}`,
    `realm: ${meta.realm}`,
    `type: ${meta.type}`,
    `created: ${meta.created}`,
    `tags: ${tagsFormatted}`,
    `xp_value: ${meta.xp_value}`,
    `status: ${meta.status}`,
    '---',
    '',
  ].join('\n');
}

/**
 * Extracts and parses YAML frontmatter from raw Markdown text.
 */
export function parseFrontmatter(markdownText: string): { metadata: Partial<NoteMetadata>; body: string } {
  const match = markdownText.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
  if (!match) {
    return { metadata: {}, body: markdownText };
  }

  const rawYaml = match[1];
  const body = match[2];
  const metadata: Partial<NoteMetadata> = {};

  const lines = rawYaml.split(/\r?\n/);
  for (const line of lines) {
    const colonIndex = line.indexOf(':');
    if (colonIndex === -1) continue;
    const key = line.slice(0, colonIndex).trim();
    let val = line.slice(colonIndex + 1).trim();

    // Remove quotes
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }

    if (key === 'title') metadata.title = val;
    else if (key === 'realm') metadata.realm = val as any;
    else if (key === 'type') metadata.type = val as any;
    else if (key === 'created') metadata.created = val;
    else if (key === 'status') metadata.status = val as any;
    else if (key === 'xp_value') metadata.xp_value = parseInt(val, 10) || 0;
    else if (key === 'tags') {
      if (val.startsWith('[') && val.endsWith(']')) {
        metadata.tags = val
          .slice(1, -1)
          .split(',')
          .map((t) => t.trim().replace(/^["']|["']$/g, ''))
          .filter(Boolean);
      }
    }
  }

  return { metadata, body };
}

/**
 * Generates initial markdown document with frontmatter and default template body.
 */
export function generateNoteContent(dto: NoteCreateDTO): { fullContent: string; metadata: NoteMetadata } {
  const now = new Date().toISOString();
  const xpValue = dto.type === 'assignment' || dto.type === 'sprint' ? 45 : 30;

  const metadata: NoteMetadata = {
    title: dto.title,
    realm: dto.realm,
    type: dto.type,
    created: now,
    tags: dto.tags && dto.tags.length > 0 ? dto.tags : [dto.realm, dto.type],
    xp_value: xpValue,
    status: 'active',
  };

  const frontmatter = serializeFrontmatter(metadata);
  const templateBody = dto.body || dto.customBody || getTemplateBody(dto.title, dto.type, dto.realm);
  const fullContent = `${frontmatter}${templateBody}\n`;

  return { fullContent, metadata };
}

/**
 * Default templates matching Taha's daily workflows.
 */
export function getTemplateBody(title: string, type: NoteType, realm: string): string {
  switch (type) {
    case 'lecture':
      return [
        `# ${title}`,
        '',
        '> **Realm**: Academic / Uni | **Session**: Lecture Notes',
        '',
        '## Key Invariants & Concepts',
        '- ',
        '',
        '## Detailed Lecture Notes',
        '',
        '## Questions & Follow-ups',
        '- [ ] ',
      ].join('\n');

    case 'assignment':
      return [
        `# ${title}`,
        '',
        '> **Deadline Tracker**: Priority Task',
        '',
        '## Requirements Breakdown',
        '- [ ] ',
        '',
        '## Implementation Steps',
        '1. ',
        '',
        '## Verification Evidence',
        '',
      ].join('\n');

    case 'sprint':
      return [
        `# ${title}`,
        '',
        '> **Work Item**: Engineering Sprint Task',
        '',
        '## Acceptance Criteria',
        '- [ ] ',
        '',
        '## Technical Changes & Diffs',
        '',
        '## Verification Commands',
        '```bash',
        'cargo test',
        '```',
      ].join('\n');

    case 'journal':
      return [
        `# ${title}`,
        '',
        '> **Dusk Reflection**: Personal Mindset & State',
        '',
        '## Today\'s Wins & Code Shipped',
        '- ',
        '',
        '## Roadblocks & What Stalled Me',
        '- ',
        '',
        '## Tomorrow\'s Top 3 Bounties',
        '1. ',
      ].join('\n');

    default:
      return [
        `# ${title}`,
        '',
        '## Overview',
        '',
        '## Notes',
        '- ',
      ].join('\n');
  }
}
