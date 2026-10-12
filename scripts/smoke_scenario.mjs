// ==============================================================================
// smoke_scenario.mjs — RoostDeck End-to-End Mechanical Smoke Scenario
// ==============================================================================
// Verifies real runtime behavioral invariants across Core Gamify & FS Engine.
// ==============================================================================

import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  createInitialGamificationState,
  calculateManaCost,
  calculateFocusXpReward,
  startFocusSession,
  tickFocusSession,
  pauseFocusSession,
  resumeFocusSession,
  completeFocusSession,
  abandonFocusSession,
  calculateRequiredXp,
  calculateRank,
  addExperience,
  toggleBounty,
} from '../packages/core-gamify/dist/index.js';

import {
  parseFrontmatter,
  serializeFrontmatter,
  generateNoteContent,
} from '../packages/fs-engine/dist/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const tempDir = path.join(__dirname, '../.verify_temp');

console.log('--- Running RoostDeck End-to-End Milestone Scenario ---');

// -----------------------------------------------------------------------------
// [M1 Verification]: Core XP Curves, Ranks & Bounties
// -----------------------------------------------------------------------------
console.log('Testing M1: Core Gamify Monotonic Curves & Bounty Toggles...');
const state0 = createInitialGamificationState();
assert.equal(state0.player.level, 1);
assert.equal(state0.player.rank, 'Fledgling Crow');
assert.equal(calculateRank(1), 'Fledgling Crow');
assert.equal(calculateRank(50), 'Grand Sovereign Architect');

// Level XP monotonicity
let prevXp = 0;
for (let lvl = 1; lvl <= 50; lvl++) {
  const req = calculateRequiredXp(lvl);
  assert.ok(req > prevXp, `XP required for level ${lvl} (${req}) must be > level ${lvl - 1} (${prevXp})`);
  prevXp = req;
}

// Bounty Toggle
const bountyId = state0.bounties[0].id;
const stateWithBounty = toggleBounty(state0, bountyId);
assert.equal(stateWithBounty.bounties[0].completed, true);
assert.ok(stateWithBounty.player.totalXp > state0.player.totalXp);
assert.ok(stateWithBounty.player.attributes.intellect > state0.player.attributes.intellect);
console.log('✓ M1: Core Gamify XP curves and attributes verified.');

// -----------------------------------------------------------------------------
// [M1 Verification]: FS Engine YAML Frontmatter & Template Parity
// -----------------------------------------------------------------------------
console.log('Testing M1: FS Engine Serialization & Round-Trip Parsing...');
if (!fs.existsSync(tempDir)) {
  fs.mkdirSync(tempDir, { recursive: true });
}

const noteDTO = {
  realm: 'uni',
  title: 'Paging & Memory Management',
  type: 'lecture',
  tags: ['os', 'cs401', 'kernel'],
  body: '## Section 1\nPaging divides memory into fixed blocks.',
  courseId: 'CS401',
};

const generated = generateNoteContent(noteDTO);
assert.ok(generated.fullContent.startsWith('---\n'));
assert.ok(generated.fullContent.includes('title: "Paging & Memory Management"'));

// Write to disk and read back
const testFilePath = path.join(tempDir, 'paging-test.md');
fs.writeFileSync(testFilePath, generated.fullContent, 'utf-8');
const fileOnDisk = fs.readFileSync(testFilePath, 'utf-8');

const parsed = parseFrontmatter(fileOnDisk);
assert.equal(parsed.metadata.title, 'Paging & Memory Management');
assert.equal(parsed.metadata.realm, 'uni');
assert.deepEqual(parsed.metadata.tags, ['os', 'cs401', 'kernel']);
assert.ok(parsed.body.includes('Paging divides memory into fixed blocks.'));

// Clean up temporary file
fs.rmSync(testFilePath, { force: true });
console.log('✓ M1: FS Engine serialization and round-trip disk read verified.');

// -----------------------------------------------------------------------------
// [M2 Verification]: Focus Altar & Void Mana Bounds
// -----------------------------------------------------------------------------
console.log('Testing M2: Focus Altar State Transitions & Void Mana Economics...');
assert.equal(calculateManaCost(25), 15);
assert.equal(calculateManaCost(50), 30);
assert.equal(calculateManaCost(90), 50);

assert.equal(calculateFocusXpReward(25), 50);
assert.equal(calculateFocusXpReward(50), 120);
assert.equal(calculateFocusXpReward(90), 250);

const focusState0 = createInitialGamificationState();
const initialMana = focusState0.player.voidMana; // 100

// 1. Start 25m Focus
const { session: s1, nextState: s1State } = startFocusSession(focusState0, {
  durationMinutes: 25,
  realm: 'uni',
  label: 'Operating Systems Study',
  ambientSoundscape: 'void_drone',
});

assert.equal(s1.status, 'active');
assert.equal(s1.remainingSeconds, 1500);
assert.equal(s1.elapsedSeconds, 0);
assert.equal(s1State.player.voidMana, initialMana - 15);

// 2. Tick timer
const ticked = tickFocusSession(s1, 500);
assert.equal(ticked.elapsedSeconds, 500);
assert.equal(ticked.remainingSeconds, 1000);

// 3. Pause & Resume
const paused = pauseFocusSession(ticked);
assert.equal(paused.status, 'paused');
assert.ok(paused.pausedAt);

const resumed = resumeFocusSession(paused);
assert.equal(resumed.status, 'active');
assert.equal(resumed.pausedAt, undefined);

// 4. Complete
const finishedTimer = tickFocusSession(resumed, 1000);
const completion = completeFocusSession(s1State, finishedTimer);
assert.equal(completion.session.status, 'completed');
assert.equal(completion.xpEarned, 50);
assert.equal(completion.attributeBoost.attribute, 'intellect');
assert.equal(completion.attributeBoost.amount, 3);
assert.equal(completion.nextState.player.voidMana, initialMana - 15 + 5); // Consumed 15, recharged 5

// 5. Insufficient Mana Rejection
const depletedState = createInitialGamificationState();
depletedState.player.voidMana = 10;
assert.throws(
  () => {
    startFocusSession(depletedState, {
      durationMinutes: 25,
      realm: 'uni',
      label: 'Exhausted',
    });
  },
  /INSUFFICIENT_VOID_MANA/
);

// 6. Abandon Session
const { session: abandonTarget, nextState: abandonState } = startFocusSession(focusState0, {
  durationMinutes: 50,
  realm: 'work',
  label: 'Bug Fixing',
});
const abandoned = abandonFocusSession(abandonTarget);
assert.equal(abandoned.status, 'abandoned');
assert.ok(abandoned.abandonedAt);
assert.equal(abandonState.player.voidMana, initialMana - 30); // Mana burned, no refund

console.log('✓ M2: Focus Altar state machine, timer economics, and mana bounds verified.');

// Clean up temp dir if empty
if (fs.existsSync(tempDir)) {
  fs.rmSync(tempDir, { recursive: true, force: true });
}

console.log('\n--- All End-to-End Scenario Assertions Passed Green ---');
