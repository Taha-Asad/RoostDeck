import test from 'node:test';
import assert from 'node:assert/strict';
import {
  createInitialGamificationState,
  startFocusSession,
  tickFocusSession,
  pauseFocusSession,
  resumeFocusSession,
  completeFocusSession,
  abandonFocusSession,
  calculateManaCost,
  calculateFocusXpReward,
} from '../dist/index.js';

test('calculateManaCost: returns calibrated mana curves for standard durations', () => {
  assert.equal(calculateManaCost(25), 15);
  assert.equal(calculateManaCost(50), 30);
  assert.equal(calculateManaCost(90), 50);
});

test('calculateFocusXpReward: awards progressive bonuses for longer sessions', () => {
  assert.equal(calculateFocusXpReward(25), 50);
  assert.equal(calculateFocusXpReward(50), 120);
  assert.equal(calculateFocusXpReward(90), 250);
});

test('startFocusSession: consumes Void Mana and initializes timer cleanly', () => {
  const state = createInitialGamificationState();
  const initialMana = state.player.voidMana; // 100

  const { session, nextState } = startFocusSession(state, {
    durationMinutes: 25,
    realm: 'uni',
    label: 'CS401 Operating Systems Study',
    ambientSoundscape: 'void_drone',
  });

  assert.equal(session.status, 'active');
  assert.equal(session.totalDurationSeconds, 1500);
  assert.equal(session.remainingSeconds, 1500);
  assert.equal(session.elapsedSeconds, 0);
  assert.equal(session.voidManaCost, 15);
  assert.equal(nextState.player.voidMana, initialMana - 15);
});

test('startFocusSession: rejects when Void Mana is insufficient', () => {
  const state = createInitialGamificationState();
  state.player.voidMana = 10; // Less than 15 needed for 25m

  assert.throws(
    () => {
      startFocusSession(state, {
        durationMinutes: 25,
        realm: 'uni',
        label: 'Exhausted Attempt',
      });
    },
    /INSUFFICIENT_VOID_MANA/
  );
});

test('tickFocusSession: advances elapsed time and decrements remaining time', () => {
  const state = createInitialGamificationState();
  const { session } = startFocusSession(state, {
    durationMinutes: 25,
    realm: 'work',
    label: 'Corbel Backend Sprints',
  });

  const ticked = tickFocusSession(session, 10);
  assert.equal(ticked.elapsedSeconds, 10);
  assert.equal(ticked.remainingSeconds, 1490);

  // Does not decrement below zero
  const maxTicked = tickFocusSession(ticked, 2000);
  assert.equal(maxTicked.remainingSeconds, 0);
  assert.equal(maxTicked.elapsedSeconds, 1500);
});

test('pauseFocusSession & resumeFocusSession: toggles paused state correctly', () => {
  const state = createInitialGamificationState();
  const { session } = startFocusSession(state, {
    durationMinutes: 50,
    realm: 'personal',
    label: 'Deep Codex Writing',
  });

  const paused = pauseFocusSession(session);
  assert.equal(paused.status, 'paused');
  assert.ok(paused.pausedAt);

  const resumed = resumeFocusSession(paused);
  assert.equal(resumed.status, 'active');
});

test('completeFocusSession: awards scaled XP and boost to realm attribute', () => {
  const state = createInitialGamificationState();
  const initialXp = state.player.totalXp;
  const initialIntellect = state.player.attributes.intellect;

  const { session, nextState } = startFocusSession(state, {
    durationMinutes: 50,
    realm: 'uni',
    label: 'Algorithm Proofs',
  });

  // Tick until finished
  const finishedSession = tickFocusSession(session, 3000);
  const result = completeFocusSession(nextState, finishedSession);

  assert.equal(result.session.status, 'completed');
  assert.equal(result.xpEarned, 120);
  assert.equal(result.attributeBoost.attribute, 'intellect');
  assert.equal(result.attributeBoost.amount, 7);
  assert.equal(result.nextState.player.totalXp, initialXp + 120);
  assert.equal(result.nextState.player.attributes.intellect, initialIntellect + 7);
});

test('abandonFocusSession: sets status abandoned with zero XP and unrefunded mana', () => {
  const state = createInitialGamificationState();
  const initialMana = state.player.voidMana;

  const { session, nextState } = startFocusSession(state, {
    durationMinutes: 25,
    realm: 'work',
    label: 'Interrupted Task',
  });

  const abandoned = abandonFocusSession(session);
  assert.equal(abandoned.status, 'abandoned');
  assert.ok(abandoned.abandonedAt);
  // Mana remains deducted from nextState
  assert.equal(nextState.player.voidMana, initialMana - 15);
});
