import { PlayerAttributes, HiddenAttributes, SimPlayer, PlayerRole, TacticalRole } from './types';
import { Vector2, TeamId } from '../types';

const NAMES = [
  'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez',
  'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson', 'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin',
  'Lee', 'Perez', 'Thompson', 'White', 'Harris', 'Sanchez', 'Clark', 'Ramirez', 'Lewis', 'Robinson',
  'Walker', 'Young', 'Allen', 'King', 'Wright', 'Scott', 'Torres', 'Nguyen', 'Hill', 'Flores'
];

const getRandomName = () => NAMES[Math.floor(Math.random() * NAMES.length)];

const base = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;

const generateAttributes = (role: PlayerRole): PlayerAttributes => {
  // Base attributes for everyone
  const attrs: PlayerAttributes = {
    pace: base(8, 16),
    acceleration: base(8, 16),
    agility: base(8, 16),
    strength: base(8, 16),
    stamina: base(10, 18),
    balance: base(8, 16),
    passing: base(8, 16),
    technique: base(8, 16),
    finishing: base(5, 12),
    firstTouch: base(8, 16),
    tackling: base(5, 12),
    heading: base(5, 12),
    crossing: base(5, 12),
    dribbling: base(8, 16),
    longShots: base(5, 12),
    decisions: base(8, 16),
    composure: base(8, 16),
    vision: base(8, 16),
    anticipation: base(8, 16),
    positioning: base(8, 16),
    offTheBall: base(8, 16),
    teamwork: base(8, 16),
    workRate: base(8, 16),
    aggression: base(8, 16),
    concentration: base(8, 16),
    bravery: base(8, 16),
    determination: base(8, 16),
  };

  // Role Modifiers
  switch (role) {
    case 'GK':
      attrs.passing = base(5, 12);
      attrs.finishing = base(1, 5);
      // GK specific stats would be here if we had them, using generic for now
      break;
    case 'DC':
      attrs.heading = base(12, 18);
      attrs.tackling = base(12, 18);
      attrs.strength = base(12, 18);
      attrs.positioning = base(12, 18);
      break;
    case 'MC':
    case 'DMC':
      attrs.passing = base(12, 18);
      attrs.vision = base(12, 18);
      attrs.teamwork = base(12, 18);
      attrs.stamina = base(14, 20);
      break;
    case 'ST':
      attrs.finishing = base(14, 20);
      attrs.offTheBall = base(14, 20);
      attrs.composure = base(12, 18);
      attrs.acceleration = base(12, 18);
      break;
    case 'AMR':
    case 'AML':
    case 'MR':
    case 'ML':
      attrs.pace = base(14, 20);
      attrs.dribbling = base(14, 20);
      attrs.crossing = base(12, 18);
      attrs.agility = base(12, 18);
      break;
  }

  return attrs;
};

const generateHiddenAttributes = (): HiddenAttributes => ({
  consistency: base(5, 20),
  bigMatch: base(5, 20),
  injuryProneness: base(1, 15),
  dirtiness: base(1, 20),
  versatility: base(5, 20),
  adaptability: base(5, 20),
  pressure: base(5, 20),
  professionalism: base(5, 20),
  sportsmanship: base(5, 20),
});

const getTacticalRole = (role: PlayerRole): TacticalRole => {
  // Simplified mapping for now
  return {
    name: role,
    code: role,
    riskBias: 10,
    creativeBias: 10,
    defensiveBias: 10,
    roamingBias: 10,
  };
};

export const createSimPlayer = (id: number, number: number, team: TeamId, role: PlayerRole, pos: Vector2): SimPlayer => {
  return {
    id,
    number,
    name: getRandomName(),
    team,
    position: { ...pos },
    targetPosition: { ...pos },
    basePosition: { ...pos },
    velocity: { x: 0, y: 0 },
    role,
    tacticalRole: getTacticalRole(role),
    attributes: generateAttributes(role),
    hiddenAttributes: generateHiddenAttributes(),
    state: {
      morale: 80,
      fatigue: 100,
      condition: 100,
      confidence: 80,
      momentumInfluence: 0,
    },
    currentAction: 'idle',
    actionTimer: 0,
    matchRating: 6.0,
    stats: {
      goals: 0,
      assists: 0,
      passesAttempted: 0,
      passesCompleted: 0,
      tacklesAttempted: 0,
      tacklesWon: 0,
      interceptions: 0,
      shots: 0,
      shotsOnTarget: 0,
      distanceCovered: 0,
    },
  };
};
