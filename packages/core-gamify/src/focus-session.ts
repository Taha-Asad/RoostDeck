import {
  FocusCompletionResult,
  FocusDuration,
  FocusSessionConfig,
  FocusSessionState,
  GamificationState,
} from './types.js';
import { addExperience } from './xp-calculator.js';

export function calculateManaCost(durationMinutes: FocusDuration): number {
  switch (durationMinutes) {
    case 25:
      return 15;
    case 50:
      return 30;
    case 90:
      return 50;
    default:
      return 15;
  }
}

export function calculateFocusXpReward(durationMinutes: FocusDuration): number {
  switch (durationMinutes) {
    case 25:
      return 50;
    case 50:
      return 120;
    case 90:
      return 250;
    default:
      return 50;
  }
}

export function calculateAttributeBoost(durationMinutes: FocusDuration, realm: 'uni' | 'work' | 'personal'): {
  attribute: 'intellect' | 'craft' | 'vitality';
  amount: number;
} {
  const base = durationMinutes === 25 ? 3 : durationMinutes === 50 ? 7 : 15;
  const attr = realm === 'uni' ? 'intellect' : realm === 'work' ? 'craft' : 'vitality';
  return { attribute: attr, amount: base };
}

/**
 * Initializes an active focus session, consuming required Void Mana from player state.
 */
export function startFocusSession(
  state: GamificationState,
  config: FocusSessionConfig
): { session: FocusSessionState; nextState: GamificationState } {
  const manaCost = calculateManaCost(config.durationMinutes);

  if (state.player.voidMana < manaCost) {
    throw new Error(
      `INSUFFICIENT_VOID_MANA: Required ${manaCost} Void Mana, but only ${state.player.voidMana} available. Enter Sanctuary Rest to recharge.`
    );
  }

  const durationSeconds = config.durationMinutes * 60;
  const now = new Date().toISOString();

  const session: FocusSessionState = {
    id: `focus_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    config,
    status: 'active',
    totalDurationSeconds: durationSeconds,
    remainingSeconds: durationSeconds,
    elapsedSeconds: 0,
    voidManaCost: manaCost,
    startedAt: now,
  };

  const nextState: GamificationState = {
    ...state,
    player: {
      ...state.player,
      voidMana: state.player.voidMana - manaCost,
    },
    lastUpdated: now,
  };

  return { session, nextState };
}

/**
 * Advances the session timer.
 */
export function tickFocusSession(
  session: FocusSessionState,
  elapsedDeltaSeconds: number
): FocusSessionState {
  if (session.status !== 'active') {
    return session;
  }

  const newElapsed = Math.min(session.totalDurationSeconds, session.elapsedSeconds + elapsedDeltaSeconds);
  const newRemaining = Math.max(0, session.totalDurationSeconds - newElapsed);

  return {
    ...session,
    elapsedSeconds: newElapsed,
    remainingSeconds: newRemaining,
  };
}

/**
 * Pauses an active session.
 */
export function pauseFocusSession(session: FocusSessionState): FocusSessionState {
  if (session.status !== 'active') {
    return session;
  }

  return {
    ...session,
    status: 'paused',
    pausedAt: new Date().toISOString(),
  };
}

/**
 * Resumes a paused session.
 */
export function resumeFocusSession(session: FocusSessionState): FocusSessionState {
  if (session.status !== 'paused') {
    return session;
  }

  return {
    ...session,
    status: 'active',
    pausedAt: undefined,
  };
}

/**
 * Completes a focus session, awarding scaled XP, realm attribute bonuses, and recovery.
 */
export function completeFocusSession(
  state: GamificationState,
  session: FocusSessionState
): FocusCompletionResult {
  const now = new Date().toISOString();
  const xpEarned = calculateFocusXpReward(session.config.durationMinutes);
  const boost = calculateAttributeBoost(session.config.durationMinutes, session.config.realm);

  const completedSession: FocusSessionState = {
    ...session,
    status: 'completed',
    remainingSeconds: 0,
    elapsedSeconds: session.totalDurationSeconds,
    completedAt: now,
  };

  // 1. Advance XP and level
  let updatedPlayer = addExperience(state.player, xpEarned);

  // 2. Add realm attribute boost
  updatedPlayer = {
    ...updatedPlayer,
    attributes: {
      ...updatedPlayer.attributes,
      [boost.attribute]: updatedPlayer.attributes[boost.attribute] + boost.amount,
    },
    // Passive recovery bonus after deep focus
    voidMana: Math.min(updatedPlayer.maxVoidMana, updatedPlayer.voidMana + 5),
  };

  const nextState: GamificationState = {
    ...state,
    player: updatedPlayer,
    lastUpdated: now,
  };

  return {
    session: completedSession,
    xpEarned,
    attributeBoost: boost,
    manaRecharged: 5,
    nextState,
  };
}

/**
 * Abandons an active/paused session without awarding XP or refunding spent Void Mana.
 */
export function abandonFocusSession(session: FocusSessionState): FocusSessionState {
  return {
    ...session,
    status: 'abandoned',
    abandonedAt: new Date().toISOString(),
  };
}
