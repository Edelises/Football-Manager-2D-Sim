import { TeamId, Vector2 } from '../types';

// 1-20 Scale
export interface PlayerAttributes {
  // Physical
  pace: number;
  acceleration: number;
  agility: number;
  strength: number;
  stamina: number;
  balance: number;

  // Technical
  passing: number;
  technique: number;
  finishing: number;
  firstTouch: number;
  tackling: number;
  heading: number;
  crossing: number;
  dribbling: number;
  longShots: number;

  // Mental
  decisions: number;
  composure: number;
  vision: number;
  anticipation: number;
  positioning: number;
  offTheBall: number;
  teamwork: number;
  workRate: number;
  aggression: number;
  concentration: number;
  bravery: number;
  determination: number;
}

export interface HiddenAttributes {
  consistency: number;
  bigMatch: number;
  injuryProneness: number;
  dirtiness: number;
  versatility: number;
  adaptability: number;
  pressure: number;
  professionalism: number;
  sportsmanship: number;
}

export interface PlayerMentalState {
  morale: number; // 0-100
  fatigue: number; // 0-100 (100 is fresh)
  condition: number; // 0-100 (Match sharpness)
  confidence: number; // 0-100
  momentumInfluence: number; // -10 to 10
}

export type PlayerRole = 'GK' | 'DR' | 'DL' | 'DC' | 'DMC' | 'MC' | 'MR' | 'ML' | 'AMC' | 'AMR' | 'AML' | 'ST';

export interface TacticalRole {
  name: string;
  code: string;
  // Modifiers for decision engine
  riskBias: number; // 1-20
  creativeBias: number; // 1-20
  defensiveBias: number; // 1-20
  roamingBias: number; // 1-20
}

export type MatchPhase = 'kickoff' | 'play' | 'goal' | 'out' | 'set_piece';

export type PlayerActionType = 
  | 'idle' | 'move' 
  | 'pass_short' | 'pass_long' | 'pass_through' | 'shoot' | 'dribble' | 'cross' | 'hold'
  | 'press' | 'contain' | 'tackle' | 'intercept' | 'block' | 'chase';

export interface SimPlayer {
  id: number;
  number: number;
  name: string;
  team: TeamId;
  position: Vector2; // Current Pitch Position (0-100, 0-100)
  targetPosition: Vector2; // Where they are moving to
  basePosition: Vector2; // Formation anchor
  velocity: Vector2; // For rendering interpolation
  
  role: PlayerRole;
  tacticalRole: TacticalRole;
  
  attributes: PlayerAttributes;
  hiddenAttributes: HiddenAttributes;
  state: PlayerMentalState;
  
  currentAction: PlayerActionType; 
  actionTimer: number; // Ticks remaining for current action
  
  matchRating: number;
  stats: {
    goals: number;
    assists: number;
    passesAttempted: number;
    passesCompleted: number;
    tacklesAttempted: number;
    tacklesWon: number;
    interceptions: number;
    shots: number;
    shotsOnTarget: number;
    distanceCovered: number;
  };
}

export interface MatchLog {
  time: number;
  message: string;
  type: 'info' | 'goal' | 'chance' | 'foul';
}

export interface TeamMatchStats {
  possession: number;
  shots: number;
  shotsOnTarget: number;
  passes: number;
  passesCompleted: number;
  tackles: number;
  corners: number;
  fouls: number;
}

export interface MatchTimerSettings {
  fullMatchMinutes: number;
  halfTimeDuration: number; // Minutes
  extraTimeEnabled: boolean;
  extraTimeMinutesPerHalf: number;
  penaltiesEnabled: boolean;
  simulationSpeed: number;
}

export interface MatchContext {
  time: number; // Seconds (Absolute simulation time)
  tick: number; // 0.2s ticks
  
  timer: {
    currentMinute: number; // For display
    period: 1 | 2 | 3 | 4 | 5; // 1=1st Half, 2=2nd Half, 3=ET1, 4=ET2, 5=Pens
    isPaused: boolean;
    isFinished: boolean;
    isHalfTime: boolean;
    settings: MatchTimerSettings;
  };

  score: { home: number; away: number };
  possession: { home: number; away: number }; // Percentage
  possessionTime: { home: number; away: number }; // Seconds
  stats: { home: TeamMatchStats; away: TeamMatchStats };
  momentum: { home: number; away: number }; // -50 to 50
  weather: 'dry' | 'rain' | 'snow';
  pitchCondition: number; // 0-100
  phase: MatchPhase;
  phaseTimer: number; // Seconds remaining in current phase
  lastScorer?: 'home' | 'away';
}
