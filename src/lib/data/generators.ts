import { GameDatabase, DbPlayer, DbClub, DbCompetition } from './schema';
import { PlayerAttributes, HiddenAttributes, PlayerRole } from '../simulation/types';

// Mock Data Generators
const FIRST_NAMES = [
  'James', 'John', 'Robert', 'Michael', 'William', 'David', 'Richard', 'Joseph', 'Thomas', 'Charles',
  'Christopher', 'Daniel', 'Matthew', 'Anthony', 'Donald', 'Mark', 'Paul', 'Steven', 'Andrew', 'Kenneth',
  'George', 'Joshua', 'Kevin', 'Brian', 'Edward', 'Ronald', 'Timothy', 'Jason', 'Jeffrey', 'Ryan'
];

const LAST_NAMES = [
  'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez',
  'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson', 'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin',
  'Lee', 'Perez', 'Thompson', 'White', 'Harris', 'Sanchez', 'Clark', 'Ramirez', 'Lewis', 'Robinson'
];

const CLUB_NAMES = [
  'Arsenal', 'Aston Villa', 'Bournemouth', 'Brentford', 'Brighton', 'Burnley', 'Chelsea', 'Crystal Palace',
  'Everton', 'Fulham', 'Liverpool', 'Luton', 'Man City', 'Man Utd', 'Newcastle', 'Nottm Forest',
  'Sheffield Utd', 'Tottenham', 'West Ham', 'Wolves'
];

const rand = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;
const randItem = <T>(arr: T[]) => arr[rand(0, arr.length - 1)];

const generateAttributes = (role: PlayerRole): PlayerAttributes => {
  const attrs: PlayerAttributes = {
    pace: rand(8, 16),
    acceleration: rand(8, 16),
    agility: rand(8, 16),
    strength: rand(8, 16),
    stamina: rand(10, 18),
    balance: rand(8, 16),
    passing: rand(8, 16),
    technique: rand(8, 16),
    finishing: rand(5, 12),
    firstTouch: rand(8, 16),
    tackling: rand(5, 12),
    heading: rand(5, 12),
    crossing: rand(5, 12),
    dribbling: rand(8, 16),
    longShots: rand(5, 12),
    decisions: rand(8, 16),
    composure: rand(8, 16),
    vision: rand(8, 16),
    anticipation: rand(8, 16),
    positioning: rand(8, 16),
    offTheBall: rand(8, 16),
    teamwork: rand(8, 16),
    workRate: rand(8, 16),
    aggression: rand(8, 16),
    concentration: rand(8, 16),
    bravery: rand(8, 16),
    determination: rand(8, 16),
  };

  // Role Modifiers
  switch (role) {
    case 'GK':
      attrs.passing = rand(5, 12);
      attrs.finishing = rand(1, 5);
      break;
    case 'DC':
      attrs.heading = rand(12, 18);
      attrs.tackling = rand(12, 18);
      attrs.strength = rand(12, 18);
      attrs.positioning = rand(12, 18);
      break;
    case 'MC':
    case 'DMC':
      attrs.passing = rand(12, 18);
      attrs.vision = rand(12, 18);
      attrs.teamwork = rand(12, 18);
      attrs.stamina = rand(14, 20);
      break;
    case 'ST':
      attrs.finishing = rand(14, 20);
      attrs.offTheBall = rand(14, 20);
      attrs.composure = rand(12, 18);
      attrs.acceleration = rand(12, 18);
      break;
    case 'AMR':
    case 'AML':
    case 'MR':
    case 'ML':
      attrs.pace = rand(14, 20);
      attrs.dribbling = rand(14, 20);
      attrs.crossing = rand(12, 18);
      attrs.agility = rand(12, 18);
      break;
  }
  return attrs;
};

const generateHiddenAttributes = (): HiddenAttributes => ({
  consistency: rand(5, 20),
  bigMatch: rand(5, 20),
  injuryProneness: rand(1, 15),
  dirtiness: rand(1, 20),
  versatility: rand(5, 20),
  adaptability: rand(5, 20),
  pressure: rand(5, 20),
  professionalism: rand(5, 20),
  sportsmanship: rand(5, 20),
});

export const generateDatabase = (): GameDatabase => {
  const db: GameDatabase = {
    players: {},
    clubs: {},
    competitions: {},
  };

  // 1. Create Premier League
  const pl: DbCompetition = {
    id: 'comp_pl',
    name: 'Premier League',
    nationId: 'ENG',
    teams: [],
    table: [],
  };

  // 2. Generate Clubs
  CLUB_NAMES.forEach((clubName, i) => {
    const clubId = `club_${i}`;
    const club: DbClub = {
      id: clubId,
      name: clubName,
      shortName: clubName.substring(0, 3).toUpperCase(),
      nationId: 'ENG',
      reputation: rand(6000, 9500),
      primaryColor: '#ff0000', // Placeholder
      secondaryColor: '#ffffff',
      stadiumName: `${clubName} Stadium`,
      capacity: rand(20000, 75000),
      roster: [],
      balance: rand(10000000, 200000000),
      transferBudget: rand(5000000, 100000000),
      wageBudget: rand(500000, 5000000),
    };

    // 3. Generate Squad
    // 2 GK, 6 Def, 6 Mid, 4 Att
    const squadRoles: PlayerRole[] = [
      'GK', 'GK',
      'DL', 'DL', 'DC', 'DC', 'DC', 'DR', 'DR',
      'ML', 'MR', 'MC', 'MC', 'MC', 'DMC',
      'ST', 'ST', 'ST', 'AMC'
    ];

    squadRoles.forEach((role, j) => {
      const playerId = `player_${i}_${j}`;
      const player: DbPlayer = {
        id: playerId,
        firstName: randItem(FIRST_NAMES),
        lastName: randItem(LAST_NAMES),
        age: rand(17, 35),
        nationId: 'ENG',
        clubId: clubId,
        position: role,
        secondaryPositions: [],
        attributes: generateAttributes(role),
        hiddenAttributes: generateHiddenAttributes(),
        value: rand(100000, 50000000),
        wage: rand(1000, 200000),
        contractExpiry: 2026 + rand(1, 5),
        stats: { apps: 0, goals: 0, assists: 0, avgRating: 0 },
      };
      
      db.players[playerId] = player;
      club.roster.push(playerId);
    });

    db.clubs[clubId] = club;
    pl.teams.push(clubId);
    pl.table.push({
      teamId: clubId,
      played: 0, won: 0, drawn: 0, lost: 0, gf: 0, ga: 0, pts: 0
    });
  });

  db.competitions[pl.id] = pl;

  return db;
};
