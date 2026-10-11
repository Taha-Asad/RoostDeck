import test from 'node:test';
import assert from 'node:assert/strict';

import {
  calculateRequiredXp,
  calculateRank,
  addExperience,
  createInitialPlayerStats,
} from '../dist/xp-calculator.js';

import {
  createInitialGamificationState,
  toggleBounty,
  toggleHabit,
  toggleSanctuaryMode,
  consumeVoidMana,
  rechargeVoidMana,
} from '../dist/state-machine.js';

test('calculateRequiredXp: monotonic increase from level 1 to 50', () => {
  let prevXp = 0;
  for (let lvl = 1; lvl <= 50; lvl++) {
    const required = calculateRequiredXp(lvl);
    assert.ok(required > prevXp, `Level ${lvl} XP (${required}) should exceed previous (${prevXp})`);
    prevXp = required;
  }
  assert.equal(calculateRequiredXp(1), 120);
});

test('calculateRank: maps Crow Ranks accurately across level thresholds', () => {
  assert.equal(calculateRank(1), 'Fledgling Crow');
  assert.equal(calculateRank(4), 'Fledgling Crow');
  assert.equal(calculateRank(5), 'Novice of the Roost');
  assert.equal(calculateRank(9), 'Novice of the Roost');
  assert.equal(calculateRank(10), 'Raven Watcher');
  assert.equal(calculateRank(19), 'Raven Watcher');
  assert.equal(calculateRank(20), 'Obsidian Alchemist');
  assert.equal(calculateRank(34), 'Obsidian Alchemist');
  assert.equal(calculateRank(35), 'Master of the Three Legs');
  assert.equal(calculateRank(49), 'Master of the Three Legs');
  assert.equal(calculateRank(50), 'Grand Sovereign Architect');
  assert.equal(calculateRank(75), 'Grand Sovereign Architect');
});

test('addExperience: advances level and rolls over surplus XP cleanly', () => {
  const initial = createInitialPlayerStats();
  assert.equal(initial.level, 1);
  assert.equal(initial.currentLevelXp, 0);
  assert.equal(initial.nextLevelXpRequired, 120);

  // Add 100 XP (below threshold)
  const step1 = addExperience(initial, 100);
  assert.equal(step1.level, 1);
  assert.equal(step1.currentLevelXp, 100);
  assert.equal(step1.totalXp, 100);

  // Add 30 more XP (crosses 120 threshold with 10 surplus into level 2)
  const step2 = addExperience(step1, 30);
  assert.equal(step2.level, 2);
  assert.equal(step2.currentLevelXp, 10);
  assert.equal(step2.totalXp, 130);
  assert.equal(step2.nextLevelXpRequired, calculateRequiredXp(2));
});

test('state-machine: toggleBounty awards XP and updates specific attribute', () => {
  const state = createInitialGamificationState();
  const bounty = state.bounties[0]; // Uni bounty (+35 XP)
  assert.equal(bounty.completed, false);
  const initialIntellect = state.player.attributes.intellect;

  const nextState = toggleBounty(state, bounty.id);
  const updatedBounty = nextState.bounties.find((b) => b.id === bounty.id);
  assert.equal(updatedBounty.completed, true);
  assert.equal(nextState.player.totalXp, 35);
  assert.equal(nextState.player.attributes.intellect, initialIntellect + 2);
});

test('state-machine: sanctuary mode toggle and void mana bounds', () => {
  const state = createInitialGamificationState();
  assert.equal(state.player.sanctuaryActive, false);

  const sanctuaryState = toggleSanctuaryMode(state);
  assert.equal(sanctuaryState.player.sanctuaryActive, true);

  // Test mana burn
  const burnedState = consumeVoidMana(sanctuaryState, 40);
  assert.equal(burnedState.player.voidMana, 60);

  // Overburn clamps to 0
  const overburned = consumeVoidMana(burnedState, 100);
  assert.equal(overburned.player.voidMana, 0);

  // Recharge clamps to max (100)
  const recharged = rechargeVoidMana(overburned, 150);
  assert.equal(recharged.player.voidMana, 100);
});
