import { CrowRank, PlayerStats } from './types.js';

/**
 * Calculates the total XP required to advance from `level` to `level + 1`.
 * Formula: floor(120 * level^1.45)
 */
export function calculateRequiredXp(level: number): number {
  if (level < 1) return 120;
  return Math.floor(120 * Math.pow(level, 1.45));
}

/**
 * Determines Crow Rank title based on character level boundaries.
 */
export function calculateRank(level: number): CrowRank {
  if (level >= 50) return 'Grand Sovereign Architect';
  if (level >= 35) return 'Master of the Three Legs';
  if (level >= 20) return 'Obsidian Alchemist';
  if (level >= 10) return 'Raven Watcher';
  if (level >= 5) return 'Novice of the Roost';
  return 'Fledgling Crow';
}

/**
 * Deterministically applies XP gain, handling multi-level advances and rank transitions.
 */
export function addExperience(stats: PlayerStats, xpDelta: number): PlayerStats {
  if (xpDelta <= 0) return { ...stats };

  let newTotalXp = stats.totalXp + xpDelta;
  let newCurrentLevelXp = stats.currentLevelXp + xpDelta;
  let newLevel = stats.level;
  let neededForNext = calculateRequiredXp(newLevel);

  while (newCurrentLevelXp >= neededForNext) {
    newCurrentLevelXp -= neededForNext;
    newLevel += 1;
    neededForNext = calculateRequiredXp(newLevel);
  }

  return {
    ...stats,
    level: newLevel,
    totalXp: newTotalXp,
    currentLevelXp: newCurrentLevelXp,
    nextLevelXpRequired: neededForNext,
    rank: calculateRank(newLevel),
  };
}

/**
 * Creates a pristine initial character stats state for Level 1.
 */
export function createInitialPlayerStats(): PlayerStats {
  return {
    level: 1,
    totalXp: 0,
    currentLevelXp: 0,
    nextLevelXpRequired: calculateRequiredXp(1),
    rank: 'Fledgling Crow',
    voidMana: 100,
    maxVoidMana: 100,
    burnoutShield: 100,
    maxBurnoutShield: 100,
    streakDays: 1,
    sanctuaryActive: false,
    attributes: {
      intellect: 10,
      craft: 10,
      vitality: 10,
    },
  };
}
