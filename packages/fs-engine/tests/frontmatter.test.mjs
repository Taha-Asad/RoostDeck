import test from 'node:test';
import assert from 'node:assert/strict';

import {
  serializeFrontmatter,
  parseFrontmatter,
  generateNoteContent,
} from '../dist/frontmatter.js';

test('serializeFrontmatter and parseFrontmatter round-trip parity', () => {
  const originalMeta = {
    title: 'Operating Systems Lecture 04: Virtual Memory',
    realm: 'uni',
    type: 'lecture',
    created: '2026-10-09T01:30:00.000Z',
    tags: ['cs401', 'memory', 'paging'],
    xp_value: 35,
    status: 'active',
  };

  const yamlBlock = serializeFrontmatter(originalMeta);
  assert.ok(yamlBlock.startsWith('---\n'));
  assert.ok(yamlBlock.includes('title: "Operating Systems Lecture 04: Virtual Memory"'));

  const parsed = parseFrontmatter(`${yamlBlock}# Body Content Here\nSome lecture details.`);
  assert.equal(parsed.metadata.title, originalMeta.title);
  assert.equal(parsed.metadata.realm, 'uni');
  assert.equal(parsed.metadata.type, 'lecture');
  assert.deepEqual(parsed.metadata.tags, originalMeta.tags);
  assert.equal(parsed.metadata.xp_value, 35);
  assert.equal(parsed.body, '# Body Content Here\nSome lecture details.');
});

test('generateNoteContent: injects specialized template according to note type', () => {
  const { fullContent, metadata } = generateNoteContent({
    title: 'BugBountyTrack Capstone Sprint 1',
    realm: 'work',
    type: 'sprint',
    tags: ['capstone', 'crypto'],
  });

  assert.ok(fullContent.startsWith('---\n'));
  assert.ok(fullContent.includes('title: "BugBountyTrack Capstone Sprint 1"'));
  assert.ok(fullContent.includes('## Acceptance Criteria'));
  assert.ok(fullContent.includes('## Verification Commands'));
  assert.equal(metadata.realm, 'work');
  assert.equal(metadata.type, 'sprint');
});
