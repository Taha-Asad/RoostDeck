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

export type FocusDuration = 25 | 50 | 90;
export type FocusSessionStatus = 'idle' | 'active' | 'paused' | 'completed' | 'abandoned';

export interface FocusSessionConfig {
  durationMinutes: FocusDuration;
  realm: RealmType;
  label: string;
  ambientSoundscape?: 'void_drone' | 'celestial_rain' | 'deep_binaural' | 'none';
}

export interface FocusSessionState {
  id: string;
  config: FocusSessionConfig;
  status: FocusSessionStatus;
  totalDurationSeconds: number;
  remainingSeconds: number;
  elapsedSeconds: number;
  voidManaCost: number;
  startedAt: string;
  pausedAt?: string;
  completedAt?: string;
  abandonedAt?: string;
}

export interface FocusCompletionResult {
  session: FocusSessionState;
  xpEarned: number;
  attributeBoost: {
    attribute: 'intellect' | 'craft' | 'vitality';
    amount: number;
  };
  manaRecharged: number;
  nextState: GamificationState;
}

