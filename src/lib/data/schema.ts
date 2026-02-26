import { PlayerAttributes, HiddenAttributes, PlayerRole } from '../simulation/types';

export type NationId = string;
export type ClubId = string;
export type CompetitionId = string;

export interface DbPlayer {
  id: string;
  firstName: string;
  lastName: string;
  age: number;
  nationId: NationId;
  clubId: ClubId;
  
  // Positions
  position: PlayerRole;
  secondaryPositions: PlayerRole[];
  
  // Attributes (1-20)
  attributes: PlayerAttributes;
  hiddenAttributes: HiddenAttributes;
  
  // Contract
  value: number;
  wage: number;
  contractExpiry: number; // Year
  
  // Stats (Season)
  stats: {
    apps: number;
    goals: number;
    assists: number;
    avgRating: number;
  };
}

export interface DbClub {
  id: ClubId;
  name: string;
  shortName: string;
  nationId: NationId;
  reputation: number; // 1-10000
  
  // Colors
  primaryColor: string;
  secondaryColor: string;
  
  // Stadium
  stadiumName: string;
  capacity: number;
  
  // Squad
  roster: string[]; // Player IDs
  
  // Finances
  balance: number;
  transferBudget: number;
  wageBudget: number;
}

export interface DbCompetition {
  id: CompetitionId;
  name: string;
  nationId: NationId;
  teams: ClubId[];
  
  // Table
  table: {
    teamId: ClubId;
    played: number;
    won: number;
    drawn: number;
    lost: number;
    gf: number;
    ga: number;
    pts: number;
  }[];
}

export interface GameDatabase {
  players: Record<string, DbPlayer>;
  clubs: Record<string, DbClub>;
  competitions: Record<string, DbCompetition>;
}
