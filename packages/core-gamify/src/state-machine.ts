import { Bounty, GamificationState, Habit, PlayerStats } from './types.js';
import { addExperience, createInitialPlayerStats } from './xp-calculator.js';

export function createInitialGamificationState(): GamificationState {
  const initialPlayer = createInitialPlayerStats();

  const initialBounties: Bounty[] = [
    {
      id: 'bounty_uni_1',
      title: 'Review Operating Systems Virtual Memory Slides',
      realm: 'uni',
      xpReward: 35,
      completed: false,
    },
    {
      id: 'bounty_work_1',
      title: 'Verify Corbel ERP Backend Command Parity',
      realm: 'work',
      xpReward: 45,
      completed: false,
    },
    {
      id: 'bounty_life_1',
      title: 'Physical Training or 30-min Outdoor Walk',
      realm: 'personal',
      xpReward: 25,
      completed: false,
    },
  ];

  const initialHabits: Habit[] = [
    { id: 'habit_water', title: 'Deep Hydration (2.5L)', category: 'hydration', completedToday: false, streak: 3 },
    { id: 'habit_gym', title: 'Gym / Calisthenics', category: 'fitness', completedToday: false, streak: 2 },
    { id: 'habit_read', title: 'Technical / Philosophical Reading (15 mins)', category: 'learning', completedToday: false, streak: 5 },
    { id: 'habit_reflect', title: 'Dusk Sanity Check & Journal', category: 'mindset', completedToday: false, streak: 4 },
  ];

  return {
    player: initialPlayer,
    bounties: initialBounties,
    habits: initialHabits,
    lastUpdated: new Date().toISOString(),
  };
}

/**
 * Toggles a bounty completed status, awarding XP and leveling attributes.
 */
export function toggleBounty(state: GamificationState, bountyId: string): GamificationState {
  const targetBounty = state.bounties.find((b) => b.id === bountyId);
  if (!targetBounty) return state;

  const willBeCompleted = !targetBounty.completed;

  // Clone bounties with updated status
  const updatedBounties = state.bounties.map((b) => {
    if (b.id === bountyId) {
      return {
        ...b,
        completed: willBeCompleted,
        completedAt: willBeCompleted ? new Date().toISOString() : undefined,
      };
    }
    return b;
  });

  // Calculate stats change
  let updatedPlayer: PlayerStats;
  if (willBeCompleted) {
    updatedPlayer = addExperience(state.player, targetBounty.xpReward);
    const newAttributes = { ...updatedPlayer.attributes };
    if (targetBounty.realm === 'uni') {
      newAttributes.intellect += 2;
    } else if (targetBounty.realm === 'work') {
      newAttributes.craft += 2;
    } else {
      newAttributes.vitality += 2;
    }
    updatedPlayer = {
      ...updatedPlayer,
      attributes: newAttributes,
    };
  } else {
    // If uncompleted, subtract XP gracefully
    const revertedTotalXp = Math.max(0, state.player.totalXp - targetBounty.xpReward);
    const revertedCurrentXp = Math.max(0, state.player.currentLevelXp - targetBounty.xpReward);
    updatedPlayer = {
      ...state.player,
      totalXp: revertedTotalXp,
      currentLevelXp: revertedCurrentXp,
    };
  }

  return {
    ...state,
    player: updatedPlayer,
    bounties: updatedBounties,
    lastUpdated: new Date().toISOString(),
  };
}

/**
 * Toggles a daily habit.
 */
export function toggleHabit(state: GamificationState, habitId: string): GamificationState {
  const targetHabit = state.habits.find((h) => h.id === habitId);
  if (!targetHabit) return state;

  const willBeCompleted = !targetHabit.completedToday;
  const updatedHabits = state.habits.map((h) => {
    if (h.id === habitId) {
      return {
        ...h,
        completedToday: willBeCompleted,
        streak: willBeCompleted ? h.streak + 1 : Math.max(0, h.streak - 1),
      };
    }
    return h;
  });

  let updatedPlayer = state.player;
  if (willBeCompleted) {
    updatedPlayer = addExperience(updatedPlayer, 15);
    updatedPlayer = {
      ...updatedPlayer,
      attributes: {
        ...updatedPlayer.attributes,
        vitality: updatedPlayer.attributes.vitality + 1,
      },
    };
  }

  return {
    ...state,
    player: updatedPlayer,
    habits: updatedHabits,
    lastUpdated: new Date().toISOString(),
  };
}

/**
 * Toggles Sanctuary Mode (freezes streak for deliberate rest / recovery).
 */
export function toggleSanctuaryMode(state: GamificationState): GamificationState {
  return {
    ...state,
    player: {
      ...state.player,
      sanctuaryActive: !state.player.sanctuaryActive,
    },
    lastUpdated: new Date().toISOString(),
  };
}

/**
 * Consumes Void Mana for a deep focus session.
 */
export function consumeVoidMana(state: GamificationState, amount: number): GamificationState {
  const newMana = Math.max(0, state.player.voidMana - amount);
  return {
    ...state,
    player: {
      ...state.player,
      voidMana: newMana,
    },
    lastUpdated: new Date().toISOString(),
  };
}

/**
 * Recharges Void Mana during deliberate rest.
 */
export function rechargeVoidMana(state: GamificationState, amount: number): GamificationState {
  const newMana = Math.min(state.player.maxVoidMana, state.player.voidMana + amount);
  return {
    ...state,
    player: {
      ...state.player,
      voidMana: newMana,
    },
    lastUpdated: new Date().toISOString(),
  };
}
