export type Vector2 = { x: number; y: number };

export type TeamId = 'home' | 'away';

export type PlayerRole = 'GK' | 'CB' | 'LB' | 'RB' | 'CDM' | 'CM' | 'CAM' | 'LW' | 'RW' | 'ST';

export type PlayerState = 
  | 'idle' 
  | 'moving' 
  | 'sprinting'
  | 'dribbling' 
  | 'passing' 
  | 'shooting' 
  | 'tackling' 
  | 'intercepting'
  | 'marking'
  | 'celebrating' 
  | 'returning';

export interface PlayerStats {
  speed: number;      // Max speed
  acceleration: number;
  stamina: number;
  
  // Technical
  finishing: number;
  passing: number;
  dribbling: number;
  tackling: number;
  control: number;
  
  // Mental
  positioning: number; // Defensive positioning
  vision: number;      // Finding passes
  aggression: number;  // Pressing intensity
  composure: number;   // Under pressure
}

export interface Player {
  id: number;
  team: TeamId;
  role: PlayerRole;
  name: string;
  position: Vector2;
  velocity: Vector2;
  targetPosition: Vector2 | null;
  state: PlayerState;
  number: number;
  stats: PlayerStats;
  currentStamina: number;
  cooldown: number; // Time until can act again
  matchRating: number;
  events: {
    goals: number;
    assists: number;
    tackles: number;
    passes: number;
    saves: number;
  };
}

export interface Ball {
  position: Vector2;
  velocity: Vector2;
  ownerId: number | null; // ID of player currently possessing ball
  height: number; // 0 is ground, > 2 is head height
  isLoose: boolean; // True if passed/shot and in air/rolling
  lastOwnerId: number | null;
}

export interface MatchLog {
  time: number;
  message: string;
  type: 'goal' | 'info' | 'chance' | 'foul';
}

export interface MatchEvent {
  time: number;
  type: 'goal' | 'card' | 'sub';
  team: TeamId;
  playerId: number;
}

export interface TeamTactics {
  formation: string; // "4-4-2", "4-3-3"
  mentality: 'defensive' | 'balanced' | 'attacking';
  width: 'narrow' | 'normal' | 'wide';
  pressing: 'low' | 'mid' | 'high';
  defensiveLine?: 'low' | 'mid' | 'high';
}

export interface TeamStats {
  possession: number; // Percentage or time
  shots: number;
  shotsOnTarget: number;
  passes: number;
  passesCompleted: number;
  tackles: number;
  fouls: number;
  corners: number;
}

export interface MatchState {
  players: Player[];
  ball: Ball;
  score: { home: number; away: number };
  time: number; // In seconds (simulated)
  isPlaying: boolean;
  phase: 'kickoff' | 'playing' | 'goal' | 'out' | 'halftime' | 'fulltime';
  pitchSize: { width: number; height: number };
  lastTouchTeam: TeamId | null;
  logs: MatchLog[];
  events: MatchEvent[];
  homeTactics: TeamTactics;
  awayTactics: TeamTactics;
  deadlockTimer: number;
  stats: {
    home: TeamStats;
    away: TeamStats;
  };
}

export const PITCH_WIDTH = 105;
export const PITCH_HEIGHT = 68;
export const GOAL_WIDTH = 7.32;
export const BALL_FRICTION = 0.993;
export const PLAYER_MAX_SPEED = 8.5; // m/s (approx 30km/h)
export const BALL_MAX_SPEED = 30; // m/s
