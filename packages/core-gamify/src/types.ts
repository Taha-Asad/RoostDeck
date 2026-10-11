export type RealmType = 'uni' | 'work' | 'personal';

export type CrowRank =
  | 'Fledgling Crow'
  | 'Novice of the Roost'
  | 'Raven Watcher'
  | 'Obsidian Alchemist'
  | 'Master of the Three Legs'
  | 'Grand Sovereign Architect';

export interface PlayerStats {
  level: number;
  totalXp: number;
  currentLevelXp: number;
  nextLevelXpRequired: number;
  rank: CrowRank;
  voidMana: number;
  maxVoidMana: number;
  burnoutShield: number;
  maxBurnoutShield: number;
  streakDays: number;
  sanctuaryActive: boolean;
  attributes: {
    intellect: number; // Raised by Uni / Study
    craft: number;     // Raised by Code / Work
    vitality: number;  // Raised by Habits / Gym
  };
}

export interface Bounty {
  id: string;
  title: string;
  realm: RealmType;
  xpReward: number;
  completed: boolean;
  completedAt?: string;
}

export interface Habit {
  id: string;
  title: string;
  category: 'fitness' | 'mindset' | 'hydration' | 'learning';
  completedToday: boolean;
  streak: number;
}

export interface GamificationState {
  player: PlayerStats;
  bounties: Bounty[];
  habits: Habit[];
  lastUpdated: string;
}
